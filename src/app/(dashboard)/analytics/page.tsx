"use client";

import { 
  mockAnalyticsInsight, 
  mockStyleProgress, 
  mockQuizResults,
  mockSubjectCounts,
  mockTopicsToRevisit
} from "@/lib/mock-data";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { Sparkles, ArrowDownRight } from "lucide-react";

const STYLE_COLORS: Record<string, string> = {
  Visual: "#4A7FC1",    // blue
  Example: "#F5A623",   // orange
  Practical: "#3D8B71", // green
  Interactive: "#A06CB0"// purple
};

export default function AnalyticsPage() {
  
  // Prepare bar chart data (0-100 scale)
  const barData = mockStyleProgress.map(sp => ({
    name: sp.style,
    avgScore: Math.round(sp.avgScore * 100),
    fill: STYLE_COLORS[sp.style]
  }));

  // Prepare line chart data (over last 10 quizzes)
  const lineData = mockQuizResults.map((qr) => ({
    quiz: `Q${qr.quiz}`,
    score: qr.score,
    style: qr.style,
  }));

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-5xl mx-auto">
      
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          My Analytics
        </h1>
        <p className="text-text-secondary">
          Deep dive into your learning patterns and performance.
        </p>
      </div>

      {/* AI Insight Card */}
      <div className="card border-brand-primary bg-gradient-to-r from-bg-surface to-brand-primary-light">
        <div className="card-body flex gap-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-brand">
            <Sparkles size={28} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-text-primary flex items-center gap-2 mb-2">
              AI Insight
              <span className="badge badge-brand tracking-widest px-2 py-0.5 text-[9px] uppercase">Generated</span>
            </h3>
            <p className="text-text-secondary leading-relaxed">
              "{mockAnalyticsInsight}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Style Performance Bar Chart */}
        <div className="card h-full flex flex-col">
          <div className="card-header pb-2 border-none">
            <h2 className="font-display text-lg font-bold">Style Performance</h2>
            <p className="text-sm text-text-muted mt-1">Average score across learning styles (%)</p>
          </div>
          <div className="card-body flex-1 min-h-[300px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--bg-elevated)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}
                  formatter={(value: any) => [`${value}%`, 'Avg Score']}
                />
                <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Over Time Line Chart */}
        <div className="card h-full flex flex-col">
          <div className="card-header pb-2 border-none">
            <h2 className="font-display text-lg font-bold">Performance Over Time</h2>
            <p className="text-sm text-text-muted mt-1">Scores from your last 10 quizzes (out of 5)</p>
          </div>
          <div className="card-body flex-1 min-h-[300px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="quiz" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}
                  formatter={(value: any, name: string, props: any) => [
                    `${value}/5 (${props.payload.style})`, 
                    'Score'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--brand-primary)" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--bg-surface)", stroke: "var(--brand-primary)" }}
                  activeDot={{ r: 6, fill: "var(--brand-primary)", stroke: "var(--brand-primary-light)", strokeWidth: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Subjects Studied */}
        <div className="card">
          <div className="card-header pb-2 border-none">
            <h2 className="font-display text-lg font-bold">Subjects Studied</h2>
          </div>
          <div className="card-body pt-2 flex flex-wrap gap-4">
            {mockSubjectCounts.map(sub => (
              <div key={sub.subject} className="flex-1 min-w-[120px] bg-bg-elevated rounded-lg p-4 text-center border border-border-default">
                <div className="text-2xl font-display font-bold text-text-primary mb-1">{sub.count}</div>
                <div className="text-xs text-text-secondary font-medium tracking-wide uppercase">{sub.subject}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Topics to Revisit */}
        <div className="card border-error/50">
          <div className="card-header pb-2 border-none">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error inline-block"></span>
              Topics to Revisit
            </h2>
            <p className="text-sm text-text-muted mt-1">Topics where you scored below 3/5</p>
          </div>
          <div className="card-body pt-2 flex flex-col gap-3">
            {mockTopicsToRevisit.map(topic => (
              <div key={topic.topic} className="flex items-center justify-between p-3 bg-error-subtle/50 rounded-lg border border-error/20">
                <span className="font-medium text-text-primary">{topic.topic}</span>
                <div className="flex items-center gap-2">
                  <span className="text-error font-bold flex items-center gap-1">
                    <ArrowDownRight size={16} />
                    {topic.score}/5
                  </span>
                  <button className="btn btn-secondary btn-sm !bg-bg-surface hover:!border-brand-primary">Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>

    </div>
  );
}
