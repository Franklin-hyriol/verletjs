import { useEffect, useRef } from 'react';
import { AngleConstraint as VerletAngleConstraint, type ConstraintStyle } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface AngleConstraintProps {
  from: string;
  center: string;
  to: string;
  stiffness?: number;
  style?: ConstraintStyle;
}

export const AngleConstraint: React.FC<AngleConstraintProps> = ({ from, center, to, stiffness = 1, style }) => {
  const { engine, getParticleById } = useVerletContext();
  const constraintRef = useRef<VerletAngleConstraint | null>(null);

  // Effect for creation and destruction
  useEffect(() => {
    if (!engine) return;

    const particleA = getParticleById(from);
    const particleB = getParticleById(center);
    const particleC = getParticleById(to);

    if (particleA && particleB && particleC) {
      // Assume all particles are in the same composite, find it using the center particle
      const ownerComposite = engine.composites.find(c => c.particles.includes(particleB));

      if (ownerComposite) {
        const constraint = new VerletAngleConstraint(particleA, particleB, particleC, stiffness);
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
  }, [engine, from, center, to, getParticleById]);

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
