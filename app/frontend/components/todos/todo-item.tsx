import * as React from "react"
import { useState } from "react"
import { router } from "@inertiajs/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

import type { Todo } from "./types"

type TodoItemProps = {
  todo: Todo
  today: string
  /** Rendered before the checkbox, e.g. a drag handle. */
  handle?: React.ReactNode
}

function formatDue(iso: string) {
  // Parse as a local calendar date so the day never shifts with time zones.
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export const TodoItem = React.forwardRef<
  HTMLLIElement,
  TodoItemProps & React.HTMLAttributes<HTMLLIElement>
>(function TodoItem({ todo, today, handle, className, ...rest }, ref) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(todo.name)
  const [description, setDescription] = useState(todo.description ?? "")
  const [dueOn, setDueOn] = useState(todo.due_on ?? "")

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    router.patch(
      `/todos/${todo.id}`,
      { todo: { name, description, due_on: dueOn } },
      { preserveScroll: true, onSuccess: () => setEditing(false) },
    )
  }

  const cancel = () => {
    setName(todo.name)
    setDescription(todo.description ?? "")
    setDueOn(todo.due_on ?? "")
    setEditing(false)
  }

  const itemClass = `border-b border-hairline py-4 ${className ?? ""}`

  if (editing) {
    return (
      <li ref={ref} className={itemClass} {...rest}>
        <form className="flex flex-col gap-3" onSubmit={save}>
          <label htmlFor={`todo-${todo.id}-name`}>Name</label>
          <Input id={`todo-${todo.id}-name`} value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor={`todo-${todo.id}-description`}>Description</label>
          <textarea
            id={`todo-${todo.id}-description`}
            className="form-control"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label htmlFor={`todo-${todo.id}-due`}>Due date (optional)</label>
          <Input
            id={`todo-${todo.id}-due`}
            type="date"
            className="max-w-xs"
            value={dueOn}
            onChange={(e) => setDueOn(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">Save</Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    )
  }

  const overdue = !todo.completed && todo.due_on !== null && todo.due_on < today
  const strike = todo.completed ? "line-through opacity-60" : undefined

  return (
    <li ref={ref} className={`flex items-start gap-3 ${itemClass}`} {...rest}>
      {handle}
      <Checkbox
        className="mt-1"
        aria-label={`Mark "${todo.name}" ${todo.completed ? "incomplete" : "complete"}`}
        checked={todo.completed}
        onChange={(e) =>
          router.patch(`/todos/${todo.id}`, { todo: { completed: e.target.checked } }, { preserveScroll: true })
        }
      />
      <div className="min-w-0 flex-1">
        <p className={strike}>
          <strong>{todo.name}</strong>
          {todo.due_on && (
            <Badge tone={overdue ? "signal" : "muted"} className="ml-2">
              {overdue ? "Overdue · " : "Due "}
              {formatDue(todo.due_on)}
            </Badge>
          )}
        </p>
        {todo.description && <p className={strike}>{todo.description}</p>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.delete(`/todos/${todo.id}`, { preserveScroll: true })}
        >
          Delete
        </Button>
      </div>
    </li>
  )
})
