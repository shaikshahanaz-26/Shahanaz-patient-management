CREATE DATABASE IF NOT EXISTS shahanaz_patient_management;
USE shahanaz_patient_management;

CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    age INT NOT NULL,
    problem TEXT NOT NULL
);

-- Optional sample records. Run this INSERT section only once.
INSERT INTO patients (name, email, phone, gender, age, problem)
VALUES
('Ayesha Khan', 'ayesha@example.com', '9876543210', 'Female', 25, 'Fever'),
('Rahul Sharma', 'rahul@example.com', '9876543211', 'Male', 32, 'Headache'),
('Fatima Noor', 'fatima@example.com', '9876543212', 'Female', 28, 'Migraine'),
('Arjun Kumar', 'arjun@example.com', '9876543213', 'Male', 40, 'Back Pain');

SELECT * FROM patients;
