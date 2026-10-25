(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.querySelector(".theme-label");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  function setTheme(theme) {
    root.dataset.theme = theme;

    const isLight = theme === "light";
    themeIcon.textContent = isLight ? "☾" : "☼";
    themeLabel.textContent = isLight ? "Dark mode" : "Light mode";
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark theme" : "Switch to light theme"
    );

    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
      themeColor.content = isLight ? "#f7f9fd" : "#0b1020";
    }
  }

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("portfolio-theme");
  } catch (error) {
    savedTheme = null;
  }

  const preferredTheme = window.matchMedia(
    "(prefers-color-scheme: light)"
  ).matches
    ? "light"
    : "dark";

  setTheme(savedTheme || preferredTheme);

  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch (error) {
      // The theme still works if browser storage is unavailable.
    }
  });

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          navLinks.querySelectorAll("a").forEach((link) => {
            const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;

            if (isCurrent) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }
})();
