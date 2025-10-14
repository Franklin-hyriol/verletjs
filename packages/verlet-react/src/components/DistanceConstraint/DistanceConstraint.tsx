import { useEffect } from 'react';
import { DistanceConstraint as VerletDistanceConstraint } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface DistanceConstraintProps {
  from: string;
  to: string;
  stiffness?: number;
}

export const DistanceConstraint: React.FC<DistanceConstraintProps> = ({ from, to, stiffness = 1 }) => {
  const { engine, getParticleById } = useVerletContext();

  useEffect(() => {
    if (!engine) return;

    const particleA = getParticleById(from);
    const particleB = getParticleById(to);

    if (particleA && particleB) {
      // Find the composite that particleA belongs to
      const ownerComposite = engine.composites.find(c => c.particles.includes(particleA));

      if (ownerComposite) {
        const constraint = new VerletDistanceConstraint(particleA, particleB, stiffness);
        ownerComposite.constraints.push(constraint);

        return () => {
          // Remove the constraint from the owner composite
          const index = ownerComposite.constraints.indexOf(constraint);
          if (index > -1) {
            ownerComposite.constraints.splice(index, 1);
          }
        };
      }
    }
  }, [engine, from, to, stiffness, getParticleById]);

  return null;
};