import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { VerletContext, type VerletContextType } from '../../context/VerletContext';
import { useVerlet } from '../../hooks/useVerlet';
import { Composite, Particle, type VerletOptions, type IConstraint } from 'verlet-engine';

interface VerletCanvasProps extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'onMouseLeave'> {
  width: number;
  height: number;
  children?: React.ReactNode;
  options?: VerletOptions;
  cursor?: string;
  onCanvasMouseDown?: (event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => void;
  onCanvasMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => void;
  onCanvasMouseUp?: (event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => void;
  onCanvasMouseLeave?: (event: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => void;
}

export const VerletCanvas: React.FC<VerletCanvasProps> = ({ 
  width, 
  height, 
  children, 
  options,
  cursor,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasMouseLeave,
  ...props 
}) => {
  const { engine, composites } = useVerlet({ width, height, options });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleIdMap = useRef<Map<string, Particle>>(new Map());

  const getParticleById = useCallback((id: string) => particleIdMap.current.get(id), []);
  
  const registerParticle = useCallback((id: string, particle: Particle) => {
    particleIdMap.current.set(id, particle);
  }, []);

  const unregisterParticle = useCallback((id: string) => {
    particleIdMap.current.delete(id);
  }, []);

  const contextValue = useMemo((): VerletContextType | null => {
    if (!engine) return null;
    return {
      engine,
      getParticleById,
      registerParticle,
      unregisterParticle,
    };
  }, [engine, getParticleById, registerParticle, unregisterParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, width, height);
    for (const c of composites) {
      for (const constraint of c.constraints as IConstraint[]) {
        if (typeof constraint.draw === 'function') constraint.draw(ctx);
      }
      for (const p of c.particles) {
        ctx.beginPath();
        const radius = p.style?.radius || 2;
        const color = p.style?.color || '#2dad8f';
        ctx.arc(p.pos.x, p.pos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }, [composites, width, height, engine]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => onCanvasMouseDown?.(e, composites);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => onCanvasMouseMove?.(e, composites);
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => onCanvasMouseUp?.(e, composites);
  const handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => onCanvasMouseLeave?.(e, composites);

  if (!contextValue) return null;

  return (
    <VerletContext.Provider value={contextValue}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: `${width}px`, height: `${height}px`, cursor: cursor || 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
      {children}
    </VerletContext.Provider>
  );
};