import React, { useState, useEffect } from "react";
import axios from "axios";
import { ExportButton } from "./ExportButton";
import { DownloadCloud, Lock } from "lucide-react";

interface Gate6Props {
  projectId: string;
  projectName: string;
}

export const Gate6Export = ({ projectId, projectName }: Gate6Props) => {
  const [isSignedOff, setIsSignedOff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [signoffsRes, membersRes] = await Promise.all([
          axios.get(`/api/projects/${projectId}/signoffs`),
          axios.get(`/api/projects/${projectId}/members`)
        ]);
        
        const signoffs = signoffsRes.data.filter((s: any) => s.gate_name === "Traceability");
        const members = membersRes.data;
        
        const hasAllSignatures = members.length > 0 && members.every((m: any) => 
          signoffs.some((s: any) => s.user_id === m.user_id)
        );
        
        setIsSignedOff(hasAllSignatures);
      } catch (error) {
        console.error("Error fetching signoff status", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [projectId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading export engine...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Gate 6: Export Packages</h2>
      
      {isSignedOff ? (
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-6">
            <DownloadCloud className="text-blue-600 w-10 h-10" />
          </div>
          <p className="text-gray-500 max-w-md mb-8">
            Your project is fully baselined and ready for ingestion into downstream systems (Jira, GitHub, Asana). Download your ZIP package below.
          </p>
          <ExportButton projectId={projectId} projectName={projectName} isSignedOff={isSignedOff} />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="text-gray-400 w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Locked</h3>
          <p className="text-gray-500 max-w-md">
            All team members must cryptographically sign off on this project in Gate 5 before you can export the requirements package.
          </p>
        </div>
      )}
    </div>
  );
};
