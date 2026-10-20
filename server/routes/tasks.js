
const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

// CREATE a task belonging to the logged-in user
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        message: "Task title cannot exceed 200 characters.",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      user: req.userId,
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error.message);

    return res.status(500).json({
      message: "Failed to create task.",
    });
  }
});

// READ only the logged-in user's tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve tasks.",
    });
  }
});

// UPDATE only a task owned by the logged-in user
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "title")) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty.",
        });
      }

      if (title.trim().length > 200) {
        return res.status(400).json({
          message: "Task title cannot exceed 200 characters.",
        });
      }

      updates.title = title.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "completed")) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message: "Completed must be true or false.",
        });
      }

      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide a title or completed status to update.",
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: id,
        user: req.userId,
      },
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error.message);

    return res.status(500).json({
      message: "Failed to update task.",
    });
  }
});

// DELETE only a task owned by the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      message: "Task deleted successfully.",
      task: deletedTask,
    });
  } catch (error) {
    console.error("Delete task error:", error.message);

    return res.status(500).json({
      message: "Failed to delete task.",
    });
  }
});

module.exports = router;
