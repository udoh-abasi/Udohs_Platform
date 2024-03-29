from rest_framework import serializers
from .models import EmailVerification

from random import sample
from .utils.sendEmail import sendEmailCode
from .tasks import send_mail_func
from django.http import HttpResponse


def get_code(digit=6):
    codeList = "1234567890"
    code = "".join(sample(codeList, k=digit))
    return code


class EmailSendSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def send_code_to_email(self, recipient):
        try:
            email_exist = EmailVerification.objects.get(email=recipient)
            email_exist.delete()
        except:
            pass

        code = get_code()

        sendEmailCode(recipient, code)
        # send_mail_func.delay()

        obj = EmailVerification.objects.create(email=recipient, code=code)
        obj.save()
