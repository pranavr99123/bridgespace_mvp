"use client";

import { useEffect, useState } from "react";

export function HeartBurst({
  onComplete,
  inline = false,
}: {
  onComplete?: () => void;
  inline?: boolean;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, inline ? 500 : 900);
    return () => clearTimeout(t);
  }, [onComplete, inline]);

  if (!show) return null;

  if (inline) {
    return (
      <span
        className="heart-burst-inline"
        aria-hidden
      >
        <span className="heart-icon-sm">♥</span>
      </span>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
      aria-hidden
    >
      <div className="heart-burst-wrapper">
        <div className="heart-icon">♥</div>
        <div className="heart-ring heart-ring-1" />
        <div className="heart-ring heart-ring-2" />
        <div className="heart-ring heart-ring-3" />
      </div>
    </div>
  );
}
