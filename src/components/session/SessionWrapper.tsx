import type { Mode } from "@/lib/types";

interface SessionWrapperProps {
  mode: Mode;
  step: number;
  totalSteps: number;
  children: React.ReactNode;
}

export function SessionWrapper({ mode, step, totalSteps, children }: SessionWrapperProps) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize">{mode}</h2>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-6 rounded-full ${i < step ? "bg-accent" : "bg-[#2a376a]"}`}
            />
          ))}
        </div>
      </div>
      {children}
    </section>
  );
}
