import { CheckCircle2, XCircle, AlertTriangle, Clock, Ban } from "lucide-react";

const VERDICT_CONFIG = {
  Accepted: {
    label: "Accepted",
    emoji: "✅",
    icon: CheckCircle2,
    bgClass: "bg-success/10",
    borderClass: "border-success/30",
    textClass: "text-success",
    iconClass: "text-success",
  },
  "Wrong Answer": {
    label: "Wrong Answer",
    emoji: "❌",
    icon: XCircle,
    bgClass: "bg-error/10",
    borderClass: "border-error/30",
    textClass: "text-error",
    iconClass: "text-error",
  },
  "Runtime Error": {
    label: "Runtime Error",
    emoji: "⚠️",
    icon: AlertTriangle,
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    textClass: "text-warning",
    iconClass: "text-warning",
  },
  "Compilation Error": {
    label: "Compilation Error",
    emoji: "🔴",
    icon: Ban,
    bgClass: "bg-error/10",
    borderClass: "border-error/30",
    textClass: "text-error",
    iconClass: "text-error",
  },
  "Time Limit Exceeded": {
    label: "Time Limit Exceeded",
    emoji: "⏱",
    icon: Clock,
    bgClass: "bg-warning/10",
    borderClass: "border-warning/30",
    textClass: "text-yellow-400",
    iconClass: "text-yellow-400",
  },
};

function VerdictBanner({ verdict, runtime, memory }) {
  const config = VERDICT_CONFIG[verdict];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`w-full px-4 py-3 rounded-lg border ${config.bgClass} ${config.borderClass} flex items-center justify-between`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`size-5 ${config.iconClass}`} />
        <span className={`font-bold text-base ${config.textClass}`}>
          {config.emoji} {config.label}
        </span>
      </div>

      {/* Runtime stats — only shown for Accepted or Wrong Answer */}
      {(verdict === "Accepted" || verdict === "Wrong Answer") &&
        runtime &&
        memory && (
          <div className="flex items-center gap-3">
            <span className="badge badge-sm badge-ghost gap-1 font-mono text-xs">
              <Clock className="size-3" />
              {runtime}
            </span>
            <span className="badge badge-sm badge-ghost gap-1 font-mono text-xs">
              💾 {memory}
            </span>
          </div>
        )}
    </div>
  );
}

export default VerdictBanner;
