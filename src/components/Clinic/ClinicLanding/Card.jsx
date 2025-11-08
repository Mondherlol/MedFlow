import React from "react";

const cx = (...cls) => cls.filter(Boolean).join(" ");

export default function Card({ className = "", children }) {
  return (
    <div
      className={cx(
        "group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100",
        "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.25)] hover:border-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
}
