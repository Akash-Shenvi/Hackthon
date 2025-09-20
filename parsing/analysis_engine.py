import google.generativeai as genai
import json
import os
import fitz  # PyMuPDF
import docx

# --- Configuration ---
# Ensure your GEMINI_API_KEY is set as an environment variable
API_KEY='AIzaSyBr48U-AcLwqYgbpc1F2jtLokz7iDK6c-c'
genai.configure(api_key=API_KEY)
# try:
#     genai.configure(api_key=os.environ["GEMINI_API_KEY"])
# except KeyError:
#     print("FATAL ERROR: GEMINI_API_KEY environment variable not set.")
#     exit()

# --- UTILITY FUNCTIONS ---

def extract_text_from_file(file_path: str) -> str:
    """Extracts raw text from a PDF or DOCX file."""
    text = ""
    try:
        file_extension = os.path.splitext(file_path)[1].lower()
        if file_extension == ".pdf":
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text()
        elif file_extension == ".docx":
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            return "" # Unsupported format
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""
    return text

def parse_jd_with_gemini(jd_text: str) -> dict:
    """Parses the JD to extract skills for hard matching."""
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    prompt = f"""
    Based on the following job description, extract the "must_have_skills" and "good_to_have_skills".
    Return a valid JSON object with these two keys.

    Job Description:
    ---
    {jd_text}
    ---
    """
    try:
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(cleaned_response)
    except Exception:
        return {} # Return empty dict on failure

# --- CORE ANALYSIS FUNCTIONS ---

def calculate_hard_match_score(resume_text: str, parsed_jd: dict) -> float:
    """Calculates a score based on keyword matching of skills."""
    score, must_have_weight, good_to_have_weight = 0, 2.0, 1.0
    must_have = parsed_jd.get("must_have_skills", []) or []
    good_to_have = parsed_jd.get("good_to_have_skills", []) or []
    
    max_score = (len(must_have) * must_have_weight) + (len(good_to_have) * good_to_have_weight)
    if max_score == 0: return 0.0
    
    resume_lower = resume_text.lower()
    for skill in must_have:
        if skill.lower() in resume_lower: score += must_have_weight
    for skill in good_to_have:
        if skill.lower() in resume_lower: score += good_to_have_weight
        
    return (score / max_score) * 100

def get_comprehensive_analysis(resume_text: str, jd_text: str) -> dict:
    """Gets a full analysis from the LLM, including score, feedback, and verdict."""
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    prompt = f"""
    You are an expert technical recruiter and career coach. Provide a detailed analysis of the resume against the job description.

    Return a single, valid JSON object with the following keys:
    - "relevance_score": An integer score from 0 to 100 for the overall match.
    - "fit_verdict": A string: "High Suitability", "Medium Suitability", or "Low Suitability".
    - "missing_elements": A list of key missing skills, certifications, or projects.
    - "personalized_feedback": Constructive feedback for the student on how to improve.
    - "summary_for_recruiter": A brief summary for the recruiter.

    ---
    Job Description: {jd_text}
    ---
    Resume Text: {resume_text}
    ---
    """
    try:
        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(cleaned_response)
    except Exception as e:
        return {"error": f"API call failed: {e}"}

# --- MAIN CONTROLLER FUNCTION ---

def get_relevance_package(resume_path: str, jd_path: str) -> dict:
    """Main controller function that runs the full analysis and returns a complete package."""
    resume_text = extract_text_from_file(resume_path)
    jd_text = extract_text_from_file(jd_path)

    if not resume_text or not jd_text:
        return {"error": "Could not read one or both files."}

    # Get both hard and soft analyses
    llm_analysis = get_comprehensive_analysis(resume_text, jd_text)
    parsed_jd_for_hard_match = parse_jd_with_gemini(jd_text)
    hard_score = calculate_hard_match_score(resume_text, parsed_jd_for_hard_match)

    # Combine scores for a final weighted result
    llm_score = llm_analysis.get("relevance_score", 0)
    final_score = (hard_score * 0.4) + (llm_score * 0.6)
    
    # Add the final and hard scores to the results package
    llm_analysis['final_weighted_score'] = round(final_score, 2)
    llm_analysis['hard_match_score'] = round(hard_score, 2)
    
    return llm_analysis