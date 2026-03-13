"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface SlideData {
  type: string;
  duration: number;
  narration: string;
  data: any;
}

interface Lesson {
  topic: string;
  slides: SlideData[];
  totalDuration?: number;
}

interface VideoPlayerProps {
  lesson: Lesson;
  onComplete?: () => void;
  isFullscreen?: boolean;
}

export function VideoPlayer({ lesson, onComplete, isFullscreen = false }: VideoPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(-1);
  const requestRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const totalDuration = lesson.slides.reduce((acc, s) => acc + s.duration, 0);
  const lastSpokenSlideRef = useRef<number>(-1);

  // ElevenLabs TTS
  const audioCacheRef = useRef<Record<number, HTMLAudioElement>>({});
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Palette ──
  const PAL = {
    bg: "#07090f", s1: "#0c0f1a", s2: "#111827",
    a1: "#7c6cff", a2: "#ff6b6b", a3: "#06d6a0", a4: "#ffd166", a5: "#60a5fa",
    wh: "#dde2f0", mu: "#4b5563", mu2: "#6b7280",
  };

  // ── Helpers ──
  const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const slideIn = (t: number, delay: number, dur = 0.6) => easeOut(clamp((t - delay) / dur, 0, 1));

  const hex2rgba = (hex: string, a: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const drawRRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string, sw = 1.5) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
  };

  const drawTxt = (ctx: CanvasRenderingContext2D, str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left", alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.restore();
  };

  const typewrite = (ctx: CanvasRenderingContext2D, str: string, x: number, y: number, font: string, color: string, progress: number, align: CanvasTextAlign = "left") => {
    drawTxt(ctx, str.substring(0, Math.floor(str.length * progress)), x, y, font, color, align);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, font: string, maxW: number) => {
    ctx.font = font;
    const words = text.split(" ");
    const lines: string[] = [];
    let cur = "";
    words.forEach((w) => {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else cur = test;
    });
    if (cur) lines.push(cur);
    return lines;
  };

  const W = 1280, H = 720;

  const clearBg = (ctx: CanvasRenderingContext2D, color = "#07090f") => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
  };

  const drawDotGrid = (ctx: CanvasRenderingContext2D, alpha = 0.025) => {
    ctx.save();
    for (let x = 40; x < W; x += 60)
      for (let y = 40; y < H; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }
    ctx.restore();
  };

  const radialGlow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, hex: string, a = 0.12) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hex2rgba(hex, a));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  const drawHex = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill?: string, stroke?: string) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i - 30);
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  };

  // ══════════════════════════════════════════
  //  SLIDE RENDERERS
  // ══════════════════════════════════════════

  const renderTitle = (ctx: CanvasRenderingContext2D, t: number, data: any) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.03);
    radialGlow(ctx, W / 2, H / 2, 550, data.color, 0.1 + Math.sin(t * 1.5) * 0.02);

    // Animated rings
    ctx.save();
    ctx.translate(W / 2, H / 2);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 160 + i * 90, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${0.03 - i * 0.005})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      const angle = t * (0.3 + i * 0.1) + i * 1.5;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (160 + i * 90), Math.sin(angle) * (160 + i * 90), 5 - i, 0, Math.PI * 2);
      const dotColors = [data.color, PAL.a3, PAL.a2, PAL.a4];
      ctx.fillStyle = dotColors[i];
      ctx.fill();
    }
    ctx.restore();

    // Title
    const ta = slideIn(t, 0.2);
    ctx.save();
    ctx.globalAlpha = ta;
    ctx.translate(0, (1 - ta) * 40);
    drawTxt(ctx, data.title, W / 2, H / 2 - 80, 'bold 88px "Plus Jakarta Sans", sans-serif', PAL.wh, "center");
    ctx.restore();

    // Subtitle pill
    const sa = slideIn(t, 0.6);
    if (sa > 0) {
      ctx.save();
      ctx.globalAlpha = sa;
      ctx.font = '500 28px "Inter", sans-serif';
      const sw = ctx.measureText(data.subtitle).width + 40;
      drawRRect(ctx, W / 2 - sw / 2, H / 2 + 20, sw, 46, 23, hex2rgba(data.color, 0.15), hex2rgba(data.color, 0.35));
      drawTxt(ctx, data.subtitle, W / 2, H / 2 + 50, '500 26px "Inter", sans-serif', PAL.wh, "center");
      ctx.restore();
    }

    // Bottom label
    const ba = slideIn(t, 1.0);
    drawTxt(ctx, "▶  AI Generated Lesson", W / 2, H - 60, '400 18px "Inter"', PAL.mu, "center", ba);
  };

  const renderConcept = (ctx: CanvasRenderingContext2D, t: number, data: any) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.02);
    radialGlow(ctx, 160, H / 2, 400, data.color || PAL.a1, 0.08);

    // Label
    drawTxt(ctx, "CONCEPT", 60, 62, '700 11px "Inter"', data.color || PAL.a1, "left", slideIn(t, 0));

    // Heading
    const ha = slideIn(t, 0.2);
    ctx.save();
    ctx.globalAlpha = ha;
    ctx.translate((1 - ha) * -30, 0);
    drawTxt(ctx, data.heading, 60, 140, 'bold 60px "Plus Jakarta Sans", sans-serif', PAL.wh, "left");
    ctx.restore();

    // Underline
    const uw = Math.min(1, Math.max(0, (t - 0.6) / 0.5));
    drawRRect(ctx, 60, 158, 500 * uw, 3, 2, data.color || PAL.a1);

    // Body
    const lines = wrapText(ctx, data.body, '400 27px "Inter"', 620);
    lines.forEach((line, i) => {
      const la = slideIn(t, 0.8 + i * 0.15);
      ctx.save();
      ctx.globalAlpha = la;
      ctx.translate((1 - la) * -20, 0);
      drawTxt(ctx, line, 60, 230 + i * 46, '400 27px "Inter"', i === 0 ? PAL.wh : PAL.mu2);
      ctx.restore();
    });

    // Icon
    const ia = slideIn(t, 0.5);
    ctx.save();
    ctx.globalAlpha = ia;
    ctx.font = "160px serif";
    ctx.textAlign = "center";
    ctx.fillText(data.icon || "📖", W - 200, H / 2 + 60);
    ctx.restore();
  };

  const renderVisual = (ctx: CanvasRenderingContext2D, t: number, data: any) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.018);
    radialGlow(ctx, W * 0.7, H * 0.4, 500, data.color || PAL.a3, 0.09);

    // Label pill
    const la = slideIn(t, 0);
    ctx.save();
    ctx.globalAlpha = la;
    drawRRect(ctx, 60, 30, 120, 32, 16, hex2rgba(data.color || PAL.a3, 0.12), hex2rgba(data.color || PAL.a3, 0.3));
    drawTxt(ctx, "VISUAL", 68, 52, '700 11px "Inter"', data.color || PAL.a3, "left");
    ctx.restore();

    // Heading
    const ha = slideIn(t, 0.2);
    ctx.save();
    ctx.globalAlpha = ha;
    ctx.translate(0, (1 - ha) * 25);
    drawTxt(ctx, data.heading, 60, 130, 'bold 56px "Plus Jakarta Sans", sans-serif', PAL.wh, "left");
    ctx.restore();

    // Body
    const lines = wrapText(ctx, data.body, '400 25px "Inter"', 540);
    lines.forEach((line, i) => {
      const ba = slideIn(t, 0.7 + i * 0.18);
      drawTxt(ctx, line, 60, 210 + i * 44, '400 25px "Inter"', i === 0 ? PAL.wh : PAL.mu2, "left", ba);
    });

    // Animated hex grid visual element
    const va = slideIn(t, 0.5);
    ctx.save();
    ctx.globalAlpha = va;
    const cx = 850, cy = H / 2 + 40;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const hx = cx + (col - 1.5) * 90 + (row % 2) * 45;
        const hy = cy + (row - 1.5) * 78;
        const delay = row * 0.1 + col * 0.12;
        const hexAlpha = slideIn(t, 0.5 + delay);
        ctx.save();
        ctx.globalAlpha = va * hexAlpha;
        drawHex(ctx, hx, hy, 34, hex2rgba(data.color || PAL.a3, 0.12), hex2rgba(data.color || PAL.a3, 0.4));
        ctx.restore();
      }
    }
    ctx.restore();
  };

  const renderFact = (ctx: CanvasRenderingContext2D, t: number, data: any) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.025);
    radialGlow(ctx, W / 2, 250, 400, data.color || PAL.a2, 0.1);

    const la = slideIn(t, 0);
    drawRRect(ctx, 60, 30, 160, 32, 16, hex2rgba(data.color || PAL.a2, 0.12), hex2rgba(data.color || PAL.a2, 0.3));
    drawTxt(ctx, "KEY FORMULA", 68, 52, '700 11px "Inter"', data.color || PAL.a2, "left", la);

    // Label
    const ha = slideIn(t, 0.2);
    ctx.save();
    ctx.globalAlpha = ha;
    ctx.translate(0, (1 - ha) * 25);
    drawTxt(ctx, data.label, 60, 130, '600 30px "Inter"', PAL.mu2, "left");
    ctx.restore();

    // Formula box with typewriter
    const fa = slideIn(t, 0.5);
    ctx.save();
    ctx.globalAlpha = fa;
    drawRRect(ctx, 60, 155, W - 120, 110, 16, hex2rgba(data.color || PAL.a2, 0.07), hex2rgba(data.color || PAL.a2, 0.25), 1.5);
    const fp = Math.min(1, Math.max(0, (t - 0.7) / 1.5));
    typewrite(ctx, data.formula, W / 2, 230, "bold 48px monospace", PAL.wh, fp, "center");
    ctx.restore();

    // Variables
    if (data.vars) {
      data.vars.forEach((v: string, i: number) => {
        const va = slideIn(t, 1.0 + i * 0.25);
        ctx.save();
        ctx.globalAlpha = va;
        drawRRect(ctx, 60, 290 + i * 68, W - 120, 52, 10, hex2rgba(PAL.wh, 0.02), hex2rgba(PAL.wh, 0.06));
        drawRRect(ctx, 60, 290 + i * 68, 5, 52, 3, data.color || PAL.a2);
        drawTxt(ctx, v, 80, 323 + i * 68, '400 22px "Inter"', PAL.mu2);
        ctx.restore();
      });
    }
  };

  const renderAnalogy = (ctx: CanvasRenderingContext2D, t: number, data: any) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.02);
    radialGlow(ctx, W * 0.65, H * 0.5, 500, data.color || PAL.a5, 0.08);

    const la = slideIn(t, 0);
    drawRRect(ctx, 60, 30, 140, 32, 16, hex2rgba(data.color || PAL.a5, 0.12), hex2rgba(data.color || PAL.a5, 0.3));
    drawTxt(ctx, "ANALOGY", 68, 52, '700 11px "Inter"', data.color || PAL.a5, "left", la);

    const ha = slideIn(t, 0.2);
    ctx.save();
    ctx.globalAlpha = ha;
    ctx.translate(0, (1 - ha) * 25);
    drawTxt(ctx, data.title, 60, 130, 'bold 58px "Plus Jakarta Sans", sans-serif', PAL.wh, "left");
    ctx.restore();

    const lines = wrapText(ctx, data.body, '400 26px "Inter"', 580);
    lines.forEach((line, i) => {
      const ba = slideIn(t, 0.7 + i * 0.18);
      drawTxt(ctx, line, 60, 210 + i * 46, '400 26px "Inter"', i === 0 ? PAL.wh : PAL.mu2, "left", ba);
    });

    // Animated illustration
    const ia = slideIn(t, 0.5);
    ctx.save();
    ctx.globalAlpha = ia;
    const animType = data.type || "orbit";
    if (animType === "particles") drawParticleAnim(ctx, t, data.color);
    else if (animType === "network") drawNetworkAnim(ctx, t, data.color);
    else drawOrbitAnim(ctx, t, data.color);
    ctx.restore();
  };

  // ── Animated illustrations ──
  const drawOrbitAnim = (ctx: CanvasRenderingContext2D, t: number, color?: string) => {
    const cx = 850, cy = H / 2 + 20;
    radialGlow(ctx, cx, cy, 100, color || PAL.a1, 0.3);
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
    drawTxt(ctx, "☀", cx, cy + 12, "36px serif", PAL.wh, "center");

    const planets = [
      { r: 100, s: 1.6, sz: 14, c: "#3b82f6" },
      { r: 165, s: 1.0, sz: 11, c: "#ef4444" },
      { r: 230, s: 0.6, sz: 17, c: color || PAL.a3 },
    ];
    planets.forEach((p) => {
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      ctx.stroke();
      const a = t * p.s;
      const px = cx + Math.cos(a) * p.r;
      const py = cy + Math.sin(a) * p.r;
      ctx.beginPath();
      ctx.arc(px, py, p.sz, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();
    });
  };

  const drawSoundwaveAnim = (ctx: CanvasRenderingContext2D, t: number, color?: string) => {
    const cx = 830, cy = H / 2;
    ctx.strokeStyle = color || PAL.a5;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    const bars = 30;
    for (let i = 0; i < bars; i++) {
        const x = cx - 150 + i * 12;
        const dist = Math.abs(i - bars/2) / (bars/2);
        const h = 20 + Math.abs(Math.sin(t * 8 + i * 0.4)) * 100 * (1 - dist);
        ctx.beginPath();
        ctx.moveTo(x, cy - h/2);
        ctx.lineTo(x, cy + h/2);
        ctx.globalAlpha = 0.3 + (1 - dist) * 0.7;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Small speaker icon
    drawTxt(ctx, "🔊", cx, cy - 100, "40px sans-serif", PAL.wh, "center");
  };

  const drawTrampolineAnim = (ctx: CanvasRenderingContext2D, t: number, color?: string) => {
    const cx = 830, cy = H / 2 + 50;
    // Surface
    ctx.beginPath();
    ctx.moveTo(cx - 180, cy);
    const dip = Math.abs(Math.sin(t * 5)) * 60;
    ctx.quadraticCurveTo(cx, cy + dip, cx + 180, cy);
    ctx.strokeStyle = color || PAL.a2;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Supporting legs
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 160, cy); ctx.lineTo(cx - 160, cy + 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 160, cy); ctx.lineTo(cx + 160, cy + 60); ctx.stroke();

    // Bouncing ball
    const bx = cx;
    const by = cy - 120 + dip - Math.abs(Math.cos(t * 5) * 120);
    ctx.beginPath();
    ctx.arc(bx, by, 30, 0, Math.PI * 2);
    ctx.fillStyle = PAL.wh;
    ctx.fill();
    ctx.strokeStyle = color || PAL.a2;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawTxt(ctx, "⚡", bx, by + 12, "30px sans-serif", PAL.wh, "center");
  };

  const drawParticleAnim = (ctx: CanvasRenderingContext2D, t: number, color?: string) => {
    const cx = 850, cy = H / 2;
    for (let i = 0; i < 20; i++) {
      const seed = i * 137.5;
      const angle = seed + t * (0.5 + i * 0.03);
      const r = 60 + i * 12;
      const x = cx + Math.cos(angle) * r * (0.8 + Math.sin(t + i) * 0.2);
      const y = cy + Math.sin(angle * 0.7) * r * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fillStyle = color || PAL.a4;
      ctx.globalAlpha = 0.4 + Math.sin(t + i) * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = hex2rgba(color || PAL.a4, 0.15);
    ctx.fill();
    ctx.strokeStyle = color || PAL.a4;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawTxt(ctx, "⚡", cx, cy + 12, "36px serif", PAL.wh, "center");
  };

  const drawNetworkAnim = (ctx: CanvasRenderingContext2D, t: number, color?: string) => {
    const cx = 830, cy = H / 2;
    const nodes = [
      { x: cx - 160, y: cy, label: "Input" },
      { x: cx - 60, y: cy - 80, label: "" },
      { x: cx - 60, y: cy + 80, label: "" },
      { x: cx + 60, y: cy - 80, label: "" },
      { x: cx + 60, y: cy + 80, label: "" },
      { x: cx + 160, y: cy, label: "Output" },
    ];
    const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 5], [4, 5]];
    edges.forEach(([a, b]) => {
      const pulse = Math.sin(t * 2 + a + b) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.strokeStyle = color || PAL.a1;
      ctx.lineWidth = 1 + pulse;
      ctx.globalAlpha = 0.2 + pulse * 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
    nodes.forEach((n, i) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 || i === 5 ? (color || PAL.a1) : "#1f2937";
      ctx.fill();
      ctx.strokeStyle = color || PAL.a1;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (n.label) drawTxt(ctx, n.label, n.x, n.y + 5, '600 13px "Inter"', PAL.wh, "center");
    });
  };

  const renderSummary = (ctx: CanvasRenderingContext2D, t: number, data: any) => {
    clearBg(ctx);
    drawDotGrid(ctx, 0.025);
    radialGlow(ctx, W / 2, H / 2, 650, data.color || PAL.a1, 0.07);

    const ha = slideIn(t, 0.1);
    ctx.save();
    ctx.globalAlpha = ha;
    ctx.translate(0, (1 - ha) * 25);
    drawTxt(ctx, "Key Takeaways", W / 2, 110, 'bold 68px "Plus Jakarta Sans", sans-serif', PAL.wh, "center");
    ctx.restore();

    if (data.points) {
      data.points.forEach((pt: string, i: number) => {
        const pa = slideIn(t, 0.5 + i * 0.28, 0.5);
        const y = 185 + i * 88;
        ctx.save();
        ctx.globalAlpha = pa;
        ctx.translate((1 - easeOut(Math.min(1, Math.max(0, (t - 0.5 - i * 0.28) / 0.5)))) * -50, 0);
        drawRRect(ctx, 80, y - 42, W - 160, 64, 12, "rgba(255,255,255,0.02)", "rgba(255,255,255,0.07)");
        drawRRect(ctx, 80, y - 42, 5, 64, 3, data.color || PAL.a1);
        drawTxt(ctx, String(i + 1).padStart(2, "0"), 108, y + 6, '700 20px "Plus Jakarta Sans"', data.color || PAL.a1);
        drawTxt(ctx, pt, 145, y + 6, '500 24px "Inter"', PAL.wh);
        ctx.restore();
      });
    }
  };

  const renderSlide = useCallback((ctx: CanvasRenderingContext2D, slide: SlideData, localT: number) => {
    switch (slide.type) {
      case "title": renderTitle(ctx, localT, slide.data); break;
      case "concept": renderConcept(ctx, localT, slide.data); break;
      case "visual": renderVisual(ctx, localT, slide.data); break;
      case "fact": renderFact(ctx, localT, slide.data); break;
      case "analogy": 
        if (slide.data.type === "soundwave") drawSoundwaveAnim(ctx, localT, slide.data.color);
        else if (slide.data.type === "trampoline") drawTrampolineAnim(ctx, localT, slide.data.color);
        else renderAnalogy(ctx, localT, slide.data); 
        break;
      case "summary": renderSummary(ctx, localT, slide.data); break;
      default: renderConcept(ctx, localT, slide.data);
    }
  }, []);

  // ── TTS with ElevenLabs ──
  const prefetchAudio = useCallback(async () => {
    if (!lesson.slides.length) return;
    setIsAudioLoading(true);
    
    // Clear old cache
    Object.values(audioCacheRef.current).forEach(a => {
      a.pause();
      a.src = "";
    });
    audioCacheRef.current = {};

    try {
      const promises = lesson.slides.map(async (slide, idx) => {
        if (!slide.narration) return;
        
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: slide.narration,
            voiceId: "cgSgSsp9p1Yp0gQ77F0a" // Aria - High quality expressive voice
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch audio");
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.preload = "auto";
        audioCacheRef.current[idx] = audio;
      });

      await Promise.all(promises);
    } catch (err) {
      console.error("Audio prefetch error:", err);
    } finally {
      setIsAudioLoading(false);
    }
  }, [lesson.slides]);

  useEffect(() => {
    prefetchAudio();
    return () => {
      // Cleanup URLs
      Object.values(audioCacheRef.current).forEach(a => {
        if (a.src.startsWith("blob:")) URL.revokeObjectURL(a.src);
      });
    };
  }, [prefetchAudio]);

  const speak = useCallback((slideIdx: number) => {
    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    const audio = audioCacheRef.current[slideIdx];
    if (audio) {
      currentAudioRef.current = audio;
      if (isPlaying) {
        audio.play().catch(e => console.warn("Audio play blocked:", e));
      }
    }
  }, [isPlaying]);

  // ── Animation Loop ──
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!startTimeRef.current) startTimeRef.current = time - pauseTimeRef.current;
    const elapsed = time - startTimeRef.current;

    if (elapsed >= totalDuration) {
      setCurrentTime(totalDuration);
      setIsPlaying(false);
      pauseTimeRef.current = totalDuration;
      // Render last frame
      const lastSlide = lesson.slides[lesson.slides.length - 1];
      renderSlide(ctx, lastSlide, lastSlide.duration / 1000);
      if (onComplete) onComplete();
      return;
    }

    setCurrentTime(elapsed);

    // Find current slide
    let acc = 0;
    let foundIdx = 0;
    for (let i = 0; i < lesson.slides.length; i++) {
      if (elapsed < acc + lesson.slides[i].duration) {
        foundIdx = i;
        break;
      }
      acc += lesson.slides[i].duration;
    }

    if (foundIdx !== lastSpokenSlideRef.current) {
      lastSpokenSlideRef.current = foundIdx;
      setCurrentSlideIdx(foundIdx);
      speak(foundIdx);
    }

    const localT = (elapsed - acc) / 1000;
    renderSlide(ctx, lesson.slides[foundIdx], localT);

    requestRef.current = requestAnimationFrame(animate);
  }, [lesson, totalDuration, onComplete, speak, renderSlide]);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = 0; // Will be set on first frame
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  // Initial render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && lesson.slides[0]) {
      const ctx = canvas.getContext("2d");
      if (ctx) renderSlide(ctx, lesson.slides[0], 0);
    }
    setCurrentTime(0);
    setCurrentSlideIdx(-1);
    startTimeRef.current = 0;
    pauseTimeRef.current = 0;
    lastSpokenSlideRef.current = -1;
  }, [lesson, renderSlide]);

  // Sync audio with play/pause state
  useEffect(() => {
    if (isPlaying) {
      if (currentAudioRef.current && currentAudioRef.current.paused) {
        currentAudioRef.current.play().catch(e => console.warn("Resume failed:", e));
      }
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTimeRef.current = currentTime;
      setIsPlaying(false);
    } else {
      if (currentTime >= totalDuration) {
        // Restart
        pauseTimeRef.current = 0;
        setCurrentTime(0);
        lastSpokenSlideRef.current = -1;
      }
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const targetTime = pct * totalDuration;
    pauseTimeRef.current = targetTime;
    setCurrentTime(targetTime);
    startTimeRef.current = 0;
    lastSpokenSlideRef.current = -1;

    // Find which slide the target time is in and re-render
    let acc = 0;
    let idx = 0;
    for (let i = 0; i < lesson.slides.length; i++) {
      if (targetTime < acc + lesson.slides[i].duration) {
        idx = i;
        break;
      }
      acc += lesson.slides[i].duration;
    }
    setCurrentSlideIdx(idx);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) renderSlide(ctx, lesson.slides[idx], (targetTime - acc) / 1000);
    }
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Styles ──
  const isDark = isFullscreen;

  return (
    <div style={{
      width: "100%",
      height: isFullscreen ? "100%" : "auto",
      display: "flex",
      flexDirection: "column",
      gap: isFullscreen ? "0" : "16px",
      flex: isFullscreen ? 1 : "unset",
    }}>
      {/* Canvas Container */}
      <div style={{
        position: "relative",
        width: "100%",
        flex: isFullscreen ? 1 : "unset",
        aspectRatio: isFullscreen ? undefined : "16/9",
        background: "#000",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: isFullscreen
          ? "0 20px 60px rgba(0,0,0,0.5)"
          : "0 8px 32px rgba(0,0,0,0.3)",
        border: isFullscreen ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
      }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            cursor: "pointer",
            display: "block",
          }}
          onClick={handlePlayPause}
        />

        {/* Play Overlay */}
        {!isPlaying && currentTime === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              cursor: isAudioLoading ? "wait" : "pointer",
              zIndex: 10,
            }}
            onClick={isAudioLoading ? undefined : handlePlayPause}
          >
            <div style={{
              width: isFullscreen ? "100px" : "72px",
              height: isFullscreen ? "100px" : "72px",
              background: isAudioLoading ? PAL.mu : "linear-gradient(135deg, #7c6cff, #6366f1)",
              borderRadius: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: isAudioLoading ? "none" : "0 8px 32px rgba(124, 108, 255, 0.45), 0 0 0 6px rgba(124, 108, 255, 0.15)",
              transition: "all 0.2s",
            }}>
              {isAudioLoading ? (
                <div style={{
                  width: "24px",
                  height: "24px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }} />
              ) : (
                <svg width={isFullscreen ? "40" : "28"} height={isFullscreen ? "40" : "28"} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
            {isAudioLoading && (
              <div style={{
                position: "absolute",
                bottom: isFullscreen ? "30%" : "20%",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                textAlign: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                Enhancing Narration...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: isFullscreen ? "10px 0 0 0" : "0",
      }}>
        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "5px",
            background: isDark ? "rgba(255,255,255,0.07)" : "var(--border-subtle, #E8E4DC)",
            borderRadius: "3px",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={handleProgressClick}
        >
          <div style={{
            height: "100%",
            background: PAL.a1,
            borderRadius: "3px",
            transition: "width 0.1s linear",
            width: `${(currentTime / totalDuration) * 100}%`,
            position: "relative",
          }}>
            {/* Progress thumb */}
            <div style={{
              position: "absolute",
              right: "-7px",
              top: "-4.5px",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: PAL.a1,
              boxShadow: `0 0 10px ${PAL.a1}`,
            }} />
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          {lesson.slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                transition: "all 0.3s",
                cursor: "pointer",
                transform: i === currentSlideIdx ? "scale(1.4)" : "scale(1)",
                background: i === currentSlideIdx ? PAL.a1 : i < currentSlideIdx ? "rgba(124, 108, 255, 0.4)" : (isDark ? "rgba(255,255,255,0.12)" : "var(--border-default, #ccc)"),
              }}
            />
          ))}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            style={{
              background: PAL.a1,
              border: `1px solid ${PAL.a1}`,
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontFamily: '"Inter", sans-serif',
              fontSize: "14px",
              fontWeight: 600,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isPlaying ? "⏸ Pause" : currentTime >= totalDuration ? "↺ Replay" : "▶ Play"}
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              pauseTimeRef.current = 0;
              setCurrentTime(0);
              lastSpokenSlideRef.current = -1;
              setIsPlaying(true);
            }}
            style={{
              background: isDark ? "var(--s2, #111827)" : "var(--bg-surface, #fff)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "var(--border-default, #E8E4DC)"}`,
              color: isDark ? PAL.wh : "var(--text-primary, #1C1F27)",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontFamily: '"Inter", sans-serif',
              fontSize: "14px",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            ↺
          </button>

          {/* Slide labels */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {lesson.slides.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  const offset = lesson.slides.slice(0, i).reduce((a, s) => a + s.duration, 0);
                  pauseTimeRef.current = offset;
                  setCurrentTime(offset);
                  startTimeRef.current = 0;
                  lastSpokenSlideRef.current = -1;
                  setIsPlaying(true);
                }}
                style={{
                  padding: "5px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 500,
                  border: i === currentSlideIdx ? `1px solid ${PAL.a1}` : `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "var(--border-default, #E8E4DC)"}`,
                  background: i === currentSlideIdx ? PAL.a1 : "transparent",
                  color: i === currentSlideIdx ? "#fff" : (isDark ? PAL.mu2 : "var(--text-muted, #9DA3B0)"),
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: '"Inter", sans-serif',
                  textTransform: "capitalize" as const,
                }}
              >
                {s.type}
              </button>
            ))}
          </div>

          {/* Time display */}
          <div style={{
            marginLeft: "auto",
            fontSize: "13px",
            color: isDark ? PAL.mu : "var(--text-muted, #9DA3B0)",
            fontWeight: 500,
            fontFamily: "monospace",
          }}>
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>
      </div>
    </div>
  );
}
