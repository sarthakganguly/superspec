import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserSuggestion {
  id: string;
  email: string;
  role: string;
}

interface OwnerSuggestInputProps {
  label: string;
  gateLabel: string;
  value: string;
  onChange: (val: string) => void;
  onAssignToMe?: () => void;
  disabled?: boolean;
}

const OwnerSuggestInput = ({
  label,
  gateLabel,
  value,
  onChange,
  onAssignToMe,
  disabled = false,
}: OwnerSuggestInputProps) => {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = value.trim();
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
  }, [value]);

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

  const handleChange = (newVal: string) => {
    onChange(newVal);
    if (newVal.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-gray-700">
          {label} <span className="text-gray-400 font-normal">({gateLabel})</span>
        </label>
        {onAssignToMe && (
          <button
            type="button"
            onClick={onAssignToMe}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Assign to me
          </button>
        )}
      </div>
      <input
        type="email"
        required
        disabled={disabled}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="user@superspec.com"
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-36 overflow-y-auto rounded-md bg-white py-1 shadow-lg border border-gray-200">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center justify-between"
              onClick={() => {
                handleChange(s.email);
                setShowSuggestions(false);
              }}
            >
              <span className="font-medium text-gray-900">{s.email}</span>
              <span className="text-gray-400 text-[10px] uppercase">{s.role}</span>
            </button>
          ))}
        </div>
      )}
      {isSearching && (
        <span className="absolute right-3 top-7 text-xs text-gray-400">Searching...</span>
      )}
    </div>
  );
};

export const CreateProjectDialog = ({ isOpen, onClose, onSuccess }: CreateProjectDialogProps) => {
  const { user } = useAuth();
  const defaultEmail = user?.email || "";
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [businessRequirementOwner, setBusinessRequirementOwner] = useState(defaultEmail);
  const [dataDictionaryOwner, setDataDictionaryOwner] = useState(defaultEmail);
  const [userStoryOwner, setUserStoryOwner] = useState(defaultEmail);
  const [requirementSignOffOwner, setRequirementSignOffOwner] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAssignAllToMe = () => {
    if (user?.email) {
      setBusinessRequirementOwner(user.email);
      setDataDictionaryOwner(user.email);
      setUserStoryOwner(user.email);
      setRequirementSignOffOwner(user.email);
    }
  };

  const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email.trim());

  const isFormValid =
    name.trim().length > 0 &&
    isEmailValid(businessRequirementOwner) &&
    isEmailValid(dataDictionaryOwner) &&
    isEmailValid(userStoryOwner) &&
    isEmailValid(requirementSignOffOwner);

  const resetForm = () => {
    setName("");
    setDescription("");
    setBusinessRequirementOwner(defaultEmail);
    setDataDictionaryOwner(defaultEmail);
    setUserStoryOwner(defaultEmail);
    setRequirementSignOffOwner(defaultEmail);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please fill in project name and all 4 gate owner emails.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post("/api/projects", {
        name: name.trim(),
        description: description.trim() || undefined,
        business_requirement_owner: businessRequirementOwner.trim(),
        data_dictionary_owner: dataDictionaryOwner.trim(),
        user_story_owner: userStoryOwner.trim(),
        requirement_sign_off_owner: requirementSignOffOwner.trim(),
      });
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Create Project</h2>
        <p className="text-sm text-gray-500 mb-4">
          Define project scope and upfront gate ownership. All 4 gate owners are required.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Migration API"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              rows={2}
              placeholder="Brief description of the project"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Gate Owners Assignment</h3>
              {user?.email && (
                <button
                  type="button"
                  onClick={handleAssignAllToMe}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800"
                >
                  Assign all to me
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Gate 4 (Traceability) is automated. A single user may own multiple gates.
            </p>

            <div className="space-y-3">
              <OwnerSuggestInput
                label="Business Requirement Owner"
                gateLabel="Gate 1"
                value={businessRequirementOwner}
                onChange={setBusinessRequirementOwner}
                onAssignToMe={user?.email ? () => setBusinessRequirementOwner(user.email) : undefined}
                disabled={loading}
              />
              <OwnerSuggestInput
                label="Data Dictionary Owner"
                gateLabel="Gate 2"
                value={dataDictionaryOwner}
                onChange={setDataDictionaryOwner}
                onAssignToMe={user?.email ? () => setDataDictionaryOwner(user.email) : undefined}
                disabled={loading}
              />
              <OwnerSuggestInput
                label="User Story Owner"
                gateLabel="Gate 3"
                value={userStoryOwner}
                onChange={setUserStoryOwner}
                onAssignToMe={user?.email ? () => setUserStoryOwner(user.email) : undefined}
                disabled={loading}
              />
              <OwnerSuggestInput
                label="Requirement Sign-off Owner"
                gateLabel="Gate 5"
                value={requirementSignOffOwner}
                onChange={setRequirementSignOffOwner}
                onAssignToMe={user?.email ? () => setRequirementSignOffOwner(user.email) : undefined}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
