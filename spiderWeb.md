# Comprendre la Génération de la Toile d'Araignée (Spiderweb)

Ce document explique la logique derrière la fonction de génération de toile d'araignée implémentée dans `spirale.html`, en se basant sur l'approche de la simulation de Verlet.

La toile d'araignée est construite en plaçant des particules selon un motif en spirale et en les reliant avec des contraintes de distance, créant ainsi une structure dynamique et réaliste.

---

## 1. Paramètres et Variables Clés

Ces variables définissent la forme et le comportement général de la toile :

*   **`origin: Vec2`**: Le point central autour duquel la toile est construite.
    ```javascript
    const origin = new Vec2(centerX, centerY);
    ```
*   **`maxOuterRadius: number`**: Le rayon maximal de la toile, définissant sa taille globale.
    ```javascript
    const maxOuterRadius = 200;
    ```
*   **`numRadialSegments: number`**: Le nombre de "rayons" ou de divisions angulaires de la toile. Plus ce nombre est élevé, plus la toile sera dense angulairement.
    ```javascript
    const numRadialSegments = 20;
    ```
*   **`numConcentricRings: number`**: Le nombre d'anneaux concentriques (ou de tours de spirale) qui composent la toile. Plus ce nombre est élevé, plus la toile sera profonde.
    ```javascript
    const numConcentricRings = 10;
    ```
*   **`stiffness: number`**: La rigidité des contraintes de distance. Une valeur de `1` est très rigide, une valeur plus faible permet plus d'élasticité.
    ```javascript
    const stiffness = 0.03;
    ```
*   **`tensor: number`**: Un facteur d'échelle appliqué à la distance de toutes les contraintes. Il est utilisé pour "resserrer" la toile, créant une tension qui la rend plus réaliste. Une valeur de `0.3` signifie que les contraintes essaieront de maintenir 30% de leur distance initiale.
    ```javascript
    const tensor = 0.3;
    ```

---

## 2. Variables Intermédiaires Calculées

Ces variables sont dérivées des paramètres ci-dessus pour faciliter la génération :

*   **`angularStep: number`**: L'incrément angulaire entre chaque particule le long de la spirale. C'est un cercle complet (`2 * Math.PI`) divisé par le nombre de segments radiaux.
    ```javascript
    const angularStep = (2 * Math.PI) / numRadialSegments;
    ```
*   **`totalParticles: number`**: Le nombre total de particules qui seront générées pour former la toile. C'est le produit du nombre de segments radiaux et du nombre d'anneaux concentriques.
    ```javascript
    const totalParticles = numRadialSegments * numConcentricRings;
    ```
*   **`radiusDecrementPerParticle: number`**: La quantité dont le rayon diminue pour chaque particule générée, en allant de l'extérieur vers l'intérieur.
    ```javascript
    const radiusDecrementPerParticle = maxOuterRadius / totalParticles;
    ```

---

## 3. Génération des Particules

La boucle suivante crée toutes les particules de la toile, en les plaçant selon un motif en spirale légèrement irrégulier pour un aspect plus organique.

```javascript
for (let i = 0; i < totalParticles; ++i) {
    // Calcul de l'angle (theta) avec des perturbations
    const theta = i * angularStep + Math.cos(i * 0.4) * 0.05 + Math.cos(i * 0.05) * 0.2;

    // Calcul du rayon (shrinkingRadius) avec des perturbations
    const shrinkingRadius = maxOuterRadius - radiusDecrementPerParticle * i + Math.cos(i * 0.1) * 20;

    // Calcul d'un décalage vertical (verticalWaveOffset) pour une ondulation subtile
    const verticalWaveOffset = Math.cos(theta * 2.1) * (maxOuterRadius / numConcentricRings) * 0.2;

    // Création et ajout de la particule au composite
    composite.particles.push(new Particle(new Vec2(
        origin.x + Math.cos(theta) * shrinkingRadius,
        origin.y + Math.sin(theta) * shrinkingRadius + verticalWaveOffset
    )));
}
```

*   **`theta`**: L'angle de la particule. Il est basé sur un incrément linéaire (`i * angularStep`) auquel sont ajoutées de petites perturbations sinusoïdales (`Math.cos(...)`) pour éviter une géométrie trop parfaite et donner un aspect plus naturel.
*   **`shrinkingRadius`**: Le rayon de la particule par rapport à l'origine. Il diminue linéairement (`maxOuterRadius - radiusDecrementPerParticle * i`) à mesure que `i` augmente (allant de l'extérieur vers l'intérieur), et des perturbations sinusoïdales sont ajoutées pour rendre les "anneaux" légèrement inégaux.
*   **`verticalWaveOffset`**: Un décalage appliqué à la coordonnée Y de la particule. C'est une fonction sinusoïdale de `theta`, ce qui crée une légère ondulation verticale le long des anneaux de la toile, la rendant moins plate.
*   **`new Particle(new Vec2(...))`**: Une nouvelle particule est créée à partir des coordonnées X et Y calculées (conversion de coordonnées polaires en cartésiennes, avec le décalage vertical).

