import React, { useState } from "react";
import axios from "axios";
import { Check, ShieldCheck } from "lucide-react";

interface SignoffButtonProps {
  projectId: string;
  gateName: string;
  disabled?: boolean;
  onSuccess: () => void;
}

export const SignoffButton = ({ projectId, gateName, disabled, onSuccess }: SignoffButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignoff = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`/api/projects/${projectId}/signoff`, { gate_name: gateName });
      setShowModal(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to sign off.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={disabled}
        className="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center shadow-sm"
      >
        <ShieldCheck size={16} className="mr-2" />
        Sign Off {gateName}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <ShieldCheck className="mr-2 text-blue-600" size={24} />
              Confirm Sign-off
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-sm text-blue-800 font-medium mb-1">
                You are about to cryptographically baseline <strong>{gateName}</strong>.
              </p>
              <p className="text-xs text-blue-600">
                This will record your user ID and generate a SHA-256 hash of the current artifacts to guarantee immutability.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignoff}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? "Processing..." : (
                  <>
                    <Check size={16} className="mr-2" />
                    Confirm Sign-off
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
