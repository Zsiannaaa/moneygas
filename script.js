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

const SERVER_API = "https://api.mcstatus.io/v2/status/java/moneygas.ultramc.co";
const statusEl = document.getElementById("server-status");
const statusText = document.getElementById("status-text");
const statusDot = statusEl ? statusEl.querySelector(".status-dot") : null;
const playerCountEl = document.getElementById("player-count");
const serverVersionEl = document.getElementById("server-version");

async function fetchServerStatus() {
  try {
    const res = await fetch(SERVER_API);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    if (statusText) {
      if (data.online) {
        statusText.textContent = `${data.players.online}/${data.players.max} Online`;
        if (statusDot) statusDot.classList.remove("status-dot--offline");
        if (statusEl) statusEl.classList.remove("server-status--offline");
      } else {
        statusText.textContent = "Offline";
        if (statusDot) statusDot.classList.add("status-dot--offline");
        if (statusEl) statusEl.classList.add("server-status--offline");
      }
    }

    if (playerCountEl) {
      playerCountEl.textContent = data.online ? `${data.players.online} / ${data.players.max}` : "Offline";
    }

    if (serverVersionEl && data.version && data.version.name_clean) {
      serverVersionEl.textContent = data.version.name_clean;
    }

    if (data.players && data.players.list) {
      renderOnlinePlayers(data.players.list);
    } else {
      renderOnlinePlayers([]);
    }
  } catch {
    if (statusText) statusText.textContent = "Status Unknown";
    if (playerCountEl) playerCountEl.textContent = "—";
    renderOnlinePlayers([]);
  }
}

const FEATURED_PLAYERS = [
  "Zsiannaaa",
  "Notch",
  "Dream",
  "Technoblade",
  "CaptainSparklez"
];

const onlineGrid = document.getElementById("online-players");
const featuredGrid = document.getElementById("featured-players");

function createSkinCard(name, uuid, isOnline) {
  const card = document.createElement("div");
  card.className = "skin-card";

  const img = document.createElement("img");
  img.src = `https://crafatar.com/renders/body/${uuid}?scale=3&overlay`;
  img.alt = `${name} skin`;
  img.loading = "lazy";
  img.onerror = () => {
    img.src = `https://crafatar.com/avatars/${uuid}?size=54&overlay`;
  };

  const nameEl = document.createElement("span");
  nameEl.className = "skin-card-name";
  nameEl.textContent = name;

  card.appendChild(img);
  card.appendChild(nameEl);

  if (isOnline) {
    const status = document.createElement("span");
    status.className = "skin-card-status";
    status.textContent = "Online";
    card.appendChild(status);
  }

  return card;
}

function renderOnlinePlayers(players) {
  if (!onlineGrid) return;
  onlineGrid.innerHTML = "";

  if (!players || players.length === 0) {
    const empty = document.createElement("div");
    empty.className = "skin-empty";
    empty.textContent = "No survivors online right now.";
    onlineGrid.appendChild(empty);
    return;
  }

  players.forEach((player) => {
    if (player.name && player.uuid) {
      onlineGrid.appendChild(createSkinCard(player.name, player.uuid, true));
    }
  });
}

async function fetchFeaturedPlayers() {
  if (!featuredGrid) return;

  for (const username of FEATURED_PLAYERS) {
    try {
      const res = await fetch(`https://api.ashcon.app/mojang/v2/user/${username}`);
      if (!res.ok) continue;
      const data = await res.json();
      featuredGrid.appendChild(createSkinCard(data.username, data.uuid, false));
    } catch {
      const fallback = document.createElement("div");
      fallback.className = "skin-card";
      fallback.innerHTML = `<img src="https://crafatar.com/avatars/00000000000000000000000000000000?size=54&overlay" alt="${username}"><span class="skin-card-name">${username}</span>`;
      featuredGrid.appendChild(fallback);
    }
  }

  if (featuredGrid.querySelector(".skin-loading")) {
    featuredGrid.querySelector(".skin-loading").remove();
  }
}

fetchFeaturedPlayers();

fetchServerStatus();
setInterval(fetchServerStatus, 30000);

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
