import { useContext } from 'react';
import { VerletContext } from '../context/VerletContext';
import type { VerletContextType } from '../context/VerletContext';

/**
 * A custom hook to easily access the VerletJS engine instance from the context.
 * Throws an error if used outside of a <VerletCanvas> component.
 * @returns {VerletContextType} The verlet context, containing the engine instance.
 */
export const useVerletContext = (): VerletContextType => {
  const context = useContext(VerletContext);
  if (!context) {
    throw new Error('useVerletContext must be used within a VerletCanvas component');
  }
  return context;
};
