import axiosInstance from "./axios";

export async function executeCode(language, code) {
  try {
    const response = await axiosInstance.post("/api/execute", {
      language,
      code,
    });

    const data = response.data;

    const output = data.run?.output || "";
    const stderr = data.run?.stderr || "";
    const compileOutput = data.run?.compile_output || "";
    const exitCode = data.run?.code;
    const signal = data.run?.signal;

    // Determine if this is a compilation error
    if (compileOutput && (exitCode !== 0 || stderr)) {
      return {
        success: false,
        output,
        error: compileOutput || stderr,
        stderr,
        compile_output: compileOutput,
        exitCode,
        signal,
        isCompileError: true,
      };
    }

    // Runtime error
    if (stderr || (exitCode !== null && exitCode !== undefined && exitCode !== 0)) {
      return {
        success: false,
        output,
        error: stderr || `Process exited with code ${exitCode}`,
        stderr,
        compile_output: compileOutput,
        exitCode,
        signal,
        isCompileError: false,
      };
    }

    // Success
    return {
      success: true,
      output: output || "No output",
      error: "",
      stderr: "",
      compile_output: compileOutput,
      exitCode,
      signal,
      isCompileError: false,
    };
  } catch (err) {
    // Network / server error
    const isTimeout = err.code === "ECONNABORTED" || err.response?.status === 504;
    return {
      success: false,
      output: "",
      error:
        err.response?.data?.details?.message ||
        err.response?.data?.error ||
        err.message ||
        "Execution failed",
      stderr: "",
      compile_output: "",
      exitCode: null,
      signal: null,
      isCompileError: false,
      isTimeout,
      isNetworkError: true,
    };
  }
}