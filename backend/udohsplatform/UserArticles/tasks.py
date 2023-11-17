from celery import shared_task
from .utils.sendLinkEmail import sendLinkEmail


@shared_task(bind=True)
def send_mail_func(self, link):
    sendLinkEmail("udoh.abasi.s@gmail.com", link)
    return "Done"
