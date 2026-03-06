import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [tech, setTech] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await API.get(`/projects?search=${search}&tech=${tech}&page=${page}`);
      setProjects(res.data);
      setHasMore(res.data.length === 5);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchRecommended = async () => {
  try {
    const res = await API.get("/projects/recommended");
    setRecommended(res.data);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchProjects();
    fetchRecommended();
  }, [search, tech, page]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRequest = async (projectId) => {
    try {
      await API.post(`/projects/${projectId}/request`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Error sending request");
    }
  };
  const handleCancelRequest = async (projectId) => {
  try {
    await API.delete(`/projects/${projectId}/request`);
    fetchProjects();
  } catch (err) {
    alert(err.response?.data?.message || "Error cancelling request");
  }
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">ColabHub</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate("/my-projects")}
            className="text-sm text-blue-600 hover:underline"
          >
            My Projects
          </button>
          <button
  onClick={() => navigate("/my-tasks")}
  className="text-sm text-blue-600 hover:underline"
>
  My Tasks
</button>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Filter by tech..."
            value={tech}
            onChange={(e) => { setTech(e.target.value); setPage(1); }}
            className="w-40 border p-2 rounded"
          />
        </div>

        {/* Recommended Projects */}
{recommended.length > 0 && (
  <div className="mb-8">
    <h2 className="text-lg font-bold mb-3">⭐ Recommended for You</h2>
    <div className="grid gap-4">
      {recommended.map((project) => (
        <div key={project._id} className="bg-white p-5 rounded shadow border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">{project.title}</h2>
              <p className="text-gray-500 text-sm mt-1">{project.description}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {project.techStack.map((t, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleRequest(project._id)}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 ml-4"
            >
              Request to Join
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {/* Project Cards */}
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project._id} className="bg-white p-5 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">{project.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2 items-end">
                  {project.requestStatus === "not_requested" && (
                    <button
                      onClick={() => handleRequest(project._id)}
                      className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Request to Join
                    </button>
                  )}
                  {project.requestStatus === "pending" && (
  <div className="flex flex-col items-end gap-1">
    <span className="text-yellow-500 text-sm">Pending</span>
    <button
      onClick={() => handleCancelRequest(project._id)}
      className="text-xs text-red-500 hover:underline"
    >
      Cancel
    </button>
  </div>
)}
                  {project.requestStatus === "accepted" && (
                    <span className="text-green-500 text-sm">Collaborator</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white rounded shadow text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 bg-white rounded shadow text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Projects;