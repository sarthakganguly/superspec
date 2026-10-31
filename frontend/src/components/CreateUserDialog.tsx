import { useState } from "react";
import axios from "axios";

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserDialog = ({ isOpen, onClose, onSuccess }: CreateUserDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/users", {
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      setEmail("");
      setPassword("");
      setRole("USER");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Provision New User</h2>
        <p className="text-sm text-gray-500 mb-6">
          Create a new user account with platform credentials and role.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userEmailInput" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="userEmailInput"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. analyst@superspec.com"
            />
          </div>

          <div>
            <label htmlFor="userPasswordInput" className="block text-sm font-medium text-gray-700 mb-1">
              Temporary Password
            </label>
            <input
              id="userPasswordInput"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label htmlFor="userRoleInput" className="block text-sm font-medium text-gray-700 mb-1">
              Global Platform Role
            </label>
            <select
              id="userRoleInput"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black bg-white"
            >
              <option value="USER">Standard User (Project Member / Gate Owner)</option>
              <option value="ADMIN">Global Platform Administrator</option>
              <option value="VIEWER">Auditor / Reviewer (Read-only)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email || password.length < 6}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "Provisioning..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
