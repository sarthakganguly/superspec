import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { CreateProjectDialog } from "../components/CreateProjectDialog";
import { UserManagementDialog } from "../components/UserManagement/UserManagementDialog";
import { Link } from "react-router-dom";
import { Trash2, Users } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(projects.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This will permanently delete all associated requirements, data dictionary entities, user stories, and sign-offs.`)) {
      return;
    }
    setDeletingId(projectId);
    try {
      await axios.delete(`/api/projects/${projectId}`);
      setSelectedIds((prev) => prev.filter((id) => id !== projectId));
      await fetchProjects();
    } catch (error: any) {
      console.error("Failed to delete project", error);
      alert(error.response?.data?.detail || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (
      !window.confirm(
        `Are you sure you want to delete ${count} selected project${count > 1 ? "s" : ""}? This will permanently delete all associated requirements, data dictionary entities, user stories, and sign-offs.`
      )
    ) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      await axios.post("/api/projects/bulk-delete", { project_ids: selectedIds });
      setSelectedIds([]);
      await fetchProjects();
    } catch (error: any) {
      console.error("Failed to bulk delete projects", error);
      alert(error.response?.data?.detail || "Failed to delete selected projects");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Superspec</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button 
            onClick={logout}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your requirement specs and action items.</p>
          </div>
          <div className="flex items-center space-x-3">
            {user?.role === "ADMIN" && (
              <button
                onClick={() => setIsUserManagementOpen(true)}
                className="inline-flex items-center border border-gray-300 bg-white text-gray-700 px-3.5 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Users size={15} className="mr-1.5 text-gray-500" />
                Manage Users
              </button>
            )}
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
            >
              + Create Project
            </button>
          </div>
        </div>

        {projects.length > 0 && selectedIds.length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-red-800">
              {selectedIds.length} {selectedIds.length === 1 ? "project" : "projects"} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                disabled={isBulkDeleting}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={14} className="mr-1.5" />
                {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-gray-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center bg-white">
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">Get started by creating a new project.</p>
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all projects"
                      checked={projects.length > 0 && selectedIds.length === projects.length}
                      onChange={handleToggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => {
                  const isSelected = selectedIds.includes(project.id);
                  return (
                    <tr
                      key={project.id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50/50" : ""}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 w-10">
                        <input
                          type="checkbox"
                          aria-label={`Select ${project.name}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(project.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {project.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                          View &rarr;
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          disabled={deletingId === project.id || isBulkDeleting}
                          className="inline-flex items-center text-red-600 hover:text-red-900 ml-3 disabled:opacity-50"
                          title="Delete project"
                        >
                          <Trash2 size={15} className="mr-1" />
                          {deletingId === project.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <CreateProjectDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSuccess={fetchProjects}
      />

      <UserManagementDialog
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
      />
    </div>
  );
};
