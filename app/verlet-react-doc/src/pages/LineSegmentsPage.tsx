import React, { useCallback, useRef } from "react";
import { VerletCanvas } from "verlet-react";
import { LineSegments } from "verlet-react";
import { Vec2, Particle, Composite, PinConstraint } from "verlet-engine";

// Define the points for our line segment OUTSIDE the component.
const linePoints = [
  new Vec2(200, 100),
  new Vec2(300, 100),
  new Vec2(400, 100),
  new Vec2(500, 100),
  new Vec2(600, 100),
];

// Define the pins array OUTSIDE the component for a stable reference.
const pins = [0];

export const LineSegmentsPage = () => {
  // Use a ref for the dragged entity. This is the correct React pattern for mutable data
  // that should not trigger re-renders. It avoids stale closures and performance issues.
  const draggedEntity = useRef<Particle | PinConstraint | null>(null);
  const mouse = useRef(new Vec2(0, 0));

  const nearestEntity = (composites: Composite[]):Particle | PinConstraint | null => {
    let d2Nearest = Infinity;
    let entity: Particle | null = null;
    const selectionRadius = 20;

    for (const c of composites) {
      for (const p of c.particles) {
        const d2 = p.pos.dist2(mouse.current);
        if (d2 < d2Nearest && d2 < selectionRadius * selectionRadius) {
          entity = p;
          d2Nearest = d2;
        }
      }
    }

    for (const c of composites) {
      for (const constraint of c.constraints) {
        console.log(constraint.type);
        if ((constraint as PinConstraint).type === 'PinConstraint' && (constraint as PinConstraint).a === entity) {
          return constraint as PinConstraint;
        }
      }
    }

    return entity;
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => {
      void e;

      draggedEntity.current = nearestEntity(composites);
    },
    []
  ); // Empty dependency array is correct as this only depends on refs.

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, _composites: Composite[]) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;

      if (draggedEntity.current) {
        draggedEntity.current.pos.mutableSet(mouse.current);
      }
    },
    []
  ); // Empty dependency array is correct.

  const handleMouseUp = useCallback(() => {
    draggedEntity.current = null;
  }, []);

  return (
    <VerletCanvas
      width={window.innerWidth}
      height={window.innerHeight}
      options={{ gravity: new Vec2(0, 0.5), friction: 0.99 }}
      onCanvasMouseDown={handleMouseDown}
      onCanvasMouseMove={handleMouseMove}
      onCanvasMouseUp={handleMouseUp}
      onCanvasMouseLeave={handleMouseUp}
    >
      <LineSegments vertices={linePoints} stiffness={0.8} pins={pins} />
    </VerletCanvas>
  );
};
