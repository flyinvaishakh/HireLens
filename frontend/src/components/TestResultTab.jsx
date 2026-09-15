import { useState } from "react";
import { CheckCircle2, XCircle, EyeOff } from "lucide-react";
import VerdictBanner from "./VerdictBanner";

function TestResultTab({ executionResult }) {
  const [selectedCase, setSelectedCase] = useState(0);

  if (!executionResult) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-base-content/40 text-sm">
          Run or submit your code to see results here.
        </p>
      </div>
    );
  }

  const {
    verdict,
    testCaseResults,
    stdout,
    stderr,
    compile_output,
    runtime,
    memory,
  } = executionResult;

  const visibleResults = testCaseResults.filter((tc) => !tc.hidden);
  const currentResult = visibleResults[selectedCase];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Verdict banner */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <VerdictBanner verdict={verdict} runtime={runtime} memory={memory} />
      </div>

      {/* Case chips */}
      {visibleResults.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0 overflow-x-auto">
          {visibleResults.map((tc, idx) => (
            <button
              key={tc.id}
              onClick={() => setSelectedCase(idx)}
              className={`btn btn-xs gap-1.5 font-medium transition-all ${
                selectedCase === idx
                  ? tc.passed
                    ? "bg-success/20 border-success/40 text-success hover:bg-success/30"
                    : "bg-error/20 border-error/40 text-error hover:bg-error/30"
                  : "btn-ghost bg-base-300/50 hover:bg-base-300"
              }`}
            >
              {tc.passed ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <XCircle className="size-3" />
              )}
              Case {idx + 1}
            </button>
          ))}

          {/* Hidden test cases indicator */}
          {testCaseResults.some((tc) => tc.hidden) && (
            <span className="badge badge-xs badge-ghost gap-1 text-base-content/40">
              <EyeOff className="size-3" />
              +{testCaseResults.filter((tc) => tc.hidden).length} hidden
            </span>
          )}
        </div>
      )}

      {/* Case detail panel */}
      {currentResult && (
        <div className="px-4 py-2 space-y-3 flex-shrink-0">
          <div className="bg-base-300/40 rounded-lg p-3 space-y-3 border border-base-300/60">
            {/* Input */}
            <div>
              <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                Input
              </span>
              <pre className="mt-1 font-mono text-sm text-base-content whitespace-pre-wrap break-all">
                {typeof currentResult.input === "object"
                  ? JSON.stringify(currentResult.input, null, 2)
                  : String(currentResult.input)}
              </pre>
            </div>

            {/* Expected Output */}
            <div>
              <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                Expected Output
              </span>
              <pre className="mt-1 font-mono text-sm text-success whitespace-pre-wrap break-all">
                {currentResult.expected}
              </pre>
            </div>

            {/* Your Output */}
            <div>
              <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                Your Output
              </span>
              <pre
                className={`mt-1 font-mono text-sm whitespace-pre-wrap break-all ${
                  currentResult.passed ? "text-success" : "text-error"
                }`}
              >
                {currentResult.actual || "(no output)"}
              </pre>
            </div>

            {/* Diff highlight for failed cases */}
            {!currentResult.passed &&
              currentResult.actual &&
              currentResult.actual !== "[Compilation Error]" &&
              currentResult.actual !== "[Runtime Error]" && (
                <div className="border-t border-base-300/60 pt-2">
                  <span className="text-xs font-semibold text-error/70 uppercase tracking-wider">
                    Difference
                  </span>
                  <div className="mt-1 font-mono text-xs space-y-1">
                    <div className="flex gap-2">
                      <span className="text-error/60 min-w-[70px]">
                        Expected:
                      </span>
                      <span className="text-success bg-success/10 px-1.5 rounded">
                        {currentResult.expected}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-error/60 min-w-[70px]">Got:</span>
                      <span className="text-error bg-error/10 px-1.5 rounded">
                        {currentResult.actual}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Stdout section */}
      {stdout && stdout !== "No output" && (
        <div className="px-4 py-2 flex-shrink-0">
          <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider block mb-2">
            Your Output / Console
          </span>
          <div className="bg-neutral rounded-lg p-3 max-h-32 overflow-y-auto border border-base-300/40 console-scrollbar">
            <pre className="font-mono text-sm text-neutral-content whitespace-pre-wrap break-all">
              {stdout}
            </pre>
          </div>
        </div>
      )}

      {/* Error / stderr section */}
      {(stderr || compile_output) && (
        <div className="px-4 py-2 pb-4 flex-shrink-0">
          <span className="text-xs font-semibold text-error/70 uppercase tracking-wider block mb-2">
            {compile_output ? "Compilation Error" : "Error"}
          </span>
          <div className="bg-error/5 border border-error/20 rounded-lg p-3 max-h-40 overflow-y-auto console-scrollbar">
            <pre className="font-mono text-sm text-error whitespace-pre-wrap break-all">
              {compile_output || stderr}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestResultTab;
