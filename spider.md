# Explication détaillée du code de l'araignée (`spider.html`)

Ce document décompose la fonction `createSpider` du fichier `spider.html` pour expliquer, étape par étape, comment la structure complexe et réaliste de l'araignée est construite.

L'idée générale est de ne pas "dessiner" une araignée, mais de construire un **squelette articulé** à l'aide de particules (les os) et de contraintes (les muscles et tendons).

---

## Le Code Complet de la Fonction

```javascript
function createSpider(origin) {
  const composite = new Composite();

  // Stiffness values from original code
  const legStiffness = 0.99;
  const bodyStiffness = 1;
  const angleStiffness = 0.9;

  // 1. Body (Head, Thorax, Abdomen)
  composite.thorax = new Particle(origin);
  composite.head = new Particle(origin.add(new Vec2(0, -5)));
  composite.abdomen = new Particle(origin.add(new Vec2(0, 10)));
  composite.particles.push(composite.thorax, composite.head, composite.abdomen);

  // Body constraints
  composite.constraints.push(new DistanceConstraint(composite.head, composite.thorax, bodyStiffness));
  composite.constraints.push(new DistanceConstraint(composite.abdomen, composite.thorax, bodyStiffness));
  composite.constraints.push(new AngleConstraint(composite.abdomen, composite.thorax, composite.head, 0.4));

  // 2. Legs (4 pairs, 8 total)
  for (let i = 0; i < 4; ++i) {
    
    // Create particles for a pair of legs (left and right)
    const leg1_l = new Particle(composite.thorax.pos.add(new Vec2(-3, (i - 1.5) * 3)));
    const leg1_r = new Particle(composite.thorax.pos.add(new Vec2(3, (i - 1.5) * 3)));
    
    const lenCoef = (i === 1 || i === 2) ? 0.8 : 1;

    const leg2_l = new Particle(leg1_l.pos.add(new Vec2(-20, (i - 1.5) * 30).normal().scale(20 * lenCoef)));
    const leg2_r = new Particle(leg1_r.pos.add(new Vec2(20, (i - 1.5) * 30).normal().scale(20 * lenCoef)));
    
    const leg3_l = new Particle(leg2_l.pos.add(new Vec2(-20, (i - 1.5) * 50).normal().scale(20 * lenCoef)));
    const leg3_r = new Particle(leg2_r.pos.add(new Vec2(20, (i - 1.5) * 50).normal().scale(20 * lenCoef)));

    const foot_l = new Particle(leg3_l.pos.add(new Vec2(-20, (i - 1.5) * 100).normal().scale(12 * lenCoef)));
    const foot_r = new Particle(leg3_r.pos.add(new Vec2(20, (i - 1.5) * 100).normal().scale(12 * lenCoef)));

    composite.particles.push(leg1_l, leg1_r, leg2_l, leg2_r, leg3_l, leg3_r, foot_l, foot_r);

    // Distance constraints for legs
    composite.constraints.push(new DistanceConstraint(leg1_l, composite.thorax, legStiffness));
    composite.constraints.push(new DistanceConstraint(leg1_r, composite.thorax, legStiffness));
    
    composite.constraints.push(new DistanceConstraint(leg2_l, leg1_l, legStiffness));
    composite.constraints.push(new DistanceConstraint(leg2_r, leg1_r, legStiffness));

    composite.constraints.push(new DistanceConstraint(leg3_l, leg2_l, legStiffness));
    composite.constraints.push(new DistanceConstraint(leg3_r, leg2_r, legStiffness));

    composite.constraints.push(new DistanceConstraint(foot_l, leg3_l, legStiffness));
    composite.constraints.push(new DistanceConstraint(foot_r, leg3_r, legStiffness));

    // Angle constraints for legs
    composite.constraints.push(new AngleConstraint(composite.thorax, leg1_l, leg2_l, angleStiffness));
    composite.constraints.push(new AngleConstraint(composite.thorax, leg1_r, leg2_r, angleStiffness));
    
    composite.constraints.push(new AngleConstraint(leg1_l, leg2_l, leg3_l, angleStiffness));
    composite.constraints.push(new AngleConstraint(leg1_r, leg2_r, leg3_r, angleStiffness));

    composite.constraints.push(new AngleConstraint(leg2_l, leg3_l, foot_l, angleStiffness));
    composite.constraints.push(new AngleConstraint(leg2_r, leg3_r, foot_r, angleStiffness));
  }

  return composite;
}
```

