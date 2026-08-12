document.addEventListener("DOMContentLoaded", function () {
  const bookingCount = document.getElementById("bookingCount");
  const upcomingCount = document.getElementById("upcomingCount");
  const upcomingSessions = document.getElementById("upcomingSessions");
  const bookingHistory = document.getElementById("bookingHistory");
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const sampleBookings = [
    {
      id: 1,
      tutorName: "Dr Vivian Sibanda",
      subject: "Mathematics",
      grade: "Grade 12",
      date: "2026-08-13",
      time: "10:00-11:00",
      mode: "Online",
      studentName: "Liam Nkosi",
      status: "upcoming"
    },
    {
      id: 2,
      tutorName: "Sarah Moyo",
      subject: "Physics",
      grade: "IGCSE",
      date: "2026-08-15",
      time: "16:00-17:00",
      mode: "In-person",
      studentName: "Liam Nkosi",
      status: "upcoming"
    },
    {
      id: 3,
      tutorName: "Aisha van der Merwe",
      subject: "Biology",
      grade: "Grade 11",
      date: "2026-08-09",
      time: "11:00-12:00",
      mode: "Online",
      studentName: "Liam Nkosi",
      status: "completed"
    },
    {
      id: 4,
      tutorName: "Teboho Molefe",
      subject: "Computer Science",
      grade: "Grade 10",
      date: "2026-08-05",
      time: "09:00-10:00",
      mode: "Online",
      studentName: "Liam Nkosi",
      status: "completed"
    }
  ];

  const storedBookings = JSON.parse(localStorage.getItem("viviansTutoringBookings") || "[]");
  const allBookings = [...storedBookings, ...sampleBookings];

  const upcoming = allBookings.filter((booking) => booking.status !== "completed");
  const history = allBookings.filter((booking) => booking.status === "completed");

  if (bookingCount) {
    bookingCount.textContent = String(allBookings.length);
  }

  if (upcomingCount) {
    upcomingCount.textContent = String(upcoming.length);
  }

  function renderBookingList(container, bookings, emptyText) {
    if (!container) return;

    if (!bookings.length) {
      container.innerHTML = `<div class="empty-booking">${emptyText}</div>`;
      return;
    }

    container.innerHTML = bookings.map((booking) => {
      const date = new Date(`${booking.date}T00:00:00`).toLocaleDateString("en-ZA", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      return `
        <div class="booking-item">
          <div>
            <h3>${booking.tutorName}</h3>
            <p>${booking.subject} • ${booking.grade}</p>
          </div>

          <div class="booking-meta">
            <span>${date}</span>
            <span>${booking.time}</span>
            <span>${booking.mode}</span>
          </div>

          <span class="status-pill ${booking.status === "completed" ? "done" : "upcoming"}">
            ${booking.status === "completed" ? "Completed" : "Upcoming"}
          </span>
        </div>
      `;
    }).join("");
  }

  renderBookingList(upcomingSessions, upcoming, "No upcoming sessions yet.");
  renderBookingList(bookingHistory, history, "No previous sessions yet.");
});
