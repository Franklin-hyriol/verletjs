import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VerletCanvas, Cloth } from 'verlet-react';
import { Vec2, type Particle, type Composite } from 'verlet-engine';
import { Leva, useControls } from 'leva';
import { lerp, parseColor, lerpColor } from '@site/src/utils/color';
import styles from './styles.module.css';

export default function InteractiveDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dragged, setDragged] = useState<Particle | null>(null);

  const { gravity, friction, stiffness, restitution, solverIterations, pinMod, segmentsX, segmentsY } = useControls("Simulation", {
    gravity: { value: 0.5, min: -2, max: 2, step: 0.1 },
    friction: { value: 0.99, min: 0.9, max: 1, step: 0.005 },
    stiffness: { value: 0.9, min: 0.1, max: 1, step: 0.05 },
    restitution: { value: 0.2, min: 0, max: 1, step: 0.05 },
    solverIterations: { value: 3, min: 1, max: 10, step: 1 },
    pinMod: { label: "Pinning Interval", value: 5, min: 1, max: 50, step: 1 },
    segmentsX: { label: "Segments X", value: 30, min: 5, max: 50, step: 1 },
    segmentsY: { label: "Segments Y", value: 20, min: 5, max: 50, step: 1 },
  });

  const { lowStressColor, midStressColor, highStressColor } = useControls("Colors", {
    lowStressColor: { label: "Low Stress", value: '#00ff00' },
    midStressColor: { label: "Mid Stress", value: '#ffff00' },
    highStressColor: { label: "High Stress", value: '#ff0000' },
  });

  // This effect sets up a ResizeObserver to keep the canvas dimensions
  // in sync with its container div, making the demo responsive.
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // --- Mouse Interaction Handlers ---
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const mousePos = new Vec2(event.clientX - rect.left, event.clientY - rect.top);

    let nearest: Particle | null = null;
    let min_dist_sq = Infinity;
    const selectionRadius = 20;

    for (const c of composites) {
      for (const p of c.particles) {
        const dist_sq = p.pos.dist2(mousePos);
        if (dist_sq < min_dist_sq && dist_sq < selectionRadius * selectionRadius) {
          nearest = p;
          min_dist_sq = dist_sq;
        }
      }
    }
    if (nearest) {
      setDragged(nearest);
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragged) {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mousePos = new Vec2(event.clientX - rect.left, event.clientY - rect.top);
      dragged.pos.x = mousePos.x;
      dragged.pos.y = mousePos.y;
    }
  }, [dragged]);

  const handleMouseUp = useCallback(() => {
    setDragged(null);
  }, []);

  // Memoize objects to prevent re-creating them on every render
  const clothOrigin = useMemo(() => {
    return new Vec2(dimensions.width / 2, dimensions.height / 4);
  }, [dimensions.width, dimensions.height]);

  const verletOptions = useMemo(() => ({
    gravity: new Vec2(0, gravity),
    friction,
    restitution,
    solverIterations,
  }), [gravity, friction, restitution, solverIterations]);

  // This is the custom rendering function passed to VerletCanvas.
  const customClothRenderer = useCallback((ctx: CanvasRenderingContext2D, composites: Composite[]) => {
    const clothComposite = composites.find(c => c.particles.length > 0);
    if (!clothComposite) return;

    const particles = clothComposite.particles;
    const xStride = (dimensions.width * 0.8) / segmentsX;

    const lowColor = parseColor(lowStressColor);
    const midColor = parseColor(midStressColor);
    const highColor = parseColor(highStressColor);

    for (let y = 1; y < segmentsY; y++) {
      for (let x = 1; x < segmentsX; x++) {
        ctx.beginPath();

        const i1 = (y - 1) * segmentsX + x - 1;
        const i2 = y * segmentsX + x;

        if (!particles[i1] || !particles[i1 + 1] || !particles[i2] || !particles[i2 - 1]) continue;

        ctx.moveTo(particles[i1].pos.x, particles[i1].pos.y);
        ctx.lineTo(particles[i1 + 1].pos.x, particles[i1 + 1].pos.y);
        ctx.lineTo(particles[i2].pos.x, particles[i2].pos.y);
        ctx.lineTo(particles[i2 - 1].pos.x, particles[i2 - 1].pos.y);

        let off = particles[i2].pos.x - particles[i1].pos.x;
        off += particles[i2].pos.y - particles[i1].pos.y;
        off *= 0.25;

        let stress = Math.abs(off) / xStride;
        if (stress > 1) stress = 1;

        let finalColor:{r:number,g:number,b:number};
        if (stress < 0.5) {
          finalColor = lerpColor(lowColor, midColor, stress * 2);
        } else {
          finalColor = lerpColor(midColor, highColor, (stress - 0.5) * 2);
        }

        const alpha = lerp(0.3, 1, stress);
        ctx.fillStyle = `rgba(${Math.round(finalColor.r)}, ${Math.round(finalColor.g)}, ${Math.round(finalColor.b)}, ${alpha})`;
        ctx.fill();
      }
    }
  }, [dimensions.width, segmentsX, segmentsY, lowStressColor, midStressColor, highStressColor]);

  return (
    <>
      <Leva collapsed={false} />
      <div ref={containerRef} className={styles.canvaContainer}>
        {dimensions.width > 0 && (
          <VerletCanvas
            width={dimensions.width}
            height={dimensions.height}
            options={verletOptions}
            onCanvasMouseDown={handleMouseDown}
            onCanvasMouseMove={handleMouseMove}
            onCanvasMouseUp={handleMouseUp}
            onCanvasMouseLeave={handleMouseUp}
            customRenderer={customClothRenderer}
          >
            <Cloth
              origin={clothOrigin}
              width={dimensions.width * 0.8}
              height={dimensions.height * 0.5}
              segmentsX={segmentsX}
              segmentsY={segmentsY}
              pinMod={pinMod}
              stiffness={stiffness}
            />
          </VerletCanvas>
        )}
      </div>
    </>
  );
}