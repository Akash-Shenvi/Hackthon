from flask import Blueprint, request, jsonify

userinfosave = Blueprint("userinfosave", __name__)


@userinfosave.route("/save", methods=["GET"])
def save_user_info():
    return "User info saved successfully!"
