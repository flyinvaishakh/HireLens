import { useState, useEffect } from "react";
import { FlaskConical, ListChecks, Loader2Icon } from "lucide-react";
import TestCaseTab from "./TestCaseTab";
import TestResultTab from "./TestResultTab";

function OutputConsole({
  problem,
  executionResult,
  isRunning,
  isSubmitting,
  onRun,
  onSubmit,
}) {
  const [activeTab, setActiveTab] = useState("testcases");

  // Auto-switch to results tab when execution completes
  useEffect(() => {
    if (executionResult && !isRunning && !isSubmitting) {
      setActiveTab("results");
    }
  }, [executionResult, isRunning, isSubmitting]);

  // Reset to test cases tab when problem changes
  useEffect(() => {
    setActiveTab("testcases");
  }, [problem?._id, problem?.slug]);

  const isExecuting = isRunning || isSubmitting;

  return (
    <div className="h-full bg-base-100 flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-2 bg-base-200 border-b border-base-300 flex-shrink-0">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("testcases")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === "testcases"
                ? "border-primary text-primary"
                : "border-transparent text-base-content/50 hover:text-base-content/80"
            }`}
          >
            <FlaskConical className="size-3.5" />
            Test Cases
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all border-b-2 ${
              activeTab === "results"
                ? "border-primary text-primary"
                : "border-transparent text-base-content/50 hover:text-base-content/80"
            }`}
          >
            <ListChecks className="size-3.5" />
            Test Results
            {executionResult && (
              <span
                className={`ml-1 badge badge-xs ${
                  executionResult.verdict === "Accepted"
                    ? "badge-success"
                    : "badge-error"
                }`}
              >
                {executionResult.verdict === "Accepted" ? "✓" : "✗"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {isExecuting ? (
          /* Loading state */
          <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
            <Loader2Icon className="size-6 animate-spin text-primary" />
            <p className="text-sm text-base-content/50">
              {isSubmitting
                ? "Submitting & running all test cases..."
                : "Running test cases..."}
            </p>
            {/* Loading skeleton */}
            <div className="w-full max-w-md space-y-2 mt-2">
              <div className="h-3 bg-base-300 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-base-300 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-base-300 rounded animate-pulse w-2/3" />
            </div>
          </div>
        ) : activeTab === "testcases" ? (
          <TestCaseTab
            problem={problem}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
            onRun={onRun}
            onSubmit={onSubmit}
          />
        ) : (
          <TestResultTab executionResult={executionResult} />
        )}
      </div>
    </div>
  );
}

export default OutputConsole;
