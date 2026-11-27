import { useForm, usePage } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import type { PageProps } from "@/types/inertia"

export function NewTodoForm() {
  const { props } = usePage<PageProps>()
  const form = useForm({ todo: { name: "", description: "", due_on: "" } })
  const nameError = props.errors?.name
  const set = (field: "name" | "description" | "due_on", value: string) =>
    form.setData("todo", { ...form.data.todo, [field]: value })

  return (
    // Sticky so the entry row stays in view while the list scrolls.
    <form
      className="sticky top-0 z-10 -mx-2 mt-6 border-b border-hairline bg-page px-2 py-3"
      onSubmit={(e) => {
        e.preventDefault()
        form.post("/todos", {
          preserveScroll: true,
          onSuccess: () => form.reset(),
        })
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="new-todo-name" className="sr-only">Name</label>
        <Input
          id="new-todo-name"
          className="min-w-40 flex-1"
          value={form.data.todo.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Title"
        />
        <label htmlFor="new-todo-description" className="sr-only">Description</label>
        <Input
          id="new-todo-description"
          className="min-w-40 flex-[2]"
          value={form.data.todo.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Description (optional)"
        />
        <label htmlFor="new-todo-due" className="sr-only">Due date (optional)</label>
        <Input
          id="new-todo-due"
          type="date"
          className="w-auto"
          value={form.data.todo.due_on}
          onChange={(e) => set("due_on", e.target.value)}
        />
        <Button type="submit" disabled={form.processing}>
          Add
        </Button>
      </div>
      {nameError && <p role="alert" className="mt-2">Title {nameError}</p>}
    </form>
  )
}
