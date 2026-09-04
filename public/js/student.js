// =========================================
// STUDENT DASHBOARD
// =========================================

const studentUser = getUser();

if (!studentUser || studentUser.role !== 'student') {
  window.location.href = '/student/login.html';
}

// ========================================
// USER INFO
// ========================================

document.getElementById('studentName').textContent = studentUser.name;
document.getElementById('infoName').textContent = studentUser.name;
document.getElementById('infoEmail').textContent = studentUser.email;
document.getElementById('infoRoom').textContent = studentUser.room || '-';
document.getElementById('infoPhone').textContent = studentUser.phone || '-';

// ========================================
// COMPLAINT FORM TOGGLE
// ========================================

function showComplaintForm() {
  document.getElementById('complaintFormSection').classList.remove('hidden');
  document.getElementById('complaintFormSection')
    .scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('category').focus();
}

function hideComplaintForm() {
  document.getElementById('complaintFormSection').classList.add('hidden');
  document.getElementById('complaintForm').reset();
  clearFormMessage();
}

function setFormMessage(message, isError) {
  const el = document.getElementById('formMessage');
  el.textContent = message;
  el.style.color = isError ? 'var(--red)' : 'var(--green)';
}

function clearFormMessage() {
  document.getElementById('formMessage').textContent = '';
}

// ========================================
// LOAD COMPLAINTS
// ========================================

async function loadComplaints() {
  const container = document.getElementById('complaintsContainer');

  container.innerHTML = '<div class="loading"><span class="spinner dark"></span>&nbsp; Loading complaints...</div>';

  try {
    const complaints = await apiFetch('/complaints/my');

    updateStats(complaints);

    if (!complaints.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <h3>No complaints yet</h3>
          <p>You haven't submitted any complaints. Use "New Complaint" to report an issue.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = complaints.map(createComplaintHTML).join('');
    staggerIn(container.querySelectorAll('.complaint-card'));

  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚠</span>
        <h3>Couldn't load complaints</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;
  }
}

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
  let statusClass = 'badge-pending';
  if (c.status === 'In Progress') statusClass = 'badge-progress';
  if (c.status === 'Completed') statusClass = 'badge-resolved';

  let priorityClass = 'badge-medium';
  if (c.priority === 'High') priorityClass = 'badge-high';
  if (c.priority === 'Low') priorityClass = 'badge-low';

  const messageHTML = c.wardenMessage
    ? `
      <div class="warden-note">
        <strong>Warden Update</strong>
        <p>${escapeHTML(c.wardenMessage)}</p>
      </div>
    `
    : '';

  return `
    <div class="complaint-card">
      <div class="complaint-top">
        <div>
          <div class="complaint-title">${escapeHTML(c.category)}</div>
          <small>Room ${escapeHTML(c.room)}</small>
        </div>
        <span class="badge ${statusClass}">${escapeHTML(c.status)}</span>
      </div>

      <div class="complaint-meta">
        <span class="badge ${priorityClass}">${escapeHTML(c.priority)} Priority</span>
      </div>

      <p class="complaint-description">${escapeHTML(c.description)}</p>

      ${messageHTML}

      <small class="complaint-date">
        Submitted: ${new Date(c.createdAt).toLocaleString()}
      </small>
    </div>
  `;
}

// ========================================
// SUBMIT COMPLAINT
// ========================================

document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  clearFormMessage();

  const button = e.target.querySelector('button[type="submit"]');
  setButtonLoading(button, true, 'Submitting...');

  try {
    await apiFetch('/complaints', {
      method: 'POST',
      body: JSON.stringify({
        category: document.getElementById('category').value,
        priority: document.getElementById('priority').value,
        description: document.getElementById('description').value
      })
    });

    e.target.reset();
    showToast('Complaint submitted successfully.', 'success');
    hideComplaintForm();
    await loadComplaints();

  } catch (error) {
    setFormMessage(error.message, true);
    showToast(error.message, 'error');

  } finally {
    setButtonLoading(button, false);
  }
});

// ========================================
// SECURITY
// ========================================

function escapeHTML(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

// ========================================
// INITIAL LOAD
// ========================================

loadComplaints();
