import { useState, useCallback, useRef } from "react";
import { executeCode } from "../lib/piston";

/**
 * Normalize output for comparison — trims whitespace, normalizes spacing
 * around brackets and commas for consistent comparison.
 */
function normalizeOutput(output) {
  return output
    .trim()
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/\[\s+/g, "[")
        .replace(/\s+\]/g, "]")
        .replace(/\s*,\s*/g, ",")
    )
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Determine the overall verdict from the execution result and per-case results.
 */
function determineVerdict(pistonResult, testCaseResults) {
  if (pistonResult.isTimeout) return "Time Limit Exceeded";
  if (pistonResult.isCompileError) return "Compilation Error";
  if (!pistonResult.success && !pistonResult.isCompileError) return "Runtime Error";

  const allPassed = testCaseResults.every((tc) => tc.passed);
  return allPassed ? "Accepted" : "Wrong Answer";
}

/**
 * Split stdout into per-case results by matching output lines
 * to test cases in order.
 */
function buildTestCaseResults(pistonResult, testCases) {
  // If there was a compile or runtime error, mark all cases as failed
  if (!pistonResult.success) {
    return testCases.map((tc, idx) => ({
      id: idx,
      passed: false,
      input: tc.input,
      expected: String(tc.expected),
      actual: pistonResult.isCompileError
        ? "[Compilation Error]"
        : pistonResult.stderr
          ? "[Runtime Error]"
          : "",
      hidden: tc.hidden,
    }));
  }

  // Split stdout by newlines — each line corresponds to one test case output
  const outputLines = pistonResult.output
    .trim()
    .split("\n")
    .filter((line) => line.length > 0);

  return testCases.map((tc, idx) => {
    const actualLine = outputLines[idx] || "";
    const expectedStr = String(tc.expected);

    const normalizedActual = normalizeOutput(actualLine);
    const normalizedExpected = normalizeOutput(expectedStr);

    return {
      id: idx,
      passed: normalizedActual === normalizedExpected,
      input: tc.input,
      expected: expectedStr,
      actual: actualLine.trim(),
      hidden: tc.hidden,
    };
  });
}

/**
 * useCodeExecution — manages code execution state and per-test-case result processing.
 *
 * @param {Object} problem - The current problem object from MongoDB
 * @param {string} selectedLanguage - Current language (javascript, python, java)
 * @returns {{ isRunning, isSubmitting, executionResult, runCode, submitCode, resetResults }}
 */
export function useCodeExecution(problem, selectedLanguage) {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const executionMode = useRef(null); // "run" or "submit"

  /**
   * Execute code and process results.
   * @param {string} code - The user's code
   * @param {"run"|"submit"} mode - Execution mode
   */
  const execute = useCallback(
    async (code, mode) => {
      if (!problem) return null;

      const isSubmit = mode === "submit";
      if (isSubmit) {
        setIsSubmitting(true);
      } else {
        setIsRunning(true);
      }
      executionMode.current = mode;

      try {
        // Execute the code via Piston
        const pistonResult = await executeCode(selectedLanguage, code);

        // Decide which test cases to evaluate against
        const allTestCases = problem.testCases || [];
        const targetCases = isSubmit
          ? allTestCases
          : allTestCases.filter((tc) => !tc.hidden);

        // Build per-case results
        const testCaseResults = buildTestCaseResults(
          pistonResult,
          targetCases
        );

        // Determine verdict
        const verdict = determineVerdict(pistonResult, testCaseResults);

        // Generate placeholder runtime stats
        const runtime = pistonResult.success
          ? `${Math.floor(Math.random() * 80) + 20}ms`
          : null;
        const memory = pistonResult.success
          ? `${(Math.random() * 20 + 10).toFixed(1)} MB`
          : null;

        const result = {
          verdict,
          testCaseResults,
          stdout: pistonResult.output || "",
          stderr: pistonResult.stderr || "",
          compile_output: pistonResult.compile_output || "",
          runtime,
          memory,
          mode,
        };

        setExecutionResult(result);
        return result;
      } catch (err) {
        // Unexpected error — should be rare since piston.js already catches
        const errorResult = {
          verdict: "Runtime Error",
          testCaseResults: [],
          stdout: "",
          stderr: err.message || "An unexpected error occurred",
          compile_output: "",
          runtime: null,
          memory: null,
          mode,
        };
        setExecutionResult(errorResult);
        return errorResult;
      } finally {
        setIsRunning(false);
        setIsSubmitting(false);
      }
    },
    [problem, selectedLanguage]
  );

  const runCode = useCallback(
    (code) => execute(code, "run"),
    [execute]
  );

  const submitCode = useCallback(
    (code) => execute(code, "submit"),
    [execute]
  );

  const resetResults = useCallback(() => {
    setExecutionResult(null);
  }, []);

  return {
    isRunning,
    isSubmitting,
    executionResult,
    runCode,
    submitCode,
    resetResults,
  };
}
