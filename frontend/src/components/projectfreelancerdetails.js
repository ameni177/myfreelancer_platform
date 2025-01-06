import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Slider,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  TextareaAutosize,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectfreelancerDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(0);
  const [newTask, setNewTask] = useState({ name: "", description: "" });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [newTaskStatus, setNewTaskStatus] = useState("");
  const freelancerName = localStorage.getItem("Name") || "Freelancer";
  const freelancerEmail = localStorage.getItem("Email");
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "localhost";

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

  const saveProgress = async () => {
    try {
      await axios.put(`http://${backendUrl}:3001/projects/${projectId}/progress`, { progress });
      console.log("Progress saved");
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

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
      fetchProjectDetails();
      setNewTask({ name: "", description: "" });

      await axios.post(`http://${backendUrl}:3001/inbox/send-message`, {
        companyName: project.companyname,
        freelancerName: freelancerEmail,
        projectId: project.id,
        message: `Freelancer ${freelancerName} added new Task: ${newTask.name}`,
      });
    } catch (err) {
      console.error("Error adding task or sending message:", err);
    }
  };

  const updateTaskStatus = async (taskId) => {
    try {
      const task = project.tasks.find((task) => task.id === taskId);
      if (!task) {
        console.error("Task not found");
        return;
      }
      await axios.put(`http://${backendUrl}:3001/tasks/${taskId}/status`, { status: newTaskStatus });
      fetchProjectDetails();
      setSelectedTaskId(null);
      setNewTaskStatus("");

      await axios.post(`http://${backendUrl}:3001/inbox/send-message`, {
        companyName: project.companyname,
        freelancerName: freelancerEmail,
        projectId: project.id,
        message: `Freelancer ${freelancerName} updated the status of task "${task.name}" to "${newTaskStatus}"`,
      });
    } catch (err) {
      console.error("Error updating task status or sending message:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://${backendUrl}:3001/tasks/${taskId}`);
      fetchProjectDetails();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
      {project ? (
        <>
          <Typography variant="h4" gutterBottom>
            {project.name}
          </Typography>
          <Typography>
            <strong>Company:</strong> {project.companyname}
          </Typography>
          <Typography>
            <strong>Description:</strong> {project.description}
          </Typography>
          <Typography>
            <strong>Deadline:</strong> {project.deadline}
          </Typography>
          <Typography>
            <strong>Budget/Hour:</strong> ${project.budget}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Progress: {progress}%</Typography>
            <Slider
              value={progress}
              onChange={(e, value) => setProgress(value)}
              min={0}
              max={100}
              sx={{ mt: 2 }}
            />
            <Button variant="contained" onClick={saveProgress} sx={{ mt: 2 }}>
              Save Progress
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Tasks</Typography>
            <List>
              {project.tasks && project.tasks.length > 0 ? (
                project.tasks.map((task) => (
                  <Paper key={task.id} sx={{ p: 2, mb: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {task.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography>
                            <strong>Description:</strong> {task.description}
                          </Typography>
                          <Typography>
                            <strong>Status:</strong> {task.status}
                          </Typography>
                        </>
                      }
                    />
                    <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                      <Button variant="contained" color="error" onClick={() => deleteTask(task.id)}>
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                      >
                        {selectedTaskId === task.id ? "Close" : "Update Status"}
                      </Button>
                    </Box>
                    {selectedTaskId === task.id && (
                      <Box sx={{ mt: 2 }}>
                        <Select
                          value={newTaskStatus}
                          onChange={(e) => setNewTaskStatus(e.target.value)}
                          fullWidth
                        >
                          <MenuItem value="">Select Status</MenuItem>
                          <MenuItem value="in progress">In Progress</MenuItem>
                          <MenuItem value="done">Done</MenuItem>
                        </Select>
                        <Button
                          variant="contained"
                          onClick={() => updateTaskStatus(task.id)}
                          sx={{ mt: 2 }}
                        >
                          Update
                        </Button>
                      </Box>
                    )}
                  </Paper>
                ))
              ) : (
                <Typography>No tasks available</Typography>
              )}
            </List>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Add New Task</Typography>
            <TextField
              label="Task Name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextareaAutosize
              minRows={4}
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              style={{ width: "100%", marginTop: 10, padding: 10 }}
            />
            <Button variant="contained" onClick={addTask} sx={{ mt: 2 }}>
              Add Task
            </Button>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/freelancer-dashboard")}
            sx={{ mt: 4 }}
          >
            Go to Dashboard
          </Button>
        </>
      ) : (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
          <Typography>Loading project details...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProjectfreelancerDetails;
