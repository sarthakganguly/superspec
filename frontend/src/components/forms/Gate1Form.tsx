import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X } from "lucide-react";
import { useProjectRole } from "../../hooks/useProjectRole";
import { ReadOnlyBanner } from "../ReadOnlyBanner";

interface Gate1FormProps {
  projectId: string;
}

export const Gate1Form = ({ projectId }: Gate1FormProps) => {
  const [problemStatement, setProblemStatement] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [successMetrics, setSuccessMetrics] = useState<string[]>([""]);
  const [inScope, setInScope] = useState<string[]>([""]);
  const [outOfScope, setOutOfScope] = useState<string[]>([""]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { canEditGate, loading: roleLoading } = useProjectRole(projectId);
  const canEdit = canEditGate("BUSINESS_REQUIREMENT_OWNER");

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/artifacts/business-requirements`);
        const content = response.data.content;
        setProblemStatement(content.problem_statement || "");
        setTargetAudience(content.target_audience || "");
        setSuccessMetrics(content.success_metrics?.length ? content.success_metrics : [""]);
        setInScope(content.in_scope?.length ? content.in_scope : [""]);
        setOutOfScope(content.out_of_scope?.length ? content.out_of_scope : [""]);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError("Failed to load existing requirements.");
        }
      } finally {
        setFetching(false);
      }
    };
    fetchArtifact();
  }, [projectId]);

  const handleArrayChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ""]);
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");
    
    // Clean arrays (remove empty strings)
    const cleanedMetrics = successMetrics.filter(m => m.trim() !== "");
    const cleanedInScope = inScope.filter(s => s.trim() !== "");
    const cleanedOutOfScope = outOfScope.filter(s => s.trim() !== "");

    try {
      await axios.put(`/api/projects/${projectId}/artifacts/business-requirements`, {
        problem_statement: problemStatement,
        target_audience: targetAudience,
        success_metrics: cleanedMetrics,
        in_scope: cleanedInScope,
        out_of_scope: cleanedOutOfScope
      });
      setSuccessMessage("Business requirements saved successfully!");
      
      // Reset array fields if they were completely emptied by cleaning
      if (cleanedMetrics.length === 0) setSuccessMetrics([""]);
      if (cleanedInScope.length === 0) setInScope([""]);
      if (cleanedOutOfScope.length === 0) setOutOfScope([""]);
      
    } catch (err: any) {
      if (err.response?.status === 422) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          const msgs = detail.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join(", ");
          setError(msgs);
        } else {
          setError(JSON.stringify(detail));
        }
      } else {
        setError("Failed to save requirements.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderArrayField = (
    label: string, 
    items: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    placeholder: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleArrayChange(setter, index, e.target.value)}
            disabled={!canEdit}
            aria-readonly={!canEdit}
            className={`flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${!canEdit ? 'bg-gray-50 text-gray-500' : ''}`}
            placeholder={placeholder}
          />
          {canEdit && items.length > 1 && (
            <button
              type="button"
              onClick={() => removeArrayItem(setter, index)}
              className="text-gray-400 hover:text-red-500 transition-colors p-2"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      {canEdit && (
        <button
          type="button"
          onClick={() => addArrayItem(setter)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center mt-1"
        >
          <Plus size={14} className="mr-1" /> Add item
        </button>
      )}
    </div>
  );

  if (fetching || roleLoading) return <div className="p-8 text-center text-gray-500">Loading requirements...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gate 1: Business Requirements</h2>
      
      {!canEdit && <ReadOnlyBanner requiredRole="BUSINESS_REQUIREMENT_OWNER" />}

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200 whitespace-pre-wrap">
          <p className="font-semibold mb-1">Validation Error</p>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
          <p className="text-xs text-gray-500 mb-2">The core problem this project solves (minimum 10 characters).</p>
          <textarea
            required
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            disabled={!canEdit}
            aria-readonly={!canEdit}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${!canEdit ? 'bg-gray-50 text-gray-500' : ''}`}
            rows={4}
            placeholder="Describe the problem clearly..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
          <input
            type="text"
            required
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            disabled={!canEdit}
            aria-readonly={!canEdit}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${!canEdit ? 'bg-gray-50 text-gray-500' : ''}`}
            placeholder="e.g., Enterprise Admins, External Users"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          {renderArrayField("Success Metrics (KPIs)", successMetrics, setSuccessMetrics, "e.g., 20% increase in conversion")}
          {renderArrayField("In Scope", inScope, setInScope, "e.g., User Authentication module")}
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          {renderArrayField("Out of Scope (Optional)", outOfScope, setOutOfScope, "e.g., Mobile Application")}
        </div>

        {canEdit && (
          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Gate 1"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
