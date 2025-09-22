document.addEventListener("DOMContentLoaded", () => {
    // --- SETUP & DATA ---
    const STORAGE_COMPLAINTS = "citycare_complaints_v1";
    let complaints = JSON.parse(localStorage.getItem(STORAGE_COMPLAINTS) || "[]");
    const loggedInUser = JSON.parse(localStorage.getItem("citycare_loggedIn"));
    const el = id => document.getElementById(id);

    // --- AUTHENTICATION ---
    if (!loggedInUser) {
        alert("You must be logged in to view this page.");
        window.location.href = "auth.html";
        return;
    }

    el("greetUser").textContent = `Welcome, ${loggedInUser.fname}`;

    el("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("citycare_loggedIn");
        window.location.href = "auth.html";
    });

    // --- ROLE-BASED ACCESS CONTROL (MODIFICATION) ---
    // Hide the "All Complaints" button if the user is not an authority.
    if (loggedInUser.role !== 'authority') {
        const allComplaintsBtn = el("complaintsBtn");
        if (allComplaintsBtn) {
            allComplaintsBtn.style.display = 'none';
        }
    }
    // --- END OF MODIFICATION ---

    // --- PAGE NAVIGATION ---
    const sections = {
        homeBtn: "homeSection",
        complaintsBtn: "allComplaintsSection", // This shows all complaints
        complaintCard: "complaintSection",     // This shows the form to create one
        numComplaintsCard: "numComplaintsSection",
        resolvedCard: "resolvedPersonsSection"
    };

    const showSection = (sectionId) => {
        document.querySelectorAll('.section-content').forEach(s => s.classList.add('hidden'));
        const sectionToShow = el(sectionId);
        if(sectionToShow) {
            sectionToShow.classList.remove('hidden');
            // If showing all complaints section, render the list
            if (sectionId === 'allComplaintsSection') {
                renderComplaintsList();
            }
        }
    };
    
    Object.keys(sections).forEach(elementId => {
        const element = el(elementId);
        if (element) {
            element.addEventListener("click", () => showSection(sections[elementId]));
        }
    });
    el("dashboardBtn").addEventListener("click", () => window.location.href = 'dashboard.html');

    // --- COMPLAINT FORM SUBMISSION ---
    el("complaintForm")?.addEventListener("submit", e => {
        e.preventDefault();
        const imageFile = el("image").files[0];

        complaints.push({
            id: "c_" + Date.now(),
            title: el("title").value.trim(),
            desc: el("description").value.trim(),
            category: el("category").value,
            constituency: el("constituency").value,
            location: el("location").value.trim(),
            image: imageFile ? imageFile.name : null,
            contact: el("contact").value.trim(),
            status: "Pending",
            createdAt: new Date().toISOString(),
            createdBy: loggedInUser.fname
        });

        localStorage.setItem(STORAGE_COMPLAINTS, JSON.stringify(complaints));
        alert("Complaint submitted successfully!");
        el("complaintForm").reset();
        renderAll();
        showSection("homeSection");
    });
    
    // --- RENDERING LOGIC ---
    function renderComplaintsList() {
        const container = el("complaintsList");
        if (!container) return;

        if (complaints.length === 0) {
            container.innerHTML = "<p>No complaints submitted yet.</p>";
            return;
        }

        container.innerHTML = complaints.map(c => `
            <div class="complaint-item">
                <div class="complaint-header">
                    <h3>${c.title}</h3>
                    <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span>
                </div>
                <div class="complaint-details">
                    <p><strong>Category:</strong> ${c.category}</p>
                    <p><strong>Constituency:</strong> ${c.constituency}</p>
                    <p><strong>Location:</strong> ${c.location}</p>
                    <p><strong>Description:</strong> ${c.desc}</p>
                    ${c.contact ? `<p><strong>Contact:</strong> ${c.contact}</p>` : ''}
                    ${c.image ? `<p><strong>Image:</strong> ${c.image}</p>` : ''}
                </div>
                <div class="complaint-footer">
                    <small>Submitted on: ${new Date(c.createdAt).toLocaleString()}</small>
                    <small>By: ${c.createdBy}</small>
                </div>
            </div>
        `).join('');
    }

    const renderAll = () => {
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === "Pending").length;
        
        el("totalComplaintsBadge").innerText = `Total: ${total}`;
        el("pendingBadge").innerText = `Pending: ${pending}`;
        el("resolvedBadge").innerText = `Resolved: ${total - pending}`;
        
        const countElements = [el("complaintsCount"), el("complaintCount")];
        countElements.forEach(elem => {
            if(elem) elem.innerText = total;
        });
    };

    renderAll(); // Initial render
});
