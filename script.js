// === JS GLOBAL ===
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function handleLogoError(img) {
  if (!img) return;

  if (img.dataset.failed === "png") {
    img.dataset.failed = "ico";
    img.src = "assets/logo.ico";
    return;
  }

  if (img.dataset.failed === "ico") {
    img.onerror = null;
    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23c9a84c'/%3E%3Ctext x='50' y='55' font-family='Cinzel, serif' font-size='36' fill='%230d0d0d' text-anchor='middle' dominant-baseline='middle'%3EP%3C/text%3E%3C/svg%3E";
    return;
  }

  img.dataset.failed = "png";
  img.src = "assets/logo.png";
}

// mobile menu
const hamburger = $("#hamburger");
const mobileMenu = $("#mobileMenu");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  mobileMenu.classList.toggle("open");
});
mobileMenu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("open");
  }
});

// navbar scroll
const header = $("#header");
const topBtn = $("#topBtn");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
  topBtn.classList.toggle("show", window.scrollY > 300);
});

// smooth anchor links
$$("a[href^='#']").forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    if (targetId.length > 1 && document.querySelector(targetId)) {
      e.preventDefault();
      document.querySelector(targetId).scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Hero stats counter
const stats = $$(".hero-stat");
let statsRan = false;
const runStats = () => {
  if (statsRan) return;
  const heroBottom = document.querySelector("#hero").getBoundingClientRect().bottom;
  if (heroBottom <= window.innerHeight + 20) {
    statsRan = true;
    stats.forEach((stat) => {
      const val = parseInt(stat.dataset.target, 10);
      const num = stat.querySelector("strong");
      let count = 0;
      const step = Math.max(1, Math.floor(val / 80));
      const interval = setInterval(() => {
        count += step;
        if (count >= val) {
          count = val;
          clearInterval(interval);
        }
        num.textContent = count.toLocaleString("pt-BR");
      }, 20);
    });
  }
};
runStats();
window.addEventListener("scroll", runStats);

// Intersection Observer fade-up
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.14 }
);
$$(".fade-up").forEach((el) => observer.observe(el));

// Gallery filter
const galleryItems = $$(".gallery-item");
const filters = $$(".gallery-filter");
filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    filters.forEach((f) => f.classList.remove("active"));
    filter.classList.add("active");
    const cat = filter.dataset.category;
    galleryItems.forEach((item) => {
      if (cat === "todos" || item.dataset.category === cat) {
        item.classList.remove("hide");
      } else {
        item.classList.add("hide");
      }
    });
  });
});

// Lightbox
const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");
const lbPrev = $(".lightbox-prev");
const lbNext = $(".lightbox-next");
const lbClose = $(".lightbox-close");
let currentIndex = 0;

const visibleItems = () => $$(".gallery-item:not(.hide)");
const openImage = (idx) => {
  const items = visibleItems();
  if (!items.length) return;
  const item = items[idx];
  const image = item.querySelector("img");
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightbox.classList.add("active");
  currentIndex = idx;
};

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const current = visibleItems().indexOf(item);
    if (current < 0) return;
    openImage(current);
  });
});

const closeLightbox = () => lightbox.classList.remove("active");
lbClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextLight();
  if (e.key === "ArrowLeft") prevLight();
});

const nextLight = () => {
  const items = visibleItems();
  currentIndex = (currentIndex + 1) % items.length;
  openImage(currentIndex);
};
const prevLight = () => {
  const items = visibleItems();
  currentIndex = (currentIndex - 1 + items.length) % items.length;
  openImage(currentIndex);
};
lbNext.addEventListener("click", nextLight);
lbPrev.addEventListener("click", prevLight);

// Depoimentos carrossel
const track = $("#carouselTrack");
const slides = $$(".slide");
const dotsContainer = $("#testimonialDots");
let slideIndex = 0;
let autoPlay;

const createDots = () => {
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "testimonial-dot";
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
};

const updateCarousel = () => {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === slideIndex);
  });
  $$(".testimonial-dot").forEach((dot, i) => dot.classList.toggle("active", i === slideIndex));
  track.style.transform = `translateX(-${slideIndex * 100}% )`;
};

const goToSlide = (idx) => {
  slideIndex = idx;
  updateCarousel();
  resetAutoplay();
};

