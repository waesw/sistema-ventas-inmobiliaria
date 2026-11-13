/**
 * ========================================================================
 * TERRANOVA DESARROLLOS INMOBILIARIOS
 * ARCHIVO: js/main.js
 * PROPÓSITO: Controlador de cabecera, drawer, video destacado/proyecto y WhatsApp + Leads PHP 8
 * DIRECTIVAS: D2 (Video diferido), D3 (<0.4s), D4 (Ergonomía), D6 (<1.000 líneas)
 * ========================================================================
 */

(function (global) {
  'use strict';

  /**
   * 1. CABECERA FLOTANTE TRANSPARENTE -> MARFIL AL HACER SCROLL
   */
  function initStickyHeader() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const updateHeaderState = () => {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', updateHeaderState, { passive: true });
    updateHeaderState();
  }

  /**
   * 2. MENÚ DRAWER MINIMALISTA (MENU | ✕)
   */
  function initLuxuryDrawer() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const closeBtn = document.getElementById('drawerCloseBtn');
    const drawer = document.getElementById('luxuryDrawer');
    if (!toggleBtn || !drawer) return;

    const openDrawer = () => {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    drawer.querySelectorAll('.drawer-link').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });
  }

  /**
   * 3. CONTROL AUDIOVISUAL SUTIL EN EL HERO (|| PAUSA)
   */
  function initHeroMediaControl() {
    const btnToggle = document.getElementById('btnMediaToggle');
    const heroMedia = document.getElementById('heroMediaElement');
    if (!btnToggle || !heroMedia) return;

    let isPaused = false;
    const iconSpan = btnToggle.querySelector('.sound-icon-symbol');
    const labelSpan = btnToggle.querySelector('.sound-label-text');

    btnToggle.addEventListener('click', () => {
      isPaused = !isPaused;
      if (heroMedia.tagName === 'VIDEO') {
        if (isPaused) heroMedia.pause();
        else heroMedia.play();
      } else {
        heroMedia.style.opacity = isPaused ? '0.65' : '1';
      }

      if (iconSpan) iconSpan.textContent = isPaused ? '▶' : '||';
      if (labelSpan) labelSpan.textContent = isPaused ? 'REANUDAR' : 'PAUSA';
    });
  }

  /**
   * 4. REPRODUCTORES DE VIDEO 16:9 CON CARGA DIFERIDA (Portada + Proyecto Individual)
   */
  function parseEmbedUrl(rawUrl) {
    if (!rawUrl) return null;

    const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'iframe',
        provider: 'youtube',
        src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
        externalUrl: `https://www.youtube.com/watch?v=${ytMatch[1]}`
      };
    }

    const vimeoMatch = rawUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'iframe',
        provider: 'vimeo',
        src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        externalUrl: rawUrl
      };
    }

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(rawUrl)) {
      return { type: 'video', src: rawUrl, externalUrl: rawUrl };
    }

    return null;
  }

  function mountVideoPlayer(rawUrl, facadeEl, targetEl) {
    const parsed = parseEmbedUrl(rawUrl);
    if (!parsed) {
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const isLocalFile = window.location.protocol === 'file:';

    if (parsed.type === 'video') {
      targetEl.innerHTML = `<video src="${parsed.src}" controls autoplay playsinline></video>`;
    } else if (isLocalFile) {
      targetEl.innerHTML = `
        <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center;background:#141414;color:#FAF9F5;">
          <span style="font-family:var(--font-sans-technical);font-size:0.7rem;letter-spacing:0.2em;color:#C5A880;text-transform:uppercase;">MODO LOCAL (FILE://)</span>
          <p style="max-width:460px;font-size:0.95rem;color:#D3CFCA;line-height:1.6;">
            YouTube restringe la reproducción incrustada cuando abres el archivo directo desde Windows. En GitHub Pages o tu servidor web se reproducirá aquí automáticamente.
          </p>
          <a href="${parsed.externalUrl}" target="_blank" rel="noopener noreferrer" class="btn-submit-luxury" style="text-decoration:none;">
            <span>ABRIR VIDEO EN YOUTUBE</span>
            <span class="btn-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      `;
    } else {
      targetEl.innerHTML = `<iframe src="${parsed.src}" title="Recorrido audiovisual del proyecto" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }

    facadeEl.style.display = 'none';
    targetEl.style.display = 'block';
  }

  function initCinemaShowcases() {
    const homeTrigger = document.getElementById('btnTriggerVideo');
    const homeFacade = document.getElementById('videoFacade');
    const homeTarget = document.getElementById('videoEmbedTarget');

    if (homeTrigger && homeFacade && homeTarget) {
      homeTrigger.addEventListener('click', () => {
        const videoUrl = (global.TERRANOVA_CONFIG && typeof global.TERRANOVA_CONFIG.getFeaturedVideoUrl === 'function')
          ? global.TERRANOVA_CONFIG.getFeaturedVideoUrl()
          : 'https://www.youtube.com/watch?v=gU5AYz8x0YU';
        mountVideoPlayer(videoUrl, homeFacade, homeTarget);
      });
    }

    const projTrigger = document.getElementById('btnTriggerProjectVideo');
    const projFacade = document.getElementById('projectVideoFacade');
    const projTarget = document.getElementById('projectVideoEmbedTarget');

    if (projTrigger && projFacade && projTarget) {
      projTrigger.addEventListener('click', () => {
        const videoUrl = projTrigger.getAttribute('data-video-url');
        if (videoUrl) {
          mountVideoPlayer(videoUrl, projFacade, projTarget);
        }
      });
    }
  }

  /**
   * 5. NOTIFICACIÓN TOAST SOBRIA (Quiet Luxury)
   */
  function showLuxuryToast(message) {
    const existing = document.querySelector('.luxury-toast-alert');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'luxury-toast-alert';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  /**
   * 6. REGISTRO PRIVADO EN SERVIDOR PHP 8 + DISPARADOR DE WHATSAPP (contacto.html)
   */
  async function persistLeadInServer(payload) {
    if (global.InmobiliariaAPI && typeof global.InmobiliariaAPI.submitLead === 'function') {
      return global.InmobiliariaAPI.submitLead(payload);
    }

    const proto = window.location.protocol;
    const host = window.location.hostname || '';
    if (proto === 'file:' || host.endsWith('.github.io')) {
      return { ok: false, offline: true };
    }

    try {
      const res = await fetch('api/leads.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.assign({ action: 'create' }, payload))
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return { ok: false };
      return await res.json();
    } catch (err) {
      return { ok: false, offline: true };
    }
  }

  function initLeadSubmission() {
    const form = document.getElementById('mainLeadForm');
    const submitBtn = document.getElementById('mainSubmitButton');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!global.TERRANOVA_VALIDATOR) return;
      const result = global.TERRANOVA_VALIDATOR.validate();
      if (!result.valid || !result.data) return;

      if (submitBtn) submitBtn.classList.add('is-loading');

      const honeypotEl = form.querySelector('[name="website"]');
      const origenEl = form.querySelector('[name="origen"]');

      await persistLeadInServer({
        nombre: result.data.nombre,
        whatsapp: result.data.telefono,
        proyecto: result.data.proyecto,
        origen: origenEl ? origenEl.value : 'contacto_web',
        website: honeypotEl ? honeypotEl.value : ''
      });

      const cfg = global.TERRANOVA_CONFIG ? global.TERRANOVA_CONFIG.get() : {};
      const waRaw = (cfg.whatsappNumber || cfg.whatsapp || '573208103010');
      const waNumber = String(waRaw).replace(/[^0-9]/g, '');

      const leadMsg = [
        `Cordial saludo equipo ${cfg.brandName || 'Terranova'}.`,
        `Mi nombre es *${result.data.nombre}* (WhatsApp: +57 ${result.data.telefono}).`,
        `Solicito el dossier técnico, plano topográfico y esquema de financiación para: *${result.data.proyecto}*.`
      ].join(' ');

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(leadMsg)}`;

      showLuxuryToast('Solicitud registrada. Conectando con su asesor privado...');

      setTimeout(() => {
        if (submitBtn) submitBtn.classList.remove('is-loading');
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 450);
    });
  }

  /**
   * 7. INICIALIZACIÓN GLOBAL
   */
  function initApp() {
    initStickyHeader();
    initLuxuryDrawer();
    initHeroMediaControl();
    initCinemaShowcases();
    initLeadSubmission();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})(typeof window !== 'undefined' ? window : this);