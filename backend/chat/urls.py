from django.urls import path
from .views import chat_with_ai, end_conversation

urlpatterns = [
    path('chat/', chat_with_ai),
    path('end_conversation/', end_conversation),
    path('voice_chat/', voice_chat),
]