const nextSlide = () => {
  slideIndex = (slideIndex + 1) % slides.length;
  updateCarousel();
};

const resetAutoplay = () => {
  clearInterval(autoPlay);
  autoPlay = setInterval(nextSlide, 5000);
};

createDots();
updateCarousel();
autoPlay = setInterval(nextSlide, 5000);

let startX = 0;
track.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX));
track.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 40) nextSlide();
  if (endX - startX > 40) {
    slideIndex = (slideIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  }
  resetAutoplay();
});

// Location tabs
const tabBtns = $$(".tab-btn");
const tabA = $("#tabAvião");
const tabC = $("#tabCarro");
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    if (btn.dataset.tab === "avião") {
      tabA.style.display = "block";
      tabC.style.display = "none";
    } else {
      tabA.style.display = "none";
      tabC.style.display = "block";
    }
  });
});

// Form validation
const contactForm = $("#contactForm");
const successMsg = $("#successMsg");
const submitBtn = $("#submitBtn");
const fields = [
  { el: $("#name"), msg: "Campo obrigatório", validate: (v) => v.trim().length > 1 },
  { el: $("#email"), msg: "Digite um email válido", validate: (v) => /\S+@\S+\.\S+/.test(v) },
  { el: $("#phone"), msg: "Digite um telefone válido", validate: (v) => /^\d{8,15}$/.test(v.replace(/\D+/g, "")) },
  { el: $("#experience"), msg: "Selecione uma opção", validate: (v) => v !== "" },
  { el: $("#date"), msg: "Informe uma data", validate: (v) => !!v },
  { el: $("#message"), msg: "Campo obrigatório", validate: (v) => v.trim().length > 6 },
];

const fieldWrapper = (input) => input.closest(".field-group");

fields.forEach((f) => {
  f.el.addEventListener("focus", () => fieldWrapper(f.el).classList.add("focused"));
  f.el.addEventListener("blur", () => {
    fieldWrapper(f.el).classList.remove("focused");
    validateField(f);
  });
  if (f.el.tagName === "SELECT") {
    f.el.addEventListener("change", () => validateField(f));
  }
});

const validateField = (f) => {
  const valid = f.validate(f.el.value);
  const group = fieldWrapper(f.el);
  group.classList.toggle("error", !valid);
  group.querySelector(".error-msg").style.display = valid ? "none" : "block";
  return valid;
};

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let allValid = true;
  fields.forEach((f) => {
    if (!validateField(f)) allValid = false;
  });
  if (!allValid) return;
  submitBtn.classList.add("disabled");
  submitBtn.textContent = "Enviando...";
  setTimeout(() => {
    submitBtn.classList.remove("disabled");
    submitBtn.textContent = "Iniciar Minha Jornada 🧭";
    successMsg.style.display = "block";
    contactForm.reset();
  }, 1300);
});

// Floating labels
document.querySelectorAll(".field-group input, .field-group textarea, .field-group select").forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value) {
      fieldWrapper(input).classList.add("focused");
    } else {
      fieldWrapper(input).classList.remove("focused");
    }
  });
});

// Scroll to top
topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Tilt cards
const tiltCards = $$(".exp-card");
tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(900px) rotateY(${x / 18}deg) rotateX(${-y / 20}deg) translateY(-8px)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = `translateY(0)`;
  });
});

// Hero background slider (6 imagens locais)
const heroBg = document.getElementById("heroBg");
const heroImages = [
  "assets/hero/hero1.jpg",
  "assets/hero/hero2.jpg",
  "assets/hero/hero3.jpg",
  "assets/hero/hero4.jpg",
  "assets/hero/hero5.jpg",
  "assets/hero/hero6.jpg"
];
let heroIndex = 0;

const showHeroImage = (idx) => {
  heroBg.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.32), rgba(0,0,0,0.32)), url('${heroImages[idx]}')`;
};

if (heroBg) {
  showHeroImage(heroIndex);
  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroImages.length;
    showHeroImage(heroIndex);
  }, 8000);
}

// Video play button fallback scroll
$("#playVideoBtn").addEventListener("click", () => {
  window.scrollTo({ top: document.querySelector("#sobre").offsetTop - 80, behavior: "smooth" });
});

// Avoid context menu over lightbox for clean UX
lightbox.addEventListener("contextmenu", (e) => e.preventDefault());
