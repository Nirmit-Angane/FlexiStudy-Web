// SlideRenderer — Renders individual slide types with animations on canvas

import { Slide, LessonTheme, SlideType } from '@/lib/types';
import { easeOutCubic, easeOutBack, lerp, hexToRgba, wrapText } from '@/lib/animations';

export class SlideRenderer {
  private width: number;
  private height: number;
  private theme: LessonTheme;

  constructor(width: number, height: number, theme: LessonTheme) {
    this.width = width;
    this.height = height;
    this.theme = theme;
  }

  render(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    // progress: 0 to 1 for the slide duration
    const entranceT = Math.min(progress * 4, 1); // entrance in first 25%
    const exitT = Math.max((progress - 0.85) / 0.15, 0); // exit in last 15%
    const contentAlpha = easeOutCubic(entranceT) * (1 - exitT);

    ctx.save();
    ctx.globalAlpha = contentAlpha;

    // Apply layout translate if leftText_rightVisual
    if (slide.content.layout === 'leftText_rightVisual') {
      ctx.translate(-this.width * 0.15, 0); // Shift all text leftwards
    }

    // Apply entrance animation
    this.applyEntrance(ctx, slide.animation.entrance, entranceT);

    // Render by slide type
    switch (slide.type) {
      case 'title':
        this.renderTitle(ctx, slide, progress);
        break;
      case 'hook':
        this.renderHook(ctx, slide, progress);
        break;
      case 'realworld':
      case 'concept':
        this.renderConcept(ctx, slide, progress);
        break;
      case 'formula':
        this.renderFormula(ctx, slide, progress);
        break;
      case 'worked_example':
      case 'analogy':
        this.renderAnalogy(ctx, slide, progress);
        break;
      case 'visual':
      case 'comparison':
        this.renderComparison(ctx, slide, progress);
        break;
      case 'timeline':
        this.renderTimeline(ctx, slide, progress);
        break;
      case 'misconception':
        this.renderMisconception(ctx, slide, progress);
        break;
      case 'quote':
        this.renderQuote(ctx, slide, progress);
        break;
      case 'statistic':
        this.renderStatistic(ctx, slide, progress);
        break;
      case 'summary':
        this.renderSummary(ctx, slide, progress);
        break;
      case 'nextsteps':
        this.renderNextSteps(ctx, slide, progress);
        break;
      default:
        this.renderConcept(ctx, slide, progress);
    }

    if (slide.content.layout === 'leftText_rightVisual') {
      ctx.translate(this.width * 0.15, 0); // Reset shift before rendering absolute images
    }

    this.renderImages(ctx, slide, progress);

    // Render fun fact
    if (slide.content.funFact) {
      ctx.fillStyle = hexToRgba(this.theme.accentColor, 0.8);
      ctx.font = '500 18px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`💡 Fun Fact: ${slide.content.funFact}`, 40, this.height - 40);
    }

    ctx.restore();
  }

