import { Users, X } from "lucide-react";

interface UserManagementHeaderProps {
  userCount: number;
  onClose: () => void;
}

export const UserManagementHeader = ({ userCount, onClose }: UserManagementHeaderProps) => {
  return (
    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
          <Users size={20} aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 id="user-mgmt-title" className="text-xl font-bold text-gray-900">
              User Management
            </h2>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {userCount} {userCount === 1 ? "user" : "users"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage registered platform users, roles, and administrative access.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close user management dialog"
        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
};
