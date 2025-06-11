from django.urls import path
from . import views

urlpatterns = [
    path('initialize_session/', views.initialize_session, name='initialize_session'),
    path('start_conversation/', views.start_conversation, name='start_conversation'),
    path('chat/', views.chat_with_ai, name='chat_with_ai'),
    path('voice_chat/', views.voice_chat, name='voice_chat'),
    path('end_conversation/', views.end_conversation, name='end_conversation'),
]

