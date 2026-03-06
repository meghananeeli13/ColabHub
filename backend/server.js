require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/projects", require("./routes/projectRoutes"));
app.get("/api/test", (req, res) => {
  res.send("Server is working 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { errorHandler } = require("./middleware/errorMiddleware");

const taskRoutes = require("./routes/taskRoutes");

app.use("/api/tasks", taskRoutes);

app.use(errorHandler);