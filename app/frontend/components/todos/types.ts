export type Todo = {
  id: number
  name: string
  description: string | null
  completed: boolean
  due_on: string | null
}

export type TodoFilter = "all" | "active" | "overdue"
export type TodoSort = "manual" | "due" | "name"
