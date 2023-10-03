from celery import shared_task
from .utils.sendEmail import sendEmailCode
from random import sample


def get_code(digit=6):
    codeList = "1234567890"
    code = "".join(sample(codeList, k=digit))
    return code


@shared_task(bind=True)
def send_mail_func(self):
    code = get_code()
    sendEmailCode("udoh.abasi@tenece.com", code)
    return "Done"
