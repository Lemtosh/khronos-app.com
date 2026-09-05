/* Fiabl — site vitrine.
   Trois comportements et pas un de plus : menu mobile, liseré de l'en-tête au
   défilement, apparition des blocs. Tout le reste du site fonctionne sans JS —
   c'est ce qui garantit qu'un robot d'indexation voit exactement le même
   contenu qu'un visiteur. */
(function () {
  'use strict';

  /* Marque la page comme « JS actif ». Les styles d'apparition sont préfixés
     par `.js` : sans cette classe, rien n'est masqué au départ. */
  document.documentElement.classList.add('js');

  /* ── Menu mobile ─────────────────────────────────────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    /* Un clic sur une entrée referme le menu — sinon il reste ouvert par-dessus
       la section vers laquelle on vient de sauter. */
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    /* Au passage en desktop, l'attribut `hidden` doit être retiré : le CSS le
       neutralise déjà au-delà de 880 px, mais un menu resté `hidden` en HTML
       serait annoncé comme absent par un lecteur d'écran. */
    var wide = window.matchMedia('(min-width: 881px)');
    var syncViewport = function () {
      if (wide.matches) setOpen(true);
      else setOpen(false);
    };
    if (wide.addEventListener) wide.addEventListener('change', syncViewport);
    else if (wide.addListener) wide.addListener(syncViewport);
    syncViewport();
  }

  /* ── Liseré de l'en-tête ─────────────────────────────────────────────── */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Apparition des blocs ────────────────────────────────────────────── */
  var revealables = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    /* Repli : tout est montré d'un coup. Ne jamais laisser un contenu masqué
       parce qu'une API manque. */
    for (var i = 0; i < revealables.length; i++) revealables[i].classList.add('is-in');
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target); /* une seule fois : ça ne se rejoue pas au retour */
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealables.forEach(function (el) { observer.observe(el); });
})();
