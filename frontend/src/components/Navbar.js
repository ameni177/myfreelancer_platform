import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

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
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">SkillMatch</Link>
      </div>
      <ul className="navbar-links">
      

        {/* Sichtbare Links basierend auf Authentifizierungsstatus */}
        {!isAuthenticated ? (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/register-freelancer">Freelancer</Link>
            </li>
            <li>
              <Link to="/register-company">Company</Link>
            </li>
            {/* Immer sichtbare Links */}
          <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
          </>
        ) : (
          <>
            <li>
              <Link to={userRole === "company" ? "/company-dashboard" : "/freelancer-dashboard"}>
                Dashboard
              </Link>
            </li>
            {/* Immer sichtbare Links */}
          <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}
          
      </ul>
    </nav>
  );
};

export default Navbar;
