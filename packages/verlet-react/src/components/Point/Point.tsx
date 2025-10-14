import { useEffect } from 'react';
import { Vec2, Particle, Composite, PinConstraint } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface PointProps {
  id: string;
  pos: Vec2;
  pinned?: boolean;
}

export const Point: React.FC<PointProps> = ({ id, pos, pinned = false }) => {
  const { engine, registerParticle, unregisterParticle } = useVerletContext();

  useEffect(() => {
    if (!engine) return;

    const particle = new Particle(pos);
    const composite = new Composite();
    composite.particles.push(particle);

    if (pinned) {
      const pin = new PinConstraint(particle, particle.pos);
      composite.constraints.push(pin);
    }
    
    engine.composites.push(composite);
    registerParticle(id, particle);

    return () => {
      unregisterParticle(id);
      const index = engine.composites.indexOf(composite);
      if (index > -1) {
        engine.composites.splice(index, 1);
      }
    };
  }, [engine, id, pos, pinned, registerParticle, unregisterParticle]);

  return null;
};
