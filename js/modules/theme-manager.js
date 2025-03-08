class ThemeManager {
  constructor() {
    this.themeToggle = null;
    this.sunIcon = null;
    this.moonIcon = null;
  }

  cacheDOM() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.sunIcon = document.getElementById('sun-icon');
    this.moonIcon = document.getElementById('moon-icon');
  }

  attachEvents() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  initTheme() {
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const isDarkMode =
      document.documentElement.classList.contains('dark') || prefersDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      this.updateThemeIcon(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.updateThemeIcon(false);
    }
  }

  toggleTheme() {
    const htmlElement = document.documentElement;
    const isDarkMode = htmlElement.classList.contains('dark');
    htmlElement.classList.toggle('dark');
    this.updateThemeIcon(!isDarkMode);
  }

  updateThemeIcon(isDarkMode) {
    if (this.sunIcon && this.moonIcon) {
      if (isDarkMode) {
        this.sunIcon.classList.remove('hidden');
        this.moonIcon.classList.add('hidden');
      } else {
        this.sunIcon.classList.add('hidden');
        this.moonIcon.classList.remove('hidden');
      }
    }
  }
}

export default ThemeManager;
