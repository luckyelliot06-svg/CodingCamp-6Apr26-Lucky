// Personal Dashboard — js/app.js
// No frameworks, no build tools. Pure Vanilla JS.

/* ===== StorageHelper ===== */
const StorageHelper = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("StorageHelper.set failed:", err);
      const banner = document.getElementById("storage-warning");
      if (banner) {
        banner.textContent = "Some data could not be saved.";
        banner.removeAttribute("hidden");
      }
    }
  },
};

/* ===== ThemeManager ===== */
const ThemeManager = {
  _current: "light",
  init() {
    const theme = StorageHelper.get("pd_theme", "light");
    this.apply(theme);
  },
  toggle() {
    const next = this._current === "light" ? "dark" : "light";
    this.apply(next);
    this.save(next);
  },
  apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this._current = theme;
  },
  save(theme) {
    StorageHelper.set("pd_theme", theme);
  },
};

/* ===== Time / Date / Greeting Helpers ===== */
function formatTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDate(date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
  const years = date.getFullYear();                
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return "Good Morning👋";
  if (hour >= 12 && hour <= 17) return "Good Afternoon👋";
  if (hour >= 18 && hour <= 21) return "Good Evening👋";
  return "Good Night👋";
}

/* ===== GreetingWidget ===== */
const GreetingWidget = {
  _name: "",
  init() {
    this._name = StorageHelper.get("pd_name", "");
    this.render();
    setInterval(this.render.bind(this), 60_000);
  },
  render() {
    const now = new Date();
    const timeEl = document.getElementById("greeting-time");
    const dateEl = document.getElementById("greeting-date");
    const msgEl = document.getElementById("greeting-message");
    const nameInput = document.getElementById("name-input");
    if (timeEl) timeEl.textContent = formatTime(now);
    if (dateEl) dateEl.textContent = formatDate(now);
    if (msgEl) msgEl.textContent = getGreeting(now.getHours()) + (this._name ? ", " + this._name : "");
    if (nameInput && this._name) nameInput.value = this._name;
  },
  saveName(name) {
    const trimmed = name.trim();
    StorageHelper.set("pd_name", trimmed);
    this._name = trimmed;
    this.render();
  },
};

/* ===== FocusTimer helpers ===== */
function formatSeconds(s) {
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/* ===== FocusTimer ===== */
const FocusTimer = {
  _duration: 25 * 60,
  _remaining: 25 * 60,
  _intervalId: null,

  init() {
    this._duration = 25 * 60;
    this._remaining = this._duration;
    this.render();
  },

  start() {
    if (this._intervalId !== null) return;
    this._intervalId = setInterval(this.tick.bind(this), 1000);
    const btn = document.getElementById("timer-start");
    if (btn) btn.disabled = true;
  },

  stop() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    const btn = document.getElementById("timer-start");
    if (btn) btn.disabled = false;
  },

  reset() {
    this.stop();
    this._remaining = this._duration;
    this.render();
  },

  tick() {
    this._remaining = Math.max(0, this._remaining - 1);
    this.render();
    if (this._remaining === 0) this.complete();
  },

  complete() {
    this.stop();
    const notif = document.getElementById("timer-notification");
    if (notif) {
      notif.textContent = "Session complete!";
      notif.removeAttribute("hidden");
    }
  },

  render() {
    const display = document.getElementById("timer-display");
    if (display) display.textContent = formatSeconds(this._remaining);
  },
};

