require "test_helper"

class TodoTest < ActiveSupport::TestCase
  test "requires a name" do
    todo = users(:one).todos.new(name: "")
    assert_not todo.valid?
    assert todo.errors[:name].any?
  end

  test "description and due date are optional and completed defaults to false" do
    todo = users(:one).todos.create!(name: "Call dentist")
    assert_nil todo.description
    assert_nil todo.due_on
    assert_not todo.completed
  end

  test "new todos are appended after the user's last position" do
    last = users(:one).todos.maximum(:position)
    todo = users(:one).todos.create!(name: "Newest")
    assert_equal last + 1, todo.position
  end

  test "positions are scoped per user" do
    todo = users(:two).todos.create!(name: "Mine")
    assert_equal 2, todo.position
  end

  test "overdue only includes open todos due before today" do
    assert_includes users(:one).todos.overdue, todos(:one)
    assert_not_includes users(:one).todos.overdue, todos(:three)
    todos(:one).update!(completed: true)
    assert_not_includes users(:one).todos.overdue, todos(:one)
  end
end
