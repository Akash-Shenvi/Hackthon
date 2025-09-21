# Automated Resume Relevance Check System
An intelligent system designed to automate the process of screening resumes against job descriptions. This project uses a hybrid approach of keyword and semantic matching, powered by the Google Gemini API, to provide a comprehensive relevance score and actionable feedback.

## Features ✨

- **File Uploads**: Recruiters can upload job descriptions (PDF/DOCX) and students can upload their resumes.
- **AI-Powered Parsing**: Extracts structured data from unstructured job descriptions using the Gemini API.
- **Hybrid Scoring**: Generates a relevance score using a weighted average of:
    - **Hard Matching**: Keyword-based check for essential skills.
    - **Semantic Matching**: Contextual analysis of experience and projects via an LLM.
- **Comprehensive Analysis**: Provides a complete analysis package including:
    - A final relevance score (0-100).
    - A suitability verdict (High, Medium, Low).
    - A list of missing skills and qualifications.
    - Personalized feedback for the candidate.
    - A concise summary for the recruiter.

## Tech Stack 🛠️

- **Backend**: Python, Flask/FastAPI `[Choose one and remove the other]`, PyMuPDF, python-docx, Google Generative AI
- **Frontend**: Vite, React/Vue.js `[Choose one and remove the other]`
- **API**: RESTful API for communication between frontend and backend.
- **LLM**: Google Gemini API

## Directory Structure
