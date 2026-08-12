document.addEventListener("DOMContentLoaded", function () {
  const tutors = [
    {
      id: 1,
      name: "Dr Vivian Sibanda",
      subject: "Mathematics",
      status: "available",
      price: 250,
      blockedDates: [0, 3],
      bookedSlots: {
        1: ["09:00-10:00", "14:00-15:00"],
        2: ["10:00-11:00"]
      }
    },
    {
      id: 2,
      name: "Sarah Moyo",
      subject: "Physics",
      status: "limited",
      price: 300,
      blockedDates: [2],
      bookedSlots: {
        0: ["16:00-17:00"],
        3: ["13:00-14:00"]
      }
    },
    {
      id: 3,
      name: "Michael Ndlovu",
      subject: "English",
      status: "unavailable",
      price: 220,
      blockedDates: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      bookedSlots: {}
    },
    {
      id: 4,
      name: "Aisha van der Merwe",
      subject: "Biology",
      status: "available",
      price: 260,
      blockedDates: [5],
      bookedSlots: {
        1: ["11:00-12:00"]
      }
    },
    {
      id: 5,
      name: "Lerato Khumalo",
      subject: "Economics",
      status: "limited",
      price: 280,
      blockedDates: [4],
      bookedSlots: {
        2: ["15:30-16:30"]
      }
    },
    {
      id: 6,
      name: "Teboho Molefe",
      subject: "Computer Science",
      status: "available",
      price: 320,
      blockedDates: [6],
      bookedSlots: {
        0: ["09:00-10:00"]
      }
    }
  ];

  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const tutorSelect = document.getElementById("tutorSelect");
  const calendarGrid = document.getElementById("calendarGrid");
  const timeSlotGrid = document.getElementById("timeSlotGrid");
  const bookingSummary = document.getElementById("bookingSummary");

  const allSlots = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00"
  ];

  const state = {
    selectedTutorId: 1,
    selectedDateKey: "",
    selectedTime: ""
  };

  function addDays(baseDate, count) {
    const next = new Date(baseDate);
    next.setDate(baseDate.getDate() + count);
    return next;
  }

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatReadable(date) {
    return date.toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  }

  function getTutorById(id) {
    return tutors.find((tutor) => tutor.id === Number(id)) || tutors[0];
  }

  function getDateIndex(dateKey) {
    const today = new Date();
    const currentKey = formatDateKey(today);
    const currentDate = new Date(currentKey + "T00:00:00");
    const selectedDate = new Date(dateKey + "T00:00:00");
    return Math.round((selectedDate - currentDate) / 86400000);
  }

  function getStatusForTutorOnDate(tutor, dateIndex) {
    if (tutor.blockedDates.includes(dateIndex)) {
      return "unavailable";
    }

    if (dateIndex >= 0 && dateIndex <= 2 && tutor.status === "limited") {
      return "limited";
    }

    if (tutor.status === "available") {
      return "available";
    }

    return tutor.status;
  }

  function renderTutorOptions() {
    tutorSelect.innerHTML = tutors.map((tutor) => {
      return `<option value="${tutor.id}">${tutor.name} (${tutor.subject})</option>`;
    }).join("");

    tutorSelect.value = String(state.selectedTutorId);
  }

  function renderCalendar() {
    const tutor = getTutorById(state.selectedTutorId);
    const today = new Date();
    const days = Array.from({ length: 10 }, (_, index) => addDays(today, index));

    calendarGrid.innerHTML = days.map((date, index) => {
      const dateKey = formatDateKey(date);
      const dayStatus = getStatusForTutorOnDate(tutor, index);
      const isSelected = state.selectedDateKey === dateKey;

      return `
        <button
          class="day-button ${isSelected ? "active" : ""} ${dayStatus} ${dayStatus === "unavailable" ? "disabled" : ""}"
          data-date-key="${dateKey}"
          data-status="${dayStatus}"
          ${dayStatus === "unavailable" ? "disabled" : ""}
          type="button"
        >
          <strong>${date.getDate()}</strong>
          <span>${formatReadable(date)}</span>
        </button>
      `;
    }).join("");

    const dayButtons = document.querySelectorAll(".day-button");
    dayButtons.forEach((button) => {
      button.addEventListener("click", function () {
        if (button.disabled) {
          return;
        }

        const clickedDateKey = button.dataset.dateKey;
        state.selectedDateKey = clickedDateKey;
        state.selectedTime = "";
        renderCalendar();
        renderTimeSlots();
        renderSummary();
      });
    });

    if (!state.selectedDateKey) {
      const firstAvailable = days.find((date, index) => getStatusForTutorOnDate(tutor, index) !== "unavailable");
      state.selectedDateKey = firstAvailable ? formatDateKey(firstAvailable) : formatDateKey(days[0]);
    }
  }

  function renderTimeSlots() {
    const tutor = getTutorById(state.selectedTutorId);
    const dateIndex = getDateIndex(state.selectedDateKey);
    const bookedForDate = tutor.bookedSlots[dateIndex] || [];
    const targetDate = state.selectedDateKey;

    timeSlotGrid.innerHTML = allSlots.map((slot) => {
      const isBooked = bookedForDate.includes(slot);
      const isUnavailableDate = tutor.blockedDates.includes(dateIndex);
      const isDisabled = isBooked || isUnavailableDate;
      const isSelected = state.selectedTime === slot;

      return `
        <button
          class="time-slot ${isSelected ? "selected" : ""}"
          data-slot="${slot}"
          ${isDisabled ? "disabled" : ""}
          type="button"
        >
          ${slot}${isBooked ? " • Booked" : ""}
        </button>
      `;
    }).join("");

    const buttons = document.querySelectorAll(".time-slot");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        if (button.disabled) {
          return;
        }

        state.selectedTime = button.dataset.slot;
        renderTimeSlots();
        renderSummary();
      });
    });

    if (!state.selectedTime && !timeSlotGrid.querySelector("button:not(:disabled)")) {
      state.selectedTime = "";
    }
  }

  function renderSummary() {
    const tutor = getTutorById(state.selectedTutorId);
    const date = state.selectedDateKey ? new Date(`${state.selectedDateKey}T00:00:00`) : null;
    const selectedDateText = date ? date.toLocaleDateString("en-ZA", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    }) : "Select a date";

    const selectedTutorText = tutor.name;
    const selectedTimeText = state.selectedTime || "No time selected";

    bookingSummary.innerHTML = `
      <h2>Session summary</h2>
      <ul class="summary-list">
        <li><span>Tutor</span><strong>${selectedTutorText}</strong></li>
        <li><span>Subject</span><strong>${tutor.subject}</strong></li>
        <li><span>Date</span><strong>${selectedDateText}</strong></li>
        <li><span>Time</span><strong>${selectedTimeText}</strong></li>
        <li><span>Rate</span><strong>R${tutor.price}/hour</strong></li>
      </ul>

      <div class="summary-cta">
        <button class="btn btn-primary" ${!state.selectedTime ? "disabled" : ""} type="button">
          ${state.selectedTime ? "Continue booking" : "Choose a time slot"}
        </button>
      </div>
    `;
  }

  tutorSelect.addEventListener("change", function () {
    state.selectedTutorId = Number(tutorSelect.value);
    state.selectedDateKey = "";
    state.selectedTime = "";
    renderCalendar();
    renderTimeSlots();
    renderSummary();
  });

  renderTutorOptions();
  renderCalendar();
  renderTimeSlots();
  renderSummary();
});
