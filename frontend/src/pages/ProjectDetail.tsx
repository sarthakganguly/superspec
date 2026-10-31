import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useProjectRole } from "../hooks/useProjectRole";
import { Trash2 } from "lucide-react";
import { GateStepper } from "../components/GateStepper";
import { Gate1Form } from "../components/forms/Gate1Form";
import { Gate2Form } from "../components/forms/Gate2Form";
import { Gate3Form } from "../components/forms/Gate3Form";
import { TraceabilityReport } from "../components/TraceabilityReport";
import { Gate5Signoff } from "../components/Gate5Signoff";
import { Gate6Export } from "../components/Gate6Export";
import { TeamManagement } from "../components/TeamManagement";

interface Project {
  id: string;
  name: string;
  description: string;
}

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { canEditGate } = useProjectRole(id || "");
  const canDelete = canEditGate("PROJECT_ADMIN");
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"gates" | "team">("gates");
  const [currentGate, setCurrentGate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projRes = await axios.get(`/api/projects/${id}`);
        setProject(projRes.data);
      } catch (error) {
        console.error("Failed to fetch project details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action will permanently remove all associated requirements, data dictionary entities, user stories, and sign-offs.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await axios.delete(`/api/projects/${project.id}`);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Failed to delete project", error);
      alert(error.response?.data?.detail || "Failed to delete project");
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-8">Loading project details...</div>;
  if (!project) return <div className="p-8 text-red-600">Project not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
            &larr; Dashboard
          </Link>
          <div className="h-4 w-px bg-gray-300"></div>
          <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {canDelete && (
            <button
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="inline-flex items-center text-xs text-red-600 hover:text-red-800 border border-red-200 hover:border-red-300 rounded px-2.5 py-1.5 transition-colors disabled:opacity-50 font-medium mr-2"
              title="Delete this project"
            >
              <Trash2 size={13} className="mr-1" />
              {isDeleting ? "Deleting..." : "Delete Project"}
            </button>
          )}
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={logout} className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <p className="text-gray-600 mb-8">{project.description}</p>
        
        <GateStepper
          currentGate={activeTab === "team" ? 0 : currentGate}
          onGateChange={(gate) => {
            setCurrentGate(gate);
            setActiveTab("gates");
          }}
        />
        
        <div className="mt-8 mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("gates")}
              className={`${
                activeTab === "gates"
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Project Gates
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={`${
                activeTab === "team"
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Team Management
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "team" && <TeamManagement projectId={project.id} />}
          {activeTab === "gates" && currentGate === 1 && <Gate1Form projectId={project.id} />}
          {activeTab === "gates" && currentGate === 2 && <Gate2Form projectId={project.id} />}
          {activeTab === "gates" && currentGate === 3 && <Gate3Form projectId={project.id} />}
          {activeTab === "gates" && currentGate === 4 && <TraceabilityReport projectId={project.id} />}
          {activeTab === "gates" && currentGate === 5 && <Gate5Signoff projectId={project.id} />}
          {activeTab === "gates" && currentGate === 6 && <Gate6Export projectId={project.id} projectName={project.name} />}
        </div>
      </main>
    </div>
  );
};