---

## Explication Ligne par Ligne

### Section 1 : Initialisation et Corps

```javascript
function createSpider(origin) {
  // Crée un "Composite", qui est une boîte pour ranger toutes les particules et contraintes de notre araignée.
  const composite = new Composite();

  // Définit des valeurs de rigidité. 1.0 est très rigide, 0.1 est très souple.
  const legStiffness = 0.99;   // Rigidité des segments des pattes
  const bodyStiffness = 1;     // Rigidité des parties du corps
  const angleStiffness = 0.9;  // Rigidité des articulations (pour garder les pattes pliées)

  // --- Création du corps en 3 parties ---

  // Le Thorax est la particule centrale, créée à la position `origin`.
  composite.thorax = new Particle(origin);
  // La Tête est créée 5 pixels au-dessus du thorax.
  composite.head = new Particle(origin.add(new Vec2(0, -5)));
  // L'Abdomen est créé 10 pixels en dessous du thorax.
  composite.abdomen = new Particle(origin.add(new Vec2(0, 10)));
  
  // Ajoute ces 3 particules à notre "boîte" à particules.
  composite.particles.push(composite.thorax, composite.head, composite.abdomen);

  // --- Contraintes du corps ---

  // Relie la tête au thorax avec une contrainte de distance. C'est comme un os.
  composite.constraints.push(new DistanceConstraint(composite.head, composite.thorax, bodyStiffness));
  // Relie l'abdomen au thorax.
  composite.constraints.push(new DistanceConstraint(composite.abdomen, composite.thorax, bodyStiffness));
  // C'est la "colonne vertébrale". Elle force les 3 parties du corps à rester plus ou moins alignées.
  // L'angle est défini entre (Abdomen -> Thorax -> Tête).
  composite.constraints.push(new AngleConstraint(composite.abdomen, composite.thorax, composite.head, 0.4));
```

### Section 2 : La Boucle de Création des Pattes

Le code va maintenant créer les 8 pattes. Pour être efficace, il le fait par paires (une gauche, une droite) dans une boucle qui se répète 4 fois.

```javascript
  // Boucle qui s'exécute 4 fois pour créer 4 paires de pattes.
  for (let i = 0; i < 4; ++i) {
```

### Section 3 : Création des Particules d'une Paire de Pattes

À l'intérieur de la boucle, on crée toutes les particules nécessaires pour une patte gauche et une patte droite. Chaque patte est une chaîne de 4 particules (en plus du thorax).

