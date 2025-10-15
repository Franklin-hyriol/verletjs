import { useEffect, useRef } from 'react';
import { DistanceConstraint as VerletDistanceConstraint, type ConstraintStyle } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface DistanceConstraintProps {
  from: string;
  to: string;
  stiffness?: number;
  distance?: number;
  style?: ConstraintStyle;
}

export const DistanceConstraint: React.FC<DistanceConstraintProps> = ({ from, to, stiffness = 1, distance, style }) => {
  const { engine, getParticleById } = useVerletContext();
  const constraintRef = useRef<VerletDistanceConstraint | null>(null);

  // Effect for creation and destruction
  useEffect(() => {
    if (!engine) return;

    const particleA = getParticleById(from);
    const particleB = getParticleById(to);

    if (particleA && particleB) {
      const ownerComposite = engine.composites.find(c => c.particles.includes(particleA));

      if (ownerComposite) {
        const constraint = new VerletDistanceConstraint(particleA, particleB, stiffness, distance);
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

  // Effect for updating distance
  useEffect(() => {
    if (constraintRef.current && distance !== undefined) {
      constraintRef.current.distance = distance;
    }
  }, [distance]);

  // Effect for updating style
  useEffect(() => {
    if (constraintRef.current && style) {
      constraintRef.current.style = style;
    }
  }, [style]);

  return null;
};
