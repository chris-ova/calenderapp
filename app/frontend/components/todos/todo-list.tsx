import { useEffect, useState } from "react"
import { router } from "@inertiajs/react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

import { TodoItem } from "./todo-item"
import type { Todo } from "./types"

function SortableTodo({ todo, today }: { todo: Todo; today: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id })

  return (
    <TodoItem
      ref={setNodeRef}
      todo={todo}
      today={today}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : undefined,
      }}
      handle={
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="mt-0.5 cursor-grab touch-none text-ink-muted"
          aria-label={`Reorder "${todo.name}"`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      }
    />
  )
}

export function TodoList({
  todos,
  today,
  sortable,
}: {
  todos: Todo[]
  today: string
  /** Drag handles are only offered while sorting manually. */
  sortable: boolean
}) {
  const [items, setItems] = useState(todos)
  useEffect(() => setItems(todos), [todos])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!sortable) {
    return (
      <ul className="mt-6 list-none p-0">
        {items.map((todo) => (
          <TodoItem key={todo.id} todo={todo} today={today} />
        ))}
      </ul>
    )
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = items.findIndex((t) => t.id === active.id)
    const to = items.findIndex((t) => t.id === over.id)
    const next = arrayMove(items, from, to)
    setItems(next)
    router.patch("/todos/reorder", { ids: next.map((t) => t.id) }, { preserveScroll: true })
  }

  return (
    <DndContext id="todo-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="mt-6 list-none p-0">
          {items.map((todo) => (
            <SortableTodo key={todo.id} todo={todo} today={today} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
