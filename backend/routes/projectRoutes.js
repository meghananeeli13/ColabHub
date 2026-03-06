// backend/routes/projectRoutes.js

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { resolveRole, requireRole } = require("../middleware/roleMiddleware");
const { validateCreateProject, validateCreateTask, validateUpdateTaskStatus } = require("../middleware/validateMiddleware");
const { suggestTasks } = require("../controllers/aiController");

const {
  createProject,
  getProjects,
  requestToJoin,
  updateRequestStatus,
  getMyProjects,
  cancelRequest,
  getOwnerPendingRequests,
  removeCollaborator,
  getProjectCollaborators,
  updateProject,
  deleteProject,
  changeCollaboratorRole,
  getCollaboratedProjects,
  getRecommendedProjects,
} = require("../controllers/projectController");

const {
  createTask,
  getProjectTasks,
  updateTaskStatus,
} = require("../controllers/taskController");


// 🔹 Project Routes
router.post("/", authMiddleware, validateCreateProject, createProject);
router.get("/", authMiddleware, getProjects);

router.get("/my-projects", authMiddleware, getMyProjects);
router.get("/collaborations", authMiddleware, getCollaboratedProjects);
router.get("/pending-requests", authMiddleware, getOwnerPendingRequests);

// 🤖 AI Task Suggestions (Owner Only)
router.get("/recommended", authMiddleware, getRecommendedProjects);
router.get("/:id/suggest-tasks", authMiddleware, resolveRole, requireRole("owner"), suggestTasks);

router.post("/:id/request", authMiddleware, requestToJoin);
router.put("/:id/request/:userId", authMiddleware, resolveRole, requireRole("owner"), updateRequestStatus);
router.delete("/:id/request", authMiddleware, cancelRequest);

router.delete("/:id/collaborator/:userId", authMiddleware, resolveRole, requireRole("owner"), removeCollaborator);

router.get("/:id/collaborators", authMiddleware, resolveRole, getProjectCollaborators);


// 🔹 Task Routes (Under Project)
router.post("/:id/tasks", authMiddleware, resolveRole, requireRole("owner"), validateCreateTask, createTask);
router.get("/:id/tasks", authMiddleware, resolveRole, getProjectTasks);
router.put("/:projectId/tasks/:taskId/status", authMiddleware, resolveRole, requireRole("owner", "editor"), validateUpdateTaskStatus, updateTaskStatus)



// 🔹 Project Update & Delete (Keep at Bottom)
router.put("/:id/collaborators/:userId/role", authMiddleware, resolveRole, requireRole("owner"), changeCollaboratorRole);
router.put("/:id", authMiddleware, resolveRole, requireRole("owner"), updateProject);
router.delete("/:id", authMiddleware, resolveRole, requireRole("owner"), deleteProject);



module.exports = router;