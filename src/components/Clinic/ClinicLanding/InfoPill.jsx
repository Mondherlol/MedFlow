import React from "react";

const cx = (...cls) => cls.filter(Boolean).join(" ");

export default function InfoPill({ icon: Icon, children, color = "text-gray-700", ringColor = "ring-gray-200" }) {
  return (
    <div className={cx(
      "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium",
      "bg-yellow/70 backdrop-blur ring-1",
      ringColor,
      color
    )}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </div>
  );
}
