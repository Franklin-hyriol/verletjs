import { useEffect, useRef } from 'react';
import { CollisionConstraint as VerletCollisionConstraint, type ConstraintStyle } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface CollisionConstraintProps {
  from: string;
  to: string;
  stiffness?: number;
  style?: ConstraintStyle;
}

export const CollisionConstraint: React.FC<CollisionConstraintProps> = ({ from, to, stiffness = 1, style }) => {
  const { engine, getParticleById } = useVerletContext();
  const constraintRef = useRef<VerletCollisionConstraint | null>(null);

  // Effect for creation and destruction
  useEffect(() => {
    if (!engine) return;

    const particleA = getParticleById(from);
    const particleB = getParticleById(to);

    if (particleA && particleB) {
      const ownerComposite = engine.composites.find(c => c.particles.includes(particleA));

      if (ownerComposite) {
        const constraint = new VerletCollisionConstraint(particleA, particleB, stiffness);
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

  // Effect for updating style
  useEffect(() => {
    if (constraintRef.current && style) {
      constraintRef.current.style = style;
    }
  }, [style]);

  return null;
};
