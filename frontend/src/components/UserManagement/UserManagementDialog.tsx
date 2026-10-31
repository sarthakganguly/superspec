import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { UserTable, type ManagedUser } from "./UserTable";
import { UserManagementHeader } from "./UserManagementHeader";
import { UserSearchBar } from "./UserSearchBar";
import { DeleteUserConfirmDialog } from "./DeleteUserConfirmDialog";
import { CreateUserDialog } from "../CreateUserDialog";
import { Users } from "lucide-react";

interface UserManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementDialog = ({ isOpen, onClose }: UserManagementDialogProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("/api/auth/users");
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load platform users");
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    axios.get("/api/auth/users")
      .then((res) => {
        if (active) setUsers(res.data);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.detail || "Failed to load platform users");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !deletingUser && !isAddUserOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, deletingUser, isAddUserOpen, onClose]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await axios.delete(`/api/auth/users/${deletingUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err: any) {
      setDeleteError(err.response?.data?.detail || "Failed to delete user account");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-mgmt-title"
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
          <UserManagementHeader userCount={users.length} onClose={onClose} />

          <UserSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
            onAddUserClick={() => setIsAddUserOpen(true)}
          />

          {error && (
            <div className="m-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" role="alert">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="space-y-3" aria-busy="true" aria-label="Loading registered users">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" aria-hidden="true" />
                <h3 className="text-sm font-medium text-gray-900">
                  {searchQuery ? "No matching users found" : "No users registered"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {searchQuery ? `No account matches "${searchQuery}".` : "Add a user to get started."}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <UserTable
                users={filteredUsers}
                currentUserId={user?.id}
                onDeleteClick={(u) => {
                  setDeleteError("");
                  setDeletingUser(u);
                }}
              />
            )}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <DeleteUserConfirmDialog
        isOpen={Boolean(deletingUser)}
        userEmail={deletingUser?.email || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeletingUser(null);
          setDeleteError("");
        }}
        loading={deleteLoading}
        error={deleteError}
      />

      <CreateUserDialog
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={() => {
          fetchUsers();
        }}
      />
    </>
  );
};
