import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom"; // useNavigate und useParams
import "./ProjectDetails.css";

const ProjectDetails = () => {
  const { projectId } = useParams(); // Holen der Projekt-ID aus der URL
  const [project, setProject] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialisiere navigate

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // Get backend URL from environment variables

  useEffect(() => {
    fetchProjectDetails();
    fetchApplicants();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/projects/${projectId}`);
      setProject(response.data);
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  const fetchApplicants = async () => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/applications/${projectId}`);
      setApplicants(response.data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
  };

  const handleBack = () => {
    navigate("/company-dashboard"); // Navigiere zurück zum Dashboard
  };

  const handleConfirmApplicant = async (applicationId) => {
    try {
      const response = await axios.put(`http://${backendUrl}:3001/applications/confirm/${applicationId}`);
      setMessage("Applicant confirmed successfully!");
      fetchApplicants();
    } catch (err) {
      setMessage("Error confirming applicant.");
      console.error("Error confirming applicant:", err);
    }
  };

  return (
    <div className="project-details-container">
      <button onClick={handleBack}>Back to Dashboard</button>

      {project && (
        <div className="project-details">
          <h2>Project Details</h2>
          <p><strong>Name:</strong> {project.name}</p>
          <p><strong>Description:</strong> {project.description}</p>
          <p><strong>Deadline:</strong> {project.deadline}</p>
          <p><strong>Skills:</strong> {project.skills}</p>
          <p><strong>Budget/Hour:</strong> ${project.budget}</p>

          <h3>Applicants</h3>
          {applicants.length === 0 ? (
            <p>No applicants yet.</p>
          ) : (
            <ul>
              {applicants.map((applicant) => (
                <li key={applicant.id}>
                  <p><strong>Freelancer:</strong> {applicant.freelancer_name}</p>
                  <p><strong>Status:</strong> {applicant.status}</p>
                  <p><strong>Skills:</strong> {applicant.skills}</p>
                  <p><strong>Message to Company:</strong> {applicant.message_to_company}</p>
                  <p><strong>CV:</strong> {applicant.cv_url ? (
                    <a href={applicant.cv_url} target="_blank" rel="noopener noreferrer">View CV</a>
                  ) : (
                    <span>No CV available</span>
                  )}</p>

                  {applicant.status !== "confirmed" && (
                    <button onClick={() => handleConfirmApplicant(applicant.id)}>
                      Confirm Applicant
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default ProjectDetails;
