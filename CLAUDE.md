# Règles de rédaction et de contribution

Les règles **techniques** (source unique des couleurs, aucune ressource externe,
lisibilité sans JavaScript, URL sans `.html`, bump du `?v=`, sitemap) sont dans
[README.md](README.md), section « Règles à tenir ». Elles s'appliquent telles quelles.

Ce fichier ajoute les règles **de langue**. Elles existent parce qu'un site trop
régulier se lit comme un site généré, et que c'est exactement ce qu'on cherche à
éviter ici.

## Interdits

- **Pas de tiret cadratin ni demi-cadratin dans la prose.** Ni `—` ni `–`. À la
  place : un deux-points, une parenthèse, une virgule ou un point. La seule
  exception est une chaîne qui reproduit littéralement l'interface de
  l'application (`FRISE ANTÉCÉDENTS — 36 MOIS`, `33 mois — 32 mois pleins…`) :
  la maquette doit rester fidèle à la capture d'écran voisine.
- **Pas de « ce n'est pas X, c'est Y »**, ni ses variantes (« non pas X mais Y »,
  « X ? Non. Y. »). C'est le tic le plus reconnaissable des textes générés.
- **Pas d'énumération ternaire systématique.** « Ni palier, ni option, ni coût au
  dossier » passe une fois. Trois sections d'affilée construites en triade, non.
  Deux éléments, ou quatre, cassent la cadence.
- **Pas de `TODO` dans le HTML publié.** Le code source d'un site vitrine se lit.

## À tenir

- **Le site parle à la première personne du singulier.** ChronoFrise est écrit et
  édité par Johann Philippon, seul. « Nous » ne subsiste que dans deux cas : quand
  il désigne l'auteur *et* le lecteur (« le contrat qui nous lie »), et quand il
  désigne le cabinet de courtage de l'auteur (« les données de nos clients »).
  Une question de FAQ posée du point de vue du lecteur garde évidemment son
  « nous » à lui (« Nos données transitent-elles par vos serveurs ? »).
- **Varier la longueur des titres.** Sur une même page, les `<h2>` ne doivent pas
  tous être des phrases complètes de longueur comparable terminées par un point.
  Alterner : deux mots, huit mots, une phrase, un groupe nominal.
- **Un `eyebrow` par page ou deux, pas un par section.**
- **Préférer le chiffre exact au chiffre rond.** « 33 mois, soit 32 mois pleins
  plus 15 jours de reliquat » vaut mieux que « environ trois ans ». Les dates,
  plaques et coefficients des maquettes reprennent des captures réelles : ne pas
  les remplacer par des valeurs inventées plus jolies.
- **Avouer les limites.** Le paragraphe sur l'avertissement SmartScreen (le
  certificat coûte plusieurs centaines d'euros par an, il sera acheté quand les
  abonnements le financeront) est l'étalon du ton attendu.

## Ce qui ne se touche pas sans raison

`<title>`, `<meta name="description">`, `canonical`, les URL, `sitemap.xml`, les
`<h1>`, et les ancres déjà liées (`#securite`, `#faq`, `#fonctionnalites`,
`#avenir`, `#origine`, `#smartscreen`).

Si une **question** de FAQ change, elle doit changer aux deux endroits : le
`<summary>` et le `FAQPage` en JSON-LD. Google recoupe les deux.
