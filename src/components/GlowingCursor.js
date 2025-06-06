import React, { useRef, useEffect } from "react";

export default function GlowingCursor() {
  const cursorRef = useRef();
  useEffect(() => {
    const moveCursor = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);
  return (
    <div
      ref={cursorRef}
      className="fixed z-[9999] pointer-events-none opacity-70 hidden md:block"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "radial-gradient(circle, #38bdf8 60%, #8b5cf6 100%)",
        boxShadow: "0 0 32px 8px #38bdf899, 0 0 8px 2px #8b5cf699",
        transform: "translate(-50%, -50%)",
        transition: "background 0.2s, box-shadow 0.2s",
        top: 0,
        left: 0,
      }}
    />
  );
} 