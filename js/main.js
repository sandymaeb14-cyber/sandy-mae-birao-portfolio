(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector("[data-theme-toggle]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-site-nav]");
  const progress = document.querySelector("[data-scroll-progress]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let savedTheme = null;
  try { savedTheme = localStorage.getItem("sandy-portfolio-theme"); } catch (_) { /* Storage can be unavailable in private browsing. */ }
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;

  if (themeButton) {
    const updateThemeLabel = () => {
      const isDark = root.dataset.theme === "dark" || (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      themeButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeButton.setAttribute("aria-pressed", String(isDark));
      themeButton.textContent = isDark ? "☼" : "☾";
    };
    updateThemeLabel();
    themeButton.addEventListener("click", () => {
      const isDark = root.dataset.theme === "dark" || (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.dataset.theme = isDark ? "light" : "dark";
      try { localStorage.setItem("sandy-portfolio-theme", root.dataset.theme); } catch (_) { /* Theme still works for this page. */ }
      updateThemeLabel();
    });
  }

  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("is-open", !expanded);
    });
    menu.addEventListener("click", event => {
      if (event.target.closest("a")) {
        menuButton.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.focus();
      }
    });
  }

  const startCount = element => {
    if (!element || element.dataset.countStarted) return;
    element.dataset.countStarted = "true";
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reducedMotion) { element.textContent = String(target); return; }
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / 1000, 1);
      element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(item => {
      item.classList.add("is-visible");
      startCount(item.querySelector("[data-count]"));
    });
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          startCount(entry.target.querySelector("[data-count]"));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  }

  const role = document.querySelector("[data-role-rotator]");
  if (role && !reducedMotion) {
    const roles = ["Virtual Assistant"];
    let index = 0;
    window.setInterval(() => {
      role.classList.add("is-changing");
      window.setTimeout(() => {
        index = (index + 1) % roles.length;
        role.textContent = roles[index];
        role.classList.remove("is-changing");
      }, 200);
    }, 2800);
  }

  if (progress) {
    let scheduled = false;
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
      scheduled = false;
    };
    window.addEventListener("scroll", () => {
      if (!scheduled) {
        window.requestAnimationFrame(updateProgress);
        scheduled = true;
      }
    }, { passive: true });
    updateProgress();
  }

  const photoDialog = document.querySelector("[data-photo-modal]");
  const photoViewer = photoDialog && photoDialog.querySelector("[data-photo-viewer]");
  const photoTriggers = Array.from(document.querySelectorAll("[data-photo-open]"));
  if (photoDialog && photoViewer && photoTriggers.length) {
    let currentPhoto = 0;
    const showPhoto = index => {
      currentPhoto = (index + photoTriggers.length) % photoTriggers.length;
      photoViewer.src = photoTriggers[currentPhoto].dataset.photoSrc;
    };
    photoTriggers.forEach((button, index) => button.addEventListener("click", () => {
      showPhoto(index);
      photoDialog.showModal();
    }));
    photoDialog.querySelector("[data-photo-close]").addEventListener("click", () => photoDialog.close());
    photoDialog.querySelector("[data-photo-previous]").addEventListener("click", () => showPhoto(currentPhoto - 1));
    photoDialog.querySelector("[data-photo-next]").addEventListener("click", () => showPhoto(currentPhoto + 1));
    photoDialog.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); showPhoto(currentPhoto - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); showPhoto(currentPhoto + 1); }
    });
    photoDialog.addEventListener("close", () => photoViewer.removeAttribute("src"));
    photoDialog.addEventListener("click", event => {
      if (event.target === photoDialog) photoDialog.close();
    });
  }

  const videoDialog = document.querySelector("[data-video-modal]");
  const videoPlayer = videoDialog && videoDialog.querySelector("[data-video-player]");
  if (videoDialog && videoPlayer) {
    const closeVideo = () => {
      videoPlayer.pause();
      videoPlayer.removeAttribute("src");
      videoPlayer.removeAttribute("poster");
      videoPlayer.load();
    };
    document.querySelectorAll("[data-video-open]").forEach(button => {
      button.addEventListener("click", () => {
        videoPlayer.src = button.dataset.videoSrc;
        videoPlayer.poster = button.dataset.videoPoster;
        videoDialog.showModal();
        const playback = videoPlayer.play();
        if (playback && typeof playback.catch === "function") playback.catch(() => {});
      });
    });
    const closeButton = videoDialog.querySelector("[data-video-close]");
    if (closeButton) closeButton.addEventListener("click", () => videoDialog.close());
    videoDialog.addEventListener("close", closeVideo);
    videoDialog.addEventListener("click", event => {
      if (event.target === videoDialog) videoDialog.close();
    });
  }

  if (!reducedMotion) {
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
      link.addEventListener("click", event => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
        event.preventDefault();
        document.body.classList.add("is-leaving");
        window.setTimeout(() => window.location.assign(url.href), 120);
      });
    });
  }
})();
