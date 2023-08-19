from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from string import ascii_uppercase, digits, ascii_lowercase, punctuation

UserModel = get_user_model()


def validate_password_before_signup(password):
    if len(password) < 8:
        return False

    if not any([i in punctuation for i in password]):
        return False

    if not any([i in digits for i in password]):
        return False

    if not any([i in ascii_lowercase for i in password]):
        return False

    if not any([i in ascii_uppercase for i in password]):
        return False

    return True


def custom_validation(data):
    email = data["email"].strip()

    password = data["password"].strip()
    ##
    if not email or UserModel.objects.filter(email=email).exists():
        raise ValidationError("choose another email")
    ##
    if (not password) or (not validate_password_before_signup(password)):
        raise ValidationError(
            "choose another password, password does not meet requirement"
        )
    ##

    return data


def validate_email(data):
    email = data["email"].strip()
    if not email:
        raise ValidationError("an email is needed")
    return True


def validate_password(data):
    password = data["password"].strip()
    if not password:
        raise ValidationError("a password is needed")
    return True
