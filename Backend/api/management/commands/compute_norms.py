from django.core.management.base import BaseCommand
from api.models import Test, Result
import os, json, math
from statistics import mean, pstdev
from django.conf import settings


def percentile(sorted_list, p):
    if not sorted_list:
        return None
    k = (len(sorted_list)-1) * (p/100)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_list[int(k)]
    d0 = sorted_list[int(f)] * (c-k)
    d1 = sorted_list[int(c)] * (k-f)
    return d0 + d1


class Command(BaseCommand):
    help = 'Compute norms (count, mean, percentiles) for each Test and write to api/data/norms.json'

    def handle(self, *args, **options):
        out = {}
        for test in Test.objects.all():
            scores = list(Result.objects.filter(test=test).values_list('total_score', flat=True))
            scores = [s for s in scores if isinstance(s, (int, float))]
            scores_sorted = sorted(scores)
            if not scores_sorted:
                continue
            data = {
                'count': len(scores_sorted),
                'mean': mean(scores_sorted) if scores_sorted else None,
                'std': pstdev(scores_sorted) if len(scores_sorted) > 1 else 0.0,
                'min': scores_sorted[0],
                'max': scores_sorted[-1],
                'percentiles': {
                    '25': percentile(scores_sorted, 25),
                    '50': percentile(scores_sorted, 50),
                    '75': percentile(scores_sorted, 75),
                },
                'max_observed': scores_sorted[-1]
            }
            out[str(test.id)] = data

        data_dir = os.path.join(settings.BASE_DIR, 'api', 'data')
        os.makedirs(data_dir, exist_ok=True)
        path = os.path.join(data_dir, 'norms.json')
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        self.stdout.write(self.style.SUCCESS(f'Wrote norms for {len(out)} tests to {path}'))
