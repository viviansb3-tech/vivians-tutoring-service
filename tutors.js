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
      nextSlot: "Tue, 14:00",
      bio: "Supports learners with clear explanations, exam strategy, and structured revision plans.",
      imageClass: "tutor-one"
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
      nextSlot: "Wed, 16:00",
      bio: "Helps students connect theory to practical problems and build confidence in science subjects.",
      imageClass: "tutor-two"
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
      bio: "Builds stronger writing, reading comprehension, and literary analysis skills with confidence.",
      imageClass: "tutor-three"
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
      nextSlot: "Thu, 11:00",
      bio: "Encourages curiosity and helps students master complex biological concepts through focused study.",
      imageClass: "tutor-four"
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
      nextSlot: "Fri, 15:30",
      bio: "Supports analytical thinking and structured essay writing for humanities and commerce students.",
      imageClass: "tutor-five"
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
      nextSlot: "Mon, 09:00",
      bio: "Helps students strengthen coding concepts, problem solving, and programming confidence.",
      imageClass: "tutor-six"
    }
  ];

  const grid = document.getElementById("tutorDirectoryGrid");
  const searchInput = document.getElementById("searchTutor");
  const subjectFilter = document.getElementById("subjectFilter");
  const levelFilter = document.getElementById("levelFilter");
  const resultsCount = document.getElementById("resultsCount");

  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  function getFilteredTutors() {
    const searchTerm = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const selectedSubject = subjectFilter ? subjectFilter.value : "all";
    const selectedLevel = levelFilter ? levelFilter.value : "all";

    return tutors.filter((tutor) => {
      const matchesSearch = !searchTerm ||
        tutor.name.toLowerCase().includes(searchTerm) ||
        tutor.title.toLowerCase().includes(searchTerm) ||
        tutor.subjects.some((subject) => subject.toLowerCase().includes(searchTerm));

      const matchesSubject = selectedSubject === "all" || tutor.subjects.includes(selectedSubject);
      const matchesLevel = selectedLevel === "all" || tutor.levels.includes(selectedLevel);

      return matchesSearch && matchesSubject && matchesLevel;
    });
  }

  function renderTutors() {
    const filteredTutors = getFilteredTutors();

    if (!grid) return;

    if (!filteredTutors.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No tutors match your filters</h3>
          <p>Try changing the subject or search term to find a better fit.</p>
        </div>
      `;
      if (resultsCount) {
        resultsCount.textContent = "0 tutors found";
      }
      return;
    }

    grid.innerHTML = filteredTutors.map((tutor) => {
      const isDisabled = tutor.status === "unavailable";

      return `
        <article class="tutor-card">
          <div class="tutor-image ${tutor.imageClass}"></div>
          <div class="tutor-body">
            <div class="tutor-header">
              <div>
                <h3>${tutor.name}</h3>
                <p>${tutor.title}</p>
              </div>
              <span class="rating">★★★★★ ${tutor.rating}</span>
            </div>

            <ul class="tutor-subjects">
              ${tutor.subjects.map((subject) => `<li>${subject}</li>`).join("")}
            </ul>

            <div class="availability ${tutor.status}">
              <span class="dot"></span>
              ${tutor.statusLabel}
            </div>

            <div class="tutor-meta">
              <span>Next slot: ${tutor.nextSlot}</span>
              <span>Levels: ${tutor.levels.join(" • ")}</span>
            </div>

            <p class="tutor-bio">${tutor.bio}</p>

            <div class="tutor-footer">
              <strong>R${tutor.price} / hour</strong>
              <div class="card-actions">
                <a href="tutor-profile.html?id=${tutor.id}" class="btn btn-small btn-secondary">View profile</a>
                ${isDisabled
                  ? '<button class="btn btn-small btn-disabled" disabled>Unavailable</button>'
                  : `<a href="booking.html?tutorId=${tutor.id}" class="btn btn-small btn-primary">Book now</a>`}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    if (resultsCount) {
      resultsCount.textContent = `${filteredTutors.length} tutor${filteredTutors.length === 1 ? "" : "s"} found`;
    }
  }

  [searchInput, subjectFilter, levelFilter].forEach((element) => {
    if (element) {
      element.addEventListener("input", renderTutors);
      element.addEventListener("change", renderTutors);
    }
  });

  renderTutors();
});
