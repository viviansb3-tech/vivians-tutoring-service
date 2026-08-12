document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !subject || !message) {
      const error = document.createElement("p");
      error.className = "form-message error-message";
      error.textContent = "Please complete all fields before sending your message.";
      form.appendChild(error);
      return;
    }

    const success = document.createElement("p");
    success.className = "form-message success-message";
    success.textContent = `Thanks, ${name}! Your enquiry has been received. We will contact you at ${email}.`;
    form.appendChild(success);
    form.reset();
  });
});
