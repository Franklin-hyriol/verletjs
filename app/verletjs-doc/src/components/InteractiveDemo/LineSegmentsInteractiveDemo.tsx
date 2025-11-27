import React, { useCallback, useState, useMemo } from "react";
import { VerletCanvas } from "verlet-react";
import { LineSegments } from "verlet-react";
import { Vec2, Particle, Composite, PinConstraint } from "verlet-engine";

// Define constants OUTSIDE the component for stable references.
const linePoints = [];
const numSegments = 5;
const startX = 250;
const endX = 550;
const yPos = 50;

for (let i = 0; i < numSegments; i++) {
  const t = i / (numSegments - 1);
  const x = startX + (endX - startX) * t;
  linePoints.push(new Vec2(x, yPos));
}

const pins = [0];

const LineSegmentsInteractiveDemo = () => {
  const [draggedEntity, setDraggedEntity] = useState<
    Particle | PinConstraint | null
  >(null);
  const [hoveredEntity, setHoveredEntity] = useState<
    Particle | PinConstraint | null
  >(null);

  const nearestEntity = (
    composites: Composite[],
    mouse: Vec2
  ): Particle | PinConstraint | null => {
    let d2Nearest = Infinity;
    let entity: Particle | null = null;
    const selectionRadius = 20;

    for (const c of composites) {
      for (const p of c.particles) {
        const d2 = p.pos.dist2(mouse);
        if (d2 < d2Nearest && d2 < selectionRadius * selectionRadius) {
          entity = p;
          d2Nearest = d2;
        }
      }
    }

    for (const c of composites) {
      for (const constraint of c.constraints) {
        if (
          (constraint as any).type === "PinConstraint" &&
          (constraint as PinConstraint).a === entity
        ) {
          return constraint as PinConstraint;
        }
      }
    }
    return entity;
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouse = new Vec2(e.clientX - rect.left, e.clientY - rect.top);
      const entityToDrag = nearestEntity(composites, mouse);
      if (entityToDrag) {
        setDraggedEntity(entityToDrag);
        setHoveredEntity(null); // Clear hover when dragging starts
      }
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, composites: Composite[]) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouse = new Vec2(e.clientX - rect.left, e.clientY - rect.top);

      if (draggedEntity) {
        draggedEntity.pos.mutableSet(mouse);
      } else {
        // Only check for hover if not dragging
        const entityToHover = nearestEntity(composites, mouse);
        setHoveredEntity(entityToHover);
      }
    },
    [draggedEntity]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedEntity(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDraggedEntity(null);
    setHoveredEntity(null);
  }, []);

  // Determine the cursor style based on the current state
  const cursorStyle = useMemo(() => {
    if (draggedEntity) {
      return "grabbing";
    }
    if (hoveredEntity) {
      return "pointer";
    }
    return "default";
  }, [draggedEntity, hoveredEntity]);

  return (
      <VerletCanvas
        width={800}
        height={400}
        cursor={cursorStyle}
        onCanvasMouseDown={handleMouseDown}
        onCanvasMouseMove={handleMouseMove}
        onCanvasMouseUp={handleMouseUp}
        onCanvasMouseLeave={handleMouseLeave}
      >
        <LineSegments vertices={linePoints} stiffness={1} pins={pins} />
      </VerletCanvas>
  );
};

export default LineSegmentsInteractiveDemo;