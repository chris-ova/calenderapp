class TodosController < ApplicationController
  before_action :set_todo, only: %i[ update destroy ]

  def create
    todo = Current.user.todos.new(todo_params)
    if todo.save
      redirect_back(fallback_location: dashboard_path, notice: "To-do added.")
    else
      redirect_back(fallback_location: dashboard_path, inertia: { errors: errors_for(todo) })
    end
  end

  def update
    if @todo.update(todo_params)
      redirect_back(fallback_location: dashboard_path)
    else
      redirect_back(fallback_location: dashboard_path, inertia: { errors: errors_for(@todo) })
    end
  end

  def destroy
    @todo.destroy
    redirect_back(fallback_location: dashboard_path, notice: "To-do deleted.")
  end

  # PATCH /todos/reorder — ids: [..] in the desired order. Only the current
  # user's to-dos are touched; the given ids take the lowest position slots.
  def reorder
    ids = Array(params[:ids]).map(&:to_i)
    todos = Current.user.todos.where(id: ids).index_by(&:id)
    slots = todos.values.map(&:position).sort

    Todo.transaction do
      ids.select { |id| todos.key?(id) }.zip(slots).each do |id, position|
        todos[id].update_columns(position: position)
      end
    end

    redirect_back(fallback_location: dashboard_path)
  end

  private
    def set_todo
      @todo = Current.user.todos.find(params[:id])
    end

    def todo_params
      params.require(:todo).permit(:name, :description, :completed, :due_on)
    end

    def errors_for(todo)
      todo.errors.to_hash(true).transform_values(&:first)
    end
end
