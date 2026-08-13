/* =========================================================
   10n20 — IT Support Jammu
   Shared JavaScript
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    var root = document.documentElement;
    var stored = localStorage.getItem("itsite-theme");
    var theme = stored || "dark";
    root.setAttribute("data-theme", theme);

    var toggles = document.querySelectorAll(".theme-toggle");
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      btn.addEventListener("click", function () {
        var current = root.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("itsite-theme", next);
        toggles.forEach(function (b) {
          b.setAttribute("aria-pressed", next === "light" ? "true" : "false");
        });
      });
    });
  }

  /* ---------- Navbar scroll effect ---------- */
  function initNavbarScroll() {
    var nav = document.querySelector(".navbar");
    if (!nav) return;
    function onScroll() {
      if (window.scrollY > 12) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var hamburger = document.querySelector(".hamburger");
    var menu = document.querySelector(".mobile-menu");
    if (!hamburger || !menu) return;

    function closeMenu() {
      menu.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    }
    function openMenu() {
      menu.classList.add("open");
      hamburger.setAttribute("aria-expanded", "true");
    }

    hamburger.addEventListener("click", function () {
      var expanded = hamburger.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (e) {
      if (
        menu.classList.contains("open") &&
        !menu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
        hamburger.focus();
      }
    });
  }

  /* ---------- Active nav link ---------- */
  function initActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      var hrefFile = href.split("#")[0];
      if (hrefFile === path || (path === "" && hrefFile === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal, .reveal-stagger, .tl-step");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("in-view");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    var yearEls = document.querySelectorAll("[data-year]");
    var year = new Date().getFullYear();
    yearEls.forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ---------- Contact form validation ---------- */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var successBox = document.getElementById("form-success");

    var validators = {
      name: function (v) {
        return v.trim().length >= 2;
      },
      phone: function (v) {
        return /^[0-9+\-\s()]{7,15}$/.test(v.trim());
      },
      email: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
      },
      service: function (v) {
        return v.trim().length > 0;
      },
      message: function (v) {
        return v.trim().length >= 10;
      },
    };

    function validateField(field) {
      var name = field.name;
      var wrapper = field.closest(".field");
      if (!validators[name] || !wrapper) return true;
      var valid = validators[name](field.value);
      wrapper.classList.toggle("invalid", !valid);
      return valid;
    }

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.closest(".field").classList.contains("invalid")) {
          validateField(field);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll("input[name], select[name], textarea[name]");
      var allValid = true;
      var firstInvalid = null;

      fields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
        if (!ok) allValid = false;
      });

      if (!allValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        service: form.service.value,
        message: form.message.value.trim(),
      };

      if (successBox) {
        successBox.classList.add("show");
        successBox.setAttribute("tabindex", "-1");
        successBox.focus();
      }

      var mailLink = document.getElementById("mailto-fallback");
      if (mailLink) {
        var subject = encodeURIComponent("IT Support Request — " + data.service);
        var body = encodeURIComponent(
          "Name: " + data.name +
          "\nPhone: " + data.phone +
          "\nEmail: " + data.email +
          "\nService required: " + data.service +
          "\n\nMessage:\n" + data.message
        );
        mailLink.href = "mailto:aryan96874@gmail.com?subject=" + subject + "&body=" + body;
      }

      form.reset();
      form.querySelectorAll(".field").forEach(function (f) {
        f.classList.remove("invalid");
      });
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNavbarScroll();
    initMobileMenu();
    initActiveNav();
    initScrollReveal();
    initFooterYear();
    initContactForm();
  });
})();
