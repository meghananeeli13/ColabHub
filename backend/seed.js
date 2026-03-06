// seed.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Project = require("./models/projects");
const Task = require("./models/taskModel");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected...");

    // 🔥 Clear Database
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    console.log("Old data removed.");

    // 🔐 Hash Password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // 👤 Create 5 Users
    const users = await User.insertMany([
      { name: "Alice", email: "alice@test.com", password: hashedPassword },
      { name: "Bob", email: "bob@test.com", password: hashedPassword },
      { name: "Charlie", email: "charlie@test.com", password: hashedPassword },
      { name: "David", email: "david@test.com", password: hashedPassword },
      { name: "Eve", email: "eve@test.com", password: hashedPassword },
    ]);

    console.log("Users created.");

    // 🚀 Create 4 Projects
    const projects = await Project.insertMany([
      {
        title: "ColabHub Platform",
        description: "A student collaboration platform.",
        techStack: ["Node.js", "React", "MongoDB"],
        createdBy: users[0]._id,
        collaborators: [
          { user: users[1]._id, role: "editor" },
          { user: users[2]._id, role: "viewer" },
        ],
      },
      {
        title: "AI Chatbot",
        description: "AI-powered chatbot system.",
        techStack: ["Python", "FastAPI"],
        createdBy: users[1]._id,
        collaborators: [
          { user: users[0]._id, role: "editor" },
          { user: users[3]._id, role: "viewer" },
        ],
      },
      {
        title: "E-Commerce Website",
        description: "Full stack ecommerce project.",
        techStack: ["MERN"],
        createdBy: users[2]._id,
        collaborators: [
          { user: users[4]._id, role: "editor" },
        ],
      },
      {
        title: "Mobile Fitness App",
        description: "Workout tracking mobile app.",
        techStack: ["React Native", "Firebase"],
        createdBy: users[3]._id,
        collaborators: [
          { user: users[1]._id, role: "viewer" },
          { user: users[2]._id, role: "editor" },
        ],
      },
    ]);

    console.log("Projects created.");

    // 📌 Create Tasks
    await Task.insertMany([
      {
        project: projects[0]._id,
        title: "Setup Backend",
        description: "Initialize Express server and routes.",
        assignedTo: [users[1]._id],
        status: "pending",
      },
      {
        project: projects[0]._id,
        title: "Design UI",
        description: "Create Figma mockups.",
        assignedTo: [users[2]._id],
        status: "in-progress",
      },
      {
        project: projects[1]._id,
        title: "Build API",
        description: "Create chatbot endpoints.",
        assignedTo: [users[0]._id],
        status: "pending",
      },
      {
        project: projects[2]._id,
        title: "Add Payment Gateway",
        description: "Integrate Razorpay.",
        assignedTo: [users[4]._id],
        status: "completed",
      },
      {
        project: projects[3]._id,
        title: "Implement Authentication",
        description: "Add Firebase auth.",
        assignedTo: [users[2]._id],
        status: "in-progress",
      },
    ]);

    console.log("Tasks created.");

    console.log("✅ Database seeded successfully!");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();