import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CompanyDashboard.css";

const CompanyDashboard = () => {
  const [projects, setProjects] = useState([]); // Local state for projects
  const [selectedProject, setSelectedProject] = useState(null); // Selected project for viewing details
  const [applicants, setApplicants] = useState([]); // Applicants for the selected project
  const [message, setMessage] = useState(""); // Success/error message
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    deadline: "",
    skills: "",
    budget: "",
  }); // Form fields for creating new project
  const companyName = localStorage.getItem("companyName") || "Your Company"; // Company name from localStorage

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch the list of projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:3001/projects");
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // Fetch applicants for the selected project
  const fetchApplicants = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:3001/applications/${projectId}`);
      setApplicants(response.data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
  };

  // Handle viewing project details
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    fetchApplicants(project.id); // Fetch applicants when viewing project details
  };

  // Handle confirming an applicant
  const handleConfirmApplicant = async (applicationId) => {
    try {
      const response = await axios.put(`http://localhost:3001/applications/confirm/${applicationId}`);
      setMessage("Applicant confirmed successfully!");
      // Refresh applicants after confirming
      fetchApplicants(selectedProject.id);
    } catch (err) {
      setMessage("Error confirming applicant.");
      console.error("Error confirming applicant:", err);
    }
  };

  // Handle input change for creating a new project
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  // Handle creating a new project
  const handleCreateProject = async () => {
    const { name, description, deadline, skills, budget } = newProject;

    // Validation
    if (!name || !description || !deadline || !skills || !budget) {
      setMessage("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/projects", newProject);
      setMessage("Project created successfully!");
      setNewProject({
        name: "",
        description: "",
        deadline: "",
        skills: "",
        budget: "",
      }); // Clear form fields
      fetchProjects(); // Refresh project list
    } catch (err) {
      setMessage("Error creating project.");
      console.error("Error creating project:", err);
    }
  };

  // Close the project details popup
  const closePopup = () => {
    setSelectedProject(null);
    setApplicants([]);
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {companyName}</h1>

      {/* Section for Creating a New Project */}
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

      {/* Display Project List */}
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
  <strong>CV:</strong> 
  {applicant.cv_url ? (
    <a href={applicant.cv_url} target="_blank" rel="noopener noreferrer">View CV</a>
  ) : (
    <span>No CV available</span>  // Optionally show a message when no CV is available
  )}
</p>
                      {/* Show confirm button only if status is "awaiting" */}
                      {applicant.status === "awaiting" && (
                        <button
                          onClick={() => handleConfirmApplicant(applicant.id)}
                        >
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
