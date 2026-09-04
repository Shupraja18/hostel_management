// =========================================
// WARDEN DASHBOARD
// =========================================

const wardenUser = getUser();

if (!wardenUser || wardenUser.role !== 'warden') {
  window.location.href = '/warden/login.html';
}

// ========================================
// USER
// ========================================

document.getElementById('userName').textContent = wardenUser.name;
document.getElementById('userAvatar').textContent = wardenUser.name.charAt(0).toUpperCase();

// Keep the last fetched list in memory so the status filter can
// re-render instantly without another round trip to the server.
let allComplaints = [];

// ========================================
// LOAD ALL COMPLAINTS
// ========================================

async function loadComplaints() {
  const list = document.getElementById('complaintList');

  list.innerHTML = '<div class="loading"><span class="spinner dark"></span>&nbsp; Loading complaints...</div>';

  try {
    allComplaints = await apiFetch('/complaints');
    updateStats(allComplaints);
    renderComplaints();

  } catch (error) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚠</span>
        <h3>Couldn't load complaints</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;
  }
}

// ========================================
// FILTER + RENDER
// ========================================

function renderComplaints() {
  const list = document.getElementById('complaintList');
  const filter = document.getElementById('statusFilter').value;

  const filtered = filter === 'All'
    ? allComplaints
    : allComplaints.filter(c => c.status === filter);

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📋</span>
        <h3>No complaints</h3>
        <p>${allComplaints.length ? 'No complaints match this filter.' : 'There are currently no student complaints.'}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(createComplaintHTML).join('');
  staggerIn(list.querySelectorAll('.warden-complaint-card'), 0.04);
}

document.getElementById('statusFilter').addEventListener('change', renderComplaints);

// ========================================
// STATS
// ========================================

function updateStats(complaints) {
  document.getElementById('totalComplaints').textContent = complaints.length;

  document.getElementById('pendingComplaints').textContent =
    complaints.filter(c => c.status === 'Pending').length;

  document.getElementById('progressComplaints').textContent =
    complaints.filter(c => c.status === 'In Progress').length;

  document.getElementById('completedComplaints').textContent =
    complaints.filter(c => c.status === 'Completed').length;
}

// ========================================
// COMPLAINT CARD
// ========================================

function createComplaintHTML(c) {
  const student = c.student || {};

  return `
    <div
      class="warden-complaint-card"
      id="complaint-${c._id}"
    >

      <div class="warden-complaint-top">

        <div>

          <h3>
            ${escapeHTML(c.category)}
          </h3>

          <p class="student-info">

            <strong>
              Student:
            </strong>

            ${escapeHTML(student.name || 'Unknown')}

            &nbsp;|&nbsp;

            <strong>
              Room:
            </strong>

            ${escapeHTML(c.room || student.room || '-')}

          </p>

        </div>

        <span class="badge ${getStatusClass(c.status)}">
          ${escapeHTML(c.status)}
        </span>

      </div>


      <div class="complaint-details">

        <p>
          <strong>Priority:</strong>

          <span class="badge ${getPriorityClass(c.priority)}">
            ${escapeHTML(c.priority)}
          </span>
        </p>


        <p class="complaint-description">

          <strong>Description:</strong><br>

          ${escapeHTML(c.description)}

        </p>

      </div>


      <div class="warden-controls">

        <div class="control-group">

          <label>
            Status
          </label>

          <select
            id="status-${c._id}"
          >

            <option
              value="Pending"
              ${c.status === 'Pending' ? 'selected' : ''}
            >
              Pending
            </option>

            <option
              value="In Progress"
              ${c.status === 'In Progress' ? 'selected' : ''}
            >
              In Progress
            </option>

            <option
              value="Completed"
              ${c.status === 'Completed' ? 'selected' : ''}
            >
              Completed
            </option>

          </select>

        </div>


        <div class="control-group">

          <label>
            Message to Student
          </label>

          <textarea
            id="message-${c._id}"
            placeholder="Write an update for the student..."
          >${escapeHTML(c.wardenMessage || '')}</textarea>

        </div>


        <div class="complaint-actions">

          <button
            class="btn btn-primary"
            onclick="updateComplaint('${c._id}')"
          >
            Save Update
          </button>

          <button
            class="btn btn-danger"
            onclick="deleteComplaint('${c._id}')"
          >
            Delete
          </button>

        </div>

      </div>


      <div class="complaint-date">

        Submitted:
        ${new Date(c.createdAt).toLocaleString()}

      </div>

    </div>

  `;
}

// ========================================
// UPDATE
// ========================================

async function updateComplaint(id) {
  const status = document.getElementById(`status-${id}`).value;
  const wardenMessage = document.getElementById(`message-${id}`).value.trim();

  const saveButton = document
    .getElementById(`complaint-${id}`)
    .querySelector('.btn-primary');

  setButtonLoading(saveButton, true, 'Saving...');

  try {
    await apiFetch(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, wardenMessage })
    });

    showToast('Complaint updated successfully.', 'success');
    await loadComplaints();

  } catch (error) {
    showToast(error.message, 'error');
    setButtonLoading(saveButton, false);
  }
}

// ========================================
// DELETE
// ========================================

async function deleteComplaint(id) {
  const confirmed = await confirmModal(
    'This will permanently delete the complaint. This action cannot be undone.',
    { title: 'Delete complaint?', confirmText: 'Delete', cancelText: 'Cancel' }
  );

  if (!confirmed) return;

  try {
    await apiFetch(`/complaints/${id}`, { method: 'DELETE' });
    showToast('Complaint deleted.', 'success');
    await loadComplaints();

  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ========================================
// HELPERS
// ========================================

function getStatusClass(status) {
  if (status === 'Completed') return 'badge-resolved';
  if (status === 'In Progress') return 'badge-progress';
  return 'badge-pending';
}

function getPriorityClass(priority) {
  if (priority === 'High') return 'badge-high';
  if (priority === 'Low') return 'badge-low';
  return 'badge-medium';
}

function escapeHTML(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

// ========================================
// INITIAL LOAD
// ========================================

loadComplaints();
