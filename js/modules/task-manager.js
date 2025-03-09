import DragDropManager from './drag-drop-manager.js';

class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.filteredTasks = [...this.tasks];
    this.editingTaskId = null;
    this.taskModal = null;
    this.taskForm = null;
  }

  getTasks() {
    return this.tasks;
  }

  setTasks(tasks) {
    this.tasks = tasks;
    this.filteredTasks = [...tasks];
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.renderAllTasks();
  }

  openTaskModal(index, task = null) {
    this.taskModal = document.getElementById('task-modal');
    this.taskForm = document.getElementById('task-form');

    this.taskModal.classList.remove('hidden');
    this.taskModal.classList.add('flex');

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
  }

  hideTaskModal() {
    this.taskModal = document.getElementById('task-modal');
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
    const columnIndex = Number.parseInt(this.taskForm.dataset.targetColumn, 10);

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
      const dragDropManager = new DragDropManager(this);
      dragDropManager.handleDragStart(e, taskElement);
    });

    taskElement.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      setTimeout(() => {
        if (
          Math.abs(e.touches[0].clientY - touchStartY) < 10 &&
          Math.abs(e.touches[0].clientX - touchStartX) < 10
        ) {
          const dragDropManager = new DragDropManager(this);
          dragDropManager.handleDragStart(e, taskElement);
        }
      }, 200);
    });

    taskElement.addEventListener('touchmove', e => {
      if (taskElement.classList.contains('dragging')) {
        e.preventDefault();
        const dragDropManager = new DragDropManager(this);
        dragDropManager.handleTouchMove(e, taskElement);
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
            const newColumnIndex = Number.parseInt(column.dataset.index, 10);
            this.tasks[taskIndex].column = newColumnIndex;
            taskElement.remove();
            column.appendChild(taskElement);
            this.saveTasks();
          }
        }
        const dragDropManager = new DragDropManager(this);
        dragDropManager.handleDragEnd(taskElement);
      }
    });

    taskElement.addEventListener('dragend', () => {
      const dragDropManager = new DragDropManager(this);
      dragDropManager.handleDragEnd(taskElement);
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
}

export default TaskManager;
