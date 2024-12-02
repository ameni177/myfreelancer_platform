// Import React und CSS für Styling
import React from "react";
import "./Home.css";

const HomePage = () => {
  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>SkillMatch</h1>
        <p>Connecting Freelancers and Companies Seamlessly</p>
      </header>

      <div className="tiles-container">
        {/* Freelancer Tile */}
        <div
          className="tile freelancer-tile"
          onClick={() => window.location.href = '/register-freelancer'}
        >
          <h2>Freelancer</h2>
          <p>Create your profile, showcase your skills, and find exciting projects.</p>
        </div>

        {/* Company Tile */}
        <div
          className="tile company-tile"
          onClick={() => window.location.href = '/register-company'}
        >
          <h2>Company</h2>
          <p>Post projects, find skilled freelancers, and manage collaborations easily.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
