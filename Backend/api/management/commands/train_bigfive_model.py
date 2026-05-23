import csv
import json
import os
from collections import defaultdict

import joblib
import numpy as np
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from sklearn.cluster import MiniBatchKMeans
from sklearn.preprocessing import MinMaxScaler

from api.models import BigFiveQuestion
from api.services.bigfive_scoring import LIKERT_MAX, LIKERT_MIN, TRAIT_FIELD_NAMES, TRAIT_OUTPUT_ORDER


DEFAULT_DATASET_PATH = os.path.join(settings.BASE_DIR, 'api', 'ml', 'data', 'bigfive', 'data-final.csv')
DEFAULT_ARTIFACT_DIR = os.path.join(settings.BASE_DIR, 'api', 'ml', 'artifacts', 'bigfive')


def _coerce_dataset_score(value):
    if value in (None, ''):
        return None

    try:
        score = int(float(value))
    except (TypeError, ValueError):
        return None

    if score < LIKERT_MIN or score > LIKERT_MAX:
        return None
    return score


def _row_to_trait_values(row, questions):
    raw_totals = defaultdict(int)
    item_counts = defaultdict(int)

    for question in questions:
        raw_score = _coerce_dataset_score(row.get(question.code))
        if raw_score is None:
            return None

        scored_value = LIKERT_MAX + LIKERT_MIN - raw_score if question.reverse_scored else raw_score
        trait_field = TRAIT_FIELD_NAMES[question.trait]
        raw_totals[trait_field] += scored_value
        item_counts[trait_field] += 1

    traits = {}
    for trait_field, raw_total in raw_totals.items():
        min_total = item_counts[trait_field] * LIKERT_MIN
        max_total = item_counts[trait_field] * LIKERT_MAX
        traits[trait_field] = ((raw_total - min_total) / (max_total - min_total)) * 100

    return [traits[trait] for trait in TRAIT_OUTPUT_ORDER]


def _iter_trait_batches(dataset_path, questions, batch_size, max_rows=None):
    required_columns = {question.code for question in questions}
    batch = []
    valid_rows = 0

    with open(dataset_path, 'r', encoding='utf-8', newline='') as csv_file:
        reader = csv.DictReader(csv_file, delimiter='\t')
        if not reader.fieldnames or len(reader.fieldnames) == 1:
            csv_file.seek(0)
            reader = csv.DictReader(csv_file)

        missing_columns = sorted(required_columns - set(reader.fieldnames or []))
        if missing_columns:
            raise CommandError(f'Dataset is missing required columns: {", ".join(missing_columns)}')

        for row in reader:
            values = _row_to_trait_values(row, questions)
            if values is None:
                continue

            batch.append(values)
            valid_rows += 1

            if len(batch) >= batch_size:
                yield np.array(batch, dtype=float)
                batch = []

            if max_rows and valid_rows >= max_rows:
                break

    if batch:
        yield np.array(batch, dtype=float)


def _cluster_label(means):
    high_traits = [trait for trait, value in means.items() if value >= 70]
    low_traits = [trait for trait, value in means.items() if value <= 30]

    if high_traits:
        return 'High ' + ', '.join(high_traits)
    if low_traits:
        return 'Low ' + ', '.join(low_traits)
    return 'Balanced profile'


class Command(BaseCommand):
    help = 'Train the Big Five clustering model from the IPIP-FFM dataset.'

    def add_arguments(self, parser):
        parser.add_argument('--dataset', default=DEFAULT_DATASET_PATH, help='Path to data-final.csv')
        parser.add_argument('--artifacts-dir', default=DEFAULT_ARTIFACT_DIR, help='Directory for generated model files')
        parser.add_argument('--clusters', type=int, default=5, help='Number of KMeans clusters')
        parser.add_argument('--batch-size', type=int, default=5000, help='Rows per training batch')
        parser.add_argument('--max-rows', type=int, default=None, help='Optional row limit for quick local training')
        parser.add_argument('--random-state', type=int, default=42, help='Random seed')

    def handle(self, *args, **options):
        dataset_path = options['dataset']
        artifacts_dir = options['artifacts_dir']
        n_clusters = options['clusters']
        batch_size = options['batch_size']
        max_rows = options['max_rows']
        random_state = options['random_state']

        if not os.path.exists(dataset_path):
            raise CommandError(
                'Dataset not found. Put data-final.csv at '
                f'{DEFAULT_DATASET_PATH} or pass --dataset PATH.'
            )

        questions = list(BigFiveQuestion.objects.filter(is_active=True).order_by('order'))
        if len(questions) != 50:
            raise CommandError(
                f'Expected 50 active Big Five questions, found {len(questions)}. '
                'Run python manage.py seed_bigfive_questions first.'
            )

        self.stdout.write('Fitting scaler...')
        scaler = MinMaxScaler()
        valid_rows = 0
        for batch in _iter_trait_batches(dataset_path, questions, batch_size, max_rows):
            scaler.partial_fit(batch)
            valid_rows += len(batch)

        if valid_rows < n_clusters:
            raise CommandError(f'Not enough valid rows to train {n_clusters} clusters. Found {valid_rows}.')

        self.stdout.write(f'Training MiniBatchKMeans on {valid_rows} valid rows...')
        kmeans = MiniBatchKMeans(
            n_clusters=n_clusters,
            batch_size=batch_size,
            random_state=random_state,
            n_init='auto',
        )
        for batch in _iter_trait_batches(dataset_path, questions, batch_size, max_rows):
            kmeans.partial_fit(scaler.transform(batch))

        self.stdout.write('Summarizing clusters...')
        cluster_counts = defaultdict(int)
        cluster_sums = defaultdict(lambda: np.zeros(len(TRAIT_OUTPUT_ORDER), dtype=float))
        for batch in _iter_trait_batches(dataset_path, questions, batch_size, max_rows):
            labels = kmeans.predict(scaler.transform(batch))
            for label, values in zip(labels, batch):
                cluster_id = int(label)
                cluster_counts[cluster_id] += 1
                cluster_sums[cluster_id] += values

        clusters = []
        for cluster_id in sorted(cluster_counts):
            means_array = cluster_sums[cluster_id] / cluster_counts[cluster_id]
            means = {
                trait: round(float(value), 2)
                for trait, value in zip(TRAIT_OUTPUT_ORDER, means_array)
            }
            clusters.append({
                'id': cluster_id,
                'label': _cluster_label(means),
                'description': 'Cluster generated from IPIP-FFM Big Five response patterns.',
                'count': cluster_counts[cluster_id],
                'trait_means': means,
            })

        os.makedirs(artifacts_dir, exist_ok=True)
        scaler_path = os.path.join(artifacts_dir, 'scaler.joblib')
        kmeans_path = os.path.join(artifacts_dir, 'kmeans.joblib')
        clusters_path = os.path.join(artifacts_dir, 'clusters.json')

        joblib.dump(scaler, scaler_path)
        joblib.dump(kmeans, kmeans_path)
        with open(clusters_path, 'w', encoding='utf-8') as clusters_file:
            json.dump({
                'trait_order': TRAIT_OUTPUT_ORDER,
                'n_clusters': n_clusters,
                'valid_rows': valid_rows,
                'clusters': clusters,
            }, clusters_file, indent=2)

        self.stdout.write(self.style.SUCCESS('Big Five model trained successfully.'))
        self.stdout.write(f'Scaler: {scaler_path}')
        self.stdout.write(f'KMeans: {kmeans_path}')
        self.stdout.write(f'Clusters: {clusters_path}')
