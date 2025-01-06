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
  const companyName = req.query.companyName; // Use companyName instead of companyId

  if (!companyName) {
    return res.status(400).json({ message: 'Company Name is required' });
  }

  const query = 'SELECT * FROM project WHERE companyName = ?';

  db.execute(query, [companyName], (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err.stack);
      return res.status(500).json({ message: 'Error fetching data from the database' });
    }

    return res.json(results);
  });
});
app.get('/projectsfreelancer', (req, res) => {
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

app.get('/projects/:id', (req, res) => {
  const projectId = req.params.id;

  const query = 'SELECT * FROM project WHERE id = ?';

  db.execute(query, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching project by ID:', err.stack);
      return res.status(500).json({ message: 'Error fetching project' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json(results[0]); // Return the first project (assuming ID is unique)
  });
});

app.post('/projects', (req, res) => {
  const { name, description, deadline, skills, budget, companyName } = req.body; // Added companyName here

  if (!name || !description || !deadline || !skills || !budget || !companyName) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = `INSERT INTO project (name, description, deadline, skills, budget, companyName)
                 VALUES (?, ?, ?, ?, ?, ?)`;

  db.execute(query, [name, description, deadline, skills, budget, companyName], (err, results) => {
    if (err) {
      console.error('Error inserting data into the database:', err.stack);
      return res.status(500).json({ message: 'Error inserting data into the database' });
    }

    return res.status(201).json({
      message: 'Project created successfully!',
      projectId: results.insertId,
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
  const { projectId, freelancerName, freelancerEmail, freelancerPhone, skills, messageToCompany } = req.body;
  const cvFile = req.file;

  if (!projectId || !freelancerName || !freelancerEmail || !freelancerPhone || !cvFile) {
    return res.status(400).json({
      message: "Project ID, Freelancer Name, Email, Phone, and CV file are required.",
    });
  }

  const s3Params = {
    Bucket: "freelancerbucketameni",
    Key: `cv-files/${Date.now()}_${cvFile.originalname}`, // Unique file name in S3
    Body: fs.createReadStream(cvFile.path),
    ContentType: cvFile.mimetype,
  };

  try {
    // Upload the file to S3
    const s3Response = await s3.upload(s3Params).promise();
    const cvUrl = s3Response.Location; // URL to access the uploaded file

    // Save the application details in the database
    const query = `
      INSERT INTO applications 
      (project_id, freelancer_name, freelancer_email, freelancer_phone, cv_url, skills, message_to_company) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.execute(
      query,
      [projectId, freelancerName, freelancerEmail, freelancerPhone, cvUrl, skills, messageToCompany],
      (err) => {
        if (err) {
          console.error("Error saving application to the database:", err);
          return res.status(500).json({ message: "Error saving application." });
        }
        res.status(200).json({ message: "Successfully applied for the project." });
      }
    );
  } catch (err) {
    console.error("Error uploading CV to S3:", err);
    res.status(500).json({ message: "Error uploading CV to S3." });
  } finally {
    // Clean up the temporary file stored locally
    fs.unlinkSync(cvFile.path);
  }
});

// Endpoint to get applicants for a specific project
app.get('/applications/:projectId', (req, res) => {
  const projectId = req.params.projectId;

  const query = `
    SELECT a.id, a.freelancer_name,  a.freelancer_email, 
      a.freelancer_phone,  a.status , a.skills, a.message_to_company, a.cv_url
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
// Endpoint to update the progress of a project
app.put('/projects/:id/progress', (req, res) => {
  const projectId = req.params.id;
  const { progress } = req.body; // Get progress from the request body

  if (progress === undefined) {
    return res.status(400).json({ message: "Progress value is required" });
  }

  // Update project progress in the database
  const query = 'UPDATE project SET progress = ? WHERE id = ?';

  db.execute(query, [progress, projectId], (err, results) => {
    if (err) {
      console.error('Error updating progress:', err.stack);
      return res.status(500).json({ message: 'Error updating progress' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json({ message: 'Progress updated successfully!' });
  });
});

// Get all tasks for a specific project
app.get('/projects/:id/tasks', (req, res) => {
  const projectId = req.params.id;

  const query = 'SELECT * FROM tasks WHERE project_id = ?';

  db.execute(query, [projectId], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ message: 'Error fetching tasks' });
    }

    res.json(results);
  });
});

// Create a new task for a project
app.post('/projects/:id/tasks', (req, res) => {
  const projectId = req.params.id;
  const { name, description, status } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Task name is required' });
  }

  const query = `
    INSERT INTO tasks (project_id, name, description, status)
    VALUES (?, ?, ?, ?)
  `;

  db.execute(query, [projectId, name, description, status || 'pending'], (err, results) => {
    if (err) {
      console.error('Error creating task:', err);
      return res.status(500).json({ message: 'Error creating task' });
    }

    res.status(201).json({ message: 'Task created successfully!', taskId: results.insertId });
  });
});
// Update task status
app.put('/tasks/:taskId/status', (req, res) => {
  const taskId = req.params.taskId;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const query = 'UPDATE tasks SET status = ? WHERE id = ?';

  db.execute(query, [status, taskId], (err, results) => {
    if (err) {
      console.error('Error updating task status:', err);
      return res.status(500).json({ message: 'Error updating task status' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task status updated successfully!' });
  });
});
// Delete a task
app.delete('/tasks/:taskId', (req, res) => {
  const taskId = req.params.taskId;

  const query = 'DELETE FROM tasks WHERE id = ?';

  db.execute(query, [taskId], (err, results) => {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ message: 'Error deleting task' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully!' });
  });
});

// POST /inbox/send-message
app.post("/inbox/send-message", async (req, res) => {
  const { companyName, freelancerName, projectId, message } = req.body;

  try {
      await db.query(
          "INSERT INTO inbox (company_name, freelancer_name, project_id, message) VALUES (?, ?, ?, ?)",
          [companyName, freelancerName, projectId, message]
      );

      res.status(200).json({ success: true, message: "Message sent to company inbox" });
  } catch (err) {
      console.error("Error sending message to inbox:", err);
      res.status(500).json({ success: false, error: "Failed to send message to inbox" });
  }
});
// GET /inbox/company-messages
app.get("/inbox/company-messages", (req, res) => {
  const { companyName } = req.query;

  // Check if companyName is provided
  if (!companyName) {
    return res.status(400).json({ success: false, message: 'Company Name is required' });
  }

  const query = "SELECT * FROM inbox WHERE company_name = ? ORDER BY created_at DESC";

  // Execute the query with db.execute instead of await
  db.execute(query, [companyName], (err, results) => {
    if (err) {
      console.error("Error fetching company inbox messages:", err);
      return res.status(500).json({ success: false, error: "Failed to fetch inbox messages" });
    }

    return res.status(200).json({ success: true, messages: results });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
