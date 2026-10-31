import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteUserConfirmDialogProps {
  isOpen: boolean;
  userEmail: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  error?: string;
}

export const DeleteUserConfirmDialog = ({
  isOpen,
  userEmail,
  onConfirm,
  onCancel,
  loading,
  error,
}: DeleteUserConfirmDialogProps) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-200">
        <div className="flex items-start space-x-3 mb-4">
          <div className="p-2 rounded-full bg-red-100 text-red-600 flex-shrink-0">
            <AlertTriangle size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 id="delete-user-title" className="text-lg font-semibold text-gray-900">
              Delete User Account
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to permanently delete{" "}
              <strong className="text-gray-900 font-medium">{userEmail}</strong>? This user will be removed from all assigned project teams.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};
