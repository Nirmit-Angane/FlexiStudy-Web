"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  Sparkles,
  Zap,
  BookOpen
} from "lucide-react";

interface QuizQuestion {
  question: string;
  choices: string[];
  correctIdx: number;
}

interface Props {
  quiz: QuizQuestion[];
  topic: string;
  primaryColor: string;
  onComplete: (score: number, total: number) => void;
  onRestart: () => void;
  learningStyle?: string;
}

export function MicroQuizOverlay({ 
  quiz, 
  topic, 
  primaryColor, 
  onComplete, 
  onRestart,
  learningStyle 
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz[currentIdx];
  const isCorrect = selectedIdx === currentQuestion?.correctIdx;
  const progress = ((currentIdx) / quiz.length) * 100;

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedIdx(idx);
    setShowResult(true);
    if (idx === currentQuestion.correctIdx) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const scorePercentage = (score / quiz.length) * 100;
  const needsImprovement = scorePercentage < 70;

  if (isFinished) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-bg-surface/95 backdrop-blur-md animate-in fade-in zoom-in duration-300">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative inline-block">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${needsImprovement ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}>
              {needsImprovement ? <BookOpen size={48} /> : <Trophy size={48} />}
            </div>
            {!needsImprovement && (
              <Sparkles className="absolute -top-2 -right-2 text-warning animate-pulse" size={24} />
            )}
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold text-text-primary mb-2">
              {needsImprovement ? "Nice Effort!" : "Mastery Achieved!"}
            </h2>
            <p className="text-text-secondary">
              You scored <span className="font-bold text-text-primary">{score} out of {quiz.length}</span> on <span className="italic">{topic}</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-bg-elevated border border-border-default">
              <div className="text-sm text-text-muted mb-1">Score</div>
              <div className="text-2xl font-bold text-text-primary">{Math.round(scorePercentage)}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-bg-elevated border border-border-default">
              <div className="text-sm text-text-muted mb-1">XP Earned</div>
              <div className="text-2xl font-bold text-brand-primary">+{score * 10}</div>
            </div>
          </div>

          {needsImprovement && (
            <div className="p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 text-left space-y-3">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-sm">
                <Zap size={16} />
                PERSONALIZED SUGGESTION
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                This topic seems a bit challenging with the <span className="font-bold uppercase">{learningStyle || "Interactive"}</span> style. 
                Try switching to <span className="font-bold text-brand-primary">Visual</span> or <span className="font-bold text-brand-primary">Practical</span> mode to see it from a different perspective!
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={() => onComplete(score, quiz.length)}
              className="btn btn-primary w-full py-4 rounded-xl font-bold text-lg shadow-brand hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Finish & Save Progress
              <CheckCircle2 size={20} />
            </button>
            <button 
              onClick={onRestart}
              className="btn btn-secondary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Rewatch Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-bg-surface p-8 animate-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-brand-primary uppercase">Chapter Quiz</span>
          <h3 className="text-xl font-display font-bold text-text-primary">{topic}</h3>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-text-muted">Question {currentIdx + 1} of {quiz.length}</div>
          <div className="w-32 h-2 bg-bg-elevated rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-brand-primary transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full space-y-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary leading-tight">
          {currentQuestion.question}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.choices.map((choice, i) => {
            let state = "idle";
            if (showResult) {
              if (i === currentQuestion.correctIdx) state = "correct";
              else if (i === selectedIdx) state = "wrong";
              else state = "disabled";
            }

            return (
              <button
                key={i}
                disabled={showResult}
                onClick={() => handleSelect(i)}
                className={`
                  relative w-full p-5 rounded-2xl text-left border-2 transition-all duration-200 flex items-center justify-between group
                  ${state === "idle" && "border-border-default hover:border-brand-primary hover:bg-brand-primary/5 hover:translate-x-1"}
                  ${state === "correct" && "border-success bg-success/10 text-success-bold"}
                  ${state === "wrong" && "border-error bg-error/10 text-error-bold"}
                  ${state === "disabled" && "border-border-default opacity-50 grayscale cursor-not-allowed"}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                    ${state === "idle" && "bg-bg-elevated text-text-muted group-hover:bg-brand-primary group-hover:text-white"}
                    ${state === "correct" && "bg-success text-white"}
                    ${state === "wrong" && "bg-error text-white"}
                    ${state === "disabled" && "bg-bg-elevated text-text-muted"}
                  `}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="font-medium text-lg">{choice}</span>
                </div>
                
                {state === "correct" && <CheckCircle2 size={24} />}
                {state === "wrong" && <XCircle size={24} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end">
        {showResult && (
          <button 
            onClick={handleNext}
            className="btn btn-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
          >
            {currentIdx === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
