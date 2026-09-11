"use client";
import React from "react";

interface Props {
  data: any;
}

export const CodeScene: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-col h-full w-full bg-[#0D1117] text-[#C9D1D9] p-12 items-center justify-center relative">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#58A6FF]/10 rounded-full blur-[80px] pointer-events-none"></div>
      
      { (data.description || data.text || data.summary) && (
        <div className="mb-10 text-2xl md:text-3xl font-medium text-[#8B949E] text-center max-w-4xl text-balance drop-shadow-sm">
          {data.description || data.text || data.summary}
        </div>
      )}

      <div className="w-full max-w-5xl bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative">
        {/* Mac-like header */}
        <div className="flex items-center px-6 py-4 bg-[#0D1117] border-b border-[#30363D]">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]"></div>
          </div>
          {data.language && (
            <div className="ml-auto text-sm font-mono text-[#8B949E] uppercase tracking-wider font-semibold">
              {data.language}
            </div>
          )}
        </div>
        
        <pre className="p-8 overflow-x-auto text-xl/relaxed md:text-2xl/relaxed font-mono">
          <code className="text-[#E6EDF3] whitespace-pre-wrap break-words">
            {data.code || data.snippet || "No code provided."}
          </code>
        </pre>
      </div>
    </div>
  );
};
