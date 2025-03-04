document.addEventListener('DOMContentLoaded', () => {
  const app = new Boardify();
  app.init();
  document.addEventListener('dragover', e => {
    e.preventDefault();
    app.autoScrollOnDrag(e);
  });
});

class Boardify {
  constructor() {
    this.boards = JSON.parse(localStorage.getItem('boards')) || [
      {title: 'To Do', color: '#7dd3fc'},
      {title: 'In Progress', color: '#fde68a'},
      {title: 'Done', color: '#86efac'},
    ];
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.filteredTasks = [...this.tasks];
    this.currentBoardIndex = null;
    this.editingTaskId = null;
    this.taskPlaceholder = document.createElement('div');
    this.taskPlaceholder.className =
      'task-placeholder border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-[#202227]';
    this.taskClone = null;
  }

  init() {
    this.cacheDOM();
    this.initTheme();
    this.attachGlobalEvents();
    this.attachSearchEvents();
    this.renderBoards();
  }

  cacheDOM() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.sunIcon = document.getElementById('sun-icon');
    this.moonIcon = document.getElementById('moon-icon');
    this.boardsContainer = document.querySelector('.board');
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
    this.searchInput = document.getElementById('search-input');
    this.searchInputMob = document.getElementById('search-input-mob');
  }

  attachGlobalEvents() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    if (this.clearBoardBtn) {
      this.clearBoardBtn.addEventListener('click', () => {
        if (
          confirm('Are you sure you want to clear all tasks from this board?')
        ) {
          this.clearBoard();
        }
      });
    }
    if (this.closeEditBoardModal) {
      this.closeEditBoardModal.addEventListener('click', () =>
        this.hideEditBoardModal(),
      );
    }
    if (this.cancelEditBoard) {
      this.cancelEditBoard.addEventListener('click', () =>
        this.hideEditBoardModal(),
      );
    }
    const closeModalButtons = this.taskModal.querySelectorAll(
      'button:not([type="submit"])',
    );
    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.hideTaskModal();
      });
    });
    this.taskForm.addEventListener('submit', e => {
      e.preventDefault();
      this.handleTaskFormSubmit();
    });
  }

  attachSearchEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', e =>
        this.searchTasks(e.target.value),
      );
      this.searchInput.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.searchInput.value = '';
          this.renderAllTasks();
        }
      });
    }
    if (this.searchInputMob) {
      this.searchInputMob.addEventListener('input', e =>
        this.searchTasks(e.target.value),
      );
      this.searchInputMob.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          this.searchInputMob.value = '';
          this.renderAllTasks();
        }
      });
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

  saveBoards() {
    localStorage.setItem('boards', JSON.stringify(this.boards));
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.renderAllTasks();
  }

  addNewBoard() {
    const boardTitle = prompt('Enter the name of the new board:');
    if (!boardTitle || boardTitle.trim() === '') {
      alert('Board name cannot be empty.');
      return;
    }
    const newBoard = {
      title: boardTitle.trim(),
      color: '#9CA3AF',
    };
    this.boards.push(newBoard);
    this.saveBoards();
    this.renderBoards();
  }

  renderBoards() {
    if (!this.boardsContainer) return;
    this.boardsContainer.innerHTML = '';
    this.boards.forEach((board, index) => {
      const boardElement = document.createElement('div');
      boardElement.className =
        'rounded-lg min-h-[74dvh] md:min-h-[78dvh] overflow-hidden flex flex-col w-[350px] xl:w-[420px] flex-shrink-0';
      boardElement.innerHTML = `
        <div class="my-4">
          <div class="flex justify-between items-center flex-shrink-0 relative">
          <div>
            <h3 style="background: ${board.color}; color: ${this.getContrastingText(board.color)}"
              class="font-semibold text-sm md:text-base px-2 py-1 rounded">
              ${board.title}
            </h3>
          </div>
            <div class="flex items-center space-x-2">
              <button class="plus-btn cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-700/ 20 p-1 rounded transition-colors" data-index="${index}">
                <i class="fas fa-plus text-sm"></i>
              </button>
              <button class="board-options-btn cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-white/20  dark:hover:bg-gray-700/20 p-1 rounded transition-colors" data-index="${index}">
                <i class="fas fa-ellipsis-h text-sm"></i>
              </button>
            <div class="board-options-menu hidden absolute right-0 top-full mt-1 bg-white dark:bg-[#121617] rounded shadow-lg z-10 w-32 py-1" data-index="${index}">
              <button class="edit-board-btn w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" data-index="${index}">
                <i class="fas fa-pencil-alt mr-2"></i> Edit
              </button>
              <button class="delete-board-btn w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" data-index="${index}">
                <i class="fas fa-trash mr-2"></i> Delete
              </button>
              <button class="sort-board-btn w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" data-index="${index}">
                <i class="fas fa-sort mr-2"></i> Sort
              </button>
            </div>
          </div>
        </div>
        </div>
        <div class="task-list bg-gray-50 dark:bg-[#202227] flex-grow p-3 overflow-y-auto space-y-3 h-full" data-index="${index}"></div>
          <div class="bg-gray-50 dark:bg-[#202227] flex-shrink-0 p-4">
            <button class="add-task-btn text-[14px] flex w-full cursor-pointer items-center justify-center gap-2 text-gray-600 transition-opacity duration-200 ease-in-out hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200" data-index="${index}">
          <i class="fas fa-plus text-[12px]"></i> Add Task
        </button>
      </div>
    `;
      this.boardsContainer.appendChild(boardElement);
    });

    const addBoardButton = document.createElement('button');
    addBoardButton.id = 'add-new-board-btn';
    addBoardButton.className =
      'flex min-w-[360px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-400 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-[#202227] dark:hover:text-gray-300';
    addBoardButton.innerHTML = `
        <i class="fas fa-plus fa-2x mb-2"></i>
        <span class="font-medium">Add New Board</span>
    `;
    addBoardButton.addEventListener('click', () => this.addNewBoard());
    this.boardsContainer.appendChild(addBoardButton);
    this.attachBoardEventListeners();
    this.renderAllTasks();
  }

  attachBoardEventListeners() {
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
        const index = parseInt(btn.dataset.index, 10);
        this.openEditBoardModal(index);
      });
    });

    document.querySelectorAll('.delete-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        this.deleteBoard(index);
      });
    });

    document.querySelectorAll('.sort-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        this.showSortOptions(index);
      });
    });

    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        this.openTaskModal(index);
      });
    });

    document.querySelectorAll('.add-task-btn').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const index = parseInt(button.dataset.index, 10);
        this.openTaskModal(index);
      });
    });

    document.querySelectorAll('.task-list').forEach(column => {
      column.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingTask = document.querySelector('.dragging');
        if (!draggingTask) return;
        const afterElement = this.getDragAfterElement(column, e.clientY);
        this.taskPlaceholder.style.height = `${draggingTask.offsetHeight}px`;
        this.taskPlaceholder.style.width = `${draggingTask.offsetWidth}px`;
        document
          .querySelectorAll('.task-placeholder')
          .forEach(el => el.remove());
        if (!afterElement) {
          column.appendChild(this.taskPlaceholder);
        } else {
          column.insertBefore(this.taskPlaceholder, afterElement);
        }
      });

      column.addEventListener('dragleave', e => {
        if (e.currentTarget === e.target && !column.contains(e.relatedTarget)) {
          document
            .querySelectorAll('.task-placeholder')
            .forEach(el => el.remove());
        }
      });

      column.addEventListener('drop', e => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const taskElement = document.getElementById(`task-${taskId}`);
        if (taskElement) {
          const afterElement = this.getDragAfterElement(column, e.clientY);
          document
            .querySelectorAll('.task-placeholder')
            .forEach(el => el.remove());
          if (!afterElement) {
            column.appendChild(taskElement);
          } else {
            column.insertBefore(taskElement, afterElement);
          }
          taskElement.classList.remove('invisible', 'dragging');
          const taskIndex = this.tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            const newColumnIndex = parseInt(column.dataset.index, 10);
            this.tasks[taskIndex].column = newColumnIndex;
            const updatedTaskList = Array.from(
              column.querySelectorAll('.task'),
            ).map(taskEl => taskEl.dataset.taskId);
            const taskToMove = this.tasks.splice(taskIndex, 1)[0];
            let insertIndex = this.tasks.findIndex(
              task =>
                task.column === newColumnIndex &&
                updatedTaskList.indexOf(task.id) >
                  updatedTaskList.indexOf(taskId),
            );
            if (insertIndex === -1) {
              insertIndex = this.tasks.length;
            }
            this.tasks.splice(insertIndex, 0, taskToMove);
            this.saveTasks();
          }
        }
      });
    });
  }

  openEditBoardModal(index) {
    this.currentBoardIndex = index;
    this.boardNameInput.value = this.boards[index].title;
    this.boardColorInput.value = this.boards[index].color;
    this.editBoardModal.classList.remove('hidden');
    this.editBoardModal.classList.add('flex');
    this.editBoardForm.onsubmit = e => {
      e.preventDefault();
      this.updateBoard(index);
    };
  }

  hideEditBoardModal() {
    this.editBoardModal.classList.add('hidden');
    this.editBoardModal.classList.remove('flex');
  }

  updateBoard(index) {
    this.boards[index] = {
      title: this.boardNameInput.value,
      color: this.boardColorInput.value,
    };
    this.saveBoards();
    this.renderBoards();
    this.renderAllTasks();
    this.hideEditBoardModal();
  }

  deleteBoard(index) {
    if (
      !confirm(
        'Are you sure you want to delete this board? This action cannot be undone.',
      )
    )
      return;
    this.boards.splice(index, 1);
    this.saveBoards();
    this.tasks = this.tasks.filter(task => task.column !== index);
    this.tasks.forEach(task => {
      if (task.column > index) {
        task.column -= 1;
      }
    });
    this.saveTasks();
    this.renderBoards();
    this.renderAllTasks();
  }

  clearBoard() {
    if (this.currentBoardIndex !== null) {
      this.tasks = this.tasks.filter(
        task => task.column !== this.currentBoardIndex,
      );
      this.saveTasks();
      this.renderAllTasks();
      this.hideEditBoardModal();
    }
  }

  openTaskModal(index, task = null) {
    this.taskForm.dataset.targetColumn = index;
    if (task) {
      this.editingTaskId = task.id;
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-description').value =
        task.description || '';
      document.getElementById('task-priority').value = task.priority;
      document.getElementById('task-due-date').value = task.dueDate || '';
      document.getElementById('task-assignee').value = task.assignee || '';
      this.taskModal.querySelector('h3').textContent = 'Edit Task';
    } else {
      this.editingTaskId = null;
      this.taskForm.reset();
      this.taskModal.querySelector('h3').textContent = 'Add New Task';
    }
    this.taskModal.classList.remove('hidden');
    this.taskModal.classList.add('flex');
  }

  hideTaskModal() {
    this.taskModal.classList.add('hidden');
    this.taskModal.classList.remove('flex');
  }

  handleTaskFormSubmit() {
    const title = document.getElementById('task-title').value.trim();
    const description = document
      .getElementById('task-description')
      .value.trim();
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value;
    const assignee = document.getElementById('task-assignee').value.trim();
    const columnIndex = parseInt(this.taskForm.dataset.targetColumn, 10);
    if (!title) {
      alert('Task title cannot be empty.');
      return;
    }
    if (this.editingTaskId) {
      this.updateTask(
        this.editingTaskId,
        title,
        description,
        priority,
        dueDate,
        assignee,
      );
    } else {
      this.addTask(
        title,
        description,
        priority,
        dueDate,
        assignee,
        columnIndex,
      );
    }
    this.hideTaskModal();
  }

  addTask(title, description, priority, dueDate, assignee, columnIndex) {
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      dueDate,
      assignee,
      column: columnIndex,
    };
    this.tasks.push(newTask);
    this.saveTasks();
  }

  updateTask(taskId, title, description, priority, dueDate, assignee) {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        title,
        description,
        priority,
        dueDate,
        assignee,
      };
      this.saveTasks();
    }
  }

  deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      this.tasks.splice(taskIndex, 1);
      this.saveTasks();
    }
  }

  searchTasks(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredTasks = [...this.tasks];
    } else {
      searchTerm = searchTerm.toLowerCase().trim();
      this.filteredTasks = this.tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm),
      );
    }
    this.renderFilteredTasks();
  }

  renderFilteredTasks() {
    const taskLists = document.querySelectorAll('.task-list');
    taskLists.forEach(list => (list.innerHTML = ''));
    this.filteredTasks.forEach(task => {
      const columnIndex = task.column;
      if (columnIndex >= 0 && columnIndex < taskLists.length) {
        this.renderTask(task, taskLists[columnIndex]);
      }
    });
  }

  renderAllTasks() {
    this.filteredTasks = [...this.tasks];
    const taskLists = document.querySelectorAll('.task-list');
    taskLists.forEach(list => (list.innerHTML = ''));
    this.tasks.forEach(task => {
      const columnIndex = task.column;
      if (columnIndex >= 0 && columnIndex < taskLists.length) {
        this.renderTask(task, taskLists[columnIndex]);
      }
    });
  }

  getPriorityClass(priority) {
    switch (priority) {
      case 'high':
        return 'bg-rose-300 dark:bg-rose-500 text-gray-800 dark:text-white';
      case 'medium':
        return 'bg-amber-300 dark:bg-amber-500 text-gray-800 dark:text-white';
      default:
        return 'bg-green-300 dark:bg-green-500 text-gray-800 dark:text-white';
    }
  }

  renderTask(task, targetColumn) {
    const taskElement = document.createElement('div');
    taskElement.className =
      'task bg-white dark:bg-[#151A1C] rounded-md shadow-lg p-4 mt-1 flex flex-col hover:shadow-xl transition-shadow relative';
    taskElement.id = `task-${task.id}`;
    taskElement.dataset.taskId = task.id;
    taskElement.draggable = true;
    const priorityClass = this.getPriorityClass(task.priority);
    taskElement.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <h4 class="font-medium text-gray-900 dark:text-white text-lg">${task.title}</h4>
        <span class="priority-badge flex items-center justify-center text-sm px-3 py-1 rounded-md ${priorityClass}" data-priority="${task.priority}">
          ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Low'}
        </span>
      </div>
      <p class="text-gray-600 dark:text-gray-400 text-sm break-words line-clamp-3 mb-4">
        ${task.description || 'No description'}
      </p>
      ${task.dueDate ? `<p class="text-gray-600 dark:text-gray-400 text-sm">Due: ${task.dueDate}</p>` : ''}
      ${task.assignee ? `<p class="text-gray-600 dark:text-gray-400 break-words line-clamp-3 text-sm">Assignee: ${task.assignee}</p>` : ''}
      <div class="flex justify-end space-x-2">
        <button class="edit-task-btn p-2 text-gray-700 rounded-md transition-all hover:bg-white/20 dark:text-gray-300" data-task-id="${task.id}">
          <i class="fas fa-pencil-alt text-sm"></i>
        </button>
        <button class="delete-task-btn p-2 text-gray-700 rounded-md transition-all hover:bg-white/20 dark:text-gray-300" data-task-id="${task.id}">
          <i class="fas fa-trash text-sm"></i>
        </button>
      </div>
    `;
    targetColumn.appendChild(taskElement);

    let touchStartY = 0;
    let touchStartX = 0;

    taskElement.addEventListener('dragstart', e => {
      this.handleDragStart(e, taskElement);
    });

    taskElement.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      setTimeout(() => {
        if (
          Math.abs(e.touches[0].clientY - touchStartY) < 10 &&
          Math.abs(e.touches[0].clientX - touchStartX) < 10
        ) {
          this.handleDragStart(e, taskElement);
        }
      }, 200);
    });

    taskElement.addEventListener('touchmove', e => {
      if (taskElement.classList.contains('dragging')) {
        e.preventDefault();
        this.handleTouchMove(e, taskElement);
      }
    });

    taskElement.addEventListener('touchend', e => {
      if (taskElement.classList.contains('dragging')) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const elemBelow = document.elementFromPoint(
          touch.clientX,
          touch.clientY,
        );
        const column = elemBelow.closest('.task-list');
        if (column) {
          const taskId = taskElement.dataset.taskId;
          const taskIndex = this.tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            const newColumnIndex = parseInt(column.dataset.index, 10);
            this.tasks[taskIndex].column = newColumnIndex;
            taskElement.remove();
            column.appendChild(taskElement);
            this.saveTasks();
          }
        }
        this.handleDragEnd(taskElement);
      }
    });

    taskElement.addEventListener('dragend', () => {
      this.handleDragEnd(taskElement);
    });

    taskElement
      .querySelector('.edit-task-btn')
      .addEventListener('click', () => {
        this.openTaskModal(task.column, task);
      });

    taskElement
      .querySelector('.delete-task-btn')
      .addEventListener('click', () => {
        this.deleteTask(task.id);
      });
  }

  handleDragStart(e, taskElement) {
    const taskHTML = taskElement.innerHTML;
    const taskWidth = taskElement.offsetWidth;
    const taskHeight = taskElement.offsetHeight;

    taskElement.classList.add('dragging');

    if (e.type === 'touchstart') {
      taskElement.dataset.beingDragged = 'true';
    } else {
      e.dataTransfer.setData('text/plain', taskElement.dataset.taskId);
    }

    this.taskClone = document.createElement('div');
    this.taskClone.className = taskElement.className + ' task-clone';
    this.taskClone.innerHTML = taskHTML;
    this.taskClone.style.width = `${taskWidth}px`;
    this.taskClone.style.height = `${taskHeight}px`;
    this.taskClone.style.opacity = '0.7';
    this.taskClone.style.position = 'fixed';
    this.taskClone.style.pointerEvents = 'none';
    this.taskClone.style.zIndex = '1000';

    if (e.type === 'touchstart') {
      const touch = e.touches[0];
      this.taskClone.style.top = `${touch.clientY - taskHeight / 2}px`;
      this.taskClone.style.left = `${touch.clientX - taskWidth / 2}px`;
    } else {
      this.taskClone.style.top = '-9999px';
      this.taskClone.style.left = '-9999px';
      e.dataTransfer.setDragImage(
        this.taskClone,
        taskWidth / 2,
        taskHeight / 2,
      );
    }

    document.body.appendChild(this.taskClone);
    taskElement.style.opacity = '0.3';
  }

  handleTouchMove(e, taskElement) {
    const touch = e.touches[0];
    const touchY = touch.clientY;
    const touchX = touch.clientX;

    if (this.taskClone) {
      this.taskClone.style.top = `${touchY - taskElement.offsetHeight / 2}px`;
      this.taskClone.style.left = `${touchX - taskElement.offsetWidth / 2}px`;
    }

    const elemBelow = document.elementFromPoint(touchX, touchY);
    const column = elemBelow?.closest('.task-list');
    if (column) {
      const afterElement = this.getDragAfterElement(column, touchY);
      this.taskPlaceholder.style.height = `${taskElement.offsetHeight}px`;
      this.taskPlaceholder.style.width = `${taskElement.offsetWidth}px`;
      document.querySelectorAll('.task-placeholder').forEach(el => el.remove());
      if (!afterElement) {
        column.appendChild(this.taskPlaceholder);
      } else {
        column.insertBefore(this.taskPlaceholder, afterElement);
      }
    }
  }

  handleDragEnd(taskElement) {
    taskElement.classList.remove('dragging');
    taskElement.style.opacity = '1';
    taskElement.dataset.beingDragged = 'false';
    if (this.taskClone) {
      this.taskClone.remove();
      this.taskClone = null;
    }
    document.querySelectorAll('.task-clone').forEach(clone => clone.remove());
    document.querySelectorAll('.task-placeholder').forEach(el => el.remove());
  }

  getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll('.task:not(.dragging)'),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return {offset: offset, element: child};
        } else {
          return closest;
        }
      },
      {offset: Number.NEGATIVE_INFINITY},
    ).element;
  }

  autoScrollOnDrag(event) {
    const scrollContainer = document.querySelector('.board');
    if (!scrollContainer) return;

    const scrollSpeed = 100;
    const edgeThreshold = 110;
    const {clientX} = event;
    const {left, right} = scrollContainer.getBoundingClientRect();

    if (clientX < left + edgeThreshold) {
      scrollContainer.scrollBy({left: -scrollSpeed, behavior: 'smooth'});
    } else if (clientX > right - edgeThreshold) {
      scrollContainer.scrollBy({left: scrollSpeed, behavior: 'smooth'});
    }
  }

  showSortOptions(boardIndex) {
    const sortModal = document.createElement('div');
    sortModal.className =
      'fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50';
    sortModal.innerHTML = `
      <div class="bg-white dark:bg-[#121617] rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Sort Tasks</h3>
       <div class="relative w-full mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</label>
          <div class="relative w-full">
            <select
              id="sort-by"
              class="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-[#202227] dark:text-white dark:focus:ring-indigo-400"
            >
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                class="h-4 w-4 text-gray-500 dark:text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div class="relative w-full mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Direction</label>
          <div class="relative w-full">
            <select
              id="sort-direction"
              class="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-[#202227] dark:text-white dark:focus:ring-indigo-400"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                class="h-4 w-4 text-gray-500 dark:text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        <div class="flex justify-end space-x-3">
          <button id="cancel-sort" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-[#202227] dark:text-gray-300 dark:hover:bg-gray-600">Cancel</button>
          <button id="apply-sort" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">Apply</button>
        </div>
      </div>
    `;
    document.body.appendChild(sortModal);
    sortModal
      .querySelector('#cancel-sort')
      .addEventListener('click', () => sortModal.remove());
    sortModal.querySelector('#apply-sort').addEventListener('click', () => {
      const sortBy = sortModal.querySelector('#sort-by').value;
      const direction = sortModal.querySelector('#sort-direction').value;
      this.sortTasks(boardIndex, sortBy, direction);
      sortModal.remove();
    });
  }

  sortTasks(boardIndex, sortBy, direction) {
    const boardTasks = this.tasks.filter(task => task.column === boardIndex);
    boardTasks.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'priority') {
        const priorityValues = {high: 3, medium: 2, low: 1};
        const priorityA = priorityValues[a.priority] || 0;
        const priorityB = priorityValues[b.priority] || 0;
        comparison = priorityA - priorityB;
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = direction === 'asc' ? 1 : -1;
        else if (!b.dueDate) comparison = direction === 'asc' ? -1 : 1;
        else comparison = new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return direction === 'desc' ? -comparison : comparison;
    });
    this.tasks = this.tasks.filter(task => task.column !== boardIndex);
    this.tasks = [...this.tasks, ...boardTasks];
    this.saveTasks();
  }

  getContrastingText(color) {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(x => x + x)
        .join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 186 ? '#1f2937' : '#f9fafb';
  }
}