  private renderImages(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    if (!slide.images || slide.images.length === 0) return;

    const layout = slide.content.layout || 'center';
    
    slide.images.forEach((img, i) => {
      const imgProgress = Math.min(1, Math.max(0, (progress - 0.2 - i * 0.15) * 4));
      if (imgProgress <= 0) return;
      
      const alpha = imgProgress;
      ctx.save();
      ctx.globalAlpha = alpha * ctx.globalAlpha;
      
      let x = 0, y = 0, w = 400, h = 280;
      
      if (layout === 'leftText_rightVisual') {
        w = 460; h = 340;
        x = this.width - w - 40;
        y = this.height / 2 - h / 2;
        if (i > 0) {
           y += 30; x -= 30; // Stagger behind
        }
      } else {
        // Bottom 50%
        w = 340; h = 220;
        x = (this.width / 2) - w / 2 + (i * 360) - ((slide.images.length - 1) * 180);
        y = this.height * 0.6;
      }
      
      const slideX = (1 - easeOutBack(imgProgress)) * 50;
      ctx.translate(slideX, 0);

      // Frame background
      ctx.fillStyle = hexToRgba(this.theme.primaryColor, 0.1);
      ctx.beginPath();
      this.roundRect(ctx, x, y, w, h, 12);
      ctx.fill();
      
      // Frame border
      ctx.strokeStyle = hexToRgba(this.theme.primaryColor, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.roundRect(ctx, x, y, w, h, 12);
      ctx.stroke();

      const drawType = img.canvasDraw || (img as any).fallbackDraw;
      
      if (drawType === 'rightTriangle') this.drawRightTriangle(ctx, x, y, w, h, this.theme);
      else if (drawType === 'unitCircle') this.drawUnitCircle(ctx, x, y, w, h, this.theme);
      else if (drawType === 'sineWave') this.drawSineWave(ctx, x, y, w, h, this.theme);
      else if (drawType === 'workedExample') this.drawWorkedExample(ctx, x, y, w, h, this.theme);
      else {
        // Image type badge
        ctx.fillStyle = this.theme.accentColor;
        ctx.font = '600 14px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`[ ${img.imageType.toUpperCase()} ]`, x + w / 2, y + 30);
        
        ctx.font = '400 16px Inter, system-ui, sans-serif';
        ctx.fillStyle = this.theme.textColor;
        const lines = wrapText(ctx, (drawType === 'none' || !drawType) ? img.searchQuery : (drawType || img.searchQuery), w - 40);
        lines.forEach((line, li) => {
          ctx.fillText(line, x + w / 2, y + 80 + li * 24);
        });
      }
      
      ctx.restore();
    });
  }

  private applyEntrance(ctx: CanvasRenderingContext2D, entrance: string, t: number) {
    const eased = easeOutCubic(t);
    switch (entrance) {
      case 'fadeSlideUp':
        ctx.translate(0, (1 - eased) * 40);
        break;
      case 'slideFromRight':
        ctx.translate((1 - eased) * this.width * 0.3, 0);
        break;
      case 'slideFromLeft':
        ctx.translate(-(1 - eased) * this.width * 0.3, 0);
        break;
      case 'zoomIn':
        const scale = 0.8 + eased * 0.2;
        ctx.translate(this.width / 2 * (1 - scale), this.height / 2 * (1 - scale));
        ctx.scale(scale, scale);
        break;
    }
  }

  private renderTitle(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const c = slide.content;

    // Icon
    if (c.icon) {
      ctx.font = '64px serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.icon, cx, cy - 80);
    }

    // Category badge
    ctx.fillStyle = hexToRgba(this.theme.primaryColor, 0.2);
    const badgeText = 'EDUCATIONAL VIDEO';
    ctx.font = '600 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    const badgeW = ctx.measureText(badgeText).width + 24;
    ctx.beginPath();
    this.roundRect(ctx, cx - badgeW / 2, cy - 140, badgeW, 28, 14);
    ctx.fill();
    ctx.fillStyle = this.theme.primaryColor;
    ctx.fillText(badgeText, cx, cy - 122);

    // Title
    ctx.font = '700 56px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.theme.textColor;

    // Typewriter effect for title
    if (c.heading) {
      const chars = Math.floor(progress * 5 * c.heading.length);
      const displayText = c.heading.substring(0, Math.min(chars, c.heading.length));
      ctx.fillText(displayText, cx, cy);
    }

    // Subtitle
    if (c.subheading) {
      const subAlpha = Math.max(0, (progress - 0.3) * 3);
      ctx.globalAlpha = Math.min(subAlpha, ctx.globalAlpha);
      ctx.font = '400 22px Inter, system-ui, sans-serif';
      ctx.fillStyle = hexToRgba(this.theme.textColor, 0.7);
      ctx.fillText(c.subheading, cx, cy + 50);
    }

    // Decorative line
    const lineProgress = easeOutCubic(Math.min(progress * 2, 1));
    const lineW = 120 * lineProgress;
    ctx.strokeStyle = this.theme.primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - lineW / 2, cy + 15);
    ctx.lineTo(cx + lineW / 2, cy + 15);
    ctx.stroke();
  }

