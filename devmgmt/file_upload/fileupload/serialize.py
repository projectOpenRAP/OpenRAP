import mimetypes
import re
from django.core.urlresolvers import reverse


def order_name(name):
    name = re.sub(r'^.*/', '', name)
    if len(name) <= 20:
        return name
    return name[:10] + "..." + name[-7:]


def serialize(instance, file_attr='file_upload'):
    
    obj = getattr(instance, file_attr)
    print "obj name = " + obj.name
    return {
        'url': obj.url,
        #'name': order_name(obj.name),
        'name': obj.name,
        'type': mimetypes.guess_type(obj.path)[0] or 'image/png',
        'thumbnailUrl': obj.url,
        'size': obj.size,
        'deleteUrl': reverse('fileupload:upload-delete', args=[instance.pk]),
        'deleteType': 'DELETE',
    }


