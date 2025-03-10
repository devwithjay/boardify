import {defaultBoards, defaultTasks} from './constants';

class BoardManager {
  constructor() {
    this.boards = JSON.parse(localStorage.getItem('boards')) || defaultBoards;
    this.currentBoardIndex = null;
    this.boardsContainer = null;
    this.editBoardModal = null;
    this.closeEditBoardModal = null;
    this.editBoardForm = null;
    this.boardNameInput = null;
    this.boardColorInput = null;
    this.cancelEditBoard = null;
    this.clearBoardBtn = null;

    this.uiManager = null;
    this.taskManager = null;
    this.dragDropManager = null;

    if (!localStorage.getItem('boards')) {
      this.saveBoards();
      this.initializeDefaultTasks();
    }
  }

  initializeDefaultTasks() {
    localStorage.setItem('tasks', JSON.stringify(defaultTasks));
  }

  saveBoards() {
    localStorage.setItem('boards', JSON.stringify(this.boards));
  }

  addNewBoard() {
    const boardTitle = prompt('Enter the name of the new board:');
    if (!boardTitle || boardTitle.trim() === '') {
      alert('Board name cannot be empty.');
      return;
    }
    const newBoard = {
      title: boardTitle.trim(),
      color: '#d1d5db',
    };
    this.boards.push(newBoard);
    this.saveBoards();
    return true;
  }

  renderBoards(uiManager, taskManager, dragDropManager) {
    this.uiManager = uiManager;
    this.taskManager = taskManager;
    this.dragDropManager = dragDropManager;

    this.boardsContainer = document.querySelector('.board');
    if (!this.boardsContainer) return;

    this.boardsContainer.innerHTML = '';
    this.boards.forEach((board, index) => {
      const boardElement = document.createElement('div');
      boardElement.className =
        'rounded-lg min-h-[74dvh] md:min-h-[78dvh] overflow-hidden flex flex-col w-[350px] xl:w-[400px] flex-shrink-0';
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
        <div class="task-list bg-gray-50 rounded-lg dark:bg-[#202227] flex-grow p-3 overflow-y-auto space-y-3 h-full" data-index="${index}"></div>
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
      'flex min-w-[360px] min-h-[68dvh] mt-16 md:min-h-[72dvh] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-400 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-[#202227] dark:hover:text-gray-300';
    addBoardButton.innerHTML = `
        <div>
          <i class="fas fa-plus mb-2 mr-1"></i>
          <span class="font-medium">Add Board</span>
        </div>
    `;
    addBoardButton.addEventListener('click', () => {
      if (this.addNewBoard()) {
        this.renderBoards(uiManager, taskManager, dragDropManager);
      }
    });
    this.boardsContainer.appendChild(addBoardButton);

    uiManager.attachBoardEventListeners(this, taskManager, dragDropManager);
    taskManager.renderAllTasks();
  }

  openEditBoardModal(index) {
    this.editBoardModal = document.getElementById('edit-board-modal');
    this.boardNameInput = document.getElementById('board-name-input');
    this.boardColorInput = document.getElementById('board-color-input');
    this.editBoardForm = document.getElementById('edit-board-form');

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
    this.editBoardModal = document.getElementById('edit-board-modal');
    this.editBoardModal.classList.add('hidden');
    this.editBoardModal.classList.remove('flex');
  }

  updateBoard(index) {
    this.boards[index] = {
      title: this.boardNameInput.value,
      color: this.boardColorInput.value,
    };
    this.saveBoards();
    this.hideEditBoardModal();

    if (this.uiManager && this.taskManager && this.dragDropManager) {
      this.renderBoards(this.uiManager, this.taskManager, this.dragDropManager);
    }
    return true;
  }

  deleteBoard(index, taskManager) {
    if (
      !confirm(
        'Are you sure you want to delete this board? This action cannot be undone.',
      )
    )
      return;

    this.boards.splice(index, 1);
    this.saveBoards();

    const tasks = taskManager.getTasks();
    const updatedTasks = tasks.filter(task => task.column !== index);
    updatedTasks.forEach(task => {
      if (task.column > index) {
        task.column -= 1;
      }
    });
    taskManager.setTasks(updatedTasks);
    taskManager.saveTasks();

    return true;
  }

  clearBoard(taskManager) {
    if (this.currentBoardIndex !== null) {
      const tasks = taskManager.getTasks();
      const updatedTasks = tasks.filter(
        task => task.column !== this.currentBoardIndex,
      );
      taskManager.setTasks(updatedTasks);
      taskManager.saveTasks();
      this.hideEditBoardModal();
      return true;
    }
    return false;
  }

  showSortOptions(boardIndex, taskManager) {
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
      taskManager.sortTasks(boardIndex, sortBy, direction);
      sortModal.remove();
    });
  }

  getContrastingText(color) {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(x => x + x)
        .join('');
    }
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 186 ? '#1f2937' : '#f9fafb';
  }
}

export default BoardManager;
