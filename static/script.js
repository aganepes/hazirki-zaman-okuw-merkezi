const darkToggle = document.getElementById("darkToggle");
const body = document.body;

function setDarkMode(isDark) {
  if (isDark) {
    body.classList.add("dark-mode");
    darkToggle.textContent = "☀️ Ýagtylyk režim";
    localStorage.setItem("darkMode", "enabled");
  } else {
    body.classList.remove("dark-mode");
    darkToggle.textContent = "🌙 Gara režim";
    localStorage.setItem("darkMode", "disabled");
  }
}

if (localStorage.getItem("darkMode") === "enabled") {
  setDarkMode(true);
}

darkToggle.addEventListener("click", () => {
  const isDark = !body.classList.contains("dark-mode");
  setDarkMode(isDark);
  if (floatingDots) floatingDots.updateTheme();
});

// Course filtering
const filterButtons = document.querySelectorAll(".filter-btn");
const courseCards = document.querySelectorAll(".course-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    // Update active button
    filterButtons.forEach((button) => button.classList.remove("active"));
    button.classList.add("active");

    // Filter cards with animation
    courseCards.forEach((card) => {
      const category = card.dataset.category;
      if (filter == "all" || category == filter) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});

// Smooth Scrolling
document.querySelectorAll("a[href^='#']").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
// Scroll reveal animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    } else {
      entry.target.classList.remove("visible");
    }
  });
}, observerOptions);

document.querySelectorAll("section").forEach((section) => {
  observer.observe(section);
});

class FloatingDots {
  constructor() {
    this.canvas = document.querySelector("#dotsCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.dots = [];
    this.mouse = { x: null, y: null };
    this.dotsCount = 280;
    this.isDark = body.classList.contains("dark-mode");
    this.init();
    this.animate();
    this.setupEventListeners();
  }
  init() {
    this.resize();
  }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.dots = [];
    this.createDots();
  }
  createDots() {
    for (let i = 0; i < this.dotsCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.dots.push({
        x,
        y,
        originalX: x,
        originalY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  }
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // theme colors
    const dotColor = this.isDark ? "147, 197, 253" : "79, 70, 229"; // blue - 300 / indigo-600
    const lineColor = this.isDark ? "99, 102, 241" : "165, 180, 252"; // indigo-500 / indigo - 300

    this.dots.forEach((dot, i) => {
      // Ambient drift
      dot.x += dot.vx;
      dot.y += dot.vy;

      //  Boundary check
      if (dot.x < 0 || dot.x > this.canvas.width) dot.vx *= -1;
      if (dot.y < 0 || dot.y > this.canvas.height) dot.vy *= -1;

      // Mouse interection - repel / attract
      if (this.mouse.x != null && this.mouse.y != null) {
        const dx = this.mouse.x - dot.x;
        const dy = this.mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          // Repel
          dot.x -= Math.cos(angle) * force * 2;
          dot.y -= Math.sin(angle) * force * 2;
        }
        // spring back to original position (smooth ease)
        const springStrength = 0.01;
        dot.x += (dot.originalX - dot.x) * springStrength;
        dot.y += (dot.originalY - dot.y) * springStrength;

        // Draw dot
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${dotColor},${dot.opacity})`;
        this.ctx.fill();

        // Draw lines between nearby dots
        for (let j = i + 1; j < this.dots.length; j++) {
          const other = this.dots[j];
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            this.ctx.beginPath();
            this.ctx.moveTo(dot.x, dot.y);
            this.ctx.lineTo(other.x, other.y);
            const opacity = (1 - distance / 120) * 0.2;
            this.ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        }
      }
    });
  }
  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
  setupEventListeners() {
    window.addEventListener("resize", () => this.resize());

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    // Listen for theme changes
    const originalSetDarkMode = setDarkMode;
    window.setDarkMode = (isDark) => {
      originalSetDarkMode(isDark);
      this.updateTheme();
    };
  }
  updateTheme() {
    this.isDark = body.classList.contains("dark-mode");
  }
}

const floatingDots = new FloatingDots();

//  Contact form handling
const contactForm = document.getElementById("contactForm");
const successMessage = document.getElementById("successMessage");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // working to loading
  document.querySelector(".message-spinner").style.display = "block";

  // get form values
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  // validate
  if (!name || !phone || !message) {
    successMessage.textContent = "🙏 Ähli meýdançalary dolduruň!";
    // Show success message
    successMessage.style.display = "block";
    // Hide success message after 3 seconds
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
    return ;
  }
  // send to api
  fetch('/send-email',{
    method:"post",
    body:JSON.stringify({name,phone,message})
  })
  .then(resp=> resp.json())
  .then(data => {
    if(data.succecc){
      // Shown success message
      successMessage.style.display = 'block';
      // Reset form
      contactForm.reset();
      // Hide success message after 1 seconds
      setTimeout(()=>{
        successMessage.style.display = 'none';
      },3000);
    }
  })
  .catch((error)=>{
    successMessage.textContent = "🔥 Api - de ýalňyşlyk ýüze çykdy.";
    // Reset form
      contactForm.reset();
    // Show success message
    successMessage.style.display = "block";
    successMessage.style.backgroundClip = "red";

    // Hide success message after 2 seconds
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
  })
  .finally(()=>{
    document.querySelector('.message-spinner').style.display = "none";
  });
});
