import React, { useState } from "react";
import { Download } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface ExportButtonProps {
  projectId: string;
  projectName: string;
  isSignedOff: boolean;
}

export const ExportButton = ({ projectId, projectName, isSignedOff }: ExportButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth(); // Assuming we need to pass token via query param or handle blob download

  const handleDownload = async () => {
    if (!isSignedOff) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Download failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\\s+/g, '_')}_export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error", error);
      alert("Failed to download export.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!isSignedOff || loading}
      title={!isSignedOff ? "Traceability must be signed off to export" : "Download ZIP"}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 flex items-center shadow-sm transition-colors"
    >
      <Download size={16} className="mr-2" />
      {loading ? "Exporting..." : "Export Tickets (ZIP)"}
    </button>
  );
};
