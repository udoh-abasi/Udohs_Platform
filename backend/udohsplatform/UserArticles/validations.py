from django.core.exceptions import ValidationError


def validate_theMainArticle(mainArticle):
    # Validate the 'mainArticle to be sure the wrong format was not sent

    if not isinstance(mainArticle, dict):
        raise ValidationError("Data must be a dictionary")
    if not all(key in mainArticle for key in ("time", "blocks", "version")):
        raise ValidationError("Data must contain 'time', 'blocks', and 'version'")
    if not isinstance(mainArticle["time"], int):
        raise ValidationError("'time' must be an integer")
    if not isinstance(mainArticle["blocks"], list):
        raise ValidationError("'blocks' must be a list")
    if not isinstance(mainArticle["version"], str):
        raise ValidationError("'version' must be a string")

    blocks = mainArticle["blocks"]
    if len(blocks) == 0:
        raise ValidationError("'blocks' cannot be empty")
    return True
