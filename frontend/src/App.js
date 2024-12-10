import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import FreelancerRegister from "./components/FreelancerRegister";
import CompanyRegister from "./components/CompanyRegister";
import AboutPage from "./components/AboutPage";
import ContactPage from ".//components/ContactPage";
import CompanyDashboard from "./components/CompanyDashboard";
import FreelancerDashboard from "./components/FreelancerDashboard";
import ProjectDetails from "./components/ProjectDetails";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register-freelancer" element={<FreelancerRegister />} />
        <Route path="/register-company" element={<CompanyRegister />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/freelancer-dashboard" element={< FreelancerDashboard/>} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
