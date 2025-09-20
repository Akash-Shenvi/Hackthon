# CheckSystem/models.py
from flask_sqlalchemy import SQLAlchemy

# shared DB object
db = SQLAlchemy()

class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    degree = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    passingYear = db.Column(db.String(10), nullable=False)
    tenthMarks = db.Column(db.String(10), nullable=False)
    twelfthMarks = db.Column(db.String(10), nullable=False)
    degreeMarks = db.Column(db.String(10), nullable=False)
    resumepath = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Pending")
    appliedOn = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    
class AnalysisResult(db.Model):
    __tablename__ = "analysis_results"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)

    # --- Main scores ---
    final_weighted_score = db.Column(db.Float, nullable=True)
    fit_verdict = db.Column(db.String(100), nullable=True)
    hard_match_score = db.Column(db.Float, nullable=True)
    relevance_score = db.Column(db.Float, nullable=True)

    # --- Detailed analysis ---
    missing_elements = db.Column(db.JSON, nullable=True)       # store list
    personalized_feedback = db.Column(db.Text, nullable=True)  # long text
    summary_for_recruiter = db.Column(db.Text, nullable=True)  # recruiter summary
    created_on = db.Column(db.DateTime, server_default=db.func.now())
    
    

    def __repr__(self):
        return f"<Student {self.name}>"
