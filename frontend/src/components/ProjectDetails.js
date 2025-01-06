import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Link,
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProjectDetails();
    fetchApplicants();
    fetchTasks();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/projects/${projectId}`);
      setProject(response.data);
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  };

  const fetchApplicants = async () => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/applications/${projectId}`);
      setApplicants(response.data);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/projects/${projectId}/tasks`);
      setTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleBack = () => {
    navigate("/company-dashboard");
  };

  const handleConfirmApplicant = async (applicationId) => {
    try {
      await axios.put(`http://${backendUrl}:3001/applications/confirm/${applicationId}`);
      setMessage("Applicant confirmed successfully!");
      fetchApplicants();
    } catch (err) {
      setMessage("Error confirming applicant.");
      console.error("Error confirming applicant:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      {project && (
        <Box>
          <Typography variant="h4" gutterBottom>
            Project Details
          </Typography>
          <Typography variant="body1">
            <strong>Name:</strong> {project.name}
          </Typography>
          <Typography variant="body1">
            <strong>Description:</strong> {project.description}
          </Typography>
          <Typography variant="body1">
            <strong>Deadline:</strong> {project.deadline}
          </Typography>
          <Typography variant="body1">
            <strong>Skills:</strong> {project.skills}
          </Typography>
          <Typography variant="body1">
            <strong>Budget/Hour:</strong> ${project.budget}
          </Typography>
          <Typography variant="body1">
            <strong>Progress:</strong> {project.progress}%
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Applicants
          </Typography>
          {applicants.length === 0 ? (
            <Typography>No applicants yet.</Typography>
          ) : (
            <List>
              {applicants.map((applicant) => (
                <ListItem key={applicant.id} divider>
                  <Box>
                    <Typography variant="body1">
                      <strong>Freelancer:</strong> {applicant.freelancer_name}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {applicant.freelancer_email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Phone:</strong> {applicant.freelancer_phone}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Status:</strong> {applicant.status}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Skills:</strong> {applicant.skills}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Message:</strong> {applicant.message_to_company}
                    </Typography>
                    <Typography variant="body1">
                      <strong>CV:</strong>{" "}
                      {applicant.cv_url ? (
                        <Link
                          href={applicant.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View CV
                        </Link>
                      ) : (
                        "No CV available"
                      )}
                    </Typography>

                    {applicant.status !== "confirmed" && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleConfirmApplicant(applicant.id)}
                        sx={{ mt: 1 }}
                      >
                        Confirm Applicant
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" gutterBottom>
            Project Tasks
          </Typography>
          {tasks.length === 0 ? (
            <Typography>No tasks assigned yet.</Typography>
          ) : (
            <List>
              {tasks.map((task) => (
                <ListItem key={task.id} divider>
                  <ListItemText
                    primary={`Task Name: ${task.name}`}
                    secondary={`Description: ${task.description} | Status: ${task.status}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}

      {message && (
        <Alert severity={message.includes("Error") ? "error" : "success"} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default ProjectDetails;
