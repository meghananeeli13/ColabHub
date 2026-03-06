const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map((d) => d.message),
    });
  }
  next();
};

// Auth
exports.validateRegister = validate(
  Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    skills: Joi.array().items(Joi.string()).optional(),
  })
);

exports.validateLogin = validate(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
);

// Project
exports.validateCreateProject = validate(
  Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).required(),
    techStack: Joi.array().items(Joi.string()).optional(),
  })
);

// Task
exports.validateCreateTask = validate(
  Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().optional(),
    assignedTo: Joi.array().items(Joi.string()).optional(),
  })
);

exports.validateUpdateTaskStatus = validate(
  Joi.object({
    status: Joi.string().valid("pending", "in-progress", "completed").required(),
  })
);