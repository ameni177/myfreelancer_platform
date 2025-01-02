import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./projectfreelancerdetails.css";

const ProjectfreelancerDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(0);
  const [newTask, setNewTask] = useState({ name: "", description: "" }); // New task data
  const [selectedTaskId, setSelectedTaskId] = useState(null); // For tracking selected task
  const [newTaskStatus, setNewTaskStatus] = useState(""); 
  const freelancerName = localStorage.getItem("Name") || "Freelancer";
  const freelancerEmail = localStorage.getItem("Email")// New status
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "localhost";

  // Fetch project details
  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/projects/${projectId}`);
      const tasksResponse = await axios.get(`http://${backendUrl}:3001/projects/${projectId}/tasks`);
      setProject({ ...response.data, tasks: tasksResponse.data });
      setProgress(response.data.progress);
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  // Save project progress
  const saveProgress = async () => {
    try {
      await axios.put(`http://${backendUrl}:3001/projects/${projectId}/progress`, { progress });
      console.log("Progress saved");
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  // Add a new task
  const addTask = async () => {
    if (!newTask.name) {
      alert("Task name is required!");
      return;
    }
    try {
      await axios.post(`http://${backendUrl}:3001/projects/${projectId}/tasks`, {
        name: newTask.name,
        description: newTask.description,
        status: "pending",
      });
      console.log("Task added successfully!");
      fetchProjectDetails();
      setNewTask({ name: "", description: "" });
    } catch (err) {
      console.error("Error adding task:", err);
    }

    try {
            await axios.post(`http://${backendUrl}:3001/inbox/send-message`, {
                companyName: project.companyname,
                freelancerName:freelancerEmail,
                projectId: project.id,
                message: `Freelancer ${freelancerName}  added new Task: ${newTask.name}`,
            });
        } catch (err) {
            console.error("Error sending message:", err);
           // setMessage("Error: Unable to send message to the company.");
        }
  };

  // Update task status
  const updateTaskStatus = async (taskId) => {
    try {
      // Find the task by ID to get the task name
      const task = project.tasks.find((task) => task.id === taskId);
      if (!task) {
        console.error("Task not found");
        return;
      }
  
      // Update the task status
      await axios.put(`http://${backendUrl}:3001/tasks/${taskId}/status`, { status: newTaskStatus });
      console.log("Task status updated successfully!");
      fetchProjectDetails();
      setSelectedTaskId(null);
      setNewTaskStatus("");
  
      // Send a message to the inbox
      await axios.post(`http://${backendUrl}:3001/inbox/send-message`, {
        companyName: project.companyname,
        freelancerName:freelancerEmail,
        projectId: project.id,
        message: `Freelancer ${freelancerName} updated the status of task "${task.name}" to "${newTaskStatus}"`,
      });
    } catch (err) {
      console.error("Error updating task status or sending message:", err);
    }
  };
  

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://${backendUrl}:3001/tasks/${taskId}`);
      console.log("Task deleted successfully!");
      fetchProjectDetails();
    } catch (err) {
      console.error("Error deleting task:", err);
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
            <label>Progress: {progress}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
            <button onClick={saveProgress}>Save Progress</button>
          </div>

          {/* Tasks Section */}
          <div className="task-section">
            <h3>Tasks</h3>
            <div className="tasks-list">
              {project.tasks && project.tasks.length > 0 ? (
                project.tasks.map((task) => (
                  <div key={task.id} className="task">
                    <div className="task-header">
                      <div>
                        <p><strong>Task:</strong> {task.name}</p>
                        <p><strong>Description:</strong> {task.description}</p>
                        <p><strong>Status:</strong> {task.status}</p>
                      </div>
                      <div className="task-buttons">
                        <button onClick={() => deleteTask(task.id)}>Delete</button>
                        <button onClick={() => setSelectedTaskId(task.id)}>
                          {selectedTaskId === task.id ? "Close" : "Update Status"}
                        </button>
                      </div>
                    </div>

                    {/* Update Task Status Form */}
                    {selectedTaskId === task.id && (
                      <div className="task-update-form">
                        <select
                          value={newTaskStatus}
                          onChange={(e) => setNewTaskStatus(e.target.value)}
                        >
                          <option value="">Select Status</option>
                          <option value="in progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <button onClick={() => updateTaskStatus(task.id)}>Update</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No tasks available</p>
              )}
            </div>

            {/* Add New Task */}
            <div className="add-task">
              <h4>Add New Task</h4>
              <input
                type="text"
                placeholder="Task Name"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              />
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <button onClick={addTask}>Add Task</button>
            </div>
          </div>
          <button onClick={() => navigate("/freelancer-dashboard")}>Go to Dashboard</button>
        </>
      ) : (
        <p>Loading project details...</p>
      )}
    </div>
  );
};

export default ProjectfreelancerDetails;
