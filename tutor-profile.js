document.addEventListener("DOMContentLoaded", function () {
  const tutors = [
    {
      id: 1,
      name: "Dr Vivian Sibanda",
      title: "Mathematics & Statistics",
      rating: 4.9,
      price: 250,
      status: "available",
      statusLabel: "Available today",
      subjects: ["Mathematics", "Statistics", "Data Analysis"],
      levels: ["Grade 8-12", "IGCSE", "A Level"],
      nextSlot: "Tuesday, 14:00",
      bio: "Dr Vivian Sibanda supports learners with clear explanations, exam strategy, and structured revision plans that build long-term confidence.",
      imageClass: "tutor-one",
      experience: "8 years",
      students: "150+",
      availability: ["Mon 09:00", "Tue 14:00", "Wed 15:00", "Thu 10:30", "Fri 12:00"],
      strengths: ["Exam technique", "Concept mastery", "Confidence building"]
    },
    {
      id: 2,
      name: "Sarah Moyo",
      title: "Physics & Chemistry",
      rating: 4.8,
      price: 300,
      status: "limited",
      statusLabel: "Limited availability",
      subjects: ["Physics", "Chemistry", "Science revision"],
      levels: ["Grade 10-12", "IGCSE"],
      nextSlot: "Wednesday, 16:00",
      bio: "Sarah helps students connect theory to practical problems and build confidence in scientific thinking and applied reasoning.",
      imageClass: "tutor-two",
      experience: "6 years",
      students: "120+",
      availability: ["Tue 16:00", "Wed 16:00", "Thu 13:00", "Sat 10:00"],
      strengths: ["Practical problem solving", "Revision planning", "Science communication"]
    },
    {
      id: 3,
      name: "Michael Ndlovu",
      title: "English & Literature",
      rating: 4.9,
      price: 220,
      status: "unavailable",
      statusLabel: "Unavailable this week",
      subjects: ["English", "Essay writing", "Comprehension"],
      levels: ["Grade 8-12", "IGCSE"],
      nextSlot: "Next week",
      bio: "Michael develops stronger writing, reading comprehension, and literary analysis skills with confidence and structure.",
      imageClass: "tutor-three",
      experience: "7 years",
      students: "140+",
      availability: ["Next week only"],
      strengths: ["Essay writing", "Reading skills", "Critical analysis"]
    },
    {
      id: 4,
      name: "Aisha van der Merwe",
      title: "Biology & Life Sciences",
      rating: 4.7,
      price: 260,
      status: "available",
      statusLabel: "Open for bookings",
      subjects: ["Biology", "Life Sciences", "Revision"],
      levels: ["Grade 10-12", "IGCSE"],
      nextSlot: "Thursday, 11:00",
      bio: "Aisha encourages curiosity and helps students master biological concepts through clear explanations and revision support.",
      imageClass: "tutor-four",
      experience: "5 years",
      students: "90+",
      availability: ["Mon 11:00", "Thu 11:00", "Fri 09:00", "Sat 09:30"],
      strengths: ["Diagram interpretation", "Revision strategy", "Concept retention"]
    },
    {
      id: 5,
      name: "Lerato Khumalo",
      title: "Business Studies & Economics",
      rating: 4.8,
      price: 280,
      status: "limited",
      statusLabel: "Few slots left",
      subjects: ["Economics", "Business Studies", "Research"],
      levels: ["Grade 11-12", "A Level"],
      nextSlot: "Friday, 15:30",
      bio: "Lerato supports analytical thinking, essay structure, and confident exam performance for commerce learners.",
      imageClass: "tutor-five",
      experience: "6 years",
      students: "110+",
      availability: ["Wed 15:30", "Fri 15:30", "Sat 12:00"],
      strengths: ["Essay structure", "Data interpretation", "Exam readiness"]
    },
    {
      id: 6,
      name: "Teboho Molefe",
      title: "IT & Computer Science",
      rating: 4.9,
      price: 320,
      status: "available",
      statusLabel: "Available for coding support",
      subjects: ["Computer Science", "IT", "Programming"],
      levels: ["Grade 9-12", "IGCSE"],
      nextSlot: "Monday, 09:00",
      bio: "Teboho helps students strengthen coding concepts, problem solving, and programming confidence with practical exercises.",
      imageClass: "tutor-six",
      experience: "9 years",
      students: "180+",
      availability: ["Mon 09:00", "Tue 10:00", "Thu 09:30", "Sat 11:00"],
      strengths: ["Coding fundamentals", "Problem solving", "Project support"]
    }
  ];

  const params = new URLSearchParams(window.location.search);
  const tutorId = Number(params.get("id")) || 1;
  const tutor = tutors.find((item) => item.id === tutorId) || tutors[0];

  const profileIntro = document.getElementById("profileIntro");
  const profileDetails = document.getElementById("profileDetails");
  const profileSidebar = document.getElementById("profileSidebar");
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  if (profileIntro) {
    profileIntro.innerHTML = `
      <div class="profile-header-card">
        <div class="profile-avatar ${tutor.imageClass}"></div>
        <div class="profile-header-copy">
          <span class="eyebrow">Tutor profile</span>
          <h1>${tutor.name}</h1>
          <p>${tutor.title}</p>
          <div class="profile-rating">
            <span class="rating">★★★★★ ${tutor.rating}</span>
            <span class="profile-status ${tutor.status}">${tutor.statusLabel}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (profileDetails) {
    profileDetails.innerHTML = `
      <div class="profile-content">
        <h2>About ${tutor.name.split(" ")[0]}</h2>
        <p>${tutor.bio}</p>

        <div class="info-grid">
          <div>
            <h3>Subjects</h3>
            <ul class="pill-list">
              ${tutor.subjects.map((subject) => `<li>${subject}</li>`).join("")}
            </ul>
          </div>

          <div>
            <h3>Levels</h3>
            <ul class="pill-list">
              ${tutor.levels.map((level) => `<li>${level}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="info-grid">
          <div>
            <h3>Teaching strengths</h3>
            <ul class="check-list compact">
              ${tutor.strengths.map((strength) => `<li>${strength}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  if (profileSidebar) {
    profileSidebar.innerHTML = `
      <div class="sidebar-panel">
        <div class="price-row">
          <span>Hourly rate</span>
          <strong>R${tutor.price}</strong>
        </div>

        <div class="metric-row">
          <div>
            <strong>${tutor.experience}</strong>
            <span>Experience</span>
          </div>
          <div>
            <strong>${tutor.students}</strong>
            <span>Students</span>
          </div>
        </div>

        <div class="availability-box">
          <h3>Available slots</h3>
          <ul>
            ${tutor.availability.map((slot) => `<li>${slot}</li>`).join("")}
          </ul>
        </div>

        <div class="sidebar-actions">
          ${tutor.status === "unavailable"
            ? '<button class="btn btn-primary" disabled>Unavailable</button>'
            : `<a href="booking.html?tutorId=${tutor.id}" class="btn btn-primary">Book this tutor</a>`}
          <a href="tutors.html" class="btn btn-secondary">Back to tutors</a>
        </div>
      </div>
    `;
  }
});
