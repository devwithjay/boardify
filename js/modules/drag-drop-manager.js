class DragDropManager {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.taskPlaceholder = document.createElement('div');
    this.taskPlaceholder.className =
      'task-placeholder border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-[#202227]';
    this.taskClone = null;
  }

  handleDragStart(e, taskElement) {
    const taskHTML = taskElement.innerHTML;
    const taskWidth = taskElement.offsetWidth;
    const taskHeight = taskElement.offsetHeight;

    taskElement.classList.add('dragging');

    if (e.type === 'touchmove') {
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

    let closest = null;
    let closestOffset = Number.POSITIVE_INFINITY;

    draggableElements.forEach(task => {
      const box = task.getBoundingClientRect();
      const offset = y - (box.top + box.height / 2);

      if (offset < 0 && Math.abs(offset) < closestOffset) {
        closestOffset = Math.abs(offset);
        closest = task;
      }
    });

    return closest;
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

  setupDragAndDrop(taskLists) {
    taskLists.forEach(column => {
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
          const taskIndex = this.taskManager.tasks.findIndex(
            task => task.id === taskId,
          );
          if (taskIndex !== -1) {
            const newColumnIndex = Number.parseInt(column.dataset.index, 10);
            this.taskManager.tasks[taskIndex].column = newColumnIndex;
            const updatedTaskList = Array.from(
              column.querySelectorAll('.task'),
            ).map(taskEl => taskEl.dataset.taskId);
            const taskToMove = this.taskManager.tasks.splice(taskIndex, 1)[0];
            let insertIndex = this.taskManager.tasks.findIndex(
              task =>
                task.column === newColumnIndex &&
                updatedTaskList.indexOf(task.id) >
                  updatedTaskList.indexOf(taskId),
            );
            if (insertIndex === -1) {
              insertIndex = this.taskManager.tasks.length;
            }
            this.taskManager.tasks.splice(insertIndex, 0, taskToMove);
            this.taskManager.saveTasks();
          }
        }
      });
    });
  }
}

export default DragDropManager;
