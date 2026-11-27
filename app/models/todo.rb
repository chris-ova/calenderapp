class Todo < ApplicationRecord
  belongs_to :user

  validates :name, presence: true, length: { maximum: 255 }

  before_create :assign_position

  scope :active, -> { where(completed: false) }
  scope :done, -> { where(completed: true) }
  scope :overdue, ->(today = Date.current) { active.where("due_on < ?", today) }
  scope :ordered, -> { order(:position, :id) }

  private
    def assign_position
      self.position = (user.todos.maximum(:position) || 0) + 1
    end
end
