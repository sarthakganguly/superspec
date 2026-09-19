import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

interface ProjectMember {
  id: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

export const TeamManagement = ({ projectId }: { projectId: string }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("REVIEWER");

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(res.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setAdding(true);
    setError("");
    try {
      await axios.post(`/api/projects/${projectId}/members`, {
        email: newEmail,
        role: newRole
      });
      setNewEmail("");
      setNewRole("REVIEWER");
      await fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(`/api/projects/${projectId}/members/${userId}`);
      await fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading team members">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    PROJECT_ADMIN: "Project Admin",
    GATE_1_OWNER: "Gate 1 Owner",
    GATE_2_OWNER: "Gate 2 Owner",
    GATE_3_OWNER: "Gate 3 Owner",
    REVIEWER: "Reviewer"
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Project Team</h2>
          <p className="text-sm text-gray-500">Manage who has access to this project and their roles.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4" role="alert">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Add Member Form */}
      <form onSubmit={handleAddMember} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            id="newEmail"
            type="email"
            required
            placeholder="colleague@superspec.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor="newRole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            id="newRole"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors bg-white"
          >
            {Object.entries(roleLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={adding || !newEmail}
          className="w-full sm:w-auto whitespace-nowrap bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
        >
          {adding ? "Sending Invite..." : "Add Member"}
        </button>
      </form>

      {/* Team List */}
      {members.length === 1 && members[0].user_id === user?.id ? (
        <div role="status" className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <h3 className="mt-2 text-sm font-medium text-gray-900">You're the only one here</h3>
          <p className="mt-1 text-sm text-gray-500">Invite your first team member above to start collaborating.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${m.role === 'PROJECT_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {roleLabels[m.role] || m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(m.joined_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {m.user_id !== user?.id && (
                        <button onClick={() => handleRemoveMember(m.user_id)} className="text-red-600 hover:text-red-900">
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4">
            {members.map((m) => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900 text-sm truncate">{m.email}</span>
                  {m.user_id !== user?.id && (
                    <button onClick={() => handleRemoveMember(m.user_id)} className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${m.role === 'PROJECT_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {roleLabels[m.role] || m.role}
                  </span>
                  <span className="text-xs text-gray-500">
                    Joined {new Date(m.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
