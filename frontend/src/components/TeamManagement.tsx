import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useProjectRole } from "../hooks/useProjectRole";

interface ProjectMember {
  id: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

interface UserSuggestion {
  id: string;
  email: string;
  role: string;
}

export const TeamManagement = ({ projectId }: { projectId: string }) => {
  const { user } = useAuth();
  const { isProjectAdmin } = useProjectRole(projectId);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("REVIEWER");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(res.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    const trimmed = newEmail.trim();
    if (trimmed.length < 3) return;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await axios.get(`/api/auth/users?q=${encodeURIComponent(trimmed)}`);
        if (active) {
          setSuggestions(res.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Failed to search users", err);
      } finally {
        if (active) setIsSearching(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [newEmail]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewEmail(val);
    if (val.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (email: string) => {
    setNewEmail(email);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const roleLabels: Record<string, string> = {
    PROJECT_ADMIN: "Project Admin",
    BUSINESS_REQUIREMENT_OWNER: "Business Requirement Owner",
    DATA_DICTIONARY_OWNER: "Data Dictionary Owner",
    USER_STORY_OWNER: "User Story Owner",
    REQUIREMENT_SIGN_OFF_OWNER: "Requirement Sign-off Owner",
    REVIEWER: "Reviewer",
    // Backward compatibility display
    GATE_1_OWNER: "Business Requirement Owner",
    GATE_2_OWNER: "Data Dictionary Owner",
    GATE_3_OWNER: "User Story Owner",
  };

  const assignableRoles: Array<{ key: string; label: string }> = [
    { key: "PROJECT_ADMIN", label: "Project Admin" },
    { key: "BUSINESS_REQUIREMENT_OWNER", label: "Business Requirement Owner" },
    { key: "DATA_DICTIONARY_OWNER", label: "Data Dictionary Owner" },
    { key: "USER_STORY_OWNER", label: "User Story Owner" },
    { key: "REQUIREMENT_SIGN_OFF_OWNER", label: "Requirement Sign-off Owner" },
    { key: "REVIEWER", label: "Reviewer" },
  ];

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "PROJECT_ADMIN":
        return "bg-purple-100 text-purple-800";
      case "BUSINESS_REQUIREMENT_OWNER":
      case "GATE_1_OWNER":
        return "bg-indigo-100 text-indigo-800";
      case "DATA_DICTIONARY_OWNER":
      case "GATE_2_OWNER":
        return "bg-emerald-100 text-emerald-800";
      case "USER_STORY_OWNER":
      case "GATE_3_OWNER":
        return "bg-amber-100 text-amber-800";
      case "REQUIREMENT_SIGN_OFF_OWNER":
      case "GATE_5_OWNER":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSubmit = newEmail.trim();
    if (!emailToSubmit) return;

    if (members.some((m) => m.email.toLowerCase() === emailToSubmit.toLowerCase() && m.role === newRole)) {
      setError(`User ${emailToSubmit} already has the role ${roleLabels[newRole] || newRole} in this project.`);
      return;
    }

    setAdding(true);
    setError("");
    setShowSuggestions(false);
    try {
      await axios.post(`/api/projects/${projectId}/members`, {
        email: emailToSubmit,
        role: newRole,
      });
      setNewEmail("");
      setNewRole("REVIEWER");
      setSuggestions([]);
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

      {/* Add Member Form - Only visible to Project Admins */}
      {isProjectAdmin ? (
        <form onSubmit={handleAddMember} className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative" ref={dropdownRef}>
            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              id="newEmail"
              type="email"
              required
              autoComplete="off"
              placeholder="colleague@superspec.com (type 3+ characters to search)"
              value={newEmail}
              onChange={handleEmailChange}
              onFocus={() => {
                if (newEmail.trim().length >= 3 && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
            />

            {/* Auto-suggest dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="px-3 py-2.5 text-xs text-gray-500">Searching existing users...</div>
                ) : suggestions.length === 0 ? (
                  <div className="px-3 py-2.5 text-xs text-gray-500">No matching registered users found</div>
                ) : (
                  <ul className="divide-y divide-gray-100" role="listbox" aria-label="Suggested users">
                    {suggestions.map((s) => {
                      const alreadyHasRole = members.some(
                        (m) => m.email.toLowerCase() === s.email.toLowerCase() && m.role === newRole
                      );
                      return (
                        <li key={s.id} role="option" aria-selected={false}>
                          <button
                            type="button"
                            disabled={alreadyHasRole}
                            onClick={() => handleSelectSuggestion(s.email)}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                              alreadyHasRole
                                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                : "hover:bg-blue-50 text-gray-800 cursor-pointer"
                            }`}
                          >
                            <span className="font-medium truncate">{s.email}</span>
                            <span className="text-xs ml-2 text-gray-500">
                              {alreadyHasRole ? "(Already assigned this role)" : s.role}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="w-full sm:w-64">
            <label htmlFor="newRole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="newRole"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors bg-white"
            >
              {assignableRoles.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={adding || !newEmail}
            className="w-full sm:w-auto whitespace-nowrap bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
          >
            {adding ? "Adding..." : "Add Member"}
          </button>
        </form>
      ) : (
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Team Roster (Read-only):</span>
            <span>Only Project Admins can modify team assignments.</span>
          </div>
        </div>
      )}

      {/* Team List */}
      {members.length === 0 ? (
        <div role="status" className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No team members assigned</h3>
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
                  {isProjectAdmin && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(m.role)}`}>
                        {roleLabels[m.role] || m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(m.joined_at).toLocaleDateString()}
                    </td>
                    {isProjectAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {m.user_id !== user?.id && (
                          <button onClick={() => handleRemoveMember(m.user_id)} className="text-red-600 hover:text-red-900">
                            Remove
                          </button>
                        )}
                      </td>
                    )}
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
                  {isProjectAdmin && m.user_id !== user?.id && (
                    <button onClick={() => handleRemoveMember(m.user_id)} className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(m.role)}`}>
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
