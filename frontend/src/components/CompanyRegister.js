import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";

const poolData = {
  UserPoolId: process.env.REACT_APP_USER_POOL_ID,
  ClientId: process.env.REACT_APP_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

const CompanyRegister = () => {
  const [activeTab, setActiveTab] = useState("register");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmationCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { companyName, email, password } = formData;

    userPool.signUp(
      email,
      password,
      [
        { Name: "email", Value: email },
        { Name: "custom:companyName", Value: companyName },
      ],
      null,
      (err, result) => {
        setLoading(false);
        if (err) {
          setMessage(`Error: ${err.message}`);
          return;
        }
        setMessage("Registration successful! Please check your email for the confirmation code.");
        setIsRegistered(true);
      }
    );
  };

  const handleConfirmRegistration = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { email, confirmationCode } = formData;

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      setLoading(false);
      if (err) {
        setMessage(`Error: ${err.message}`);
        return;
      }
      setMessage("Account confirmed successfully!");
      setFormData({ ...formData, confirmationCode: "" });
      setIsRegistered(false);
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { email, password } = formData;

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        setLoading(false);
        setMessage("Login successful!");
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            setMessage(`Error fetching user attributes: ${err.message}`);
            return;
          }
          const nameAttribute = attributes.find((attr) => attr.Name === "custom:companyName");
          if (nameAttribute) {
            localStorage.setItem("Name", nameAttribute.Value);
          }
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userRole", "company");
          navigate("/company-dashboard");
        });
      },
      onFailure: (err) => {
        setLoading(false);
        setMessage(`Login failed: ${err.message}`);
      },
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        Welcome to Company Registration
      </Typography>
      <Typography variant="body1" textAlign="center" gutterBottom>
        Register or log in to manage your company profile.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        sx={{ marginBottom: 2 }}
      >
        <Tab label="Register" value="register" />
        <Tab label="Login" value="login" />
      </Tabs>

      {message && (
        <Alert severity={message.startsWith("Error") ? "error" : "success"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {activeTab === "register" && !isRegistered && (
        <form onSubmit={handleRegister}>
          <TextField
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>
        </form>
      )}

      {isRegistered && (
        <form onSubmit={handleConfirmRegistration}>
          <TextField
            label="Confirmation Code"
            name="confirmationCode"
            value={formData.confirmationCode}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Confirm Registration"}
          </Button>
        </form>
      )}

      {activeTab === "login" && (
        <form onSubmit={handleLogin}>
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </form>
      )}
    </Box>
  );
};

export default CompanyRegister;
