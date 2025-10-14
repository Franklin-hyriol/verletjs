import React from 'react';
import { VerletJS, Particle } from 'verlet-engine';

/**
 * Defines the shape of the context data.
 */
export interface VerletContextType {
  engine: VerletJS;
  getParticleById: (id: string) => Particle | undefined;
  registerParticle: (id: string, particle: Particle) => void;
  unregisterParticle: (id: string) => void;
}

/**
 * React Context to provide the VerletJS engine instance to child components.
 * This allows components like <Tire> or <Cloth> to register themselves with the simulation.
 */
export const VerletContext = React.createContext<VerletContextType | null>(null);