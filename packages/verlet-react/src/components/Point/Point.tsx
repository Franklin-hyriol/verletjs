import { useEffect } from 'react';
import { useVerletContext } from '../../hooks/useVerletContext';
import { point, Vec2 } from 'verlet-engine';

interface PointProps {
  position: Vec2;
}

export const Point = ({ position }: PointProps) => {
  const { engine } = useVerletContext();

  useEffect(() => {
    if (engine) {
      const p = point(engine, position);
      return () => {
        engine.composites.splice(engine.composites.indexOf(p), 1);
      };
    }
  }, [engine, position]);

  return null;
};
