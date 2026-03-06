// backend/controllers/projectController.js

const asyncHandler = require("express-async-handler");
const Project = require("../models/projects");
const Task = require("../models/taskModel");
const mongoose = require("mongoose");

// 🔹 Create Project (Protected)
const createProject = asyncHandler(async (req, res) => {
  const { title, description, techStack } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required");
  }

  const project = await Project.create({
    title,
    description,
    techStack,
    createdBy: req.user.id,
    collaborators: [], // now object-based
  });

  res.status(201).json(project);
});


// 🔹 Get All Projects (Pagination + Filter)
const getProjects = asyncHandler(async (req, res) => {
const page = Number(req.query.page) || 1;
const limit = 5;
const skip = (page - 1) * limit;

const filter = {};

if (req.query.tech) {
  filter.techStack = { $in: [req.query.tech] };
}

if (req.query.search) {
  filter.title = { $regex: req.query.search, $options: "i" };
}
  const projects = await Project.find(filter)
    .populate("createdBy", "name email")
    .populate("collaborators.user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const updatedProjects = projects.map((project) => {
    let requestStatus = "not_requested";

    const request = project.collaborationRequests.find(
      (reqItem) => reqItem.user.toString() === req.user.id
    );

    if (request) {
      requestStatus = request.status;
    } else if (
      project.collaborators.find(
        (collab) => collab.user.toString() === req.user.id
      )
    ) {
      requestStatus = "accepted";
    }

    return {
      ...project.toObject(),
      requestStatus,
    };
  });

  res.status(200).json(updatedProjects);
});


// 🔹 Request to Collaborate
const requestToJoin = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (project.createdBy.toString() === req.user.id) {
    res.status(400);
    throw new Error("Owner cannot request their own project");
  }

  const alreadyRequested = project.collaborationRequests.find(
    (reqItem) => reqItem.user.toString() === req.user.id
  );

  if (alreadyRequested) {
    res.status(400);
    throw new Error("You already requested this project");
  }

  project.collaborationRequests.push({
    user: req.user.id,
  });

  await project.save();

  res.status(200).json({ message: "Request sent successfully" });
});


// 🔹 Accept / Reject Request (Owner Only + Role Support)
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, role } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status value");
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (project.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Only project owner can update requests");
  }

  const request = project.collaborationRequests.find(
    (reqItem) => reqItem.user.toString() === req.params.userId
  );

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  request.status = status;

  if (status === "accepted") {
    const alreadyCollaborator = project.collaborators.find(
      (collab) => collab.user.toString() === req.params.userId
    );

    if (!alreadyCollaborator) {
      project.collaborators.push({
        user: req.params.userId,
        role: role === "editor" ? "editor" : "viewer", // default to viewer if not specified or invalid
      });
    }
  }

  await project.save();

  res.status(200).json({ message: "Request updated successfully" });
});


// 🔹 Get My Created Projects
const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ createdBy: req.user.id })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(projects);
});


// 🔹 Get Projects Where I Am a Collaborator
const getCollaboratedProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    "collaborators.user": req.user.id,
  })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(projects);
});


// 🔹 Cancel Collaboration Request
const cancelRequest = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const requestIndex = project.collaborationRequests.findIndex(
    (reqItem) => reqItem.user.toString() === req.user.id
  );

  if (requestIndex === -1) {
    res.status(400);
    throw new Error("No collaboration request found to cancel");
  }

  project.collaborationRequests.splice(requestIndex, 1);

  await project.save();

  res.status(200).json({
    message: "Collaboration request cancelled successfully",
  });
});


// 🔹 Get Owner Pending Requests
const getOwnerPendingRequests = asyncHandler(async (req, res) => {
  const projects = await Project.find({ createdBy: req.user.id })
    .populate("collaborationRequests.user", "name email");

  const pendingRequests = [];

  projects.forEach((project) => {
    project.collaborationRequests.forEach((request) => {
      if (request.status === "pending") {
        pendingRequests.push({
          projectId: project._id,
          projectTitle: project.title,
          user: request.user,
          status: request.status,
        });
      }
    });
  });

  res.status(200).json(pendingRequests);
});


// 🔹 Remove Collaborator (Owner Only)
const removeCollaborator = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const project = await Project.findById(id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (project.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Only the project owner can remove collaborators");
  }

  if (project.createdBy.toString() === userId) {
    res.status(400);
    throw new Error("Owner cannot be removed");
  }

  const isCollaborator = project.collaborators.some(
    (collab) => collab.user.toString() === userId
  );

  if (!isCollaborator) {
    res.status(400);
    throw new Error("User is not a collaborator");
  }

  project.collaborators = project.collaborators.filter(
    (collab) => collab.user.toString() !== userId
  );

  await project.save();

  res.status(200).json({ message: "Collaborator removed successfully" });
});


// 🔹 Get Collaborators of Project
const getProjectCollaborators = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("collaborators.user", "name email");

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const isOwner = project.createdBy.toString() === req.user.id;
  const isCollaborator = project.collaborators.some(
    (collab) => collab.user._id.toString() === req.user.id
  );

  if (!isOwner && !isCollaborator) {
    res.status(403);
    throw new Error("Not authorized");
  }

  res.status(200).json(project.collaborators);
});


// 🔹 Update Project (Owner & Collaborators)
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const isOwner = project.createdBy.toString() === req.user.id;
  const isCollaborator = project.collaborators.some(
    (collab) => collab.user.toString() === req.user.id
  );

  if (!isOwner && !isCollaborator) {
    res.status(403);
    throw new Error("Not authorized to edit this project");
  }

  project.title = req.body.title || project.title;
  project.description = req.body.description || project.description;

  const updatedProject = await project.save();

  res.status(200).json(updatedProject);
});


// 🔹 Delete Project (Owner Only)
const deleteProject = asyncHandler(async (req, res) => {
  const project = req.project;

  // Cascade delete all tasks belonging to this project
  await Task.deleteMany({ project: project._id });

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  if (project.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Only the owner can delete this project");
  }

  // Cascade delete all tasks belonging to this project
  await Task.deleteMany({ project: project._id });

  await project.deleteOne();

  res.status(200).json({ message: "Project deleted successfully" });
});
// 🔹 Change Collaborator Role (Owner Only)
const changeCollaboratorRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["editor", "viewer"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role. Must be editor or viewer");
  }

  const project = req.project;

  const collaborator = project.collaborators.find(
    (collab) => collab.user.toString() === userId
  );

  if (!collaborator) {
    res.status(404);
    throw new Error("Collaborator not found");
  }

  collaborator.role = role;
  await project.save();

  res.status(200).json({ message: "Role updated successfully" });
});

module.exports = {
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
}