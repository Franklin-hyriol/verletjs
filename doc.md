# Documentation du projet Verlet.js

Ce document contient des explications sur le fonctionnement interne du moteur de physique Verlet.js.

---

## La fonction `bounds`

La fonction `bounds` dans la classe `VerletJS` sert à contraindre les particules à rester à l'intérieur des limites du monde de la simulation. Elle agit comme des murs invisibles pour la zone de simulation.

À chaque étape du calcul de la physique, après que les forces (comme la gravité) ont été appliquées, la fonction `bounds` est appelée pour chaque particule afin de s'assurer qu'aucune ne s'échappe de la zone définie par les propriétés `width` et `height` de l'instance `VerletJS`.

### Fonctionnement détaillé

La fonction vérifie la position (`x` et `y`) de chaque particule :
- Si une particule dépasse le bord inférieur (`particle.pos.y > this.height - 1`), sa position `y` est corrigée pour être sur ce bord.
- Si une particule dépasse le bord gauche (`particle.pos.x < 0`) ou droit (`particle.pos.x > this.width - 1`), sa position `x` est corrigée pour être sur le bord correspondant.

Cela garantit que les particules restent toujours visibles et interagissent à l'intérieur du canevas de simulation.

---

## La fonction `frame`

La fonction `frame(deltaTime: number)` est le cœur de la simulation, c'est elle qui fait avancer la physique d'une étape (d'une "image") à l'autre. C'est la boucle principale du moteur physique.

Le paramètre `deltaTime` est la durée écoulée depuis la dernière mise à jour de la simulation (généralement en secondes). Il est crucial pour assurer que la simulation s'exécute à une vitesse constante, indépendamment du framerate de l'affichage.

Elle exécute trois grandes opérations dans un ordre précis à chaque appel :

### 1. Mettre à jour la position des particules (Intégration)

La première boucle parcourt chaque particule pour calculer sa nouvelle position.

- **Calcul de la vélocité** : La vélocité est déduite de la différence entre la position actuelle (`pos`) et la position précédente (`lastPos`). C'est le principe de l'intégration de Verlet.
- **Application de la friction** : La vélocité est réduite pour simuler la résistance de l'air (`this.friction`) ou le frottement avec le sol (`this.groundFriction`).
- **Application de la gravité** : La force de gravité est ajoutée, mise à l'échelle par `deltaTime * deltaTime` car la gravité est une accélération.
- **Mise à jour de la position** : La nouvelle position est calculée, la vélocité étant mise à l'échelle par `deltaTime`. L'ancienne position est sauvegardée dans `lastPos` pour le calcul de la prochaine frame.

### 2. Satisfaire les contraintes (Relaxation)

Après avoir bougé, les particules peuvent ne plus respecter les liens (contraintes) qui les unissent. Cette deuxième étape corrige cela.

- La méthode `relax()` est appelée pour chaque contrainte de la simulation.
- Cette méthode ajuste la position des particules pour que la contrainte soit à nouveau respectée.
- Ce processus est répété `this.solverIterations` fois (le nombre d'itérations est défini par la propriété `solverIterations` de la classe `VerletJS`). Répéter cette "relaxation" plusieurs fois augmente la stabilité et la précision de la simulation.

### 3. Appliquer les limites du monde

La dernière étape s'assure que toutes les particules restent dans la zone de simulation.

- Elle parcourt toutes les particules et appelle la fonction `this.bounds()` pour chacune.
- Comme vu précédemment, cela les empêche de sortir du cadre défini par `width` et `height`. Lors de ces collisions, le coefficient de `restitution` est appliqué pour gérer le rebond.

---

En résumé, à chaque appel de `frame`, le moteur :
1.  **Déplace** toutes les particules en fonction du `deltaTime`.
2.  **Corrige** leurs positions `this.solverIterations` fois pour respecter les contraintes.
3.  **Vérifie** qu'elles ne sont pas sorties des limites et applique la `restitution`.

---

## Propriétés configurables de `VerletJS`

La classe `VerletJS` permet de configurer plusieurs aspects fondamentaux de la simulation via son constructeur. Ces propriétés peuvent être ajustées pour modifier le comportement physique global.

### 1. `gravity: Vec2` (Gravité)

*   **Ce que c'est :** Un vecteur représentant la force de gravité appliquée à chaque particule de la simulation à chaque étape.
*   **Comment ça marche :** À chaque "frame", ce vecteur est ajouté à la position de chaque particule, la tirant ainsi dans cette direction.
*   **Valeurs et résultats :**
    *   `new Vec2(0, 0.2)` (par défaut) : Tire les particules vers le bas. `0.2` est l'intensité.
    *   `new Vec2(0, 0)` : Pas de gravité.
    *   `new Vec2(0, -0.1)` : Gravité vers le haut.
    *   **Valeurs plus élevées** : Gravité plus forte, objets tombent plus vite.
    *   **Valeurs plus faibles** : Gravité plus faible, objets tombent plus lentement.

### 2. `friction: number` (Frottement général / Résistance de l'air)

*   **Ce que c'est :** Un facteur scalaire (entre `0` et `1`) qui réduit la vitesse de toutes les particules à chaque frame, simulant la résistance de l'air ou une perte d'énergie générale.
*   **Comment ça marche :** La vitesse de chaque particule est multipliée par ce facteur.
*   **Valeurs et résultats :**
    *   `1` : Pas de frottement.
    *   `0.99` (par défaut) : Très léger frottement.
    *   `0.5` : Frottement élevé.
    *   **Valeurs plus élevées** (proches de `1`) : Moins de frottement, objets conservent leur élan plus longtemps.
    *   **Valeurs plus faibles** (proches de `0`) : Plus de frottement, objets perdent leur élan plus rapidement.

### 3. `groundFriction: number` (Frottement au sol)

*   **Ce que c'est :** Un facteur scalaire (entre `0` et `1`) qui réduit spécifiquement la vitesse des particules lorsqu'elles touchent la limite inférieure de la simulation (le "sol").
*   **Comment ça marche :** Quand une particule touche le sol, sa vitesse est multipliée par ce facteur.
*   **Valeurs et résultats :**
    *   `0.8` (par défaut) : Frottement modéré au sol.
    *   `1` : Pas de frottement au sol.
    *   `0` : Les objets s'arrêtent net au sol.
    *   **Valeurs plus élevées** (proches de `1`) : Moins de perte d'énergie à l'impact, objets rebondissent plus haut/longtemps.
    *   **Valeurs plus faibles** (proches de `0`) : Plus de perte d'énergie à l'impact, objets rebondissent moins ou s'arrêtent rapidement.

### 4. `solverIterations: number` (Itérations du solveur de contraintes)

*   **Ce que c'est :** Le nombre de fois que le moteur essaie de satisfaire les contraintes (les liens entre les particules) à chaque "frame" de la simulation.
*   **Pourquoi l'ajouter :** C'est un paramètre fondamental pour équilibrer la précision et la performance.
*   **Valeurs et résultats :**
    *   **Valeurs plus élevées** (ex: `10` ou `20`) : La simulation sera plus précise et stable. Les contraintes seront mieux respectées (moins d'étirement ou de "mou"). Cependant, cela demandera plus de calculs et donc plus de ressources CPU.
    *   **Valeurs plus faibles** (ex: `2` ou `4`) : La simulation sera moins précise et stable. Les contraintes pourront sembler plus "élastiques" ou "molles". En contrepartie, la performance sera meilleure.

### 5. `restitution: number` (Coefficient de restitution / Rebond)

*   **Ce que c'est :** Un facteur (entre `0` et `1`) qui détermine la quantité d'énergie conservée lorsqu'une particule entre en collision avec une limite du monde.
*   **Pourquoi l'ajouter :** Pour contrôler la "bounciness" (capacité à rebondir) des objets de manière plus générale que le `groundFriction` seul.
*   **Valeurs et résultats :**
    *   `0` : Pas de rebond. Les objets s'arrêtent net à l'impact.
    *   `1` : Rebond parfait. Les objets conservent toute leur énergie et rebondissent à la même hauteur.
    *   `0.5` (valeur typique) : Rebond modéré. Les objets perdent une partie de leur énergie à chaque rebond.

---

## La contrainte : `DistanceConstraint`

Le rôle de `DistanceConstraint` est de forcer deux particules (`a` et `b`) à rester à une distance fixe l'une de l'autre. C'est la brique de construction la plus fondamentale pour créer des objets complexes, en agissant comme une tige invisible reliant deux points.

### Le constructeur `constructor()`

Lors de sa création, on lui fournit :
- `a` et `b`: Les deux particules à lier.
- `stiffness`: Un nombre entre 0 et 1 qui définit la rigidité de la liaison.
- `distance` (optionnel): La distance à maintenir. Si non fournie, la distance initiale entre les particules est utilisée.

### La méthode `relax(stepCoef)`

C'est la fonction qui applique la contrainte. À chaque étape de la simulation, elle :
1.  Calcule la distance actuelle entre les deux particules.
2.  Compare cette distance à la distance cible.
3.  Si elles ne correspondent pas, elle calcule une correction et déplace les deux particules pour les ramener à la bonne distance.

### L'effet du `stiffness`

Le paramètre `stiffness` contrôle à quel point la "tige" est rigide ou élastique.

- **`stiffness` élevé (proche de 1.0)** : La liaison est très rigide, comme une barre de métal. Si une force extérieure essaie d'écarter les particules, la contrainte applique une correction forte et immédiate pour les ramener. La "tige" ne s'allonge presque pas.

- **`stiffness` faible (proche de 0.0)** : La liaison est très élastique, comme un élastique. Si une force extérieure écarte les particules, la contrainte n'applique qu'une petite correction à chaque étape. La "tige" peut donc s'allonger ou se compresser visiblement avant de revenir lentement à sa longueur de repos.

---

## La contrainte : `PinConstraint`

Le rôle de `PinConstraint` est de fixer une particule à un point précis et immuable de l'espace. C'est l'équivalent de planter une punaise (`pin`) pour créer un point d'ancrage fixe dans la simulation. C'est essentiel pour suspendre des objets, comme les coins d'un drap.

### Le constructeur `constructor()`

Il prend simplement :
- `a`: La particule à fixer.
- `pos`: Un `Vec2` représentant les coordonnées exactes du point d'ancrage.

### La méthode `relax(stepCoef)`

Cette méthode est très directe. Elle exécute une seule instruction :
`this.a.pos.mutableSet(this.pos);`

À chaque étape de la relaxation, elle force la particule à revenir à la position `pos` définie dans le constructeur, annulant ainsi tous les autres effets comme la gravité ou la vélocité.

### Interaction avec la souris

Une observation importante est que, dans de nombreuses démos, ces points d'ancrage peuvent être déplacés avec la souris tout en restant insensibles à la gravité. Voici comment cela fonctionne :

1.  **Insensibilité à la gravité** : La méthode `relax()` s'exécute après le calcul de la physique et réinitialise la position de la particule, annulant de fait l'effet de la gravité à chaque frame.

2.  **Déplacement par la souris** : Le déplacement n'est pas géré par la contrainte elle-même, mais par la couche applicative (l'interface utilisateur). Le code qui gère les événements de la souris modifie directement la propriété `pos` de l'objet `PinConstraint` en temps réel.

Ainsi, la particule suit la "cible" (`this.pos`) de la contrainte. Par défaut, cette cible est statique, mais le code extérieur peut la déplacer, ce qui donne l'illusion de déplacer le point d'ancrage avec la souris.

---

## La contrainte : `AngleConstraint`

Le butt de `AngleConstraint` est de maintenir un angle constant entre un groupe de trois particules (`a`, `b`, `c`), où `b` est le sommet de l'angle.

Cette contrainte est cruciale pour donner de la rigidité à une structure et l'empêcher de se plier. Sans elle, les objets articulés seraient trop souples.

### Le constructeur `constructor()`

Il prend :
- `a`, `b`, `c`: Les trois particules formant l'angle.
- `stiffness`: La rigidité de l'angle (entre 0 et 1).

L'angle initial formé par les particules est stocké comme angle cible à maintenir.

### La méthode `relax(stepCoef)`

Le principe de cette méthode est de :
1.  Calculer l'angle actuel entre les trois particules.
2.  Comparer cet angle à l'angle cible pour trouver la différence.
3.  Appliquer une correction en faisant tourner les particules `a` et `c` autour du sommet `b` pour "ouvrir" ou "fermer" l'angle jusqu'à retrouver la bonne valeur. La force de la correction dépend du `stiffness`.

### Cas d'usage : Triangle vs. Carré

C'est une question importante pour comprendre son utilité.

- **Pour un triangle simple**, trois `DistanceConstraint` (une pour chaque côté) suffisent à le rendre rigide. Une fois les longueurs des côtés fixées, les angles ne peuvent plus changer. Une `AngleConstraint` n'est donc pas nécessaire.

- **Pour un carré (ou toute structure non-triangulaire)**, c'est différent. Un carré fait de 4 particules et 4 `DistanceConstraint` peut facilement s'affaisser en losange. C'est là que `AngleConstraint` devient indispensable : en l'appliquant à un ou plusieurs coins, on les force à rester à 90 degrés, ce qui rigidifie toute la structure.

En résumé, `AngleConstraint` n'est pas tant pour construire des formes que pour **renforcer des structures** et les empêcher de se plier à leurs articulations.

---

## La classe `Vec2` : La boîte à outils mathématique

La classe `Vec2` fournit tous les outils pour manipuler des vecteurs à 2 dimensions (`x` et `y`). Elle est fondamentale pour calculer les positions, distances, angles, etc.

Une distinction importante est faite entre les méthodes **immuables** (qui retournent un nouveau `Vec2` sans modifier l'original) et **mutables** (qui modifient le `Vec2` sur lequel elles sont appelées, souvent pour des raisons de performance).

### Constructeur

- `constructor(x, y)`: Crée un nouveau vecteur. Si `x` ou `y` ne sont pas fournis, ils valent 0.

### Opérations Immuables (créent un nouveau `Vec2`)

- `add(v)`: Additionne deux vecteurs.
- `sub(v)`: Soustrait un vecteur d'un autre.
- `mul(v)`: Multiplie les composantes de deux vecteurs (multiplication par composantes).
- `div(v)`: Divise les composantes de deux vecteurs.
- `scale(coef)`: Multiplie les composantes `x` et `y` par un nombre (`coef`).

### Opérations Mutables (modifient le `Vec2` actuel)

Ces méthodes sont plus performantes car elles ne créent pas de nouvel objet. Elles sont beaucoup utilisées dans la boucle de simulation.

- `mutableSet(v)`: Copie les valeurs d'un autre vecteur.
- `mutableAdd(v)`: Additionne un vecteur au vecteur actuel.
- `mutableSub(v)`: Soustrait un vecteur du vecteur actuel.
- `mutableMul(v)`: Multiplie le vecteur actuel par un autre.
- `mutableDiv(v)`: Divise le vecteur actuel par un autre.
- `mutableScale(coef)`: Multiplie le vecteur actuel par un nombre.

### Comparaison

- `equals(v)`: Vérifie si deux vecteurs sont strictement identiques.
- `epsilonEquals(v, epsilon)`: Vérifie si deux vecteurs sont presque identiques, à une petite marge d'erreur (`epsilon`) près.

### Calculs de Vecteur

- `length()`: Calcule la longueur (magnitude) du vecteur. Contient une racine carrée, donc peut être lent.
- `length2()`: Calcule le carré de la longueur. Beaucoup plus rapide que `length()` car il n'y a pas de racine carrée. Utile pour les comparaisons de distance.
- `dist(v)`: Calcule la distance entre ce vecteur et un autre.
- `dist2(v)`: Calcule le carré de la distance. Également plus rapide et préféré pour les comparaisons.
- `normal()`: Retourne un nouveau vecteur de longueur 1 mais avec la même direction (vecteur unitaire).
- `dot(v)`: Calcule le produit scalaire. Utile pour les calculs d'angle et de projection.

### Calculs d'Angle et Rotation

- `angle(v)`: Calcule l'angle entre ce vecteur et un autre.
- `angle2(vLeft, vRight)`: Calcule l'angle entre les segments formés par `(vLeft - this)` et `(vRight - this)`. `this` est le sommet de l'angle.
- `rotate(origin, theta)`: Fait tourner le vecteur autour d'un point `origin` d'un angle `theta` (en radians).

### Affichage

- `toString()`: Retourne une représentation du vecteur sous forme de chaîne de caractères, ex: `"(10, 20)"`.
