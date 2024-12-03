import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FreelancerDashboard.css";

const FreelancerDashboard = () => {
  const [projects, setProjects] = useState([]);  // For available projects
  const [applyprojects, setApplyprojects] = useState([]);  // For freelancer's applied projects
  const [message, setMessage] = useState("");
  const freelancerName = localStorage.getItem("Name") || "Freelancer";

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch available projects from the server
  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:3001/projects");
      setProjects(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch applied projects for the current freelancer
  const fetchAppliedProjects = async () => {
    try {
      const response = await axios.get("http://localhost:3001/applications", {
        params: { freelancerName }  // Pass freelancer name as query param
      });
      setApplyprojects(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle apply button click for a project
  const handleApply = async (projectId) => {
    try {
      const response = await axios.post("http://localhost:3001/apply", { projectId, freelancerName });
      setMessage(response.data.message); // Display message from the server
      fetchAppliedProjects();  // Refresh the applied projects list
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
                    <p><strong>Description:</strong> {project.description}</p>
                    <p><strong>Skills:</strong> {project.skills}</p>
                    <p><strong>Deadline:</strong> {project.deadline}</p>
                    <p><strong>Budget/Hour:</strong> ${project.budget}</p>
                    <p><strong>Status:</strong> {project.status}</p> {/* Show status */}
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
                  <p><strong>Description:</strong> {project.description}</p>
                  <p><strong>Skills:</strong> {project.skills}</p>
                  <p><strong>Deadline:</strong> {project.deadline}</p>
                  <p><strong>Budget/Hour:</strong> ${project.budget}</p>
                  <button onClick={() => handleApply(project.id)}>Apply</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;
