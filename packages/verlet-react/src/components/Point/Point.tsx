import { useEffect, useRef } from 'react';
import { Vec2, Particle, Composite, PinConstraint, type ParticleStyle } from 'verlet-engine';
import { useVerletContext } from '../../hooks/useVerletContext';

interface PointProps {
  id: string;
  pos: Vec2;
  pinned?: boolean;
  mass?: number;
  style?: ParticleStyle;
}

export const Point: React.FC<PointProps> = ({ id, pos, pinned = false, mass, style }) => {
  const { engine, registerParticle, unregisterParticle } = useVerletContext();
  const particleRef = useRef<Particle | null>(null);

  // Effect for creation and destruction
  useEffect(() => {
    if (!engine) return;

    const particle = new Particle(pos);
    particleRef.current = particle;

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
      particleRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, id, pos, pinned, registerParticle, unregisterParticle]);

  // Effect for updating mass
  useEffect(() => {
    if (particleRef.current && mass !== undefined) {
      particleRef.current.mass = mass;
    }
  }, [mass]);

  // Effect for updating style
  useEffect(() => {
    if (particleRef.current && style) {
      particleRef.current.style = style;
    }
  }, [style]);

  return null;
};
