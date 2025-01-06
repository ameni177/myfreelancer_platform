import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";

const AboutPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #4e54c8, #8f94fb)",
        color: "white",
        padding: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header Section */}
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        About SkillMatch
      </Typography>
      <Typography variant="h6" align="center" sx={{ maxWidth: "800px", mb: 4 }}>
        SkillMatch is an innovative platform that connects freelancers and companies seamlessly.
        Our mission is to simplify collaborations by promoting trust, transparency, and efficiency
        in the freelance ecosystem.
      </Typography>

      {/* Features Section */}
      <Grid container spacing={4} justifyContent="center">
        {/* Feature 1 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(to bottom, #2575fc, #6a11cb)",
              color: "white",
              borderRadius: 2,
              boxShadow: 3,
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                For Freelancers
              </Typography>
              <Typography>
                Showcase your skills, find exciting projects, and grow your career by working with
                reputable companies.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Feature 2 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(to bottom, #ff7e5f, #feb47b)",
              color: "white",
              borderRadius: 2,
              boxShadow: 3,
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                For Companies
              </Typography>
              <Typography>
                Discover talented freelancers, post projects, and manage your collaborations
                effortlessly.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Feature 3 */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(to bottom, #42e695, #3bb2b8)",
              color: "white",
              borderRadius: 2,
              boxShadow: 3,
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Our Vision
              </Typography>
              <Typography>
                To revolutionize the way companies and freelancers collaborate, fostering an ecosystem
                of trust and productivity.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Team Section */}
      <Box sx={{ mt: 8, textAlign: "center", maxWidth: "800px" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Meet Our Team
        </Typography>
        <Typography variant="body1">
          Our team consists of passionate individuals dedicated to building a platform that bridges
          the gap between freelancers and companies.
        </Typography>
      </Box>
    </Box>
  );
};

export default AboutPage;
