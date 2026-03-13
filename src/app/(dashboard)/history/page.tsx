"use client";

import { useState } from "react";
import { mockLessons } from "@/lib/mock-data";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const STYLES = ["All", "Visual", "Auditory", "Kinesthetic"];
const SUBJECTS = ["All", "Science", "Mathematics", "Technology", "History", "English", "Geography", "Economics"];

const SUBJECT_COLORS: Record<string, string> = {
  Science: "var(--subject-science)",
  Mathematics: "var(--subject-math)",
  Technology: "var(--subject-tech)",
  History: "var(--subject-history)",
  English: "var(--subject-english)",
  Geography: "var(--subject-geo)",
  Economics: "var(--subject-econ)",
};

const STYLE_ICONS: Record<string, string> = {
  Visual: "👁️",
  Auditory: "🎧",
  Kinesthetic: "🛠️",
};

export default function HistoryPage() {
  const [activeStyle, setActiveStyle] = useState("All");
  const [activeSubject, setActiveSubject] = useState("All");

  const filteredLessons = mockLessons.filter(lesson => {
    const matchStyle = activeStyle === "All" || lesson.style === activeStyle;
    const matchSubject = activeSubject === "All" || lesson.subject === activeSubject;
    return matchStyle && matchSubject;
  });

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto">
      
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          Learning History
        </h1>
        <p className="text-text-secondary">
          Review past lessons and quiz results.
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6 flex flex-col gap-6">
        <div>
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Filter by Style
          </div>
          <div className="flex flex-wrap gap-2">
            {STYLES.map(style => (
              <button
                key={style}
                onClick={() => setActiveStyle(style)}
                className={`chip ${activeStyle === style ? 'active' : ''}`}
              >
                {style !== "All" && STYLE_ICONS[style]} {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Filter by Subject
          </div>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(subject => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`chip ${activeSubject === subject ? 'active' : ''}`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="text-sm font-semibold text-text-muted mb-4">
          Showing {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
        </div>

        <div className="flex flex-col gap-4">
          {filteredLessons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3 className="empty-state-title">No lessons found</h3>
              <p className="empty-state-desc">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            filteredLessons.map((lesson) => (
              <Link 
                href={`/lesson/${lesson.id}`} 
                key={lesson.id}
                className="card hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden flex items-center p-0"
              >
                {/* Subject color bar indicator */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-2"
                  style={{ backgroundColor: SUBJECT_COLORS[lesson.subject] || 'var(--border-default)' }}
                ></div>

                <div className="flex-1 py-5 pl-8 pr-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: SUBJECT_COLORS[lesson.subject] || 'var(--text-primary)' }}
                      >
                        {lesson.subject}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-text-primary">
                      {lesson.topic}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-text-secondary bg-bg-elevated px-2 py-0.5 rounded-md">
                        {STYLE_ICONS[lesson.style]} {lesson.style}
                      </span>
                      <span className="text-text-muted text-xs">
                        {formatDistanceToNow(new Date(lesson.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`badge px-3 py-1 text-sm ${
                      lesson.finalScore >= 4 ? 'badge-success' : 
                      lesson.finalScore === 3 ? 'badge-warning' : 'badge-error'
                    }`}>
                      {lesson.finalScore}/5 
                      <span className="ml-1 opacity-70">
                        {lesson.finalScore === 5 ? '★★★★★' : 
                         lesson.finalScore === 4 ? '★★★★☆' : 
                         lesson.finalScore === 3 ? '★★★☆☆' : 
                         lesson.finalScore === 2 ? '★★☆☆☆' : '★☆☆☆☆'}
                      </span>
                    </div>
                    {lesson.finalScore < 3 && (
                      <span className="text-xs font-semibold text-error bg-error-subtle px-2 py-0.5 rounded-md">
                        Retried
                      </span>
                    )}
                    <ChevronRight size={20} className="text-text-muted" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
