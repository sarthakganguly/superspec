import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
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
  const { user, logout } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [currentGate, setCurrentGate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSignedOff, setIsSignedOff] = useState(false);

  useEffect(() => {
    const fetchProjectAndStatus = async () => {
      try {
        const [projRes, signoffsRes] = await Promise.all([
          axios.get(`/api/projects/${id}`),
          axios.get(`/api/projects/${id}/signoffs`)
        ]);
        setProject(projRes.data);
        setIsSignedOff(signoffsRes.data.some((s: any) => s.gate_name === "Traceability"));
      } catch (error) {
        console.error("Failed to fetch project details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectAndStatus();
  }, [id]);

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
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={logout} className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <p className="text-gray-600 mb-8">{project.description}</p>
        
        {currentGate !== 0 && (
          <GateStepper currentGate={currentGate} onGateChange={setCurrentGate} />
        )}
        
        <div className="mt-8 mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setCurrentGate(currentGate === 0 ? 1 : currentGate)}
              className={`${
                currentGate !== 0
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Project Gates
            </button>
            <button
              onClick={() => setCurrentGate(0)}
              className={`${
                currentGate === 0
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Team Management
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {currentGate === 0 && <TeamManagement projectId={project.id} />}
          {currentGate === 1 && <Gate1Form projectId={project.id} />}
          {currentGate === 2 && <Gate2Form projectId={project.id} />}
          {currentGate === 3 && <Gate3Form projectId={project.id} />}
          {currentGate === 4 && <TraceabilityReport projectId={project.id} />}
          {currentGate === 5 && <Gate5Signoff projectId={project.id} />}
          {currentGate === 6 && <Gate6Export projectId={project.id} projectName={project.name} />}
        </div>
      </main>
    </div>
  );
};
