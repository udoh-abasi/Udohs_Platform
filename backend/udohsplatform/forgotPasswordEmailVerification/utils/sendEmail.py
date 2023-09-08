import yagmail
import os


def sendEmailCode(recipient, code):
    try:
        body = f"Please confirm your email address by entering this code {code}."

        yag = yagmail.SMTP("tropyganty0@gmail.com", os.environ.get("APP_PASSWORD"))

        yag.send(to=recipient, subject="Email Verification Code", contents=body)
        yag.close()

    except Exception as e:
        raise Exception("Error sending email")
