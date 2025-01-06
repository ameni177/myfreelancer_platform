import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Modal,
  TextField,
  TextareaAutosize,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FreelancerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [applyProjects, setApplyProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [message, setMessage] = useState("");
  const freelancerName = localStorage.getItem("Name") || "Freelancer";
  const freelancerEmail = localStorage.getItem("Email") || "";
  const freelancerPhone = localStorage.getItem("Phone") || "";

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedcompanyname, setSelectedcompanyname] = useState(null);
  const [selectedprojectname, setSelectedprojectname] = useState(null);
  const [skills, setSkills] = useState("");
  const [messageToCompany, setMessageToCompany] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [availableRes, appliedRes] = await Promise.all([
        axios.get(`http://${backendUrl}:3001/projectsfreelancer`),
        axios.get(`http://${backendUrl}:3001/applications`, {
          params: { freelancerName },
        }),
      ]);

      setProjects(availableRes.data);
      setApplyProjects(appliedRes.data);

      const appliedIds = new Set(appliedRes.data.map((p) => p.id));
      const filtered = availableRes.data.filter((project) => !appliedIds.has(project.id));

      setFilteredProjects(filtered);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleStartWorking = (projectId) => {
    navigate(`/project-details/${projectId}`);
  };

  const handleApply = async () => {
    if (!cvFile) {
      setMessage("Please upload your CV.");
      return;
    }

    const formData = new FormData();
    formData.append("projectId", selectedProjectId);
    formData.append("freelancerName", freelancerName);
    formData.append("freelancerEmail", freelancerEmail);
    formData.append("freelancerPhone", freelancerPhone);
    formData.append("skills", skills);
    formData.append("messageToCompany", messageToCompany);
    formData.append("cv", cvFile);

    try {
      const response = await axios.post(`http://${backendUrl}:3001/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await axios.post(`http://${backendUrl}:3001/inbox/send-message`, {
        companyName: selectedcompanyname,
        freelancerName: freelancerEmail,
        projectId: selectedProjectId,
        message: `Freelancer ${freelancerName} ${freelancerEmail} applied for your project: ${selectedprojectname}`,
      });

      setMessage(response.data.message);
      setShowApplyModal(false);
      fetchData();
    } catch (err) {
      setMessage("Error applying for the project");
      console.error("Error:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {freelancerName}!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Manage your projects and find new opportunities.
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          My Applied Projects
        </Typography>
        <List>
          {applyProjects.length === 0 ? (
            <Typography>No applied projects found.</Typography>
          ) : (
            applyProjects
              .sort((a, b) => (a.status === "confirmed" ? -1 : 1)) // Sort: "confirmed" at the top
              .map((project) => (
                <ListItem key={project.id} divider>
                  <ListItemText
                    primary={
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        {project.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography>
                          <strong>Company:</strong> {project.companyname}
                        </Typography>
                        <Typography>
                          <strong>Description:</strong> {project.description}
                        </Typography>
                        <Typography>
                          <strong>Status:</strong> {project.status}
                        </Typography>
                      </>
                    }
                  />
                  {project.status === "confirmed" && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleStartWorking(project.id)}
                    >
                      Start/Continue Working
                    </Button>
                  )}
                </ListItem>
              ))
          )}
        </List>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Available Projects
        </Typography>
        {message && (
          <Alert severity={message.includes("Error") ? "error" : "success"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <List>
          {filteredProjects.length === 0 ? (
            <Typography>No projects available. Check back later.</Typography>
          ) : (
            filteredProjects.map((project) => (
              <ListItem key={project.id} divider>
                <ListItemText
                  primary={
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "secondary.main" }}
                    >
                      {project.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography>
                        <strong>Company:</strong> {project.companyname}
                      </Typography>
                      <Typography>
                        <strong>Description:</strong> {project.description}
                      </Typography>
                      <Typography>
                        <strong>Deadline:</strong> {project.deadline}
                      </Typography>
                    </>
                  }
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedcompanyname(project.companyname);
                    setSelectedprojectname(project.name);
                    setShowApplyModal(true);
                  }}
                >
                  Apply
                </Button>
              </ListItem>
            ))
          )}
        </List>
      </Box>

      <Modal open={showApplyModal} onClose={() => setShowApplyModal(false)}>
        <Paper sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Apply for Project
          </Typography>
          <TextField
            label="Your Skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextareaAutosize
            minRows={4}
            placeholder="Message to the company"
            value={messageToCompany}
            onChange={(e) => setMessageToCompany(e.target.value)}
            style={{ width: "100%", marginTop: 10, padding: 10 }}
          />
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            Upload CV
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files[0])}
              hidden
            />
          </Button>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" color="primary" onClick={handleApply}>
              Submit
            </Button>
            <Button variant="outlined" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default FreelancerDashboard;
