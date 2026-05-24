from .models import (
    Bus, Operator,  Operator, BusFeature,
    OperatorStaff,
    BusCategory,
    Driver
)

from django.contrib import admin

admin.site.register(Bus)
admin.site.register(Driver)
admin.site.register(Operator)
admin.site.register(BusFeature)
admin.site.register(BusCategory)
admin.site.register(OperatorStaff)
