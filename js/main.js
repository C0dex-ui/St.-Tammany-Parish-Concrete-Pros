/**
 * St. Tammany Parish Concrete Pros
 * Scroll progress · reveals · parallax · tilt · process depth · form
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isNarrow = () => window.innerWidth < 900;

  /* Year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Mobile nav */
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");

  function setNavOpen(open) {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNavOpen(false)));
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 980) setNavOpen(false);
    });
  }

  /* Scroll progress */
  const progress = document.getElementById("scrollProgress");
  function updateProgress() {
    if (!progress) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    progress.style.width = pct + "%";
  }

  /* Hero parallax (video or image) */
  const heroMedia = document.querySelector(".hero-bg .hero-video, .hero-bg img");
  const heroVideo = document.querySelector(".hero-video");

  if (heroVideo) {
    if (reduceMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
    } else {
      const playPromise = heroVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          /* Autoplay blocked — user gesture not required for muted, ignore */
        });
      }
    }
  }

  function updateParallax() {
    if (reduceMotion || isCoarsePointer || isNarrow() || !heroMedia) {
      if (heroMedia) heroMedia.style.transform = "";
      return;
    }
    const y = window.scrollY || 0;
    const hero = document.getElementById("hero");
    if (!hero) return;
    if (y < hero.offsetHeight + 80) {
      heroMedia.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(1.02)`;
    }
  }

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll(".reveal, .reveal-shot, .step");
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  function updateStepDepth() {
    /* Process board stays compact — no scroll depth transforms */
  }

  /* Pointer tilt on cards / form — desktop only */
  function initTilt(root) {
    if (reduceMotion || isCoarsePointer || isNarrow()) return;
    const els = (root || document).querySelectorAll("[data-tilt]");
    els.forEach((el) => {
      const max = el.classList.contains("quote-form") ? 4 : 7;
      el.addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * max;
        const ry = (x - 0.5) * max;
        const target = el.querySelector(".svc-face") || el;
        target.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
      });
      el.addEventListener("pointerleave", () => {
        const target = el.querySelector(".svc-face") || el;
        target.style.transform = "";
      });
    });
  }
  initTilt();

  /* Scroll RAF bundle */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      updateParallax();
      updateStepDepth();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Form */
  const form = document.getElementById("quoteForm");
  const status = document.getElementById("formStatus");

  function setInvalid(el, invalid) {
    if (!el) return;
    el.classList.toggle("is-invalid", invalid);
    el.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (status) {
        status.textContent = "";
        status.className = "form-note";
      }

      const fields = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        sqft: form.sqft,
        projectType: form.projectType,
        message: form.message,
      };

      let ok = true;
      Object.values(fields).forEach((el) => setInvalid(el, false));

      if (!fields.fullName.value.trim()) {
        setInvalid(fields.fullName, true);
        ok = false;
      }
      if (!fields.phone.value.trim() || fields.phone.value.replace(/\D/g, "").length < 10) {
        setInvalid(fields.phone, true);
        ok = false;
      }
      if (!fields.email.value.trim() || !isEmail(fields.email.value.trim())) {
        setInvalid(fields.email, true);
        ok = false;
      }
      if (!fields.address.value.trim()) {
        setInvalid(fields.address, true);
        ok = false;
      }
      if (!fields.sqft.value.trim()) {
        setInvalid(fields.sqft, true);
        ok = false;
      }
      if (!fields.projectType.value) {
        setInvalid(fields.projectType, true);
        ok = false;
      }
      if (!fields.message.value.trim()) {
        setInvalid(fields.message, true);
        ok = false;
      }

      if (!ok) {
        if (status) {
          status.textContent = "Please complete all required fields.";
          status.classList.add("error");
        }
        const firstBad = form.querySelector(".is-invalid");
        if (firstBad) firstBad.focus();
        return;
      }

      if (status) {
        status.textContent =
          "Thank you! Your quote request has been received. We’ll be in touch shortly.";
        status.classList.add("success");
      }
      form.reset();
    });

    form.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("input", () => setInvalid(el, false));
      el.addEventListener("change", () => setInvalid(el, false));
    });
  }
})();
