/**
 * ========================================================================
 * TERRANOVA DESARROLLOS INMOBILIARIOS
 * ARCHIVO: js/config.js
 * PROPÓSITO: Motor de configuración dinámica, 4 modos visuales y video destacado
 * DIRECTIVAS: D1 (Cero código), D2 (16:9), D3 (<0.4s), D5 (Modularidad Lego), D6 (<1.000 líneas)
 * ========================================================================
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'TERRANOVA_SITE_CONFIG';
  const PROJECTS_STORAGE_KEY = 'TERRANOVA_PROJECTS_DATA';

  /**
   * 1. CONFIGURACIÓN BASE POR DEFECTO (Paleta Luminosa Discovery Land Co)
   */
  const DEFAULT_CONFIG = {
    brandName: 'TERRANOVA',
    brandSubtitle: 'PARCELACIONES & INVESTMENTS',
    heroKicker: 'DESARROLLOS RURALES DE ALTA GAMA • CUNDINAMARCA',
    heroHeadline: 'PATRIMONIO EN TIERRA FIRME',
    heroDescription: 'Parcelaciones campestres con vocación de descanso, privacidad absoluta y blindaje jurídico notarial independiente.',
    heroImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80',
    whatsapp: '573100000000',
    heroVideoSource: 'featured',
    videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    themeMode: 'light',
    customThemes: [],
    typologies: [
      { id: 'lote', label: 'Lotes Campestres' },
      { id: 'casa', label: 'Casas Campestres' },
      { id: 'apartamento', label: 'Apartamentos de Montaña' }
    ],
    toggles: {
      benefits: true,
      video: true,
      process: true,
      faq: true
    },
    customSections: []
  };

  /**
   * 2. LECTURA JERÁRQUICA (LocalStorage -> Bundle Producción -> Defaults)
   */
  function getStoredConfig() {
    const bundle = global.TERRANOVA_PRODUCTION_BUNDLE;
    const bundleConfig = (bundle && bundle.siteConfig) ? bundle.siteConfig : {};

    if (bundle && Array.isArray(bundle.projectsCatalog) && !localStorage.getItem(PROJECTS_STORAGE_KEY)) {
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(bundle.projectsCatalog));
      } catch (e) { /* Ignorar si storage está restringido */ }
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const localConfig = raw ? JSON.parse(raw) : {};

      return {
        ...DEFAULT_CONFIG,
        ...bundleConfig,
        ...localConfig,
        toggles: {
          ...DEFAULT_CONFIG.toggles,
          ...(bundleConfig.toggles || {}),
          ...(localConfig.toggles || {})
        },
        customThemes: Array.isArray(localConfig.customThemes)
          ? localConfig.customThemes
          : (Array.isArray(bundleConfig.customThemes) ? bundleConfig.customThemes : []),
        typologies: Array.isArray(localConfig.typologies) && localConfig.typologies.length > 0
          ? localConfig.typologies
          : (Array.isArray(bundleConfig.typologies) && bundleConfig.typologies.length > 0
              ? bundleConfig.typologies
              : DEFAULT_CONFIG.typologies),
        customSections: Array.isArray(localConfig.customSections)
          ? localConfig.customSections
          : (Array.isArray(bundleConfig.customSections) ? bundleConfig.customSections : [])
      };
    } catch (err) {
      console.warn('[Terranova Config] Error leyendo configuración; usando valores base.', err);
      return { ...DEFAULT_CONFIG, ...bundleConfig };
    }
  }

  /**
   * Utilidad para detectar si un color hexadecimal es oscuro
   */
  function isDarkHex(hex) {
    const clean = String(hex || '').replace('#', '');
    if (clean.length !== 6) return false;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  /**
   * 3. APLICACIÓN DE TEMA (2 MODOS FIJOS + 2 MODOS PERSONALIZADOS)
   */
  function applyThemeTokens(config) {
    const root = document.documentElement;
    if (!root) return;

    const mode = config.themeMode || 'light';

    if (mode === 'dark') {
      // Modo Fijo 2: Oscuro Editorial
      root.style.setProperty('--color-bg-canvas', '#111111');
      root.style.setProperty('--color-bg-surface', '#1A1A1A');
      root.style.setProperty('--color-bg-subtle', '#161616');
      root.style.setProperty('--color-bg-dock', 'rgba(17, 17, 17, 0.92)');
      root.style.setProperty('--color-text-main', '#F4F3EE');
      root.style.setProperty('--color-text-muted', '#A8A49B');
      root.style.setProperty('--color-text-subtle', '#7D786F');
      root.style.setProperty('--color-border-subtle', 'rgba(255, 255, 255, 0.12)');
      root.style.setProperty('--color-border-medium', 'rgba(255, 255, 255, 0.22)');
      root.style.setProperty('--color-border-focus', '#F4F3EE');
      return;
    }

    if (mode === 'custom-1' || mode === 'custom-2') {
      const customList = Array.isArray(config.customThemes) ? config.customThemes : [];
      const customTheme = customList.find((t) => t.id === mode);
      if (customTheme) {
        const bgIsDark = isDarkHex(customTheme.bgCanvas);
        root.style.setProperty('--color-bg-canvas', customTheme.bgCanvas || '#FAF9F5');
        root.style.setProperty('--color-bg-surface', customTheme.bgSurface || '#FFFFFF');
        root.style.setProperty('--color-bg-subtle', customTheme.bgSurface || '#F3F1EA');
        root.style.setProperty('--color-bg-dock', bgIsDark ? 'rgba(15, 20, 30, 0.92)' : 'rgba(250, 249, 245, 0.92)');
        root.style.setProperty('--color-text-main', customTheme.textMain || '#141414');
        root.style.setProperty('--color-text-muted', customTheme.textMuted || '#55534E');
        root.style.setProperty('--color-text-subtle', customTheme.textMuted || '#8A857B');
        root.style.setProperty('--color-border-subtle', bgIsDark ? 'rgba(255,255,255,0.12)' : 'rgba(20,20,20,0.08)');
        root.style.setProperty('--color-border-medium', bgIsDark ? 'rgba(255,255,255,0.22)' : 'rgba(20,20,20,0.15)');
        root.style.setProperty('--color-border-focus', customTheme.textMain || '#141414');
        return;
      }
    }

    // Modo Fijo 1 (Por defecto): Luminoso Discovery
    root.style.setProperty('--color-bg-canvas', '#FAF9F5');
    root.style.setProperty('--color-bg-surface', '#FFFFFF');
    root.style.setProperty('--color-bg-subtle', '#F3F1EA');
    root.style.setProperty('--color-bg-dock', 'rgba(250, 249, 245, 0.92)');
    root.style.setProperty('--color-text-main', '#141414');
    root.style.setProperty('--color-text-muted', '#55534E');
    root.style.setProperty('--color-text-subtle', '#8A857B');
    root.style.setProperty('--color-border-subtle', 'rgba(20, 20, 20, 0.08)');
    root.style.setProperty('--color-border-medium', 'rgba(20, 20, 20, 0.15)');
    root.style.setProperty('--color-border-focus', '#141414');
  }

  /**
   * 4. OBTENCIÓN DEL VIDEO DESTACADO PARA PORTADA PRINCIPAL
   */
  function getFeaturedVideoUrl() {
    const cfg = getStoredConfig();
    if (cfg.heroVideoSource === 'featured') {
      try {
        const storedProjs = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || 'null');
        const list = Array.isArray(storedProjs) && storedProjs.length > 0
          ? storedProjs
          : (global.TERRANOVA_PROJECTS ? global.TERRANOVA_PROJECTS.DEFAULT_PROJECTS : []);
        const featured = list.find((p) => p.destacado && p.visible !== false && p.videoUrl);
        if (featured && featured.videoUrl) return featured.videoUrl;
      } catch (e) { /* Usar fallback abajo */ }
    }
    return cfg.videoUrl || DEFAULT_CONFIG.videoUrl;
  }

  /**
   * 5. HIDRATACIÓN DE TEXTOS E IMÁGENES EN EL DOM
   */
  function applyBrandAndTexts(config) {
    document.querySelectorAll('.brand-title-serif').forEach((el) => {
      if (config.brandName) el.textContent = config.brandName;
    });

    document.querySelectorAll('.brand-subtitle-tech').forEach((el) => {
      if (config.brandSubtitle) el.textContent = config.brandSubtitle;
    });

    if (config.brandName && !document.body.getAttribute('data-page')) {
      document.title = `${config.brandName} | Parcelaciones Campestres & Private Estates`;
    }

    if (!document.body.getAttribute('data-page')) {
      const heroKicker = document.querySelector('.hero-kicker-label');
      if (heroKicker && config.heroKicker) heroKicker.textContent = config.heroKicker;

      const heroTitle = document.querySelector('.hero-serif-title');
      if (heroTitle && config.heroHeadline) heroTitle.textContent = config.heroHeadline;

      const heroTagline = document.querySelector('.hero-tagline-text');
      if (heroTagline && config.heroDescription) heroTagline.textContent = config.heroDescription;

      const heroMedia = document.getElementById('heroMediaElement');
      if (heroMedia && config.heroImageUrl) heroMedia.src = config.heroImageUrl;
    }

    document.querySelectorAll('[data-bind]').forEach((el) => {
      const key = el.getAttribute('data-bind');
      if (key && config[key] !== undefined && config[key] !== '') {
        el.textContent = config[key];
      }
    });
  }

  /**
   * 6. INTERRUPTORES DE SECCIONES BASE (Directiva 5)
   */
  function applySectionToggles(config) {
    const toggles = config.toggles || {};
    const sectionMap = {
      benefits: '[data-section="benefits"]',
      video: '[data-section="video-showcase"]',
      process: '[data-section="process"]',
      faq: '[data-section="faq"]'
    };

    Object.keys(sectionMap).forEach((key) => {
      const el = document.querySelector(sectionMap[key]);
      if (!el) return;
      el.style.display = toggles[key] !== false ? '' : 'none';
    });
  }

  /**
   * 7. RENDERIZADOR DE SECCIONES MODULARES PERSONALIZADAS
   */
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCustomSections(config) {
    if (document.body.getAttribute('data-page')) return;

    let mount = document.getElementById('customSectionsMount');
    const captureSection = document.querySelector('[data-section="capture"]');
    if (!mount && captureSection && captureSection.parentNode) {
      mount = document.createElement('div');
      mount.id = 'customSectionsMount';
      captureSection.parentNode.insertBefore(mount, captureSection);
    }
    if (!mount) return;

    const sections = Array.isArray(config.customSections) ? config.customSections : [];
    if (sections.length === 0) {
      mount.innerHTML = '';
      return;
    }

    mount.innerHTML = sections.map((sec, idx) => {
      const isAlt = idx % 2 === 0;
      const sectionClass = isAlt ? 'urbanism-criteria-section' : 'master-portfolio-section';
      const hasImage = Boolean(sec.imageUrl && sec.imageUrl.trim());
      const imageHtml = hasImage
        ? `<div class="cinema-screen-chassis" style="margin-top: 36px;">
             <div class="project-aspect-ratio-16-9">
               <img src="${escapeHtml(sec.imageUrl)}" alt="${escapeHtml(sec.title)}" class="project-card-cover-photo" loading="lazy">
             </div>
           </div>`
        : '';

      const ctaHtml = (sec.ctaText && sec.ctaLink)
        ? `<div style="margin-top: 32px; display: flex; justify-content: center;">
             <a href="${escapeHtml(sec.ctaLink)}" class="btn-submit-luxury">${escapeHtml(sec.ctaText)}</a>
           </div>`
        : '';

      return `
        <section class="${sectionClass}" data-section="${escapeHtml(sec.id || 'custom-' + idx)}">
          <div class="luxury-container reading-width">
            <header class="section-editorial-header text-center-block">
              <span class="section-numeric-tag">${escapeHtml(sec.kicker || '')}</span>
              <h2 class="section-serif-headline">${escapeHtml(sec.title || '')}</h2>
              <p class="section-lead-paragraph">${escapeHtml(sec.body || '')}</p>
            </header>
            ${imageHtml}
            ${ctaHtml}
          </div>
        </section>
      `;
    }).join('');
  }

  /**
   * 8. EJECUCIÓN COMPLETA
   */
  function applyAllConfig() {
    const config = getStoredConfig();
    applyThemeTokens(config);
    applyBrandAndTexts(config);
    applySectionToggles(config);
    renderCustomSections(config);
    return config;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllConfig);
  } else {
    applyAllConfig();
  }

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      applyAllConfig();
      window.dispatchEvent(new CustomEvent('terranova:config-updated'));
    }
  });

  global.TERRANOVA_CONFIG = {
    STORAGE_KEY,
    DEFAULT_CONFIG,
    get: getStoredConfig,
    getFeaturedVideoUrl,
    apply: applyAllConfig
  };

})(typeof window !== 'undefined' ? window : this);