const asyncHandler = require("express-async-handler");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Project = require("../models/projects");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🤖 Suggest Tasks for a Project (Owner Only)
const suggestTasks = asyncHandler(async (req, res) => {
  const project = req.project; // injected by resolveRole middleware

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are a project management assistant.
    A student project called "${project.title}" is described as: "${project.description}".
    The tech stack is: ${project.techStack.join(", ") || "not specified"}.
    
    Suggest exactly 5 tasks for this project.
    Respond ONLY with a JSON array, no extra text, no markdown, no code blocks.
    Format:
    [
      { "title": "Task title", "description": "Short task description" },
      ...
    ]
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Clean response and parse JSON
  const cleaned = text.replace(/```json|```/g, "").trim();
  const tasks = JSON.parse(cleaned);

  res.status(200).json({ suggestions: tasks });
});

module.exports = { suggestTasks };