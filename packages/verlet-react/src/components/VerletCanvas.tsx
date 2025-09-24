import React, { useRef, useEffect, useMemo } from 'react';
import { useVerlet } from '../hooks/useVerlet';
import { Vec2, PinConstraint } from 'verlet-engine';
import { VerletContext } from '../context/VerletContext';

// Define the props for the VerletCanvas component
interface VerletCanvasProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

/**
 * A React component that provides a canvas for rendering a VerletJS simulation.
 * It handles the simulation loop, drawing, and mouse interactions.
 */
export const VerletCanvas: React.FC<VerletCanvasProps> = ({ width, height, children }) => {
  // Use our custom hook to manage the simulation
  const { engine, composites } = useVerlet({ width, height });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create the context value
  const contextValue = useMemo(() => ({ engine }), [engine]);

  // Refs for mouse interaction state
  const mouse = useRef(new Vec2(0, 0));
  const draggedEntity = useRef<any>(null);

  // This effect handles all the drawing on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- High-density (Retina) screen scaling ---
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }

    // --- Drawing Logic ---
    ctx.clearRect(0, 0, width, height);

    for (const c of composites) {
      // Draw constraints
      for (const constraint of c.constraints) {
        if (typeof constraint.draw === 'function') {
          constraint.draw(ctx);
        }
      }

      // Draw particles
      for (const p of c.particles) {
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#2dad8f";
        ctx.fill();
      }
    }

    // Highlight dragged or nearest entity
    const nearest = draggedEntity.current || nearestEntity();
    if (nearest) {
        ctx.beginPath();
        ctx.arc(nearest.pos.x, nearest.pos.y, 8, 0, 2 * Math.PI);
        ctx.strokeStyle = "#4f545c";
        ctx.stroke();
    }

  }, [composites, width, height, engine]); // Re-run effect if composites or dimensions change


  // --- Mouse Interaction Logic ---

  const nearestEntity = () => {
    if (!engine) return null;
    let d2Nearest = Infinity;
    let entity = null;
    const selectionRadius = 20;

    for (const c of engine.composites) {
        for (const p of c.particles) {
            const d2 = p.pos.dist2(mouse.current);
            if (d2 < d2Nearest && d2 < selectionRadius * selectionRadius) {
                entity = p;
                d2Nearest = d2;
            }
        }
    }
    
    for (const c of engine.composites) {
        for (const constraint of c.constraints) {
            if (constraint instanceof PinConstraint && constraint.a === entity) {
                return constraint;
            }
        }
    }

    return entity;
  }

  const handleMouseDown = () => {
    draggedEntity.current = nearestEntity();
  };

  const handleMouseUp = () => {
    draggedEntity.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.current.x = e.clientX - rect.left;
    mouse.current.y = e.clientY - rect.top;
    
    if (draggedEntity.current) {
        draggedEntity.current.pos.mutableSet(mouse.current);
    }
  };

  // The component renders the canvas and provides the simulation context to its children.
  return (
    <VerletContext.Provider value={contextValue}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: `${width}px`, height: `${height}px` }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves canvas
      />
      {children}
    </VerletContext.Provider>
  );
};
