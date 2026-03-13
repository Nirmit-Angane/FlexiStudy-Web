"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

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
}
type Segment =
  | HookSeg | ConceptSeg | InteractiveSeg | InsightSeg | ClosingSeg;

interface HookSeg {
  id: "hook"; durationSeconds: number;
  title: string; subtitle: string; emoji: string;
}
interface ConceptSeg {
  id: "concept"; durationSeconds: number;
  heading: string; body: string; keywords: string[]; icon: string;
}
interface InteractiveSeg {
  id: "interactive"; durationSeconds: number;
  interactiveType: "fill-blank" | "quick-question" | "flow-diagram";
  prompt: string;
  fillBlank: { sentence: string; answer: string } | null;
  quickQuestion: { question: string; choices: string[]; correctIdx: number } | null;
  flowDiagram: { nodes: FlowNode[]; edges: FlowEdge[] } | null;
}
interface InsightSeg {
  id: "insight"; durationSeconds: number;
  heading: string; takeaway: string; supportingPoints: string[];
}
interface ClosingSeg {
  id: "closing"; durationSeconds: number;
  mainConcept: string; tagline: string; emoji: string;
}

interface Props {
  lesson: MicroLesson;
  onComplete?: () => void;
  learningStyle?: string;
}

const STYLE_BADGE: Record<string, { icon: string; label: string }> = {
  interactive: { icon: "⚡", label: "Interactive" },
  example: { icon: "📝", label: "Example" },
  visual: { icon: "🎨", label: "Visual" },
  practical: { icon: "🔧", label: "Practical" },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 1280, H = 720;
const SEGMENT_COLORS = ["#3D8B71", "#059669", "#dc2626", "#d97706", "#2563eb"];

export function MicroVideoPlayer({ lesson, onComplete, learningStyle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number>(0);
  const pauseRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [segIdx, setSegIdx] = useState(0);
  const segIdxRef = useRef(0); // ← ref so animate closure never stales

  const totalMs = lesson.segments.reduce((a, s) => a + (Number(s.durationSeconds) || 0) * 1000, 0) || 30000;
  const p1 = lesson.primaryColor || "#7c6cff";
  const p2 = lesson.secondaryColor || "#06d6a0";
  const acc = lesson.accentColor || "#ffd166";

  // ─── PALETTE ──────────────────────────────────────────────────────────────
  const bg = "#ffffff", s1 = "#f9fafb", s2 = "#f3f4f6";
  const wh = "#111827", mu = "#6b7280", mu2 = "#4b5563";

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t: number) => t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
  const slideIn = (t: number, delay: number, dur = 0.5) =>
    easeOut(clamp((t - delay) / dur, 0, 1));

  const hex2rgba = (hex: string, a: number) => {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const drawRRect = useCallback((
    ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
    fill?: string, stroke?: string, sw = 1.5
  ) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
  }, []);

  const drawTxt = useCallback((
    ctx: CanvasRenderingContext2D, str: string, x: number, y: number,
    font: string, color: string, align: CanvasTextAlign = "left", alpha = 1
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.restore();
  }, []);

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, font: string, maxW: number) => {
    ctx.font = font;
    const words = text.split(" ");
    const lines: string[] = [];
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
    g.addColorStop(0, hex2rgba(hex, a));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g; ctx.fillRect(x-r, y-r, r*2, r*2);
  }, []);

  const drawParticleBurst = (ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, color: string) => {
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = t * 150;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const a = Math.max(0, 1 - t);
      ctx.beginPath(); ctx.arc(x, y, 4 - t * 3, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.globalAlpha = a; ctx.fill(); ctx.globalAlpha = 1;
    }
  };

  // ─── SEGMENT RENDERERS ────────────────────────────────────────────────────

  // 1. HOOK (0–3s)
  const renderHook = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: HookSeg) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.03);

    // Animated gradient orbs
    const orb1x = W/2 + Math.sin(t * 1.2) * 120;
    const orb2x = W/2 - Math.sin(t * 0.9) * 100;
    radialGlow(ctx, orb1x, H/2 - 50, 500, p1, 0.18 + Math.sin(t) * 0.03); // higher opacity for white
    radialGlow(ctx, orb2x, H/2 + 80, 400, p2, 0.15 + Math.sin(t * 1.5) * 0.02);

    // Pulsing rings
    ctx.save(); ctx.translate(W/2, H/2);
    for (let i = 0; i < 3; i++) {
      const ringAlpha = 0.04 + Math.sin(t * 1.4 + i) * 0.02;
      ctx.beginPath(); ctx.arc(0, 0, 180 + i * 100, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${ringAlpha})`; ctx.lineWidth = 1; ctx.stroke();
      const dotAngle = t * (0.4 + i * 0.13) + i * 2.1;
      ctx.beginPath(); ctx.arc(Math.cos(dotAngle)*(180+i*100), Math.sin(dotAngle)*(180+i*100), 4, 0, Math.PI*2);
      ctx.fillStyle = [p1, p2, acc][i]; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.restore();

    // Emoji pop
    const ea = slideIn(t, 0);
    ctx.save(); ctx.globalAlpha = ea;
    const emojiScale = 0.7 + ea * 0.3;
    ctx.translate(W/2, H/2 - 110);
    ctx.scale(emojiScale, emojiScale);
    ctx.font = `${80}px serif`; ctx.textAlign = "center";
    ctx.fillText(seg.emoji, 0, 0);
    ctx.restore();

    // Title
    const ta = slideIn(t, 0.15);
    ctx.save(); ctx.globalAlpha = ta; ctx.translate(0, (1-ta)*30);
    drawTxt(ctx, seg.title, W/2, H/2 + 20, `bold 72px "Plus Jakarta Sans", sans-serif`, wh, "center");
    ctx.restore();

    // Animated underline
    const uw = slideIn(t, 0.55, 0.45);
    const titleW = Math.min(600, seg.title.length * 36);
    const underlineW = titleW * uw;
    const grad = ctx.createLinearGradient(W/2 - underlineW/2, 0, W/2 + underlineW/2, 0);
    grad.addColorStop(0, p1); grad.addColorStop(1, p2);
    ctx.fillStyle = grad;
    ctx.fillRect(W/2 - underlineW/2, H/2 + 32, underlineW, 3);

    // Subtitle pill
    const sa = slideIn(t, 0.7);
    if (sa > 0) {
      ctx.save(); ctx.globalAlpha = sa;
      ctx.font = `500 22px "Inter", sans-serif`;
      const sw = ctx.measureText(seg.subtitle).width + 36;
      drawRRect(ctx, W/2 - sw/2, H/2 + 60, sw, 40, 20, hex2rgba(p1, 0.12), hex2rgba(p1, 0.4));
      drawTxt(ctx, seg.subtitle, W/2, H/2 + 85, `500 21px "Inter"`, wh, "center");
      ctx.restore();
    }

    // AI label
    const la = slideIn(t, 0.9);
    drawTxt(ctx, "⚡ 30-Second Micro-Lesson", W/2, H - 48, `400 15px "Inter"`, mu, "center", la);
  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, acc, wh, mu]);

  // 2. CONCEPT (3–10s)
  const renderConcept = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: ConceptSeg) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.02);
    radialGlow(ctx, 160, H/2, 450, p1, 0.08);

    // Label
    const la = slideIn(t, 0);
    drawRRect(ctx, 56, 28, 130, 30, 15, hex2rgba(p1, 0.1), hex2rgba(p1, 0.35));
    drawTxt(ctx, "CONCEPT", 64, 48, `700 11px "Inter"`, p1, "left", la);

    // Heading with slide
    const ha = slideIn(t, 0.1);
    ctx.save(); ctx.globalAlpha = ha; ctx.translate((1-ha)*-30, 0);
    drawTxt(ctx, seg.heading, 56, 140, `bold 58px "Plus Jakarta Sans", sans-serif`, wh, "left");
    ctx.restore();

    // Animated underline
    const uw = slideIn(t, 0.5, 0.5);
    const ulGrad = ctx.createLinearGradient(56, 0, 56 + 420*uw, 0);
    ulGrad.addColorStop(0, p1); ulGrad.addColorStop(1, p2);
    ctx.fillStyle = ulGrad; ctx.fillRect(56, 156, 420*uw, 3);

    // Body text
    const lines = wrapText(ctx, seg.body, `400 26px "Inter"`, 620);
    lines.forEach((line, i) => {
      const ba = slideIn(t, 0.6 + i * 0.12);
      ctx.save(); ctx.globalAlpha = ba; ctx.translate((1-ba)*-18, 0);
      drawTxt(ctx, line, 56, 222 + i*44, `400 26px "Inter"`, i === 0 ? wh : mu2);
      ctx.restore();
    });

    // Keywords as chips
    const chipY = 420;
    seg.keywords?.forEach((kw, i) => {
      const ka = slideIn(t, 0.9 + i * 0.15);
      ctx.save(); ctx.globalAlpha = ka;
      ctx.font = `600 17px "Inter"`;
      const kw_w = ctx.measureText(kw).width + 28;
      const chipX = 56 + [0, 0, 0].slice(0, i).reduce((acc2, _, j) => {
        ctx.font = `600 17px "Inter"`;
        return acc2 + ctx.measureText(seg.keywords[j]).width + 28 + 12;
      }, 0);
      const chipColors = [p1, p2, acc];
      drawRRect(ctx, chipX, chipY, kw_w, 34, 17, hex2rgba(chipColors[i % 3], 0.1), hex2rgba(chipColors[i % 3], 0.4));
      drawTxt(ctx, kw, chipX + 14, chipY + 22, `600 17px "Inter"`, chipColors[i % 3], "left");

      // Animated highlight shimmer
      if (ka > 0.8) {
        const shimmer = Math.sin(t * 4 + i) * 0.5 + 0.5;
        ctx.globalAlpha = shimmer * 0.2;
        drawRRect(ctx, chipX, chipY, kw_w, 34, 17, chipColors[i % 3]);
      }
      ctx.restore();
    });

    // Right icon
    const ia = slideIn(t, 0.4);
    ctx.save(); ctx.globalAlpha = ia;
    const iconScale = 0.7 + ia * 0.3;
    ctx.translate(W - 220, H/2 + 20);
    ctx.scale(iconScale, iconScale);
    ctx.font = `140px serif`; ctx.textAlign = "center"; ctx.fillText(seg.icon || "📖", 0, 0);
    ctx.restore();

  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, acc, wh, mu2]);

  // 3. INTERACTIVE (10–20s) — renders fill-blank / quick-question / flow-diagram
  const renderInteractive = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: InteractiveSeg) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.018);
    radialGlow(ctx, W/2, H/2, 600, p2, 0.07);

    // Top badge
    const ba = slideIn(t, 0);
    drawRRect(ctx, 56, 28, 200, 30, 15, hex2rgba(p2, 0.1), hex2rgba(p2, 0.35));
    drawTxt(ctx, "✦ INTERACTIVE", 64, 48, `700 11px "Inter"`, p2, "left", ba);

    // Prompt heading
    const pa = slideIn(t, 0.1);
    ctx.save(); ctx.globalAlpha = pa;
    drawTxt(ctx, seg.prompt, W/2, 110, `600 28px "Inter", sans-serif`, wh, "center");
    ctx.restore();

    if (seg.interactiveType === "fill-blank" && seg.fillBlank) {
      renderFillBlank(ctx, t, seg.fillBlank);
    } else if (seg.interactiveType === "quick-question" && seg.quickQuestion) {
      renderQuickQuestion(ctx, t, seg.quickQuestion);
    } else if (seg.interactiveType === "flow-diagram" && seg.flowDiagram) {
      renderFlowDiagram(ctx, t, seg.flowDiagram);
    }
  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, acc, wh, mu2]);

  const renderFillBlank = (
    ctx: CanvasRenderingContext2D, t: number,
    fb: { sentence: string; answer: string }
  ) => {
    const revealAt = 5.5; // seconds into the interactive segment
    const revealed = t > revealAt;
    const revealProgress = clamp((t - revealAt) / 1.2, 0, 1);

    const sentence = fb.sentence;
    const parts = sentence.split("[BLANK]");
    const before = parts[0] || "";
    const after = parts[1] || "";

    ctx.font = `600 32px "Inter", sans-serif`;
    const beforeW = ctx.measureText(before).width;
    const answerW = ctx.measureText(fb.answer).width;
    const totalW = beforeW + answerW + 60 + ctx.measureText(after).width;
    const startX = W/2 - totalW/2;
    const y = H/2 - 20;

    const sa = slideIn(t, 0.3);
    ctx.save(); ctx.globalAlpha = sa;

    // Before text
    drawTxt(ctx, before, startX, y, `600 32px "Inter"`, wh);
    // Blank box
    const blankX = startX + beforeW + 10;
    const blankW = answerW + 40;
    drawRRect(ctx, blankX, y - 40, blankW, 52, 10,
      revealed ? hex2rgba(p2, 0.18) : hex2rgba(p1, 0.08),
      revealed ? hex2rgba(p2, 0.6) : hex2rgba(p1, 0.25),
      revealed ? 2 : 1.5
    );

    if (revealed) {
      // Typewriter answer reveal
      const chars = Math.floor(fb.answer.length * easeInOut(revealProgress));
      const partial = fb.answer.substring(0, chars);
      drawTxt(ctx, partial, blankX + 20, y, `700 32px "Inter"`, p2, "left");
      // Particle burst at moment of reveal
      if (revealProgress < 0.5) {
        drawParticleBurst(ctx, blankX + blankW/2, y - 14, revealProgress * 2, p2);
      }
      // Glow
      ctx.globalAlpha = sa * (1 - revealProgress * 0.5);
      radialGlow(ctx, blankX + blankW/2, y, 80, p2, 0.25);
    } else {
      // Animated blank dashes
      const dashCount = Math.floor(fb.answer.length * 0.7);
      const dashes = "_ ".repeat(dashCount).trim();
      const pulse = Math.sin(t * 3) * 0.3 + 0.7;
      drawTxt(ctx, dashes, blankX + 10, y, `400 28px "Inter"`, hex2rgba(p1, pulse), "left");
    }

    // After text
    drawTxt(ctx, after, blankX + blankW + 10, y, `600 32px "Inter"`, wh);
    ctx.restore();

    // Hint label
    if (!revealed) {
      const ha = slideIn(t, 1.5);
      drawTxt(ctx, `Reveal in ${Math.max(0, Math.ceil(revealAt - t))}s…`, W/2, H/2 + 80, `400 18px "Inter"`, mu, "center", ha);
    } else {
      const ca = slideIn(t, revealAt + 0.3);
      drawRRect(ctx, W/2 - 130, H/2 + 60, 260, 48, 24, hex2rgba(p2, 0.1), hex2rgba(p2, 0.4));
      drawTxt(ctx, "✓  Correct!", W/2, H/2 + 90, `700 20px "Inter"`, p2, "center", ca);
    }
  };

  const renderQuickQuestion = (
    ctx: CanvasRenderingContext2D, t: number,
    qq: { question: string; choices: string[]; correctIdx: number }
  ) => {
    const revealAt = 5;
    const revealed = t > revealAt;

    // Question box
    const qa = slideIn(t, 0.2);
    ctx.save(); ctx.globalAlpha = qa;
    drawRRect(ctx, 120, 155, W-240, 100, 18, hex2rgba(p1, 0.06), hex2rgba(p1, 0.2));
    const qLines = wrapText(ctx, qq.question, `600 26px "Inter"`, W - 320);
    qLines.forEach((l, i) =>
      drawTxt(ctx, l, W/2, 210 + i*38, `600 26px "Inter"`, wh, "center")
    );
    ctx.restore();

    // Choice cards
    qq.choices.forEach((choice, i) => {
      const ca = slideIn(t, 0.5 + i * 0.18);
      const cardY = 300 + i * 110;
      const isCorrect = i === qq.correctIdx;
      const showResult = revealed;

      ctx.save(); ctx.globalAlpha = ca;
      const cardColor = showResult
        ? isCorrect ? p2 : "#ef4444"
        : p1;
      drawRRect(ctx, 160, cardY, W-320, 80, 16,
        showResult && isCorrect ? hex2rgba(p2, 0.12) : hex2rgba(p1, 0.04),
        hex2rgba(cardColor, showResult ? 0.7 : 0.2), 2
      );

      // Choice letter badge
      const letter = ["A", "B"][i];
      drawRRect(ctx, 180, cardY + 20, 40, 40, 8, hex2rgba(cardColor, 0.15), hex2rgba(cardColor, 0.4));
      drawTxt(ctx, letter, 200, cardY + 46, `700 18px "Inter"`, cardColor, "center");

      // Choice text
      drawTxt(ctx, choice, 238, cardY + 46, `500 24px "Inter"`, wh);

      // Result icon
      if (showResult) {
        const icon = isCorrect ? "✓" : "✗";
        const revA = slideIn(t, revealAt + 0.3);
        drawTxt(ctx, icon, W - 200, cardY + 46, `700 28px "Inter"`, cardColor, "center", revA);
      }
      ctx.restore();
    });

    if (!revealed) {
      const ta = slideIn(t, 1.0);
      drawTxt(ctx, `Answer reveals soon…`, W/2, H - 80, `400 17px "Inter"`, mu, "center", ta);
    }
  };

  const renderFlowDiagram = (
    ctx: CanvasRenderingContext2D, t: number,
    fd: { nodes: FlowNode[]; edges: FlowEdge[] }
  ) => {
    const n = fd.nodes.length;
    const nodeW = 200, nodeH = 60;
    const spacingX = (W - 160) / n;
    const nodeY = H / 2 - nodeH / 2;

    // Layout nodes horizontally centered
    const positions: Record<string, { x: number; y: number }> = {};
    fd.nodes.forEach((node, i) => {
      positions[node.id] = {
        x: 80 + spacingX * i + spacingX / 2 - nodeW / 2,
        y: nodeY,
      };
    });

    // Draw edges first
    fd.edges.forEach((edge, i) => {
      const ea = slideIn(t, 0.2 + i * 0.2);
      const from = positions[edge.from];
      const to = positions[edge.to];
      if (!from || !to) return;

      const x1 = from.x + nodeW, y1 = from.y + nodeH / 2;
      const x2 = to.x, y2 = to.y + nodeH / 2;

      ctx.save(); ctx.globalAlpha = ea;
      // Animated line
      const lineLen = x2 - x1;
      const animLen = lineLen * easeOut(clamp((t - 0.2 - i * 0.2) / 0.4, 0, 1));
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x1 + animLen, y1);
      ctx.strokeStyle = p1; ctx.lineWidth = 2.5; ctx.stroke();

      // Arrow head (only when line is mostly drawn)
      if (animLen > lineLen * 0.85) {
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 12, y2 - 8);
        ctx.lineTo(x2 - 12, y2 + 8);
        ctx.closePath();
        ctx.fillStyle = p1; ctx.fill();
      }

      // Edge label
      if (edge.label && animLen > lineLen * 0.5) {
        const midX = x1 + lineLen / 2;
        const la = slideIn(t, 0.4 + i * 0.2);
        drawRRect(ctx, midX - 45, y1 - 28, 90, 22, 11, hex2rgba(mu, 0.4));
        drawTxt(ctx, edge.label, midX, y1 - 12, `400 12px "Inter"`, mu2, "center", la);
      }
      ctx.restore();
    });

    // Draw nodes
    fd.nodes.forEach((node, i) => {
      const na = slideIn(t, 0.1 + i * 0.18);
      const pos = positions[node.id];
      if (!pos) return;

      ctx.save(); ctx.globalAlpha = na;
      const isFirst = i === 0, isLast = i === fd.nodes.length - 1;
      const nodeColor = isFirst ? p1 : isLast ? p2 : acc;

      // Node shadow glow
      radialGlow(ctx, pos.x + nodeW/2, pos.y + nodeH/2, 80, nodeColor, 0.12);

      // Node box
      drawRRect(ctx, pos.x, pos.y, nodeW, nodeH, 14,
        hex2rgba(nodeColor, 0.12), hex2rgba(nodeColor, 0.5), 2);

      // Node label (wrap if needed)
      const labelLines = node.label.length > 18
        ? [node.label.substring(0, 18), node.label.substring(18)]
        : [node.label];
      if (labelLines.length === 1) {
        drawTxt(ctx, node.label, pos.x + nodeW/2, pos.y + 38, `600 17px "Inter"`, wh, "center");
      } else {
        drawTxt(ctx, labelLines[0], pos.x + nodeW/2, pos.y + 26, `600 15px "Inter"`, wh, "center");
        drawTxt(ctx, labelLines[1], pos.x + nodeW/2, pos.y + 46, `600 15px "Inter"`, wh, "center");
      }
      ctx.restore();
    });

    // Number labels under nodes
    fd.nodes.forEach((node, i) => {
      const na = slideIn(t, 0.3 + i * 0.18);
      const pos = positions[node.id];
      if (!pos) return;
      drawTxt(ctx, `Step ${i + 1}`, pos.x + nodeW/2, nodeY + nodeH + 32, `500 13px "Inter"`, mu, "center", na);
    });

    // "Process Flow" label
    const la = slideIn(t, 0.8);
    drawTxt(ctx, "Process Flow", W/2, 90, `700 13px "Inter"`, p2, "center", la);
  };

  // 4. INSIGHT (20–27s)
  const renderInsight = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: InsightSeg) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.02);
    radialGlow(ctx, W/2, H/2, 700, acc, 0.07);
    radialGlow(ctx, W*0.8, H*0.2, 300, p1, 0.05);

    // Badge
    const ba = slideIn(t, 0);
    drawRRect(ctx, 56, 28, 160, 30, 15, hex2rgba(acc, 0.1), hex2rgba(acc, 0.4));
    drawTxt(ctx, "KEY INSIGHT", 64, 48, `700 11px "Inter"`, acc, "left", ba);

    // Heading
    const ha = slideIn(t, 0.1);
    ctx.save(); ctx.globalAlpha = ha; ctx.translate(0, (1-ha)*25);
    drawTxt(ctx, seg.heading, W/2, 145, `bold 56px "Plus Jakarta Sans", sans-serif`, wh, "center");
    ctx.restore();

    // Takeaway card with shimmer
    const ta = slideIn(t, 0.4);
    ctx.save(); ctx.globalAlpha = ta;
    const shimmer = Math.sin(t * 2) * 0.04;
    drawRRect(ctx, 100, 200, W-200, 130, 20,
      hex2rgba(acc, 0.06 + shimmer), hex2rgba(acc, 0.3 + shimmer * 2), 2);
    // Left accent bar
    ctx.fillStyle = acc; ctx.fillRect(100, 200, 5, 130);

    // Star icon  
    drawTxt(ctx, "★", 140, 260, `28px serif`, acc, "left");
    const takeaway = wrapText(ctx, seg.takeaway, `500 26px "Inter"`, W - 320);
    takeaway.forEach((l, i) =>
      drawTxt(ctx, l, 180, 242 + i * 40, `500 26px "Inter"`, wh)
    );
    ctx.restore();

    // Supporting points
    seg.supportingPoints?.forEach((pt, i) => {
      const pa = slideIn(t, 0.65 + i * 0.25);
      ctx.save(); ctx.globalAlpha = pa;
      ctx.translate((1 - easeOut(clamp((t - 0.65 - i*0.25)/0.4, 0, 1))) * -40, 0);
      const ptY = 365 + i * 80;
      drawRRect(ctx, 100, ptY - 32, W-200, 60, 12, hex2rgba(wh, 0.02), hex2rgba(wh, 0.06));
      drawRRect(ctx, 100, ptY - 32, 5, 60, 3, [p1, p2][i % 2]);
      drawTxt(ctx, `${String(i+1).padStart(2,"0")}`, 124, ptY + 6, `700 18px "Plus Jakarta Sans"`, [p1, p2][i % 2]);
      drawTxt(ctx, pt, 162, ptY + 6, `400 22px "Inter"`, wh);
      ctx.restore();
    });

  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, acc, wh, mu]);

  // 5. CLOSING (27–30s)
  const renderClosing = useCallback((ctx: CanvasRenderingContext2D, t: number, seg: ClosingSeg) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.025);
    radialGlow(ctx, W/2, H/2, 600, p1, 0.12 + Math.sin(t * 1.8) * 0.03);
    radialGlow(ctx, W/2, H/2, 300, p2, 0.10 + Math.sin(t * 2.1) * 0.02);

    // Completion particle burst at start
    if (t < 1.5) {
      drawParticleBurst(ctx, W/2, H/2, t / 1.5, p1);
      drawParticleBurst(ctx, W/2, H/2, t / 1.5, p2);
    }

    // Pulsing rings
    ctx.save(); ctx.translate(W/2, H/2);
    for (let i = 0; i < 4; i++) {
      const ringA = 0.04 + Math.sin(t * 1.2 + i * 0.8) * 0.02;
      ctx.beginPath(); ctx.arc(0, 0, 120 + i * 80, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${ringA})`; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();

    // Checkmark circle
    const ca = slideIn(t, 0.1);
    ctx.save(); ctx.globalAlpha = ca;
    // Outer glow ring
    const glowGrad = ctx.createRadialGradient(W/2, H/2 - 80, 0, W/2, H/2 - 80, 80);
    glowGrad.addColorStop(0, hex2rgba(p2, 0.3)); glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad; ctx.beginPath(); ctx.arc(W/2, H/2 - 80, 80, 0, Math.PI*2); ctx.fill();
    // Circle  
    ctx.beginPath(); ctx.arc(W/2, H/2 - 80, 52, 0, Math.PI*2);
    ctx.strokeStyle = p2; ctx.lineWidth = 3; ctx.stroke();
    // Checkmark
    ctx.save();
    ctx.translate(W/2 - 22, H/2 - 96);
    ctx.strokeStyle = p2; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(4, 20); ctx.lineTo(16, 32); ctx.lineTo(40, 8); ctx.stroke();
    ctx.restore();
    ctx.restore();

    // Main concept
    const ma = slideIn(t, 0.3);
    ctx.save(); ctx.globalAlpha = ma;
    drawTxt(ctx, seg.mainConcept, W/2, H/2 + 38, `bold 54px "Plus Jakarta Sans", sans-serif`, wh, "center");
    ctx.restore();

    // Tagline
    const ta = slideIn(t, 0.55);
    ctx.save(); ctx.globalAlpha = ta;
    ctx.font = `500 22px "Inter"`;
    const tagW = ctx.measureText(seg.tagline).width + 36;
    drawRRect(ctx, W/2 - tagW/2, H/2 + 62, tagW, 40, 20, hex2rgba(p1, 0.08), hex2rgba(p1, 0.3));
    drawTxt(ctx, seg.tagline, W/2, H/2 + 87, `500 20px "Inter"`, mu2, "center");
    ctx.restore();

    // Emoji celebration
    const ea = slideIn(t, 0.2);
    const shake = t < 0.8 ? Math.sin(t * 30) * 3 : 0;
    ctx.save(); ctx.globalAlpha = ea;
    ctx.translate(W/2 + shake, H/2 - 80);
    // Already drawn checkmark above, add emoji beside it
    ctx.font = "44px serif"; ctx.textAlign = "center";
    ctx.fillText(seg.emoji, 110, 0);
    ctx.restore();

    // Progress complete label
    const la = slideIn(t, 0.8);
    drawTxt(ctx, "Micro-Lesson Complete  ✓", W/2, H - 48, `600 16px "Inter"`, p2, "center", la);
  }, [clearBg, drawDotGrid, radialGlow, drawRRect, drawTxt, p1, p2, wh, mu2]);

  // ─── MAIN RENDER DISPATCH ─────────────────────────────────────────────────
  const renderSegment = useCallback((
    ctx: CanvasRenderingContext2D, seg: Segment, localT: number
  ) => {
    switch (seg.id) {
      case "hook": renderHook(ctx, localT, seg); break;
      case "concept": renderConcept(ctx, localT, seg); break;
      case "interactive": renderInteractive(ctx, localT, seg); break;
      case "insight": renderInsight(ctx, localT, seg); break;
      case "closing": renderClosing(ctx, localT, seg); break;
    }
  }, [renderHook, renderConcept, renderInteractive, renderInsight, renderClosing]);

  // ─── ANIMATION LOOP ────────────────────────────────────────────────────────
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // startRef of 0 means "not yet started for this playback"
    if (!startRef.current) startRef.current = time - pauseRef.current;
    const el = time - startRef.current;

    if (el >= totalMs) {
      setElapsed(totalMs);
      setIsPlaying(false);
      pauseRef.current = totalMs;
      const last = lesson.segments[lesson.segments.length - 1];
      renderSegment(ctx, last, last.durationSeconds);
      onComplete?.();
      return;
    }

    setElapsed(el);

    // Find active segment using accumulated ms
    let acc2 = 0, foundIdx = 0;
    for (let i = 0; i < lesson.segments.length; i++) {
      if (el < acc2 + lesson.segments[i].durationSeconds * 1000) { foundIdx = i; break; }
      acc2 += lesson.segments[i].durationSeconds * 1000;
    }

    // Only call setState when the segment actually changes (avoids re-render every frame)
    if (foundIdx !== segIdxRef.current) {
      segIdxRef.current = foundIdx;
      setSegIdx(foundIdx);
    }

    const localT = (el - acc2) / 1000;
    renderSegment(ctx, lesson.segments[foundIdx], localT);

    rafRef.current = requestAnimationFrame(animate);
  // ↓ segIdx intentionally excluded — we use segIdxRef inside the loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, totalMs, onComplete, renderSegment]);

  useEffect(() => {
    if (isPlaying) {
      // Only reset startRef when we are actually at the very beginning (elapsed == 0)
      // For resume-from-pause: startRef stays 0 so animate will recalculate from pauseRef
      if (elapsed === 0) startRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // animate changes identity only when lesson/totalMs/onComplete/renderSegment change — all safe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, animate]);

  // Initial frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && lesson.segments[0]) {
      const ctx = canvas.getContext("2d");
      if (ctx) renderSegment(ctx, lesson.segments[0], 0);
    }
    setElapsed(0); setSegIdx(0);
    startRef.current = 0; pauseRef.current = 0;
  }, [lesson, renderSegment]);

  const handlePlayPause = () => {
    if (isPlaying) { pauseRef.current = elapsed; setIsPlaying(false); }
    else {
      if (elapsed >= totalMs) { pauseRef.current = 0; setElapsed(0); }
      setIsPlaying(true);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const target = pct * totalMs;
    pauseRef.current = target; setElapsed(target);
    startRef.current = 0;
    // Find segment and render still frame
    let acc2 = 0, idx = 0;
    for (let i = 0; i < lesson.segments.length; i++) {
      if (target < acc2 + lesson.segments[i].durationSeconds * 1000) { idx = i; break; }
      acc2 += lesson.segments[i].durationSeconds * 1000;
    }
    setSegIdx(idx);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) renderSegment(ctx, lesson.segments[idx], (target - acc2) / 1000);
    }
  };

  const fmtTime = (ms: number) => {
    if (isNaN(ms)) return "0s";
    const s = Math.floor(ms / 1000);
    return `${s}s`;
  };

  const elapsedPct = totalMs > 0 ? (elapsed / totalMs) * 100 : 0;

  // Segment tick mark positions
  let cumMs = 0;
  const segMarks = lesson.segments.map((s, i) => {
    const pct = (cumMs / totalMs) * 100;
    cumMs += s.durationSeconds * 1000;
    return { pct, color: SEGMENT_COLORS[i] };
  });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Canvas */}
      <div style={{
        position: "relative", width: "100%", aspectRatio: "16/9",
        background: "#000", borderRadius: 18, overflow: "hidden",
        boxShadow: "0 12px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
      }}>
        <canvas
          ref={canvasRef} width={W} height={H}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", cursor: "pointer" }}
          onClick={handlePlayPause}
        />
        {/* Play overlay */}
        {!isPlaying && elapsed === 0 && (
          <div
            onClick={handlePlayPause}
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.42)", backdropFilter: "blur(8px)",
              cursor: "pointer",
            }}
          >
            <div style={{
              width: 80, height: 80,
              background: `linear-gradient(135deg, ${p1}, ${p2})`,
              borderRadius: "50%", display: "flex", alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 40px ${p1}55`,
            }}>
              <svg width={28} height={28} viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
        )}
        {/* Segment name badge */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10, padding: "5px 12px",
          fontSize: 12, fontWeight: 600, color: SEGMENT_COLORS[segIdx],
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {lesson.segments[segIdx]?.id}
        </div>
        {/* Learning style badge */}
        {learningStyle && STYLE_BADGE[learningStyle] && (
          <div style={{
            position: "absolute", top: 14, left: 14,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "5px 12px",
            fontSize: 11, fontWeight: 600, color: "#e5e7eb",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span>{STYLE_BADGE[learningStyle].icon}</span>
            {STYLE_BADGE[learningStyle].label} Style
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Progress bar with segment markers */}
        <div
          onClick={handleScrub}
          style={{
            position: "relative", height: 8, background: "rgba(255,255,255,0.06)",
            borderRadius: 4, cursor: "pointer", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${elapsedPct}%`,
            background: `linear-gradient(90deg, ${p1}, ${p2})`,
            borderRadius: 4, transition: "none",
          }} />
          {/* Segment tick marks */}
          {segMarks.map((m, i) => (
            <div
              key={`mark-${i}`}
              style={{
                position: "absolute", left: `${m.pct}%`, top: 0, bottom: 0,
                width: 2, background: "rgba(0,0,0,0.1)", 
                zIndex: 2,
              }}
            />
          ))}
        </div>

        {/* Playback row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={handlePlayPause}
            style={{
              width: 42, height: 42, borderRadius: 12,
              background: `linear-gradient(135deg, ${p1}, ${p2})`,
              border: "none", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 15px ${p1}44`, flexShrink: 0,
            }}
          >
            {isPlaying ? (
              <svg width={16} height={16} viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width={16} height={16} viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          {/* Time */}
          <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600, minWidth: 72 }}>
            {fmtTime(elapsed)} / {fmtTime(totalMs)}
          </span>

          {/* Segment pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {lesson.segments.map((s, i) => (
              <div key={`seg-pill-${s.id}-${i}`} style={{
                padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: segIdx === i ? SEGMENT_COLORS[i] + "22" : "rgba(255,255,255,0.04)",
                border: `1px solid ${segIdx === i ? SEGMENT_COLORS[i] + "60" : "rgba(255,255,255,0.06)"}`,
                color: segIdx === i ? SEGMENT_COLORS[i] : "#6b7280",
                textTransform: "uppercase", letterSpacing: "0.06em",
                transition: "all 0.2s",
              }}>
                {s.id} · {Number(s.durationSeconds) || 0}s
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
