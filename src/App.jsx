import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'daymark.todos'
const FILTERS = ['All', 'Active', 'Completed']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function readTodosByDate() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(savedTodos)) {
      return { [getDateKey(new Date())]: savedTodos }
    }

    if (savedTodos && typeof savedTodos === 'object') {
      return Object.fromEntries(
        Object.entries(savedTodos).filter(([dateKey, todos]) => (
          /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && Array.isArray(todos)
        )),
      )
    }
  } catch {
    return {}
  }

  return {}
}

function getCalendarDates(month) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const dayCount = new Date(year, monthIndex + 1, 0).getDate()
  const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7

  return Array.from({ length: cellCount }, (_, index) => (
    new Date(year, monthIndex, index - firstWeekday + 1)
  ))
}

function TodoPage({ todosByDate, selectedDate, visibleMonth, onSelectDate, onChangeMonth, onAddTodo, onToggleTodo, onDeleteTodo, onGoToToday, canInstall, onInstall }) {
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('All')
  const todayKey = getDateKey(new Date())
  const selectedTodos = todosByDate[selectedDate] ?? []
  const remainingCount = selectedTodos.filter((todo) => !todo.completed).length
  const completedCount = selectedTodos.length - remainingCount
  const progressPercent = selectedTodos.length ? Math.round((completedCount / selectedTodos.length) * 100) : 0
  const visibleTodos = selectedTodos.filter((todo) => {
    if (filter === 'Active') return !todo.completed
    if (filter === 'Completed') return todo.completed
    return true
  })
  const selectedDateLabel = dateFromKey(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const monthLabel = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const calendarDates = getCalendarDates(visibleMonth)

  function handleAddTodo(event) {
    event.preventDefault()
    const title = newTodo.trim()
    if (!title) return
    onAddTodo(selectedDate, title)
    setNewTodo('')
  }

  function handleMonthChange(offset) {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    const selectedDay = dateFromKey(selectedDate).getDate()
    const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
    onChangeMonth(nextMonth, new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(selectedDay, lastDay)))
  }

  return (
    <main className="todo-shell">
      <header className="topbar">
        <a className="brand" href="#planner" aria-label="Daymark planner">
          <span className="brand-mark" aria-hidden="true">d.</span>
          <span>daymark</span>
        </a>
        <div className="topbar-actions">
          {canInstall && (
            <button className="install-button" type="button" onClick={onInstall}>
              <span aria-hidden="true">↓</span> Install app
            </button>
          )}
          <button className="today-button" type="button" onClick={onGoToToday}>Today <span aria-hidden="true">↗</span></button>
        </div>
      </header>

      <section className="todo-content" id="planner" aria-labelledby="todo-heading">
        <div className="date-label">A LITTLE SPACE FOR EVERY DAY</div>
        <div className="todo-heading-row">
          <div>
            <h1 id="todo-heading">Plan by day<span className="heading-period">.</span></h1>
            <p className="todo-subtitle">Your plans, memories, and small wins in one place.</p>
          </div>
          <div className="month-summary">
            <span>{Object.keys(todosByDate).filter((dateKey) => dateKey.startsWith(`${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}`)).length}</span>
            <span>days with plans this month</span>
          </div>
        </div>

        <div className="calendar-workspace">
          <section className="calendar-panel" aria-label="Calendar">
            <div className="calendar-panel-top">
              <div>
                <p className="calendar-eyebrow">MONTHLY OVERVIEW</p>
                <h2>{monthLabel}</h2>
              </div>
              <div className="month-navigation">
                <button type="button" aria-label="Previous month" onClick={() => handleMonthChange(-1)}>‹</button>
                <button type="button" aria-label="Next month" onClick={() => handleMonthChange(1)}>›</button>
              </div>
            </div>

            <div className="calendar-weekdays" aria-hidden="true">
              {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>
            <div className="calendar-grid" role="grid" aria-label={monthLabel}>
              {calendarDates.map((date) => {
                const dateKey = getDateKey(date)
                const dayTodos = todosByDate[dateKey] ?? []
                const isCurrentMonth = date.getMonth() === visibleMonth.getMonth()
                const isSelected = dateKey === selectedDate
                const isToday = dateKey === todayKey

                return (
                  <button
                    className={`calendar-day${isCurrentMonth ? '' : ' is-outside-month'}${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}${dayTodos.length ? ' has-todos' : ''}`}
                    type="button"
                    role="gridcell"
                    key={dateKey}
                    aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}${dayTodos.length ? `, ${dayTodos.length} ${dayTodos.length === 1 ? 'task' : 'tasks'}` : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectDate(date)}
                  >
                    <span>{date.getDate()}</span>
                    {dayTodos.length > 0 && <i aria-hidden="true" />}
                  </button>
                )
              })}
            </div>

            <div className="calendar-legend">
              <span><i className="legend-today" /> Today</span>
              <span><i className="legend-planned" /> Has tasks</span>
            </div>
          </section>

          <section className="day-panel" aria-labelledby="selected-day-title">
            <div className="day-panel-header">
              <div>
                <p className="date-label">{selectedDate === todayKey ? 'TODAY' : 'DAY VIEW'}</p>
                <h2 id="selected-day-title">{selectedDateLabel}</h2>
              </div>
              <div className="remaining-count" aria-live="polite">
                <span className="count-number">{remainingCount}</span>
                <span>{remainingCount === 1 ? 'task' : 'tasks'} left</span>
              </div>
            </div>

            <div className="day-progress" role="img" aria-label={`${progressPercent}% of this day's tasks complete`}>
              <div className="day-progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
              <span>{completedCount} of {selectedTodos.length} complete</span>
            </div>

            <form className="add-form" onSubmit={handleAddTodo}>
              <label className="visually-hidden" htmlFor="new-todo">Add a task for {selectedDateLabel}</label>
              <input
                id="new-todo"
                type="text"
                value={newTodo}
                onChange={(event) => setNewTodo(event.target.value)}
                placeholder="What do you want to do?"
                maxLength={160}
                required
              />
              <button className="primary-button add-button" type="submit"><span aria-hidden="true">+</span> Add</button>
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
              <span className="total-count">{selectedTodos.length} {selectedTodos.length === 1 ? 'item' : 'items'}</span>
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
                        onChange={() => onToggleTodo(selectedDate, todo.id)}
                      />
                      <span className="todo-title">{todo.title}</span>
                    </label>
                    <button
                      className="delete-button"
                      type="button"
                      aria-label={`Delete ${todo.title}`}
                      onClick={() => onDeleteTodo(selectedDate, todo.id)}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state" aria-live="polite">
                <span className="empty-mark" aria-hidden="true">✳</span>
                <p>{filter === 'All' ? 'A fresh page.' : `No ${filter.toLowerCase()} tasks.`}</p>
                <span>{filter === 'All' ? 'Add a plan, or choose another day to look back.' : 'Try another filter to see this day’s tasks.'}</span>
              </div>
            )}

            <footer className="todo-footer">
              <span>{selectedDate === todayKey ? 'Make today your own.' : `A look back at ${dateFromKey(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`}</span>
              {completedCount > 0 && <span>{completedCount} completed</span>}
            </footer>
          </section>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const [todosByDate, setTodosByDate] = useState(readTodosByDate)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()))
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDate))
    } catch {
      // Keep the planner usable for this session if browser storage is unavailable.
    }
  }, [todosByDate])

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setInstallPrompt(event)
    }

    function handleAppInstalled() {
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  function handleSelectDate(date) {
    setSelectedDate(getDateKey(date))
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  function handleChangeMonth(month, selectedDay) {
    setVisibleMonth(month)
    setSelectedDate(getDateKey(selectedDay))
  }

  function handleGoToToday() {
    const today = new Date()
    setSelectedDate(getDateKey(today))
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  function handleAddTodo(dateKey, title) {
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    setTodosByDate((currentTodos) => ({
      ...currentTodos,
      [dateKey]: [...(currentTodos[dateKey] ?? []), { id, title, completed: false }],
    }))
  }

  function handleToggleTodo(dateKey, todoId) {
    setTodosByDate((currentTodos) => ({
      ...currentTodos,
      [dateKey]: (currentTodos[dateKey] ?? []).map((todo) => (
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )),
    }))
  }

  function handleDeleteTodo(dateKey, todoId) {
    setTodosByDate((currentTodos) => {
      const remainingTodos = (currentTodos[dateKey] ?? []).filter((todo) => todo.id !== todoId)
      const nextTodos = { ...currentTodos }
      if (remainingTodos.length) nextTodos[dateKey] = remainingTodos
      else delete nextTodos[dateKey]
      return nextTodos
    })
  }

  return (
    <TodoPage
      todosByDate={todosByDate}
      selectedDate={selectedDate}
      visibleMonth={visibleMonth}
      onSelectDate={handleSelectDate}
      onChangeMonth={handleChangeMonth}
      onAddTodo={handleAddTodo}
      onToggleTodo={handleToggleTodo}
      onDeleteTodo={handleDeleteTodo}
      onGoToToday={handleGoToToday}
      canInstall={Boolean(installPrompt)}
      onInstall={handleInstall}
    />
  )
}
