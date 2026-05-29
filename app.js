// ═══════════════════════════════════════
// INSIDE NARRATIVE MEDIA — App JS
// ═══════════════════════════════════════

(function () {
  "use strict";

  // ── Preloader ──
  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    setTimeout(() => {
      preloader.classList.add("preloader--hidden");
    }, 1200);
  });

  // ── Header scroll ──
  const header = document.getElementById("header");
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y > 60) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }
    lastScroll = y;
  }, { passive: true });

  // ── Mobile menu ──
  const burger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("mobile-menu--open");
      burger.classList.toggle("nav__burger--active");
      burger.setAttribute("aria-expanded", String(open));
      mobileMenu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("mobile-menu--open");
        burger.classList.remove("nav__burger--active");
        burger.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      });
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ── Video play on hover / autoplay in viewport ──
  const videoWraps = document.querySelectorAll("[data-autoplay]");
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    },
    { threshold: 0.3 }
  );
  videoWraps.forEach((v) => videoObserver.observe(v));

  // ── Video Modal ──
  // Create modal
  const modal = document.createElement("div");
  modal.className = "video-modal";
  modal.innerHTML = `
    <div class="video-modal__inner">
      <button class="video-modal__close">Close &times;</button>
      <video class="video-modal__video" controls></video>
    </div>
  `;
  document.body.appendChild(modal);

  const modalInner = modal.querySelector(".video-modal__inner");
  const modalVideo = modal.querySelector(".video-modal__video");
  const modalClose = modal.querySelector(".video-modal__close");

  function openModal(src, isVertical) {
    modalVideo.src = src;
    modalInner.classList.toggle("video-modal__inner--vertical", isVertical);
    modal.classList.add("video-modal--open");
    document.body.style.overflow = "hidden";
    modalVideo.play().catch(() => {});
  }
  function closeModal() {
    modal.classList.remove("video-modal--open");
    document.body.style.overflow = "";
    modalVideo.pause();
    modalVideo.src = "";
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Attach play buttons
  document.querySelectorAll(".project__play").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".project__video-wrap");
      const vid = wrap.querySelector("video source");
      const isVertical = wrap.classList.contains("project__video-wrap--vertical");
      if (vid) openModal(vid.src, isVertical);
    });
  });

  // ── Stat counter animation ──
  const statNumbers = document.querySelectorAll("[data-count]");
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCount(el, 0, target, 1200);
          statObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  statNumbers.forEach((el) => statObserver.observe(el));

  function animateCount(el, start, end, duration) {
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── Fallback fade-in for browsers without scroll-driven animations ──
  if (!CSS.supports("animation-timeline", "scroll()")) {
    const fadeEls = document.querySelectorAll(".fade-in");
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transition = "opacity 0.6s cubic-bezier(0.16,1,0.3,1)";
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeEls.forEach((el) => {
      el.style.opacity = "0";
      fadeObserver.observe(el);
    });
  }

  // ── Contact Form ──
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = "Sending…";
      btn.disabled = true;

      try {
        const res = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        if (data.success) {
          contactForm.innerHTML =
            '<p class="contact__success">Message sent — we\'ll be in touch soon.</p>';
        } else {
          throw new Error("failed");
        }
      } catch {
        btn.textContent = originalText;
        btn.disabled = false;
        let err = contactForm.querySelector(".contact__error");
        if (!err) {
          err = document.createElement("p");
          err.className = "contact__error";
          contactForm.appendChild(err);
        }
        err.textContent =
          "Something went wrong. Please try again or email us directly at insidenarrativemedia@gmail.com.";
      }
    });
  }

  // ── Duplicate gallery images for seamless marquee ──
  const galleryTrack = document.querySelector(".gallery__track");
  if (galleryTrack) {
    const clone = galleryTrack.innerHTML;
    galleryTrack.innerHTML += clone;
  }
})();
