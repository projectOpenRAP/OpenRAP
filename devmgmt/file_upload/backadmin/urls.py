from django.conf.urls import url
from . import views

app_name = "backadmin"
urlpatterns = [
	url(r'^$', views.index, name='index'),
	url(r'^verify/', views.verify, name='verify'),
	url(r'^return_permissions/', views.return_permissions, name="return_permissions"),
	url(r'^user_logout/', views.user_logout, name="user_logout"),
	url(r'^change_ap/', views.change_ap, name="change_ap"),
	url(r'^change_pass/', views.user_changepass, name='user_changepass'),
	url(r'^upgrade/', views.upgrade, name='upgrade'),
	url(r'^upgrade_ext/', views.upgrade_ext, name='upgrade_ext')
]