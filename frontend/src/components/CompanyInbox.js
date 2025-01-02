import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CompanyInbox.css";

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
        // Add a 'read' property to each message (default to false if not provided)
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
    // Mark the message as read
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === message.id ? { ...msg, read: true } : msg
      )
    );
    setSelectedMessage(message);

    // Optional: Persist read status in the backend
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
    <div className="inbox-container">
      <h1>Inbox</h1>
      {error ? (
        <p className="error">{error}</p>
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li
              key={message.id}
              className={`inbox-item ${message.read ? "read" : "unread"}`}
              onClick={() => openMessagePopup(message)}
            >
              <p>
                <strong>From:</strong> {message.freelancer_name}
              </p>
              <p>
                <strong>Message:</strong> {message.message.slice(0, 30)}... {/* Show a preview */}
              </p>
              <p>
                <em>{new Date(message.created_at).toLocaleString()}</em>
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Popup Modal */}
      {selectedMessage && (
        <div className="popup-overlay" onClick={closeMessagePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeMessagePopup}>
              &times;
            </button>
            <h2>Message Details</h2>
            <p>
              <strong>From:</strong> {selectedMessage.freelancer_name}
            </p>
            <p>
              <strong>Message:</strong> {selectedMessage.message}
            </p>
            <p>
              <em>{new Date(selectedMessage.created_at).toLocaleString()}</em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyInbox;
