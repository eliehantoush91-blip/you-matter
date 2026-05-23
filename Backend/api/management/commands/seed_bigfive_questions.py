from django.core.management.base import BaseCommand

from api.models import BigFiveQuestion


BIG_FIVE_ITEMS = [
    ('EXT1', 'EXT', 1, False, 'I am the life of the party.'),
    ('AGR1', 'AGR', 2, True, 'I feel little concern for others.'),
    ('CSN1', 'CSN', 3, False, 'I am always prepared.'),
    ('EST1', 'EST', 4, True, 'I get stressed out easily.'),
    ('OPN1', 'OPN', 5, False, 'I have a rich vocabulary.'),
    ('EXT2', 'EXT', 6, True, "I don't talk a lot."),
    ('AGR2', 'AGR', 7, False, 'I am interested in people.'),
    ('CSN2', 'CSN', 8, True, 'I leave my belongings around.'),
    ('EST2', 'EST', 9, False, 'I am relaxed most of the time.'),
    ('OPN2', 'OPN', 10, True, 'I have difficulty understanding abstract ideas.'),
    ('EXT3', 'EXT', 11, False, 'I feel comfortable around people.'),
    ('AGR3', 'AGR', 12, True, 'I insult people.'),
    ('CSN3', 'CSN', 13, False, 'I pay attention to details.'),
    ('EST3', 'EST', 14, True, 'I worry about things.'),
    ('OPN3', 'OPN', 15, False, 'I have a vivid imagination.'),
    ('EXT4', 'EXT', 16, True, 'I keep in the background.'),
    ('AGR4', 'AGR', 17, False, "I sympathize with others' feelings."),
    ('CSN4', 'CSN', 18, True, 'I make a mess of things.'),
    ('EST4', 'EST', 19, False, 'I seldom feel blue.'),
    ('OPN4', 'OPN', 20, True, 'I am not interested in abstract ideas.'),
    ('EXT5', 'EXT', 21, False, 'I start conversations.'),
    ('AGR5', 'AGR', 22, True, "I am not interested in other people's problems."),
    ('CSN5', 'CSN', 23, False, 'I get chores done right away.'),
    ('EST5', 'EST', 24, True, 'I am easily disturbed.'),
    ('OPN5', 'OPN', 25, False, 'I have excellent ideas.'),
    ('EXT6', 'EXT', 26, True, 'I have little to say.'),
    ('AGR6', 'AGR', 27, False, 'I have a soft heart.'),
    ('CSN6', 'CSN', 28, True, 'I often forget to put things back in their proper place.'),
    ('EST6', 'EST', 29, True, 'I get upset easily.'),
    ('OPN6', 'OPN', 30, True, 'I do not have a good imagination.'),
    ('EXT7', 'EXT', 31, False, 'I talk to a lot of different people at parties.'),
    ('AGR7', 'AGR', 32, True, 'I am not really interested in others.'),
    ('CSN7', 'CSN', 33, False, 'I like order.'),
    ('EST7', 'EST', 34, True, 'I change my mood a lot.'),
    ('OPN7', 'OPN', 35, False, 'I am quick to understand things.'),
    ('EXT8', 'EXT', 36, True, "I don't like to draw attention to myself."),
    ('AGR8', 'AGR', 37, False, 'I take time out for others.'),
    ('CSN8', 'CSN', 38, True, 'I shirk my duties.'),
    ('EST8', 'EST', 39, True, 'I have frequent mood swings.'),
    ('OPN8', 'OPN', 40, False, 'I use difficult words.'),
    ('EXT9', 'EXT', 41, False, "I don't mind being the center of attention."),
    ('AGR9', 'AGR', 42, False, "I feel others' emotions."),
    ('CSN9', 'CSN', 43, False, 'I follow a schedule.'),
    ('EST9', 'EST', 44, True, 'I get irritated easily.'),
    ('OPN9', 'OPN', 45, False, 'I spend time reflecting on things.'),
    ('EXT10', 'EXT', 46, True, 'I am quiet around strangers.'),
    ('AGR10', 'AGR', 47, False, 'I make people feel at ease.'),
    ('CSN10', 'CSN', 48, False, 'I am exacting in my work.'),
    ('EST10', 'EST', 49, True, 'I often feel blue.'),
    ('OPN10', 'OPN', 50, False, 'I am full of ideas.'),
]

