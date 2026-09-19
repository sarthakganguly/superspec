import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, CheckCircle, Link as LinkIcon, RefreshCcw } from "lucide-react";

interface TraceabilityProps {
  projectId: string;
}

interface TraceabilityData {
  is_valid: boolean;
  missing_gates: string[];
  orphaned_entities: string[];
  orphaned_stories: string[];
  connections: {
    story: string;
    entities: string[];
  }[];
}

export const TraceabilityReport = ({ projectId }: TraceabilityProps) => {
  const [report, setReport] = useState<TraceabilityData | null>(null);
  const [isSignedOff, setIsSignedOff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [reportRes, signoffRes] = await Promise.all([
        axios.get(`/api/projects/${projectId}/traceability`),
        axios.get(`/api/projects/${projectId}/signoffs`)
      ]);
      setReport(reportRes.data);
      const signoffs = signoffRes.data;
      setIsSignedOff(signoffs.some((s: any) => s.gate_name === "Traceability"));
      setError(null);
    } catch (err: any) {
      setError("Failed to fetch traceability report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [projectId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Running traceability analysis...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!report) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Gate 4: Requirements Traceability Matrix</h2>
        <button 
          onClick={fetchReport}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh Analysis"
        >
          <RefreshCcw size={18} />
        </button>
      </div>
      
      {report.missing_gates.length > 0 && (
        <div className="mb-8 p-4 rounded-md bg-yellow-50 border border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-600 mt-0.5 mr-3" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">Missing Prerequisites</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You must complete the following gates before running the traceability analysis:
              </p>
              <ul className="list-disc ml-5 mt-2 text-sm text-yellow-700">
                {report.missing_gates.map(g => <li key={g}>{g}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {report.missing_gates.length === 0 && (
        <>
          <div className={`mb-8 p-4 rounded-md border ${report.is_valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center">
              {report.is_valid ? (
                <CheckCircle className="text-green-600 mr-3" size={24} />
              ) : (
                <AlertTriangle className="text-red-600 mr-3" size={24} />
              )}
              <div>
                <h3 className={`text-base font-semibold ${report.is_valid ? 'text-green-800' : 'text-red-800'}`}>
                  {report.is_valid ? "Traceability Validated" : "Traceability Errors Detected"}
                </h3>
                <p className={`text-sm mt-1 ${report.is_valid ? 'text-green-700' : 'text-red-700'}`}>
                  {report.is_valid 
                    ? "All requirements are properly cross-referenced." 
                    : "There are orphaned items that break the chain of traceability. These must be fixed before sign-off."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Orphaned Items (Blockers)</h4>
              
              {report.orphaned_stories.length === 0 && report.orphaned_entities.length === 0 && (
                <p className="text-sm text-gray-500 italic">No orphaned items found.</p>
              )}

              {report.orphaned_stories.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unanchored Stories</h5>
                  <ul className="space-y-2">
                    {report.orphaned_stories.map(story => (
                      <li key={story} className="text-sm bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md flex items-center">
                        <AlertTriangle size={14} className="mr-2 flex-shrink-0" />
                        {story}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-1">These stories don't reference any known Data Entities.</p>
                </div>
              )}

              {report.orphaned_entities.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unused Entities</h5>
                  <ul className="space-y-2">
                    {report.orphaned_entities.map(entity => (
                      <li key={entity} className="text-sm bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md flex items-center">
                        <AlertTriangle size={14} className="mr-2 flex-shrink-0" />
                        {entity}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-1">These entities are defined in the Data Dictionary but aren't used in any User Stories.</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Valid Connections</h4>
              
              {report.connections.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No connections found.</p>
              ) : (
                <ul className="space-y-3">
                  {report.connections.map((conn, idx) => (
                    <li key={idx} className="text-sm bg-gray-50 border border-gray-200 px-4 py-3 rounded-md">
                      <div className="font-medium text-gray-900 mb-2">{conn.story}</div>
                      <div className="flex flex-wrap gap-2">
                        {conn.entities.map(e => (
                          <span key={e} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <LinkIcon size={10} className="mr-1" />
                            {e}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
