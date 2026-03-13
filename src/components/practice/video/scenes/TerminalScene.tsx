"use client";
import React, { useState, useEffect } from "react";

interface Props {
  data: any;
}

export const TerminalScene: React.FC<Props> = ({ data }) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const lines = data.lines || data.commands || data.events || [];
    if (!lines.length) return;
    const interval = setInterval(() => {
      setVisibleLines(v => {
        if (v < lines.length) return v + 1;
        clearInterval(interval);
        return v;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [data.lines, data.commands, data.events]);

  return (
    <div className="flex w-full h-full bg-[#0D1117] items-center justify-center p-16 md:p-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#30363D]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="w-full max-w-5xl bg-[#000000] border border-[#30363D] rounded-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] font-mono text-xl md:text-2xl relative z-10">
        <div className="flex items-center px-6 py-4 bg-[#161B22] border-b border-[#30363D]">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]"></div>
          </div>
          <div className="ml-4 text-sm font-semibold tracking-wider text-[#8B949E]">bash - 80x24</div>
        </div>
        <div className="p-8 text-[#E6EDF3] leading-relaxed min-h-[400px]">
          {(data.lines || data.commands || data.events || []).slice(0, visibleLines).map((line: string, i: number) => (
            <div key={i} className="mb-3">
              <span className="text-[#2EA043] font-bold">{data.prompt || "$"}</span> <span className="text-[#7EE787] drop-shadow-sm">{line}</span>
            </div>
          ))}
          {visibleLines < ((data.lines || data.commands || data.events || []).length) && (
            <div className="w-4 h-6 bg-[#E6EDF3] animate-pulse inline-block align-middle ml-3"></div>
          )}
        </div>
      </div>
    </div>
  );
};
