import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function MyProjects() {
  const [owned, setOwned] = useState([]);
  const [collaborated, setCollaborated] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", techStack: "" });
  const navigate = useNavigate();

  const fetchMyProjects = async () => {
    try {
      const [ownedRes, collabRes] = await Promise.all([
        API.get("/projects/my-projects"),
        API.get("/projects/collaborations"),
      ]);
      setOwned(ownedRes.data);
      setCollaborated(collabRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleCreateProject = async () => {
    try {
      await API.post("/projects", {
        ...newProject,
        techStack: newProject.techStack.split(",").map((t) => t.trim()),
      });
      setNewProject({ title: "", description: "", techStack: "" });
      setShowForm(false);
      fetchMyProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating project");
    }
  };

  const ProjectCard = ({ project }) => (
    <div
      className="bg-white p-5 rounded shadow cursor-pointer hover:shadow-md transition"
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <h2 className="text-lg font-semibold hover:text-blue-600">{project.title}</h2>
      <p className="text-gray-500 text-sm mt-1">{project.description}</p>
      <div className="flex gap-2 mt-2 flex-wrap">
        {project.techStack.map((t, i) => (
          <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
            {t}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate("/projects")}>
          ColabHub
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">

        {/* Projects I Own Header + New Project Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Projects I Own</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        </div>

        {/* Create Project Form */}
        {showForm && (
          <div className="bg-white p-5 rounded shadow mb-6 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Tech Stack (comma separated e.g. React, Node.js)"
              value={newProject.techStack}
              onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
              className="border p-2 rounded"
            />
            <button
              onClick={handleCreateProject}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create Project
            </button>
          </div>
        )}

        {owned.length === 0 ? (
          <p className="text-gray-400 mb-6">You don't own any projects yet.</p>
        ) : (
          <div className="grid gap-4 mb-8">
            {owned.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}

        {/* Collaborated Projects */}
        <h2 className="text-xl font-bold mb-4">Projects I Collaborate On</h2>
        {collaborated.length === 0 ? (
          <p className="text-gray-400">You're not a collaborator on any projects yet.</p>
        ) : (
          <div className="grid gap-4">
            {collaborated.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProjects;