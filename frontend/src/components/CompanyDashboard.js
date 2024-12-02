import React from "react";

const CompanyDashboard = () => {
    const companyName = localStorage.getItem("companyName");
  return (
    <div className="company-dashboard-container">
      <h1>Welcome to your Company Dashboard, {companyName}!</h1>
      <p>Here you can manage your projects, view reports, and more.</p>
      {/* Add more content as needed */}
    </div>
  );
};

export default CompanyDashboard;
