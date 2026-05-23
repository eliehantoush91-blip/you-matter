from django.contrib import admin
from parler.admin import TranslatableAdmin, TranslatableModelForm
from .models import *
# Register your models here.

# Non-translatable models
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'first_name', 'last_name']
    list_filter = ['role']
    search_fields = ['username', 'email', 'first_name', 'last_name']


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'specialization', 'clinic_location', 'experiance_years']
    search_fields = ['user__username', 'specialization', 'clinic_location']


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'gender', 'doctor']
    list_filter = ['gender']
    search_fields = ['user__username']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'date', 'status']
    list_filter = ['status', 'date']
    search_fields = ['patient__user__username', 'doctor__user__username']


@admin.register(ProgressRecord)
class ProgressRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'test', 'date', 'score']
    list_filter = ['date']
    search_fields = ['patient__user__username']


# Translatable models
@admin.register(Test)
class TestAdmin(TranslatableAdmin):
    list_display = ['name', 'test_type', 'estimated_time']
    list_filter = ['test_type']


@admin.register(Choice)
class ChoiceAdmin(TranslatableAdmin):
    list_display = ['text', 'score']


@admin.register(Question)
class QuestionAdmin(TranslatableAdmin):
    list_display = [ 'test','text','order']
    list_filter = ['test']


@admin.register(Result)
class ResultAdmin(TranslatableAdmin):
    list_display = ['patient', 'test', 'total_score', 'created_at']
    list_filter = ['created_at']


@admin.register(BigFiveQuestion)
class BigFiveQuestionAdmin(TranslatableAdmin):
    list_display = ['code', 'trait', 'order', 'reverse_scored', 'is_active']
    list_filter = ['trait', 'reverse_scored', 'is_active']
    search_fields = ['code', 'translations__text']


@admin.register(BigFiveResult)
class BigFiveResultAdmin(admin.ModelAdmin):
    list_display = ['patient', 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability', 'cluster_id', 'created_at']
    list_filter = ['cluster_id', 'created_at']
    search_fields = ['patient__user__username', 'patient__user__email']
    readonly_fields = ['created_at']


@admin.register(GameData)
class GameDataAdmin(TranslatableAdmin):
    list_display = ['test', 'level_number', 'points', 'time_limit']
    list_filter = ['test']


@admin.register(Articles)
class ArticlesAdmin(TranslatableAdmin):
    list_display = ['author', 'created_at', 'image']
    list_filter = ['created_at']
    search_fields = ['author', 'translations__title']
    readonly_fields = ['created_at']


@admin.register(Doctor_Dashboard)
class DoctorDashboardAdmin(admin.ModelAdmin):
    list_display = ['doctor']
    filter_horizontal = ['patients', 'appointments', 'results']


