interface RevealProps {
  labelA: string;
  responseA: string;
  labelB: string;
  responseB: string;
}

export function SimultaneousReveal({ labelA, responseA, labelB, responseB }: RevealProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-xl border border-[#34417a] bg-[#1a2448] p-4">
        <p className="mb-2 text-sm text-accent">{labelA}</p>
        <p>{responseA || "No response yet."}</p>
      </article>
      <article className="rounded-xl border border-[#34417a] bg-[#1a2448] p-4">
        <p className="mb-2 text-sm text-accent-2">{labelB}</p>
        <p>{responseB || "No response yet."}</p>
      </article>
    </div>
  );
}
