import { useEffect } from 'react';
import { useVerletContext } from '../../hooks/useVerletContext';
import { lineSegments, Vec2 } from 'verlet-engine';

interface LineSegmentsProps {
  vertices: Vec2[];
  stiffness: number;
  pins?: number[];
}

export const LineSegments = ({ vertices, stiffness, pins }: LineSegmentsProps) => {
  const { engine } = useVerletContext();

  useEffect(() => {
    if (engine) {
      const segment = lineSegments(engine, vertices, stiffness);
      if (pins) {
        pins.forEach(pin => segment.pin(pin));
      }
      return () => {
        engine.composites.splice(engine.composites.indexOf(segment), 1);
      };
    }
  }, [engine, vertices, stiffness, pins]);

  return null;
};
