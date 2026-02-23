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

    if (stderr) {
      return { success: false, output, error: stderr };
    }

    return { success: true, output: output || "No output" };
  } catch (err) {
    return {
      success: false,
      error: "Execution failed",
    };
  }
}