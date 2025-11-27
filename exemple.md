# Idées d'Exemples pour la Documentation

Voici une liste d'exemples potentiels à créer pour la section "Exemples" de la documentation, classés par complexité.

## Exemples Simples

1.  **Pendule de Newton**
    *   **Concept** : 5 à 7 particules suspendues en ligne par des `PinConstraint`. Des `CollisionConstraint` entre les sphères.
    *   **Intérêt** : Montre les collisions et la conservation de l'énergie de manière très visuelle.

2.  **Pont de Corde Simple**
    *   **Concept** : Une série de `LineSegments` pour le tablier du pont, avec les deux extrémités attachées à des points fixes (`pinned`).
    *   **Intérêt** : Démontre une structure simple et flexible qui réagit à la gravité.

## Exemples Intermédiaires

3.  **Drap Suspendu Interactif**
    *   **Concept** : Un `Cloth` avec quelques points d'ancrage (`pins`) non alignés, et une `CollisionConstraint` avec une particule (une "balle") qui peut tomber dessus.
    *   **Intérêt** : Montre l'interaction entre deux composites différents.

4.  **Personnage Ragdoll Simple**
    *   **Concept** : Un "bonhomme allumette" fait de plusieurs `Point` (tête, torse, mains, pieds) reliés par des `DistanceConstraint`. On peut utiliser des `MinMaxAngleConstraint` pour les articulations (coudes, genoux) pour un comportement plus réaliste.
    *   **Intérêt** : Un exemple classique qui montre comment assembler des contraintes pour créer un personnage articulé.

## Exemples Avancés

5.  **Voiture Simple**
    *   **Concept** : Un châssis rigide (plusieurs `Point` reliés par des `DistanceConstraint`) et deux composites `Tire` attachés au châssis.
    *   **Intérêt** : Montre comment assembler des composites complexes pour créer une machine.

6.  **Catapulte Interactive**
    *   **Concept** : Un bras de levier qui pivote sur un `Point` `pinned`. Une `MinMaxDistanceConstraint` peut servir de corde pour tendre la catapulte. L'utilisateur peut cliquer sur un "boulet" (une `Particle`) pour le placer dans le godet.
    *   **Intérêt** : Combine la construction de machine, l'interaction utilisateur et la simulation physique.
