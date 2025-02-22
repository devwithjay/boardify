document.addEventListener('DOMContentLoaded', () => {
  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    const isDarkMode = htmlElement.classList.contains('dark');

    htmlElement.classList.toggle('dark');
    updateThemeIcon(!isDarkMode);
  };

  const updateThemeIcon = isDarkMode => {
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    if (isDarkMode) {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  };

  const initTheme = () => {
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const isDarkMode =
      document.documentElement.classList.contains('dark') || prefersDarkMode;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      updateThemeIcon(true);
    } else {
      document.documentElement.classList.remove('dark');
      updateThemeIcon(false);
    }
  };

  document
    .getElementById('theme-toggle')
    .addEventListener('click', toggleTheme);

  initTheme();
});
