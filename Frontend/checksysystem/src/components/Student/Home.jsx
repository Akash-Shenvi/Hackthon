import React, { useState } from 'react';

// Helper component for SVG icons
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d={path} />
    </svg>
);

// Main App Component
export default function App() {
    // State management for form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        degree: '',
        specialization: '',
        passingYear: '',
        marksType: 'cgpa', // 'cgpa' or 'percentage'
        marksValue: '',
        cgpaOutOf: '10',
        tenthMarks: '',
        twelfthMarks: ''
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    // --- Event Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (allowedTypes.includes(file.type)) {
                setResumeFile(file);
                setFileName(file.name);
                setError('');
            } else {
                setError('Invalid file type. Please upload a PDF or DOCX file.');
                setResumeFile(null);
                setFileName('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, email, phone, degree, specialization, passingYear, marksValue, tenthMarks, twelfthMarks } = formData;

        // Validation
        if (!name || !email || !phone || !degree || !specialization || !passingYear || !marksValue || !tenthMarks || !twelfthMarks || !resumeFile) {
            setError('Please fill all mandatory fields and upload your resume.');
            return;
        }
        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        // Phone validation (10 digits for India)
        if (!/^\d{10}$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        // Prepare FormData for Flask backend
        const submissionData = new FormData();
        for (const key in formData) {
            submissionData.append(key, formData[key]);
        }
        submissionData.append('resume', resumeFile);

        try {
            const response = await fetch("http://localhost:5000/apply", {
                method: "POST",
                body: submissionData,
            });

            if (!response.ok) throw new Error("Submission failed. Please try again.");

            const result = await response.json();
            console.log("✅ Backend Response:", result);
            setIsSubmitted(true);
        } catch (err) {
            console.error("❌ Error submitting form:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renders the main form
    const renderForm = () => (
        <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 transition-all duration-500">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">Student Application Portal</h1>
                <p className="text-gray-400">Fill in your details to apply.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Personal Information */}
                    <InputField name="name" label="Full Name" value={formData.name} onChange={handleChange} required />
                    <InputField name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} placeholder="e.g., student@example.com" required />
                    <InputField name="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleChange} placeholder="e.g., 9876543210" required />
                    <InputField name="degree" label="Degree Program" value={formData.degree} onChange={handleChange} placeholder="e.g., Bachelor of Technology" required />
                    <InputField name="specialization" label="Specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g., Computer Science" required />
                    <InputField name="passingYear" label="Passing Year" type="number" value={formData.passingYear} onChange={handleChange} placeholder="e.g., 2025" required />

                    {/* School Marks */}
                    <InputField name="tenthMarks" label="10th Percentage" type="number" value={formData.tenthMarks} onChange={handleChange} placeholder="e.g., 95.5" required />
                    <InputField name="twelfthMarks" label="12th Percentage" type="number" value={formData.twelfthMarks} onChange={handleChange} placeholder="e.g., 88.2" required />

                    {/* Degree Grading System */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Degree Grading System</label>
                        <div className="flex items-center space-x-4 bg-gray-900/50 p-2 rounded-lg">
                            <RadioOption id="cgpa" name="marksType" value="cgpa" checked={formData.marksType === 'cgpa'} onChange={handleChange} label="CGPA" />
                            <RadioOption id="percentage" name="marksType" value="percentage" checked={formData.marksType === 'percentage'} onChange={handleChange} label="Percentage" />
                        </div>
                    </div>

                    {/* Conditional Degree Marks Input */}
                    <div className="md:col-span-2">
                        {formData.marksType === 'cgpa' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                <InputField name="marksValue" label="Degree CGPA" type="number" step="0.01" value={formData.marksValue} onChange={handleChange} placeholder="e.g., 8.5" required />
                                <div>
                                    <label htmlFor="cgpaOutOf" className="block text-sm font-medium text-gray-300 mb-2">Out of</label>
                                    <select
                                        id="cgpaOutOf"
                                        name="cgpaOutOf"
                                        value={formData.cgpaOutOf}
                                        onChange={handleChange}
                                        className="w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                                    >
                                        <option>10</option>
                                        <option>4</option>
                                        <option>5</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <InputField name="marksValue" label="Degree Percentage" type="number" step="0.01" value={formData.marksValue} onChange={handleChange} placeholder="e.g., 85" required />
                        )}
                    </div>

                    {/* Resume Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload Resume {<span className="text-red-400">*</span>}</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Icon path="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h2a4 4 0 014 4v5a4 4 0 01-4 4H7zM7 16V7" className="mx-auto h-12 w-12 text-gray-500" />
                                <div className="flex text-sm text-gray-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
                                {fileName && <p className="text-sm text-green-400 pt-2">{fileName}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {error && <p className="mt-4 text-center text-red-400">{error}</p>}

                <div className="mt-10 text-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto inline-flex justify-center items-center py-3 px-12 border border-transparent shadow-lg text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : "Submit Application"}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderSuccessMessage = () => (
        <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Submission Successful!</h2>
            <p className="text-gray-300 text-lg">
                Thank you for your application. We have received your details and will reach out to you shortly if your profile is a good fit.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 font-sans">
            <div className="w-full">
                {isSubmitted ? renderSuccessMessage() : renderForm()}
            </div>
        </div>
    );
}

// Input Field Component
const InputField = ({ name, label, type = 'text', value, onChange, placeholder, required = false, step }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            step={step}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 transition"
        />
    </div>
);

// Radio Button Component
const RadioOption = ({ id, name, value, checked, onChange, label }) => (
    <div className="flex-1">
        <input
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
        />
        <label
            htmlFor={id}
            className="w-full text-center block py-3 px-4 rounded-md cursor-pointer transition-all duration-300 border border-transparent text-gray-300 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:font-semibold hover:bg-gray-700"
        >
            {label}
        </label>
    </div>
);