  private renderHook(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const cx = this.width / 2;
    const c = slide.content;
    const pad = 80;

    // Icon with pulse
    if (c.icon) {
      const pulse = 1 + Math.sin(progress * 10) * 0.05;
      ctx.save();
      ctx.translate(cx, 140);
      ctx.scale(pulse, pulse);
      ctx.font = '56px serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.icon, 0, 0);
      ctx.restore();
    }

    // Heading
    if (c.heading) {
      ctx.font = '700 36px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.heading, cx, 200);
    }

    // Body text
    if (c.body) {
      ctx.font = '400 24px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, c.body, this.width - pad * 2);
      lines.forEach((line, i) => {
        const lineAlpha = Math.min(1, Math.max(0, (progress - 0.2 - i * 0.1) * 5));
        ctx.globalAlpha = lineAlpha;
        ctx.fillText(line, cx, 280 + i * 36);
      });
    }

    // Detail text (smaller, dimmer)
    if (c.detail) {
      ctx.globalAlpha = Math.max(0, (progress - 0.5) * 3);
      ctx.font = '400 18px Inter, system-ui, sans-serif';
      ctx.fillStyle = hexToRgba(this.theme.textColor, 0.6);
      ctx.textAlign = 'center';
      const detailLines = wrapText(ctx, c.detail, this.width - pad * 2);
      detailLines.forEach((line, i) => {
        ctx.fillText(line, cx, 420 + i * 28);
      });
    }
  }

  private renderConcept(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const pad = 100;
    const cx = this.width / 2;

    // Icon
    if (c.icon) {
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.icon, cx, 120);
    }

    // Heading
    if (c.heading) {
      ctx.font = '700 38px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.heading, cx, 190);
    }

