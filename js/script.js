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

  const taskModal = document.getElementById('task-modal');
  const taskForm = document.getElementById('task-form');
  const addTaskButtons = document.querySelectorAll('.add-task-btn');
  const closeModalButtons = document.querySelectorAll(
    '#task-modal button:not([type="submit"])',
  );

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
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

  addTaskButtons.forEach((button, index) => {
    button.addEventListener('click', event => {
      event.preventDefault();
      openTaskModal(index);
    });
  });

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

  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderAllTasks();
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

  const renderTask = (task, targetColumn) => {
    const taskElement = document.createElement('div');
    taskElement.className =
      'task bg-white dark:bg-gray-800 rounded-md shadow-lg p-4 mt-1 flex flex-col hover:shadow-xl transition-shadow relative';

    taskElement.dataset.taskId = task.id;
    taskElement.draggable = true;

    taskElement.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <h4 class="font-medium text-gray-900 dark:text-white text-lg">${task.title}</h4>
        <span class="flex items-center justify-center text-sm px-3 py-1 rounded-md ${
          task.priority === 'high'
            ? 'bg-rose-300 dark:bg-rose-500 text-gray-800 dark:text-white'
            : task.priority === 'medium'
              ? 'bg-amber-300 dark:bg-amber-500 text-gray-800 dark:text-white'
              : 'bg-green-300 dark:bg-green-500 text-gray-800 dark:text-white'
        }">
          ${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Low'}
        </span>
      </div>
      <p class="text-gray-600 dark:text-gray-400 text-sm break-words line-clamp-3 mb-4">
        ${task.description || 'No description'}
      </p>
      ${task.dueDate ? `<p class="text-gray-600 dark:text-gray-400 text-sm">Due: ${task.dueDate}</p>` : ''}
      ${task.assignee ? `<p class="text-gray-600 dark:text-gray-400 text-sm">Assignee: ${task.assignee}</p>` : ''}

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

    taskElement.addEventListener('dragstart', e => {
      taskElement.classList.add('dragging');

      e.dataTransfer.setData('text/plain', taskElement.dataset.taskId);

      const taskClone = taskElement.cloneNode(true);
      taskClone.style.width = `${taskElement.offsetWidth}px`;
      taskClone.style.height = `${taskElement.offsetHeight}px`;
      taskClone.style.opacity = '1';
      taskClone.style.position = 'absolute';
      taskClone.style.pointerEvents = 'none';
      taskClone.style.zIndex = '1000';
      taskClone.classList.add('task-clone');

      document.body.appendChild(taskClone);

      e.dataTransfer.setDragImage(
        taskClone,
        taskElement.offsetWidth / 2,
        taskElement.offsetHeight / 2,
      );

      setTimeout(() => {
        taskElement.classList.add('invisible');
      }, 0);
    });

    taskElement.addEventListener('dragend', () => {
      taskElement.classList.remove('dragging', 'invisible');
      document.querySelectorAll('.task-clone').forEach(clone => clone.remove());
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

  document.querySelectorAll('.task-list').forEach(column => {
    column.addEventListener('dragover', e => {
      e.preventDefault();

      const taskElement = document.querySelector('.dragging');
      if (!taskElement) return;

      taskPlaceholder.style.height = `${taskElement.offsetHeight}px`;
      taskPlaceholder.style.width = `${taskElement.offsetWidth}px`;

      const afterElement = getDragAfterElement(column, e.clientY);

      if (!afterElement) {
        column.appendChild(taskPlaceholder);
      } else {
        afterElement.parentNode.insertBefore(taskPlaceholder, afterElement);
      }
    });

    column.addEventListener('drop', e => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain');
      const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

      if (taskElement) {
        const afterElement = getDragAfterElement(column, e.clientY);
        if (!afterElement) {
          column.appendChild(taskElement);
        } else {
          afterElement.parentNode.insertBefore(taskElement, afterElement);
        }

        taskPlaceholder.remove();
        taskElement.classList.remove('hidden', 'dragging');

        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          const newColumnIndex = Array.from(
            document.querySelectorAll('.task-list'),
          ).indexOf(column);
          tasks[taskIndex].column = newColumnIndex;
          saveTasks();
        }
      }
    });
  });

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

  renderAllTasks();
});

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
