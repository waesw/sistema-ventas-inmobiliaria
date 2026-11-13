/**
 * Configuración Global del Sitio y Sincronización Segura con PHP 8
 * Centraliza el 100% de marca, tema, logo, navegación, textos de secciones, páginas, FAQ y footer.
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

    const DEFAULT_HOME_SECTIONS = {
        heroPillVideo: 'VIDEO 4K',
        heroPauseBtn: 'PAUSA',
        heroScrollWordmark: 'DESCUBRIR',
        portfolioTag: '01. COLECCIÓN EXCLUSIVA',
        portfolioTitle: 'Nuestros Desarrollos Campestres',
        portfolioSubtitle: 'Explore nuestra selección de proyectos urbanísticos en Cundinamarca. Cada desarrollo cuenta con su propia ficha técnica, galería e inventario de unidades disponibles.',
        portfolioBtnText: 'EXPLORAR PORTAFOLIO →',
        criteriaTag: '02. ESTÁNDARES TÉCNICOS',
        criteriaTitle: 'Blindaje Jurídico & Urbanismo Sostenible',
        criteriaSubtitle: 'La adquisición de tierra de alto valor exige certezas absolutas. Estructuramos cada desarrollo con los más altos estándares de ingeniería y ordenamiento territorial.',
        criteriaItems: [
            { title: 'Tradición Jurídica Notarial', body: 'Cada lote e inmueble dispone de su propia matrícula inmobiliaria individual debidamente inscrita en la Oficina de Registro de Instrumentos Públicos. Cero esquemas de proindiviso.' },
            { title: 'Vías y Topografía Seleccionada', body: 'Acceso vial desde corredores intermunicipales consolidados. Vías internas con cunetas técnicas, recebado compactado y linderos topográficos georreferenciados.' },
            { title: 'Redes de Servicios Públicos', body: 'Acometidas de energía eléctrica certificadas ante el operador regional y disponibilidad hídrica para conexión inmediata al momento de entrega de la posesión.' },
            { title: 'Financiación Directa en Pesos', body: 'Esquemas flexibles acordados directamente con la desarrolladora. Cuota inicial pactada y saldo financiado sin intermediación bancaria tradicional.' }
        ],
        videoTag: '03. INSPECCIÓN AÉREA',
        videoCaptionTag: 'REGISTRO EN CAMPO',
        videoCaptionLead: 'Levantamiento topográfico y corredores verdes de la parcelación',
        processTag: '04. METODOLOGÍA NOTARIAL',
        processTitle: 'El Protocolo Hacia Su Título de Propiedad',
        processSubtitle: 'Un itinerario claro, transparente y con respaldo legal en cada hito del proceso.',
        processSteps: [
            { title: 'Selección del Predio', body: 'Definición de la unidad campestre según metraje, orientación solar y topografía deseada.' },
            { title: 'Dossier Técnico Notarial', body: 'Recepción digital del folio de matrícula, certificado de libertad y tradición, plano topográfico y minuta.' },
            { title: 'Inspección Presencial', body: 'Recorrido privado guiado en terreno con validación de mojones, linderos y vías internas.' },
            { title: 'Escrituración Pública', body: 'Firma formal de la escritura pública individual de compraventa ante Notaría con entrega de posesión.' }
        ],
        closingTag: '05. ATENCIÓN PRIVADA',
        closingTitle: 'Programe un Recorrido Privado en Terreno',
        closingSubtitle: 'Nuestro equipo comercial y asesoría jurídica le atenderán de forma personalizada para revisar planos, disponibilidad y esquemas de financiación directa.',
        closingPrimaryBtn: 'SOLICITAR ASESORÍA PRIVADA',
        closingSecondaryBtn: 'VER INVENTARIO DISPONIBLE'
    };

    const DEFAULT_PAGE_HEADERS = {
        portfolioKicker: 'NUESTROS DESARROLLOS • CUNDINAMARCA',
        portfolioTitle: 'COLECCIÓN DE PROYECTOS',
        portfolioSubtitle: 'Comunidades campestres concebidas bajo estrictos estándares de baja densidad, paisaje perpetuo y seguridad jurídica individual.',
        portfolioHeroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
        portfolioListTag: '01. DESARROLLOS ACTIVOS',
        portfolioListTitle: 'Portafolio Oficial de Parcelaciones',
        portfolioListSubtitle: 'Seleccione cualquier desarrollo para abrir su página dedicada con galería completa, especificaciones de servicios e inventario detallado de unidades disponibles.',
        portfolioClosingTag: '02. ASESORÍA PERSONALIZADA',
        portfolioClosingTitle: '¿Busca una Ubicación o Metraje Específico?',
        portfolioClosingSubtitle: 'Nuestro equipo le orientará sobre disponibilidad actualizada, planos topográficos y condiciones de financiación directa en cada proyecto.',
        inventoryKicker: 'LISTADO OFICIAL DE UNIDADES • CUNDINAMARCA',
        inventoryTitle: 'INVENTARIO DE PROPIEDADES',
        inventorySubtitle: 'Consulte la disponibilidad actualizada de lotes campestres, residencias y suites de montaña con matrícula inmobiliaria individual.',
        inventoryHeroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
        inventoryListTag: '01. DISPONIBILIDAD EN VIVO',
        inventoryListTitle: 'Unidades Individuales Vendibles',
        inventoryListSubtitle: 'Filtre por desarrollo urbanístico, tipología de inmueble o estado comercial para identificar la propiedad ideal.',
        contactKicker: 'CONCIERGE INMOBILIARIO • CUNDINAMARCA',
        contactTitle: 'ATENCIÓN PRIVADA',
        contactSubtitle: 'Coordine una visita personalizada en terreno o solicite la carpeta jurídica y de amortización de cualquiera de nuestros desarrollos.',
        contactHeroImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80'
    };

    const DEFAULT_PROJECT_PAGE = {
        heroPillOverview: 'RESUMEN',
        heroPillUrbanism: 'URBANISMO',
        heroPillUnits: 'PLANO & UNIDADES',
        heroPillVisit: 'VISITAR',
        backPortfolioBtn: '← VOLVER AL PORTAFOLIO',
        scrollUnitsBtn: 'VER PLANO & UNIDADES',
        unitsBadgeLabel: 'UNIDADES EN INVENTARIO',
        specLocationLabel: 'UBICACIÓN & ACCESO',
        specAreasLabel: 'RANGO DE ÁREAS',
        specPriceLabel: 'INVERSIÓN DESDE',
        amenitiesTag: '02. URBANISMO & SERVICIOS',
        amenitiesTitle: 'Infraestructura y Especificaciones',
        videoTag: '03. RECORRIDO EN VIDEO',
        videoTitle: 'Inspección Audiovisual del Predio',
        videoSubtitle: 'Recorrido en terreno, topografía real y accesos viales de este desarrollo.',
        videoCaptionTag: 'REGISTRO DEL PROYECTO',
        videoCaptionLead: 'Inspección en alta definición',
        galleryTag: '04. GALERÍA & SOPORTES',
        galleryTitle: 'Registro Visual y Licencias Oficiales',
        gallerySubtitle: 'Fotografías reales del entorno, urbanismo y soportes administrativos vigentes del proyecto. Haz clic en cualquier imagen para ampliarla.',
        blueprintTag: '05. PLANO & INVENTARIO',
        blueprintTitle: 'Planta Urbana y Unidades Disponibles',
        blueprintSubtitle: 'Consulta la ubicación exacta de cada predio sobre el plano topográfico y verifica su disponibilidad en tiempo real.',
        blueprintHint: 'TOCA UN LOTE PARA CONSULTAR POR WHATSAPP',
        whatsappBtnText: 'ASESORÍA POR WHATSAPP →',
        legendAvailable: 'Disponible',
        legendReserved: 'Reservado',
        legendSold: 'Vendido',
        colUnit: 'Unidad / Lote',
        colArea: 'Área Total',
        colPrice: 'Valor de Inversión',
        colStatus: 'Estado Comercial',
        colFmi: 'Matrícula (FMI)',
        colAction: 'Acción'
    };

    const DEFAULT_CONTACT_PAGE = {
        introTag: '01. CONCIERGE & ASESORÍA',
        introTitle: 'Solicite el Dossier Técnico de los Proyectos',
        introText: 'Nuestro equipo comercial y el sistema automatizado le remitirán de manera directa los planos, tablas de amortización y fichas jurídicas completas del proyecto de su interés.',
        perks: [
            'Envío de memorando técnico y plano topográfico por WhatsApp en 60 segundos.',
            'Simulación de cuotas de financiación directa personalizada.',
            'Agendamiento prioritario para recorridos privados durante el fin de semana.'
        ],
        selectAllText: 'Deseo recibir el portafolio integral de todos los proyectos',
        submitBtnText: 'SOLICITAR DOSSIER Y ATENCIÓN PRIVADA',
        formDisclaimer: 'Tratamiento de datos reservado bajo la Ley 1581 de 2012. Sus datos no serán cedidos a terceros.',
        faqTag: '02. PREGUNTAS FRECUENTES',
        faqTitle: 'Certezas para Inversionistas',
        faqs: [
            { q: '¿Cómo se garantiza la titulación individual de cada lote?', a: 'Cada desarrollo cuenta con licencia de parcelación aprobada por la autoridad de planeación municipal. Al momento de la negociación se suministra el folio de matrícula inmobiliaria individual e independiente debidamente asignado por la Oficina de Registro de Instrumentos Públicos, garantizando la titularidad del 100% del dominio.' },
            { q: '¿Cuáles son las condiciones de la financiación directa?', a: 'El plan de financiación se pacta directamente con la empresa constructora sin estudio crediticio bancario. Se acuerda una cuota inicial y el saldo restante se distribuye en cuotas mensuales fijas en pesos durante el periodo de entrega convenido.' },
            { q: '¿Qué redes de servicios públicos se entregan en el predio?', a: 'Los proyectos cuentan con redes eléctricas normalizadas y puntos de conexión hídrica en el lindero frontal de cada predio, además de vías de acceso estabilizadas y portería de control de acceso.' },
            { q: '¿Cómo se realiza el protocolo de visita a terreno?', a: 'Las visitas se programan de manera personalizada de martes a domingo. Tras enviar el formulario o escribir a la línea oficial, un asesor de proyectos coordinará el punto de encuentro y le guiará en el recorrido técnico del terreno.' }
        ]
    };

    const DEFAULT_GLOBAL_UI = {
        navMenu: 'MENU',
        navInicio: 'INICIO',
        navPortafolio: 'PORTAFOLIO',
        navInventario: 'INVENTARIO',
        navCriterios: 'CRITERIOS TÉCNICOS',
        navVideo: 'INSPECCIÓN CINEMATOGRÁFICA',
        navContacto: 'CONTACTO',
        floatingCtaText: 'ASESORÍA PRIVADA',
        drawerHeaderTag: 'NAVEGACIÓN GENERAL',
        footerNavTitle: 'EXPLORACIÓN',
        footerLegalTitle: 'MARCO JURÍDICO',
        footerCopyrightYear: '2026',
        footerCopyrightSuffix: 'DESARROLLOS. TODOS LOS DERECHOS RESERVADOS.'
    };

    const DEFAULT_FOOTER = {
        manifesto: 'Compañía estructuradora de parcelaciones campestres de alto valor patrimonial en Colombia. Urbanismo de baja densidad y preservación del entorno natural.',
        legalCopy: 'Proyectos desarrollados en estricto cumplimiento de la Ley 388 de 1997, normas de ordenamiento territorial ambiental (CAR) y decretos reglamentarios de parcelación rural.'
    };

    const DEFAULT_CONFIG = {
        brandName: 'TERRANOVA',
        brandSubtitle: 'PARCELACIONES & INVESTMENTS',
        brandLogo: 'assets/images/logo-garzon.svg',
        whatsappNumber: '573208103010',
        whatsapp: '573208103010',
        contactEmail: 'contacto@inmobiliariacampestre.co',
        officeAddress: 'Cundinamarca, Colombia',
        heroEyebrow: 'DESARROLLOS RURALES DE ALTA GAMA • CUNDINAMARCA',
        heroTitle: 'PATRIMONIO EN TIERRA FIRME',
        heroSubtitle: 'Parcelaciones campestres con vocación de descanso, privacidad absoluta y blindaje jurídico notarial independiente.',
        heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80',
        heroVideoUrl: '',
        activeTheme: 'marfil-clasico',
        customThemes: {
            'custom-1': { name: 'Reserva Bosque', bg: '#F4F6F3', surface: '#FFFFFF', subtle: '#EBF0EB', dock: 'rgba(244, 246, 243, 0.92)', text: '#17211B', muted: '#55635A', accent: '#3A6B4C', border: 'rgba(23, 33, 27, 0.1)' },
            'custom-2': { name: 'Piedra Andina', bg: '#F5F2ED', surface: '#FCFBF8', subtle: '#ECE7DE', dock: 'rgba(245, 242, 237, 0.92)', text: '#1F1B18', muted: '#665E57', accent: '#9A6B42', border: 'rgba(31, 27, 24, 0.1)' }
        },
        typologies: DEFAULT_TYPOLOGIES,
        homeSections: DEFAULT_HOME_SECTIONS,
        pageHeaders: DEFAULT_PAGE_HEADERS,
        projectPage: DEFAULT_PROJECT_PAGE,
        contactPage: DEFAULT_CONTACT_PAGE,
        globalUi: DEFAULT_GLOBAL_UI,
        footer: DEFAULT_FOOTER,
        featuredVideo: {
            title: 'Topografía y Entorno en Alta Definición',
            subtitle: 'Recorrido visual completo del paisaje, avance de obras civiles, accesos viales y delimitación de predios.',
            youtubeUrl: 'https://www.youtube.com/watch?v=gU5AYz8x0YU'
        },
        customSections: [],
        pixels: { metaPixelId: '', tiktokPixelId: '' }
    };

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function normalizeTypologies(rawList) {
        if (!Array.isArray(rawList) || !rawList.length) return DEFAULT_TYPOLOGIES.map((t) => ({ ...t }));
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
        if (!override || typeof override !== 'object') return JSON.parse(JSON.stringify(base));
        const merged = Object.assign({}, base, override);
        const wa = override.whatsappNumber || override.whatsapp || base.whatsappNumber;
        merged.whatsappNumber = wa;
        merged.whatsapp = wa;
        merged.brandLogo = override.brandLogo || base.brandLogo;
        merged.customThemes = Object.assign({}, base.customThemes, override.customThemes || {});
        merged.featuredVideo = Object.assign({}, base.featuredVideo, override.featuredVideo || {});
        merged.pixels = Object.assign({}, base.pixels, override.pixels || {});
        merged.typologies = normalizeTypologies(override.typologies);

        const hs = override.homeSections && typeof override.homeSections === 'object' ? override.homeSections : {};
        merged.homeSections = Object.assign({}, base.homeSections, hs, {
            criteriaItems: Array.isArray(hs.criteriaItems) ? hs.criteriaItems : base.homeSections.criteriaItems.map((i) => ({ ...i })),
            processSteps: Array.isArray(hs.processSteps) ? hs.processSteps : base.homeSections.processSteps.map((i) => ({ ...i }))
        });

        merged.pageHeaders = Object.assign({}, base.pageHeaders, override.pageHeaders || {});
        merged.projectPage = Object.assign({}, base.projectPage, override.projectPage || {});
        merged.globalUi = Object.assign({}, base.globalUi, override.globalUi || {});

        const cp = override.contactPage && typeof override.contactPage === 'object' ? override.contactPage : {};
        merged.contactPage = Object.assign({}, base.contactPage, cp, {
            perks: Array.isArray(cp.perks) ? cp.perks : base.contactPage.perks.slice(),
            faqs: Array.isArray(cp.faqs) ? cp.faqs : base.contactPage.faqs.map((f) => ({ ...f }))
        });

        merged.footer = Object.assign({}, base.footer, override.footer || {});
        merged.customSections = Array.isArray(override.customSections) ? override.customSections : [];
        return merged;
    }

    function getSiteConfig() {
        if (window.TERRANOVA_PRODUCTION_BUNDLE && window.TERRANOVA_PRODUCTION_BUNDLE.config) {
            return mergeConfig(DEFAULT_CONFIG, window.TERRANOVA_PRODUCTION_BUNDLE.config);
        }
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) return mergeConfig(DEFAULT_CONFIG, JSON.parse(raw));
        } catch (err) { /* noop */ }
        return mergeConfig(DEFAULT_CONFIG, null);
    }

    function saveSiteConfig(nextConfig) {
        const clean = mergeConfig(DEFAULT_CONFIG, nextConfig);
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean)); } catch (err) { /* noop */ }
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

    function applyBrandLogo(cfg) {
        const logoSrc = cfg.brandLogo || DEFAULT_CONFIG.brandLogo;
        if (!logoSrc) return;
        document.querySelectorAll('.header-block-center .brand-monogram-link').forEach((link) => {
            const existingImg = link.querySelector('img');
            if (existingImg) {
                existingImg.src = logoSrc;
                existingImg.alt = cfg.brandName || 'Logo';
                return;
            }
            const svg = link.querySelector('.brand-compass-svg');
            if (svg) {
                const img = document.createElement('img');
                img.src = logoSrc;
                img.alt = cfg.brandName || 'Logo';
                img.width = 84;
                img.height = 25;
                img.style.cssText = 'width:84px;height:25px;object-fit:contain;margin-bottom:4px;display:block;';
                svg.replaceWith(img);
            }
        });
    }

    function bindTextMap(map) {
        Object.keys(map).forEach((key) => {
            document.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => {
                if (map[key] !== undefined && map[key] !== null) {
                    el.textContent = map[key];
                }
            });
        });
    }

    function applyDynamicLists(cfg) {
        const hs = cfg.homeSections || DEFAULT_HOME_SECTIONS;
        const criteriaGrid = document.getElementById('homeCriteriaGrid');
        if (criteriaGrid) {
            criteriaGrid.innerHTML = (hs.criteriaItems || []).map((item, idx) => `
              <article class="criterion-luxury-card">
                <span class="criterion-counter">${String(idx + 1).padStart(2, '0')}</span>
                <h3 class="criterion-title">${escapeHtml(item.title)}</h3>
                <p class="criterion-body">${escapeHtml(item.body)}</p>
              </article>
            `).join('');
        }

        const processGrid = document.getElementById('homeProcessGrid');
        if (processGrid) {
            processGrid.innerHTML = (hs.processSteps || []).map((step, idx) => `
              <div class="protocol-step-box">
                <span class="step-large-num">${String(idx + 1).padStart(2, '0')}</span>
                <h4 class="step-title">${escapeHtml(step.title)}</h4>
                <p class="step-text">${escapeHtml(step.body)}</p>
              </div>
            `).join('');
        }

        const cp = cfg.contactPage || DEFAULT_CONTACT_PAGE;
        const perksEl = document.getElementById('contactPerksList');
        if (perksEl) {
            perksEl.innerHTML = (cp.perks || []).map((item) => `
              <div class="perk-row">
                <span class="perk-bullet">✦</span>
                <span class="perk-desc">${escapeHtml(item)}</span>
              </div>
            `).join('');
        }

        const faqEl = document.getElementById('contactFaqList');
        if (faqEl) {
            faqEl.innerHTML = (cp.faqs || []).map((item) => `
              <details class="faq-quiet-item">
                <summary class="faq-quiet-header">
                  <span class="faq-question-label">${escapeHtml(item.q)}</span>
                  <span class="faq-toggle-cross" aria-hidden="true">+</span>
                </summary>
                <div class="faq-quiet-body">
                  <p>${escapeHtml(item.a)}</p>
                </div>
              </details>
            `).join('');
        }
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

        if (cfg.brandName) {
            if (!document.documentElement.dataset.titleTpl) {
                document.documentElement.dataset.titleTpl = document.title;
            }
            const tpl = document.documentElement.dataset.titleTpl;
            document.title = /TERRANOVA/i.test(tpl)
                ? tpl.replace(/TERRANOVA/gi, cfg.brandName)
                : `${cfg.brandName} | ${tpl}`;
        }

        applyBrandLogo(cfg);

        const hs = cfg.homeSections || DEFAULT_HOME_SECTIONS;
        const ph = cfg.pageHeaders || DEFAULT_PAGE_HEADERS;
        const pp = cfg.projectPage || DEFAULT_PROJECT_PAGE;
        const cp = cfg.contactPage || DEFAULT_CONTACT_PAGE;
        const gu = cfg.globalUi || DEFAULT_GLOBAL_UI;
        const ft = cfg.footer || DEFAULT_FOOTER;
        const fv = cfg.featuredVideo || DEFAULT_CONFIG.featuredVideo;

        bindTextMap({
            brandName: cfg.brandName,
            brandSubtitle: cfg.brandSubtitle,
            officeAddress: cfg.officeAddress,
            heroKicker: cfg.heroEyebrow,
            heroHeadline: cfg.heroTitle,
            heroDescription: cfg.heroSubtitle,
            homeHeroPillVideo: hs.heroPillVideo,
            homeHeroPauseBtn: hs.heroPauseBtn,
            homeHeroScrollWordmark: hs.heroScrollWordmark,
            homePortfolioTag: hs.portfolioTag,
            homePortfolioTitle: hs.portfolioTitle,
            homePortfolioSubtitle: hs.portfolioSubtitle,
            homePortfolioBtn: hs.portfolioBtnText,
            homeCriteriaTag: hs.criteriaTag,
            homeCriteriaTitle: hs.criteriaTitle,
            homeCriteriaSubtitle: hs.criteriaSubtitle,
            homeVideoTag: hs.videoTag,
            homeVideoCaptionTag: hs.videoCaptionTag,
            homeVideoCaptionLead: hs.videoCaptionLead,
            featuredVideoTitle: fv.title,
            featuredVideoSubtitle: fv.subtitle,
            homeProcessTag: hs.processTag,
            homeProcessTitle: hs.processTitle,
            homeProcessSubtitle: hs.processSubtitle,
            homeClosingTag: hs.closingTag,
            homeClosingTitle: hs.closingTitle,
            homeClosingSubtitle: hs.closingSubtitle,
            homeClosingPrimaryBtn: hs.closingPrimaryBtn,
            homeClosingSecondaryBtn: hs.closingSecondaryBtn,
            portfolioKicker: ph.portfolioKicker,
            portfolioTitle: ph.portfolioTitle,
            portfolioSubtitle: ph.portfolioSubtitle,
            portfolioListTag: ph.portfolioListTag,
            portfolioListTitle: ph.portfolioListTitle,
            portfolioListSubtitle: ph.portfolioListSubtitle,
            portfolioClosingTag: ph.portfolioClosingTag,
            portfolioClosingTitle: ph.portfolioClosingTitle,
            portfolioClosingSubtitle: ph.portfolioClosingSubtitle,
            inventoryKicker: ph.inventoryKicker,
            inventoryTitle: ph.inventoryTitle,
            inventorySubtitle: ph.inventorySubtitle,
            inventoryListTag: ph.inventoryListTag,
            inventoryListTitle: ph.inventoryListTitle,
            inventoryListSubtitle: ph.inventoryListSubtitle,
            contactKicker: ph.contactKicker,
            contactTitle: ph.contactTitle,
            contactSubtitle: ph.contactSubtitle,
            projHeroPillOverview: pp.heroPillOverview,
            projHeroPillUrbanism: pp.heroPillUrbanism,
            projHeroPillUnits: pp.heroPillUnits,
            projHeroPillVisit: pp.heroPillVisit,
            projBackPortfolioBtn: pp.backPortfolioBtn,
            projScrollUnitsBtn: pp.scrollUnitsBtn,
            projUnitsBadgeLabel: pp.unitsBadgeLabel,
            projSpecLocationLabel: pp.specLocationLabel,
            projSpecAreasLabel: pp.specAreasLabel,
            projSpecPriceLabel: pp.specPriceLabel,
            projAmenitiesTag: pp.amenitiesTag,
            projAmenitiesTitle: pp.amenitiesTitle,
            projVideoTag: pp.videoTag,
            projVideoTitle: pp.videoTitle,
            projVideoSubtitle: pp.videoSubtitle,
            projVideoCaptionTag: pp.videoCaptionTag,
            projVideoCaptionLead: pp.videoCaptionLead,
            projGalleryTag: pp.galleryTag,
            projGalleryTitle: pp.galleryTitle,
            projGallerySubtitle: pp.gallerySubtitle,
            projBlueprintTag: pp.blueprintTag,
            projBlueprintTitle: pp.blueprintTitle,
            projBlueprintSubtitle: pp.blueprintSubtitle,
            projBlueprintHint: pp.blueprintHint,
            projWhatsappBtn: pp.whatsappBtnText,
            projLegendAvailable: pp.legendAvailable,
            projLegendReserved: pp.legendReserved,
            projLegendSold: pp.legendSold,
            projColUnit: pp.colUnit,
            projColArea: pp.colArea,
            projColPrice: pp.colPrice,
            projColStatus: pp.colStatus,
            projColFmi: pp.colFmi,
            projColAction: pp.colAction,
            contactIntroTag: cp.introTag,
            contactIntroTitle: cp.introTitle,
            contactIntroText: cp.introText,
            contactSubmitBtn: cp.submitBtnText,
            contactDisclaimer: cp.formDisclaimer,
            contactFaqTag: cp.faqTag,
            contactFaqTitle: cp.faqTitle,
            navMenu: gu.navMenu,
            navInicio: gu.navInicio,
            navPortafolio: gu.navPortafolio,
            navInventario: gu.navInventario,
            navCriterios: gu.navCriterios,
            navVideo: gu.navVideo,
            navContacto: gu.navContacto,
            floatingCtaText: gu.floatingCtaText,
            drawerHeaderTag: gu.drawerHeaderTag,
            footerNavTitle: gu.footerNavTitle,
            footerLegalTitle: gu.footerLegalTitle,
            footerCopyrightYear: gu.footerCopyrightYear,
            footerCopyrightSuffix: gu.footerCopyrightSuffix,
            footerManifesto: ft.manifesto,
            footerLegal: ft.legalCopy
        });

        applyDynamicLists(cfg);

        const heroImg = document.getElementById('heroMediaElement');
        if (heroImg && heroImg.tagName === 'IMG' && cfg.heroImage) heroImg.src = cfg.heroImage;
        const pImg = document.getElementById('portfolioHeroImg');
        if (pImg && ph.portfolioHeroImage) pImg.src = ph.portfolioHeroImage;
        const iImg = document.getElementById('inventoryHeroImg');
        if (iImg && ph.inventoryHeroImage) iImg.src = ph.inventoryHeroImage;
        const cImg = document.getElementById('contactHeroImg');
        if (cImg && ph.contactHeroImage) cImg.src = ph.contactHeroImage;

        document.querySelectorAll('[data-contact-email]').forEach((el) => {
            el.textContent = cfg.contactEmail || '';
            if (el.tagName === 'A') el.href = `mailto:${cfg.contactEmail || ''}`;
        });
        document.querySelectorAll('[data-office-address]').forEach((el) => { el.textContent = cfg.officeAddress || ''; });
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
        if (proto === 'file:' || host.endsWith('.github.io')) return;

        try {
            const res = await fetch('api/data.php?resource=public', {
                method: 'GET', credentials: 'same-origin',
                headers: { 'Accept': 'application/json' }, cache: 'no-store'
            });
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok || !contentType.includes('application/json')) return;
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
            if (updated) window.dispatchEvent(new CustomEvent('terranova:data-synced', { detail: payload }));
        } catch (err) { /* noop */ }
    }

    window.TERRANOVA_FIXED_THEMES = FIXED_THEMES;
    window.TERRANOVA_DEFAULT_CONFIG = DEFAULT_CONFIG;
    window.getSiteConfig = getSiteConfig;
    window.saveSiteConfig = saveSiteConfig;
    window.applySiteConfig = applySiteConfig;
    window.TERRANOVA_CONFIG = {
        get: getSiteConfig, save: saveSiteConfig, apply: applySiteConfig,
        getFeaturedVideoUrl: () => (getSiteConfig().featuredVideo || {}).youtubeUrl || DEFAULT_CONFIG.featuredVideo.youtubeUrl
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { applySiteConfig(); syncFromServer(); });
    } else {
        applySiteConfig();
        syncFromServer();
    }
})(window, document);