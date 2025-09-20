import React from "react";
import { useNavigate } from "react-router-dom";

const Frontpage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-400">
        Resume Parsing Platform
      </h1>
      <p className="text-gray-300 max-w-2xl text-center mb-8">
        Welcome to our intelligent resume parsing and analysis system.  
        Applicants can upload resumes and track their submissions,  
        while recruiters can analyze applications with AI-powered insights.
      </p>

      {/* Buttons */}
      <div className="flex gap-6">
        <button
          onClick={() => navigate("/applicants")}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md text-lg font-semibold transition"
        >
          Applicant
        </button>
        <button
          onClick={() => navigate("/recruiter")}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md text-lg font-semibold transition"
        >
          Recruiter
        </button>
      </div>
    </div>
  );
};

export default Frontpage;
