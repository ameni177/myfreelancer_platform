import React, { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Alert, Snackbar } from "@mui/material";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setError(true);
      return;
    }

    // Simulate sending a message (you can replace this with an API call)
    setSuccess(true);
    setFormData({ name: "", email: "", message: "" }); // Reset form
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #4e54c8, #8f94fb)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
      }}
    >
      {/* Header Section */}
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="h6" align="center" sx={{ maxWidth: "800px", mb: 4 }}>
        Have questions or need assistance? Feel free to reach out to us by filling out the form below.
      </Typography>

      {/* Contact Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          background: "white",
          color: "black",
          borderRadius: 2,
          boxShadow: 3,
          padding: 4,
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <Grid container spacing={2}>
          {/* Name Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Your Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>

          {/* Email Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Your Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>

          {/* Message Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Your Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
              required
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                background: "linear-gradient(to right, #4e54c8, #8f94fb)",
                "&:hover": { background: "linear-gradient(to right, #8f94fb, #4e54c8)" },
              }}
            >
              Send Message
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar for Success */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Your message has been sent successfully!
        </Alert>
      </Snackbar>

      {/* Snackbar for Error */}
      <Snackbar
        open={error}
        autoHideDuration={6000}
        onClose={() => setError(false)}
      >
        <Alert
          onClose={() => setError(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          Please fill out all fields before submitting.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactPage;
