from flask import Blueprint, request, jsonify

userinfosave = Blueprint("userinfosave", __name__)


import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from CheckSystem.models import db, Student as UserInfo  # import your DB and model

# Folder where resumes will be stored
UPLOAD_FOLDER = "resume"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@userinfosave.route("/save", methods=["POST"])
def save_user_info():
    try:
        # Access form fields
        name = request.form.get("name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        degree = request.form.get("degree")
        specialization = request.form.get("specialization")
        passingYear = request.form.get("passingYear")
        marksType = request.form.get("marksType")
        marksValue = request.form.get("marksValue")
        cgpaOutOf = request.form.get("cgpaOutOf")
        tenthMarks = request.form.get("tenthMarks")
        twelfthMarks = request.form.get("twelfthMarks")

        # Check if email already exists
        existing_user = UserInfo.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"status": "error", "message": "Already submitted"}), 400

        # Access uploaded file
        resume = request.files.get("resume")
        resumepath = None
        if resume:
            ext = os.path.splitext(resume.filename)[1]  # keep file extension
            safe_email = secure_filename(email)  # sanitize email for filename
            filename = f"{safe_email}{ext}"       # rename resume as email.ext
            resumepath = os.path.join(UPLOAD_FOLDER, filename)
            resume.save(resumepath)

        # Convert CGPA to percentage if provided
        if marksType == "cgpa" and marksValue and cgpaOutOf:
            degreeMarks = str((float(marksValue) / float(cgpaOutOf)) * 100)
        else:
            degreeMarks = marksValue  # direct percentage

        # Save to database
        new_user = UserInfo(
            name=name,
            email=email,
            phone=phone,
            degree=degree,
            specialization=specialization,
            passingYear=passingYear,
            tenthMarks=tenthMarks,
            twelfthMarks=twelfthMarks,
            degreeMarks=degreeMarks,
            resumepath=resumepath
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"status": "success", "message": "Data saved successfully"}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

