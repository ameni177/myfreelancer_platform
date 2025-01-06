import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import axios from "axios";
import "./FreelancerDashboard.css";

const FreelancerDashboard = () => {
  const [projects, setProjects] = useState([]); // All available projects
  const [applyProjects, setApplyProjects] = useState([]); // Freelancer's applied projects
  const [filteredProjects, setFilteredProjects] = useState([]); // Available projects the freelancer hasn't applied for
  const [message, setMessage] = useState("");
  const freelancerName = localStorage.getItem("Name") || "Freelancer";
  const freelancerEmail = localStorage.getItem("Email") || ""; // Freelancer email
  const freelancerPhone = localStorage.getItem("Phone") || ""; // Freelancer phone

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedcompanyname, setSelectedcompanyname] = useState(null);
  const [selectedprojectname, setSelectedprojectname] = useState(null);
  const [skills, setSkills] = useState("");
  const [messageToCompany, setMessageToCompany] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL; // Backend URL from environment variables

  // Fetch data when the page loads
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch both available and applied projects
  const fetchData = async () => {
    try {
      const [availableRes, appliedRes] = await Promise.all([
        axios.get(`http://${backendUrl}:3001/projectsfreelancer`), // Fetch all available projects
        axios.get(`http://${backendUrl}:3001/applications`, {
          params: { freelancerName },
        }), // Fetch projects the freelancer has applied for
      ]);

      setProjects(availableRes.data);
      setApplyProjects(appliedRes.data);

      // Filter projects to exclude applied ones
      const appliedIds = new Set(appliedRes.data.map((p) => p.id));
      const filtered = availableRes.data.filter((project) => !appliedIds.has(project.id));

      setFilteredProjects(filtered);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Handle navigation to the project details page
  const handleStartWorking = (projectId) => {
    navigate(`/project-details/${projectId}`);
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
    formData.append("freelancerEmail", freelancerEmail); // Include freelancer email
    formData.append("freelancerPhone", freelancerPhone); // Include freelancer phone
    formData.append("skills", skills);
    formData.append("messageToCompany", messageToCompany);
    formData.append("cv", cvFile);

    try {
      const response = await axios.post(`http://${backendUrl}:3001/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      try {
        await axios.post(`http://${backendUrl}:3001/inbox/send-message`, {
            companyName: selectedcompanyname,
            freelancerName:freelancerEmail,
            projectId: selectedProjectId,
            message: `Freelancer ${freelancerName} ${freelancerEmail} applied for your project: ${selectedprojectname}`,
        });
    } catch (err) {
        console.error("Error sending message:", err);
        setMessage("Error: Unable to send message to the company.");
    }
   
      setMessage(response.data.message);
      setShowApplyModal(false);
      fetchData(); // Refresh data after successful application
    } catch (err) {
      setMessage("Error applying for the project");
      console.error("Error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Welcome, {freelancerName}!</h1>
        <p>Manage your projects and find new opportunities.</p>
      </header>

      <section className="applied-projects">
        <h2>My Applied Projects</h2>
        <ul>
          {applyProjects.length === 0 ? (
            <p>No applied projects found.</p>
          ) : (
            applyProjects.map((project) => (
              <li key={project.id} className="project-item">
                <h3>{project.name}</h3>
                <p><strong>Company:</strong> {project.companyname}</p>
                <p><strong>Description:</strong> {project.description}</p>
                <p><strong>Status:</strong> {project.status}</p>
                {project.status === "confirmed" && (
                  <button onClick={() => handleStartWorking(project.id)}>
                    Start/Continue Working
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="available-projects">
        <h2>Available Projects</h2>
        {message && <p className="message">{message}</p>}
        <ul>
          {filteredProjects.length === 0 ? (
            <p>No projects available. Check back later.</p>
          ) : (
            filteredProjects.map((project) => (
              <li key={project.id} className="project-item">
                <h3>{project.name}</h3>
                <p><strong>Company:</strong> {project.companyname}</p>
                <p><strong>Description:</strong> {project.description}</p>
                <p><strong>Deadline:</strong> {project.deadline}</p>
                <button
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedcompanyname(project.companyname);
                    setSelectedprojectname(project.name);
                    setShowApplyModal(true);
                  }}
                >
                  Apply
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      {showApplyModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Apply for Project</h2>
            <input
              type="text"
              placeholder="Your Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <textarea
              placeholder="Message to the company"
              value={messageToCompany}
              onChange={(e) => setMessageToCompany(e.target.value)}
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files[0])}
            />
            <div className="modal-actions">
              <button onClick={handleApply}>Submit</button>
              <button onClick={() => setShowApplyModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;
