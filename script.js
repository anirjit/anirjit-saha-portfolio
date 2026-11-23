document.documentElement.classList.add("js");

const forceMotion = new URLSearchParams(window.location.search).get("motion") === "full";
if (forceMotion) document.documentElement.classList.add("force-motion");

const revealItems = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceMotion;

document.querySelectorAll("details.auto-expand").forEach((details) => {
  const summary = details.querySelector("summary");
  let hovered = false;
  let focused = false;
  let pinned = false;
  let openTimer = null;
  let closeTimer = null;
  const hoverOpenDelay = reduceMotion ? 0 : 260;
  const hoverCloseDelay = reduceMotion ? 0 : 190;

  const syncOpenState = () => {
    details.open = hovered || focused || pinned;
  };

  details.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      window.clearTimeout(closeTimer);
      window.clearTimeout(openTimer);
      closeTimer = null;
      openTimer = window.setTimeout(() => {
        openTimer = null;
        hovered = true;
        syncOpenState();
      }, hoverOpenDelay);
    }
  });

  details.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      openTimer = null;
      closeTimer = window.setTimeout(() => {
        closeTimer = null;
        hovered = false;
        syncOpenState();
      }, hoverCloseDelay);
    }
  });

  details.addEventListener("focusin", () => {
    focused = true;
    syncOpenState();
  });

  details.addEventListener("focusout", (event) => {
    if (!details.contains(event.relatedTarget)) {
      focused = false;
      syncOpenState();
    }
  });

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    pinned = !pinned;
    syncOpenState();
  });
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const countItems = document.querySelectorAll("[data-count]");
const countUp = (item) => {
  const target = Number(item.dataset.count);
  const suffix = item.dataset.suffix || "";
  const duration = 900;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    item.textContent = `${current.toLocaleString("en-IN")}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

if (!reduceMotion && "IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  countItems.forEach((item) => countObserver.observe(item));
}

const root = document.documentElement;
const prefersFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Theme toggle (initial theme is applied in <head> to avoid a flash)
const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const applyTheme = (theme) => {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  if (themeColorMeta) themeColorMeta.content = theme === "dark" ? "#0d191c" : "#f6f4ee";
};
applyTheme(root.dataset.theme === "dark" ? "dark" : "light");
themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
});

// Scroll progress bar and timeline fill
const timeline = document.querySelector(".timeline");
let scrollTicking = false;
const updateScroll = () => {
  const max = root.scrollHeight - window.innerHeight;
  root.style.setProperty("--sp", max > 0 ? Math.min(window.scrollY / max, 1).toFixed(4) : 0);
  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    const progress = (window.innerHeight * 0.6 - rect.top) / rect.height;
    timeline.style.setProperty("--tp", Math.min(Math.max(progress, 0), 1).toFixed(4));
  }
  scrollTicking = false;
};
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(updateScroll);
  }
}, { passive: true });
window.addEventListener("resize", updateScroll);
updateScroll();

// Highlight the nav link for the section in view
const navLinks = new Map([...document.querySelectorAll(".site-nav a")].map((link) => [link.hash, link]));
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link, hash) => {
        if (hash === `#${entry.target.id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((link, hash) => {
    const section = document.querySelector(hash);
    if (section) spy.observe(section);
  });
  const hero = document.querySelector("#top");
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) navLinks.forEach((link) => link.removeAttribute("aria-current"));
  }, { rootMargin: "-45% 0px -50% 0px" }).observe(hero);
}

// Cursor spotlight on cards (mouse and pen only)
if (prefersFinePointer && !reduceMotion) {
  document.querySelectorAll(".metric-card, .timeline-content, .expertise-card, .about-card").forEach((card) => {
    card.classList.add("spotlight");
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

// Hero access map: each requester sends a request to the policy decision point
const trustVisual = document.querySelector(".trust-visual");
if (trustVisual && !reduceMotion) {
  const sats = [...trustVisual.querySelectorAll(".map-sat")];
  const links = [...trustVisual.querySelectorAll(".map-links path")];
  const coreDisc = trustVisual.querySelector(".core-disc");
  const packet = trustVisual.querySelector(".map-packet");
  const readout = trustVisual.querySelector(".decision-copy");
  const title = trustVisual.querySelector("[data-decision-title]");
  const detail = trustVisual.querySelector("[data-decision-detail]");
  const ends = links.map((path) => ({
    from: path.getPointAtLength(0),
    to: path.getPointAtLength(path.getTotalLength())
  }));
  const scenarios = [
    { sat: 0, state: "allow", title: "Employee · Allow", detail: "Role and context match policy" },
    { sat: 1, state: "allow", title: "Customer · Allow", detail: "Passwordless sign-in, verified" },
    { sat: 4, state: "step", title: "Device · Step-up", detail: "Unmanaged device, MFA required" },
    { sat: 2, state: "allow", title: "Service · Allow", detail: "Scoped token, single resource" },
    { sat: 3, state: "deny", title: "AI agent · Deny", detail: "Unapproved MCP server blocked" }
  ];
  const travelMs = 1000;
  let index = -1;

  const play = () => {
    if (document.hidden) return;
    index = (index + 1) % scenarios.length;
    const { sat, state, title: heading, detail: copy } = scenarios[index];
    const { from, to } = ends[sat];
    trustVisual.dataset.state = state;
    sats.forEach((node, i) => node.classList.toggle("is-active", i === sat));
    links.forEach((link, i) => link.classList.toggle("is-active", i === sat));
    coreDisc.classList.remove("is-pulsing");
    packet.animate([
      { transform: `translate(${from.x}px, ${from.y}px)`, opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { transform: `translate(${to.x}px, ${to.y}px)`, opacity: 1, offset: 0.9 },
      { transform: `translate(${to.x}px, ${to.y}px)`, opacity: 0 }
    ], { duration: travelMs, easing: "ease-in-out" });
    window.setTimeout(() => {
      void coreDisc.getBoundingClientRect();
      coreDisc.classList.add("is-pulsing");
      title.textContent = heading;
      detail.textContent = copy;
      readout.classList.remove("is-updating");
      void readout.offsetWidth;
      readout.classList.add("is-updating");
    }, travelMs * 0.9);
  };

  window.setTimeout(() => {
    play();
    window.setInterval(play, 3600);
  }, 900);
}

// Experience filter
const filterChips = document.querySelectorAll(".filter-chip");
const timelineItems = document.querySelectorAll(".timeline-item");
filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;
    filterChips.forEach((other) => {
      const active = other === chip;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    timelineItems.forEach((item) => {
      item.hidden = filter !== "all" && !item.dataset.tags.split(" ").includes(filter);
    });
    updateScroll();
  });
});
