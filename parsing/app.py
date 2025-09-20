from flask import Flask, request, jsonify
import os
from analysis_engine import get_relevance_package # Import our main function

app = Flask(__name__)

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
JDS_FOLDER = 'jds'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(JDS_FOLDER):
    os.makedirs(JDS_FOLDER)

# This acts as a simple database. In a real app, use SQLite or PostgreSQL.
# The keys are "job_ids" and values are the filenames in the 'jds' folder.
JOB_DESCRIPTIONS = {
    "1": "senior_data_engineer.pdf" 
    # "2": "product_manager.docx"
}

@app.route('/apply/<job_id>', methods=['POST'])
def apply_for_job(job_id):
    # --- 1. Validate the request ---
    if job_id not in JOB_DESCRIPTIONS:
        return jsonify({"error": f"Job ID '{job_id}' not found"}), 404
    
    jd_filename = JOB_DESCRIPTIONS[job_id]
    jd_path = os.path.join(JDS_FOLDER, jd_filename)

    if 'resume' not in request.files:
        return jsonify({"error": "No resume file part in the request"}), 400

    resume_file = request.files['resume']
    if resume_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # --- 2. Save the uploaded resume temporarily ---
    temp_resume_path = os.path.join(UPLOAD_FOLDER, resume_file.filename)
    resume_file.save(temp_resume_path)

    # --- 3. Call the analysis engine ---
    print(f"INFO: Analyzing '{temp_resume_path}' against '{jd_path}'...")
    analysis_result = get_relevance_package(temp_resume_path, jd_path)

    # --- 4. Clean up the temporary file ---
    os.remove(temp_resume_path)

    # --- 5. Return the full analysis ---
    return jsonify(analysis_result)

if __name__ == '__main__':
    print("Server is starting...")
    print("Make sure you have created a 'jds' folder and put your job description files inside.")
    print("Example JD files for job_id '1' is 'senior_data_engineer.pdf'")
    app.run(host='0.0.0.0', port=5000, debug=True)