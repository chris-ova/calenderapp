class DashboardController < ApplicationController
  FILTERS = %w[ all overdue ].freeze
  SORTS = %w[ manual due name ].freeze

  def show
    filter = FILTERS.include?(params[:filter]) ? params[:filter] : "all"
    sort = SORTS.include?(params[:sort]) ? params[:sort] : "manual"
    today = Date.current

    open_todos = Current.user.todos.active
    open_todos = open_todos.overdue(today) if filter == "overdue"
    open_todos = case sort
    when "due" then open_todos.order(Arel.sql("due_on IS NULL"), :due_on, :position)
    when "name" then open_todos.order(Arel.sql("LOWER(name)"), :position)
    else open_todos.ordered
    end

    render inertia: "Dashboard", props: {
      todos: open_todos.map { |t| serialize(t) },
      completed_todos: Current.user.todos.done.order(updated_at: :desc).map { |t| serialize(t) },
      filter: filter,
      sort: sort,
      today: today.iso8601
    }
  end

  private
    def serialize(todo)
      {
        id: todo.id,
        name: todo.name,
        description: todo.description,
        completed: todo.completed,
        due_on: todo.due_on&.iso8601
      }
    end
end
