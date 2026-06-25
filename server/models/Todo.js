import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    deadline: {
      type: String,
    },
    projectId: {
      type: String,
      default: "inbox",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    important: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    checkList: {
      type: [
        {
          id: String,
          title: String,
          completed: Boolean,
        },
      ],
      default: [],
    },
    reminders: {
      type: [
        {
          minutesBefore: { type: Number, required: true },
          triggerAt: { type: Date, required: true },
          sent: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Todo", TodoSchema, "Todos");
