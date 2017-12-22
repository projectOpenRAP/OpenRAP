from django.conf.urls import include, url
from django.http import HttpResponseRedirect
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    url(r'^$', lambda x: HttpResponseRedirect('backadmin/')),
    url(r'^upload/', include('fileupload.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^ssidmod/', include('ssidmod.urls')),
    url(r'^changecaptive/', include('changecaptive.urls')),
    url(r'^changepermissions/', include('changepermissions.urls')),
    url(r'^changevariables/', include('changevars.urls')),
    url(r'^backadmin/', include('backadmin.urls')),
    url(r'^createuser/', include('createuser.urls')),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
