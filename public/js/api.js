const API_BASE = '/api';


// ========================================
// TOKEN
// ========================================

function getToken() {

  return localStorage.getItem(
    'hostelcare_token'
  );

}


// ========================================
// USER
// ========================================

function getUser() {

  const user =
    localStorage.getItem(
      'hostelcare_user'
    );

  return user
    ? JSON.parse(user)
    : null;

}


// ========================================
// SAVE AUTH
// ========================================

function saveAuth(data) {

  localStorage.setItem(
    'hostelcare_token',
    data.token
  );

  localStorage.setItem(
    'hostelcare_user',
    JSON.stringify(data.user)
  );

}


// ========================================
// LOGOUT
// ========================================

function logout() {

  localStorage.removeItem(
    'hostelcare_token'
  );

  localStorage.removeItem(
    'hostelcare_user'
  );

  window.location.href = '/';

}


// ========================================
// API REQUEST
// ========================================

async function apiFetch(
  endpoint,
  options = {}
) {

  const token =
    getToken();


  const headers = {

    'Content-Type':
      'application/json',

    ...(options.headers || {})

  };


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  const response =
    await fetch(

      `${API_BASE}${endpoint}`,

      {
        ...options,
        headers
      }

    );


  const data =
    await response
      .json()
      .catch(() => ({}));


  if (!response.ok) {

    if (
      response.status === 401 &&
      token
    ) {

      logout();

    }


    throw new Error(
      data.message ||
      'Something went wrong.'
    );

  }


  return data;

}