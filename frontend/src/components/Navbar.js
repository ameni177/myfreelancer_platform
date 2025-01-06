import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  // Prüfen, ob der Benutzer eingeloggt ist
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.clear(); // Lösche Benutzerinformationen
    navigate("/"); // Weiterleitung zur Startseite
  };

  return (
    <AppBar position="static" sx={{ background: "linear-gradient(to right, #4e54c8, #8f94fb)" }}>
      <Toolbar>
        {/* Logo */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="logo"
          sx={{ mr: 2 }}
          component={Link}
          to="/"
        >
          <img
            src="./LOGO1.webp"
            alt="SkillMatch Logo"
            style={{ height: "40px", width: "auto" }}
          />
        </IconButton>

        {/* Navbar Links */}
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          {!isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/register-freelancer">
                Freelancer
              </Button>
              <Button color="inherit" component={Link} to="/register-company">
                Company
              </Button>
              <Button color="inherit" component={Link} to="/about">
                About
              </Button>
              <Button color="inherit" component={Link} to="/contact">
                Contact
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to={userRole === "company" ? "/company-dashboard" : "/freelancer-dashboard"}
              >
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/about">
                About
              </Button>
              <Button color="inherit" component={Link} to="/contact">
                Contact
              </Button>
              {userRole === "company" && (
                <Button color="inherit" component={Link} to="/inbox">
                  Inbox
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
