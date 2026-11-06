const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "shahanaz_patient_db",
    waitForConnections: true,
    connectionLimit: 10
});

// Check database connection when the server starts.
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("MySQL database connected successfully.");
        connection.release();
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    }
})();

// Dashboard statistics
app.get("/api/stats", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(gender = 'Male'), 0) AS male,
                COALESCE(SUM(gender = 'Female'), 0) AS female
            FROM patients
        `);
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to load statistics. Check the database connection." });
    }
});

// Get all patients
app.get("/api/patients", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM patients ORDER BY patient_id DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to fetch patients. Check the database connection." });
    }
});

function validatePatient(body) {
    const { name, email, phone, gender, age, problem } = body;
    const validGenders = ["Male", "Female", "Other"];

    return Boolean(
        typeof name === "string" && name.trim() &&
        typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
        typeof phone === "string" && /^[0-9+\-\s()]{7,15}$/.test(phone.trim()) &&
        validGenders.includes(gender) &&
        Number.isInteger(Number(age)) && Number(age) >= 1 && Number(age) <= 120 &&
        typeof problem === "string" && problem.trim()
    );
}

// Add patient
app.post("/api/patients", async (req, res) => {
    try {
        if (!validatePatient(req.body)) {
            return res.status(400).json({ message: "Please enter valid details in all fields." });
        }

        const { name, email, phone, gender, age, problem } = req.body;
        const [result] = await pool.execute(
            `INSERT INTO patients (name, email, phone, gender, age, problem)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name.trim(), email.trim(), phone.trim(), gender, Number(age), problem.trim()]
        );

        res.status(201).json({
            message: "Patient added successfully!",
            patient_id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to add patient." });
    }
});

// Update patient
app.put("/api/patients/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1 || !validatePatient(req.body)) {
            return res.status(400).json({ message: "Please enter valid details." });
        }

        const { name, email, phone, gender, age, problem } = req.body;
        const [result] = await pool.execute(
            `UPDATE patients
             SET name = ?, email = ?, phone = ?, gender = ?, age = ?, problem = ?
             WHERE patient_id = ?`,
            [name.trim(), email.trim(), phone.trim(), gender, Number(age), problem.trim(), id]
        );

        if (result.affectedRows === 0) {
            const [existing] = await pool.execute(
                "SELECT patient_id FROM patients WHERE patient_id = ?",
                [id]
            );
            if (existing.length === 0) {
                return res.status(404).json({ message: "Patient not found." });
            }
        }

        res.json({ message: "Patient updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to update patient." });
    }
});

// Delete patient
app.delete("/api/patients/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ message: "Invalid patient ID." });
        }

        const [result] = await pool.execute(
            "DELETE FROM patients WHERE patient_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found." });
        }

        res.json({ message: "Patient deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to delete patient." });
    }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Shahanaz Patient Management System running at http://localhost:${PORT}`);
});
