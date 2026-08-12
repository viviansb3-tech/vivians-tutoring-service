document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  const createDemoUser = (name, email, password, role) => ({
    name,
    email,
    password,
    role
  });

  function getUsers() {
    const savedUsers = localStorage.getItem("viviansTutoringUsers");
    if (!savedUsers) {
      const seededUsers = [
        createDemoUser("Student Demo", "student@example.com", "password123", "student"),
        createDemoUser("Tutor Demo", "tutor@example.com", "password123", "tutor")
      ];
      localStorage.setItem("viviansTutoringUsers", JSON.stringify(seededUsers));
      return seededUsers;
    }

    return JSON.parse(savedUsers);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const users = getUsers();
      const match = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);

      if (!match) {
        const error = document.createElement("p");
        error.className = "form-message error-message";
        error.textContent = "Incorrect email or password. Try the demo login details.";
        loginForm.appendChild(error);
        return;
      }

      localStorage.setItem("viviansTutoringCurrentUser", JSON.stringify(match));

      const successMessage = document.createElement("p");
      successMessage.className = "form-message success-message";
      successMessage.textContent = `Welcome back, ${match.name}! Redirecting to your dashboard...`;
      loginForm.appendChild(successMessage);

      const redirectPage = match.role === "tutor" ? "tutor-dashboard.html" : "student-dashboard.html";
      window.setTimeout(() => {
        window.location.href = redirectPage;
      }, 800);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value.trim();
      const role = document.getElementById("registerRole").value;

      if (!name || !email || !password) {
        const error = document.createElement("p");
        error.className = "form-message error-message";
        error.textContent = "Please fill in all fields.";
        registerForm.appendChild(error);
        return;
      }

      const users = getUsers();
      const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());

      if (exists) {
        const error = document.createElement("p");
        error.className = "form-message error-message";
        error.textContent = "An account with that email already exists.";
        registerForm.appendChild(error);
        return;
      }

      const newUser = createDemoUser(name, email, password, role);
      users.push(newUser);
      localStorage.setItem("viviansTutoringUsers", JSON.stringify(users));
      localStorage.setItem("viviansTutoringCurrentUser", JSON.stringify(newUser));

      const successMessage = document.createElement("p");
      successMessage.className = "form-message success-message";
      successMessage.textContent = "Account created successfully! Redirecting...";
      registerForm.appendChild(successMessage);

      const redirectPage = role === "tutor" ? "tutor-dashboard.html" : "student-dashboard.html";
      window.setTimeout(() => {
        window.location.href = redirectPage;
      }, 800);
    });
  }
});
