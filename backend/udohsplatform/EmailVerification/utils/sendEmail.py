import yagmail
import os
from django.core.mail import send_mail


def sendEmailCode(recipient, code):
    try:
        body = f"Please confirm your email address by entering this code {code}."

        send_mail(
            subject="Email Verification Code",
            message=body,
            from_email="tropyganty0@gmail.com",
            recipient_list=[recipient],
            fail_silently=False,  # Set this to True if you are sending email to multiple people, so that one failed attempt won't affect sending email to someone else
        )

        # yag = yagmail.SMTP("tropyganty0@gmail.com", os.environ.get("APP_PASSWORD"))

        # yag.send(to=recipient, subject="Email Verification Code", contents=body)
        # yag.close()

    except Exception as e:
        print(e)
        raise Exception("Error sending email")
