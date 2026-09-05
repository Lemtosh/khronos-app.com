# fiabl.app

Site vitrine de **Fiabl**, l'application de bureau de vérification des antécédents
d'assurance auto et moto.

Site **statique** : aucun build, aucune dépendance, aucun `npm install`. On ouvre un
fichier, on l'édite, on le déploie tel quel.

## Structure

```
.
├── index.html                 accueil (une page complète)
├── fonctionnalites.html       le détail de chaque contrôle
├── tarifs.html                licences + comparatif + FAQ facturation
├── telechargement/index.html  page de téléchargement et d'installation
├── mentions-legales.html
├── confidentialite.html
├── 404.html
├── robots.txt · sitemap.xml · favicon.ico
└── assets/
    ├── css/style.css          SOURCE UNIQUE des couleurs et des primitives
    ├── js/main.js             menu mobile, liseré d'en-tête, apparitions
    └── img/                   logo + captures d'écran
```

## Règles à tenir

- **`assets/css/style.css` est la source unique** des couleurs. Ne jamais écrire une
  couleur en dur dans une page : utiliser `var(--coral)`, `var(--ink-900)`, `var(--muted)`…
  La charte vient du logo (anthracite + corail) ; les jetons `--green` / `--amber` /
  `--red` sont ceux de l'application, pour que le site et le produit disent la même chose.
- **Aucune ressource externe.** Ni police Google, ni CDN, ni script d'analyse. C'est ce qui
  permet de n'afficher aucune bannière de cookies et de garder un premier rendu immédiat —
  la vitesse est un critère de classement.
- **Le site doit rester lisible sans JavaScript.** Les animations d'apparition sont
  préfixées par `.js` dans le CSS : sans la classe posée par `main.js`, rien n'est masqué.
  Un robot d'indexation voit exactement le même contenu qu'un visiteur.
- **L'en-tête et le pied de page sont dupliqués dans chaque page.** C'est le prix d'un site
  sans build. Une modification de navigation se répercute dans les 6 fichiers HTML.
- **Toute nouvelle page s'ajoute à `sitemap.xml`** et porte ses propres `<title>`,
  `description`, `canonical` et balises Open Graph. Deux pages ne partagent jamais le même
  titre.

## À compléter avant la mise en ligne

Ces points sont marqués `TODO` dans le HTML :

| Où | Quoi |
|---|---|
| `telechargement/index.html` | l'URL réelle de l'installeur (`href="#"` aujourd'hui) |
| `tarifs.html` | les montants des licences — valeurs d'exemple |
| `mentions-legales.html` | identité de l'éditeur, du directeur de publication et de l'hébergeur |
| toutes les pages | l'adresse de contact (`contact@fiabl.app` par défaut) |

## Prévisualiser

```sh
python -m http.server 8000
```

Puis <http://localhost:8000>. Un simple double-clic sur `index.html` fonctionne aussi,
mais les liens absolus (`/assets/…`) ne se résolvent qu'en étant servi.

## Déployer

Le dépôt se publie tel quel sur n'importe quel hébergement statique
(Cloudflare Pages, GitHub Pages, Netlify) : répertoire racine `.`, aucune commande de build.
Vérifier que `404.html` est bien utilisé comme page d'erreur.
