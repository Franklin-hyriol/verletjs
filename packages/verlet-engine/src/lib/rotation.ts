import type { Particle, Composite } from './verlet';
import type { Vec2 } from './vec2';

/**
 * Rotates a single particle around a center point.
 * This function is mutable and modifies the particle's internal state.
 * @param particle The particle to rotate.
 * @param center The center point of rotation.
 * @param angle The angle of rotation in radians.
 */
export function rotateParticle(particle: Particle, center: Vec2, angle: number) {
  particle.pos.mutableRotate(center, angle);
  particle.lastPos.mutableRotate(center, angle);
}

/**
 * Rotates all particles within a composite around a center point.
 * This function is mutable and modifies the internal state of all particles in the composite.
 * @param composite The composite to rotate.
 * @param center The center point of rotation.
 * @param angle The angle of rotation in radians.
 */
export function rotateComposite(composite: Composite, center: Vec2, angle: number) {
  for (const p of composite.particles) {
    rotateParticle(p, center, angle);
  }
}
