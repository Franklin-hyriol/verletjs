import { useEffect } from 'react';
import { useVerletContext } from '../../hooks/useVerletContext';
import { cloth, Vec2 } from 'verlet-engine';

interface ClothProps {
  origin: Vec2;
  width: number;
  height: number;
  segmentsX: number;
  segmentsY: number;
  pinMod: number;
  stiffness: number;
}

export const Cloth = ({ origin, width, height, segmentsX, segmentsY, pinMod, stiffness }: ClothProps) => {
  const { engine } = useVerletContext();

  useEffect(() => {
    if (engine) {
      const c = cloth(engine, origin, width, height, segmentsX, segmentsY, pinMod, stiffness);
      return () => {
        engine.composites.splice(engine.composites.indexOf(c), 1);
      };
    }
  }, [engine, origin, width, height, segmentsX, segmentsY, pinMod, stiffness]);

  return null;
};