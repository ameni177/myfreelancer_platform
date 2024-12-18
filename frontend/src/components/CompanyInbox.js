import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CompanyInbox.css";

const CompanyInbox = () => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null); // State to handle errors
  const companyName = localStorage.getItem("Name"); // Assuming company name is stored in localStorage

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
        setMessages(response.data.messages);
      } else {
        throw new Error(response.data.error || "Failed to fetch messages");
      }
    } catch (err) {
      console.error("Error fetching inbox messages:", err);
      setError("Unable to fetch messages. Please try again later.");
    }
  };

  return (
    <div className="inbox-container">
      <h1>Inbox</h1>
      {error ? (
        <p className="error">{error}</p> // Show error if fetching fails
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li key={message.id} className="inbox-item">
              <p><strong>From:</strong> {message.freelancer_name}</p>
              
              <p><strong>Message:</strong> {message.message}</p>
              <p><em>{new Date(message.created_at).toLocaleString()}</em></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompanyInbox;
