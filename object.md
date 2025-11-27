# Création de formes : le fichier `objects.ts`

Ce fichier contient des fonctions "fabriques" qui utilisent les briques de base du moteur (Particules, Contraintes) pour construire facilement des formes complexes. C'est ici que la physique prend vie.

---

### `lineSegments(sim, vertices, stiffness)`

Cette fonction crée une **chaîne de segments de ligne**, comme une corde ou un serpentin.

#### Paramètres

- `sim`: L'instance principale de la simulation où l'objet sera ajouté.
- `vertices`: Un tableau de points `Vec2` qui définissent les "articulations" de la ligne.
- `stiffness`: La rigidité des liaisons entre chaque point.

#### Fonctionnement

La fonction parcourt le tableau de `vertices` fourni et pour chaque point, elle :
1.  Crée une `Particle` à la position du point.
2.  Si ce n'est pas la première particule de la chaîne, elle crée une `DistanceConstraint` pour la lier à la particule précédente.

Par exemple, si on fournit 3 points `[A, B, C]`, la fonction va créer 3 particules et 2 contraintes pour former la structure `A---B---C`. L'ensemble (particules + contraintes) est regroupé dans un `Composite` qui est ensuite ajouté à la simulation.

---

### `tire(sim, origin, radius, segments, spokeStiffness, treadStiffness)`

Cette fonction complexe montre comment combiner des contraintes simples pour créer un objet sophistiqué comme une roue.

#### Le principe

Créer une structure avec un cercle extérieur (le pneu) relié à un moyeu central, le tout étant suffisamment rigide pour ne pas s'effondrer.

#### Étape 1 : Création des particules

1.  **Particules du cercle** : La fonction place un nombre (`segments`) de particules en un cercle parfait autour du point `origin`.
2.  **Particule centrale** : Une particule unique est créée au centre (`origin`) pour servir de moyeu.

#### Étape 2 : Création des contraintes (le squelette)

Pour chaque particule du cercle, **trois** types de `DistanceConstraint` sont ajoutés :

1.  **La bande de roulement** : Relie chaque particule du cercle à sa voisine directe, formant l'anneau extérieur du pneu. La rigidité est contrôlée par `treadStiffness`.
2.  **Les rayons** : Relie chaque particule du cercle à la particule centrale (le moyeu). Cela maintient la forme générale de la roue. La rigidité est contrôlée par `spokeStiffness`.
3.  **Les renforts** : C'est l'astuce qui donne sa solidité à la roue. Chaque particule est reliée à une autre particule plus loin sur le cercle (par exemple, 5 crans plus loin). Ces liaisons transversales empêchent la roue de s'aplatir ou de se déformer.

Cette "recette" (pneu + rayons + renforts) permet de construire un objet complexe et stable à partir de briques très simples.
