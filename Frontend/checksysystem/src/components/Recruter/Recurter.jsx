import React, { useState, useEffect } from 'react';
import axios from "axios"; // Install: npm install axios
import { Loader2, CheckCircle2, XCircle,ChevronDown, ChevronUp } from "lucide-react";

// --- HELPER COMPONENTS ---

const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

const NavButton = ({ label, icon, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 text-sm font-medium
            ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
        {icon}
        <span className="mt-2">{label}</span>
    </button>
);

const ApplicantCard = ({ applicant }) => (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
        <h3 className="text-xl font-bold text-white">{applicant.name}</h3>
        <p className="text-indigo-400">{applicant.degree} in {applicant.specialization}</p>
        <p className="text-gray-400 text-sm mt-1">Passing Year: {applicant.passingYear}</p>
        <div className="mt-4 border-t border-gray-700 pt-3 text-xs grid grid-cols-3 gap-2">
            <div><span className="font-semibold text-gray-300">10th:</span> {applicant.tenthMarks}%</div>
            <div><span className="font-semibold text-gray-300">12th:</span> {applicant.twelfthMarks}%</div>
            <div>
                <span className="font-semibold text-gray-300">Degree:</span> {applicant.degreeMarks}
                {applicant.marksType === 'cgpa' ? `/${applicant.cgpaOutOf} CGPA` : '%'}
            </div>
        </div>
        <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300 font-semibold text-sm">
            View Resume &rarr;
        </a>
    </div>
);

const InputField = ({ name, label, type = 'text', value, onChange, placeholder, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
            {label}
        </label>
        <input 
            type={type} 
            name={name} 
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-gray-900 text-white border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 transition"
        />
    </div>
);


// --- PAGE COMPONENTS ---





const DashboardView = ({ criteria, setCriteria }) => {
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setJobDescriptionFile(file);
      setFileName(file.name);
      setError("");
    } else {
      setJobDescriptionFile(null);
      setFileName("");
      setError("Invalid file type. Please upload a PDF file.");
    }
  };

  const handleSetCriteria = async () => {
    if (!jobDescriptionFile) {
      setError("Please upload a Job Description PDF before setting criteria.");
      setSuccessMessage("");
      return;
    }

    try {
      setError("");

      // Prepare FormData for file + criteria
      const formData = new FormData();
      formData.append("jobDescription", jobDescriptionFile);

      // Append criteria fields
      for (const key in criteria) {
        formData.append(key, criteria[key]);
      }

      // Send to backend
      const response = await axios.post(
        "https://rani.pythonanywhere.com/userinfosave/setcriteria", // Change URL if Spring Boot (e.g., http://localhost:8080/api/criteria)
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Response:", response.data);
      setSuccessMessage("Criteria and Job Description have been set successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setError("Failed to send data to backend. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Set Job Criteria</h2>
      <div className="flex flex-col gap-8">
        {/* Job Description */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <label className="block text-lg font-medium text-gray-200 mb-2">
            Job Description
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-400">
                <label
                  htmlFor="jd-upload"
                  className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500"
                >
                  <span>Upload JD (PDF)</span>
                  <input
                    id="jd-upload"
                    name="jd-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              {fileName && (
                <p className="text-sm text-green-400 pt-2">{fileName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Minimum Criteria */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-200 mb-4">
            Minimum Academic Criteria
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              name="passingYear"
              label="Max. Passing Year"
              type="number"
              value={criteria.passingYear}
              onChange={handleChange}
              placeholder="e.g., 2024"
            />
            <InputField
              name="tenthMarks"
              label="Min. 10th Marks (%)"
              type="number"
              value={criteria.tenthMarks}
              onChange={handleChange}
              placeholder="e.g., 75"
            />
            <InputField
              name="twelfthMarks"
              label="Min. 12th Marks (%)"
              type="number"
              value={criteria.twelfthMarks}
              onChange={handleChange}
              placeholder="e.g., 75"
            />
            <InputField
              name="degreeMarks"
              label="Min. Degree Marks"
              type="number"
              value={criteria.degreeMarks}
              onChange={handleChange}
              placeholder="e.g., 8.0 or 80"
            />
          </div>
        </div>

        {/* Action Button and Messages */}
        <div>
          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}
          {successMessage && (
            <p className="text-green-400 text-sm mb-4 text-center">
              {successMessage}
            </p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleSetCriteria}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Set Criteria & JD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllApplicationsView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const res = await fetch("https://rani.pythonanywhere.com/userinfosave/applications"); // 🔗 Flask API
            const data = await res.json();
            if (data.status === "success") {
                setApplicants(data.applications);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // 🗑 Delete one student
    const handleDelete = async (studentId) => {
        try {
            const res = await fetch(`https://rani.pythonanywhere.com/userinfosave/student/delete/${studentId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchApplications(); // refresh
            }
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    };

    // 🗑 Delete all students
    const handleDeleteAll = async () => {
        try {
            const res = await fetch("https://rani.pythonanywhere.com/userinfosave/student/delete_all", {
                method: "DELETE",
            });
            if (res.ok) {
                fetchApplications(); // refresh
            }
        } catch (error) {
            console.error("Error deleting all students:", error);
        }
    };

    const filteredApplicants = applicants.filter(applicant =>
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <p className="text-gray-400 text-center">Loading applications...</p>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">All Applications</h2>

            {/* Top Bar: Search + Delete All */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-2/3">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by applicant name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 text-white border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 pl-10 pr-3 transition"
                    />
                </div>

                {/* Delete All Button */}
                <button
                    onClick={handleDeleteAll}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Delete All Students
                </button>
            </div>

            {/* Applicants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApplicants.length > 0 ? (
                    filteredApplicants.map(app => (
                        <div key={app.id} className="relative">
                            <ApplicantCard
                                applicant={{
                                    ...app,
                                    resumeUrl: app.resume // map Flask "resume" field to ApplicantCard
                                }}
                            />
                            {/* Delete One Student Button */}
                            <button
                                onClick={() => handleDelete(app.id)}
                                className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center bg-gray-800 p-8 rounded-lg md:col-span-3">
                        <p className="text-gray-400">No applicants found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const ParsingView = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const startParsing = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await fetch("https://rani.pythonanywhere.com/userinfosave/parse_all", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse resumes");
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center bg-gray-800 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-4">
        Start Resume Parsing
      </h2>
      <p className="text-gray-400 mb-8 max-w-xl mx-auto">
        Click the button below to filter candidates based on the criteria you
        set. This will move qualified candidates to the <b>Results</b> section.
      </p>

      <button
        onClick={startParsing}
        disabled={loading}
        className={`${
          loading ? "bg-gray-600" : "bg-indigo-600 hover:bg-indigo-700"
        } text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform ${
          !loading && "hover:scale-105"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            Parsing...
          </span>
        ) : (
          "Start Filtering"
        )}
      </button>

      {/* ✅ Success Results */}
      {results && (
        <div className="mt-6 bg-gray-700 p-6 rounded-lg text-left">
          <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
            <CheckCircle2 size={20} /> {results.message}
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            {results.results?.map((res) => (
              <li key={res.student_id} className="border-b border-gray-600 pb-2">
                <span className="font-bold text-white">{res.name}</span> —{" "}
                Score: <span className="text-indigo-400">{res.final_weighted_score}</span>, Verdict:{" "}
                <span
                  className={`${
                    res.fit_verdict === "Fit"
                      ? "text-green-400"
                      : "text-red-400"
                  } font-semibold`}
                >
                  {res.fit_verdict}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ❌ Error Handling */}
      {error && (
        <div className="mt-6 bg-red-900/50 p-4 rounded-lg flex items-center gap-2 text-red-300">
          <XCircle size={20} />
          {error}
        </div>
      )}
    </div>
  );
};

const ResultsView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Sorting & filtering state
  const [minScore, setMinScore] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"

  const fetchAnalyzed = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://rani.pythonanywhere.com/userinfosave/analyzed");
      const data = await res.json();
      if (res.ok && data.analyzed_students) {
        setStudents(data.analyzed_students);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("❌ Error fetching analyzed students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyzed();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ✅ DELETE one analysis
  const handleDelete = async (analysisId) => {
    try {
      const res = await fetch(
        `https://rani.pythonanywhere.com/userinfosave/analysis/delete/${analysisId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        fetchAnalyzed(); // refresh list
      }
    } catch (err) {
      console.error("❌ Error deleting analysis:", err);
    }
  };

  // ✅ DELETE all analyses
  const handleDeleteAll = async () => {
    try {
      const res = await fetch("https://rani.pythonanywhere.com/userinfosave/analysis/delete_all", {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAnalyzed(); // refresh list
      }
    } catch (err) {
      console.error("❌ Error deleting all analyses:", err);
    }
  };

  // ✅ Apply filter + sort
  const processedStudents = students
    .map((student) => {
      const latestAnalysis =
        student.analyses && student.analyses.length > 0
          ? student.analyses[student.analyses.length - 1]
          : null;
      return { ...student, latestAnalysis };
    })
    .filter(
      (s) =>
        s.latestAnalysis &&
        Number(s.latestAnalysis.final_weighted_score) >= minScore
    )
    .sort((a, b) => {
      const scoreA = Number(a.latestAnalysis.final_weighted_score);
      const scoreB = Number(b.latestAnalysis.final_weighted_score);
      return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Analyzed Results</h2>

      {/* 🔎 Filters + Sorting */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div>
          <label className="text-gray-300 text-sm">Minimum Score:</label>
          <input
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="ml-2 px-3 py-1 rounded bg-gray-700 text-white border border-gray-600 w-20"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm">Sort By Score:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="ml-2 px-3 py-1 rounded bg-gray-700 text-white border border-gray-600"
          >
            <option value="desc">High → Low</option>
            <option value="asc">Low → High</option>
          </select>
        </div>

        {/* 🗑 Delete All Button */}
        <button
          onClick={handleDeleteAll}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete All Analyses
        </button>
      </div>

      {processedStudents.length > 0 ? (
        <div className="space-y-6">
          {processedStudents.map((student) => {
            const isExpanded = expandedId === student.id;
            const latestAnalysis = student.latestAnalysis;

            return (
              <div
                key={student.id}
                className="bg-gray-800 rounded-lg shadow-lg p-6 transition hover:shadow-xl"
              >
                {/* Basic Info Row */}
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(student.id)}
                >
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {student.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{student.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {latestAnalysis && (
                      <>
                        <span className="text-indigo-400 font-bold">
                          Score: {latestAnalysis.final_weighted_score}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            latestAnalysis.fit_verdict === "Fit"
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {latestAnalysis.fit_verdict}
                        </span>
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" />
                    ) : (
                      <ChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expandable Details */}
                {isExpanded && latestAnalysis && (
                  <div className="mt-4 border-t border-gray-700 pt-4 space-y-3 text-gray-300 text-sm">
                    <p>
                      <span className="font-semibold text-white">Phone:</span>{" "}
                      {student.phone}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Degree:</span>{" "}
                      {student.degree} ({student.specialization})
                    </p>
                    <p>
                      <span className="font-semibold text-white">
                        Passing Year:
                      </span>{" "}
                      {student.passingYear}
                    </p>
                    <p>
                      <span className="font-semibold text-white">Marks:</span>{" "}
                      10th: {student.tenthMarks}, 12th: {student.twelfthMarks},
                      Degree: {student.degreeMarks}
                    </p>

                    <div className="mt-3">
                      <h4 className="font-semibold text-indigo-400 mb-1">
                        Detailed Scores
                      </h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Hard Match: {latestAnalysis.hard_match_score}</li>
                        <li>
                          Relevance Score: {latestAnalysis.relevance_score}
                        </li>
                      </ul>
                    </div>

                    {latestAnalysis.missing_elements && (
                      <div className="mt-3">
                        <h4 className="font-semibold text-yellow-400 mb-1">
                          Missing Elements
                        </h4>
                        <p>{latestAnalysis.missing_elements}</p>
                      </div>
                    )}

                    {latestAnalysis.personalized_feedback && (
                      <div className="mt-3">
                        <h4 className="font-semibold text-green-400 mb-1">
                          Personalized Feedback
                        </h4>
                        <p>{latestAnalysis.personalized_feedback}</p>
                      </div>
                    )}

                    {latestAnalysis.summary_for_recruiter && (
                      <div className="mt-3">
                        <h4 className="font-semibold text-blue-400 mb-1">
                          Recruiter Summary
                        </h4>
                        <p>{latestAnalysis.summary_for_recruiter}</p>
                      </div>
                    )}

                    {/* 🗑 Delete Single Analysis Button */}
                    <button
                      onClick={() => handleDelete(latestAnalysis.id)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete This Analysis
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <p className="text-gray-400">
            No analyzed students match the filter.
          </p>
        </div>
      )}
    </div>
  );
};



// --- MAIN APP COMPONENT ---

export default function App() {
    const [page, setPage] = useState('dashboard'); // 'dashboard', 'applications', 'parsing', 'results'
    const [criteria, setCriteria] = useState({
        passingYear: '2024',
        tenthMarks: '75',
        twelfthMarks: '75',
        degreeMarks: '8',
    });
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [isParsing, setIsParsing] = useState(false);

    const handleStartParsing = () => {
        setIsParsing(true);
        // Simulate filtering process
        setTimeout(() => {
            const results = mockApplicants.filter(app => {
                const normalizedDegreeMarks = app.marksType === 'cgpa' ? app.degreeMarks * 10 : app.degreeMarks;
                const normalizedCriteriaMarks = parseFloat(criteria.degreeMarks) <= 10 ? parseFloat(criteria.degreeMarks) * 10 : parseFloat(criteria.degreeMarks);
                
                return (
                    app.passingYear <= parseInt(criteria.passingYear, 10) &&
                    app.tenthMarks >= parseFloat(criteria.tenthMarks) &&
                    app.twelfthMarks >= parseFloat(criteria.twelfthMarks) &&
                    normalizedDegreeMarks >= normalizedCriteriaMarks
                );
            });
            setFilteredApplicants(results);
            setIsParsing(false);
            setPage('results'); // Navigate to results after parsing
        }, 1500);
    };
    
    const renderPage = () => {
        switch (page) {
            case 'dashboard':
                return <DashboardView criteria={criteria} setCriteria={setCriteria} />;
            case 'applications':
                return <AllApplicationsView />;
            case 'parsing':
                return <ParsingView onStartParsing={handleStartParsing} />;
            case 'results':
                return <ResultsView filteredApplicants={filteredApplicants} />;
            default:
                return <DashboardView />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Recruiter Dashboard</h1>
                    <div className="w-12 h-12 bg-indigo-500 rounded-full"></div>
                </header>

                {/* Navigation */}
                <nav className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <NavButton
                        label="Dashboard & Criteria"
                        onClick={() => setPage('dashboard')}
                        isActive={page === 'dashboard'}
                        icon={<Icon path="M3 4.5A1.5 1.5 0 014.5 3h15A1.5 1.5 0 0121 4.5v15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5v-15zM5.25 7.5A.75.75 0 016 6.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75z" />}
                    />
                     <NavButton
                        label="All Applications"
                        onClick={() => setPage('applications')}
                        isActive={page === 'applications'}
                        icon={<Icon path="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.68c.341.82.614 1.703.786 2.651zM5.25 5.625c0-1.036.84-1.875 1.875-1.875h.008a1.875 1.875 0 011.875 1.875v.008a1.875 1.875 0 01-1.875 1.875h-.008A1.875 1.875 0 015.25 7.5v-.008Z" />}
                    />
                    <NavButton
                        label="Parse Resumes"
                        onClick={() => setPage('parsing')}
                        isActive={page === 'parsing'}
                        icon={<Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l.813 2.846a2.25 2.25 0 01-1.54 1.54l-2.846.813-2.846-.813a2.25 2.25 0 01-1.54-1.54L9.75 7.5l.813-2.846a2.25 2.25 0 011.54-1.54l2.846-.813 2.846.813a2.25 2.25 0 011.54 1.54L18.25 7.5z" />}
                    />
                     <NavButton
                        label="Results"
                        onClick={() => setPage('results')}
                        isActive={page === 'results'}
                        icon={<Icon path="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />}
                    />
                </nav>

                {/* Main Content */}
                <main>
                    {isParsing ? (
                         <div className="text-center p-8">
                             <h2 className="text-2xl font-semibold text-white">Filtering Candidates...</h2>
                             <p className="text-gray-400">This will take a moment.</p>
                         </div>
                    ) : (
                        renderPage()
                    )}
                </main>
            </div>
        </div>
    );
}
