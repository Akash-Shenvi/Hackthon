from flask import Blueprint, request, jsonify

userinfosave = Blueprint("userinfosave", __name__)


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

        # Access uploaded file
        resume = request.files.get("resume")

        # Print received data
        print("\n--- New Submission ---")
        print(f"Name: {name}")
        print(f"Email: {email}")
        print(f"Phone: {phone}")
        print(f"Degree: {degree}")
        print(f"Specialization: {specialization}")
        print(f"Passing Year: {passingYear}")
        print(f"Marks Type: {marksType}")
        print(f"Marks Value: {marksValue}")
        print(f"CGPA Out Of: {cgpaOutOf}")
        print(f"10th Marks: {tenthMarks}")
        print(f"12th Marks: {twelfthMarks}")
        print(f"Resume Uploaded: {resume.filename if resume else 'No file'}")
        print("----------------------\n")

        return jsonify({"status": "success", "message": "Data received successfully"}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500
