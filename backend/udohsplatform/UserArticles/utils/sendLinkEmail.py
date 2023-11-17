from django.core.mail import send_mail


def sendLinkEmail(recipient, link):
    try:
        body = f"A new post with has been made. Here is the link - {link}."

        send_mail(
            subject="New Post on udohsplatform",
            message=body,
            from_email="tropyganty0@gmail.com",
            recipient_list=[recipient],
            fail_silently=False,  # Set this to True if you are sending email to multiple people, so that one failed attempt won't affect sending email to someone else
        )

    except Exception as e:
        print(e)
        raise Exception("Error sending email")
