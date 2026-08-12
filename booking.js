document.addEventListener("DOMContentLoaded", function () {
  const tutors = [
    { id: 1, name: "Dr Vivian Sibanda", subject: "Mathematics", price: 250 },
    { id: 2, name: "Sarah Moyo", subject: "Physics", price: 300 },
    { id: 3, name: "Michael Ndlovu", subject: "English", price: 220 },
    { id: 4, name: "Aisha van der Merwe", subject: "Biology", price: 260 },
    { id: 5, name: "Lerato Khumalo", subject: "Economics", price: 280 },
    { id: 6, name: "Teboho Molefe", subject: "Computer Science", price: 320 }
  ];

  const params = new URLSearchParams(window.location.search);
  const tutorId = Number(params.get("tutorId")) || 1;
  const selectedDate = params.get("date") || "2026-08-13";
  const selectedTime = params.get("time") || "10:00-11:00";

  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const form = document.getElementById("bookingForm");
  const subjectSelect = document.getElementById("subjectSelect");
  const gradeSelect = document.getElementById("gradeSelect");
  const modeSelect = document.getElementById("modeSelect");
  const confirmationPanel = document.getElementById("bookingConfirmationPanel");

  const tutor = tutors.find((item) => item.id === tutorId) || tutors[0];

  if (subjectSelect) {
    subjectSelect.value = tutor.subject;
  }

  function renderSummary() {
    const date = new Date(`${selectedDate}T00:00:00`);
    const formattedDate = date.toLocaleDateString("en-ZA", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    confirmationPanel.innerHTML = `
      <h2>Booking overview</h2>
      <ul class="summary-list">
        <li><span>Tutor</span><strong>${tutor.name}</strong></li>
        <li><span>Subject</span><strong>${subjectSelect.value || tutor.subject}</strong></li>
        <li><span>Grade</span><strong>${gradeSelect.value || "Not selected"}</strong></li>
        <li><span>Date</span><strong>${formattedDate}</strong></li>
        <li><span>Time</span><strong>${selectedTime}</strong></li>
        <li><span>Mode</span><strong>${modeSelect.value || "Not selected"}</strong></li>
      </ul>
    `;
  }

  [subjectSelect, gradeSelect, modeSelect].forEach((field) => {
    if (field) {
      field.addEventListener("change", renderSummary);
    }
  });

  renderSummary();

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const studentName = document.getElementById("studentName").value.trim();
      const studentEmail = document.getElementById("studentEmail").value.trim();
      const selectedSubject = subjectSelect.value;
      const selectedGrade = gradeSelect.value;
      const selectedMode = modeSelect.value;

      if (!selectedSubject || !selectedGrade || !selectedMode || !studentName || !studentEmail) {
        confirmationPanel.innerHTML = `
          <div class="alert-box error">
            <h2>Please complete all fields</h2>
            <p>Make sure you select a subject, grade, lesson mode, and include your details before confirming.</p>
          </div>
        `;
        return;
      }

      const booking = {
        id: Date.now(),
        tutorId: tutor.id,
        tutorName: tutor.name,
        subject: selectedSubject,
        grade: selectedGrade,
        mode: selectedMode,
        date: selectedDate,
        time: selectedTime,
        studentName,
        studentEmail,
        createdAt: new Date().toISOString()
      };

      const existingBookings = JSON.parse(localStorage.getItem("viviansTutoringBookings") || "[]");
      existingBookings.push(booking);
      localStorage.setItem("viviansTutoringBookings", JSON.stringify(existingBookings));

      confirmationPanel.innerHTML = `
        <div class="alert-box success">
          <h2>Booking confirmed</h2>
          <p>${tutor.name} has been booked for ${selectedSubject} at ${selectedTime} on ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-ZA", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}.</p>
          <p><strong>Student:</strong> ${studentName}<br><strong>Email:</strong> ${studentEmail}</p>
        </div>
      `;

      form.reset();
      if (subjectSelect) subjectSelect.value = tutor.subject;
      if (modeSelect) modeSelect.value = "";
      if (gradeSelect) gradeSelect.value = "";
    });
  }
});
