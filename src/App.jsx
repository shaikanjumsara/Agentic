import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'daymark.todos'
const DEMO_EMAIL = 'student@example.com'
const DEMO_PASSWORD = 'password123'
const FILTERS = ['All', 'Active', 'Completed']

function readTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(savedTodos) ? savedTodos : []
  } catch {
    return []
  }
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!onLogin(email.trim().toLowerCase(), password)) {
      setError('That email and password do not match. Try the demo account below.')
      return
    }
    setError('')
  }

  return (
    <main className="login-shell">
      <header className="brand" aria-label="Daymark">
        <span className="brand-mark" aria-hidden="true">d.</span>
        <span>daymark</span>
      </header>

      <section className="login-layout">
        <div className="login-intro">
          <p className="eyebrow">A CLEARER KIND OF TO-DO</p>
          <h1>Make space<br />for <em>today.</em></h1>
          <p className="intro-copy">A quiet place to gather your thoughts and get moving.</p>
          <div className="intro-rule" aria-hidden="true"><span /></div>
          <p className="small-note">One thing at a time is still progress.</p>
        </div>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="panel-heading">
            <p className="eyebrow">WELCOME BACK</p>
            <h2 id="login-title">Sign in</h2>
            <p>Pick up where you left off.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">Email address</label>
            <input
              id="email"
              autoComplete="username"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button login-button" type="submit">Continue <span aria-hidden="true">→</span></button>
          </form>

          <div className="demo-note">
            <span className="demo-dot" aria-hidden="true" />
            <span>Demo sign-in</span>
            <code>{DEMO_EMAIL}</code>
            <code>{DEMO_PASSWORD}</code>
          </div>
        </section>
      </section>
      <footer className="login-footer">A little more intention, every day.</footer>
    </main>
  )
}

function TodoPage({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onLogout }) {
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('All')
  const remainingCount = todos.filter((todo) => !todo.completed).length
  const visibleTodos = todos.filter((todo) => {
    if (filter === 'Active') return !todo.completed
    if (filter === 'Completed') return todo.completed
    return true
  })

  function handleAddTodo(event) {
    event.preventDefault()
    const title = newTodo.trim()
    if (!title) return
    onAddTodo(title)
    setNewTodo('')
  }

  return (
    <main className="todo-shell">
      <header className="topbar">
        <a className="brand" href="#today" aria-label="Daymark home">
          <span className="brand-mark" aria-hidden="true">d.</span>
          <span>daymark</span>
        </a>
        <div className="account-actions">
          <span className="account-email">{DEMO_EMAIL}</span>
          <button className="logout-button" type="button" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <section className="todo-content" id="today" aria-labelledby="todo-heading">
        <div className="date-label">YOUR DAY, AT A GLANCE</div>
        <div className="todo-heading-row">
          <div>
            <h1 id="todo-heading">Today<span className="heading-period">.</span></h1>
            <p className="todo-subtitle">A little progress adds up.</p>
          </div>
          <div className="remaining-count" aria-live="polite">
            <span className="count-number">{remainingCount}</span>
            <span>{remainingCount === 1 ? 'task' : 'tasks'} left</span>
          </div>
        </div>

        <form className="add-form" onSubmit={handleAddTodo}>
          <label className="visually-hidden" htmlFor="new-todo">Add a task</label>
          <input
            id="new-todo"
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="What needs your attention?"
            maxLength={160}
            required
          />
          <button className="primary-button add-button" type="submit"><span aria-hidden="true">+</span> Add task</button>
        </form>

        <div className="list-toolbar">
          <div className="filter-group" role="group" aria-label="Filter tasks">
            {FILTERS.map((filterName) => (
              <button
                className={`filter-button${filter === filterName ? ' is-selected' : ''}`}
                type="button"
                key={filterName}
                aria-pressed={filter === filterName}
                onClick={() => setFilter(filterName)}
              >
                {filterName}
              </button>
            ))}
          </div>
          <span className="total-count">{todos.length} {todos.length === 1 ? 'item' : 'items'}</span>
        </div>

        {visibleTodos.length > 0 ? (
          <ul className="todo-list">
            {visibleTodos.map((todo) => (
              <li className={`todo-item${todo.completed ? ' is-completed' : ''}`} key={todo.id}>
                <label className="todo-label">
                  <input
                    className="todo-checkbox"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggleTodo(todo.id)}
                  />
                  <span className="todo-title">{todo.title}</span>
                </label>
                <button
                  className="delete-button"
                  type="button"
                  aria-label={`Delete ${todo.title}`}
                  onClick={() => onDeleteTodo(todo.id)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state" aria-live="polite">
            <span className="empty-mark" aria-hidden="true">✳</span>
            <p>{filter === 'All' ? 'Nothing on the list yet.' : `No ${filter.toLowerCase()} tasks.`}</p>
            <span>{filter === 'All' ? 'Add a task above and start wherever you are.' : 'Try another filter to see your tasks.'}</span>
          </div>
        )}

        <footer className="todo-footer">
          <span>Keep it simple. Keep it moving.</span>
          {todos.some((todo) => todo.completed) && <span>{todos.filter((todo) => todo.completed).length} completed</span>}
        </footer>
      </section>
    </main>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [todos, setTodos] = useState(readTodos)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // The list remains usable for this session if browser storage is unavailable.
    }
  }, [todos])

  function handleLogin(email, password) {
    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) return false
    setIsAuthenticated(true)
    return true
  }

  function handleAddTodo(title) {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    setTodos((currentTodos) => [...currentTodos, { id, title, completed: false }])
  }

  function handleToggleTodo(todoId) {
    setTodos((currentTodos) => currentTodos.map((todo) => (
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    )))
  }

  function handleDeleteTodo(todoId) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))
  }

  return isAuthenticated ? (
    <TodoPage
      todos={todos}
      onAddTodo={handleAddTodo}
      onToggleTodo={handleToggleTodo}
      onDeleteTodo={handleDeleteTodo}
      onLogout={() => setIsAuthenticated(false)}
    />
  ) : (
    <LoginPage onLogin={handleLogin} />
  )
}
