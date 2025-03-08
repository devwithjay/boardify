class UIManager {
  constructor(boardManager, taskManager, dragDropManager) {
    this.boardManager = boardManager;
    this.taskManager = taskManager;
    this.dragDropManager = dragDropManager;
  }

  cacheDOM() {
    this.editBoardModal = document.getElementById('edit-board-modal');
    this.closeEditBoardModal = document.getElementById(
      'close-edit-board-modal',
    );
    this.editBoardForm = document.getElementById('edit-board-form');
    this.boardNameInput = document.getElementById('board-name-input');
    this.boardColorInput = document.getElementById('board-color-input');
    this.cancelEditBoard = document.getElementById('cancel-edit-board');
    this.clearBoardBtn = document.getElementById('clear-board-btn');
    this.taskModal = document.getElementById('task-modal');
    this.taskForm = document.getElementById('task-form');
  }

  attachGlobalEvents() {
    if (this.clearBoardBtn) {
      this.clearBoardBtn.addEventListener('click', () => {
        if (
          confirm('Are you sure you want to clear all tasks from this board?')
        ) {
          if (this.boardManager.clearBoard(this.taskManager)) {
            this.taskManager.renderAllTasks();
          }
        }
      });
    }

    if (this.closeEditBoardModal) {
      this.closeEditBoardModal.addEventListener('click', () =>
        this.boardManager.hideEditBoardModal(),
      );
    }

    if (this.cancelEditBoard) {
      this.cancelEditBoard.addEventListener('click', () =>
        this.boardManager.hideEditBoardModal(),
      );
    }

    const closeModalButtons = this.taskModal.querySelectorAll(
      'button:not([type="submit"])',
    );
    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.taskManager.hideTaskModal();
      });
    });

    this.taskForm.addEventListener('submit', e => {
      e.preventDefault();
      this.taskManager.handleTaskFormSubmit();
    });
  }

  attachBoardEventListeners(boardManager, taskManager, dragDropManager) {
    document.querySelectorAll('.board-options-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const index = btn.dataset.index;
        const menu = document.querySelector(
          `.board-options-menu[data-index="${index}"]`,
        );
        document.querySelectorAll('.board-options-menu').forEach(m => {
          if (m !== menu) m.classList.add('hidden');
        });
        menu.classList.toggle('hidden');
      });
    });

    document.addEventListener('click', () => {
      document
        .querySelectorAll('.board-options-menu')
        .forEach(menu => menu.classList.add('hidden'));
    });

    document.querySelectorAll('.edit-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = Number.parseInt(btn.dataset.index, 10);
        boardManager.openEditBoardModal(index);
      });
    });

    document.querySelectorAll('.delete-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = Number.parseInt(btn.dataset.index, 10);
        if (boardManager.deleteBoard(index, taskManager)) {
          boardManager.renderBoards(this, taskManager, dragDropManager);
        }
      });
    });

    document.querySelectorAll('.sort-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = Number.parseInt(btn.dataset.index, 10);
        boardManager.showSortOptions(index, taskManager);
      });
    });

    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = Number.parseInt(btn.dataset.index, 10);
        taskManager.openTaskModal(index);
      });
    });

    document.querySelectorAll('.add-task-btn').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const index = Number.parseInt(button.dataset.index, 10);
        taskManager.openTaskModal(index);
      });
    });

    const taskLists = document.querySelectorAll('.task-list');
    dragDropManager.setupDragAndDrop(taskLists);
  }
}

export default UIManager;
