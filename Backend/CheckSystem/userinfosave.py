from flask import Blueprint, request, jsonify, send_from_directory, url_for
import os
from werkzeug.utils import secure_filename
from CheckSystem.models import db, Student as UserInfo

userinfosave = Blueprint("userinfosave", __name__)  # ✅ use __name__

# Folder where resumes will be stored (absolute path for safety)
UPLOAD_FOLDER = os.path.join(os.getcwd(), "resume")
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


@userinfosave.route("/applications", methods=["GET"])
def get_all_applications():
    try:
        students = UserInfo.query.all()
        applications = []

        for student in students:
            resume_link = None
            if student.resumepath:
                resume_filename = os.path.basename(student.resumepath)
                resume_link = url_for("userinfosave.get_resume", filename=resume_filename, _external=True)

            applications.append({
                "id": student.id,
                "name": student.name,
                "email": student.email,
                "phone": student.phone,
                "degree": student.degree,
                "specialization": student.specialization,
                "passingYear": student.passingYear,
                "tenthMarks": student.tenthMarks,
                "twelfthMarks": student.twelfthMarks,
                "degreeMarks": student.degreeMarks,
                "resume": resume_link
            })

        return jsonify({"status": "success", "applications": applications}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


@userinfosave.route("/resume/<filename>", methods=["GET"])
def get_resume(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=False)
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Resume not found"}), 404  # ✅ use 404
