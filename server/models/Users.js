import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  },
);

// Виртуальное поле — получить все задачи пользователя через populate
UsersSchema.virtual("todos", {
  ref: "Todo",
  localField: "_id",
  foreignField: "userId",
});

// Каскадное удаление задач при удалении пользователя
UsersSchema.pre("findOneAndDelete", async function () {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    const Todo = mongoose.model("Todo");
    await Todo.deleteMany({ userId: user._id });
  }
});

export default mongoose.model("Users", UsersSchema, "Users");
