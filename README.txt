SHAHANAZ PATIENT MANAGEMENT SYSTEM
================================

TECHNOLOGIES
- HTML, CSS, JavaScript
- Node.js and Express
- MySQL and MySQL Workbench

PROJECT SETUP
1. Extract the ZIP file.
2. Open the extracted Shahanaz_Patient_Management folder in VS Code.
3. In MySQL Workbench, open database.sql and execute it.
   NOTE: The sample INSERT statements add four fictional example patients.
   If you already inserted sample data earlier, do not run those INSERT
   statements again. You can run only the CREATE DATABASE / CREATE TABLE
   statements if the database and table do not already exist.
4. In VS Code, open a terminal in the project folder.
5. Run: npm install
6. Copy .env.example and name the copy .env.
7. Open .env and replace YOUR_MYSQL_PASSWORD with your MySQL root password.
   Keep .env private. Do not upload it publicly.
8. Run: npm start
9. Open this address in your browser: http://localhost:3000

FEATURES
- Dashboard with patient totals and gender counts
- Add patient
- View and search patient records
- Update patient
- Delete patient

PATIENT FIELDS
- Patient ID (automatically generated)
- Name
- Email
- Phone
- Gender
- Age
- Problem

TROUBLESHOOTING
- If the database connection fails, confirm MySQL Server is running.
- Check DB_USER, DB_PASSWORD and DB_NAME in .env.
- If npm is not recognized, check that Node.js is installed and restart VS Code.
- Do not open index.html directly. Start the Node server and visit localhost:3000.

IMPORTANT
This is an educational mini-project, not a production-ready medical records
system. Do not enter real patient data. Production use requires authentication,
role-based access, secure hosting, backups, privacy controls and additional
security review.
