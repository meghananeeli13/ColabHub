import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  const fetchAll = async () => {
    try {
      const [myProjectsRes, taskRes, collabRes, reqRes] = await Promise.all([
  API.get(`/projects/my-projects`),
  API.get(`/projects/${id}/tasks`),
  API.get(`/projects/${id}/collaborators`),
  API.get(`/projects/pending-requests`),
]);

const allMyProjects = [
  ...myProjectsRes.data,
];

// Also fetch collaborated projects
const collabProjectsRes = await API.get(`/projects/collaborations`);
const found = [...myProjectsRes.data, ...collabProjectsRes.data].find(
  (p) => p._id === id
        );
      setProject(found);
      setTasks(taskRes.data);
      setCollaborators(collabRes.data);

      // Filter pending requests for this project only
      const projectRequests = reqRes.data.filter(
        (req) => req.projectId === id
      );
      setPendingRequests(projectRequests);

      // Determine user role
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      if (found?.createdBy?._id === userId || found?.createdBy === userId) {
        setUserRole("owner");
      } else {
        const collab = collabRes.data.find((c) => c.user._id === userId);
        if (collab) setUserRole(collab.role);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleCreateTask = async () => {
    try {
      await API.post(`/projects/${id}/tasks`, newTask);
      setNewTask({ title: "", description: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating task");
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await API.put(`/projects/${id}/tasks/${taskId}/status`, { status });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating task");
    }
  };

  const handleSuggestTasks = async () => {
    setLoadingSuggestions(true);
    try {
      const res = await API.get(`/projects/${id}/suggest-tasks`);
      setSuggestions(res.data.suggestions);
    } catch (err) {
      alert("Error getting suggestions");
    }
    setLoadingSuggestions(false);
  };

  const handleAddSuggestion = async (suggestion) => {
    try {
      await API.post(`/projects/${id}/tasks`, suggestion);
      setSuggestions(suggestions.filter((s) => s.title !== suggestion.title));
      fetchAll();
    } catch (err) {
      alert("Error adding task");
    }
  };

  const handleAccept = async (userId) => {
    try {
      await API.put(`/projects/${id}/request/${userId}`, { status: "accepted", role: "viewer" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error accepting request");
    }
  };

  const handleReject = async (userId) => {
    try {
      await API.put(`/projects/${id}/request/${userId}`, { status: "rejected" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Error rejecting request");
    }
  };

  const handleRoleChange = async (userId, role) => {
  try {
    await API.put(`/projects/${id}/collaborators/${userId}/role`, { role });
    fetchAll();
  } catch (err) {
    alert(err.response?.data?.message || "Error changing role");
  }
};

const handleRemoveCollaborator = async (userId) => {
  if (!window.confirm("Are you sure you want to remove this collaborator?")) return;
  try {
    await API.delete(`/projects/${id}/collaborator/${userId}`);
    fetchAll();
  } catch (err) {
    alert(err.response?.data?.message || "Error removing collaborator");
  }
};

  if (!project) return <div className="p-6">Loading...</div>;

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
        <span className="text-sm text-gray-500 capitalize">Your role: {userRole}</span>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Project Info */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <p className="text-gray-500 mt-2">{project.description}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {project.techStack.map((t, i) => (
              <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Pending Requests — Owner Only */}
        {userRole === "owner" && pendingRequests.length > 0 && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg font-semibold mb-3">Pending Requests</h3>
            {pendingRequests.map((req, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b">
                <span>{req.user?.name} — {req.user?.email}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.user._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Collaborators */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-3">Collaborators</h3>
          {collaborators.length === 0 ? (
            <p className="text-gray-400 text-sm">No collaborators yet</p>
          ) : (
            collaborators.map((c, i) => (
  <div key={i} className="flex justify-between items-center py-2 border-b">
    <span>{c.user?.name} — {c.user?.email}</span>
    {userRole === "owner" ? (
      <div className="flex gap-2 items-center">
        <select
          value={c.role}
          onChange={(e) => handleRoleChange(c.user._id, e.target.value)}
          className="border p-1 rounded text-sm"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button
          onClick={() => handleRemoveCollaborator(c.user._id)}
          className="text-xs text-red-500 hover:underline"
        >
          Remove
        </button>
      </div>
    ) : (
      <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{c.role}</span>
    )}
  </div>
))

          )}
        </div>

        {/* Tasks */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-3">Tasks</h3>

          {/* Create Task — Owner Only */}
          {userRole === "owner" && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="flex-1 border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="flex-1 border p-2 rounded"
              />
              <button
                onClick={handleCreateTask}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          )}

          {tasks.length === 0 ? (
            <p className="text-gray-400 text-sm">No tasks yet</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
                {(userRole === "owner" || userRole === "editor") && (
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                    className="border p-1 rounded text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                )}
                {userRole === "viewer" && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{task.status}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* AI Suggest Tasks — Owner Only */}
        {userRole === "owner" && (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-3">🤖 AI Task Suggestions</h3>
            <button
              onClick={handleSuggestTasks}
              disabled={loadingSuggestions}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingSuggestions ? "Thinking..." : "Suggest Tasks"}
            </button>

            {suggestions.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex justify-between items-center border p-3 rounded">
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-gray-500">{s.description}</p>
                    </div>
                    <button
                      onClick={() => handleAddSuggestion(s)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;