    // Decorative line under heading
    ctx.strokeStyle = hexToRgba(this.theme.primaryColor, 0.3);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 60, 205);
    ctx.lineTo(cx + 60, 205);
    ctx.stroke();

    // Body text with typewriter effect
    if (c.body) {
      ctx.font = '400 22px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, c.body, this.width - pad * 2);
      const totalChars = c.body.length;
      const revealedChars = Math.floor(progress * 3 * totalChars);

      let charCount = 0;
      lines.forEach((line, i) => {
        const lineStart = charCount;
        const lineEnd = charCount + line.length;
        const lineChars = Math.max(0, Math.min(line.length, revealedChars - lineStart));
        const displayLine = line.substring(0, lineChars);

        if (lineChars > 0) {
          ctx.fillText(displayLine, cx, 260 + i * 34);
        }
        charCount = lineEnd + 1; // +1 for space
      });
    }
  }

  private renderFormula(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const cx = this.width / 2;

    // Heading
    if (c.heading) {
      ctx.font = '700 34px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.heading, cx, 150);
    }

    // Formula with typewriter effect
    if (c.formula) {
      const chars = Math.floor(progress * 4 * c.formula.length);
      const displayFormula = c.formula.substring(0, Math.min(chars, c.formula.length));

      // Formula background box
      ctx.fillStyle = hexToRgba(this.theme.primaryColor, 0.08);
      ctx.beginPath();
      this.roundRect(ctx, cx - 300, 190, 600, 80, 12);
      ctx.fill();

      // Formula border
      ctx.strokeStyle = hexToRgba(this.theme.primaryColor, 0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      this.roundRect(ctx, cx - 300, 190, 600, 80, 12);
      ctx.stroke();

      // Formula text
      ctx.font = '600 36px "Courier New", monospace';
      ctx.fillStyle = this.theme.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText(displayFormula, cx, 242);

      // Cursor
      if (chars < c.formula.length) {
        const cursorX = cx + ctx.measureText(displayFormula).width / 2 + 3;
        const blink = Math.sin(Date.now() * 0.005) > 0;
        if (blink) {
          ctx.fillStyle = this.theme.accentColor;
          ctx.fillRect(cursorX, 215, 2, 30);
        }
      }
    }

    // Variables
    if (c.formulaVars) {
      c.formulaVars.forEach((varText, i) => {
        const varAlpha = Math.max(0, (progress - 0.4 - i * 0.1) * 4);
        ctx.globalAlpha = Math.min(varAlpha, 1);
        ctx.font = '400 18px Inter, system-ui, sans-serif';
        ctx.fillStyle = hexToRgba(this.theme.textColor, 0.8);
        ctx.textAlign = 'center';
        ctx.fillText(varText, cx, 320 + i * 32);
      });
    }
  }

  private renderAnalogy(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const cx = this.width / 2;
    const pad = 100;

    // Icon
    if (c.icon) {
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.icon, cx, 120);
    }

    // Heading
    if (c.heading) {
      ctx.font = '600 32px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.heading, cx, 180);
    }

    // Body with trampoline visual
    if (c.body) {
      ctx.font = '400 20px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, c.body, this.width - pad * 2);
      lines.forEach((line, i) => {
        const lineAlpha = Math.min(1, Math.max(0, (progress - 0.15 - i * 0.08) * 5));
        ctx.save();
        ctx.globalAlpha = lineAlpha * ctx.globalAlpha;
        ctx.fillText(line, cx, 240 + i * 32);
        ctx.restore();
      });
    }

    // Trampoline animation if applicable
    if (slide.animation.mainEffect === 'trampoline') {
      this.drawTrampoline(ctx, progress);
    }
  }

  private drawTrampoline(ctx: CanvasRenderingContext2D, progress: number) {
    const cx = this.width / 2;
    const baseY = 580;

    // Grid / trampoline surface
    ctx.strokeStyle = hexToRgba(this.theme.primaryColor, 0.3);
    ctx.lineWidth = 1;
    for (let x = cx - 200; x <= cx + 200; x += 20) {
      ctx.beginPath();
      const distFromCenter = Math.abs(x - cx) / 200;
      const dip = (1 - distFromCenter * distFromCenter) * 40 * easeOutCubic(Math.min(progress * 2, 1));
      ctx.moveTo(x, baseY + dip);
      ctx.lineTo(x, baseY - 10);
      ctx.stroke();
    }

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(cx - 220, baseY - 10);
    ctx.lineTo(cx + 220, baseY - 10);
    ctx.stroke();

    // Ball (bowling ball)
    const ballDip = 40 * easeOutCubic(Math.min(progress * 2, 1));
    ctx.fillStyle = this.theme.primaryColor;
    ctx.beginPath();
    ctx.arc(cx, baseY + ballDip - 15, 15, 0, Math.PI * 2);
    ctx.fill();

    // Marble rolling toward it
    if (progress > 0.3) {
      const marbleProgress = (progress - 0.3) / 0.7;
      const marbleX = cx + 180 - marbleProgress * 160;
      const marbleY = baseY - 20 + Math.sin(marbleProgress * Math.PI) * -20;
      ctx.fillStyle = this.theme.accentColor;
      ctx.beginPath();
      ctx.arc(marbleX, marbleY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderComparison(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const cx = this.width / 2;

    // Heading
    if (c.heading) {
      ctx.font = '700 34px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.heading, cx, 100);
    }

    // VS divider
    ctx.fillStyle = hexToRgba(this.theme.primaryColor, 0.3);
    ctx.fillRect(cx - 1, 130, 2, this.height - 250);
    ctx.font = '700 24px Inter, system-ui, sans-serif';
    ctx.fillStyle = this.theme.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText('VS', cx, 160);

    // Side A
    if (c.comparisonA) {
      const leftX = cx / 2;
      ctx.font = '600 24px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.comparisonA.label, leftX, 200);

      c.comparisonA.points?.forEach((point, i) => {
        const a = Math.min(1, Math.max(0, (progress - 0.2 - i * 0.15) * 4));
        ctx.globalAlpha = a;
        ctx.font = '400 17px Inter, system-ui, sans-serif';
        ctx.fillStyle = this.theme.textColor;
        ctx.fillText(`• ${point}`, leftX, 260 + i * 36);
      });
    }

    // Side B
    if (c.comparisonB) {
      const rightX = cx + cx / 2;
      ctx.font = '600 24px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.secondaryColor;
      ctx.textAlign = 'center';
      ctx.globalAlpha = 1;
      ctx.fillText(c.comparisonB.label, rightX, 200);

      c.comparisonB.points?.forEach((point, i) => {
        const a = Math.min(1, Math.max(0, (progress - 0.3 - i * 0.15) * 4));
        ctx.globalAlpha = a;
        ctx.font = '400 17px Inter, system-ui, sans-serif';
        ctx.fillStyle = this.theme.textColor;
        ctx.fillText(`• ${point}`, rightX, 260 + i * 36);
      });
    }
  }

  private renderTimeline(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const cx = this.width / 2;

    if (c.heading) {
      ctx.font = '700 34px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.heading, cx, 100);
    }

    if (!c.timelineEvents) return;

    const lineY = 300;
    const startX = 120;
    const endX = this.width - 120;
    const eventSpacing = (endX - startX) / Math.max(c.timelineEvents.length - 1, 1);

    // Timeline base line
    const lineProgress = easeOutCubic(Math.min(progress * 2, 1));
    ctx.strokeStyle = hexToRgba(this.theme.primaryColor, 0.4);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, lineY);
    ctx.lineTo(startX + (endX - startX) * lineProgress, lineY);
    ctx.stroke();

    // Events
    c.timelineEvents.forEach((event, i) => {
      const eventProgress = Math.max(0, (progress - 0.2 - i * 0.15) * 5);
      if (eventProgress <= 0) return;

      const x = startX + i * eventSpacing;
      const alpha = Math.min(1, eventProgress);
      ctx.globalAlpha = alpha;

      // Dot
      ctx.fillStyle = this.theme.primaryColor;
      ctx.beginPath();
      ctx.arc(x, lineY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Year
      ctx.font = '700 16px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText(event.year, x, lineY - 20);

      // Event text
      ctx.font = '400 14px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      const eventLines = wrapText(ctx, event.event, eventSpacing - 20);
      eventLines.forEach((line, li) => {
        ctx.fillText(line, x, lineY + 30 + li * 20);
      });
    });
  }

  private renderMisconception(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const cx = this.width / 2;

    if (c.heading) {
      ctx.font = '700 34px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.heading || 'Myth vs Truth', cx, 100);
    }

    // Myth box
    if (c.mythText) {
      const mythAlpha = Math.min(1, progress * 3);
      ctx.globalAlpha = mythAlpha;

      // Red box
      ctx.fillStyle = hexToRgba('#ef4444', 0.15);
      ctx.beginPath();
      this.roundRect(ctx, 80, 150, this.width / 2 - 100, 200, 12);
      ctx.fill();
      ctx.strokeStyle = hexToRgba('#ef4444', 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      this.roundRect(ctx, 80, 150, this.width / 2 - 100, 200, 12);
      ctx.stroke();

      ctx.font = '700 20px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('❌ MYTH', 80 + (this.width / 2 - 100) / 2, 185);

      ctx.font = '400 18px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      const mythLines = wrapText(ctx, c.mythText, this.width / 2 - 140);
      mythLines.forEach((line, i) => {
        ctx.fillText(line, 80 + (this.width / 2 - 100) / 2, 220 + i * 28);
      });
    }

    // Truth box
    if (c.truthText) {
      const truthAlpha = Math.max(0, (progress - 0.3) * 3);
      ctx.globalAlpha = Math.min(1, truthAlpha);

      const truthX = this.width / 2 + 20;
      ctx.fillStyle = hexToRgba('#22c55e', 0.15);
      ctx.beginPath();
      this.roundRect(ctx, truthX, 150, this.width / 2 - 100, 200, 12);
      ctx.fill();
      ctx.strokeStyle = hexToRgba('#22c55e', 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      this.roundRect(ctx, truthX, 150, this.width / 2 - 100, 200, 12);
      ctx.stroke();

      ctx.font = '700 20px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#22c55e';
      ctx.textAlign = 'center';
      ctx.fillText('✅ TRUTH', truthX + (this.width / 2 - 100) / 2, 185);

      ctx.font = '400 18px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      const truthLines = wrapText(ctx, c.truthText, this.width / 2 - 140);
      truthLines.forEach((line, i) => {
        ctx.fillText(line, truthX + (this.width / 2 - 100) / 2, 220 + i * 28);
      });
    }
  }

  private renderQuote(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const cx = this.width / 2;

    // Large quotation mark
    ctx.font = '200px Georgia, serif';
    ctx.fillStyle = hexToRgba(this.theme.primaryColor, 0.1);
    ctx.textAlign = 'center';
    ctx.fillText('"', cx - 200, 250);

    // Quote text
    if (c.quote) {
      ctx.font = 'italic 26px Georgia, serif';
      ctx.fillStyle = this.theme.textColor;
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, `"${c.quote}"`, this.width - 200);
      lines.forEach((line, i) => {
        const lineAlpha = Math.min(1, Math.max(0, (progress - i * 0.1) * 4));
        ctx.globalAlpha = lineAlpha;
        ctx.fillText(line, cx, 280 + i * 38);
      });
    }

    // Author
    if (c.quoteAuthor) {
      ctx.globalAlpha = Math.max(0, (progress - 0.5) * 3);
      ctx.font = '600 20px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText(`— ${c.quoteAuthor}`, cx, 450);
    }
  }

  private renderStatistic(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const cx = this.width / 2;

    if (c.icon) {
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.icon, cx, 160);
    }

    // Big number with count-up
    if (c.statNumber) {
      const numMatch = c.statNumber.match(/[\d.]+/);
      let displayValue = c.statNumber;

      if (numMatch) {
        const targetNum = parseFloat(numMatch[0]);
        const currentNum = targetNum * easeOutCubic(Math.min(progress * 2, 1));
        const formatted = targetNum % 1 === 0 ? Math.floor(currentNum).toLocaleString() : currentNum.toFixed(1);
        displayValue = c.statNumber.replace(numMatch[0], formatted);
      }

      ctx.font = '700 72px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.accentColor;
      ctx.textAlign = 'center';
      ctx.fillText(displayValue, cx, 300);
    }

    // Label
    if (c.statLabel) {
      ctx.globalAlpha = Math.max(0, (progress - 0.3) * 3);
      ctx.font = '400 24px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.textColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.statLabel, cx, 370);
    }

    // Body
    if (c.body) {
      ctx.globalAlpha = Math.max(0, (progress - 0.5) * 3);
      ctx.font = '400 18px Inter, system-ui, sans-serif';
      ctx.fillStyle = hexToRgba(this.theme.textColor, 0.7);
      ctx.textAlign = 'center';
      const lines = wrapText(ctx, c.body, this.width - 200);
      lines.forEach((line, i) => {
        ctx.fillText(line, cx, 430 + i * 28);
      });
    }
  }

  private renderSummary(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
    const c = slide.content;
    const cx = this.width / 2;

    if (c.icon) {
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.icon, cx, 100);
    }

    if (c.heading) {
      ctx.font = '700 36px Inter, system-ui, sans-serif';
      ctx.fillStyle = this.theme.primaryColor;
      ctx.textAlign = 'center';
      ctx.fillText(c.heading, cx, 155);
    }

    if (c.summaryPoints) {
      c.summaryPoints.forEach((point, i) => {
        const pointProgress = Math.max(0, (progress - 0.15 - i * 0.12) * 5);
        const alpha = Math.min(1, pointProgress);
        const slideX = easeOutBack(Math.min(pointProgress, 1)) * 40 - 40;

        ctx.save();
        ctx.globalAlpha = alpha * ctx.globalAlpha;
        ctx.translate(slideX, 0);

        const y = 200 + i * 70;
        ctx.fillStyle = hexToRgba(this.theme.primaryColor, 0.08);
        ctx.beginPath();
        this.roundRect(ctx, 120, y, this.width - 240, 50, 8);
        ctx.fill();

        ctx.font = '20px serif';
        ctx.fillText('✦', 145, y + 32);

        ctx.font = '400 19px Inter, system-ui, sans-serif';
        ctx.fillStyle = this.theme.textColor;
        ctx.textAlign = 'left';
        ctx.fillText(point, 175, y + 32);

        ctx.restore();
      });
    }
  }

  private renderNextSteps(ctx: CanvasRenderingContext2D, slide: Slide, progress: number) {
     this.renderConcept(ctx, slide, progress);
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }

  // Visualization helper methods
  private drawRightTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, theme: LessonTheme) {
      const cx = x + w/2; const cy = y + h/2;
      ctx.strokeStyle = theme.primaryColor; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy + 40); ctx.lineTo(cx + 60, cy + 40);
      ctx.lineTo(cx - 60, cy - 80); ctx.closePath(); ctx.stroke();
  }

  private drawUnitCircle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, theme: LessonTheme) {
      const cx = x + w/2; const cy = y + h/2;
      ctx.strokeStyle = theme.primaryColor; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI*2); ctx.stroke();
  }

  private drawSineWave(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, theme: LessonTheme) {
      ctx.strokeStyle = theme.primaryColor; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < w - 40; i++) {
          const wx = x + 20 + i;
          const wy = y + h/2 + Math.sin(i * 0.05) * 40;
          if (i === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
  }

  private drawWorkedExample(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, theme: LessonTheme) {
      ctx.fillStyle = theme.textColor; ctx.font = '16px monospace';
      ctx.fillText("Step 1: Simplify", x + 20, y + 60);
      ctx.fillText("Step 2: Solve x", x + 20, y + 100);
  }
}
