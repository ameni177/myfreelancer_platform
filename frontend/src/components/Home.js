import React from "react";
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start", // Inhalt nach oben verschieben
        background: "linear-gradient(to right, #4e54c8, #8f94fb)",
        color: "white",
        padding: 4,
        pt: 8, // Zusätzlicher Abstand oben
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h2" fontWeight="bold">
          SkillMatch
        </Typography>
        <Typography variant="h6">
          Connecting Freelancers and Companies Seamlessly
        </Typography>
      </Box>

      {/* Tiles */}
      <Grid container spacing={4} justifyContent="center">
        {/* Freelancer Tile */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              background: "linear-gradient(to bottom, #b4b2b8, #2575fc)",
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
            <CardActionArea onClick={() => navigate("/register-freelancer")}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" align="center">
                  Freelancer
                </Typography>
                <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                  Create your profile, showcase your skills, and find exciting projects.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        {/* Company Tile */}
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
            <CardActionArea onClick={() => navigate("/register-company")}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" align="center">
                  Company
                </Typography>
                <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                  Post projects, find skilled freelancers, and manage collaborations easily.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