---

## 4. Épinglage des Particules (Ancrage)

Cette section ancre certaines particules à leur position initiale, empêchant la toile entière de tomber ou de dériver.

```javascript
// 2. Épinglage des 5 particules les plus extérieures
for (let i = 0; i < 5; ++i) {
    if (i < composite.particles.length) {
        const pin = new PinConstraint(composite.particles[i], composite.particles[i].pos);
        pin.style = { color: 'blue', radius: 8 }; // Style distinct pour la visibilité
        composite.constraints.push(pin);
    }
}
```

*   Cette boucle épingle les 5 premières particules générées (`i` de 0 à 4). Comme les particules sont générées de l'extérieur vers l'intérieur, ce sont les 5 particules les plus extérieures de la toile.
*   Un `PinConstraint` est créé pour chaque particule, la fixant à sa position actuelle (`composite.particles[i].pos`).
*   Un style spécifique (bleu, rayon plus grand) est appliqué pour les rendre facilement identifiables.

---

## 5. Création des Contraintes (Les "Fils" de la Toile)

Cette section crée les `DistanceConstraint`s qui relient les particules entre elles, formant la structure de la toile.

```javascript
// 3. Création des contraintes
for (let i = 0; i < totalParticles - 1; ++i) {
    // Contrainte de voisinage (le long de la spirale)
    composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[i + 1], stiffness));

    // Contraintes radiales (les "rayons" de la toile)
    const radialConnectionIndex = i + numRadialSegments;
    if (radialConnectionIndex < totalParticles - 1) {
        composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[radialConnectionIndex], stiffness));
    } else {
        // Cas limite pour connecter les dernières particules
        composite.constraints.push(new DistanceConstraint(composite.particles[i], composite.particles[totalParticles - 1], stiffness));
    }
}
```

*   **Contrainte de voisinage (`composite.particles[i]` et `composite.particles[i + 1]`)**: Relie chaque particule à la suivante dans l'ordre de génération. Cela forme les "fils" qui suivent la spirale ou les anneaux concentriques.
*   **Contraintes radiales (`composite.particles[i]` et `composite.particles[radialConnectionIndex]`)**: Relie une particule à une autre qui se trouve sur un "anneau" différent mais à une position angulaire similaire. `radialConnectionIndex` est calculé en ajoutant `numRadialSegments` à l'index actuel `i`. Ces contraintes forment les "rayons" de la toile.
*   **Gestion des cas limites**: Le bloc `else` assure que les particules vers la fin de la spirale sont également connectées, généralement à la toute dernière particule, pour maintenir la cohérence de la structure.

---

## 6. Fermeture de l'Anneau le Plus Extérieur

Une contrainte supplémentaire est ajoutée pour fermer le premier "anneau" de la toile, reliant la toute première particule à la dernière particule du premier segment radial.

```javascript
// 4. Fermeture de l'anneau le plus extérieur
composite.constraints.push(new DistanceConstraint(composite.particles[0], composite.particles[numRadialSegments - 1], stiffness));
```

*   Ceci connecte `composite.particles[0]` (la première particule générée) à `composite.particles[numRadialSegments - 1]` (la dernière particule du premier tour de la spirale).

---

## 7. Application du Facteur `tensor`

Après que toutes les contraintes de distance ont été créées, leur propriété `distance` est ajustée par le facteur `tensor`.

```javascript
// 5. Application du tensor
for (const c of composite.constraints) {
    if (c instanceof DistanceConstraint) {
        c.distance *= tensor;
    }
}
```

*   Cette boucle parcourt toutes les contraintes du composite.
*   Pour chaque `DistanceConstraint`, sa `distance` désirée est multipliée par `tensor` (ici `0.3`). Cela a pour effet de "raccourcir" la distance que les contraintes essaient de maintenir, créant une tension dans la toile et la faisant se contracter légèrement, ce qui lui donne un aspect plus tendu et réaliste.

---

## Comment tout cela fonctionne ensemble

La simulation de Verlet fonctionne en itérant sur les particules et les contraintes. À chaque étape :
1.  Les forces (comme la gravité) sont appliquées aux particules.
2.  Les positions des particules sont mises à jour en fonction de ces forces et de leur position précédente.
3.  Les contraintes (`relax` method) sont appliquées de manière itérative pour ajuster les positions des particules afin de respecter les distances et les angles désirés.

En combinant la génération structurée des particules, les contraintes de distance (voisinage et radiales), l'ancrage (épinglage) et l'application du `tensor`, la toile d'araignée prend vie et réagit de manière dynamique aux forces de la simulation. Les petites perturbations ajoutées lors de la génération des particules contribuent à un aspect plus organique et moins "parfaitement numérique" de la toile.
