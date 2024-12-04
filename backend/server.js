const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); 
const multer = require("multer");
const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");// MySQL client
const app = express();
const port = 3001;


// Middleware for CORS (Cross-Origin Resource Sharing)
app.use(cors());
app.use(express.json());

require('dotenv').config()
const upload = multer({ dest: "uploads/" }); // Temp storage for uploaded files

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEYID ,
  region: process.env.REGION,
});


// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST , // Set your DB host (RDS endpoint)
  user: process.env.DB_USER, // Your DB username
  password: process.env.DB_PASSWORD, // Your DB password
  database: process.env.DB_NAME, // Your DB name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// API endpoint to get data from the database by ID
app.get('/projects', (req, res) => {
  // SQL query to fetch all rows from "project" table
  const query = 'SELECT * FROM project';

  // Run the query
  db.execute(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err.stack);
      return res.status(500).json({ message: 'Error fetching data from the database' });
    }

    // Return the fetched data as JSON
    console.log(results)
    return res.json(results);
    
  });
});

app.post('/projects', (req, res) => {
  const { name, description, deadline, skills, budget } = req.body;

  // Validate the input
  if (!name || !description || !deadline || !skills || !budget) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // SQL query to insert a new project into the "project" table
  const query = `INSERT INTO project (name, description, deadline, skills, budget)
                 VALUES (?, ?, ?, ?, ?)`;

  // Run the query with the provided values
  db.execute(query, [name, description, deadline, skills, budget], (err, results) => {
    if (err) {
      console.error('Error inserting data into the database:', err.stack);
      return res.status(500).json({ message: 'Error inserting data into the database' });
    }

    // Send success message and the new project ID
    return res.status(201).json({
      message: 'Project created successfully!',
      projectId: results.insertId, // The ID of the newly inserted project
    });
  });
});


// API endpoint to get applied projects for a specific freelancer
app.get('/applications', (req, res) => {
  const { freelancerName } = req.query;  // Get freelancer name from query

  const query = 'SELECT p.*, a.status FROM applications a JOIN project p ON a.project_id = p.id WHERE a.freelancer_name = ?';

  db.execute(query, [freelancerName], (err, results) => {
    if (err) {
      console.error('Error fetching applied projects:', err.stack);
      return res.status(500).json({ message: 'Error fetching applied projects' });
    }
    res.json(results);  // Return applied projects along with status
  });
});


// Endpoint to apply for a project
app.post("/apply", upload.single("cv"), async (req, res) => {
  const { projectId, freelancerName, skills, messageToCompany } = req.body;
  const cvFile = req.file;

  if (!projectId || !freelancerName || !cvFile) {
    return res
      .status(400)
      .json({ message: "Project ID, Freelancer Name, and CV file are required" });
  }

  // Upload CV to S3 (without ACL since Bucket Owner Enforced is enabled)
  const s3Params = {
    Bucket: "freelancerbucketameni",
    Key: `cv-files/${Date.now()}_${cvFile.originalname}`, // Unique file name in S3
    Body: fs.createReadStream(cvFile.path),
    ContentType: cvFile.mimetype,
  };

  try {
    const s3Response = await s3.upload(s3Params).promise();
    const cvUrl = s3Response.Location; // URL to access the uploaded file

    // Save application details in the database
    const query = `INSERT INTO applications (project_id, freelancer_name, cv_url, skills, message_to_company) 
                   VALUES (?, ?, ?, ?, ?)`;

    db.execute(
      query,
      [projectId, freelancerName, cvUrl, skills, messageToCompany],
      (err, results) => {
        if (err) {
          console.error("Error applying for project:", err);
          return res.status(500).json({ message: "Error applying for project" });
        }

        res.status(200).json({ message: "Successfully applied for the project" });
      }
    );
  } catch (err) {
    console.error("Error uploading CV to S3:", err);
    res.status(500).json({ message: "Error uploading CV to S3" });
  } finally {
    // Clean up the temporary file stored locally
    fs.unlinkSync(cvFile.path);
  }
});
// Endpoint to get applicants for a specific project
app.get('/applications/:projectId', (req, res) => {
  const projectId = req.params.projectId;

  const query = `
    SELECT a.id, a.freelancer_name, a.status , a.skills, a.message_to_company, a.cv_url
    FROM applications a 
    WHERE a.project_id = ?`;

  db.execute(query, [projectId], (err, results) => {
    if (err) {
      console.error("Error fetching applicants:", err);
      return res.status(500).json({ message: 'Error fetching applicants' });
    }
    res.json(results); // Return applicants for the project
  });
});

// Endpoint to confirm an applicant
app.put('/applications/confirm/:applicationId', (req, res) => {
  const applicationId = req.params.applicationId;

  const query = `UPDATE applications SET status = 'confirmed' WHERE id = ?`;

  db.execute(query, [applicationId], (err, results) => {
    if (err) {
      console.error("Error confirming applicant:", err);
      return res.status(500).json({ message: 'Error confirming applicant' });
    }
    res.json({ message: 'Applicant confirmed successfully!' });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
