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
import ProjectfreelancerDetails from "./components/projectfreelancerdetails";
import CompanyInbox from "./components/CompanyInbox";
import FreelancerInbox from "./components/FreelancerInbox";
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
        <Route path="/project-details/:projectId" element={<ProjectfreelancerDetails />} />
        <Route path="/inbox" element={<CompanyInbox />} />
        <Route path="/inboxf" element={<FreelancerInbox />} />

      </Routes>
    </Router>
  );
};

export default App;
