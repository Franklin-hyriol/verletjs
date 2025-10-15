import { useEffect, useRef } from 'react';
import { Vec2, PlaneConstraint as VerletPlaneConstraint, type ConstraintStyle } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface PlaneConstraintProps {
  particle: string;
  origin: Vec2;
  normal: Vec2;
  style?: ConstraintStyle;
}

export const PlaneConstraint: React.FC<PlaneConstraintProps> = ({ particle: particleId, origin, normal, style }) => {
  const { engine, getParticleById } = useVerletContext();
  const constraintRef = useRef<VerletPlaneConstraint | null>(null);

  // Effect for creation and destruction
  useEffect(() => {
    if (!engine) return;

    const particleA = getParticleById(particleId);

    if (particleA) {
      const ownerComposite = engine.composites.find(c => c.particles.includes(particleA));

      if (ownerComposite) {
        const constraint = new VerletPlaneConstraint(particleA, origin, normal, style);
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
  }, [engine, particleId, getParticleById]);

  // Note: origin and normal are Vec2 objects. For robust updates, they should be memoized
  // by the parent component. Here, we assume they are stable.

  // Effect for updating style
  useEffect(() => {
    if (constraintRef.current && style) {
      constraintRef.current.style = style;
    }
  }, [style]);

  return null;
};
