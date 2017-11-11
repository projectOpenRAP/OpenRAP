
from django.conf.urls import url
from fileupload.views import (
        #BasicPlusVersionCreateView,
        EkFileCreateView, EkFileDeleteView, EkFileListView,
        )
from . import views

app_name='fileupload'
urlpatterns = [
    url(r'^new/$', EkFileCreateView.as_view(), name='upload-new'),
    url(r'^delete/(?P<pk>\d+)$', EkFileDeleteView.as_view(), name='upload-delete'),
    url(r'^view/$', EkFileListView.as_view(), name='upload-view'),
    url(r'^$',views.index,name='index'),
    url(r'^transfer/$', views.transferx, name="transfer"),
    url(r'^verify_USB/$', views.verify_USB, name="verifyusb"),
    url(r'^user_logout/$', views.user_logout, name='userlogout'),
    url(r'^download_to_USB/$', views.download_to_USBx, name='downloadtousb'),
    url(r'^return_exts/$', views.serve_extensions, name="serve_exts"),
    url(r'^verify_USB2/$', views.verify_USB2, name='get_usb'),
]
