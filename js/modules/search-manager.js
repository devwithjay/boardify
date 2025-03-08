class SearchManager {
  constructor(taskManager, uiManager) {
    this.taskManager = taskManager;
    this.uiManager = uiManager;
    this.searchInput = null;
    this.searchInputMob = null;
  }

  cacheDOM() {
    this.searchInput = document.getElementById('search-input');
    this.searchInputMob = document.getElementById('search-input-mob');
  }

  attachSearchEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', e =>
        this.taskManager.searchTasks(e.target.value),
      );
      this.searchInput.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.searchInput.value = '';
          this.taskManager.renderAllTasks();
        }
      });
    }

    if (this.searchInputMob) {
      this.searchInputMob.addEventListener('input', e =>
        this.taskManager.searchTasks(e.target.value),
      );
      this.searchInputMob.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.searchInputMob.value = '';
          this.taskManager.renderAllTasks();
        }
      });
    }
  }
}

export default SearchManager;
