/* ChronoFrise, site vitrine.
   Quatre comportements : version courante, menu mobile, liseré de l'en-tête
   au défilement et apparition des blocs. Le téléchargement garde une URL de
   secours dans le HTML afin de rester disponible sans JavaScript.
   C'est ce qui garantit qu'un robot d'indexation voit exactement le même
   contenu qu'un visiteur. */
(function () {
  'use strict';

  /* Marque la page comme « JS actif ». Les styles d'apparition sont préfixés
     par `.js` : sans cette classe, rien n'est masqué au départ. */
  document.documentElement.classList.add('js');

  /* ── Version courante ───────────────────────────────────────────────────
     `latest.json` est aussi utilisé par l'updater de l'application. Le site
     reprend donc exactement la même version et surtout l'URL publiée dans le
     manifeste, sans tenter de reconstruire le nom de l'installeur. */
  var manifestUrl = 'https://khronos-maj.pages.dev/latest.json';

  fetch(manifestUrl, { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('Manifeste indisponible (' + response.status + ')');
      return response.json();
    })
    .then(function (release) {
      var platform = release.platforms && release.platforms['windows-x86_64'];

      if (!release.version || !release.pub_date || !platform || !platform.url) {
        throw new Error('Manifeste incomplet');
      }

      var downloadUrl = new URL(platform.url);
      if (downloadUrl.protocol !== 'https:' || downloadUrl.hostname !== 'khronos-maj.pages.dev') {
        throw new Error('URL de téléchargement non autorisée');
      }

      document.querySelectorAll('[data-app-version]').forEach(function (element) {
        element.textContent = release.version;
      });

      document.querySelectorAll('[data-version-template]').forEach(function (element) {
        var value = element.getAttribute('data-version-template').replace('{version}', release.version);
        if (element.tagName === 'META') element.setAttribute('content', value);
        else element.textContent = value;
      });

      document.querySelectorAll('[data-download-windows]').forEach(function (link) {
        link.href = downloadUrl.href;
      });

      var releaseDate = new Date(release.pub_date);
      if (!isNaN(releaseDate.getTime())) {
        document.querySelectorAll('[data-release-date]').forEach(function (element) {
          element.textContent = new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
          }).format(releaseDate);
          element.setAttribute('datetime', releaseDate.toISOString().slice(0, 10));
        });
      }

      var softwareSchema = document.querySelector('[data-software-schema]');
      if (softwareSchema) {
        try {
          var schema = JSON.parse(softwareSchema.textContent);
          var applications = schema['@graph'] || [schema];
          applications.forEach(function (item) {
            if (item['@type'] !== 'SoftwareApplication') return;
            item.softwareVersion = release.version;
            item.downloadUrl = downloadUrl.href;
          });
          softwareSchema.textContent = JSON.stringify(schema);
        } catch (error) {
          console.warn('Données structurées non actualisées :', error);
        }
      }
    })
    .catch(function (error) {
      /* L'URL 1.0.3 présente dans le HTML reste utilisable en cas d'échec. */
      console.warn('Version dynamique non actualisée :', error);
    });

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

    /* Un clic sur une entrée referme le menu, sinon il reste ouvert par-dessus
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
