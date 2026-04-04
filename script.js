// script.js

const apiBase = "/api/complaints";

// ── Elements ─────────────────────────────────────────────
const complaintForm = document.getElementById("complaintForm");
const tableBody = document.getElementById("tableBody");
const emptyRow = document.getElementById("emptyRow");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const progressCount = document.getElementById("progressCount");
const resolvedCount = document.getElementById("resolvedCount");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

const toast = document.getElementById("toast");

// ── Utility ─────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// ── Stats ───────────────────────────────────────────────
function updateStats(complaints) {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;

  totalCount.textContent = total;
  pendingCount.textContent = pending;
  progressCount.textContent = inProgress;
  resolvedCount.textContent = resolved;
}

// ── Fetch & Render Complaints ──────────────────────────
async function fetchComplaints() {
  const res = await fetch(apiBase);
  let complaints = await res.json();

  // Apply search filter
  const search = searchInput.value.toLowerCase();
  if (search) {
    complaints = complaints.filter(
      c => c.student.toLowerCase().includes(search) || c.room.toLowerCase().includes(search) || c.category.toLowerCase().includes(search)
    );
  }

  // Apply status filter
  const statusFilter = filterStatus.value;
  if (statusFilter !== "All") {
    complaints = complaints.filter(c => c.status === statusFilter);
  }

  tableBody.innerHTML = "";
  if (complaints.length === 0) {
    tableBody.appendChild(emptyRow);
  } else {
    complaints.forEach(comp => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${comp.student} / ${comp.room}</td>
        <td>${comp.category}</td>
        <td>${comp.priority}</td>
        <td>
          <select class="status-select">
            <option value="Pending" ${comp.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="In Progress" ${comp.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Resolved" ${comp.status === "Resolved" ? "selected" : ""}>Resolved</option>
          </select>
        </td>
        <td>${comp.time}</td>
        <td>
          <button class="delete-btn">Delete</button>
        </td>
      `;

      // Delete functionality
      tr.querySelector(".delete-btn").addEventListener("click", async () => {
        await fetch(`${apiBase}/${comp._id}`, { method: "DELETE" });
        showToast("Complaint deleted!");
        fetchComplaints();
      });

      // Status change
      tr.querySelector(".status-select").addEventListener("change", async (e) => {
        const newStatus = e.target.value;
        await fetch(`${apiBase}/${comp._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
        showToast("Status updated!");
        fetchComplaints();
      });

      tableBody.appendChild(tr);
    });
  }

  updateStats(complaints);
}

// ── Form Submission ───────────────────────────────────
complaintForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const student = document.getElementById("guestName").value.trim();
  const room = document.getElementById("roomNo").value.trim();
  const category = document.getElementById("category").value;
  const priority = document.querySelector('input[name="priority"]:checked').value;
  const description = document.getElementById("description").value.trim();

  if (!student || !room || !category || !description) {
    showToast("Please fill all fields!");
    return;
  }

  await fetch(apiBase, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student, room, category, priority, description })
  });

  showToast("Complaint submitted!");
  complaintForm.reset();
  fetchComplaints();
});

// ── Search & Filter ───────────────────────────────────
searchInput.addEventListener("input", fetchComplaints);
filterStatus.addEventListener("change", fetchComplaints);

// ── Live Clock ───────────────────────────────────────
const liveClock = document.getElementById("liveClock");
setInterval(() => {
  const now = new Date();
  liveClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}, 1000);

// ── Initial fetch ───────────────────────────────────
fetchComplaints();