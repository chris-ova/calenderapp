class AddDueDateAndPositionToTodos < ActiveRecord::Migration[8.0]
  def up
    add_column :todos, :due_on, :date
    add_column :todos, :position, :integer, null: false, default: 0
    add_index :todos, %i[ user_id position ]

    execute <<~SQL
      UPDATE todos SET position = ranked.rn
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS rn
        FROM todos
      ) ranked
      WHERE todos.id = ranked.id
    SQL
  end

  def down
    remove_index :todos, %i[ user_id position ]
    remove_column :todos, :position
    remove_column :todos, :due_on
  end
end
