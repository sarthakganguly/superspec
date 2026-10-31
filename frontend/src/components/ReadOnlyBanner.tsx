import React, { useState } from "react";

export const ReadOnlyBanner = ({ requiredRole }: { requiredRole: string }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const roleName =
    requiredRole === "GATE_1_OWNER" || requiredRole === "BUSINESS_REQUIREMENT_OWNER"
      ? "Business Requirement Owner"
      : requiredRole === "GATE_2_OWNER" || requiredRole === "DATA_DICTIONARY_OWNER"
      ? "Data Dictionary Owner"
      : requiredRole === "GATE_3_OWNER" || requiredRole === "USER_STORY_OWNER"
      ? "User Story Owner"
      : requiredRole === "GATE_5_OWNER" || requiredRole === "REQUIREMENT_SIGN_OFF_OWNER"
      ? "Requirement Sign-off Owner"
      : requiredRole;

  return (
    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md flex justify-between items-start" role="alert">
      <div>
        <p className="text-sm text-blue-700 font-medium">Viewing in read-only mode.</p>
        <p className="text-sm text-blue-600 mt-1">You must be a {roleName} or Project Admin to edit these requirements.</p>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="text-blue-500 hover:text-blue-700 focus:outline-none"
        aria-label="Dismiss"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
