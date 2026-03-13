"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InteractiveVideoPlayer } from "@/components/practice/video/InteractiveVideoPlayer";
import { VideoLesson } from "@/lib/video/types";
import { ArrowLeft, Loader2, Sparkles, BookOpen, BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const rawTopic = params?.topic as string || "";
  const topic = decodeURIComponent(rawTopic);

  const [lesson, setLesson] = useState<VideoLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topic) return;

    let isMounted = true;
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch("/api/practice/video/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to generate video lesson");
        }

        const data = await res.json();
        if (isMounted) {
          setLesson(data);
          setLoading(false);
          // Save to sessionStorage for MCQ page
          sessionStorage.setItem(`video_lesson_${topic}`, JSON.stringify(data));
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "An unexpected error occurred");
          setLoading(false);
        }
      }
    };

    fetchVideo();

    return () => {
      isMounted = false;
    };
  }, [topic]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/practice"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#3D8B71]" />
                Interactive Video Lesson
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative">
               <div className="absolute inset-0 bg-[#3D8B71]/20 rounded-full animate-ping"></div>
               <Loader2 className="w-16 h-16 text-[#3D8B71] animate-spin relative z-10" />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-gray-800">Generating Your Custom Video</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-md mx-auto">
              Our AI is writing the script, preparing the visual scenes, and synthesizing the voice for <span className="font-semibold text-gray-800">"{topic}"</span>.
            </p>
            <div className="mt-12 flex items-center gap-8 text-gray-400">
               <div className="flex flex-col items-center gap-2">
                 <BrainCircuit className="w-6 h-6 animate-pulse" />
                 <span className="text-sm">Analyzing Topic</span>
               </div>
               <div className="w-16 h-px bg-gray-200"></div>
               <div className="flex flex-col items-center gap-2">
                 <BookOpen className="w-6 h-6 animate-pulse delay-150" />
                 <span className="text-sm">Writing Script</span>
               </div>
               <div className="w-16 h-px bg-gray-200"></div>
               <div className="flex flex-col items-center gap-2">
                 <Sparkles className="w-6 h-6 animate-pulse delay-300" />
                 <span className="text-sm">Creating Scenes</span>
               </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">!</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Generation Failed</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">{error}</p>
            <button 
              onClick={() => router.push('/practice')}
              className="px-8 py-4 bg-[#3D8B71] hover:bg-[#2e6854] text-white rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-1"
            >
              Try Another Topic
            </button>
          </div>
        ) : lesson ? (
          <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 capitalize px-2 border-l-4 border-[#3D8B71]">
                {topic}
              </h2>
            </div>
            
            {/* The Video Player */}
            <InteractiveVideoPlayer lesson={lesson} />

            {/* Next Steps / Actions after video */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
               {lesson.mcqs && lesson.mcqs.length > 0 && (
                 <Link href={`/practice/video/${encodeURIComponent(topic)}/mcq`} className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-[#3D8B71] hover:shadow-md transition-all">
                   <div className="w-12 h-12 rounded-xl bg-[#3D8B71]/10 text-[#3D8B71] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                     <BrainCircuit className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#3D8B71] transition-colors">Take Quick Quiz</h3>
                     <p className="text-gray-500">Test your knowledge with {lesson.mcqs.length} multiple-choice questions based on this video.</p>
                   </div>
                 </Link>
               )}
               {lesson.notes && (
                 <div className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:border-[#3D8B71] hover:shadow-md transition-all cursor-pointer">
                   <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                     <BookOpen className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Study Notes</h3>
                     <p className="text-gray-500">Review key concepts, formulas, and a quick summary of the video lesson.</p>
                   </div>
                 </div>
               )}
            </div>
            
            {/* Render Notes Below */}
            {lesson.notes && (
              <div className="mt-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                 <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                   <BookOpen className="w-6 h-6 text-[#3D8B71]" /> Lesson Notes
                 </h3>
                 <p className="text-lg text-gray-700 leading-relaxed mb-6">
                   {lesson.notes.summary}
                 </p>
                 <div className="space-y-4">
                   <h4 className="text-lg font-bold text-gray-900">Key Points:</h4>
                   <ul className="list-disc pl-6 space-y-2 text-gray-700">
                     {lesson.notes.keyPoints?.map((pt: string, i: number) => (
                       <li key={i}>{pt}</li>
                     ))}
                   </ul>
                 </div>
                 {lesson.notes.funFact && (
                   <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-4 items-start">
                     <div className="text-2xl mt-1">💡</div>
                     <div>
                       <h4 className="font-bold text-blue-900 mb-1">Fun Fact</h4>
                       <p className="text-blue-800">{lesson.notes.funFact}</p>
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
