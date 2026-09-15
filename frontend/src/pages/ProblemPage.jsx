import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useProblem, useProblems } from "../hooks/useProblems";
import { useCodeExecution } from "../hooks/useCodeExecution";
import Navbar from "../components/Navbar";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputConsole from "../components/OutputConsole";
import CodeEditorPanel from "../components/CodeEditorPanel";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { Loader2Icon } from "lucide-react";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // Fetch the current problem by slug (the URL param)
  const { data: problemData, isLoading: loadingProblem } = useProblem(id);
  // Fetch all problems for the problem selector dropdown
  const { data: allProblemsData, isLoading: loadingAllProblems } = useProblems();

  const currentProblem = problemData?.problem;
  const allProblems = allProblemsData?.problems || [];

  // Code execution hook — manages execution state and per-test-case results
  const {
    isRunning,
    isSubmitting,
    executionResult,
    runCode,
    submitCode,
    resetResults,
  } = useCodeExecution(currentProblem, selectedLanguage);

  // Set initial code when problem data loads or URL param changes
  useEffect(() => {
    if (currentProblem?.starterCode?.[selectedLanguage]) {
      setCode(currentProblem.starterCode[selectedLanguage]);
      resetResults();
    }
  }, [currentProblem, id, resetResults, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem?.starterCode?.[newLang] || "");
    resetResults();
  };

  const handleProblemChange = (newProblemSlug) => navigate(`/problem/${newProblemSlug}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const handleRunCode = async () => {
    try {
      await runCode(code);
    } catch (_err) {
      // Only show toast for network/server errors
      toast.error("Failed to execute code. Please try again.");
    }
  };

  const handleSubmitCode = async () => {
    try {
      const result = await submitCode(code);

      // Fire confetti on Accepted Submit — keep existing behavior
      if (result && result.verdict === "Accepted") {
        triggerConfetti();
        toast.success("All tests passed! Great job!");
      }
    } catch (_err) {
      // Only show toast for network/server errors
      toast.error("Failed to submit code. Please try again.");
    }
  };

  if (loadingProblem || loadingAllProblems) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2Icon className="size-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-base-content/70">Problem not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* left panel- problem desc */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblem.slug}
              onProblemChange={handleProblemChange}
              allProblems={allProblems}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* right panel- code editor & output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={60} minSize={20}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                  onSubmitCode={handleSubmitCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* Bottom panel - Output Console */}
              <Panel defaultSize={40} minSize={15}>
                <OutputConsole
                  problem={currentProblem}
                  executionResult={executionResult}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;