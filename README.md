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
Of course. Based on your directory structure and our previous conversations, here is a comprehensive and professional README file template.

You'll need to fill in a few specific details (like your repository URL and exact Python framework), but this structure covers all the essential information for your Automated Resume Relevance Check System.

How to Use This Template
Create a new file named README.md in the root directory of your project (at the same level as Backend and Frontend).

Copy and paste the entire content below into that file.

Replace the placeholder text (like [your-username], [your-repo], and instructions in [...]) with your project's specific details.

Markdown

# Automated Resume Relevance Check System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/[your-username]/[your-repo])
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

.
├── Backend
│   ├── CheckSystem
│   │   ├── main.py             # Core application logic/routes
│   │   ├── models.py           # Database models (SQLAlchemy, etc.)
│   │   └── userinfosave.py     # Logic for saving user data
│   ├── job_descriptions/       # Storage for uploaded JDs
│   ├── resume/                 # Storage for uploaded resumes
│   └── Start_Server.py         # Script to run the backend server
├── Frontend
│   └── checksyssystem/         # Vite project root
│       ├── src/                # Frontend source code
│       └── ...
└── README.md
