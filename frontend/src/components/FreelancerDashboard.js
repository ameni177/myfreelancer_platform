import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FreelancerDashboard.css";

const FreelancerDashboard = () => {
  const [projects, setProjects] = useState([]); // Available projects
  const [applyprojects, setApplyprojects] = useState([]); // Freelancer's applied projects
  const [message, setMessage] = useState("");
  const freelancerName = localStorage.getItem("Name") || "Freelancer";

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [skills, setSkills] = useState("");
  const [messageToCompany, setMessageToCompany] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch available projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:3001/projectsfreelancer");
      setProjects(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch applied projects
  const fetchAppliedProjects = async () => {
    try {
      const response = await axios.get("http://localhost:3001/applications", {
        params: { freelancerName },
      });
      setApplyprojects(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle form submission for applying to a project
  const handleApply = async () => {
    if (!cvFile) {
      setMessage("Please upload your CV.");
      return;
    }

    const formData = new FormData();
    formData.append("projectId", selectedProjectId);
    formData.append("freelancerName", freelancerName);
    formData.append("skills", skills);
    formData.append("messageToCompany", messageToCompany);
    formData.append("cv", cvFile);

    try {
      const response = await axios.post("http://localhost:3001/apply", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      setShowApplyModal(false); // Close the modal on success
      fetchAppliedProjects(); // Refresh the applied projects list
    } catch (err) {
      setMessage("Error applying for the project");
      console.log(err);
    }
  };

  return (
    <div className="freelancer-dashboard-container">
      <h1>Welcome to your Freelancer Dashboard, {freelancerName}!</h1>
      <p>Here you can view available projects and apply to them.</p>

      {/* MY PROJECTS Section */}
      <div>
        <h2>My Applied Projects</h2>
        <button onClick={fetchAppliedProjects}>Show My Projects</button>
        <div>
          <ul>
            {applyprojects.length === 0 ? (
              <p>No applied projects found.</p>
            ) : (
              applyprojects.map((project) => (
                <li key={project.id} className="project-item">
                  <div className="project-overview">
                    <h3>{project.name}</h3>
                    <p><strong>Company:</strong> {project.companyname}</p>
                    <p><strong>Description:</strong> {project.description}</p>
                    <p><strong>Skills:</strong> {project.skills}</p>
                    <p><strong>Deadline:</strong> {project.deadline}</p>
                    <p><strong>Budget/Hour:</strong> ${project.budget}</p>
                    <p><strong>Status:</strong> {project.status}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Available Projects Section */}
      {message && <p className="message">{message}</p>}
      <div className="available-projects">
        <h2>Available Projects</h2>
        {projects.length === 0 ? (
          <p>No projects available at the moment. Please check back later.</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li key={project.id} className="project-item">
                <div className="project-overview">
                  <h3>{project.name}</h3>
                  <p><strong>Company:</strong> {project.companyname}</p>
                  <p><strong>Description:</strong> {project.description}</p>
                  <p><strong>Skills:</strong> {project.skills}</p>
                  <p><strong>Deadline:</strong> {project.deadline}</p>
                  <p><strong>Budget/Hour:</strong> ${project.budget}</p>
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setShowApplyModal(true);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Apply for Project</h2>
            <input
              type="text"
              placeholder="Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <textarea
              placeholder="Message to the company"
              value={messageToCompany}
              onChange={(e) => setMessageToCompany(e.target.value)}
            ></textarea>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files[0])}
            />
            <button onClick={handleApply}>Submit Application</button>
            <button
              className="cancel-button"
              onClick={() => setShowApplyModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;
