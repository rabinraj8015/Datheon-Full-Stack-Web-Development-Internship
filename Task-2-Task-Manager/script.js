const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskCategory = document.getElementById("taskCategory");
const taskDueDate = document.getElementById("taskDueDate");
const submitBtn = document.getElementById("submitBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = loadFromLocalStorage();
let currentFilter = "all";
let editingTaskId = null;

function loadFromLocalStorage() {
    try {
        const savedTasks = localStorage.getItem("taskManagerTasks");
        const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];
        return Array.isArray(parsedTasks) ? parsedTasks : [];
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

function saveToLocalStorage() {
    localStorage.setItem("taskManagerTasks", JSON.stringify(tasks));
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        alert("Please enter a task name.");
        return;
    }

    if (editingTaskId !== null) {
        tasks = tasks.map(function (task) {
            if (task.id === editingTaskId) {
                return {
                    ...task,
                    title: title,
                    category: taskCategory.value,
                    dueDate: taskDueDate.value
                };
            }

            return task;
        });

        editingTaskId = null;
        submitBtn.textContent = "Add Task";
    } else {
        const newTask = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            title: title,
            category: taskCategory.value,
            dueDate: taskDueDate.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
    }

    saveToLocalStorage();
    taskForm.reset();
    renderTasks();
});

function renderTasks() {
    const searchText = searchInput.value.trim().toLowerCase();

    const filteredTasks = tasks.filter(function (task) {
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesSearch =
            task.title.toLowerCase().includes(searchText) ||
            task.category.toLowerCase().includes(searchText);

        return matchesFilter && matchesSearch;
    });

    taskList.replaceChildren();

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = tasks.length === 0
            ? "No tasks yet. Add your first task!"
            : "No matching tasks found.";
        taskList.appendChild(emptyMessage);
    }

    filteredTasks.forEach(function (task) {
        const card = document.createElement("article");
        card.className = "task-card";
        if (task.completed) card.classList.add("completed");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task complete");
        checkbox.addEventListener("change", function () {
            toggleTask(task.id);
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = task.category;

        meta.appendChild(category);

        if (task.dueDate) {
            const dueDate = document.createElement("span");
            dueDate.textContent = "Due: " + formatDate(task.dueDate);

            if (!task.completed && task.dueDate < getToday()) {
                dueDate.style.color = "#e74c3c";
                dueDate.textContent += " (Overdue)";
            }

            meta.appendChild(dueDate);
        }

        info.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            editTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        actions.append(editButton, deleteButton);
        card.append(checkbox, info, actions);
        taskList.appendChild(card);
    });

    const activeCount = tasks.filter(task => !task.completed).length;
    const completedCount = tasks.filter(task => task.completed).length;

    taskCount.textContent =
        `${tasks.length} total · ${activeCount} active · ${completedCount} completed`;
}

function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function toggleTask(id) {
    tasks = tasks.map(function (task) {
        return task.id === id
            ? { ...task, completed: !task.completed }
            : task;
    });

    saveToLocalStorage();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    editingTaskId = id;
    taskInput.value = task.title;
    taskCategory.value = task.category;
    taskDueDate.value = task.dueDate || "";
    submitBtn.textContent = "Save Changes";

    taskInput.focus();
    taskForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deleteTask(id) {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    if (editingTaskId === id) {
        editingTaskId = null;
        taskForm.reset();
        submitBtn.textContent = "Add Task";
    }

    saveToLocalStorage();
    renderTasks();
}

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        renderTasks();
    });
});

searchInput.addEventListener("input", renderTasks);
renderTasks();