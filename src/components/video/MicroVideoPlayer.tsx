"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Volume2, VolumeX, Play as PlayIcon, Pause, RotateCcw,
  FastForward, Loader2, Captions, CaptionsOff
} from "lucide-react";
import { getBestVoice } from "@/lib/video/TTSUtils";
import { CaptionDisplay } from "../practice/video/CaptionDisplay";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FlowNode { id: string; label: string; }
interface FlowEdge { from: string; to: string; label: string; }
interface MicroLesson {
  topic: string;
  subject: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  segments: Segment[];
  quiz?: { question: string; choices: string[]; correctIdx: number; }[];
}
type Segment = HookSeg | ConceptSeg | InteractiveSeg | InsightSeg | ClosingSeg;
interface HookSeg { id: "hook"; durationSeconds: number; title: string; subtitle: string; emoji: string; narration: string; }
interface ConceptSeg { id: "concept"; durationSeconds: number; heading: string; body: string; keywords: string[]; icon: string; narration: string; }
interface InteractiveSeg { id: "interactive"; durationSeconds: number; interactiveType: "fill-blank" | "quick-question" | "flow-diagram"; prompt: string; fillBlank: { sentence: string; answer: string } | null; quickQuestion: { question: string; choices: string[]; correctIdx: number } | null; flowDiagram: { nodes: FlowNode[]; edges: FlowEdge[] } | null; narration: string; }
interface InsightSeg { id: "insight"; durationSeconds: number; heading: string; takeaway: string; supportingPoints: string[]; narration: string; }
interface ClosingSeg { id: "closing"; durationSeconds: number; mainConcept: string; tagline: string; emoji: string; narration: string; }
interface Props {
  lesson: MicroLesson;
  onComplete?: () => void;
  onQuizComplete?: (score: number, total: number) => void;
  learningStyle?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 1280, H = 720;

const SEGMENT_META: Record<string, { label: string; color: string }> = {
  hook: { label: "Hook", color: "#7c6cff" },
  concept: { label: "Concept", color: "#06d6a0" },
  interactive: { label: "Interactive", color: "#f97316" },
  insight: { label: "Insight", color: "#3b82f6" },
  closing: { label: "Closing", color: "#a855f7" },
};

export function MicroVideoPlayer({ lesson, onComplete, onQuizComplete, learningStyle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number>(0);
  const pauseRef = useRef<number>(0);
  const segIdxRef = useRef(0);
  const lastSpokenIdxRef = useRef<number>(-1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [segIdx, setSegIdx] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const totalMs = lesson.segments.reduce((a, s) => a + (Number(s.durationSeconds) || 0) * 1000, 0) || 30000;
  const p1 = lesson.primaryColor || "#7c6cff";
  const p2 = lesson.secondaryColor || "#06d6a0";
  const acc = lesson.accentColor || "#ffd166";

  // ─── Voice ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      setSelectedVoice(
        all.find(v =>
          (v.name.includes("Google") || v.name.includes("Natural")) &&
          (v.name.includes("Female") || v.name.includes("Zira") ||
            v.name.includes("Samantha") || v.name.includes("Google US English"))
        ) || all[0] || null
      );
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis)
      window.speechSynthesis.cancel();
  }, []);

  const speakSegment = useCallback((index: number) => {
    if (isMuted || typeof window === "undefined" || !window.speechSynthesis) return;
    stopSpeech();
    const seg = lesson.segments[index];
    if (!seg) return;
    let text = seg.narration || "";
    if (!text) {
      if (seg.id === "concept") text = (seg as ConceptSeg).heading + ". " + (seg as ConceptSeg).body;
      else if (seg.id === "insight") text = (seg as InsightSeg).heading + ". " + (seg as InsightSeg).takeaway;
      else if (seg.id === "hook") text = (seg as HookSeg).title + ". " + (seg as HookSeg).subtitle;
      else if (seg.id === "interactive") text = (seg as InteractiveSeg).prompt;
      else if (seg.id === "closing") text = (seg as ClosingSeg).mainConcept + ". " + (seg as ClosingSeg).tagline;
    }
    if (!text) return;
    const utt = new SpeechSynthesisUtterance(text.replace(/([.?!])\s*/g, "$1 ... "));
    utt.voice = selectedVoice;
    utt.rate = 0.95 * playbackRate;
    utt.pitch = 1;
    utt.volume = 1;
    (window as any)._currentMicroUtterance = utt;
    window.speechSynthesis.speak(utt);
  }, [lesson.segments, selectedVoice, playbackRate, isMuted, stopSpeech]);

  useEffect(() => { if (!isPlaying) stopSpeech(); }, [isPlaying, stopSpeech]);
  useEffect(() => {
    if (isMuted) stopSpeech();
    else if (isPlaying && lastSpokenIdxRef.current !== -1) speakSegment(lastSpokenIdxRef.current);
  }, [isMuted, isPlaying, stopSpeech, speakSegment]);

  // ─── Canvas Helpers ───────────────────────────────────────────────────────
  const bg = "#ffffff", s2 = "#f3f4f6";
  const wh = "#111827", mu = "#6b7280", mu2 = "#4b5563";

  const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const slideIn = (t: number, delay: number, dur = 0.5) => easeOut(clamp((t - delay) / dur, 0, 1));

  const hex2rgba = (hex: string, a: number) => {
    if (!hex || typeof hex !== "string") return `rgba(0,0,0,${a})`;
    const h = hex.startsWith("#") ? hex.slice(1) : hex;
    let r = 0, g = 0, b = 0;
    if (h.length === 3) { r = parseInt(h[0] + h[0], 16); g = parseInt(h[1] + h[1], 16); b = parseInt(h[2] + h[2], 16); }
    else if (h.length === 6) { r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16); }
    if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(128,128,128,${a})`;
    return `rgba(${r},${g},${b},${a})`;
  };

  const drawRRect = useCallback((
    ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
    fill?: string, stroke?: string, sw = 1.5
  ) => {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
  }, []);

  const drawTxt = useCallback((
    ctx: CanvasRenderingContext2D, str: string, x: number, y: number,
    font: string, color: string, align: CanvasTextAlign = "left", alpha = 1
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha; ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.restore();
  }, []);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, font: string, maxW: number) => {
    ctx.font = font;
    const words = text.split(" "), lines: string[] = [];
    let cur = "";
    words.forEach(w => {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    return lines;
  };

  const clearBg = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  }, []);

  const drawDotGrid = useCallback((ctx: CanvasRenderingContext2D, a = 0.08) => {
    ctx.save();
    for (let x = 40; x < W; x += 60)
      for (let y = 40; y < H; y += 60) {
        ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(61,139,113,${a})`; ctx.fill();
      }
    ctx.restore();
  }, []);

  const radialGlow = useCallback((
    ctx: CanvasRenderingContext2D, x: number, y: number, r: number, hex: string, a = 0.12
  ) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hex2rgba(hex, a)); g.addColorStop(1, "transparent");
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }, []);

  const drawParticleBurst = (ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, color: string) => {
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2, dist = t * 150;
      const x = cx + Math.cos(angle) * dist, y = cy + Math.sin(angle) * dist;
      const a = Math.max(0, 1 - t);
      ctx.beginPath(); ctx.arc(x, y, 4 - t * 3, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.globalAlpha = a; ctx.fill(); ctx.globalAlpha = 1;
    }
  };

  // ─── Segment Renderers ────────────────────────────────────────────────────
  const renderHook = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: HookSeg) => {
    clearBg(ctx); drawDotGrid(ctx, 0.03);
    const orb1x = W / 2 + Math.sin(t * 1.2) * 120, orb2x = W / 2 - Math.sin(t * 0.9) * 100;
    radialGlow(ctx, orb1x, H / 2 - 50, 500, p1, 0.18 + Math.sin(t) * 0.03);
    radialGlow(ctx, orb2x, H / 2 + 80, 400, p2, 0.15 + Math.sin(t * 1.5) * 0.02);
    ctx.save(); ctx.translate(W / 2, H / 2);
    for (let i = 0; i < 3; i++) {
      const ringAlpha = 0.04 + Math.sin(t * 1.4 + i) * 0.02;
      ctx.beginPath(); ctx.arc(0, 0, 180 + i * 100, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${ringAlpha})`; ctx.lineWidth = 1; ctx.stroke();
      const dotAngle = t * (0.4 + i * 0.13) + i * 2.1;
      ctx.beginPath(); ctx.arc(Math.cos(dotAngle) * (180 + i * 100), Math.sin(dotAngle) * (180 + i * 100), 4, 0, Math.PI * 2);
      ctx.fillStyle = [p1, p2, acc][i]; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.restore();
    const ea = slideIn(t, 0); ctx.save(); ctx.globalAlpha = ea;
    const emojiScale = 0.7 + ea * 0.3; ctx.translate(W / 2, H / 2 - 110); ctx.scale(emojiScale, emojiScale);
    ctx.font = `${80}px serif`; ctx.textAlign = "center"; ctx.fillText(seg.emoji, 0, 0); ctx.restore();
    const ta = slideIn(t, 0.15); ctx.save(); ctx.globalAlpha = ta; ctx.translate(0, (1 - ta) * 30);
    drawTxt(ctx, seg.title, W / 2, H / 2 + 20, `bold 72px "Plus Jakarta Sans", sans-serif`, wh, "center"); ctx.restore();
    const uw = slideIn(t, 0.55, 0.45), titleW = Math.min(600, seg.title.length * 36), ulW = titleW * uw;
    const grad = ctx.createLinearGradient(W / 2 - ulW / 2, 0, W / 2 + ulW / 2, 0);
    grad.addColorStop(0, p1); grad.addColorStop(1, p2);
    ctx.fillStyle = grad; ctx.fillRect(W / 2 - ulW / 2, H / 2 + 32, ulW, 3);
    const sa = slideIn(t, 0.7);
    if (sa > 0) {
      ctx.save(); ctx.globalAlpha = sa;
      ctx.font = `500 22px "Inter", sans-serif`;
      const sw = ctx.measureText(seg.subtitle).width + 36;
      drawRRect(ctx, W / 2 - sw / 2, H / 2 + 60, sw, 40, 20, hex2rgba(p1, 0.12), hex2rgba(p1, 0.4));
      drawTxt(ctx, seg.subtitle, W / 2, H / 2 + 85, `500 21px "Inter"`, wh, "center"); ctx.restore();
    }
    drawTxt(ctx, "⚡ 30-Second Micro-Lesson", W / 2, H - 48, `400 15px "Inter"`, mu, "center", slideIn(t, 0.9));
  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, acc, wh, mu]);

  const renderConcept = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: ConceptSeg) => {
    clearBg(ctx); drawDotGrid(ctx, 0.02); radialGlow(ctx, 160, H / 2, 450, p1, 0.08);
    drawRRect(ctx, 56, 28, 130, 30, 15, hex2rgba(p1, 0.1), hex2rgba(p1, 0.35));
    drawTxt(ctx, "CONCEPT", 64, 48, `700 11px "Inter"`, p1, "left", slideIn(t, 0));
    const ha = slideIn(t, 0.1); ctx.save(); ctx.globalAlpha = ha; ctx.translate((1 - ha) * -30, 0);
    drawTxt(ctx, seg.heading, 56, 140, `bold 58px "Plus Jakarta Sans", sans-serif`, wh, "left"); ctx.restore();
    const uw = slideIn(t, 0.5, 0.5);
    const ulGrad = ctx.createLinearGradient(56, 0, 56 + 420 * uw, 0);
    ulGrad.addColorStop(0, p1); ulGrad.addColorStop(1, p2);
    ctx.fillStyle = ulGrad; ctx.fillRect(56, 156, 420 * uw, 3);
    const lines = wrapText(ctx, seg.body, `400 26px "Inter"`, 900);
    lines.forEach((line, i) => {
      const ba = slideIn(t, 0.6 + i * 0.12); ctx.save(); ctx.globalAlpha = ba; ctx.translate((1 - ba) * -18, 0);
      drawTxt(ctx, line, 56, 222 + i * 44, `400 26px "Inter"`, i === 0 ? wh : mu2); ctx.restore();
    });
    const chipY = 420;
    seg.keywords?.forEach((kw, i) => {
      const ka = slideIn(t, 0.9 + i * 0.15); ctx.save(); ctx.globalAlpha = ka;
      ctx.font = `600 17px "Inter"`;
      const kw_w = ctx.measureText(kw).width + 28;
      const chipX = 56 + [0, 0, 0].slice(0, i).reduce((acc2, _, j) => {
        ctx.font = `600 17px "Inter"`; return acc2 + ctx.measureText(seg.keywords[j]).width + 28 + 12;
      }, 0);
      const chipColors = [p1, p2, acc];
      drawRRect(ctx, chipX, chipY, kw_w, 34, 17, hex2rgba(chipColors[i % 3], 0.1), hex2rgba(chipColors[i % 3], 0.4));
      drawTxt(ctx, kw, chipX + 14, chipY + 22, `600 17px "Inter"`, chipColors[i % 3], "left");
      if (ka > 0.8) { const shimmer = Math.sin(t * 4 + i) * 0.5 + 0.5; ctx.globalAlpha = shimmer * 0.2; drawRRect(ctx, chipX, chipY, kw_w, 34, 17, chipColors[i % 3]); }
      ctx.restore();
    });
    const ia = slideIn(t, 0.4); ctx.save(); ctx.globalAlpha = ia;
    const iconScale = 0.7 + ia * 0.3; ctx.translate(W - 220, H / 2 + 20); ctx.scale(iconScale, iconScale);
    ctx.font = `140px serif`; ctx.textAlign = "center"; ctx.fillText(seg.icon || "📖", 0, 0); ctx.restore();
  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, acc, wh, mu2]);

  const renderInteractive = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: InteractiveSeg) => {
    clearBg(ctx); drawDotGrid(ctx, 0.018); radialGlow(ctx, W / 2, H / 2, 600, p2, 0.07);
    drawRRect(ctx, 56, 28, 200, 30, 15, hex2rgba(p2, 0.1), hex2rgba(p2, 0.35));
    drawTxt(ctx, "✦ INTERACTIVE", 64, 48, `700 11px "Inter"`, p2, "left", slideIn(t, 0));
    const pa = slideIn(t, 0.1); ctx.save(); ctx.globalAlpha = pa;
    drawTxt(ctx, seg.prompt, W / 2, 110, `600 28px "Inter", sans-serif`, wh, "center"); ctx.restore();
    if (seg.interactiveType === "fill-blank" && seg.fillBlank) renderFillBlank(ctx, t, seg.fillBlank);
    else if (seg.interactiveType === "quick-question" && seg.quickQuestion) renderQuickQuestion(ctx, t, seg.quickQuestion);
    else if (seg.interactiveType === "flow-diagram" && seg.flowDiagram) renderFlowDiagram(ctx, t, seg.flowDiagram);
  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p2, wh]);

  const renderFillBlank = (ctx: CanvasRenderingContext2D, t: number, fb: { sentence: string; answer: string }) => {
    const revealAt = 5.5, revealed = t > revealAt, revealProgress = clamp((t - revealAt) / 1.2, 0, 1);
    const parts = fb.sentence.split("[BLANK]"), before = parts[0] || "", after = parts[1] || "";
    ctx.font = `600 32px "Inter", sans-serif`;
    const beforeW = ctx.measureText(before).width, answerW = ctx.measureText(fb.answer).width;
    const totalW = beforeW + answerW + 60 + ctx.measureText(after).width;
    const startX = W / 2 - totalW / 2, y = H / 2 - 20;
    const sa = slideIn(t, 0.3); ctx.save(); ctx.globalAlpha = sa;
    drawTxt(ctx, before, startX, y, `600 32px "Inter"`, wh);
    const blankX = startX + beforeW + 10, blankW = answerW + 40;
    drawRRect(ctx, blankX, y - 40, blankW, 52, 10, revealed ? hex2rgba(p2, 0.18) : hex2rgba(p1, 0.08), revealed ? hex2rgba(p2, 0.6) : hex2rgba(p1, 0.25), revealed ? 2 : 1.5);
    if (revealed) {
      const chars = Math.floor(fb.answer.length * easeInOut(revealProgress));
      drawTxt(ctx, fb.answer.substring(0, chars), blankX + 20, y, `700 32px "Inter"`, p2, "left");
      if (revealProgress < 0.5) drawParticleBurst(ctx, blankX + blankW / 2, y - 14, revealProgress * 2, p2);
      ctx.globalAlpha = sa * (1 - revealProgress * 0.5); radialGlow(ctx, blankX + blankW / 2, y, 80, p2, 0.25);
    } else {
      const dashes = "_ ".repeat(Math.floor(fb.answer.length * 0.7)).trim();
      drawTxt(ctx, dashes, blankX + 10, y, `400 28px "Inter"`, hex2rgba(p1, Math.sin(t * 3) * 0.3 + 0.7), "left");
    }
    drawTxt(ctx, after, blankX + blankW + 10, y, `600 32px "Inter"`, wh); ctx.restore();
    if (!revealed) drawTxt(ctx, `Reveal in ${Math.max(0, Math.ceil(revealAt - t))}s…`, W / 2, H / 2 + 80, `400 18px "Inter"`, mu, "center", slideIn(t, 1.5));
    else { const ca = slideIn(t, revealAt + 0.3); drawRRect(ctx, W / 2 - 130, H / 2 + 60, 260, 48, 24, hex2rgba(p2, 0.1), hex2rgba(p2, 0.4)); drawTxt(ctx, "✓  Correct!", W / 2, H / 2 + 90, `700 20px "Inter"`, p2, "center", ca); }
  };

  const renderQuickQuestion = (ctx: CanvasRenderingContext2D, t: number, qq: { question: string; choices: string[]; correctIdx: number }) => {
    const revealAt = 5, revealed = t > revealAt;
    const qa = slideIn(t, 0.2); ctx.save(); ctx.globalAlpha = qa;
    drawRRect(ctx, 120, 155, W - 240, 100, 18, hex2rgba(p1, 0.06), hex2rgba(p1, 0.2));
    const qLines = wrapText(ctx, qq.question, `600 26px "Inter"`, W - 320);
    qLines.forEach((l, i) => drawTxt(ctx, l, W / 2, 210 + i * 38, `600 26px "Inter"`, wh, "center"));
    ctx.restore();
    qq.choices.forEach((choice, i) => {
      const ca = slideIn(t, 0.5 + i * 0.18), cardY = 300 + i * 110, isCorrect = i === qq.correctIdx;
      ctx.save(); ctx.globalAlpha = ca;
      const cardColor = revealed ? (isCorrect ? p2 : "#ef4444") : p1;
      drawRRect(ctx, 160, cardY, W - 320, 80, 16, revealed && isCorrect ? hex2rgba(p2, 0.12) : hex2rgba(p1, 0.04), hex2rgba(cardColor, revealed ? 0.7 : 0.2), 2);
      drawRRect(ctx, 180, cardY + 20, 40, 40, 8, hex2rgba(cardColor, 0.15), hex2rgba(cardColor, 0.4));
      drawTxt(ctx, ["A", "B"][i], 200, cardY + 46, `700 18px "Inter"`, cardColor, "center");
      drawTxt(ctx, choice, 238, cardY + 46, `500 24px "Inter"`, wh);
      if (revealed) drawTxt(ctx, isCorrect ? "✓" : "✗", W - 200, cardY + 46, `700 28px "Inter"`, cardColor, "center", slideIn(t, revealAt + 0.3));
      ctx.restore();
    });
    if (!revealed) drawTxt(ctx, "Answer reveals soon…", W / 2, H - 80, `400 17px "Inter"`, mu, "center", slideIn(t, 1.0));
  };

  const renderFlowDiagram = (ctx: CanvasRenderingContext2D, t: number, fd: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    const n = fd.nodes.length, nodeW = 200, nodeH = 60, spacingX = (W - 160) / n, nodeY = H / 2 - nodeH / 2;
    const positions: Record<string, { x: number; y: number }> = {};
    fd.nodes.forEach((node, i) => { positions[node.id] = { x: 80 + spacingX * i + spacingX / 2 - nodeW / 2, y: nodeY }; });
    fd.edges.forEach((edge, i) => {
      const ea = slideIn(t, 0.2 + i * 0.2), from = positions[edge.from], to = positions[edge.to];
      if (!from || !to) return;
      const x1 = from.x + nodeW, y1 = from.y + nodeH / 2, x2 = to.x, y2 = to.y + nodeH / 2, lineLen = x2 - x1;
      const animLen = lineLen * easeOut(clamp((t - 0.2 - i * 0.2) / 0.4, 0, 1));
      ctx.save(); ctx.globalAlpha = ea;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + animLen, y1);
      ctx.strokeStyle = p1; ctx.lineWidth = 2.5; ctx.stroke();
      if (animLen > lineLen * 0.85) { ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 12, y2 - 8); ctx.lineTo(x2 - 12, y2 + 8); ctx.closePath(); ctx.fillStyle = p1; ctx.fill(); }
      if (edge.label && animLen > lineLen * 0.5) { const midX = x1 + lineLen / 2; drawRRect(ctx, midX - 45, y1 - 28, 90, 22, 11, hex2rgba(mu, 0.4)); drawTxt(ctx, edge.label, midX, y1 - 12, `400 12px "Inter"`, mu2, "center", slideIn(t, 0.4 + i * 0.2)); }
      ctx.restore();
    });
    fd.nodes.forEach((node, i) => {
      const na = slideIn(t, 0.1 + i * 0.18), pos = positions[node.id]; if (!pos) return;
      ctx.save(); ctx.globalAlpha = na;
      const nodeColor = i === 0 ? p1 : i === fd.nodes.length - 1 ? p2 : acc;
      radialGlow(ctx, pos.x + nodeW / 2, pos.y + nodeH / 2, 80, nodeColor, 0.12);
      drawRRect(ctx, pos.x, pos.y, nodeW, nodeH, 14, hex2rgba(nodeColor, 0.12), hex2rgba(nodeColor, 0.5), 2);
      const ll = node.label.length > 18 ? [node.label.substring(0, 18), node.label.substring(18)] : [node.label];
      if (ll.length === 1) drawTxt(ctx, node.label, pos.x + nodeW / 2, pos.y + 38, `600 17px "Inter"`, wh, "center");
      else { drawTxt(ctx, ll[0], pos.x + nodeW / 2, pos.y + 26, `600 15px "Inter"`, wh, "center"); drawTxt(ctx, ll[1], pos.x + nodeW / 2, pos.y + 46, `600 15px "Inter"`, wh, "center"); }
      ctx.restore();
    });
    fd.nodes.forEach((node, i) => { const na = slideIn(t, 0.3 + i * 0.18), pos = positions[node.id]; if (!pos) return; drawTxt(ctx, `Step ${i + 1}`, pos.x + nodeW / 2, nodeY + nodeH + 32, `500 13px "Inter"`, mu, "center", na); });
    drawTxt(ctx, "Process Flow", W / 2, 90, `700 13px "Inter"`, p2, "center", slideIn(t, 0.8));
  };

  const renderInsight = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: InsightSeg) => {
    clearBg(ctx); drawDotGrid(ctx, 0.02); radialGlow(ctx, W / 2, H / 2, 700, acc, 0.07); radialGlow(ctx, W * 0.8, H * 0.2, 300, p1, 0.05);
    drawRRect(ctx, 56, 28, 160, 30, 15, hex2rgba(acc, 0.1), hex2rgba(acc, 0.4));
    drawTxt(ctx, "KEY INSIGHT", 64, 48, `700 11px "Inter"`, acc, "left", slideIn(t, 0));
    const ha = slideIn(t, 0.1); ctx.save(); ctx.globalAlpha = ha; ctx.translate(0, (1 - ha) * 25);
    drawTxt(ctx, seg.heading, W / 2, 145, `bold 56px "Plus Jakarta Sans", sans-serif`, wh, "center"); ctx.restore();
    const ta = slideIn(t, 0.4); ctx.save(); ctx.globalAlpha = ta;
    const shimmer = Math.sin(t * 2) * 0.04;
    drawRRect(ctx, 100, 200, W - 200, 130, 20, hex2rgba(acc, 0.06 + shimmer), hex2rgba(acc, 0.3 + shimmer * 2), 2);
    ctx.fillStyle = acc; ctx.fillRect(100, 200, 5, 130);
    drawTxt(ctx, "★", 140, 260, `28px serif`, acc, "left");
    const takeaway = wrapText(ctx, seg.takeaway, `500 26px "Inter"`, 1000);
    takeaway.forEach((l, i) => drawTxt(ctx, l, 180, 242 + i * 40, `500 26px "Inter"`, wh));
    ctx.restore();
    seg.supportingPoints?.forEach((pt, i) => {
      const pa = slideIn(t, 0.65 + i * 0.25); ctx.save(); ctx.globalAlpha = pa;
      ctx.translate((1 - easeOut(clamp((t - 0.65 - i * 0.25) / 0.4, 0, 1))) * -40, 0);
      const ptY = 365 + i * 80;
      drawRRect(ctx, 100, ptY - 32, W - 200, 60, 12, hex2rgba(wh, 0.02), hex2rgba(wh, 0.06));
      drawRRect(ctx, 100, ptY - 32, 5, 60, 3, [p1, p2][i % 2]);
      drawTxt(ctx, `${String(i + 1).padStart(2, "0")}`, 124, ptY + 6, `700 18px "Plus Jakarta Sans"`, [p1, p2][i % 2]);
      drawTxt(ctx, pt, 162, ptY + 6, `400 22px "Inter"`, wh); ctx.restore();
    });
  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, acc, wh, mu]);

  const renderClosing = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: ClosingSeg) => {
    clearBg(ctx); drawDotGrid(ctx, 0.025);
    radialGlow(ctx, W / 2, H / 2, 600, p1, 0.12 + Math.sin(t * 1.8) * 0.03);
    radialGlow(ctx, W / 2, H / 2, 300, p2, 0.10 + Math.sin(t * 2.1) * 0.02);
    if (t < 1.5) { drawParticleBurst(ctx, W / 2, H / 2, t / 1.5, p1); drawParticleBurst(ctx, W / 2, H / 2, t / 1.5, p2); }
    ctx.save(); ctx.translate(W / 2, H / 2);
    for (let i = 0; i < 4; i++) { const ringA = 0.04 + Math.sin(t * 1.2 + i * 0.8) * 0.02; ctx.beginPath(); ctx.arc(0, 0, 120 + i * 80, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255,255,255,${ringA})`; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore();
    const ca = slideIn(t, 0.1); ctx.save(); ctx.globalAlpha = ca;
    const glowGrad = ctx.createRadialGradient(W / 2, H / 2 - 80, 0, W / 2, H / 2 - 80, 80);
    glowGrad.addColorStop(0, hex2rgba(p2, 0.3)); glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad; ctx.beginPath(); ctx.arc(W / 2, H / 2 - 80, 80, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W / 2, H / 2 - 80, 52, 0, Math.PI * 2); ctx.strokeStyle = p2; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); ctx.translate(W / 2 - 22, H / 2 - 96); ctx.strokeStyle = p2; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(4, 20); ctx.lineTo(16, 32); ctx.lineTo(40, 8); ctx.stroke(); ctx.restore();
    ctx.restore();
    const ma = slideIn(t, 0.3); ctx.save(); ctx.globalAlpha = ma;
    drawTxt(ctx, seg.mainConcept, W / 2, H / 2 + 38, `bold 54px "Plus Jakarta Sans", sans-serif`, wh, "center"); ctx.restore();
    const taA = slideIn(t, 0.55); ctx.save(); ctx.globalAlpha = taA;
    ctx.font = `500 22px "Inter"`; const tagW = ctx.measureText(seg.tagline).width + 36;
    drawRRect(ctx, W / 2 - tagW / 2, H / 2 + 62, tagW, 40, 20, hex2rgba(p1, 0.08), hex2rgba(p1, 0.3));
    drawTxt(ctx, seg.tagline, W / 2, H / 2 + 87, `500 20px "Inter"`, mu2, "center"); ctx.restore();
    const ea = slideIn(t, 0.2), shake = t < 0.8 ? Math.sin(t * 30) * 3 : 0;
    ctx.save(); ctx.globalAlpha = ea; ctx.translate(W / 2 + shake, H / 2 - 80); ctx.font = "44px serif"; ctx.textAlign = "center"; ctx.fillText(seg.emoji, 110, 0); ctx.restore();
    drawTxt(ctx, "Micro-Lesson Complete  ✓", W / 2, H - 48, `600 16px "Inter"`, p2, "center", slideIn(t, 0.8));
  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, wh, mu2]);

  const renderSegment = useCallback((ctx: CanvasRenderingContext2D, seg: Segment, localT: number) => {
    switch (seg.id) {
      case "hook": renderHook(ctx, localT, seg); break;
      case "concept": renderConcept(ctx, localT, seg); break;
      case "interactive": renderInteractive(ctx, localT, seg); break;
      case "insight": renderInsight(ctx, localT, seg); break;
      case "closing": renderClosing(ctx, localT, seg); break;
    }
  }, [renderHook, renderConcept, renderInteractive, renderInsight, renderClosing]);

  // ─── Animation Loop ────────────────────────────────────────────────────────
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    if (!startRef.current) startRef.current = time - pauseRef.current;
    const el = time - startRef.current;
    if (el >= totalMs) {
      setElapsed(totalMs); setIsPlaying(false); pauseRef.current = totalMs;
      const last = lesson.segments[lesson.segments.length - 1];
      renderSegment(ctx, last, last.durationSeconds);
      onComplete?.();
      return;
    }
    setElapsed(el);
    let acc2 = 0, foundIdx = 0;
    for (let i = 0; i < lesson.segments.length; i++) {
      if (el < acc2 + lesson.segments[i].durationSeconds * 1000) { foundIdx = i; break; }
      acc2 += lesson.segments[i].durationSeconds * 1000;
    }
    if (foundIdx !== segIdxRef.current) { segIdxRef.current = foundIdx; setSegIdx(foundIdx); }
    if (foundIdx !== lastSpokenIdxRef.current) { lastSpokenIdxRef.current = foundIdx; speakSegment(foundIdx); }
    renderSegment(ctx, lesson.segments[foundIdx], (el - acc2) / 1000);
    rafRef.current = requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, totalMs, onComplete, renderSegment]);

  useEffect(() => {
    if (isPlaying) {
      if (elapsed === 0) startRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && lesson.segments[0]) {
      const ctx = canvas.getContext("2d");
      if (ctx) renderSegment(ctx, lesson.segments[0], 0);
    }
    setElapsed(0); setSegIdx(0);
    startRef.current = 0; pauseRef.current = 0; lastSpokenIdxRef.current = -1;
  }, [lesson, renderSegment]);

  // ─── Controls ─────────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (isPlaying) { pauseRef.current = elapsed; setIsPlaying(false); }
    else {
      if (isAudioLoading) return;
      if (elapsed >= totalMs) { pauseRef.current = 0; setElapsed(0); lastSpokenIdxRef.current = -1; }
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    pauseRef.current = 0; setElapsed(0); lastSpokenIdxRef.current = -1;
    stopSpeech(); setIsPlaying(true);
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const target = pct * totalMs;
    pauseRef.current = target; setElapsed(target); startRef.current = 0; lastSpokenIdxRef.current = -1;
    stopSpeech();
    let acc2 = 0, idx = 0;
    for (let i = 0; i < lesson.segments.length; i++) {
      if (target < acc2 + lesson.segments[i].durationSeconds * 1000) { idx = i; break; }
      acc2 += lesson.segments[i].durationSeconds * 1000;
    }
    setSegIdx(idx);
    const canvas = canvasRef.current;
    if (canvas) { const ctx = canvas.getContext("2d"); if (ctx) renderSegment(ctx, lesson.segments[idx], (target - acc2) / 1000); }
  };

  const fmtTime = (ms: number) => { if (isNaN(ms)) return "0s"; return `${Math.floor(ms / 1000)}s`; };
  const elapsedPct = totalMs > 0 ? (elapsed / totalMs) * 100 : 0;

  let cumMs = 0;
  const segMarks = lesson.segments.map((s, i) => { const pct = (cumMs / totalMs) * 100; cumMs += s.durationSeconds * 1000; return { pct, seg: s, color: SEGMENT_META[s.id]?.color || "#888" }; });

  const currentSegMeta = SEGMENT_META[lesson.segments[segIdx]?.id] || { label: "", color: p1 };

  return (
    <div className="micro-player" style={{ position: "relative", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", width: "100%", display: "flex", flexDirection: "column", gap: 0, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Video Frame ── */}
      <div style={{
        position: "relative", width: "100%", aspectRatio: "16/9",
        borderRadius: "20px 20px 0 0", overflow: "hidden",
        background: "#0a0a0f",
        boxShadow: "0 2px 0 rgba(255,255,255,0.06) inset, 0 -1px 0 rgba(0,0,0,0.5) inset",
      }}>
        {/* Loading overlay */}
        {isAudioLoading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,10,15,0.75)", zIndex: 100, backdropFilter: "blur(8px)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Loader2 className="animate-spin" size={44} color={p1} />
              <span style={{ fontWeight: 600, color: "#fff", fontSize: 14, letterSpacing: "0.04em" }}>Preparing narration…</span>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef} width={W} height={H}
          style={{ width: "100%", height: "100%", objectFit: "contain", cursor: "pointer", display: "block", background: s2 }}
          onClick={handlePlayPause}
        />

        {/* Captions */}
        {showCaptions && (
          <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", justifyContent: "center", padding: "0 40px", pointerEvents: "none", zIndex: 10 }}>
            <CaptionDisplay caption={lesson.segments[segIdx]?.narration || ""} isVisible={isPlaying} />
          </div>
        )}

        {/* Pause overlay */}
        {!isPlaying && elapsed < totalMs && (
          <div onClick={handlePlayPause} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 20 }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(12px)", color: "#fff", transition: "transform 0.2s", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
            >
              <PlayIcon fill="currentColor" size={30} style={{ marginLeft: 4 }} />
            </div>
          </div>
        )}

        {/* Top-right segment badge */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(8,8,14,0.65)", backdropFilter: "blur(10px)",
          border: `1px solid ${currentSegMeta.color}33`,
          borderRadius: 10, padding: "5px 12px",
          fontSize: 11, fontWeight: 700, color: currentSegMeta.color,
          textTransform: "uppercase", letterSpacing: "0.1em", zIndex: 30,
          display: "flex", alignItems: "center", gap: 6
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: currentSegMeta.color, display: "inline-block", boxShadow: `0 0 6px ${currentSegMeta.color}` }} />
          {currentSegMeta.label}
        </div>

        {/* Top-left topic pill */}
        <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(8,8,14,0.55)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "5px 12px", fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em", zIndex: 30 }}>
          {lesson.subject}
        </div>

        {/* Thin progress line at bottom of canvas */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)", zIndex: 25 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${elapsedPct}%`, background: `linear-gradient(90deg, ${p1}, ${p2})`, transition: isPlaying ? "none" : "width 0.1s ease-out" }} />
        </div>
      </div>

      {/* ── Controls Shell ── */}
      <div style={{
        background: "rgba(13,13,20,0.97)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderTop: "none",
        borderRadius: "0 0 20px 20px",
        padding: "14px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      }}>

        {/* ── Seek Row ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Play / Restart */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <button onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"} style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${p1}, ${p2})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, transition: "transform 0.15s, opacity 0.15s", boxShadow: `0 4px 14px ${p1}55` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
            >
              {isPlaying ? <Pause size={15} fill="currentColor" /> : <PlayIcon size={15} fill="currentColor" style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={handleRestart} title="Restart" style={{ width: 30, height: 30, borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.45)", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Seek bar */}
          <div style={{ flex: 1, position: "relative", height: 36, display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={handleScrub}
            onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setHoverPct(((e.clientX - r.left) / r.width) * 100); }}
            onMouseLeave={() => setHoverPct(null)}
          >
            {/* Track */}
            <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
              {/* Filled */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${elapsedPct}%`, background: `linear-gradient(90deg, ${p1}, ${p2})`, borderRadius: 8, transition: isPlaying ? "none" : "width 0.1s" }} />
              {/* Hover preview */}
              {hoverPct !== null && (
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${hoverPct}%`, background: "rgba(255,255,255,0.12)", borderRadius: 8 }} />
              )}
            </div>

            {/* Segment markers */}
            {segMarks.slice(1).map((m, i) => (
              <div key={i} title={SEGMENT_META[m.seg.id]?.label} style={{ position: "absolute", left: `${m.pct}%`, top: "50%", transform: "translate(-50%,-50%)", width: 3, height: 10, borderRadius: 2, background: m.color, opacity: 0.7, zIndex: 2 }} />
            ))}

            {/* Thumb */}
            <div style={{ position: "absolute", left: `${elapsedPct}%`, top: "50%", transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: `0 0 0 3px ${p1}66`, zIndex: 3, transition: isPlaying ? "none" : "left 0.1s", pointerEvents: "none" }} />

            {/* Hover tooltip */}
            {hoverPct !== null && (
              <div style={{ position: "absolute", left: `${hoverPct}%`, bottom: 22, transform: "translateX(-50%)", background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "2px 7px", fontSize: 11, color: "rgba(255,255,255,0.8)", pointerEvents: "none", whiteSpace: "nowrap" }}>
                {fmtTime(hoverPct / 100 * totalMs)}
              </div>
            )}
          </div>

          {/* Time */}
          <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
            <span style={{ color: "rgba(255,255,255,0.75)" }}>{fmtTime(elapsed)}</span>
            <span style={{ margin: "0 3px", opacity: 0.3 }}>/</span>
            {fmtTime(totalMs)}
          </div>
        </div>

        {/* ── Controls Row ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Segment pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {lesson.segments.map((s, i) => {
              const meta = SEGMENT_META[s.id] || { label: s.id, color: "#888" };
              const active = segIdx === i;
              return (
                <div key={i} style={{ padding: "3px 9px", borderRadius: 7, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", background: active ? `${meta.color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${active ? meta.color + "40" : "rgba(255,255,255,0.07)"}`, color: active ? meta.color : "rgba(255,255,255,0.25)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
                  {active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color, display: "inline-block", boxShadow: `0 0 5px ${meta.color}` }} />}
                  {meta.label}
                  <span style={{ opacity: 0.5 }}>·{s.durationSeconds}s</span>
                </div>
              );
            })}
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Volume */}
            <button onClick={() => setIsMuted(!isMuted)} title={isMuted ? "Unmute" : "Mute"} style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isMuted ? "#ef4444" : "rgba(255,255,255,0.5)", transition: "all 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />

            {/* Speed */}
            <button
              onClick={() => { const rates = [0.75, 1, 1.25, 1.5]; const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length]; setPlaybackRate(next); }}
              style={{ height: 28, padding: "0 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
            >
              <FastForward size={11} />{playbackRate}×
            </button>

            {/* CC */}
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              title="Toggle Captions"
              style={{ height: 28, padding: "0 10px", borderRadius: 8, background: showCaptions ? `${p1}22` : "rgba(255,255,255,0.05)", border: `1px solid ${showCaptions ? p1 + "55" : "rgba(255,255,255,0.1)"}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: showCaptions ? p1 : "rgba(255,255,255,0.35)", transition: "all 0.2s" }}
            >
              {showCaptions ? <Captions size={13} /> : <CaptionsOff size={13} />}
              CC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}