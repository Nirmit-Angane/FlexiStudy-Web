// ThemeRenderer — Renders themed backgrounds with particle systems on canvas

import { LessonTheme, ParticleStyle } from '@/lib/types';
import { hexToRgba } from '@/lib/animations';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  angle: number;
  // For molecule/network connections
  connections?: number[];
}

export class ThemeRenderer {
  private particles: Particle[] = [];
  private width: number;
  private height: number;
  private theme: LessonTheme;
  private initialized = false;

  constructor(width: number, height: number, theme: LessonTheme) {
    this.width = width;
    this.height = height;
    this.theme = theme;
  }

  init() {
    this.particles = [];
    const count = this.getParticleCount();
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(true));
    }
    this.initialized = true;
  }

  private getParticleCount(): number {
    const counts: Record<ParticleStyle, number> = {
      stars: 80,
      dots: 50,
      molecules: 30,
      network: 25,
      leaves: 20,
      bubbles: 25,
      grid: 0, // Handled separately
    };
    return counts[this.theme.particleStyle] || 40;
  }

  private createParticle(randomAge: boolean): Particle {
    const style = this.theme.particleStyle;
    const maxLife = 200 + Math.random() * 300;

    const p: Particle = {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: 0,
      vy: 0,
      size: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.6,
      life: randomAge ? Math.random() * maxLife : 0,
      maxLife,
      angle: Math.random() * Math.PI * 2,
    };

    switch (style) {
      case 'stars':
        p.size = 0.5 + Math.random() * 2.5;
        p.vx = (Math.random() - 0.5) * 0.1;
        p.vy = (Math.random() - 0.5) * 0.1;
        break;
      case 'dots':
        p.size = 1 + Math.random() * 2;
        p.vx = (Math.random() - 0.5) * 0.3;
        p.vy = -0.2 - Math.random() * 0.3;
        break;
      case 'molecules':
        p.size = 3 + Math.random() * 4;
        p.vx = (Math.random() - 0.5) * 0.4;
        p.vy = (Math.random() - 0.5) * 0.4;
        break;
      case 'network':
        p.size = 2 + Math.random() * 3;
        p.vx = (Math.random() - 0.5) * 0.2;
        p.vy = (Math.random() - 0.5) * 0.2;
        break;
      case 'leaves':
        p.size = 4 + Math.random() * 6;
        p.vx = 0.3 + Math.random() * 0.5;
        p.vy = -0.3 - Math.random() * 0.3;
        break;
      case 'bubbles':
        p.size = 2 + Math.random() * 5;
        p.vx = (Math.random() - 0.5) * 0.2;
        p.vy = -0.3 - Math.random() * 0.4;
        break;
    }

    return p;
  }

  update() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.angle += 0.01;

      // Wrap around
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;

      // Fade in/out based on life
      const lifeProgress = p.life / p.maxLife;
      if (lifeProgress < 0.1) {
        p.opacity = lifeProgress * 10 * 0.6;
      } else if (lifeProgress > 0.9) {
        p.opacity = (1 - lifeProgress) * 10 * 0.6;
      }

      if (p.life > p.maxLife) {
        Object.assign(p, this.createParticle(false));
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.initialized) this.init();

    // Background
    ctx.fillStyle = this.theme.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle radial gradient overlay
    const glow = this.theme.glowColor || this.theme.primaryColor || '#000000';
    const gradient = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, this.width * 0.7
    );
    gradient.addColorStop(0, hexToRgba(glow, 0.15));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Apply grid background if selected
    if (this.theme.particleStyle === 'grid') {
      this.renderGridBackground(ctx);
      return; // Skip standard particles
    }

    // Render particles
    this.update();
    const style = this.theme.particleStyle;

    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.opacity;

      switch (style) {
        case 'stars':
          this.renderStar(ctx, p);
          break;
        case 'dots':
          this.renderDot(ctx, p);
          break;
        case 'molecules':
          this.renderMolecule(ctx, p);
          break;
        case 'network':
          this.renderNetworkNode(ctx, p);
          break;
        case 'leaves':
          this.renderLeaf(ctx, p);
          break;
        case 'bubbles':
          this.renderBubble(ctx, p);
          break;
      }

      ctx.restore();
    }

    // Network/molecule connections
    if (style === 'network' || style === 'molecules') {
      this.renderConnections(ctx);
    }
  }

  private renderStar(ctx: CanvasRenderingContext2D, p: Particle) {
    const twinkle = 0.5 + 0.5 * Math.sin(p.life * 0.05 + p.angle);
    ctx.globalAlpha = p.opacity * twinkle;
    ctx.fillStyle = p.size > 2 ? this.theme.primaryColor : '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * twinkle, 0, Math.PI * 2);
    ctx.fill();

    // Glow for larger stars
    if (p.size > 1.5) {
      ctx.globalAlpha = p.opacity * twinkle * 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderDot(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.fillStyle = hexToRgba(this.theme.primaryColor, p.opacity * 0.5);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderMolecule(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.fillStyle = hexToRgba(this.theme.primaryColor, p.opacity * 0.6);
    ctx.strokeStyle = hexToRgba(this.theme.primaryColor, p.opacity * 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private renderNetworkNode(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.fillStyle = hexToRgba(this.theme.primaryColor, p.opacity * 0.7);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Pulse ring
    const pulse = Math.sin(p.life * 0.03) * 0.5 + 0.5;
    ctx.strokeStyle = hexToRgba(this.theme.primaryColor, p.opacity * pulse * 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size + 3 + pulse * 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  private renderLeaf(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle + Math.sin(p.life * 0.02) * 0.5);
    ctx.fillStyle = hexToRgba(this.theme.primaryColor, p.opacity * 0.4);

    // Leaf shape
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size, -p.size * 0.5, p.size, p.size * 0.5, 0, p.size);
    ctx.bezierCurveTo(-p.size, p.size * 0.5, -p.size, -p.size * 0.5, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }

  private renderBubble(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.strokeStyle = hexToRgba(this.theme.primaryColor, p.opacity * 0.4);
    ctx.lineWidth = 1;
    const wobble = Math.sin(p.life * 0.03) * 0.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size + wobble, 0, Math.PI * 2);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = hexToRgba('#ffffff', p.opacity * 0.2);
    ctx.beginPath();
    ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderConnections(ctx: CanvasRenderingContext2D) {
    const maxDist = 120;
    ctx.strokeStyle = hexToRgba(this.theme.primaryColor, 0.1);
    ctx.lineWidth = 0.5;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.strokeStyle = hexToRgba(this.theme.primaryColor, alpha);
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  private renderGridBackground(ctx: CanvasRenderingContext2D) {
    const time = Date.now() * 0.0005;
    const spacing = 60;
    const offsetX = (time * 20) % spacing;
    const offsetY = (time * 20) % spacing;

    ctx.strokeStyle = hexToRgba(this.theme.primaryColor, 0.1);
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Vertical lines
    for (let x = offsetX; x < this.width; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }

    // Horizontal lines
    for (let y = offsetY; y < this.height; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    
    ctx.stroke();

    // Highlight intersections randomly
    ctx.fillStyle = hexToRgba(this.theme.accentColor, 0.3);
    for (let i = 0; i < 20; i++) {
      const rx = offsetX + Math.floor(Math.random() * (this.width / spacing)) * spacing;
      const ry = offsetY + Math.floor(Math.random() * (this.height / spacing)) * spacing;
      ctx.beginPath();
      ctx.arc(rx, ry, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
