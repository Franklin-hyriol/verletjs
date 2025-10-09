# Documentation du Fichier `cloth.html`

Ce fichier est une démonstration de simulation de tissu réalisée avec la bibliothèque `verlet-engine`. L'objectif est de créer un drapé réaliste qui est suspendu dans les airs, qui réagit à la gravité et que l'on peut manipuler avec la souris. La particularité de cette simulation est son rendu visuel : le tissu n'est pas une simple grille de lignes, mais une surface pleine dont la couleur change dynamiquement pour montrer les zones de tension, passant du rouge au jaune, puis au bleu et enfin au vert.

---

### Le Code, Ligne par Ligne

#### 1. La Structure de Base

Le fichier commence par une structure HTML très simple, qui prépare le terrain pour notre simulation.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Verlet Cloth Simulation</title>
  <style>
    body { margin: 0; overflow: hidden; background-color: #222; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script type="module">
```
- **`body { margin: 0; ... }`**: Ces styles CSS assurent que notre simulation prendra toute la place dans la fenêtre du navigateur, sans marges ou barres de défilement inutiles.
- **`<canvas id="canvas">`**: C'est la "toile" sur laquelle nous allons dessiner notre simulation. On lui donne un `id` pour pouvoir la retrouver facilement en JavaScript.
- **`<script type="module">`**: Cette balise est cruciale. Elle nous permet d'utiliser la syntaxe moderne `import` pour charger uniquement les morceaux de la bibliothèque `verlet-engine` dont nous avons besoin.


#### 2. L'Import des Outils

La première chose que fait notre script est d'importer les "briques de construction" de la bibliothèque.

```javascript
import { VerletJS, Particle, DistanceConstraint, PinConstraint, Composite, Vec2 } from '../../dist/verlet-engine.es.js';
```
- **`VerletJS`**: C'est le chef d'orchestre, le moteur physique principal qui va gérer toute la simulation.
- **`Particle`**: C'est l'élément le plus basique. Imaginez une particule comme une bille ou un point dans l'espace. Notre tissu sera fait d'une grille de ces particules.
- **`DistanceConstraint`**: C'est une "contrainte de distance", qui agit comme un fil ou une barre rigide entre deux particules, les forçant à rester à une distance fixe l'une de l'autre.
- **`PinConstraint`**: Une "contrainte d'épingle". Elle sert à fixer une particule à un endroit précis de l'écran, comme si on la clouait à un mur.
- **`Composite`**: Un objet pratique pour regrouper un ensemble de particules et de contraintes qui forment un seul objet (comme notre tissu).
- **`Vec2`**: Un objet simple pour représenter un vecteur à 2 dimensions (coordonnées x et y), utilisé pour la position, la gravité, etc.


#### 3. La Mise en Place du Monde

Ici, on prépare notre scène : le canvas et le moteur physique.

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sim = new VerletJS(canvas.width, canvas.height);
sim.gravity = new Vec2(0, 0.2);
sim.friction = 1.0;
```
- **`document.getElementById('canvas')`**: On récupère notre élément `<canvas>` du HTML.
- **`canvas.getContext('2d')`**: On obtient le "contexte de dessin 2D", qui est l'objet contenant toutes les fonctions pour dessiner (lignes, cercles, couleurs...). On le stocke dans `ctx`.
- **`canvas.width = window.innerWidth`**: On ajuste la taille du canvas pour qu'il remplisse toute la largeur et la hauteur de la fenêtre.
- **`new VerletJS(...)`**: On crée notre monde de simulation.
- **`sim.gravity = new Vec2(0, 0.2)`**: On définit la force de gravité. C'est un vecteur qui pointe vers le bas (valeur positive en Y), ce qui va faire tomber notre tissu.
- **`sim.friction = 1.0`**: On définit la friction de l'air. `1.0` signifie qu'il n'y a pas de friction, donc le tissu se balancera pendant longtemps. Une valeur plus basse (ex: `0.9`) le ferait s'arrêter plus vite.


#### 4. La Recette du Tissu : La Fonction `createCloth`

Cette fonction est le cœur de notre programme. Elle contient la logique pour construire, point par point et fil par fil, notre objet tissu.

```javascript
function createCloth(origin, width, height, segments, stiffness) {
  const cloth = new Composite();
  const xStride = width / segments;
  const yStride = height / segments;
```
- La fonction prend plusieurs paramètres pour pouvoir créer des tissus de différentes tailles et rigidités.
- **`const cloth = new Composite()`**: On crée un nouvel objet `Composite` pour y ranger toutes les pièces de notre tissu.
- **`xStride` et `yStride`**: On calcule l'espacement nécessaire entre chaque point (particule) sur les axes X et Y pour que la grille finale ait les bonnes dimensions.

```javascript
  // Créer les particules
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < segments; x++) {
      const px = origin.x + x * xStride - width / 2 + xStride / 2;
      const py = origin.y + y * yStride - height / 2 + yStride / 2;
      cloth.particles.push(new Particle(new Vec2(px, py)));
    }
  }
```
- On utilise deux boucles `for` imbriquées pour créer une grille. `segments` définit le nombre de points en largeur et en hauteur.
- À chaque passage, on calcule la position (`px`, `py`) du point et on crée une `new Particle` que l'on ajoute au tableau `cloth.particles`.

```javascript
  // Créer les contraintes (les fils)
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < segments; x++) {
      if (x > 0) {
        cloth.constraints.push(new DistanceConstraint(cloth.particles[y * segments + x], cloth.particles[y * segments + x - 1], stiffness));
      }
      if (y > 0) {
        cloth.constraints.push(new DistanceConstraint(cloth.particles[y * segments + x], cloth.particles[(y - 1) * segments + x], stiffness));
      }
    }
  }
```
- Maintenant que les points sont créés, il faut les relier. On reparcourt la grille.
- **`if (x > 0)`**: Pour chaque particule, on la relie à sa voisine de **gauche**.
- **`if (y > 0)`**: On la relie également à sa voisine du **dessus**.
- `new DistanceConstraint(...)` est le "fil" qui les relie. `stiffness` (rigidité) définit à quel point ce fil est élastique.

```javascript
  // Épingler la rangée du haut
  for (let x = 0; x < segments; x+=5) {
    cloth.constraints.push(new PinConstraint(cloth.particles[x], cloth.particles[x].pos));
  }

  return cloth;
}
```
- Pour que le tissu ne tombe pas à l'infini, on doit l'accrocher. Cette boucle parcourt la toute première rangée de particules.
- **`x+=5`**: Au lieu d'épingler tous les points, on en épingle un tous les cinq points. Cela crée un effet de drapé plus joli et naturel entre les points d'attache.
- **`new PinConstraint(...)`**: Crée une "épingle" qui fixe la particule à sa position de départ. C'est l'équivalent de clouer le tissu au mur.
- Enfin, la fonction retourne le `cloth` (le composite) entièrement construit.


#### 5. L'Animation et le Rendu

La fonction `animate` est le moteur qui tourne en boucle pour faire vivre la simulation.

```javascript
function animate() {
  sim.frame(16);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
```
- **`sim.frame(16)`**: C'est la commande la plus importante. Elle dit au moteur physique : "Calcule la nouvelle position de toutes les particules pour les 16 prochaines millisecondes".
- **`ctx.clearRect(...)`**: Efface tout ce qui a été dessiné à l'image précédente pour pouvoir dessiner la nouvelle.

Le code qui suit est la partie la plus unique : le dessin du tissu.

```javascript
  // Rendu personnalisé du tissu
  const stride = cloth.particles[1].pos.x - cloth.particles[0].pos.x;
  for (let y = 1; y < segments; y++) {
    for (let x = 1; x < segments; x++) {
      ctx.beginPath();

      const i1 = (y - 1) * segments + x - 1;
      const i2 = y * segments + x;

      ctx.moveTo(cloth.particles[i1].pos.x, cloth.particles[i1].pos.y);
      ctx.lineTo(cloth.particles[i1 + 1].pos.x, cloth.particles[i1 + 1].pos.y);
      ctx.lineTo(cloth.particles[i2].pos.x, cloth.particles[i2].pos.y);
      ctx.lineTo(cloth.particles[i2 - 1].pos.x, cloth.particles[i2 - 1].pos.y);
```
- On ne dessine pas de simples lignes. On dessine des **quadrilatères** (des surfaces à 4 côtés).
- Les boucles parcourent chaque "cellule" de la grille.
- `i1` et `i2` sont des calculs d'index pour trouver les 4 particules qui forment un carré : en haut à gauche, en haut à droite, en bas à droite, et en bas à gauche.
- `moveTo` et `lineTo` dessinent le contour de ce carré.

Le calcul de la couleur est la partie la plus complexe :

```javascript
      let off = cloth.particles[i2].pos.x - cloth.particles[i1].pos.x;
      off += cloth.particles[i2].pos.y - cloth.particles[i1].pos.y;
      off *= 0.25;

      let stress = Math.abs(off) / stride; // Ratio de tension (0 à 1+)
      if (stress > 1) stress = 1;
```
- **`let off = ...`**: C'est une astuce pour mesurer l'étirement de la diagonale du carré. On additionne les distances X et Y.
- **`let stress = ...`**: On transforme cette mesure d'étirement en un ratio (un pourcentage). Si `stress` est 0, le tissu est détendu. Si c'est 1, il est très tendu.

```javascript
      let r, g, b;
      if (stress < 1/3) { ... } 
      else if (stress < 2/3) { ... } 
      else { ... }

      const alpha = lerp(0.3, 1, stress);
      ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
      ctx.fill();
```
- Ce bloc `if/else if/else` est notre **logique de dégradé**.
- Selon la valeur de `stress`, il calcule les composantes Rouge (`r`), Verte (`g`) et Bleue (`b`) pour passer du rouge -> jaune -> bleu -> vert.
- **`const alpha = lerp(...)`**: La transparence (`alpha`) est aussi calculée. Plus le tissu est tendu, plus la couleur est opaque.
- **`ctx.fillStyle = ...`**: On assemble la couleur finale au format `rgba()`.
- **`ctx.fill()`**: On remplit le carré que l'on a dessiné avec cette couleur dynamique.

```javascript
  requestAnimationFrame(animate);
}

animate();
```
- **`requestAnimationFrame(animate)`**: C'est la méthode moderne pour créer une animation fluide. Elle dit au navigateur : "Dès que tu es prêt à dessiner la prochaine image, rappelle la fonction `animate`".
- **`animate()`**: On appelle la fonction une première fois pour démarrer la boucle.