import React, { useState } from "react";
import "./FreelancerRegister.css";
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
      //setFormData({ ...formData, confirmationCode: "" });
      localStorage.setItem("Name", formData.firstName)
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
        alert("Login successful!");
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            setLoading(false);
            setMessage(`Error fetching user attributes: ${err.message}`);
            return;
          }
          const NameAttribute = attributes.find(attribute => attribute.Name === "given_name");
          if (NameAttribute) {
            localStorage.setItem("Name", NameAttribute.Value);
          }
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userRole", "freeancer");
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
    <div className="freelancer-register-container">
      <h1>Welcome to Freelancer Portal</h1>
      <p>Here you can register to become a freelancer or log in to your existing account.</p>
      
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === "register" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
        <button
          className={`tab ${activeTab === "login" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
      </div>

      <div className="tabs-text">
        {activeTab === "register" && !isRegistered && (
          <p>Please fill out the registration form below to create your account.</p>
        )}
        {isRegistered && (
          <p>We've sent a confirmation code to your email. Please enter it below.</p>
        )}
        {activeTab === "login" && (
          <p>If you already have an account, enter your credentials to log in.</p>
        )}
      </div>

      <div className="tab-content">
        {message && <p className={`message ${message.startsWith("Error") ? "error" : ""}`}>{message}</p>}

        {activeTab === "register" && !isRegistered && (
          <form className="form-container" onSubmit={handleRegister}>
            <h2>Register as a Freelancer</h2>
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="telephone">Telephone:</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Enter your telephone number"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter a password"
                required
              />
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        {isRegistered && (
          <form className="form-container" onSubmit={handleConfirmRegistration}>
            <h2>Enter the Verification Code</h2>
            <div className="form-group">
              <label htmlFor="confirmationCode">Confirmation Code:</label>
              <input
                type="text"
                id="confirmationCode"
                name="confirmationCode"
                value={formData.confirmationCode}
                onChange={handleChange}
                placeholder="Enter the code sent to your email"
                required
              />
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Confirming..." : "Confirm Registration"}
            </button>
          </form>
        )}

        {activeTab === "login" && (
          <form className="form-container" onSubmit={handleLogin}>
            <h2>Login to Your Account</h2>
            <div className="form-group">
              <label htmlFor="email">Email Address:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FreelancerRegister;
