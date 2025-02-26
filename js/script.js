document.addEventListener('DOMContentLoaded', () => {
  const taskPlaceholder = document.createElement('div');
  taskPlaceholder.className =
    'task-placeholder border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700';

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

  const editBoardModal = document.getElementById('edit-board-modal');
  const closeEditBoardModal = document.getElementById('close-edit-board-modal');
  const editBoardForm = document.getElementById('edit-board-form');
  const boardNameInput = document.getElementById('board-name-input');
  const boardColorInput = document.getElementById('board-color-input');
  const cancelEditBoard = document.getElementById('cancel-edit-board');

  let currentBoardIndex = null;

  let boards = JSON.parse(localStorage.getItem('boards')) || [
    {title: 'To Do', color: '#7dd3fc'},
    {title: 'In Progress', color: '#fde68a'},
    {title: 'Done', color: '#86efac'},
  ];

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  const saveBoards = () =>
    localStorage.setItem('boards', JSON.stringify(boards));

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderAllTasks();
  };

  const addNewBoard = () => {
    const boardTitle = prompt('Enter the name of the new board:');

    if (!boardTitle || boardTitle.trim() === '') {
      alert('Board name cannot be empty.');
      return;
    }

    const newBoard = {
      title: boardTitle.trim(),
      color: '#9CA3AF',
    };

    boards.push(newBoard);
    saveBoards();
    renderBoards();
  };

  const renderBoards = () => {
    const boardsContainer = document.querySelector('main div.flex.flex-nowrap');
    boardsContainer.innerHTML = '';

    boards.forEach((board, index) => {
      const boardElement = document.createElement('div');
      boardElement.className =
        'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col w-[320px] flex-shrink-0 h-full';

      boardElement.innerHTML = `
        <div style="background:${board.color}" class="text-gray-700 dark:text-gray-800 p-3 flex justify-between items-center flex-shrink-0">
          <h3 class="font-semibold text-sm md:text-base">${board.title}</h3>
          <div class="relative">
            <button class="board-options-btn cursor-pointer text-gray-700 dark:text-gray-800 hover:bg-white/20 p-1 rounded transition-colors" data-index="${index}">
              <i class="fas fa-ellipsis-v text-sm"></i>
            </button>
            <div class="board-options-menu hidden absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded shadow-lg z-10 w-32 py-1" data-index="${index}">
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
        <div class="task-list bg-gray-50 dark:bg-gray-700 flex-grow p-3 overflow-y-auto space-y-3 h-full" data-index="${index}"></div>
        <div class="flex-shrink-0 p-4">
          <button class="add-task-btn flex w-full cursor-pointer items-center justify-center gap-2 text-gray-600 transition-opacity duration-200 ease-in-out hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200" data-index="${index}">
            <i class="fas fa-plus text-sm"></i> Add Task
          </button>
        </div>
      `;

      boardsContainer.appendChild(boardElement);
    });

    const addBoardButton = document.createElement('button');
    addBoardButton.id = 'add-new-board-btn';
    addBoardButton.className =
      'flex h-full min-w-[360px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:border-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300';
    addBoardButton.innerHTML = `
        <i class="fas fa-plus fa-2x mb-2"></i>
        <span class="font-medium">Add New Board</span>
    `;
    addBoardButton.addEventListener('click', addNewBoard);
    boardsContainer.appendChild(addBoardButton);

    attachEventListeners();
    renderAllTasks();
  };

  const attachEventListeners = () => {
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
      document.querySelectorAll('.board-options-menu').forEach(menu => {
        menu.classList.add('hidden');
      });
    });

    document.querySelectorAll('.edit-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        openEditBoardModal(index);
      });
    });

    document.querySelectorAll('.delete-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        deleteBoard(index);
      });
    });

    document.querySelectorAll('.sort-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        showSortOptions(index);
      });
    });

    document.querySelectorAll('.add-task-btn').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const index = parseInt(button.dataset.index);
        openTaskModal(index);
      });
    });

    document.querySelectorAll('.task-list').forEach(column => {
      column.addEventListener('dragover', e => {
        e.preventDefault();

        const draggingTask = document.querySelector('.dragging');
        if (!draggingTask) return;

        const afterElement = getDragAfterElement(column, e.clientY);

        taskPlaceholder.style.height = `${draggingTask.offsetHeight}px`;
        taskPlaceholder.style.width = `${draggingTask.offsetWidth}px`;

        document
          .querySelectorAll('.task-placeholder')
          .forEach(el => el.remove());

        if (!afterElement) {
          column.appendChild(taskPlaceholder);
        } else {
          column.insertBefore(taskPlaceholder, afterElement);
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
          const afterElement = getDragAfterElement(column, e.clientY);

          document
            .querySelectorAll('.task-placeholder')
            .forEach(el => el.remove());

          if (!afterElement) {
            column.appendChild(taskElement);
          } else {
            column.insertBefore(taskElement, afterElement);
          }

          taskElement.classList.remove('invisible', 'dragging');

          const taskIndex = tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            const newColumnIndex = parseInt(column.dataset.index);

            tasks[taskIndex].column = newColumnIndex;

            const updatedTaskList = Array.from(
              column.querySelectorAll('.task'),
            ).map(taskEl => taskEl.dataset.taskId);

            const taskToMove = tasks.splice(taskIndex, 1)[0];

            let insertIndex = tasks.findIndex(
              task =>
                task.column === newColumnIndex &&
                updatedTaskList.indexOf(task.id) >
                  updatedTaskList.indexOf(taskId),
            );

            if (insertIndex === -1) {
              insertIndex = tasks.length;
            }

            tasks.splice(insertIndex, 0, taskToMove);

            saveTasks();
          }
        }
      });
    });
  };

  const showSortOptions = boardIndex => {
    const sortOptions = ['priority', 'dueDate', 'title'];
    const sortDirections = ['asc', 'desc'];

    const sortModal = document.createElement('div');
    sortModal.className =
      'fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50';
    sortModal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Sort Tasks</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</label>
          <select id="sort-by" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="title">Title</option>
          </select>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Direction</label>
          <select id="sort-direction" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="flex justify-end space-x-3">
          <button id="cancel-sort" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
          <button id="apply-sort" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Apply</button>
        </div>
      </div>
    `;

    document.body.appendChild(sortModal);

    document.getElementById('cancel-sort').addEventListener('click', () => {
      sortModal.remove();
    });

    document.getElementById('apply-sort').addEventListener('click', () => {
      const sortBy = document.getElementById('sort-by').value;
      const direction = document.getElementById('sort-direction').value;
      sortTasks(boardIndex, sortBy, direction);
      sortModal.remove();
    });
  };

  const sortTasks = (boardIndex, sortBy, direction) => {
    const boardTasks = tasks.filter(task => task.column === boardIndex);

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

    tasks = tasks.filter(task => task.column !== boardIndex);

    tasks = [...tasks, ...boardTasks];

    saveTasks();
  };

  const openEditBoardModal = index => {
    currentBoardIndex = index;
    boardNameInput.value = boards[index].title;
    boardColorInput.value = boards[index].color;

    editBoardModal.classList.remove('hidden');
    editBoardModal.classList.add('flex');

    editBoardForm.onsubmit = e => {
      e.preventDefault();
      updateBoard(index);
    };
  };

  const hideEditBoardModal = () => {
    editBoardModal.classList.add('hidden');
    editBoardModal.classList.remove('flex');
  };

  const updateBoard = index => {
    boards[index] = {
      title: boardNameInput.value,
      color: boardColorInput.value,
    };
    saveBoards();
    renderBoards();
    renderAllTasks();
    hideEditBoardModal();
  };

  document.getElementById('clear-board-btn').addEventListener('click', () => {
    const confirmClear = confirm(
      'Are you sure you want to clear all tasks from this board?',
    );

    if (confirmClear) {
      clearBoard();
    }
  });

  const deleteBoard = index => {
    const confirmDelete = confirm(
      'Are you sure you want to delete this board? This action cannot be undone.',
    );

    if (!confirmDelete) return;

    boards.splice(index, 1);
    saveBoards();

    tasks = tasks.filter(task => task.column !== index);

    tasks.forEach(task => {
      if (task.column > index) {
        task.column -= 1;
      }
    });

    saveTasks();

    renderBoards();
    renderAllTasks();
  };

  const clearBoard = () => {
    if (currentBoardIndex !== null) {
      tasks = tasks.filter(task => task.column !== currentBoardIndex);

      saveTasks();
      renderAllTasks();
      hideEditBoardModal();
    }
  };

  closeEditBoardModal.addEventListener('click', hideEditBoardModal);
  cancelEditBoard.addEventListener('click', hideEditBoardModal);

  document
    .getElementById('add-new-board-btn')
    ?.addEventListener('click', addNewBoard);

  const taskModal = document.getElementById('task-modal');
  const taskForm = document.getElementById('task-form');
  const closeModalButtons = document.querySelectorAll(
    '#task-modal button:not([type="submit"])',
  );

  let editingTaskId = null;

  const openTaskModal = (index, task = null) => {
    taskForm.dataset.targetColumn = index;

    if (task) {
      editingTaskId = task.id;
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-description').value =
        task.description || '';
      document.getElementById('task-priority').value = task.priority;
      document.getElementById('task-due-date').value = task.dueDate || '';
      document.getElementById('task-assignee').value = task.assignee || '';

      document.querySelector('#task-modal h3').textContent = 'Edit Task';
    } else {
      editingTaskId = null;
      taskForm.reset();
      document.querySelector('#task-modal h3').textContent = 'Add New Task';
    }

    taskModal.classList.remove('hidden');
    taskModal.classList.add('flex');
  };

  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      taskModal.classList.add('hidden');
      taskModal.classList.remove('flex');
    });
  });

  taskForm.addEventListener('submit', e => {
    e.preventDefault();

    const title = document.getElementById('task-title').value.trim();
    const description = document
      .getElementById('task-description')
      .value.trim();
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value;
    const assignee = document.getElementById('task-assignee').value.trim();
    const columnIndex = parseInt(taskForm.dataset.targetColumn);

    if (!title) {
      alert('Task title cannot be empty.');
      return;
    }

    if (editingTaskId) {
      updateTask(
        editingTaskId,
        title,
        description,
        priority,
        dueDate,
        assignee,
      );
    } else {
      addTask(title, description, priority, dueDate, assignee, columnIndex);
    }

    taskModal.classList.add('hidden');
    taskModal.classList.remove('flex');
  });

  const addTask = (
    title,
    description,
    priority,
    dueDate,
    assignee,
    columnIndex,
  ) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      priority,
      dueDate,
      assignee,
      column: columnIndex,
    };

    tasks.push(newTask);
    saveTasks();
  };

  const updateTask = (
    taskId,
    title,
    description,
    priority,
    dueDate,
    assignee,
  ) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        priority,
        dueDate,
        assignee,
      };
      saveTasks();
    }
  };

  const renderAllTasks = () => {
    const taskLists = document.querySelectorAll('.task-list');
    taskLists.forEach(list => (list.innerHTML = ''));

    tasks.forEach(task => {
      const columnIndex = task.column;
      if (columnIndex >= 0 && columnIndex < taskLists.length) {
        renderTask(task, taskLists[columnIndex]);
      }
    });
  };

  const getPriorityClass = priority => {
    switch (priority) {
      case 'high':
        return 'bg-rose-300 dark:bg-rose-500 text-gray-800 dark:text-white';
      case 'medium':
        return 'bg-amber-300 dark:bg-amber-500 text-gray-800 dark:text-white';
      default:
        return 'bg-green-300 dark:bg-green-500 text-gray-800 dark:text-white';
    }
  };

  const renderTask = (task, targetColumn) => {
    const taskElement = document.createElement('div');
    taskElement.className =
      'task bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 mt-1 flex flex-col hover:shadow-xl transition-shadow relative';

    taskElement.id = `task-${task.id}`;
    taskElement.dataset.taskId = task.id;
    taskElement.draggable = true;

    const priorityClass = getPriorityClass(task.priority);

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

      <div class="flex justify-end space-x-2 mt-4">
        <button class="edit-task-btn p-2 text-gray-700 rounded-md transition-all hover:bg-white/20 dark:text-gray-300" data-task-id="${task.id}">
          <i class="fas fa-pencil-alt text-sm"></i>
        </button>
        <button class="delete-task-btn p-2 text-gray-700 rounded-md transition-all hover:bg-white/20 dark:text-gray-300" data-task-id="${task.id}">
          <i class="fas fa-trash text-sm"></i>
        </button>
      </div>
    `;

    targetColumn.appendChild(taskElement);

    let taskClone = null;

    taskElement.addEventListener('dragstart', e => {
      const taskHTML = taskElement.innerHTML;
      const taskStyle = window.getComputedStyle(taskElement);
      const taskWidth = taskElement.offsetWidth;
      const taskHeight = taskElement.offsetHeight;

      taskElement.classList.add('dragging');

      e.dataTransfer.setData('text/plain', taskElement.dataset.taskId);

      taskClone = document.createElement('div');
      taskClone.className = taskElement.className + ' task-clone';
      taskClone.innerHTML = taskHTML;
      taskClone.style.width = `${taskWidth}px`;
      taskClone.style.height = `${taskHeight}px`;
      taskClone.style.opacity = '0.3';
      taskClone.style.position = 'absolute';
      taskClone.style.pointerEvents = 'none';
      taskClone.style.zIndex = '1000';
      taskClone.style.top = '-9999px';
      taskClone.style.left = '-9999px';

      document.body.appendChild(taskClone);

      e.dataTransfer.setDragImage(taskClone, taskWidth / 2, taskHeight / 2);

      setTimeout(() => {
        taskElement.classList.add('invisible');
      }, 0);
    });

    taskElement.addEventListener('dragend', () => {
      taskElement.classList.remove('dragging', 'invisible');

      if (taskClone) {
        taskClone.remove();
        taskClone = null;
      }

      document.querySelectorAll('.task-clone').forEach(clone => clone.remove());
      document.querySelectorAll('.task-placeholder').forEach(el => el.remove());
    });

    taskElement
      .querySelector('.edit-task-btn')
      .addEventListener('click', () => {
        openTaskModal(task.column, task);
      });

    taskElement
      .querySelector('.delete-task-btn')
      .addEventListener('click', () => {
        deleteTask(task.id);
      });
  };

  const deleteTask = taskId => {
    const confirmDelete = confirm('Are you sure you want to delete this task?');

    if (!confirmDelete) return;

    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      saveTasks();
    }
  };

  const getDragAfterElement = (container, y) => {
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
  };

  document.addEventListener('dragover', e => {
    e.preventDefault();
    autoScrollOnDrag(e);
  });

  const autoScrollOnDrag = event => {
    const scrollContainer = document.querySelector('main > div');
    const scrollSpeed = 50;
    const edgeThreshold = 100;

    const {clientX} = event;
    const {left, right} = scrollContainer.getBoundingClientRect();

    if (clientX < left + edgeThreshold) {
      scrollContainer.scrollBy({left: -scrollSpeed, behavior: 'smooth'});
    } else if (clientX > right - edgeThreshold) {
      scrollContainer.scrollBy({left: scrollSpeed, behavior: 'smooth'});
    }
  };

  renderBoards();
});
