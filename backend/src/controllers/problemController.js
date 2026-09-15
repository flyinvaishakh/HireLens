import Problem from "../models/Problem.js";

// GET /api/problems — list all published problems
export const getAllProblems = async (req, res) => {
  try {
    const { difficulty } = req.query;

    const filter = { isPublished: true };
    if (difficulty) {
      filter.difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    }

    const problems = await Problem.find(filter)
      .select("-testCases -solution")
      .sort({ difficulty: 1, title: 1 });

    res.json({ problems });
  } catch (error) {
    console.error("Error fetching problems:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/problems/:slug — get a single problem by slug
export const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const problem = await Problem.findOne({ slug, isPublished: true });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json({ problem });
  } catch (error) {
    console.error("Error fetching problem:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
