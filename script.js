document.documentElement.classList.add("js");

const revealItems = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("details.auto-expand").forEach((details) => {
  const summary = details.querySelector("summary");
  let hovered = false;
  let focused = false;
  let pinned = false;

  const syncOpenState = () => {
    details.open = hovered || focused || pinned;
  };

  details.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      hovered = true;
      syncOpenState();
    }
  });

  details.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      hovered = false;
      syncOpenState();
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
