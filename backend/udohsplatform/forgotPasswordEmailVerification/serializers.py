from rest_framework import serializers
from .models import PasswordEmailVerification

from random import sample
from .utils.sendEmail import sendEmailCode


def get_code(digit=6):
    codeList = "1234567890"
    code = "".join(sample(codeList, k=digit))
    return code


class EmailSendSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def send_code_to_email(self, recipient):
        try:
            email_exist = PasswordEmailVerification.objects.get(email=recipient)
            email_exist.delete()
        except:
            pass

        code = get_code()
        sendEmailCode(recipient, code)
        obj = PasswordEmailVerification.objects.create(email=recipient, code=code)
        obj.save()
