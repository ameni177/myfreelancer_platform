import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Modal,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const CompanyInbox = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [error, setError] = useState(null);
  const companyName = localStorage.getItem("Name");

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchInboxMessages();
  }, []);

  const fetchInboxMessages = async () => {
    try {
      const response = await axios.get(`http://${backendUrl}:3001/inbox/company-messages`, {
        params: { companyName },
      });

      if (response.data.success) {
        const messagesWithReadStatus = response.data.messages.map((msg) => ({
          ...msg,
          read: msg.read || false, // Default to false if not present
        }));
        setMessages(messagesWithReadStatus);
      } else {
        throw new Error(response.data.error || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("Error fetching inbox messages:", err);
      setError("Unable to fetch messages. Please try again later.");
    }
  };

  const openMessagePopup = (message) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === message.id ? { ...msg, read: true } : msg
      )
    );
    setSelectedMessage(message);
    markMessageAsRead(message.id);
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await axios.put(`http://${backendUrl}:3001/inbox/mark-read`, { messageId });
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const closeMessagePopup = () => {
    setSelectedMessage(null);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom>
        Inbox
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : messages.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading messages...
          </Typography>
        </Box>
      ) : (
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                backgroundColor: message.read ? "grey.200" : "white",
                mb: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
                boxShadow: 1,
                cursor: "pointer",
              }}
              onClick={() => openMessagePopup(message)}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: message.read ? "text.secondary" : "text.primary" }}
                  >
                    From: {message.freelancer_name}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography>
                      {message.message.slice(0, 30)}...
                    </Typography>
                    <Typography variant="caption" display="block">
                      {new Date(message.created_at).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Modal open={!!selectedMessage} onClose={closeMessagePopup}>
        <Paper sx={{ maxWidth: 500, mx: "auto", mt: 10, p: 3 }}>
          {selectedMessage && (
            <>
              <Typography variant="h5" gutterBottom>
                Message Details
              </Typography>
              <Typography variant="body1">
                <strong>From:</strong> {selectedMessage.freelancer_name}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Message:</strong> {selectedMessage.message}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 2, color: "text.secondary" }}>
                {new Date(selectedMessage.created_at).toLocaleString()}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={closeMessagePopup}
                sx={{ mt: 3 }}
              >
                Close
              </Button>
            </>
          )}
        </Paper>
      </Modal>
    </Box>
  );
};

export default CompanyInbox;
