"use client";
import React from "react";

interface Props {
  data: any;
}

export const TextScene: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-16 md:p-24 text-center shadow-[inset_0_0_200px_rgba(0,0,0,0.15)] transition-colors duration-1000" style={{ backgroundColor: data.color || "var(--brand-primary, #3D8B71)", color: "#fff" }}>
      <h2 className="text-6xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1] max-w-5xl drop-shadow-xl text-balance">
        {data.heading || data.title || "Key Concept"}
      </h2>
      <p className="text-3xl md:text-4xl font-medium opacity-95 max-w-4xl leading-relaxed drop-shadow-md text-balance">
        {data.body || data.content || data.text || "Loading details..."}
      </p>
    </div>
  );
};
