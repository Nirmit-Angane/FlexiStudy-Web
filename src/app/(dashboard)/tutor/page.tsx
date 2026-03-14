"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  MessageSquare, 
  MoreVertical,
  Trash2,
  RefreshCcw,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Flexi, your AI Tutor. How can I help you with your studies today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage, timestamp: new Date() }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = newMessages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history })
      });

      const data = await res.json();
      
      if (data.answer) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.answer, timestamp: new Date() }
        ]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.", timestamp: new Date() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. I'm ready for new questions!",
        timestamp: new Date(),
      },
    ]);
  };

  // Simple formatter for basic markdown-like syntax (bold and lists)
  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      // Bold
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Inline code
      formattedLine = formattedLine.replace(/`(.*?)`/g, '<code class="bg-[#F0F7F4] px-1.5 py-0.5 rounded text-[#3D8B71] font-mono text-sm">$1</code>');
      
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return <li key={i} className="ml-4 mb-2" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />;
      }
      return <p key={i} className="mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] max-w-5xl mx-auto px-4 md:px-0">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#3D8B71] to-[#56C99A] rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#3D8B71]/20 shrink-0">
            <Sparkles size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">AI Academic Tutor</h1>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[12px] md:text-sm font-medium text-gray-500">Flexi is online and ready</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Clear conversation"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-100 rounded-[20px] md:rounded-[24px] shadow-sm overflow-hidden relative">
        
        {/* Messages List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  message.role === "user" 
                    ? "bg-[#E6F3EE] text-[#3D8B71]" 
                    : "bg-[#FDFBF7] text-gray-400 border border-gray-100"
                }`}>
                  {message.role === "user" ? <User size={18} className="md:w-5 md:h-5" /> : <Bot size={18} className="md:w-5 md:h-5" />}
                </div>

                <div className={`flex flex-col max-w-[80%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 md:px-5 md:py-4 rounded-2xl text-[14px] md:text-[15px] ${
                    message.role === "user"
                      ? "bg-[#3D8B71] text-white rounded-tr-none shadow-md shadow-[#3D8B71]/10"
                      : "bg-[#FDFBF7] text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}>
                    {formatContent(message.content)}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 mt-2 px-1 uppercase tracking-wider">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 flex-row"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FDFBF7] text-gray-400 border border-gray-100 border-dashed animate-pulse">
                <Bot size={18} className="md:w-5 md:h-5" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-[#FDFBF7] border border-gray-100 rounded-tl-none flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#3D8B71]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-[#3D8B71]/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-[#3D8B71]/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Suggestion Chips (Only when chat is empty or fresh) */}
        {messages.length < 3 && !isLoading && (
          <div className="px-4 md:px-8 pb-4 flex flex-nowrap overflow-x-auto gap-2 no-scrollbar scroll-smooth">
            {[
              "Explain photosynthesis",
              "How to solve quadratics?",
              "Summary of World War II",
              "What is React.js?"
            ].map(chip => (
              <button
                key={chip}
                onClick={() => { setInput(chip); }}
                className="px-4 py-2 bg-gray-50 hover:bg-[#E6F3EE] hover:text-[#3D8B71] text-gray-500 rounded-full text-xs font-bold transition-all border border-gray-100 whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder="Ask me anything..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 md:px-6 py-3.5 md:py-4 pr-16 focus:outline-none focus:ring-4 focus:ring-[#3D8B71]/5 focus:border-[#3D8B71]/50 transition-all text-[14px] md:text-[15px] placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 w-11 md:w-12 bg-[#3D8B71] hover:bg-[#2E6854] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-[#3D8B71]/20"
            >
              <Send size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
          <p className="mt-4 text-center text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            Always verify important facts. AI can occasionally make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
}
