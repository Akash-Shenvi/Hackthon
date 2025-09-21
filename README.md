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

- **Backend**: Python, Flask, PyMuPDF, python-docx, Google Generative AI
- **Frontend**: Vite, React/Vue.js
- **API**: RESTful API for communication between frontend and backend.
- **LLM**: Google Gemini API

## Setup and Installation 🚀

Follow these instructions to set up and run the project locally.

### Prerequisites

- Python 3.8+
- Node.js 16+ and npm
- An active Google Gemini API Key

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)[your-username]/[your-repo].git
    cd [your-repo]/Backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    Create a file named `.env` in the `Backend` directory and add your Gemini API key:
    ```
    GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
    # Add any other variables like DATABASE_URL if you have one
    ```

5.  **Initialize the database:**

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../Frontend/checksyssystem
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the `Frontend/checksyssystem` directory to specify the backend API URL:
    ```
    VITE_API_BASE_URL="[http://127.0.0.1:5000](http://127.0.0.1:5000)"
    ```

## Running the Application ▶️

You need to run the backend and frontend servers in two separate terminals.

1.  **Start the Backend Server:**
    (In a terminal located at the `Backend` directory)
    ```bash
    python Start_Server.py
    ```
    The backend server should now be running on `http://127.0.0.1:5000`.

2.  **Start the Frontend Development Server:**
    (In another terminal located at the `Frontend/checksyssystem` directory)
    ```bash
    npm run dev
    ```
    The frontend application should now be accessible at `http://localhost:5173` (or another port specified by Vite).

## API Endpoints 📡

Here is an example of the primary API endpoint for analyzing a resume.

### Analyze Resume

- **URL**: `/apply/<job_id>`
- **Method**: `POST`
- **Body**: `form-data`
  - **Key**: `resume`
  - **Type**: `File`
  - **Value**: The user's resume file (e.g., `my_resume.pdf`).

- **Success Response (200 OK):**
  ```json
  {
    "fit_verdict": "High Suitability",
    "hard_match_score": 87.5,
    "missing_elements": [
        "Familiarity with orchestration tools like Airflow"
    ],
    "personalized_feedback": "Your resume shows strong alignment...",
    "relevance_score": 92,
    "summary_for_recruiter": "The candidate has extensive experience...",
    "final_weighted_score": 90.12
  }
