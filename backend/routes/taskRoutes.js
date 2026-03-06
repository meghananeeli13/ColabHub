const express = require("express");
const router = express.Router();

const {
  getMyTasks,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Get all tasks assigned to logged-in user
router.get("/my-tasks", authMiddleware, getMyTasks);

module.exports = router;