BIG_FIVE_AR_TEXT = {
    'EXT1': 'أنا محور الاهتمام في الحفلات.',
    'AGR1': 'لا أشعر باهتمام كبير تجاه الآخرين.',
    'CSN1': 'أنا مستعد دائماً.',
    'EST1': 'أتوتر بسهولة.',
    'OPN1': 'لدي حصيلة لغوية غنية.',
    'EXT2': 'لا أتحدث كثيراً.',
    'AGR2': 'أنا مهتم بالناس.',
    'CSN2': 'أترك أغراضي مبعثرة.',
    'EST2': 'أكون مسترخياً معظم الوقت.',
    'OPN2': 'أجد صعوبة في فهم الأفكار المجردة.',
    'EXT3': 'أشعر بالراحة بين الناس.',
    'AGR3': 'أهين الآخرين.',
    'CSN3': 'أنتبه للتفاصيل.',
    'EST3': 'أقلق بشأن الأمور.',
    'OPN3': 'لدي خيال واسع.',
    'EXT4': 'أبقى في الخلفية.',
    'AGR4': 'أتعاطف مع مشاعر الآخرين.',
    'CSN4': 'أجعل الأشياء فوضوية.',
    'EST4': 'نادراً ما أشعر بالحزن.',
    'OPN4': 'لست مهتماً بالأفكار المجردة.',
    'EXT5': 'أبدأ المحادثات.',
    'AGR5': 'لست مهتماً بمشكلات الآخرين.',
    'CSN5': 'أنجز الأعمال المنزلية فوراً.',
    'EST5': 'أتأثر بسهولة.',
    'OPN5': 'لدي أفكار ممتازة.',
    'EXT6': 'ليس لدي الكثير لأقوله.',
    'AGR6': 'لدي قلب عطوف.',
    'CSN6': 'غالباً أنسى إعادة الأشياء إلى مكانها الصحيح.',
    'EST6': 'أنزعج بسهولة.',
    'OPN6': 'ليس لدي خيال جيد.',
    'EXT7': 'أتحدث مع أشخاص كثيرين ومختلفين في الحفلات.',
    'AGR7': 'لست مهتماً حقاً بالآخرين.',
    'CSN7': 'أحب النظام.',
    'EST7': 'يتغير مزاجي كثيراً.',
    'OPN7': 'أفهم الأشياء بسرعة.',
    'EXT8': 'لا أحب لفت الانتباه إلي.',
    'AGR8': 'أخصص وقتاً للآخرين.',
    'CSN8': 'أتهرب من واجباتي.',
    'EST8': 'أعاني من تقلبات مزاجية متكررة.',
    'OPN8': 'أستخدم كلمات صعبة.',
    'EXT9': 'لا أمانع أن أكون مركز الاهتمام.',
    'AGR9': 'أشعر بمشاعر الآخرين.',
    'CSN9': 'أتبع جدولاً منظماً.',
    'EST9': 'أنزعج بسرعة.',
    'OPN9': 'أقضي وقتاً في التفكير والتأمل.',
    'EXT10': 'أكون هادئاً حول الغرباء.',
    'AGR10': 'أجعل الناس يشعرون بالراحة.',
    'CSN10': 'أنا دقيق في عملي.',
    'EST10': 'غالباً ما أشعر بالحزن.',
    'OPN10': 'أنا مليء بالأفكار.',
}


class Command(BaseCommand):
    help = 'Seed the 50 IPIP Big Five questions used by the clustering model.'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for code, trait, order, reverse_scored, text in BIG_FIVE_ITEMS:
            question, created = BigFiveQuestion.objects.update_or_create(
                code=code,
                defaults={
                    'trait': trait,
                    'order': order,
                    'reverse_scored': reverse_scored,
                    'is_active': True,
                },
            )
            question.set_current_language('en')
            question.text = text
            question.save()
            question.set_current_language('ar')
            question.text = BIG_FIVE_AR_TEXT[code]
            question.save()

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Seeded Big Five questions: {created_count} created, {updated_count} updated.'
            )
        )
