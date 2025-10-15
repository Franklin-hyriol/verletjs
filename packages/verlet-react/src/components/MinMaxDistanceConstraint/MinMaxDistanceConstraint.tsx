import { useEffect, useRef } from 'react';
import { MinMaxDistanceConstraint as VerletMinMaxDistanceConstraint, type ConstraintStyle } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface MinMaxDistanceConstraintProps {
  from: string;
  to: string;
  minDistance: number;
  maxDistance: number;
  stiffness?: number;
  style?: ConstraintStyle;
}

export const MinMaxDistanceConstraint: React.FC<MinMaxDistanceConstraintProps> = ({ 
  from, 
  to, 
  minDistance, 
  maxDistance, 
  stiffness = 1, 
  style 
}) => {
  const { engine, getParticleById } = useVerletContext();
  const constraintRef = useRef<VerletMinMaxDistanceConstraint | null>(null);

  // Effect for creation and destruction
  useEffect(() => {
    if (!engine) return;

    const particleA = getParticleById(from);
    const particleB = getParticleById(to);

    if (particleA && particleB) {
      const ownerComposite = engine.composites.find(c => c.particles.includes(particleA));

      if (ownerComposite) {
        const constraint = new VerletMinMaxDistanceConstraint(particleA, particleB, minDistance, maxDistance, stiffness);
        constraintRef.current = constraint;
        ownerComposite.constraints.push(constraint);

        return () => {
          const index = ownerComposite.constraints.indexOf(constraint);
          if (index > -1) {
            ownerComposite.constraints.splice(index, 1);
          }
          constraintRef.current = null;
        };
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, from, to, getParticleById]);

  // Effect for updating stiffness
  useEffect(() => {
    if (constraintRef.current && stiffness !== undefined) {
      constraintRef.current.stiffness = stiffness;
    }
  }, [stiffness]);

  // Effect for updating minDistance
  useEffect(() => {
    if (constraintRef.current && minDistance !== undefined) {
      constraintRef.current.minDistance = minDistance;
    }
  }, [minDistance]);

  // Effect for updating maxDistance
  useEffect(() => {
    if (constraintRef.current && maxDistance !== undefined) {
      constraintRef.current.maxDistance = maxDistance;
    }
  }, [maxDistance]);

  // Effect for updating style
  useEffect(() => {
    if (constraintRef.current && style) {
      constraintRef.current.style = style;
    }
  }, [style]);

  return null;
};
