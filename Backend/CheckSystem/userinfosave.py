from flask import Blueprint, request, jsonify, send_from_directory, url_for
import os
from werkzeug.utils import secure_filename
from sqlalchemy.orm import joinedload

from CheckSystem.models import db, Student, AnalysisResult
from CheckSystem.analysis_engine import get_relevance_package  # <-- your Gemini analysis code

userinfosave = Blueprint("userinfosave", __name__)

# ------------------ Folders ------------------
UPLOAD_FOLDER = os.path.join(os.getcwd(), "resume")
JD_FOLDER = os.path.join(os.getcwd(), "job_descriptions")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(JD_FOLDER, exist_ok=True)


# ------------------------- STUDENT APPLICATION ROUTES -------------------------
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

        # Check duplicate
        existing_user = Student.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"status": "error", "message": "Already submitted"}), 400

        # Save resume
        resume = request.files.get("resume")
        resumepath = None
        if resume:
            ext = os.path.splitext(resume.filename)[1]
            safe_email = secure_filename(email)
            filename = f"{safe_email}{ext}"
            resumepath = os.path.join(UPLOAD_FOLDER, filename)
            resume.save(resumepath)

        # Convert CGPA → %
        if marksType == "cgpa" and marksValue and cgpaOutOf:
            degreeMarks = str((float(marksValue) / float(cgpaOutOf)) * 100)
        else:
            degreeMarks = marksValue

        # Save student
        new_user = Student(
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
        students = Student.query.all()
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
                "resume": resume_link,
                "status": student.status
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
        return jsonify({"status": "error", "message": "Resume not found"}), 404


# ------------------------- JOB CRITERIA + JD ROUTES -------------------------
@userinfosave.route("/setcriteria", methods=["POST"])
def set_criteria():
    try:
        # File check
        file = request.files.get("jobDescription")
        if not file:
            return jsonify({"status": "error", "message": "No JD file uploaded"}), 400

        ext = os.path.splitext(file.filename)[1].lower()
        if ext != ".pdf":
            return jsonify({"status": "error", "message": "Invalid JD file type"}), 400

        filename = secure_filename(file.filename)
        jd_path = os.path.join(JD_FOLDER, filename)
        file.save(jd_path)

        criteria = {
            "passingYear": request.form.get("passingYear"),
            "tenthMarks": request.form.get("tenthMarks"),
            "twelfthMarks": request.form.get("twelfthMarks"),
            "degreeMarks": request.form.get("degreeMarks"),
        }

        print("\n--- New Job Criteria ---")
        print("Criteria:", criteria)
        print("JD File saved at:", jd_path)
        print("------------------------\n")

        return jsonify({
            "status": "success",
            "message": "Criteria & JD saved successfully",
            "criteria": criteria,
            "jd_file": filename
        }), 200

    except Exception as e:
        print("❌ Error in set_criteria:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


@userinfosave.route("/jd/<filename>", methods=["GET"])
def get_jd(filename):
    try:
        return send_from_directory(JD_FOLDER, filename, as_attachment=False)
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "JD file not found"}), 404


# ------------------------- PARSE ALL (RECRUITER TRIGGER) -------------------------
@userinfosave.route("/parse_all", methods=["POST"])
def parse_all():
    """Triggered by recruiter → parses all Pending students and saves results."""
    try:
        # Get pending students
        students = Student.query.filter_by(status="Pending").all()
        if not students:
            return jsonify({"message": "No pending resumes to parse."}), 200

        # Pick latest JD file
        jd_files = sorted(os.listdir(JD_FOLDER), reverse=True)
        if not jd_files:
            return jsonify({"error": "No JD uploaded"}), 400
        jd_path = os.path.join(JD_FOLDER, jd_files[0])

        results_saved = []
        for student in students:
            analysis_data = get_relevance_package(student.resumepath, jd_path)

            if "error" in analysis_data:
                continue

            analysis_result = AnalysisResult(
                student_id=student.id,
                final_weighted_score=analysis_data.get("final_weighted_score"),
                fit_verdict=analysis_data.get("fit_verdict"),
                hard_match_score=analysis_data.get("hard_match_score"),
                relevance_score=analysis_data.get("relevance_score"),
                missing_elements=analysis_data.get("missing_elements"),
                personalized_feedback=analysis_data.get("personalized_feedback"),
                summary_for_recruiter=analysis_data.get("summary_for_recruiter"),
            )
            db.session.add(analysis_result)

            student.status = "Analyzed"

            results_saved.append({
                "student_id": student.id,
                "name": student.name,
                "final_weighted_score": analysis_data.get("final_weighted_score"),
                "fit_verdict": analysis_data.get("fit_verdict")
            })

        db.session.commit()

        return jsonify({
            "message": f"Parsing complete for {len(results_saved)} students",
            "results": results_saved
        }), 200

    except Exception as e:
        db.session.rollback()
        print("❌ Error in parse_all:", e)
        return jsonify({"error": str(e)}), 500


