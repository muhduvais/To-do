
interface Task {
    title: string;
    desc: string;
    taskId?: string;
}

document.addEventListener('DOMContentLoaded', () => {
    const addTaskForm = document.getElementById('addTask') as HTMLFormElement;
    const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
    const taskIdInput = document.getElementById('task-id') as HTMLInputElement;

    // Add/Edit Task
    addTaskForm.addEventListener('submit', async (e: Event) => {
      e.preventDefault();

      const title = (document.getElementById('new-task-title') as HTMLInputElement).value;
      const desc = (document.getElementById('new-task-desc')as HTMLInputElement).value;
      const taskId = taskIdInput.value;

      let url: string;
      let method: string;
      if (taskId) {
        url = '/editTask';
        method = 'PATCH';
      } else {
        url = '/addTask';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, desc, taskId } as Task),
      });

      const data = await response.json();
      if (data.success) {
        addTaskForm.reset();
        taskIdInput.value = '';
        submitButton.textContent = 'Add Task';
        location.reload();
      } else {
        console.log('Failed to process the task');
      }
    });

    // Edit Task button handler
    document.querySelectorAll('.edit').forEach(button => {
      button.addEventListener('click', function (this: HTMLElement) {
        const taskItem = this.parentElement as HTMLElement;
        const taskTitle = taskItem.querySelector('label')?.textContent?.split(':')[0].trim();
        const taskDesc = taskItem.querySelector('label')?.textContent?.split(':')[1].trim();

        // Populate the input fields
        (document.getElementById('new-task-title') as HTMLInputElement).value = taskTitle || '';
        (document.getElementById('new-task-desc') as HTMLInputElement).value = taskDesc || '';
        taskIdInput.value = this.getAttribute('data-task-id') || '';

        // Change button to "Update Task"
        submitButton.textContent = 'Update Task';
      });
    });

    // Task status update
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', async function (this: HTMLInputElement) {
        const taskTitle = this.nextElementSibling?.textContent?.split(':')[0];
        const isCompleted = this.checked;

        const response = await fetch('/updateTaskStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: taskTitle, isCompleted }),
        });

        const data = await response.json();
        if (data.success) {
          location.reload();
        } else {
          console.log('Failed to update task status');
        }
      });
    });

    // Edit Task
    document.querySelectorAll('.edit').forEach(button => {
      button.addEventListener('click', async function (this: HTMLInputElement) {
        const taskItem = this.parentElement as HTMLElement;
        const taskTitle = taskItem.querySelector('label')?.textContent?.split(':')[0];
        const taskDesc = taskItem.querySelector('label')?.textContent?.split(':')[1];
        (document.getElementById('new-task-title') as HTMLInputElement).value = taskTitle?.trim() || '';
        (document.getElementById('new-task-desc') as HTMLInputElement).value = taskDesc?.trim() || '';
      });
    });

    // Delete Task
    document.querySelectorAll('.delete').forEach(button => {
      button.addEventListener('click', async function (this: HTMLElement) {
        const taskId = this.getAttribute('data-task-id');

        console.log(taskId);

        const response = await fetch('/deleteTask', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify({ taskId }),
          });

          const data = await response.json();
          if (data.success) {
            location.reload();
          } else {
            console.log('Failed to delete task');
          }
      });
    });
  });