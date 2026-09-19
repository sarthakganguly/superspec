import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X, ListPlus } from "lucide-react";
import { useProjectRole } from "../../hooks/useProjectRole";
import { ReadOnlyBanner } from "../ReadOnlyBanner";

interface Gate2FormProps {
  projectId: string;
}

interface Attribute {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
}

interface Entity {
  name: string;
  attributes: Attribute[];
}

export const Gate2Form = ({ projectId }: Gate2FormProps) => {
  const [entities, setEntities] = useState<Entity[]>([{
    name: "",
    attributes: [{ name: "", type: "String", nullable: false, description: "" }]
  }]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { canEditGate, loading: roleLoading } = useProjectRole(projectId);
  const canEdit = canEditGate("GATE_2_OWNER");

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/artifacts/data-dictionary`);
        const content = response.data.content;
        if (content.entities && content.entities.length > 0) {
          setEntities(content.entities);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError("Failed to load existing Data Dictionary.");
        }
      } finally {
        setFetching(false);
      }
    };
    fetchArtifact();
  }, [projectId]);

  const addEntity = () => {
    setEntities([...entities, {
      name: "",
      attributes: [{ name: "", type: "String", nullable: false, description: "" }]
    }]);
  };

  const removeEntity = (index: number) => {
    setEntities(entities.filter((_, i) => i !== index));
  };

  const updateEntityName = (index: number, name: string) => {
    const newEntities = [...entities];
    newEntities[index].name = name;
    setEntities(newEntities);
  };

  const addAttribute = (entityIndex: number) => {
    const newEntities = [...entities];
    newEntities[entityIndex].attributes.push({ name: "", type: "String", nullable: false, description: "" });
    setEntities(newEntities);
  };

  const removeAttribute = (entityIndex: number, attrIndex: number) => {
    const newEntities = [...entities];
    newEntities[entityIndex].attributes = newEntities[entityIndex].attributes.filter((_, i) => i !== attrIndex);
    setEntities(newEntities);
  };

  const updateAttribute = (entityIndex: number, attrIndex: number, field: keyof Attribute, value: any) => {
    const newEntities = [...entities];
    newEntities[entityIndex].attributes[attrIndex] = {
      ...newEntities[entityIndex].attributes[attrIndex],
      [field]: value
    };
    setEntities(newEntities);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");
    
    // Clean up empty entities or attributes
    const cleanedEntities = entities
      .filter(e => e.name.trim() !== "")
      .map(e => ({
        ...e,
        attributes: e.attributes.filter(a => a.name.trim() !== "")
      }));

    try {
      await axios.put(`/api/projects/${projectId}/artifacts/data-dictionary`, {
        entities: cleanedEntities
      });
      setSuccessMessage("Data Dictionary saved successfully!");
      if (cleanedEntities.length > 0) {
        setEntities(cleanedEntities);
      } else {
        setEntities([{ name: "", attributes: [{ name: "", type: "String", nullable: false, description: "" }] }]);
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          const msgs = detail.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join("\n");
          setError(msgs);
        } else {
          setError(JSON.stringify(detail));
        }
      } else {
        setError("Failed to save Data Dictionary.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching || roleLoading) return <div className="p-8 text-center text-gray-500">Loading Data Dictionary...</div>;

  const DATA_TYPES = ["String", "Integer", "Float", "Boolean", "Date", "DateTime", "UUID", "JSON"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gate 2: Data Dictionary</h2>
      
      {!canEdit && <ReadOnlyBanner requiredRole="GATE_2_OWNER" />}

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

      <form onSubmit={handleSubmit} className="space-y-8">
        {entities.map((entity, eIdx) => (
          <div key={eIdx} className="p-6 rounded-lg border border-gray-200 bg-gray-50 relative">
            <div className="flex justify-between items-center mb-4">
              <div className="w-1/3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Entity Name</label>
                <input
                  type="text"
                  required
                  value={entity.name}
                  onChange={(e) => updateEntityName(eIdx, e.target.value)}
                  disabled={!canEdit}
                  aria-readonly={!canEdit}
                  className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-medium ${!canEdit ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                  placeholder="e.g., User, Order"
                />
              </div>
              {canEdit && entities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntity(eIdx)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 mb-2 px-2 text-xs font-semibold text-gray-500 uppercase">
                <div className="col-span-3">Attribute Name</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-1 text-center">Nullable</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-1"></div>
              </div>
              
              {entity.attributes.map((attr, aIdx) => (
                <div key={aIdx} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <input
                      type="text"
                      required
                      value={attr.name}
                      onChange={(e) => updateAttribute(eIdx, aIdx, "name", e.target.value)}
                      disabled={!canEdit}
                      aria-readonly={!canEdit}
                      className={`w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none ${!canEdit ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                      placeholder="e.g., created_at"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={attr.type}
                      onChange={(e) => updateAttribute(eIdx, aIdx, "type", e.target.value)}
                      disabled={!canEdit}
                      aria-readonly={!canEdit}
                      className={`w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none ${!canEdit ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                    >
                      {DATA_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      checked={attr.nullable}
                      onChange={(e) => updateAttribute(eIdx, aIdx, "nullable", e.target.checked)}
                      disabled={!canEdit}
                      aria-readonly={!canEdit}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={attr.description}
                      onChange={(e) => updateAttribute(eIdx, aIdx, "description", e.target.value)}
                      disabled={!canEdit}
                      aria-readonly={!canEdit}
                      className={`w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none ${!canEdit ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => removeAttribute(eIdx, aIdx)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => addAttribute(eIdx)}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Plus size={14} className="mr-1" /> Add Attribute
              </button>
            )}
          </div>
        ))}

        {canEdit && (
          <div className="flex justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={addEntity}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <ListPlus size={16} className="mr-2" />
              Add Entity
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Gate 2"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
