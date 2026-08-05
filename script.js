document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.getElementById('site-header');
  const menuButton = document.getElementById('menu-toggle');
  const menu = document.getElementById('site-nav-links');
  const themeButton = document.getElementById('theme-toggle');
  const backToTop = document.getElementById('back-to-top');
  const navLinks = Array.from(document.querySelectorAll('.nav-anchor'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setMenu = (open) => {
    if (!menu || !menuButton) return;
    menu.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    body.classList.toggle('menu-open', open);
  };

  menuButton?.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  menu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('click', (event) => {
    if (!menu?.classList.contains('open')) return;
    if (!menu.contains(event.target) && !menuButton?.contains(event.target)) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.classList.contains('open')) {
      setMenu(false);
      menuButton?.focus();
    }
  });

  window.matchMedia('(min-width: 781px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  const storedTheme = () => {
    try {
      return localStorage.getItem('theme');
    } catch (_) {
      return null;
    }
  };

  const updateThemeUI = () => {
    if (!themeButton) return;
    const isDark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(isDark));
    themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#151311' : '#ffffff');
  };

  const applyTheme = (theme, persist = false) => {
    if (theme === 'dark') root.dataset.theme = 'dark';
    else root.removeAttribute('data-theme');

    if (persist) {
      try {
        localStorage.setItem('theme', theme);
      } catch (_) {}
    }
    updateThemeUI();
  };

  themeButton?.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light');
  });

  updateThemeUI();

  const linkBySection = new Map(
    navLinks.map((link) => [link.getAttribute('href')?.slice(1), link])
  );

  const setCurrentSection = (sectionId) => {
    navLinks.forEach((link) => link.removeAttribute('aria-current'));
    linkBySection.get(sectionId)?.setAttribute('aria-current', 'location');
  };

  if ('IntersectionObserver' in window) {
    const visibleSections = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.intersectionRatio);
        else visibleSections.delete(entry.target.id);
      });

      const current = [...visibleSections.entries()].sort((a, b) => b[1] - a[1])[0];
      if (current) setCurrentSection(current[0]);
    }, {
      rootMargin: '-22% 0px -58% 0px',
      threshold: [0, 0.1, 0.3, 0.6]
    });

    sections.forEach((section) => observer.observe(section));
  } else {
    setCurrentSection('about');
  }

  let framePending = false;
  const updateScrollUI = () => {
    header?.classList.toggle('scrolled', window.scrollY > 8);
    backToTop?.classList.toggle('visible', window.scrollY > 650);
    framePending = false;
  };

  window.addEventListener('scroll', () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  document.getElementById('current-year').textContent = String(new Date().getFullYear());
  updateScrollUI();
});
