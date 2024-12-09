import React, { useState } from "react";
import "./CompanyRegister.css";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";

const poolData = {
  UserPoolIdcomp: process.env.REACT_APP_USER_POOL_ID, 
  ClientIdcomp: process.env.REACT_APP_CLIENT_ID,
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

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { companyName, email, password } = formData;

    userPool.signUp(
      email,
      password,
      [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "custom:companyName",
          Value: companyName,
        },
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

    cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
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
        navigate("/company-dashboard");
      },
      onFailure: (err) => {
        setLoading(false);
        setMessage(`Login failed: ${err.message}`);
      },
    });
  };

  return (
    <div className="company-register-container">
      <h1>Welcome to Company Registration</h1>
      <p>Register or log in to manage your company profile.</p>

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

      <div className="tab-content">
        {message && <p className={`message ${message.startsWith("Error") ? "error" : ""}`}>{message}</p>}

        {activeTab === "register" && !isRegistered && (
          <form className="form-container" onSubmit={handleRegister}>
            <h2>Register Your Company</h2>
            <div className="form-group">
              <label htmlFor="companyName">Company Name:</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
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

export default CompanyRegister;
