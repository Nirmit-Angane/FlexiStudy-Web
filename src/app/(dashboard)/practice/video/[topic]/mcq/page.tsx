"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoLesson } from "@/lib/video/types";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti"; // I'll assume they have this, or I won't use it. Let's just use standard CSS or no confetti to be safe, since it might not be installed.

export default function VideoMCQPage() {
  const params = useParams();
  const router = useRouter();
  const topic = decodeURIComponent((params?.topic as string) || "");

  const [lesson, setLesson] = useState<VideoLesson | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Retrieve the lesson from sessionStorage
    const stored = sessionStorage.getItem(`video_lesson_${topic}`);
    if (stored) {
      setLesson(JSON.parse(stored));
    } else {
      // If no lesson in session, redirect back to video page to generate
      router.replace(`/practice/video/${encodeURIComponent(topic)}`);
    }
  }, [topic, router]);

  if (!lesson || !lesson.mcqs || lesson.mcqs.length === 0) return null;

  const currentQuestion = lesson.mcqs[currentQuestionIdx];

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    
    if (idx === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < lesson.mcqs.length - 1) {
      setCurrentQuestionIdx(c => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      // Optional: Save score to Firestore here
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border-t-8 border-[#3D8B71]">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Quiz Complete!</h1>
          <div className="text-7xl mb-8 flex items-center justify-center">
            {score === lesson.mcqs.length ? "🏆" : score > 0 ? "🌟" : "📚"}
          </div>
          <p className="text-2xl text-gray-700 mb-8 font-medium">
            You scored <span className="text-[#3D8B71] font-bold">{score}</span> out of {lesson.mcqs.length}
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => router.push(`/practice/video/${encodeURIComponent(topic)}`)}
              className="w-full py-4 bg-[#3D8B71] hover:bg-[#2e6854] text-white rounded-xl font-bold transition-transform shadow-md hover:-translate-y-1"
            >
              Review Lesson
            </button>
            <Link 
              href="/practice"
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
            >
              Back to Practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link 
            href={`/practice/video/${encodeURIComponent(topic)}`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Question {currentQuestionIdx + 1} of {lesson.mcqs.length}
          </div>
          <div className="w-9"></div> {/* Spacer for balance */}
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-100">
           <div 
             className="h-full bg-[#3D8B71] transition-all duration-300"
             style={{ width: ((currentQuestionIdx) / lesson.mcqs.length) * 100 + "%" }}
           ></div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col pt-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 leading-relaxed">
          {currentQuestion.question}
        </h2>

        <div className="flex flex-col gap-4">
          {currentQuestion.options.map((option: string, i: number) => {
            let stateClass = "border-gray-200 bg-white hover:border-[#3D8B71] hover:bg-[#3D8B71]/5";
            let icon = null;

            if (showExplanation) {
              if (i === currentQuestion.correctAnswer) {
                stateClass = "border-green-500 bg-green-50 text-green-900";
                icon = <CheckCircle2 className="w-6 h-6 text-green-500" />;
              } else if (i === selectedAnswer) {
                stateClass = "border-red-500 bg-red-50 text-red-900";
                icon = <XCircle className="w-6 h-6 text-red-500" />;
              } else {
                stateClass = "border-gray-200 bg-gray-50 opacity-50";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showExplanation}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${stateClass}`}
              >
                <span className="text-lg font-medium">{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-bold text-blue-900 mb-2">Explanation</h3>
            <p className="text-blue-800 leading-relaxed">{currentQuestion.explanation}</p>
            <button 
              onClick={handleNext}
              className="mt-6 px-8 py-3 bg-[#3D8B71] hover:bg-[#2e6854] text-white rounded-xl font-bold shadow-md transition-transform hover:-translate-y-0.5"
            >
              {currentQuestionIdx < lesson.mcqs.length - 1 ? "Next Question" : "See Results"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
