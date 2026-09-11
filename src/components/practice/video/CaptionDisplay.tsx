"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  caption: string;
  isVisible: boolean;
}

export const CaptionDisplay: React.FC<Props> = ({ caption, isVisible }) => {
  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6 pointer-events-none z-20">
      <AnimatePresence mode="wait">
        {isVisible && caption && (
          <motion.div
            key={caption}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-2xl px-6 py-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-center"
          >
            <p className="text-white text-lg md:text-xl font-medium leading-relaxed drop-shadow-sm">
              {caption}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
