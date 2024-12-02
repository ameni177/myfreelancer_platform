import React from "react";

const CompanyDashboard = () => {
    const Name = localStorage.getItem("Name");
  return (
    <div className="company-dashboard-container">
      <h1>Welcome to your freelancer Dashboard, {Name}!</h1>
      <p>Here you can manage your projects, view reports, and more.</p>
      {/* Add more content as needed */}
    </div>
  );
};

export default CompanyDashboard;
