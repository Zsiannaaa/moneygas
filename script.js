const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const copyButtons = document.querySelectorAll("[data-ip]");
const year = document.querySelector("#year");
const revealItems = document.querySelectorAll(".reveal");
const heroVisual = document.querySelector(".hero-visual");
const heroNoise = document.querySelector(".hero-noise");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const topbar = document.querySelector(".topbar");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const ip = button.dataset.ip;
    const originalText = button.textContent;

    try {
      await navigator.clipboard.writeText(ip);
      button.textContent = "IP Copied";
    } catch (error) {
      button.textContent = "Copy Failed";
    }

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1800);
  });
});

if (year) {
  year.textContent = new Date().getFullYear();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration = 420) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;

    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    const headerOffset = (topbar ? topbar.offsetHeight : 76) + 14;
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    const isNavLink = Boolean(link.closest(".nav"));
    const duration = isNavLink ? 280 : 420;
    smoothScrollTo(Math.max(0, targetY), duration);
    history.replaceState(null, "", id);
  });
});

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY;

      if (heroVisual) {
        heroVisual.style.transform = `translateY(${Math.min(y * 0.06, 24)}px)`;
      }

      if (heroNoise) {
        heroNoise.style.transform = `translateY(${Math.min(y * 0.03, 12)}px)`;
      }

      ticking = false;
    });
  },
  { passive: true }
);
