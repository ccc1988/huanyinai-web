"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * NeuralBackground — Canvas 2D 神经场混合背景
 *
 * 5 层视觉（L1 渐变底层由 Hero 保留的 CSS 负责）：
 *   L2 星尘漂浮 / L3 神经网络节点+连线 / L4 偶发数据流 / L5 鼠标交互
 *
 * 克制高级派基调：默认安静呼吸，鼠标进入才"醒来"。
 * 无任何外部依赖，Canvas 2D + requestAnimationFrame。
 */
export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      setSupported(false);
      return;
    }
    // 非空别名，让 TS 空值收窄穿透闭包
    const cv = canvas;
    const c2d = ctx;

    // ---- 能力检测 ----
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const reduced = Boolean(shouldReduceMotion);

    // ---- 尺寸与 DPR ----
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ---- 配色 ----
    const COLORS = {
      node: [99, 102, 241] as const, // #6366f1
      nodeLight: [199, 210, 254] as const, // #c7d2fe
      star: [255, 255, 255] as const,
      link: [99, 102, 241] as const,
      stream: [6, 182, 212] as const, // #06b6d4
      halo: [99, 102, 241] as const,
    };

    // ---- 调参常量 ----
    const NODE_COUNT = isTouch ? 35 : 70;
    const STAR_COUNT = isTouch ? 80 : 150;
    const LINK_DIST = 140; // 连线距离阈值
    const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
    const MOUSE_RADIUS = 180; // 鼠标影响半径
    const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
    const REPULSE_DIST = 60; // 近距斥力半径
    const DRIFT_SPEED = 0.15; // 节点漂移速度上限

    // ---- 粒子数组（预分配）----
    type Node = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
    };
    type Star = {
      x: number;
      y: number;
      baseAlpha: number;
      alpha: number;
      twinklePhase: number;
      twinkleSpeed: number;
    };
    const nodes: Node[] = [];
    const stars: Star[] = [];

    function initParticles() {
      nodes.length = 0;
      stars.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * DRIFT_SPEED * 2,
          vy: (Math.random() - 0.5) * DRIFT_SPEED * 2,
          baseRadius: 1 + Math.random() * 1.5,
          radius: 0,
          baseAlpha: 0.25 + Math.random() * 0.25,
          alpha: 0,
        });
      }
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseAlpha: 0.1 + Math.random() * 0.3,
          alpha: 0,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.003 + Math.random() * 0.007,
        });
      }
    }

    function resize() {
      const parent = cv.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      cv.width = width * dpr;
      cv.height = height * dpr;
      cv.style.width = width + "px";
      cv.style.height = height + "px";
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    // ---- 鼠标状态（rAF 对齐）----
    const mouse = { x: -9999, y: -9999, active: false };
    let mouseDirty = false;
    function onMouseMove(e: MouseEvent) {
      const rect = cv.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      mouseDirty = true;
    }
    function onMouseLeave() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    // ---- 数据流系统 ----
    type DataStream = {
      progress: number; // 0 → 1
      duration: number; // ms
      angle: number; // 斜率
      thickness: number;
      alpha: number;
    };
    let stream: DataStream | null = null;
    let nextStreamTime = performance.now() + 3000 + Math.random() * 5000;

    // ---- 动画循环 ----
    let rafId = 0;
    let running = true;
    let lastFrame = performance.now();

    function drawFrame(now: number) {
      if (!running) return;
      const dt = Math.min((now - lastFrame) / 16.67, 3); // 归一化到 ~60fps，上限 3x
      lastFrame = now;

      c2d.clearRect(0, 0, width, height);

      // ===== L2: 星尘 =====
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.twinklePhase += s.twinkleSpeed * dt;
        s.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(s.twinklePhase));
        c2d.beginPath();
        c2d.arc(s.x, s.y, 0.8, 0, Math.PI * 2);
        c2d.fillStyle = `rgba(${COLORS.star[0]},${COLORS.star[1]},${COLORS.star[2]},${s.alpha})`;
        c2d.fill();
      }

      // ===== L3: 神经网络节点 + L5: 鼠标交互 =====
      const mx = mouse.x;
      const my = mouse.y;
      const mouseActive = !isTouch && mouse.active;

      // 更新节点位置 + 鼠标力
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        if (!reduced) {
          n.x += n.vx * dt;
          n.y += n.vy * dt;

          // 边界回弹
          if (n.x < 0 || n.x > width) {
            n.vx *= -1;
            n.x = Math.max(0, Math.min(width, n.x));
          }
          if (n.y < 0 || n.y > height) {
            n.vy *= -1;
            n.y = Math.max(0, Math.min(height, n.y));
          }
        }

        // 鼠标交互
        n.alpha = n.baseAlpha;
        n.radius = n.baseRadius;
        if (mouseActive) {
          const dx = mx - n.x;
          const dy = my - n.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_RADIUS_SQ) {
            const dist = Math.sqrt(distSq) || 1;
            const influence = 1 - dist / MOUSE_RADIUS; // 0→1
            // 激活：提升 alpha
            n.alpha = n.baseAlpha + influence * 0.5;
            n.radius = n.baseRadius + influence * 1.2;
            // 引力聚拢（轻微）
            const gravCoef = 0.02 * influence;
            n.vx += (dx / dist) * gravCoef * dt;
            n.vy += (dy / dist) * gravCoef * dt;
            // 近距斥力（避免压住光标）
            if (dist < REPULSE_DIST) {
              const repulse = 0.06 * (1 - dist / REPULSE_DIST);
              n.vx -= (dx / dist) * repulse * dt;
              n.vy -= (dy / dist) * repulse * dt;
            }
          }
        }

        // 速度阻尼，防止引力累积过快
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > DRIFT_SPEED) {
          n.vx = (n.vx / speed) * DRIFT_SPEED;
          n.vy = (n.vy / speed) * DRIFT_SPEED;
        }
      }

      // 绘制连线（先于节点，让节点在上层）
      c2d.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < LINK_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            let linkAlpha = 0.15 * (1 - dist / LINK_DIST);

            // 鼠标激活连线变亮
            if (mouseActive) {
              const midX = (a.x + b.x) * 0.5;
              const midY = (a.y + b.y) * 0.5;
              const mdx = mx - midX;
              const mdy = my - midY;
              const mDistSq = mdx * mdx + mdy * mdy;
              if (mDistSq < MOUSE_RADIUS_SQ) {
                linkAlpha += 0.3 * (1 - Math.sqrt(mDistSq) / MOUSE_RADIUS);
              }
            }
            linkAlpha = Math.min(linkAlpha, 0.45);

            c2d.beginPath();
            c2d.moveTo(a.x, a.y);
            c2d.lineTo(b.x, b.y);
            c2d.strokeStyle = `rgba(${COLORS.link[0]},${COLORS.link[1]},${COLORS.link[2]},${linkAlpha})`;
            c2d.stroke();
          }
        }
      }

      // 绘制节点
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        c2d.beginPath();
        c2d.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        // 被激活的节点用浅色，否则用主色
        const useLight = n.alpha > 0.55;
        const c = useLight ? COLORS.nodeLight : COLORS.node;
        c2d.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${n.alpha})`;
        c2d.fill();
      }

      // ===== L5: 鼠标能量光晕 =====
      if (mouseActive) {
        const haloRadius = 160;
        const gradient = c2d.createRadialGradient(
          mx,
          my,
          0,
          mx,
          my,
          haloRadius,
        );
        gradient.addColorStop(0, `rgba(${COLORS.halo[0]},${COLORS.halo[1]},${COLORS.halo[2]},0.12)`);
        gradient.addColorStop(1, `rgba(${COLORS.halo[0]},${COLORS.halo[1]},${COLORS.halo[2]},0)`);
        c2d.beginPath();
        c2d.arc(mx, my, haloRadius, 0, Math.PI * 2);
        c2d.fillStyle = gradient;
        c2d.fill();
      }

      // ===== L4: 偶发数据流 =====
      if (!reduced) {
        if (!stream && now > nextStreamTime) {
          stream = {
            progress: 0,
            duration: 1200 + Math.random() * 600,
            angle: (Math.random() - 0.5) * 0.3, // 轻微斜角
            thickness: 1.5 + Math.random() * 1.5,
            alpha: 0.15 + Math.random() * 0.1,
          };
        }
        if (stream) {
          stream.progress += dt * 16.67 / stream.duration;
          if (stream.progress >= 1) {
            stream = null;
            nextStreamTime = now + 3000 + Math.random() * 5000;
          } else {
            // 绘制斜向光带
            const p = stream.progress;
            const bandWidth = width * 0.6;
            const startX = -bandWidth + p * (width + bandWidth);
            const yOffset = stream.angle * width;
            const cy = height * 0.3 + yOffset * p;

            const grd = c2d.createLinearGradient(
              startX,
              cy,
              startX + bandWidth,
              cy + stream.angle * bandWidth,
            );
            const peak = stream.alpha * Math.sin(p * Math.PI); // 淡入淡出
            grd.addColorStop(0, `rgba(${COLORS.stream[0]},${COLORS.stream[1]},${COLORS.stream[2]},0)`);
            grd.addColorStop(0.5, `rgba(${COLORS.stream[0]},${COLORS.stream[1]},${COLORS.stream[2]},${peak})`);
            grd.addColorStop(1, `rgba(${COLORS.stream[0]},${COLORS.stream[1]},${COLORS.stream[2]},0)`);

            c2d.strokeStyle = grd;
            c2d.lineWidth = stream.thickness;
            c2d.beginPath();
            c2d.moveTo(startX, cy);
            c2d.lineTo(startX + bandWidth, cy + stream.angle * bandWidth);
            c2d.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(drawFrame);
    }

    // ---- 静态帧（reduced-motion）----
    function drawStatic() {
      c2d.clearRect(0, 0, width, height);
      // 星尘（固定 alpha）
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        c2d.beginPath();
        c2d.arc(s.x, s.y, 0.8, 0, Math.PI * 2);
        c2d.fillStyle = `rgba(${COLORS.star[0]},${COLORS.star[1]},${COLORS.star[2]},${s.baseAlpha})`;
        c2d.fill();
      }
      // 连线（静态）
      c2d.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < LINK_DIST_SQ) {
            const dist = Math.sqrt(distSq);
            const linkAlpha = 0.12 * (1 - dist / LINK_DIST);
            c2d.beginPath();
            c2d.moveTo(a.x, a.y);
            c2d.lineTo(b.x, b.y);
            c2d.strokeStyle = `rgba(${COLORS.link[0]},${COLORS.link[1]},${COLORS.link[2]},${linkAlpha})`;
            c2d.stroke();
          }
        }
      }
      // 节点
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        c2d.beginPath();
        c2d.arc(n.x, n.y, n.baseRadius, 0, Math.PI * 2);
        c2d.fillStyle = `rgba(${COLORS.node[0]},${COLORS.node[1]},${COLORS.node[2]},${n.baseAlpha})`;
        c2d.fill();
      }
    }

    // ---- 视口暂停（IntersectionObserver）----
    let observer: IntersectionObserver | null = null;
    function startAnimation() {
      if (reduced) {
        drawStatic();
        return;
      }
      running = true;
      lastFrame = performance.now();
      rafId = requestAnimationFrame(drawFrame);
    }
    function stopAnimation() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    // ---- 初始化 ----
    resize();

    if (!isTouch) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      cv.addEventListener("mouseleave", onMouseLeave);
    }
    window.addEventListener("resize", resize);

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    // ---- 清理 ----
    return () => {
      stopAnimation();
      if (!isTouch) {
        window.removeEventListener("mousemove", onMouseMove);
        cv.removeEventListener("mouseleave", onMouseLeave);
      }
      window.removeEventListener("resize", resize);
      if (observer) observer.disconnect();
    };
  }, [shouldReduceMotion]);

  if (!supported) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
