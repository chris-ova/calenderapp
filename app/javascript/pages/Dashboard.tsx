import { Head, router, usePage } from "@inertiajs/react"
import { AppShell } from "@/components/AppShell"
import { Select } from "@/components/ui/select"
import { NewTodoForm } from "@/components/todos/new-todo-form"
import { TodoItem } from "@/components/todos/todo-item"
import { TodoList } from "@/components/todos/todo-list"
import type { Todo, TodoFilter, TodoSort } from "@/components/todos/types"

import type { PageProps } from "@/types/inertia"

type DashboardProps = {
  todos: Todo[]
  completed_todos: Todo[]
  filter: TodoFilter
  sort: TodoSort
  today: string
}

export default function Dashboard() {
  const { props } = usePage<PageProps<DashboardProps>>()
  const user = props.current_user
  const { todos = [], completed_todos: completed = [], filter, sort, today } = props

  const update = (next: Partial<{ filter: TodoFilter; sort: TodoSort }>) =>
    router.get("/dashboard", { filter, sort, ...next }, { preserveState: true, preserveScroll: true, replace: true })

  return (
    <>
      <Head title="Home">
        <meta name="description" content="Your account home and to-do list." />
        <meta property="og:title" content="Home" />
        <meta property="og:description" content="Your account home and to-do list." />
      </Head>
      <AppShell>
        <h1>Home</h1>
        <p className="mt-2">
          Welcome to your account{user?.email ? `, ${user.email}` : ""}.
        </p>

        <h2 className="mt-8">To-dos</h2>
        <NewTodoForm />

        <div className="mt-8 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="todo-filter">Show</label>
            <Select id="todo-filter" value={filter} onChange={(e) => update({ filter: e.target.value as TodoFilter })}>
              <option value="all">All open</option>
              <option value="overdue">Overdue</option>
            </Select>
          </div>
          <div>
            <label htmlFor="todo-sort">Sort by</label>
            <Select id="todo-sort" value={sort} onChange={(e) => update({ sort: e.target.value as TodoSort })}>
              <option value="manual">My order</option>
              <option value="due">Due date</option>
              <option value="name">Name</option>
            </Select>
          </div>
        </div>

        {todos.length === 0 ? (
          <p className="mt-6">
            {filter === "overdue" ? "Nothing is overdue." : "Nothing to do yet. Add your first to-do above."}
          </p>
        ) : (
          <TodoList todos={todos} today={today} sortable={sort === "manual" && filter === "all"} />
        )}

        {completed.length > 0 && (
          <details className="mt-8">
            <summary className="cursor-pointer">Completed ({completed.length})</summary>
            <ul className="mt-2 list-none p-0">
              {completed.map((todo) => (
                <TodoItem key={todo.id} todo={todo} today={today} />
              ))}
            </ul>
          </details>
        )}
      </AppShell>
    </>
  )
}
