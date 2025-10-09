import React, { useRef, useEffect, useMemo } from 'react';
import { useVerlet, type VerletOptions } from '../../hooks/useVerlet';
import { VerletContext } from '../../context/VerletContext';
import type { IConstraint, Composite } from 'verlet-engine';

// Define the props for the VerletCanvas component
interface VerletCanvasProps extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'onMouseLeave'> {
  width: number;
  height: number;
  children?: React.ReactNode;
  options?: VerletOptions;
  onCanvasMouseDown?: (event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => void;
  onCanvasMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => void;
  onCanvasMouseUp?: (event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => void;
  onCanvasMouseLeave?: (event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => void;
}

/**
 * A React component that provides a canvas for rendering a VerletJS simulation.
 * It handles the simulation loop and drawing.
 */
export const VerletCanvas: React.FC<VerletCanvasProps> = ({ 
  width, 
  height, 
  children, 
  options,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasMouseLeave,
  ...props 
}) => {
  // Use our custom hook to manage the simulation
  const { engine, composites } = useVerlet({ width, height, options });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create the context value
  const contextValue = useMemo(() => ({ engine }), [engine]);

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
      for (const constraint of c.constraints as IConstraint[]) {
        if (typeof constraint.draw === 'function') {
          constraint.draw(ctx);
        }
      }

      // Draw particles
      for (const p of c.particles) {
        ctx.beginPath();
        const radius = p.style?.radius || 2;
        const color = p.style?.color || '#2dad8f';
        ctx.arc(p.pos.x, p.pos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }, [composites, width, height, engine]); // Re-run effect if composites or dimensions change

  // Explicit event handlers to ensure correct closure over `composites`
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (onCanvasMouseDown) onCanvasMouseDown(e, composites);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (onCanvasMouseMove) onCanvasMouseMove(e, composites);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (onCanvasMouseUp) onCanvasMouseUp(e, composites);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (onCanvasMouseLeave) onCanvasMouseLeave(e, composites);
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
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props} // Pass down any other props
      />
      {children}
    </VerletContext.Provider>
  );
};
