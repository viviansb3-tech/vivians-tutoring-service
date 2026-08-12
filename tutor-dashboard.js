document.addEventListener("DOMContentLoaded", function () {
  const sessionTotal = document.getElementById("sessionTotal");
  const studentTotal = document.getElementById("studentTotal");
  const hoursTotal = document.getElementById("hoursTotal");
  const ratingTotal = document.getElementById("ratingTotal");
  const upcomingBookings = document.getElementById("upcomingBookings");
  const availabilityGrid = document.getElementById("availabilityGrid");
  const feedbackList = document.getElementById("feedbackList");
  const saveScheduleBtn = document.getElementById("saveScheduleBtn");
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const bookings = [
    {
      id: 1,
      student: "Liam Nkosi",
      subject: "Mathematics",
      date: "2026-08-13",
      time: "10:00-11:00",
      mode: "Online",
      status: "confirmed"
    },
    {
      id: 2,
      student: "Amina Hussein",
      subject: "Physics",
      date: "2026-08-15",
      time: "16:00-17:00",
      mode: "In-person",
      status: "pending"
    },
    {
      id: 3,
      student: "Kopano Dlamini",
      subject: "English",
      date: "2026-08-17",
      time: "11:00-12:00",
      mode: "Online",
      status: "confirmed"
    }
  ];

  const feedback = [
    { student: "Mia Jacobs", comment: "Very clear explanations and calming teaching style.", rating: 5 },
    { student: "Armand Tedder", comment: "Helpful homework guidance and great pacing.", rating: 4 },
    { student: "Leah Mokoena", comment: "Made difficult concepts feel manageable and relevant.", rating: 5 }
  ];

  const defaultAvailability = {
    Monday: ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
    Tuesday: ["11:00-12:00", "15:00-16:00"],
    Wednesday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"],
    Thursday: ["12:00-13:00", "15:00-16:00"],
    Friday: ["09:00-10:00", "11:00-12:00", "14:00-15:00"],
    Saturday: ["10:00-11:00"],
    Sunday: []
  };

  let availability = JSON.parse(localStorage.getItem("viviansTutorAvailability") || "null") || defaultAvailability;

  function renderStats() {
    const uniqueStudents = new Set(bookings.map((booking) => booking.student)).size;
    const totalHours = bookings.length * 1.5;
    const ratingAverage = (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1);

    if (sessionTotal) sessionTotal.textContent = String(bookings.length);
    if (studentTotal) studentTotal.textContent = String(uniqueStudents);
    if (hoursTotal) hoursTotal.textContent = `${totalHours.toFixed(1)}h`;
    if (ratingTotal) ratingTotal.textContent = ratingAverage;
  }

  function renderBookings() {
    if (!upcomingBookings) return;

    upcomingBookings.innerHTML = bookings.map((booking) => {
      const date = new Date(`${booking.date}T00:00:00`).toLocaleDateString("en-ZA", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });

      return `
        <div class="booking-item">
          <div>
            <h3>${booking.student}</h3>
            <p>${booking.subject} • ${booking.mode}</p>
          </div>

          <div class="booking-meta">
            <span>${date}</span>
            <span>${booking.time}</span>
          </div>

          <span class="status-pill ${booking.status === "confirmed" ? "upcoming" : "done"}">
            ${booking.status === "confirmed" ? "Confirmed" : "Pending"}
          </span>
        </div>
      `;
    }).join("");
  }

  function renderAvailability() {
    if (!availabilityGrid) return;

    const days = Object.keys(availability);

    availabilityGrid.innerHTML = days.map((day) => {
      const slots = availability[day];

      return `
        <div class="availability-column">
          <h3>${day}</h3>
          <div class="slot-list">
            ${["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00"].map((slot) => {
              const isSelected = slots.includes(slot);
              return `
                <button
                  type="button"
                  class="slot-button ${isSelected ? "active" : ""}"
                  data-day="${day}"
                  data-slot="${slot}"
                >
                  ${slot}
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".slot-button").forEach((button) => {
      button.addEventListener("click", function () {
        const day = button.dataset.day;
        const slot = button.dataset.slot;

        if (!availability[day]) availability[day] = [];

        if (availability[day].includes(slot)) {
          availability[day] = availability[day].filter((item) => item !== slot);
        } else {
          availability[day].push(slot);
        }

        button.classList.toggle("active");
      });
    });
  }

  function renderFeedback() {
    if (!feedbackList) return;

    feedbackList.innerHTML = feedback.map((item) => {
      const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);

      return `
        <div class="feedback-card">
          <div class="feedback-top">
            <strong>${item.student}</strong>
            <span>${stars}</span>
          </div>
          <p>${item.comment}</p>
        </div>
      `;
    }).join("");
  }

  if (saveScheduleBtn) {
    saveScheduleBtn.addEventListener("click", function () {
      localStorage.setItem("viviansTutorAvailability", JSON.stringify(availability));
      saveScheduleBtn.textContent = "Saved";

      setTimeout(() => {
        saveScheduleBtn.textContent = "Save availability";
      }, 1200);
    });
  }

  renderStats();
  renderBookings();
  renderAvailability();
  renderFeedback();
});
