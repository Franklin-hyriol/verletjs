import { useEffect, useRef } from 'react';
import { MinMaxAngleConstraint as VerletMinMaxAngleConstraint, type ConstraintStyle } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface MinMaxAngleConstraintProps {
  from: string;
  center: string;
  to: string;
  minAngle: number;
  maxAngle: number;
  stiffness?: number;
  style?: ConstraintStyle;
}

export const MinMaxAngleConstraint: React.FC<MinMaxAngleConstraintProps> = ({
  from,
  center,
  to,
  minAngle,
  maxAngle,
  stiffness = 1,
  style,
}) => {
  const { engine, getParticleById } = useVerletContext();
  const constraintRef = useRef<VerletMinMaxAngleConstraint | null>(null);

  // Effect for creation and destruction
  useEffect(() => {
    if (!engine) return;

    const particleA = getParticleById(from);
    const particleB = getParticleById(center);
    const particleC = getParticleById(to);

    if (particleA && particleB && particleC) {
      const ownerComposite = engine.composites.find(c => c.particles.includes(particleB));

      if (ownerComposite) {
        const constraint = new VerletMinMaxAngleConstraint(particleA, particleB, particleC, minAngle, maxAngle, stiffness);
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
  
  // Effect for updating minAngle
  useEffect(() => {
    if (constraintRef.current && minAngle !== undefined) {
      constraintRef.current.minAngle = minAngle;
    }
  }, [minAngle]);

  // Effect for updating maxAngle
  useEffect(() => {
    if (constraintRef.current && maxAngle !== undefined) {
      constraintRef.current.maxAngle = maxAngle;
    }
  }, [maxAngle]);

  // Effect for updating style
  useEffect(() => {
    if (constraintRef.current && style) {
      constraintRef.current.style = style;
    }
  }, [style]);

  return null;
};