```javascript
    // --- Création des particules pour une paire de pattes ---

    // `leg1_l` et `leg1_r` sont les premières articulations (gauche et droite).
    // Elles sont créées très près du thorax. La formule `(i - 1.5) * 3` sert à les espacer verticalement.
    const leg1_l = new Particle(composite.thorax.pos.add(new Vec2(-3, (i - 1.5) * 3)));
    const leg1_r = new Particle(composite.thorax.pos.add(new Vec2(3, (i - 1.5) * 3)));
    
    // `lenCoef` est un coefficient pour rendre les pattes du milieu (i=1 et i=2) un peu plus courtes,
    // ce qui est plus réaliste.
    const lenCoef = (i === 1 || i === 2) ? 0.8 : 1;

    // `leg2_l` et `leg2_r` sont les "genoux".
    // Le calcul `new Vec2(...).normal().scale(...)` est une astuce pour placer un point
    // à une certaine distance et dans une certaine direction par rapport au point précédent.
    const leg2_l = new Particle(leg1_l.pos.add(new Vec2(-20, (i - 1.5) * 30).normal().scale(20 * lenCoef)));
    const leg2_r = new Particle(leg1_r.pos.add(new Vec2(20, (i - 1.5) * 30).normal().scale(20 * lenCoef)));
    
    // `leg3_l` et `leg3_r` sont les "chevilles".
    const leg3_l = new Particle(leg2_l.pos.add(new Vec2(-20, (i - 1.5) * 50).normal().scale(20 * lenCoef)));
    const leg3_r = new Particle(leg2_r.pos.add(new Vec2(20, (i - 1.5) * 50).normal().scale(20 * lenCoef)));

    // `foot_l` et `foot_r` sont les "pieds", le bout des pattes.
    const foot_l = new Particle(leg3_l.pos.add(new Vec2(-20, (i - 1.5) * 100).normal().scale(12 * lenCoef)));
    const foot_r = new Particle(leg3_r.pos.add(new Vec2(20, (i - 1.5) * 100).normal().scale(12 * lenCoef)));

    // Ajoute toutes les particules qu'on vient de créer à la "boîte" du composite.
    composite.particles.push(leg1_l, leg1_r, leg2_l, leg2_r, leg3_l, leg3_r, foot_l, foot_r);
```

### Section 4 : Création des Contraintes d'une Paire de Pattes

Maintenant que nous avons les "os" (particules), nous ajoutons les "ficelles" (contraintes) pour les relier et leur donner une forme.

```javascript
    // --- Contraintes de Distance (les "os" des pattes) ---

    // Relie la première articulation au thorax.
    composite.constraints.push(new DistanceConstraint(leg1_l, composite.thorax, legStiffness));
    composite.constraints.push(new DistanceConstraint(leg1_r, composite.thorax, legStiffness));
    
    // Relie l'articulation 1 au "genou".
    composite.constraints.push(new DistanceConstraint(leg2_l, leg1_l, legStiffness));
    composite.constraints.push(new DistanceConstraint(leg2_r, leg1_r, legStiffness));

    // Relie le "genou" à la "cheville".
    composite.constraints.push(new DistanceConstraint(leg3_l, leg2_l, legStiffness));
    composite.constraints.push(new DistanceConstraint(leg3_r, leg2_r, legStiffness));

    // Relie la "cheville" au "pied".
    composite.constraints.push(new DistanceConstraint(foot_l, leg3_l, legStiffness));
    composite.constraints.push(new DistanceConstraint(foot_r, leg3_r, legStiffness));

    // --- Contraintes d'Angle (les "tendons" qui plient les pattes) ---
    // C'EST LA PARTIE LA PLUS IMPORTANTE POUR LA FORME DE L'ARAIGNÉE.

    // Force l'articulation (Thorax -> leg1 -> leg2) à garder un angle.
    composite.constraints.push(new AngleConstraint(composite.thorax, leg1_l, leg2_l, angleStiffness));
    composite.constraints.push(new AngleConstraint(composite.thorax, leg1_r, leg2_r, angleStiffness));
    
    // Force l'articulation du "genou" (leg1 -> leg2 -> leg3) à garder un angle.
    composite.constraints.push(new AngleConstraint(leg1_l, leg2_l, leg3_l, angleStiffness));
    composite.constraints.push(new AngleConstraint(leg1_r, leg2_r, leg3_r, angleStiffness));

    // Force l'articulation de la "cheville" (leg2 -> leg3 -> foot) à garder un angle.
    composite.constraints.push(new AngleConstraint(leg2_l, leg3_l, foot_l, angleStiffness));
    composite.constraints.push(new AngleConstraint(leg2_r, leg3_r, foot_r, angleStiffness));
  } // Fin de la boucle for

  // Retourne le composite complet, prêt à être ajouté à la simulation.
  return composite;
}
```

J'espère que cette explication détaillée vous aidera à mieux visualiser comment ce code complexe parvient à créer une structure aussi organique. Prenez le temps de l'étudier, et n'hésitez pas si vous avez d'autres questions.