/* ===== TodoList ===== */
const TodoList = {
  _tasks: [],

  init() {
    const stored = StorageHelper.get("pd_tasks", []);
    this._tasks = Array.isArray(stored) ? stored : [];
    this.render();
  },

  addTask(text) {
    const trimmed = text.trim();
    const errorEl = document.getElementById("todo-error");
    if (!trimmed) {
      if (errorEl) errorEl.textContent = "Task cannot be empty.";
      return;
    }
    if (this.isDuplicate(trimmed)) {
      if (errorEl) errorEl.textContent = "Task already exists.";
      return;
    }
    if (errorEl) errorEl.textContent = "";
    this._tasks.push({ id: Date.now().toString(), text: trimmed, completed: false });
    this.save();
    this.render();
    const input = document.getElementById("todo-input");
    if (input) input.value = "";
  },

  editTask(id, newText) {
    const trimmed = newText.trim();
    const task = this._tasks.find((t) => t.id === id);
    if (!task) return;

    const li = document.querySelector(`[data-task-id="${id}"]`);
    const showInlineError = (msg) => {
      if (li) {
        let err = li.querySelector(".task-inline-error");
        if (!err) {
          err = document.createElement("span");
          err.className = "task-inline-error";
          li.appendChild(err);
        }
        err.textContent = msg;
      }
    };

    if (!trimmed) { showInlineError("Task cannot be empty."); return; }
    if (this.isDuplicate(trimmed, id)) { showInlineError("Task already exists."); return; }

    task.text = trimmed;
    this.save();
    this.render();
  },

  toggleTask(id) {
    const task = this._tasks.find((t) => t.id === id);
    if (task) { task.completed = !task.completed; this.save(); this.render(); }
  },

  deleteTask(id) {
    this._tasks = this._tasks.filter((t) => t.id !== id);
    this.save();
    this.render();
  },

  isDuplicate(text, excludeId) {
    const lower = text.trim().toLowerCase();
    return this._tasks.some((t) => t.text.toLowerCase() === lower && t.id !== excludeId);
  },

  save() {
    StorageHelper.set("pd_tasks", this._tasks);
  },

  render() {
    const list = document.getElementById("todo-items");
    if (!list) return;
    list.innerHTML = "";

    this._tasks.forEach((task) => {
      const li = document.createElement("li");
      li.dataset.taskId = task.id;

      const span = document.createElement("span");
      span.textContent = task.text;
      if (task.completed) span.style.textDecoration = "line-through";

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = task.completed ? "Undo" : "Done";
      toggleBtn.addEventListener("click", () => this.toggleTask(task.id));

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = task.text;

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.addEventListener("click", () => this.editTask(task.id, editInput.value));

        li.replaceChild(editInput, span);
        editBtn.replaceWith(saveBtn);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => this.deleteTask(task.id));

      li.appendChild(span);
      li.appendChild(toggleBtn);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  },
};

/* ===== QuickLinks ===== */
const QuickLinks = {
  _links: [],

  init() {
    const stored = StorageHelper.get("pd_links", []);
    this._links = Array.isArray(stored) ? stored : [];
    this.render();
  },

  addLink(label, url) {
    const trimmedLabel = label.trim();
    const errorEl = document.getElementById("links-error");
    if (!trimmedLabel) {
      if (errorEl) errorEl.textContent = "Label cannot be empty.";
      return;
    }
    try {
      new URL(url);
    } catch {
      if (errorEl) errorEl.textContent = "Please enter a valid URL.";
      return;
    }
    if (errorEl) errorEl.textContent = "";
    this._links.push({ id: Date.now().toString(), label: trimmedLabel, url });
    this.save();
    this.render();
    const labelInput = document.getElementById("link-label-input");
    const urlInput = document.getElementById("link-url-input");
    if (labelInput) labelInput.value = "";
    if (urlInput) urlInput.value = "";
  },

  deleteLink(id) {
    this._links = this._links.filter((l) => l.id !== id);
    this.save();
    this.render();
  },

  save() {
    StorageHelper.set("pd_links", this._links);
  },

  render() {
    const list = document.getElementById("links-list");
    if (!list) return;
    list.innerHTML = "";

    this._links.forEach((link) => {
      const div = document.createElement("div");

      const linkBtn = document.createElement("button");
      linkBtn.textContent = link.label;
      linkBtn.addEventListener("click", () => window.open(link.url, "_blank"));

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => this.deleteLink(link.id));

      div.appendChild(linkBtn);
      div.appendChild(deleteBtn);
      list.appendChild(div);
    });
  },
};

/* ===== Entry Point ===== */
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  GreetingWidget.init();
  FocusTimer.init();
  TodoList.init();
  QuickLinks.init();

  document.getElementById("theme-toggle").addEventListener("click", () => ThemeManager.toggle());

  document.getElementById("greeting-form").addEventListener("submit", (e) => {
    e.preventDefault();
    GreetingWidget.saveName(document.getElementById("name-input").value);
  });

  document.getElementById("timer-start").addEventListener("click", () => FocusTimer.start());
  document.getElementById("timer-stop").addEventListener("click", () => FocusTimer.stop());
  document.getElementById("timer-reset").addEventListener("click", () => FocusTimer.reset());

  document.getElementById("todo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    TodoList.addTask(document.getElementById("todo-input").value);
  });

  document.getElementById("links-form").addEventListener("submit", (e) => {
    e.preventDefault();
    QuickLinks.addLink(
      document.getElementById("link-label-input").value,
      document.getElementById("link-url-input").value
    );
  });
});
