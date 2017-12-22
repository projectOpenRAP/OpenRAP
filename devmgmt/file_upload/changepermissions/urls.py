from django.conf.urls import url
from . import views

app_name = "changepermissions"
urlpatterns = [
	url(r'^$', views.display, name="display"),
	url(r'^update_data/', views.update_data, name="update_data"),
	]