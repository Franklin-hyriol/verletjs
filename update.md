# Idées d'améliorations pour le moteur Verlet.js

Ce document liste des idées de nouvelles fonctionnalités, notamment de nouvelles contraintes, qui pourraient être ajoutées dans les futures versions du moteur physique.

---

## Nouvelles contraintes potentielles

### 1. Contrainte de Distance Minimale/Maximale (`MinMaxDistanceConstraint`)

- **Principe :** Forcer la distance entre deux particules à rester dans un intervalle `[min, max]` au lieu d'une valeur exacte.
- **Utilité :** Idéal pour simuler des chaînes, des cordes (qui peuvent se détendre), ou des liaisons élastiques qui ne peuvent pas s'étirer ou se compresser au-delà d'un certain point.

### 2. Contrainte de Collision de Particules (`CollisionConstraint`)

- **Principe :** Empêcher deux particules de s'interpénétrer. Si deux particules se rapprochent trop, une force de répulsion est appliquée pour les séparer.
- **Utilité :** C'est une fonctionnalité majeure manquante. Elle permettrait aux objets de la simulation (tissus, pneus, etc.) de rebondir les uns sur les autres au lieu de passer à travers.

### 3. Contrainte de Surface (`PlaneConstraint`)

- **Principe :** Forcer une particule à rester sur une ligne ou une surface (un plan), qui peut être orientée dans n'importe quelle direction.
- **Utilité :** Permet de créer des environnements plus complexes que la simple "boîte" actuelle. On pourrait simuler des rampes, des sols inclinés, des rails, etc.

---

## Nouveaux objets de démonstration

Pour mieux illustrer les capacités du moteur, de nouvelles fonctions "fabriques" pourraient être ajoutées à `objects.ts`.

### 1. Pont de singe (`RopeBridge`)

- **Principe :** Une série de particules connectées par des `DistanceConstraint` pour former le plancher du pont. Les deux extrémités seraient fixées en l'air avec des `PinConstraint`.
- **Démonstration :** Un exemple classique de structure suspendue qui se balance de manière réaliste sous l'effet de la gravité.

### 2. Poupée de chiffon (`Ragdoll`)

- **Principe :** Un personnage simplifié (tête, torse, bras, jambes). Les membres seraient des `DistanceConstraint` rigides, et les articulations (coudes, genoux) utiliseraient des `AngleConstraint` pour limiter leur amplitude de mouvement.
- **Démonstration :** Montre comment construire des corps articulés complexes et comment les `AngleConstraint` peuvent contrôler les articulations pour un comportement plus réaliste.

### 3. Voiture simple (`SimpleCar`)

- **Principe :** Un châssis rectangulaire rendu rigide par des `DistanceConstraint` (y compris en diagonale), auquel on attache deux `tire` (pneus) par leur particule centrale.
- **Démonstration :** Illustre la composition d'objets. On assemble des composants déjà existants (un rectangle et deux pneus) pour créer un objet plus complexe et fonctionnel.

---

## Intégration du Pas de Temps Fixe (Fixed Time Step)

- **Principe :** Encapsuler la logique de gestion du temps directement dans la classe `VerletJS` pour assurer une simulation physique stable et indépendante du framerate.
- **Détails :**
    - La méthode `sim.frame()` serait renommée en `sim.update(deltaTime: number)`. `deltaTime` est le temps réel écoulé depuis la dernière frame.
    - Une nouvelle méthode privée `_updatePhysics()` contiendrait la logique physique actuelle (gravité, vélocité, contraintes, limites).
    - `VerletJS` aurait de nouvelles propriétés :
        - `fixedTimeStep: number | null` : La durée d'une étape physique (ex: `1/60` pour 60 mises à jour/seconde). Si `null`, le moteur utilise un pas de temps variable (moins stable).
        - `maxAccumulatedTime: number` : Limite le temps accumulé pour éviter les spirales de la mort si le framerate chute.
        - `accumulator: number` : Accumule le `deltaTime`.
    - La méthode `update(deltaTime)` utiliserait `accumulator` et `fixedTimeStep` pour appeler `_updatePhysics()` le nombre de fois nécessaire.
- **Avantages :**
    - Simulation physique stable et reproductible.
    - Indépendance totale du framerate d'affichage.
    - Valeurs de gravité et de frottement intuitives (car elles sont appliquées par étape fixe).
- **Option client :** Le client pourrait choisir d'activer (`fixedTimeStep = 1/60`) ou de désactiver (`fixedTimeStep = null`) le pas de temps fixe via les options du constructeur de `VerletJS`.
- Finaliser le Moteur : On pourrait s'occuper de la dernière contrainte, AngleConstraint, pour qu'elle aussi prenne en compte la masse. C'est la dernière pièce du puzzle pour que tout le moteur soit cohérent.
