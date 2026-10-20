
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";
const TASKS_URL = `${API_URL}/api/tasks`;
const AUTH_URL = `${API_URL}/api/auth`;

function App() {
  // Authentication
  const [token, setToken] = useState(
    () => localStorage.getItem("taskflow_token") || ""
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("taskflow_user") || "null"
      );
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // Task state
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  // Edit task state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [updatingTask, setUpdatingTask] = useState(false);

  // Search, filter, and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Backend and loading state
  const [backendMessage, setBackendMessage] = useState(
    "Connecting to backend..."
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Common API helper
  async function apiRequest(url, options = {}, authToken = token) {
    const headers = { ...options.headers };

    if (options.body && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }

  // Register or log in
  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthMessage("");
    setError("");

    if (authLoading) return;

    setAuthLoading(true);

    try {
      const isRegister = authMode === "register";
      const endpoint = isRegister ? "register" : "login";

      const body = isRegister
        ? {
            name: authName.trim(),
            email: authEmail.trim(),
            password: authPassword,
          }
        : {
            email: authEmail.trim(),
            password: authPassword,
          };

      const data = await apiRequest(
        `${AUTH_URL}/${endpoint}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        ""
      );

      if (!data.token || !data.user) {
        throw new Error(
          "The server did not return a valid login response."
        );
      }

      localStorage.setItem("taskflow_token", data.token);
      localStorage.setItem(
        "taskflow_user",
        JSON.stringify(data.user)
      );

      setToken(data.token);
      setUser(data.user);
      setAuthPassword("");
      setTasks([]);
      setLoading(true);
      setBackendMessage("Connecting to backend...");
      setError("");
    } catch (err) {
      setAuthMessage(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  // Log out
  function logout() {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");

    setToken("");
    setUser(null);
    setTasks([]);
    setTask("");
    setEditingTaskId(null);
    setEditingTitle("");
    setSearchTerm("");
    setFilter("all");
    setSortBy("newest");
    setError("");
    setAuthMessage("");
    setLoading(false);
  }

  // Load tasks when the authentication token changes
  useEffect(() => {
    let active = true;

    async function loadTasks() {
      try {
        const status = await apiRequest(API_URL, {}, "");

        if (!active) return;

        setBackendMessage(status.message);

        if (!token) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const data = await apiRequest(TASKS_URL, {}, token);

        if (active) {
          setTasks(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (!active) return;

        setBackendMessage("Unable to connect to the backend.");

        if (
          token &&
          /token|authentication|log in/i.test(err.message)
        ) {
          logout();
          setAuthMessage(
            "Your session has expired. Please log in again."
          );
        } else {
          setError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTasks();

    return () => {
      active = false;
    };

    // Authentication changes trigger a fresh task load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Dashboard statistics
  const completedCount = tasks.filter(
    (item) => item.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  // Search, filter, and sort tasks
  const filteredTasks = tasks
    .filter((item) =>
      item.title
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
    )
    .filter((item) => {
      if (filter === "completed") return item.completed;
      if (filter === "pending") return !item.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortBy === "title-az") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "title-za") {
        return b.title.localeCompare(a.title);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Add a task
  async function addTask(event) {
    event.preventDefault();

    const title = task.trim();

    if (!title || saving) return;

    setSaving(true);
    setError("");

    try {
      const newTask = await apiRequest(TASKS_URL, {
        method: "POST",
        body: JSON.stringify({ title }),
      });

      setTasks((currentTasks) => [
        newTask,
        ...currentTasks,
      ]);

      setTask("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Begin editing a task
  function startEditing(item) {
    setEditingTaskId(item._id);
    setEditingTitle(item.title);
    setError("");
  }

  // Cancel editing
  function cancelEditing() {
    if (updatingTask) return;

    setEditingTaskId(null);
    setEditingTitle("");
  }

  // Save the edited task title to MongoDB
  async function saveTaskTitle(id) {
    const title = editingTitle.trim();

    if (!title || updatingTask) return;

    setUpdatingTask(true);
    setError("");

    try {
      const updatedTask = await apiRequest(
        `${TASKS_URL}/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title }),
        }
      );

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === id ? updatedTask : item
        )
      );

      setEditingTaskId(null);
      setEditingTitle("");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingTask(false);
    }
  }

  // Update task completion
  async function toggleTask(id) {
    const currentTask = tasks.find(
      (item) => item._id === id
    );

    if (!currentTask) return;

    const updatedCompleted = !currentTask.completed;
    setError("");

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item._id === id
          ? { ...item, completed: updatedCompleted }
          : item
      )
    );

    try {
      const updatedTask = await apiRequest(
        `${TASKS_URL}/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            completed: updatedCompleted,
          }),
        }
      );

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === id ? updatedTask : item
        )
      );
    } catch (err) {
      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === id
            ? {
                ...item,
                completed: currentTask.completed,
              }
            : item
        )
      );

      setError(err.message);
    }
  }

  // Delete a task
  async function deleteTask(id) {
    if (editingTaskId === id && updatingTask) return;

    setError("");

    try {
      await apiRequest(`${TASKS_URL}/${id}`, {
        method: "DELETE",
      });

      setTasks((currentTasks) =>
        currentTasks.filter((item) => item._id !== id)
      );

      if (editingTaskId === id) {
        setEditingTaskId(null);
        setEditingTitle("");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  const backendOnline = backendMessage.includes(
    "successfully"
  );

  // Login and registration screen
  if (!token || !user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <a className="brand auth-brand" href="#auth">
            <span className="brand-icon">✓</span>
            <span>TaskFlow</span>
          </a>

          <p className="eyebrow">
            YOUR PERSONAL WORKSPACE
          </p>

          <h1>
            {authMode === "login"
              ? "Welcome back"
              : "Create your account"}
          </h1>

          <p className="auth-description">
            {authMode === "login"
              ? "Log in to continue organizing your tasks."
              : "Create an account to start managing your tasks."}
          </p>

          <form
            className="auth-form"
            onSubmit={handleAuthSubmit}
          >
            {authMode === "register" && (
              <label>
                Full name
                <input
                  type="text"
                  value={authName}
                  onChange={(event) =>
                    setAuthName(event.target.value)
                  }
                  placeholder="Enter your name"
                  maxLength={80}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={authEmail}
                onChange={(event) =>
                  setAuthEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={authPassword}
                onChange={(event) =>
                  setAuthPassword(event.target.value)
                }
                placeholder="At least 8 characters"
                minLength={8}
                maxLength={72}
                autoComplete={
                  authMode === "login"
                    ? "current-password"
                    : "new-password"
                }
                required
              />
            </label>

            {authMessage && (
              <p className="error-message" role="alert">
                {authMessage}
              </p>
            )}

            <button
              type="submit"
              className="add-button auth-submit"
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                  ? "Log in"
                  : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            {authMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setAuthMode(
                  authMode === "login"
                    ? "register"
                    : "login"
                );
                setAuthMessage("");
              }}
            >
              {authMode === "login"
                ? "Register"
                : "Log in"}
            </button>
          </p>

          <p className="auth-backend">
            API status: {backendMessage}
          </p>
        </section>
      </main>
    );
  }

  // TaskFlow dashboard
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">✓</span>
          <span>TaskFlow</span>
        </a>

        <p className="nav-heading">WORKSPACE</p>

        <nav className="navigation">
          <a className="nav-link active" href="#dashboard">
            <span>▦</span> Dashboard
          </a>

          <a className="nav-link" href="#my-tasks">
            <span>☷</span> My Tasks
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">✦</span>
            <h3>Stay focused!</h3>
            <p>
              Small steps every day lead to big results.
            </p>
          </div>

          <p className="sidebar-footer">
            TASKFLOW · YOUR DAILY PLANNER
          </p>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              YOUR PERSONAL WORKSPACE
            </p>
            <h1>My Dashboard</h1>
          </div>

          <div className="profile">
            <div className="avatar">
              {(user.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="profile-text">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="welcome-card">
          <div className="welcome-copy">
            <span className="welcome-label">
              YOUR DAY, YOUR WAY
            </span>
            <h2>Make today count.</h2>
            <p>
              Organize your priorities and celebrate every
              little win.
            </p>
          </div>

          <div
            className="welcome-art"
            aria-hidden="true"
          >
            <div className="art-circle">
              <span>✓</span>
            </div>
            <span className="art-spark spark-one">✦</span>
            <span className="art-spark spark-two">✧</span>
          </div>
        </section>

        <section
          className="stats-grid"
          aria-label="Task statistics"
        >
          <article className="stat-card total-stat">
            <div className="stat-icon">☷</div>
            <div>
              <p>Total tasks</p>
              <strong>{tasks.length}</strong>
              <span>All your tasks</span>
            </div>
          </article>

          <article className="stat-card completed-stat">
            <div className="stat-icon">✓</div>
            <div>
              <p>Completed</p>
              <strong>{completedCount}</strong>
              <span>Goals achieved</span>
            </div>
          </article>

          <article className="stat-card pending-stat">
            <div className="stat-icon">◷</div>
            <div>
              <p>Pending</p>
              <strong>{pendingCount}</strong>
              <span>Ready to tackle</span>
            </div>
          </article>
        </section>

        <section className="task-card" id="my-tasks">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                PLAN AND ACCOMPLISH
              </p>
              <h2>Your Tasks</h2>
            </div>

            <span className="task-badge">
              {tasks.length}{" "}
              {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          <form className="task-form" onSubmit={addTask}>
            <input
              type="text"
              placeholder="What would you like to accomplish?"
              value={task}
              onChange={(event) =>
                setTask(event.target.value)
              }
              aria-label="New task"
              maxLength={200}
              disabled={saving}
            />

            <button
              type="submit"
              className="add-button"
              disabled={saving || !task.trim()}
            >
              <span>＋</span>
              {saving ? "Saving..." : "Add task"}
            </button>
          </form>

          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}

          <div className="progress-section">
            <div className="progress-label">
              <span>Daily progress</span>
              <strong>{progress}%</strong>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-label="Task completion progress"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="list-heading">
            <h3>Task list</h3>
            <span>{pendingCount} remaining</span>
          </div>

          <div className="task-controls">
            <input
              className="search-input"
              type="search"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search tasks"
            />

            <select
              className="filter-select"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              aria-label="Filter tasks"
            >
              <option value="all">All tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
              aria-label="Sort tasks"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-az">Title A–Z</option>
              <option value="title-za">Title Z–A</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">
              <h3>Loading your tasks...</h3>
              <p>
                Please wait while we retrieve your saved
                tasks.
              </p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>

              <h3>
                {tasks.length === 0
                  ? "Your journey starts here"
                  : "No matching tasks"}
              </h3>

              <p>
                {tasks.length === 0
                  ? "Add your first task and make today productive."
                  : "Try another search or change your filter."}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((item) => (
                <li
                  className={`task-item ${
                    item.completed ? "is-completed" : ""
                  }`}
                  key={item._id}
                >
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={editingTaskId === item._id}
                      onChange={() =>
                        toggleTask(item._id)
                      }
                    />

                    <span
                      className="custom-checkbox"
                      aria-hidden="true"
                    >
                      {item.completed ? "✓" : ""}
                    </span>

                    {editingTaskId === item._id ? (
                      <input
                        className="edit-task-input"
                        type="text"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        maxLength={200}
                        aria-label="Edit task title"
                        autoFocus
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            saveTaskTitle(item._id);
                          }

                          if (event.key === "Escape") {
                            cancelEditing();
                          }
                        }}
                      />
                    ) : (
                      <span className="task-title">
                        {item.title}
                      </span>
                    )}
                  </label>

                  <div className="task-actions">
                    {editingTaskId === item._id ? (
                      <>
                        <button
                          type="button"
                          className="edit-button"
                          disabled={
                            updatingTask ||
                            !editingTitle.trim() ||
                            editingTitle.trim().length > 200
                          }
                          onClick={() =>
                            saveTaskTitle(item._id)
                          }
                        >
                          {updatingTask ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          className="cancel-edit-button"
                          disabled={updatingTask}
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => startEditing(item)}
                      >
                        Edit
                      </button>
                    )}

                    <span
                      className={`status-pill ${
                        item.completed
                          ? "status-done"
                          : "status-pending"
                      }`}
                    >
                      {item.completed
                        ? "Completed"
                        : "Pending"}
                    </span>

                    <button
                      type="button"
                      className="delete-button"
                      aria-label={`Delete ${item.title}`}
                      title="Delete task"
                      disabled={
                        editingTaskId === item._id &&
                        updatingTask
                      }
                      onClick={() => deleteTask(item._id)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <footer className="task-footer">
            <span>✦</span>
            <p>Keep going. You're doing great!</p>
          </footer>
        </section>

        <footer className="page-footer">
          Made for your goals, one task at a time.
        </footer>

        <section className="backend-status">
          <span
            className={`status-dot ${
              backendOnline ? "online" : "offline"
            }`}
          />

          <div>
            <strong>
              Backend:{" "}
              {backendOnline ? "Connected" : "Not connected"}
            </strong>
            <p>{backendMessage}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
