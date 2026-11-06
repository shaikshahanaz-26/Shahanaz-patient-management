let patients = [];
let editingPatientId = null;

const form = document.getElementById("patientForm");

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric"
    });

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Something went wrong");
    return data;
}

function showSection(sectionId) {
    document.querySelectorAll("main section").forEach(section => section.classList.add("hidden"));
    document.getElementById(sectionId).classList.remove("hidden");

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + sectionId);
    });

    if (sectionId === "patients" || sectionId === "dashboard") loadPatients();
}

async function loadStats() {
    try {
        const stats = await apiRequest("/api/stats");
        document.getElementById("totalPatients").textContent = stats.total || 0;
        document.getElementById("malePatients").textContent = stats.male || 0;
        document.getElementById("femalePatients").textContent = stats.female || 0;
    } catch (error) {
        showToast(error.message);
    }
}

async function loadPatients() {
    try {
        patients = await apiRequest("/api/patients");
        renderPatients();
        renderRecentPatients();
        await loadStats();
    } catch (error) {
        showToast(error.message);
    }
}

function renderPatients() {
    const table = document.getElementById("patientTable");
    const search = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();

    const filtered = patients.filter(patient =>
        [patient.patient_id, patient.name, patient.email, patient.phone,
         patient.gender, patient.age, patient.problem]
        .some(value => String(value ?? "").toLowerCase().includes(search))
    );

    if (!filtered.length) {
        table.innerHTML = '<tr><td colspan="8" style="text-align:center">No patient records found.</td></tr>';
        return;
    }

    table.innerHTML = filtered.map(patient => `
        <tr>
            <td><span class="id-badge">#${patient.patient_id}</span></td>
            <td class="patient-name">${escapeHTML(patient.name)}</td>
            <td>${escapeHTML(patient.email)}</td>
            <td>${escapeHTML(patient.phone)}</td>
            <td>${escapeHTML(patient.gender)}</td>
            <td>${escapeHTML(patient.age)}</td>
            <td>${escapeHTML(patient.problem)}</td>
            <td>
                <button class="action-btn" onclick="editPatient(${patient.patient_id})" title="Edit" aria-label="Edit patient">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="action-btn delete" onclick="deletePatient(${patient.patient_id})" title="Delete" aria-label="Delete patient">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

function renderRecentPatients() {
    const table = document.getElementById("recentPatients");
    const recent = patients.slice(0, 5);

    if (!recent.length) {
        table.innerHTML = '<tr><td colspan="6">No patient records available.</td></tr>';
        return;
    }

    table.innerHTML = recent.map(patient => `
        <tr>
            <td><span class="id-badge">#${patient.patient_id}</span></td>
            <td class="patient-name">${escapeHTML(patient.name)}</td>
            <td>${escapeHTML(patient.phone)}</td>
            <td>${escapeHTML(patient.gender)}</td>
            <td>${escapeHTML(patient.age)}</td>
            <td>${escapeHTML(patient.problem)}</td>
        </tr>
    `).join("");
}

function resetForm() {
    form.reset();
    editingPatientId = null;
    document.getElementById("formTitle").textContent = "Add New Patient";
    document.getElementById("submitText").textContent = "Save Patient";
}

function editPatient(id) {
    const patient = patients.find(item => item.patient_id === id);
    if (!patient) return showToast("Patient not found.");

    editingPatientId = id;
    document.getElementById("name").value = patient.name;
    document.getElementById("email").value = patient.email;
    document.getElementById("phone").value = patient.phone;
    document.getElementById("gender").value = patient.gender;
    document.getElementById("age").value = patient.age;
    document.getElementById("problem").value = patient.problem;
    document.getElementById("formTitle").textContent = "Update Patient Details";
    document.getElementById("submitText").textContent = "Update Patient";
    showSection("add-patient");
}

async function deletePatient(id) {
    const patient = patients.find(item => item.patient_id === id);
    if (!patient) return;

    if (!confirm(`Are you sure you want to delete ${patient.name}'s record?`)) return;

    try {
        const result = await apiRequest(`/api/patients/${id}`, { method: "DELETE" });
        showToast(result.message);
        await loadPatients();
    } catch (error) {
        showToast(error.message);
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const patientData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        gender: document.getElementById("gender").value,
        age: Number(document.getElementById("age").value),
        problem: document.getElementById("problem").value.trim()
    };

    const url = editingPatientId ? `/api/patients/${editingPatientId}` : "/api/patients";
    const method = editingPatientId ? "PUT" : "POST";

    try {
        const result = await apiRequest(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patientData)
        });

        showToast(result.message);
        resetForm();
        await loadPatients();
        showSection("patients");
    } catch (error) {
        showToast(error.message);
    }
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showSection(link.getAttribute("href").substring(1));
    });
});

loadPatients();
