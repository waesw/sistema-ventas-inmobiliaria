/**
 * Configuración Global del Sitio y Sincronización Segura con PHP 8
 * Alineado 100% con css/variables.css, páginas públicas (data-bind) y control/empalme.
 */
(function (window, document) {
    'use strict';

    const STORAGE_KEY = 'TERRANOVA_SITE_CONFIG';

    const FIXED_THEMES = {
        'marfil-clasico': {
            name: 'Marfil Clásico (Quiet Luxury)',
            bg: '#FAF9F5',
            surface: '#FFFFFF',
            subtle: '#F3F1EA',
            dock: 'rgba(250, 249, 245, 0.92)',
            text: '#141414',
            muted: '#55534E',
            accent: '#7D786F',
            border: 'rgba(20, 20, 20, 0.08)'
        },
        'grafito-nocturno': {
            name: 'Grafito Editorial',
            bg: '#161615',
            surface: '#20201E',
            subtle: '#1C1C1A',
            dock: 'rgba(22, 22, 21, 0.92)',
            text: '#FAF9F5',
            muted: '#B8B3A8',
            accent: '#C4A87B',
            border: 'rgba(250, 249, 245, 0.14)'
        }
    };

    const DEFAULT_TYPOLOGIES = [
        { id: 'lote', label: 'Lotes Campestres' },
        { id: 'casa', label: 'Casas Campestres' },
        { id: 'apartamento', label: 'Apartamentos de Montaña' }
    ];

    const DEFAULT_CONFIG = {
        brandName: 'TERRANOVA',
        brandSubtitle: 'PARCELACIONES & INVESTMENTS',
        whatsappNumber: '573208103010',
        whatsapp: '573208103010',
        contactEmail: 'contacto@inmobiliariacampestre.co',
        officeAddress: 'San Francisco, Cundinamarca · Colombia',
        heroEyebrow: 'DESARROLLOS RURALES DE ALTA GAMA • CUNDINAMARCA',
        heroTitle: 'PATRIMONIO EN TIERRA FIRME',
        heroSubtitle: 'Parcelaciones campestres con vocación de descanso, privacidad absoluta y blindaje jurídico notarial independiente.',
        heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80',
        heroVideoUrl: '',
        activeTheme: 'marfil-clasico',
        customThemes: {
            'custom-1': {
                name: 'Reserva Bosque',
                bg: '#F4F6F3',
                surface: '#FFFFFF',
                subtle: '#EBF0EB',
                dock: 'rgba(244, 246, 243, 0.92)',
                text: '#17211B',
                muted: '#55635A',
                accent: '#3A6B4C',
                border: 'rgba(23, 33, 27, 0.1)'
            },
            'custom-2': {
                name: 'Piedra Andina',
                bg: '#F5F2ED',
                surface: '#FCFBF8',
                subtle: '#ECE7DE',
                dock: 'rgba(245, 242, 237, 0.92)',
                text: '#1F1B18',
                muted: '#665E57',
                accent: '#9A6B42',
                border: 'rgba(31, 27, 24, 0.1)'
            }
        },
        typologies: DEFAULT_TYPOLOGIES,
        featuredVideo: {
            title: 'Recorrido Aéreo · Cundinamarca',
            subtitle: 'Topografía, vías de acceso y entorno natural de nuestros proyectos.',
            youtubeUrl: 'https://www.youtube.com/watch?v=gU5AYz8x0YU'
        },
        customSections: [],
        pixels: {
            metaPixelId: '',
            tiktokPixelId: ''
        }
    };

    function normalizeTypologies(rawList) {
        if (!Array.isArray(rawList) || !rawList.length) {
            return DEFAULT_TYPOLOGIES.map((t) => ({ ...t }));
        }
        return rawList.slice(0, 5).map((item, idx) => {
            if (item && typeof item === 'object' && item.label) {
                const id = String(item.id || item.label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tipo-${idx + 1}`;
                return { id, label: String(item.label).trim() };
            }
            const label = String(item || '').trim();
            const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tipo-${idx + 1}`;
            return { id, label };
        }).filter((t) => t.label !== '');
    }

    function mergeConfig(base, override) {
        if (!override || typeof override !== 'object') {
            return JSON.parse(JSON.stringify(base));
        }
        const merged = Object.assign({}, base, override);
        const wa = override.whatsappNumber || override.whatsapp || base.whatsappNumber;
        merged.whatsappNumber = wa;
        merged.whatsapp = wa;
        merged.customThemes = Object.assign({}, base.customThemes, override.customThemes || {});
        merged.featuredVideo = Object.assign({}, base.featuredVideo, override.featuredVideo || {});
        merged.pixels = Object.assign({}, base.pixels, override.pixels || {});
        merged.typologies = normalizeTypologies(override.typologies);
        merged.customSections = Array.isArray(override.customSections) ? override.customSections : [];
        return merged;
    }

    function getSiteConfig() {
        if (window.TERRANOVA_PRODUCTION_BUNDLE && window.TERRANOVA_PRODUCTION_BUNDLE.config) {
            return mergeConfig(DEFAULT_CONFIG, window.TERRANOVA_PRODUCTION_BUNDLE.config);
        }
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                return mergeConfig(DEFAULT_CONFIG, JSON.parse(raw));
            }
        } catch (err) {
            // Ignora errores de almacenamiento restringido
        }
        return mergeConfig(DEFAULT_CONFIG, null);
    }

    function saveSiteConfig(nextConfig) {
        const clean = mergeConfig(DEFAULT_CONFIG, nextConfig);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        } catch (err) {
            // Ignora cuota llena
        }
        applySiteConfig(clean);
        window.dispatchEvent(new CustomEvent('terranova:config-updated', { detail: clean }));
        return clean;
    }

    function resolveTheme(cfg) {
        const key = cfg.activeTheme || 'marfil-clasico';
        if (FIXED_THEMES[key]) return FIXED_THEMES[key];
        if (cfg.customThemes && cfg.customThemes[key]) return cfg.customThemes[key];
        return FIXED_THEMES['marfil-clasico'];
    }

    function applySiteConfig(configOverride) {
        const cfg = configOverride || getSiteConfig();
        const theme = resolveTheme(cfg);
        const root = document.documentElement;

        if (root && theme) {
            root.style.setProperty('--color-bg-canvas', theme.bg || '#FAF9F5');
            root.style.setProperty('--color-bg-surface', theme.surface || '#FFFFFF');
            root.style.setProperty('--color-bg-subtle', theme.subtle || '#F3F1EA');
            root.style.setProperty('--color-bg-dock', theme.dock || 'rgba(250, 249, 245, 0.92)');
            root.style.setProperty('--color-text-main', theme.text || '#141414');
            root.style.setProperty('--color-text-muted', theme.muted || '#55534E');
            root.style.setProperty('--color-tierra-cruda', theme.accent || '#7D786F');
            root.style.setProperty('--color-border-subtle', theme.border || 'rgba(20, 20, 20, 0.08)');
        }

        document.querySelectorAll('[data-brand-name], [data-bind="brandName"]').forEach((el) => {
            el.textContent = cfg.brandName || 'TERRANOVA';
        });
        document.querySelectorAll('[data-brand-subtitle], [data-bind="brandSubtitle"]').forEach((el) => {
            el.textContent = cfg.brandSubtitle || '';
        });
        document.querySelectorAll('[data-hero-eyebrow], [data-bind="heroKicker"]').forEach((el) => {
            el.textContent = cfg.heroEyebrow || '';
        });
        document.querySelectorAll('[data-hero-title], [data-bind="heroHeadline"]').forEach((el) => {
            el.textContent = cfg.heroTitle || '';
        });
        document.querySelectorAll('[data-hero-subtitle], [data-bind="heroDescription"]').forEach((el) => {
            el.textContent = cfg.heroSubtitle || '';
        });

        const heroImg = document.getElementById('heroMediaElement');
        if (heroImg && heroImg.tagName === 'IMG' && cfg.heroImage) {
            heroImg.src = cfg.heroImage;
        }

        document.querySelectorAll('[data-hero-image]').forEach((el) => {
            if (cfg.heroImage) {
                el.style.backgroundImage = `url("${cfg.heroImage}")`;
            }
        });
        document.querySelectorAll('[data-contact-email]').forEach((el) => {
            el.textContent = cfg.contactEmail || '';
            if (el.tagName === 'A') el.href = `mailto:${cfg.contactEmail || ''}`;
        });
        document.querySelectorAll('[data-office-address]').forEach((el) => {
            el.textContent = cfg.officeAddress || '';
        });
        document.querySelectorAll('[data-whatsapp-link]').forEach((el) => {
            const num = String(cfg.whatsappNumber || '573208103010').replace(/\D+/g, '');
            el.href = `https://wa.me/${num}`;
        });

        window.TERRANOVA_ACTIVE_CONFIG = cfg;
        return cfg;
    }

    async function syncFromServer() {
        const proto = window.location.protocol;
        const host = window.location.hostname || '';
        if (proto === 'file:' || host.endsWith('.github.io')) {
            return;
        }

        try {
            const res = await fetch('api/data.php?resource=public', {
                method: 'GET',
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            });
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok || !contentType.includes('application/json')) {
                return;
            }
            const payload = await res.json();
            if (!payload || !payload.ok) return;

            let updated = false;
            if (payload.config && typeof payload.config === 'object') {
                const merged = mergeConfig(DEFAULT_CONFIG, payload.config);
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                applySiteConfig(merged);
                updated = true;
            }
            if (Array.isArray(payload.projects) && payload.projects.length > 0) {
                window.localStorage.setItem('TERRANOVA_PROJECTS_DATA', JSON.stringify(payload.projects));
                updated = true;
            }

            if (updated) {
                window.dispatchEvent(new CustomEvent('terranova:data-synced', { detail: payload }));
            }
        } catch (err) {
            // Entorno sin PHP activo; continúa con caché/valores por defecto
        }
    }

    window.TERRANOVA_FIXED_THEMES = FIXED_THEMES;
    window.TERRANOVA_DEFAULT_CONFIG = DEFAULT_CONFIG;
    window.getSiteConfig = getSiteConfig;
    window.saveSiteConfig = saveSiteConfig;
    window.applySiteConfig = applySiteConfig;
    window.TERRANOVA_CONFIG = {
        get: getSiteConfig,
        save: saveSiteConfig,
        apply: applySiteConfig,
        getFeaturedVideoUrl: () => {
            const cfg = getSiteConfig();
            return (cfg.featuredVideo && cfg.featuredVideo.youtubeUrl) || DEFAULT_CONFIG.featuredVideo.youtubeUrl;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applySiteConfig();
            syncFromServer();
        });
    } else {
        applySiteConfig();
        syncFromServer();
    }
})(window, document);