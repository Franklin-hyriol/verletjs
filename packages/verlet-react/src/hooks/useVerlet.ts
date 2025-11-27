import { useState, useEffect, useRef } from 'react';
import { VerletJS, Composite, Vec2 } from 'verlet-engine';

// Define the options type, mirroring the one in the VerletJS constructor
export interface VerletOptions {
  gravity?: Vec2;
  friction?: number;
  groundFriction?: number;
  solverIterations?: number;
  restitution?: number;
}

interface UseVerletParams {
  width: number;
  height: number;
  options?: VerletOptions;
}

export const useVerlet = ({ width, height, options }: UseVerletParams) => {
  // Use a ref to hold the engine instance.
  // This ensures the same instance is used across all renders.
  const engine = useRef<VerletJS | null>(null);

  // Use state to hold the composites. When this state changes, React will re-render.
  const [composites, setComposites] = useState<Composite[]>([]);

  // This effect runs once when the component mounts, or when width/height change.
  useEffect(() => {
    // Create a new instance of the headless engine, passing the options.
    const sim = new VerletJS(width, height, options);
    engine.current = sim;
    setComposites(sim.composites);

    // The animation loop.
    let animationFrameId: number;

    const loop = () => {
      if (engine.current) {
        // Advance the physics simulation by one step.
        engine.current.frame(16);

        // This is a trick to force a re-render. We create a new shallow copy of the array.
        // This tells React that the state has changed, so components using this hook will update.
        setComposites([...engine.current.composites]);
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    // Start the animation loop.
    loop();

    // Cleanup function: this is called when the component unmounts.
    return () => {
      // Stop the animation loop to prevent memory leaks.
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height]); // Note: options are intentionally left out of the dependency array

  // Return the engine instance and the simulation state.
  return { engine: engine.current, composites };
};