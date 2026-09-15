import { useState } from "react";
import { PlayIcon, SendIcon } from "lucide-react";

function TestCaseTab({ problem, isRunning, isSubmitting, onRun, onSubmit }) {
  const testCases = (problem?.testCases || []).filter((tc) => !tc.hidden);
  const [selectedCase, setSelectedCase] = useState(0);
  const [customInputs, setCustomInputs] = useState({});

  if (testCases.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-base-content/40 text-sm">
          No test cases available for this problem.
        </p>
      </div>
    );
  }

  const currentCase = testCases[selectedCase];
  const inputKey = `case-${selectedCase}`;
  const currentInput =
    customInputs[inputKey] !== undefined
      ? customInputs[inputKey]
      : JSON.stringify(currentCase?.input, null, 2);

  const handleInputChange = (e) => {
    setCustomInputs((prev) => ({
      ...prev,
      [inputKey]: e.target.value,
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Case chips */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-base-300 flex-shrink-0 overflow-x-auto">
        {testCases.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedCase(idx)}
            className={`btn btn-xs font-medium transition-all ${
              selectedCase === idx
                ? "btn-primary"
                : "btn-ghost bg-base-300/50 hover:bg-base-300"
            }`}
          >
            Case {idx + 1}
          </button>
        ))}
      </div>

      {/* Case detail */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentCase && (
          <>
            {/* Input */}
            <div>
              <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 block">
                Input
              </label>
              <textarea
                value={currentInput}
                onChange={handleInputChange}
                className="w-full bg-base-300/60 rounded-lg p-3 font-mono text-sm text-base-content border border-base-300 focus:border-primary focus:outline-none transition-colors resize-none"
                rows={Math.min(
                  Math.max(currentInput.split("\n").length, 2),
                  6
                )}
                spellCheck={false}
              />
            </div>

            {/* Expected Output */}
            <div>
              <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-2 block">
                Expected Output
              </label>
              <div className="w-full bg-base-300/60 rounded-lg p-3 font-mono text-sm text-base-content border border-base-300">
                {String(currentCase.expected)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-base-300 flex-shrink-0">
        <button
          className="btn btn-sm btn-outline gap-2"
          disabled={isRunning || isSubmitting}
          onClick={onRun}
        >
          <PlayIcon className="size-3.5" />
          Run
        </button>
        <button
          className="btn btn-sm btn-success gap-2"
          disabled={isRunning || isSubmitting}
          onClick={onSubmit}
        >
          <SendIcon className="size-3.5" />
          Submit
        </button>
      </div>
    </div>
  );
}

export default TestCaseTab;
