import React from "react";

const links = [
  { name: "GitHub", href: "#" },
  { name: "Docs", href: "#" },
  { name: "Twitter", href: "#" },
  { name: "Terms", href: "#" },
];

export default function Footer({ onFooterLinkClick }) {
  return (
    <footer className="w-full bg-white/10 dark:bg-black/40 border-t border-white/10 py-8 mt-16 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-cyan-400">DarkNode</span>
          <span className="text-white/50 text-sm">©2025</span>
        </div>
        <ul className="flex items-center gap-6 text-white/80 text-sm">
          {links.map((l) => (
            <li key={l.name}>
              <button className="hover:text-cyan-400 transition bg-transparent border-none outline-none" onClick={onFooterLinkClick}>
                {l.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
} 