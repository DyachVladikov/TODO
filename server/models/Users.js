import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema(
  {
    telegramId: { type: String, unique: true, sparse: true },
    // ДОБАВЛЕН name, чтобы сохранять имя из ТГ
    name: {
      type: String,
      trim: true,
    },
    login: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 100,
    },
    password: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  },
);

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
