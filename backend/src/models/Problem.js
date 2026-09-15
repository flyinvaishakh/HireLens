import mongoose from "mongoose";

const ExampleSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const TestCaseSchema = new mongoose.Schema(
  {
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expected: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    hidden: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const StarterCodeSchema = new mongoose.Schema(
  {
    javascript: {
      type: String,
      required: true,
    },
    python: {
      type: String,
      required: true,
    },
    java: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const SolutionSchema = new mongoose.Schema(
  {
    javascript: {
      type: String,
      default: "",
    },
    python: {
      type: String,
      default: "",
    },
    java: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const ExpectedOutputSchema = new mongoose.Schema(
  {
    javascript: {
      type: String,
      default: "",
    },
    python: {
      type: String,
      default: "",
    },
    java: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const DescriptionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    notes: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const ProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    description: {
      type: DescriptionSchema,
      required: true,
    },

    constraints: {
      type: [String],
      default: [],
    },

    examples: {
      type: [ExampleSchema],
      default: [],
    },

    starterCode: {
      type: StarterCodeSchema,
      required: true,
    },

    expectedOutput: {
      type: ExpectedOutputSchema,
      required: true,
    },

    testCases: {
      type: [TestCaseSchema],
      default: [],
    },

    solution: {
      type: SolutionSchema,
      default: () => ({}),
    },

    acceptanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    submissions: {
      type: Number,
      default: 0,
      min: 0,
    },

    solvedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Problem", ProblemSchema);
