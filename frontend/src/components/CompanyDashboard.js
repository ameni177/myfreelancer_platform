import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Importiere useNavigate
import "./CompanyDashboard.css";

const CompanyDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [message, setMessage] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    deadline: "",
    skills: "",
    budget: "",
  });
  const companyName = localStorage.getItem("Name") || "Your Company";
  const navigate = useNavigate(); // Initialisiere navigate

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // Get backend URL from environment variables

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const companyName = localStorage.getItem("Name") || "Your Company"; // Fetch the company name from local storage
    try {
      const response = await axios.get(`http://${backendUrl}:3001/projects?companyName=${companyName}`);
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchApplicants = async (projectId) => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/applications/${projectId}`);
      setApplicants(response.data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    fetchApplicants(project.id);
    navigate(`/projects/${project.id}`); // Navigiere zu den Projektdetails
  };

  const handleConfirmApplicant = async (applicationId) => {
    try {
      const response = await axios.put(`http://${backendUrl}:3001/applications/confirm/${applicationId}`);
      setMessage("Applicant confirmed successfully!");
      fetchApplicants(selectedProject.id);
    } catch (err) {
      setMessage("Error confirming applicant.");
      console.error("Error confirming applicant:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleCreateProject = async () => {
    const { name, description, deadline, skills, budget } = newProject;
    const companyName = localStorage.getItem("Name") || "Your Company"; // Get company name from localStorage
    if (!name || !description || !deadline || !skills || !budget) {
      setMessage("All fields are required.");
      return;
    }

    const projectData = {
      name,
      description,
      deadline,
      skills,
      budget,
      companyName,  // Include companyName here
    };

    try {
      const response = await axios.post(`http://${backendUrl}:3001/projects`, projectData);
      setMessage("Project created successfully!");
      setNewProject({ name: "", description: "", deadline: "", skills: "", budget: "" });
      fetchProjects(); // Refresh the list of projects
    } catch (err) {
      setMessage("Error creating project.");
      console.error("Error creating project:", err);
    }
  };

  const closePopup = () => {
    setSelectedProject(null);
    setApplicants([]);
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {companyName}</h1>

      <div className="dashboard-content">
        {/* Project Creation Form */}
        <div className="create-project">
          <h2>Create a New Project</h2>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              placeholder="Enter project name"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              placeholder="Enter project description"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input
              type="date"
              name="deadline"
              value={newProject.deadline}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Skills</label>
            <input
              type="text"
              name="skills"
              value={newProject.skills}
              onChange={handleInputChange}
              placeholder="E.g., React, Node.js, AWS"
            />
          </div>
          <div className="form-group">
            <label>Budget</label>
            <input
              type="number"
              name="budget"
              value={newProject.budget}
              onChange={handleInputChange}
              placeholder="E.g., 50 (in USD)"
            />
          </div>
          <button onClick={handleCreateProject}>Create Project</button>
        </div>

        {/* Project List */}
        <div className="project-list">
          <h2>Your Projects</h2>
          {projects.length === 0 ? (
            <p>No projects found. Create one to get started!</p>
          ) : (
            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <div className="project-overview">
                    <h3>{project.name}</h3>
                    <button onClick={() => handleViewDetails(project)}>View Details</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Display Message */}
      {message && <p className="message">{message}</p>}

      {/* Display Project Details Popup */}
      {selectedProject && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-button" onClick={closePopup}>
              Close
            </button>
            <h2>Project Details</h2>
            <p>
              <strong>Name:</strong> {selectedProject.name}
            </p>
            <p>
              <strong>Description:</strong> {selectedProject.description}
            </p>
            <p>
              <strong>Deadline:</strong> {selectedProject.deadline}
            </p>
            <p>
              <strong>Skills:</strong> {selectedProject.skills}
            </p>
            <p>
              <strong>Budget/Hour:</strong> ${selectedProject.budget}
            </p>

            <h3>Applicants</h3>
            {applicants.length === 0 ? (
              <p>No applicants yet.</p>
            ) : (
              <ul>
                {applicants.map((applicant) => (
                  <li key={applicant.id} className="applicant-item">
                    <div className="applicant-info">
                      <p>
                        <strong>Freelancer:</strong> {applicant.freelancer_name}
                      </p>
                      <p>
                        <strong>Status:</strong> {applicant.status}
                      </p>
                      <p>
                        <strong>Skills:</strong> {applicant.skills}
                      </p>
                      <p>
                        <strong>Message to Company:</strong> {applicant.message_to_company}
                      </p>
                      <p>
                        <strong>CV:</strong>{" "}
                        {applicant.cv_url ? (
                          <a href={applicant.cv_url} target="_blank" rel="noopener noreferrer">
                            View CV
                          </a>
                        ) : (
                          <span>No CV available</span>
                        )}
                      </p>
                      {applicant.status === "awaiting" && (
                        <button onClick={() => handleConfirmApplicant(applicant.id)}>
                          Confirm Applicant
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
