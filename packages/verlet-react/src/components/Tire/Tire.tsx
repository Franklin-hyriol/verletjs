import { useEffect } from 'react';
import { useVerletContext } from '../../hooks/useVerletContext';
import { tire, Vec2 } from 'verlet-engine';

interface TireProps {
  origin: Vec2;
  radius: number;
  segments: number;
  spokeStiffness: number;
  treadStiffness: number;
}

export const Tire = ({ origin, radius, segments, spokeStiffness, treadStiffness }: TireProps) => {
  const { engine } = useVerletContext();

  useEffect(() => {
    if (engine) {
      const t = tire(engine, origin, radius, segments, spokeStiffness, treadStiffness);
      return () => {
        engine.composites.splice(engine.composites.indexOf(t), 1);
      };
    }
  }, [engine, origin, radius, segments, spokeStiffness, treadStiffness]);

  return null;
};
