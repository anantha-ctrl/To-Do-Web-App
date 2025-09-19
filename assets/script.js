document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const addListForm = document.getElementById('add-list-form');
    const newListInput = document.getElementById('new-list-input');
    const listsContainer = document.getElementById('lists-container');
    const addTaskForm = document.getElementById('add-task-form');
    const newTaskInput = document.getElementById('new-task-input');
    const newTaskDate = document.getElementById('new-task-date');
    const newTaskTime = document.getElementById('new-task-time');
    const tasksContainer = document.getElementById('tasks-container');
    const currentListTitle = document.getElementById('current-list-title');
    const editTaskModalEl = document.getElementById('editTaskModal');
    const editTaskModal = new bootstrap.Modal(editTaskModalEl);
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskId = document.getElementById('edit-task-id');
    const editTaskText = document.getElementById('edit-task-text');
    const editTaskDate = document.getElementById('edit-task-date');
    const editTaskTime = document.getElementById('edit-task-time');

    // App State
    let lists = JSON.parse(localStorage.getItem('todo_lists')) || { "My First List": [] };
    let selectedList = localStorage.getItem('todo_selected_list') || "My First List";

    // --- RENDER FUNCTIONS ---

    const renderLists = () => {
        listsContainer.innerHTML = '';
        Object.keys(lists).forEach(listName => {
            const listEl = document.createElement('li');
            listEl.className = 'list-group-item d-flex justify-content-between align-items-center';
            if (listName === selectedList) {
                listEl.classList.add('active');
            }
            listEl.dataset.listName = listName;
            listEl.textContent = listName;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteList(listName);
            });

            listEl.appendChild(deleteBtn);
            listsContainer.appendChild(listEl);
        });
    };

    const renderTasks = () => {
        // Clear previous tasks
        tasksContainer.innerHTML = '';
        currentListTitle.textContent = selectedList;
        addTaskForm.style.display = selectedList ? 'block' : 'none';

        if (!lists[selectedList]) return;

        lists[selectedList].forEach(task => {
            const taskEl = document.createElement('li');
            taskEl.className = 'list-group-item d-flex justify-content-between align-items-center';
            if (task.completed) {
                taskEl.classList.add('completed');
            }

            const leftDiv = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input me-3';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTask(task.id));

            const taskTextSpan = document.createElement('span');
            taskTextSpan.className = 'task-text';
            taskTextSpan.textContent = task.text;

            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(taskTextSpan);

            const rightDiv = document.createElement('div');
            
            if (task.date || task.time) {
                const dateTimeSpan = document.createElement('span');
                dateTimeSpan.className = 'task-date me-3';
                dateTimeSpan.textContent = `${task.date || ''} ${task.time || ''}`.trim();
                rightDiv.appendChild(dateTimeSpan);
            }

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-secondary btn-sm me-2';
            editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
            editBtn.addEventListener('click', () => openEditModal(task));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-sm';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            rightDiv.appendChild(editBtn);
            rightDiv.appendChild(deleteBtn);

            taskEl.appendChild(leftDiv);
            taskEl.appendChild(rightDiv);
            tasksContainer.appendChild(taskEl);
        });
    };

    // --- DATA MANAGEMENT FUNCTIONS ---

    const save = () => {
        localStorage.setItem('todo_lists', JSON.stringify(lists));
        localStorage.setItem('todo_selected_list', selectedList);
    };

    const addList = (name) => {
        if (lists[name] === undefined) {
            lists[name] = [];
            selectedList = name;
            saveAndRender();
        } else {
            alert('List name already exists!');
        }
    };

    const deleteList = (name) => {
        if (confirm(`Are you sure you want to delete the "${name}" list and all its tasks?`)) {
            delete lists[name];
            if (selectedList === name) {
                selectedList = Object.keys(lists)[0] || null;
            }
            saveAndRender();
        }
    };
    
    const addTask = (text, date, time) => {
        const newTask = {
            id: Date.now().toString(),
            text,
            completed: false,
            date,
            time
        };
        lists[selectedList].push(newTask);
        saveAndRender();
    };

    const deleteTask = (taskId) => {
        lists[selectedList] = lists[selectedList].filter(task => task.id !== taskId);
        saveAndRender();
    };

    const toggleTask = (taskId) => {
        const task = lists[selectedList].find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveAndRender();
        }
    };
    
    const openEditModal = (task) => {
        editTaskId.value = task.id;
        editTaskText.value = task.text;
        editTaskDate.value = task.date || '';
        editTaskTime.value = task.time || '';
        editTaskModal.show();
    };

    const updateTask = (id, text, date, time) => {
        const task = lists[selectedList].find(t => t.id === id);
        if (task) {
            task.text = text;
            task.date = date;
            task.time = time;
            saveAndRender();
            editTaskModal.hide();
        }
    };
    
    // --- EVENT LISTENERS ---

    addListForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const listName = newListInput.value.trim();
        if (listName) {
            addList(listName);
            newListInput.value = '';
        }
    });

    listsContainer.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'li') {
            selectedList = e.target.dataset.listName;
            saveAndRender();
        }
    });

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = newTaskInput.value.trim();
        const taskDate = newTaskDate.value;
        const taskTime = newTaskTime.value;
        if (taskText) {
            addTask(taskText, taskDate, taskTime);
            newTaskInput.value = '';
            newTaskDate.value = '';
            newTaskTime.value = '';
        }
    });

    editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateTask(
            editTaskId.value,
            editTaskText.value.trim(),
            editTaskDate.value,
            editTaskTime.value
        );
    });

    const saveAndRender = () => {
        save();
        renderLists();
        renderTasks();
    };

    // --- INITIAL RENDER ---
    saveAndRender();
});