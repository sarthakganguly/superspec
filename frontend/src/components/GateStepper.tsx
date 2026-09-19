import React from "react";
import clsx from "clsx";

interface GateStepperProps {
  currentGate: number;
  onGateChange: (gate: number) => void;
}

const GATES = [
  { id: 1, name: "Gate 1", description: "Business Requirements" },
  { id: 2, name: "Gate 2", description: "Data Dictionary" },
  { id: 3, name: "Gate 3", description: "User Stories" },
  { id: 4, name: "Gate 4", description: "Traceability" },
  { id: 5, name: "Gate 5", description: "Sign-off" },
  { id: 6, name: "Gate 6", description: "Export" },
];

export const GateStepper = ({ currentGate, onGateChange }: GateStepperProps) => {
  return (
    <div className="w-full mb-8">
      <nav aria-label="Progress">
        <ol role="list" className="flex divide-x divide-gray-200 rounded-md border border-gray-200 shadow-sm bg-white overflow-hidden">
          {GATES.map((step) => {
            const isCurrent = currentGate === step.id;
            const isPast = currentGate > step.id;

            return (
              <li key={step.id} className="relative flex flex-1">
                <button
                  onClick={() => onGateChange(step.id)}
                  className={clsx(
                    "flex flex-1 items-center px-4 py-3 text-sm font-medium focus:outline-none transition-colors",
                    isCurrent ? "bg-gray-50 hover:bg-gray-50" : "hover:bg-gray-50",
                    isPast ? "text-gray-900" : (isCurrent ? "text-black" : "text-gray-500")
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold mr-3",
                      isCurrent
                        ? "border-black bg-black text-white"
                        : isPast
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {step.id}
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{step.name}</span>
                    <span className={clsx("text-sm", isCurrent ? "font-semibold text-gray-900" : "")}>{step.description}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
