const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Task = require("../models/taskModel");
const Project = require("../models/projects");


// 🔹 Create Task (Owner Only)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo } = req.body;
  const projectId = req.params.id;

  // Validate projectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400);
    throw new Error("Invalid project ID");
  }

  const project = req.project; // injected by resolveRole middleware

  // 🔎 Validate assigned users are collaborators
  let validAssignees = [];

  if (assignedTo && Array.isArray(assignedTo)) {
    validAssignees = assignedTo.filter((userId) =>
      project.collaborators.some(
        (collab) => collab.user.toString() === userId
      )
    );
  }

  const task = await Task.create({
    project: projectId,
    title,
    description,
    assignedTo: validAssignees,
  });

  res.status(201).json(task);
});


// 🔹 Update Task Status (Owner or Assigned Collaborator)
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { projectId, taskId } = req.params;

  const task = await Task.findOne({
    _id: taskId,
    project: projectId,
  });

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  // ✅ Allow owner OR assigned collaborator
  // Editors can only update tasks they are assigned to
if (req.userRole === "editor") {
  const isAssigned = task.assignedTo.some(
    (userId) => userId.toString() === req.user.id
  );
  if (!isAssigned) {
    res.status(403);
    throw new Error("Editors can only update tasks they are assigned to");
  }
}
  task.status = status;
  await task.save();

  res.json(task);
});


// 🔹 Get Tasks of a Project
const getProjectTasks = asyncHandler(async (req, res) => {
  const projectId = req.params.id;

  const tasks = await Task.find({ project: projectId })
    .populate("assignedTo", "name email");

  res.status(200).json(tasks);
});


// 🔹 Get My Tasks
const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    assignedTo: { $in: [req.user.id] },
  })
    .populate("project", "title")
    .populate("assignedTo", "name email");

  res.json(tasks);
});


module.exports = {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTaskStatus,
};