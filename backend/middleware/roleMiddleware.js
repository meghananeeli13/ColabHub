const Project = require("../models/projects");

const resolveRole = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    req.project = project;
    const userId = req.user.id;

    if (project.createdBy.toString() === userId) {
      req.userRole = "owner";
      return next();
    }

    const collaborator = project.collaborators.find(
      (c) => c.user.toString() === userId
    );

    if (collaborator) {
      req.userRole = collaborator.role;
      return next();
    }

    return res.status(403).json({ message: "Access denied. Not a project member." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        message: `Access denied. Required: ${allowedRoles.join(" or ")}. Your role: ${req.userRole}`,
      });
    }
    next();
  };
};

module.exports = { resolveRole, requireRole };