import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X, ListPlus } from "lucide-react";
import { useProjectRole } from "../../hooks/useProjectRole";
import { ReadOnlyBanner } from "../ReadOnlyBanner";

interface Gate3FormProps {
  projectId: string;
}

interface UserStory {
  title: string;
  description: string;
  given: string;
  when: string;
  then: string;
  complexity: number;
}

export const Gate3Form = ({ projectId }: Gate3FormProps) => {
  const [stories, setStories] = useState<UserStory[]>([{
    title: "",
    description: "",
    given: "",
    when: "",
    then: "",
    complexity: 3
  }]);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { canEditGate, loading: roleLoading } = useProjectRole(projectId);
  const canEdit = canEditGate("GATE_3_OWNER");

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/artifacts/user-stories`);
        const content = response.data.content;
        if (content.stories && content.stories.length > 0) {
          setStories(content.stories);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError("Failed to load existing User Stories.");
        }
      } finally {
        setFetching(false);
      }
    };
    fetchArtifact();
  }, [projectId]);

  const addStory = () => {
    setStories([...stories, {
      title: "",
      description: "",
      given: "",
      when: "",
      then: "",
      complexity: 3
    }]);
  };

  const removeStory = (index: number) => {
    setStories(stories.filter((_, i) => i !== index));
  };

  const updateStory = (index: number, field: keyof UserStory, value: any) => {
    const newStories = [...stories];
    newStories[index] = {
      ...newStories[index],
      [field]: value
    };
    setStories(newStories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");
    
    const cleanedStories = stories.filter(s => s.title.trim() !== "");

    try {
      await axios.put(`/api/projects/${projectId}/artifacts/user-stories`, {
        stories: cleanedStories
      });
      setSuccessMessage("User Stories saved successfully!");
      if (cleanedStories.length > 0) {
        setStories(cleanedStories);
      } else {
        setStories([{
          title: "",
          description: "",
          given: "",
          when: "",
          then: "",
          complexity: 3
        }]);
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
        setError("Failed to save User Stories.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching || roleLoading) return <div className="p-8 text-center text-gray-500">Loading User Stories...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gate 3: User Stories (BDD/Gherkin)</h2>
      
      {!canEdit && <ReadOnlyBanner requiredRole="GATE_3_OWNER" />}

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
        {stories.map((story, idx) => (
          <div key={idx} className="p-6 rounded-lg border border-gray-200 bg-gray-50 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="w-full flex space-x-4 pr-8">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Story Title</label>
                  <input
                    type="text"
                    required
                    value={story.title}
                    onChange={(e) => updateStory(idx, "title", e.target.value)}
                    disabled={!canEdit}
                    aria-readonly={!canEdit}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-medium ${!canEdit ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                    placeholder="e.g., User Authentication"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Complexity (1-13)</label>
                  <input
                    type="number"
                    min={1}
                    max={13}
                    required
                    value={story.complexity}
                    onChange={(e) => updateStory(idx, "complexity", parseInt(e.target.value) || 1)}
                    disabled={!canEdit}
                    aria-readonly={!canEdit}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${!canEdit ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                  />
                </div>
              </div>
              {canEdit && stories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStory(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors absolute top-6 right-6"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">User Story Format</label>
              <textarea
                required
                value={story.description}
                onChange={(e) => updateStory(idx, "description", e.target.value)}
                disabled={!canEdit}
                aria-readonly={!canEdit}
                className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${!canEdit ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                rows={2}
                placeholder="As a [role], I want [feature] so that [benefit]"
              />
            </div>

            <div className="space-y-4 bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-3">Acceptance Criteria (Gherkin)</h3>
              
              <div className="flex items-start space-x-3">
                <span className="text-sm font-bold text-gray-700 w-16 pt-2">GIVEN</span>
                <textarea
                  required
                  value={story.given}
                  onChange={(e) => updateStory(idx, "given", e.target.value)}
                  disabled={!canEdit}
                  aria-readonly={!canEdit}
                  className={`flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${!canEdit ? 'bg-gray-50 text-gray-500' : ''}`}
                  rows={2}
                  placeholder="the user is on the login page..."
                />
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-sm font-bold text-gray-700 w-16 pt-2">WHEN</span>
                <textarea
                  required
                  value={story.when}
                  onChange={(e) => updateStory(idx, "when", e.target.value)}
                  disabled={!canEdit}
                  aria-readonly={!canEdit}
                  className={`flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${!canEdit ? 'bg-gray-50 text-gray-500' : ''}`}
                  rows={2}
                  placeholder="they enter valid credentials..."
                />
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-sm font-bold text-gray-700 w-16 pt-2">THEN</span>
                <textarea
                  required
                  value={story.then}
                  onChange={(e) => updateStory(idx, "then", e.target.value)}
                  disabled={!canEdit}
                  aria-readonly={!canEdit}
                  className={`flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black ${!canEdit ? 'bg-gray-50 text-gray-500' : ''}`}
                  rows={2}
                  placeholder="they are redirected to the dashboard..."
                />
              </div>
            </div>
          </div>
        ))}

        {canEdit && (
          <div className="flex justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={addStory}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <ListPlus size={16} className="mr-2" />
              Add User Story
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Gate 3"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
