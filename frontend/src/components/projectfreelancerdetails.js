import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./projectfreelancerdetails.css";

const ProjectfreelancerDetails = () => {
  const { projectId } = useParams(); // Get the projectId from the URL
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(0); // Set initial progress as 0
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility
  const [popupMessage, setPopupMessage] = useState(""); // State to hold the message for the popup
  const [taskStatus, setTaskStatus] = useState(""); // State for task status update
  const [issueDescription, setIssueDescription] = useState(""); // State for issue reporting
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // Get backend URL from environment variables

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/projects/${projectId}`);
      setProject(response.data);
      setProgress(response.data.progress); // Initialize progress with project.progress
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  const handlesaveprogress = () => {
    console.log("Progress Defined:", progress);
    saveProgress();
  };

  // Function to save progress to the backend
  const saveProgress = async () => {
    try {
      const response = await axios.put(`http://${backendUrl}:3001/projects/${projectId}/progress`, {
        progress: progress,
      });
      console.log("Progress saved:", response.data);
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  const zuruck = () => {
    navigate("/freelancer-dashboard");
  };

  // Show the popup with the current progress value
  const showProgressPopup = () => {
    setPopupMessage(`Current Progress: ${progress}%`);
    setShowPopup(true);
  };

  // Close the popup
  const closePopup = () => {
    setShowPopup(false);
  };

  // Handle task status update
  const handleTaskStatusUpdate = () => {
    console.log("Task Status:", taskStatus);
    // You can save task status to the backend or update in state as per requirement
  };

  // Handle issue reporting
  const handleIssueReport = async () => {
    if (issueDescription) {
      try {
        const response = await axios.post(`http://${backendUrl}:3001/projects/${projectId}/issues`, {
          description: issueDescription,
        });
        console.log("Issue reported:", response.data);
        setIssueDescription(""); // Reset issue description after reporting
      } catch (err) {
        console.error("Error reporting issue:", err);
      }
    }
  };

  return (
    <div className="project-details-container">
      {project ? (
        <>
          <h1>{project.name}</h1>
          <p><strong>Company:</strong> {project.companyname}</p>
          <p><strong>Description:</strong> {project.description}</p>
          <p><strong>Deadline:</strong> {project.deadline}</p>
          <p><strong>Budget/Hour:</strong> ${project.budget}</p>

          {/* Progress Section */}
          <div className="progress-section">
            <label htmlFor="progress">Progress: {progress}%</label>
            <input
              type="range"
              id="progress"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)} // Update progress dynamically
              className="progress-bar"
            />
            <div className="progress-bar-container">
              <div className="progress-bar-filled" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Show the current progress in a popup */}
            <button onClick={handlesaveprogress}>Save Progress</button>
          </div>

          {/* Task Breakdown & Status Update */}
          <div className="task-status-section">
            <h3>Task Breakdown</h3>
            {project.tasks && project.tasks.length > 0 ? (
              project.tasks.map((task, index) => (
                <div key={index} className="task">
                  <p><strong>Task:</strong> {task.name}</p>
                  <p><strong>Status:</strong> {task.status}</p>
                  <button onClick={() => setTaskStatus(task.name)}>Update Status</button>
                </div>
              ))
            ) : (
              <p>No tasks available</p>
            )}

            {/* Task Status Update Form */}
            <div className="task-status-form">
              <label htmlFor="taskStatus">Update Task Status</label>
              <input
                type="text"
                id="taskStatus"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                placeholder="Enter task status"
              />
              <button onClick={handleTaskStatusUpdate}>Save Task Status</button>
            </div>
          </div>

          {/* Issue Reporting */}
          <div className="issue-reporting">
            <h3>Report an Issue</h3>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the issue..."
            ></textarea>
            <button onClick={handleIssueReport}>Report Issue</button>
            <br />
            <br />
            <button onClick={zuruck}>Go to Dashboard</button>
          </div>

          {/* Popup to show the progress value */}
          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <p>{popupMessage}</p>
                <button onClick={closePopup}>Close</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Loading project details...</p>
      )}
    </div>
  );
};

export default ProjectfreelancerDetails;