@userinfosave.route("/analyzed", methods=["GET"])
def get_analyzed_students():
    try:
        # Get all students with status 'Analyzed'
        students = Student.query.filter_by(status="Analyzed").all()
        if not students:
            return jsonify({"status": "success", "message": "No analyzed students found", "data": []}), 200

        analyzed_data = []

        for student in students:
            # Fetch all analysis results for this student
            analyses = AnalysisResult.query.filter_by(student_id=student.id).all()
            analysis_list = []
            for a in analyses:
                analysis_list.append({
                    "final_weighted_score": a.final_weighted_score,
                    "fit_verdict": a.fit_verdict,
                    "hard_match_score": a.hard_match_score,
                    "relevance_score": a.relevance_score,
                    "missing_elements": a.missing_elements,
                    "personalized_feedback": a.personalized_feedback,
                    "summary_for_recruiter": a.summary_for_recruiter
                })

            analyzed_data.append({
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
                "status": student.status,
                "analyses": analysis_list
            })

        return jsonify({"status": "success", "analyzed_students": analyzed_data}), 200

    except Exception as e:
        print("❌ Error in get_analyzed_students:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------------- DELETE ANALYSIS RESULTS -------------------------

@userinfosave.route("/analysis/delete/<int:analysis_id>", methods=["DELETE"])
def delete_analysis(analysis_id):
    """Delete a specific analysis result by ID."""
    try:
        analysis = AnalysisResult.query.get(analysis_id)
        if not analysis:
            return jsonify({"status": "error", "message": "Analysis not found"}), 404

        # Optionally, reset student status to "Pending"
        student = Student.query.get(analysis.student_id)
        if student:
            student.status = "Pending"

        db.session.delete(analysis)
        db.session.commit()

        return jsonify({"status": "success", "message": f"Analysis {analysis_id} deleted"}), 200

    except Exception as e:
        db.session.rollback()
        print("❌ Error in delete_analysis:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


@userinfosave.route("/analysis/delete_all", methods=["DELETE"])
def delete_all_analyses():
    """Delete all analysis results."""
    try:
        analyses = AnalysisResult.query.all()
        if not analyses:
            return jsonify({"status": "success", "message": "No analyses to delete"}), 200

        # Optionally, reset all student statuses to Pending
        student_ids = {a.student_id for a in analyses}
        Student.query.filter(Student.id.in_(student_ids)).update({"status": "Pending"}, synchronize_session=False)

        # Delete all analyses
        AnalysisResult.query.delete()
        db.session.commit()

        return jsonify({"status": "success", "message": f"Deleted all analyses ({len(analyses)})"}), 200

    except Exception as e:
        db.session.rollback()
        print("❌ Error in delete_all_analyses:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------------- DELETE STUDENTS -------------------------

import os

@userinfosave.route("/student/delete/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    """Delete a specific student, their analyses, and resume file."""
    try:
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"status": "error", "message": "Student not found"}), 404

        # Delete resume file if exists
        if student.resumepath and os.path.exists(student.resumepath):
            os.remove(student.resumepath)

        # Delete analyses
        AnalysisResult.query.filter_by(student_id=student.id).delete()

        # Delete student
        db.session.delete(student)
        db.session.commit()

        return jsonify({"status": "success", "message": f"Student {student_id} and their analyses deleted"}), 200

    except Exception as e:
        db.session.rollback()
        print("❌ Error in delete_student:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


def delete_all_jds():
    for jd_file in os.listdir(JD_FOLDER):
        path = os.path.join(JD_FOLDER, jd_file)
        if os.path.isfile(path):
            os.remove(path)

@userinfosave.route("/student/delete_all", methods=["DELETE"])
def delete_all_students():
    """Delete all students, their analyses, and resume files."""
    try:
        # Delete all analyses first
        AnalysisResult.query.delete()

        # Delete all student resume files
        students = Student.query.all()
        for student in students:
            if student.resumepath and os.path.exists(student.resumepath):
                os.remove(student.resumepath)

        # Delete all students
        count = Student.query.delete()

        db.session.commit()

        return jsonify({"status": "success", "message": f"Deleted all students, analyses, and resumes ({count} students)"}), 200

    except Exception as e:
        db.session.rollback()
        print("❌ Error in delete_all_students:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

