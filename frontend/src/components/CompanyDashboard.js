import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const companyName = localStorage.getItem("Name") || "Your Company";
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
    navigate(`/projects/${project.id}`);
  };

  const handleConfirmApplicant = async (applicationId) => {
    try {
      await axios.put(`http://${backendUrl}:3001/applications/confirm/${applicationId}`);
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
    const companyName = localStorage.getItem("Name") || "Your Company";
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
      companyName,
    };

    try {
      await axios.post(`http://${backendUrl}:3001/projects`, projectData);
      setMessage("Project created successfully!");
      setNewProject({ name: "", description: "", deadline: "", skills: "", budget: "" });
      fetchProjects();
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
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {companyName}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Create a New Project</Typography>
        <TextField
          label="Project Name"
          name="name"
          value={newProject.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Description"
          name="description"
          value={newProject.description}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <TextField
          label="Deadline"
          name="deadline"
          type="date"
          value={newProject.deadline}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Skills"
          name="skills"
          value={newProject.skills}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Budget (USD)"
          name="budget"
          type="number"
          value={newProject.budget}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleCreateProject} fullWidth>
          Create Project
        </Button>
      </Box>

      <Box>
        <Typography variant="h6">Your Projects</Typography>
        {projects.length === 0 ? (
          <Typography>No projects found. Create one to get started!</Typography>
        ) : (
          <List>
            {projects.map((project) => (
              <ListItem key={project.id} divider>
                <ListItemText
                  primary={project.name}
                  secondary={`Deadline: ${project.deadline}`}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleViewDetails(project)}
                >
                  View Details
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {message && (
        <Alert severity={message.includes("Error") ? "error" : "success"} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      {selectedProject && (
        <Dialog open={!!selectedProject} onClose={closePopup} maxWidth="md" fullWidth>
          <DialogTitle>Project Details</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              <strong>Name:</strong> {selectedProject.name}
            </Typography>
            <Typography variant="body1">
              <strong>Description:</strong> {selectedProject.description}
            </Typography>
            <Typography variant="body1">
              <strong>Deadline:</strong> {selectedProject.deadline}
            </Typography>
            <Typography variant="body1">
              <strong>Skills:</strong> {selectedProject.skills}
            </Typography>
            <Typography variant="body1">
              <strong>Budget:</strong> ${selectedProject.budget}
            </Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Applicants
            </Typography>
            {applicants.length === 0 ? (
              <Typography>No applicants yet.</Typography>
            ) : (
              <List>
                {applicants.map((applicant) => (
                  <ListItem key={applicant.id} divider>
                    <ListItemText
                      primary={`Freelancer: ${applicant.freelancer_name}`}
                      secondary={`Status: ${applicant.status}, Skills: ${applicant.skills}`}
                    />
                    {applicant.status === "awaiting" && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleConfirmApplicant(applicant.id)}
                      >
                        Confirm Applicant
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closePopup} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CompanyDashboard;
