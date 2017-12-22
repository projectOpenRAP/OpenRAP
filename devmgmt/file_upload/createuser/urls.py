from django.conf.urls import url
from . import views

app_name='createuser'

urlpatterns = [
	url(r'^new/$', views.index, name="index"),
	url(r'^delete_user/$', views.delete_user, name="delete_user"),
	url(r'^delete/', views.delete, name="delete"),
]