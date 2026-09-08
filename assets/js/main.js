/* ChronoFrise, site vitrine.
   Six comportements : version courante, menu mobile, liseré de l'en-tête,
   démonstration, demande en ligne et apparition des blocs. Le téléchargement garde une URL de
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

  /* ── Démonstration de saisie ──────────────────────────────────────────
     Les lignes existent dans le HTML pour rester compréhensibles sans JS ;
     cette classe ne fait que rejouer leur apparition et le tracé des frises. */
  var liveDemo = document.querySelector('[data-live-demo]');
  if (liveDemo) {
    var playDemo = function () {
      liveDemo.classList.remove('is-playing');
      void liveDemo.offsetWidth;
      liveDemo.classList.add('is-playing');
    };
    var replay = liveDemo.querySelector('.demo-replay');
    if (replay) replay.addEventListener('click', playDemo);
    requestAnimationFrame(playDemo);
  }

  /* ── Intérêt pour la solution en ligne ──────────────────────────────── */
  var onlineDialog = document.getElementById('online-dialog');
  var onlineForm = document.getElementById('online-form');
  var onlineEmail = document.getElementById('online-email');
  var onlineConsent = document.getElementById('online-consent');
  var onlineWebsite = document.getElementById('online-website');
  var onlineSubmit = document.getElementById('online-submit');
  var onlineStatus = document.getElementById('online-form-status');
  var onlineTrigger = null;
  var onlineEndpoint = 'https://api.chronofrise.com/api/public/online-interest';

  function setOnlineStatus(message, state) {
    if (!onlineStatus) return;
    onlineStatus.textContent = message;
    onlineStatus.classList.remove('is-success', 'is-error');
    if (state) onlineStatus.classList.add('is-' + state);
  }

  if (onlineDialog && typeof onlineDialog.showModal === 'function') {
    document.querySelectorAll('[data-online-open]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        onlineTrigger = link;
        setOnlineStatus('', '');
        onlineDialog.showModal();
        if (onlineEmail) requestAnimationFrame(function () { onlineEmail.focus(); });
      });
    });

    onlineDialog.querySelectorAll('[data-online-close]').forEach(function (button) {
      button.addEventListener('click', function () { onlineDialog.close(); });
    });

    onlineDialog.addEventListener('click', function (event) {
      if (event.target === onlineDialog) onlineDialog.close();
    });

    onlineDialog.addEventListener('close', function () {
      if (onlineTrigger) onlineTrigger.focus();
    });
  }

  if (onlineForm && onlineEmail && onlineConsent && onlineWebsite && onlineSubmit) {
    onlineForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!onlineForm.checkValidity()) {
        onlineForm.reportValidity();
        return;
      }

      onlineSubmit.disabled = true;
      onlineSubmit.textContent = 'Envoi en cours…';
      onlineForm.setAttribute('aria-busy', 'true');
      setOnlineStatus('', '');

      try {
        var response = await fetch(onlineEndpoint, {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: onlineEmail.value.trim(),
            consent: onlineConsent.checked,
            website: onlineWebsite.value,
            sourcePath: window.location.pathname + window.location.search
          })
        });
        var result = await response.json().catch(function () { return null; });
        if (!response.ok || !result || result.ok !== true) throw new Error('interest_request_failed');

        onlineForm.reset();
        setOnlineStatus('Merci. Votre demande a bien été enregistrée.', 'success');
      } catch (error) {
        setOnlineStatus('Impossible d’enregistrer votre demande pour le moment. Veuillez réessayer dans quelques instants.', 'error');
      } finally {
        onlineSubmit.disabled = false;
        onlineSubmit.textContent = 'Envoyer ma demande';
        onlineForm.removeAttribute('aria-busy');
      }
    });
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
