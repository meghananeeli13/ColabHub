import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const fetchMyTasks = async () => {
    try {
      const res = await API.get("/tasks/my-tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const getStatusColor = (status) => {
    if (status === "completed") return "text-green-500";
    if (status === "in-progress") return "text-yellow-500";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1
          className="text-xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate("/projects")}
        >
          ColabHub
        </h1>
        <button
          onClick={() => navigate("/my-projects")}
          className="text-sm text-blue-600 hover:underline"
        >
          My Projects
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4">My Tasks</h2>

        {tasks.length === 0 ? (
          <p className="text-gray-400">No tasks assigned to you yet.</p>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white p-5 rounded shadow cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/projects/${task.project?._id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Project: {task.project?.title}
                    </p>
                  </div>
                  <span className={`text-sm font-medium capitalize ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTasks;