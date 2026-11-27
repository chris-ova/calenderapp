require "test_helper"

class TodosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @todo = todos(:one)
    @other = todos(:two)
  end

  test "unauthenticated users are redirected to login" do
    post todos_path, params: { todo: { name: "x" } }
    assert_redirected_to login_path
    patch reorder_todos_path, params: { ids: [ @todo.id ] }
    assert_redirected_to login_path
  end

  test "dashboard lists only the current user's todos, completed ones separately" do
    sign_in
    get dashboard_path
    assert_response :success
    assert_includes response.body, "Write report"
    assert_includes response.body, "Old finished task"
    assert_not_includes response.body, "Other user"
  end

  test "dashboard props split open and completed todos" do
    sign_in
    get dashboard_path, headers: inertia_headers
    props = response.parsed_body["props"]
    assert_equal [ "Write report", "Book flights" ], props["todos"].map { |t| t["name"] }
    assert_equal [ "Old finished task" ], props["completed_todos"].map { |t| t["name"] }
  end

  test "dashboard sorts by due date with undated last, and by name" do
    sign_in
    get dashboard_path(sort: "due"), headers: inertia_headers
    assert_equal [ "Write report", "Book flights" ], response.parsed_body["props"]["todos"].map { |t| t["name"] }
    get dashboard_path(sort: "name"), headers: inertia_headers
    assert_equal [ "Book flights", "Write report" ], response.parsed_body["props"]["todos"].map { |t| t["name"] }
  end

  test "dashboard overdue filter and invalid params fall back to defaults" do
    sign_in
    get dashboard_path(filter: "overdue"), headers: inertia_headers
    assert_equal [ "Write report" ], response.parsed_body["props"]["todos"].map { |t| t["name"] }
    get dashboard_path(filter: "bogus", sort: "bogus"), headers: inertia_headers
    props = response.parsed_body["props"]
    assert_equal "all", props["filter"]
    assert_equal "manual", props["sort"]
  end

  test "creates a todo with name, description and due date" do
    sign_in
    assert_difference -> { @user.todos.count }, 1 do
      post todos_path, params: { todo: { name: "Buy milk", description: "2 litres", due_on: "2030-05-01" } }
    end
    assert_response :redirect
    todo = @user.todos.find_by(name: "Buy milk")
    assert_equal "2 litres", todo.description
    assert_equal Date.new(2030, 5, 1), todo.due_on
  end

  test "rejects a todo without a name" do
    sign_in
    assert_no_difference "Todo.count" do
      post todos_path, params: { todo: { name: "" } }
    end
    assert_response :redirect
  end

  test "edits name, description and due date" do
    sign_in
    patch todo_path(@todo), params: { todo: { name: "New name", description: "New desc", due_on: "2031-01-02" } }
    assert_response :redirect
    @todo.reload
    assert_equal "New name", @todo.name
    assert_equal "New desc", @todo.description
    assert_equal Date.new(2031, 1, 2), @todo.due_on
  end

  test "checks off a todo" do
    sign_in
    patch todo_path(@todo), params: { todo: { completed: true } }
    assert_response :redirect
    assert @todo.reload.completed
  end

  test "deletes a todo" do
    sign_in
    assert_difference -> { @user.todos.count }, -1 do
      delete todo_path(@todo)
    end
    assert_response :redirect
  end

  test "reorders todos" do
    sign_in
    flights = todos(:three)
    patch reorder_todos_path, params: { ids: [ flights.id, @todo.id ] }
    assert_response :redirect
    assert_equal 1, flights.reload.position
    assert_equal 2, @todo.reload.position
  end

  test "reorder ignores another user's todos" do
    sign_in
    patch reorder_todos_path, params: { ids: [ @other.id, @todo.id ] }
    assert_response :redirect
    assert_equal 1, @other.reload.position
    assert_equal "Other user's todo", @other.name
  end

  test "cannot modify another user's todo" do
    sign_in
    patch todo_path(@other), params: { todo: { name: "Hacked" } }
    assert_response :not_found
    assert_equal "Other user's todo", @other.reload.name
    assert_no_difference "Todo.count" do
      delete todo_path(@other)
    end
  end

  private
    def sign_in
      post login_path, params: { email: @user.email, password: "password" }
    end

    def inertia_headers
      { "X-Inertia" => "true", "X-Inertia-Version" => ViteRuby.digest }
    end
end
