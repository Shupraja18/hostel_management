// ========================================
// AUTH HELPERS
// ========================================

function redirectLoggedInUser() {

  const user =
    getUser();


  if (!user) {
    return;
  }


  if (user.role === 'student') {

    window.location.href =
      '/student/dashboard.html';

  }


  if (user.role === 'warden') {

    window.location.href =
      '/warden/dashboard.html';

  }

}


// ========================================
// LOGIN
// ========================================

async function loginUser(
  role,
  email,
  password
) {

  const endpoint =
    role === 'student'
      ? '/auth/student/login'
      : '/auth/warden/login';


  const data =
    await apiFetch(
      endpoint,
      {
        method: 'POST',

        body: JSON.stringify({
          email,
          password
        })
      }
    );


  saveAuth(data);


  return data;

}


// ========================================
// REGISTER
// ========================================

async function registerStudent(
  formData
) {

  const data =
    await apiFetch(
      '/auth/student/register',
      {
        method: 'POST',

        body: JSON.stringify(
          formData
        )
      }
    );


  saveAuth(data);


  return data;

}