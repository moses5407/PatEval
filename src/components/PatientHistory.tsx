import React from "react";
import { motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { bodyParts } from "../lib/constants";

export function PatientHistory({ evaluations, onClose, onSelectEvaluation }) {
  if (!evaluations || evaluations.length === 0) return null;

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold">Patient History</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-500 cursor-pointer"
                onClick={() => onSelectEvaluation(evaluation)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Evaluation Date: {formatDate(evaluation.evaluationDate)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Problems: </span>
                    {evaluation.selectedParts?.map((part) => part.name).filter(Boolean).join(", ") || "No problems recorded"}
                  </div>

                  {evaluation.timeline && evaluation.timeline.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Latest Event: </span>
                      {evaluation.timeline[evaluation.timeline.length - 1].description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}