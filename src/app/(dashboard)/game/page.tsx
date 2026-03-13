"use client";

import { Card } from "@/components/ui/card";
import { Gamepad2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function GamePage() {
  const [key, setKey] = useState(0);
  const router = useRouter();

  const reloadGame = () => {
    setKey(prev => prev + 1);
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (typeof event.data !== 'object' || !event.data) return;

      if (event.data.type === 'request_custom_mission') {
        const loadingToast = toast.loading("AI is crafting your mission...");
        try {
          const res = await fetch('/api/generate-quest', {
            method: 'POST',
            body: JSON.stringify({ 
              subject: event.data.subject || 'Maths', 
              difficulty: event.data.difficulty || 'Intermediate' 
            }),
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!res.ok) throw new Error('Failed to generate quest');
          const questData = await res.json();
          
          toast.dismiss(loadingToast);
          
          const iframe = document.getElementById('codequest-iframe') as HTMLIFrameElement;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'custom_mission_ready',
              quest: questData
            }, '*');
          }
        } catch (error) {
          console.error(error);
          toast.dismiss(loadingToast);
          toast.error("Failed to generate AI mission");
          
          const iframe = document.getElementById('codequest-iframe') as HTMLIFrameElement;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'custom_mission_error' }, '*');
          }
        }
      } else if (event.data.type === 'watch_video') {
         toast.loading("Transferring to AI Video Generator...");
         // Using the new video topic route logic
         router.push(`/practice/video/${encodeURIComponent(event.data.topic || 'Maths and Programming')}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [router]);

  // Maximize the grid layout by ditching padding
  return (
    <div className="h-[calc(100vh-72px)] w-full flex flex-col relative bg-[#13161C] overflow-hidden">
      
      {/* Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none flex items-start justify-between">

        
        <div className="pointer-events-auto">
          <button 
            onClick={reloadGame}
            className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors font-medium text-xs"
          >
            <RefreshCw size={14} />
            Reload Session
          </button>
        </div>
      </div>

      <iframe
        id="codequest-iframe"
        key={key}
        src="/game.html"
        className="w-full h-full border-none"
        title="CodeQuest Game"
        allow="autoplay; fullscreen"
      />
        
      {/* Immersive Overlay hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none opacity-50 transition-opacity">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] text-white/70 font-mono uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Live · Kenney Engine
        </div>
      </div>
    </div>
  );
}
