import React from "react";

const cx = (...cls) => cls.filter(Boolean).join(" ");

export default function CTAButton({ children, style, className = "", as = "button", ...rest }) {
  const Comp = as;
  return (
    <Comp
      className={cx(
        "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold",
        "transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "hover:scale-[1.02] active:scale-[.99]",
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </Comp>
  );
}
