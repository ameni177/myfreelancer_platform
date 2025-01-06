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
  UserPoolId: process.env.REACT_APP_USER_POOL_ID_FREELANCER,
  ClientId: process.env.REACT_APP_CLIENT_ID_FREELANCER,
};

const userPool = new CognitoUserPool(poolData);

const FreelancerRegister = () => {
  const [activeTab, setActiveTab] = useState("register");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    telephone: "",
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
    const { firstName, lastName, email, password, telephone } = formData;

    userPool.signUp(
      email,
      password,
      [
        { Name: "email", Value: email },
        { Name: "given_name", Value: firstName },
        { Name: "family_name", Value: lastName },
        { Name: "phone_number", Value: telephone },
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
      localStorage.setItem("Name", formData.firstName);
      navigate("/freelancer-dashboard");
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
            setLoading(false);
            setMessage(`Error fetching user attributes: ${err.message}`);
            return;
          }
          const nameAttribute = attributes.find((attr) => attr.Name === "given_name");
          const emailAttribute = attributes.find((attr) => attr.Name === "email");
          const phoneAttribute = attributes.find((attr) => attr.Name === "phone_number");
          if (nameAttribute) {
            localStorage.setItem("Name", nameAttribute.Value);
            localStorage.setItem("Email", emailAttribute.Value);
            localStorage.setItem("Phone", phoneAttribute.Value);
          }
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userRole", "freelancer");
          navigate("/freelancer-dashboard");
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
        Welcome to Freelancer Portal
      </Typography>
      <Typography variant="body1" textAlign="center" gutterBottom>
        Here you can register to become a freelancer or log in to your existing account.
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ marginBottom: 2 }}>
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
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Telephone"
            name="telephone"
            type="tel"
            value={formData.telephone}
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

export default FreelancerRegister;
