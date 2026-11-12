/**
 * ========================================================================
 * TERRANOVA DESARROLLOS INMOBILIARIOS
 * ARCHIVO: js/data-projects.js
 * PROPÓSITO: Motor multipágina, Galería (máx. 5) y Pines Circulares en Plano
 * DIRECTIVAS: D1 (Cero código), D2 (Fotos/Videos 16:9), D6 (<1.000 líneas), D7 (Modelo real)
 * ========================================================================
 */

(function (global) {
  'use strict';

  const PROJECTS_STORAGE_KEY = 'TERRANOVA_PROJECTS_DATA';
  const CATALOG_VERSION_KEY = 'TERRANOVA_CATALOG_VERSION';
  const CURRENT_CATALOG_VERSION = '2026-arrayan-v1';
  const FALLBACK_AERIAL_VIDEO = 'https://www.youtube.com/watch?v=gU5AYz8x0YU';

  /**
   * 1. CATÁLOGO MODELO DE LOS 5 PROYECTOS CAMPESTRES (Directiva 7)
   * Proyecto 1 cargado con datos reales de "Proyecto Mirador del Arrayán" (14 lotes)
   */
  const DEFAULT_PROJECTS = [
    {
      id: 'proj-01',
      slug: 'mirador-del-arrayan',
      nombre: 'Proyecto Mirador del Arrayán',
      tipologia: 'Lotes Campestres',
      categoriaFiltro: 'lote',
      municipio: 'San Francisco, Cundinamarca',
      distanciaBogota: 'Vereda Arrayán • A 7 min del casco urbano',
      rangoAreas: '1.015 m² a 2.208 m²',
      precioDesdeCOP: 101500000,
      precioDesdeFormato: '$ 101.500.000 COP ($100.000/m²)',
      financiacionDirecta: 'Lotes urbanizados a $100.000 COP/m² con facilidades de pago directo sin intermediación bancaria.',
      estadoNotarialGeneral: 'Licencia de Construcción Res. 225 • Alcaldía Municipal de San Francisco de Sales',
      descripcionEditorial: 'Proyecto campestre exclusivo con lotes urbanizados, rodeados de naturaleza y con excelente accesibilidad. Un espacio ideal para construir, invertir y disfrutar la tranquilidad del campo con proyección de valorización.',
      fotoPrincipal16_9: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1280&h=720&q=80',
      fotoAlt: 'Panorámica del Proyecto Mirador del Arrayán en San Francisco',
      videoUrl: 'https://www.youtube.com/watch?v=gU5AYz8x0YU',
      planoUrl: 'assets/images/plano-proj-01.jpeg',
      galeria: [
        { url: 'assets/images/permiso-proj-01.jpeg', caption: 'Licencia Oficial de Construcción — Res. 225 (Alcaldía San Francisco de Sales)' },
        { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1280&h=720&q=80', caption: 'Topografía y vistas panorámicas Vereda Arrayán' },
        { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1280&h=720&q=80', caption: 'Entorno natural y corredores verdes del proyecto' }
      ],
      visible: true,
      destacado: true,
      serviciosPublicos: [
        'Excelentes vías de acceso desde el casco urbano de San Francisco (7 min)',
        'Licencia de construcción vigente (Res. 225 - Vigencia 36 meses)',
        'Vía interna vehicular y urbanismo campestre delimitado',
        'Topografía seleccionada con vistas abiertas hacia la montaña'
      ],
      unidadesInventario: [
        { codigo: 'Lote 01', num: '1', area: '2.208 m²', precioCOP: 220800000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-01', cx: 73, cy: 19 },
        { codigo: 'Lote 02', num: '2', area: '1.504 m²', precioCOP: 150400000, estado: 'Vendido', matricula: 'FMI-Vereda-Arrayan-02', cx: 51, cy: 20 },
        { codigo: 'Lote 03', num: '3', area: '1.597 m²', precioCOP: 159700000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-03', cx: 29, cy: 20 },
        { codigo: 'Lote 04', num: '4', area: '1.643 m²', precioCOP: 164300000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-04', cx: 71, cy: 38 },
        { codigo: 'Lote 05', num: '5', area: '1.021 m²', precioCOP: 102100000, estado: 'Reservado', matricula: 'FMI-Vereda-Arrayan-05', cx: 48, cy: 38 },
        { codigo: 'Lote 06', num: '6', area: '1.015 m²', precioCOP: 101500000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-06', cx: 25, cy: 38 },
        { codigo: 'Lote 07', num: '7', area: '1.188 m²', precioCOP: 118800000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-07', cx: 47, cy: 52 },
        { codigo: 'Lote 08', num: '8', area: '1.218 m²', precioCOP: 121800000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-08', cx: 18, cy: 52 },
        { codigo: 'Lote 09', num: '9', area: '1.188 m²', precioCOP: 118800000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-09', cx: 40, cy: 67 },
        { codigo: 'Lote 10', num: '10', area: '1.218 m²', precioCOP: 121800000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-10', cx: 16, cy: 66 },
        { codigo: 'Lote 11', num: '11', area: '1.218 m²', precioCOP: 121800000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-11', cx: 21, cy: 79 },
        { codigo: 'Lote 12', num: '12', area: '1.102 m²', precioCOP: 110200000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-12', cx: 62, cy: 80 },
        { codigo: 'Lote 13', num: '13', area: '1.102 m²', precioCOP: 110200000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-13', cx: 65, cy: 70 },
        { codigo: 'Lote 14', num: '14', area: '1.102 m²', precioCOP: 110200000, estado: 'Disponible', matricula: 'FMI-Vereda-Arrayan-14', cx: 74, cy: 57 }
      ]
    },
    {
      id: 'proj-02',
      slug: 'altos-del-valle',
      nombre: 'Altos del Valle Parcelación',
      tipologia: 'Lotes Campestres',
      categoriaFiltro: 'lote',
      municipio: 'Sopó, Cundinamarca',
      distanciaBogota: '35 min desde Autopista Norte',
      rangoAreas: '2.000 m² a 4.200 m²',
      precioDesdeCOP: 450000000,
      precioDesdeFormato: '$ 450.000.000 COP',
      financiacionDirecta: 'Separación con 10%, 40% durante obra de urbanismo y 50% a la firma de escritura pública.',
      estadoNotarialGeneral: 'Tradición Notarial al Día • Escrituración Individual Inmediata',
      descripcionEditorial: 'Parcelas campestres con vocación ecuestre y paisajística en la meseta más apetecida de Sopó. Urbanismo sobrio con setos vivos y senderos privados.',
      fotoPrincipal16_9: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&h=720&q=80',
      fotoAlt: 'Vista panorámica de meseta y accesos viales en Altos del Valle',
      videoUrl: 'https://www.youtube.com/watch?v=EOYNmEsvHYw',
      planoUrl: '',
      galeria: [],
      visible: true,
      destacado: false,
      serviciosPublicos: [
        'Red eléctrica normalizada con transformador propio',
        'Acueducto veredal con tanque de reserva de 50.000 L',
        'Vías internas estabilizadas con iluminación solar',
        'Senderos peatonales y ecuestres perimetrales'
      ],
      unidadesInventario: [
        { codigo: 'Lote 02', area: '2.050 m²', precioCOP: 450000000, estado: 'Disponible', matricula: 'FMI-50N-1983001' },
        { codigo: 'Lote 05', area: '2.400 m²', precioCOP: 520000000, estado: 'Disponible', matricula: 'FMI-50N-1983004' },
        { codigo: 'Lote 09', area: '4.100 m²', precioCOP: 830000000, estado: 'Disponible', matricula: 'FMI-50N-1983008' }
      ]
    },
    {
      id: 'proj-03',
      slug: 'hacienda-las-palmas',
      nombre: 'Hacienda Las Palmas',
      tipologia: 'Lotes Campestres',
      categoriaFiltro: 'lote',
      municipio: 'Tabio, Cundinamarca',
      distanciaBogota: '40 min desde Chía / Calle 80',
      rangoAreas: '1.500 m² a 2.500 m²',
      precioDesdeCOP: 285000000,
      precioDesdeFormato: '$ 285.000.000 COP',
      financiacionDirecta: 'Financiación directa hasta 24 cuotas fijas mensuales en pesos colombianos.',
      estadoNotarialGeneral: 'Desenglobe Radicado • Tradición Matriz Mayor de 20 Años',
      descripcionEditorial: 'Quintas de descanso con topografía 100% plana en el corazón del valle de Tabio. Ideales para huertas orgánicas familiares y arquitectura bioclimática.',
      fotoPrincipal16_9: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1280&h=720&q=80',
      fotoAlt: 'Planicie campestre fértil en Hacienda Las Palmas',
      videoUrl: 'https://www.youtube.com/watch?v=H7zHICiwoa4',
      planoUrl: '',
      galeria: [],
      visible: true,
      destacado: false,
      serviciosPublicos: [
        'Postería perimetral instalada y acometida en lindero',
        'Disponibilidad de agua de riego y potable',
        'Vía de acceso en placa-huella y recebo compactado',
        'Cerramiento frontal uniforme en madera inmunizada'
      ],
      unidadesInventario: [
        { codigo: 'Quinta 01', area: '1.500 m²', precioCOP: 285000000, estado: 'Disponible', matricula: 'FMI-50N-334101' },
        { codigo: 'Quinta 04', area: '1.800 m²', precioCOP: 335000000, estado: 'Reservado', matricula: 'FMI-50N-334104' },
        { codigo: 'Quinta 08', area: '2.500 m²', precioCOP: 440000000, estado: 'Disponible', matricula: 'FMI-50N-334108' }
      ]
    },
    {
      id: 'proj-04',
      slug: 'villas-del-country',
      nombre: 'Villas del Country Club',
      tipologia: 'Casas Campestres',
      categoriaFiltro: 'casa',
      municipio: 'La Calera, Cundinamarca',
      distanciaBogota: '25 min desde Calle 85',
      rangoAreas: '240 m² a 380 m² construidos',
      precioDesdeCOP: 980000000,
      precioDesdeFormato: '$ 980.000.000 COP',
      financiacionDirecta: 'Plan de pagos vinculado a hitos constructivos certificados por interventoría técnica.',
      estadoNotarialGeneral: 'Propiedad Horizontal Aprobada • Minuta y FMI Individual',
      descripcionEditorial: 'Residencias campestres de arquitectura contemporánea en madera teca, piedra pizarra y ventanales piso a techo con aislamiento térmico.',
      fotoPrincipal16_9: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&h=720&q=80',
      fotoAlt: 'Fachada contemporánea en piedra y cristal en Villas del Country',
      videoUrl: 'https://www.youtube.com/watch?v=QLHjG0TJUQc',
      planoUrl: '',
      galeria: [],
      visible: true,
      destacado: false,
      serviciosPublicos: [
        'Gas natural por red domiciliaria',
        'Planta de tratamiento de aguas residuales (PTAR)',
        'Fibra óptica dedicada para teletrabajo',
        'Club House privado con zona húmeda y caballerizas'
      ],
      unidadesInventario: [
        { codigo: 'Villa Roble A', area: '245 m² / Lote 1.600 m²', precioCOP: 980000000, estado: 'Disponible', matricula: 'FMI-50N-776201' },
        { codigo: 'Villa Nogal B', area: '310 m² / Lote 1.850 m²', precioCOP: 1250000000, estado: 'Disponible', matricula: 'FMI-50N-776202' },
        { codigo: 'Villa Cedro', area: '380 m² / Lote 2.200 m²', precioCOP: 1580000000, estado: 'Reservado', matricula: 'FMI-50N-776203' }
      ]
    },
    {
      id: 'proj-05',
      slug: 'torre-andina',
      nombre: 'Torre Andina Mountain Lodges',
      tipologia: 'Apartamentos de Montaña',
      categoriaFiltro: 'apartamento',
      municipio: 'Guasca, Cundinamarca',
      distanciaBogota: '50 min desde Calle 72',
      rangoAreas: '85 m² a 160 m²',
      precioDesdeCOP: 410000000,
      precioDesdeFormato: '$ 410.000.000 COP',
      financiacionDirecta: 'Encargo fiduciario vinculado • Cuota inicial diferida durante etapa de acabados.',
      estadoNotarialGeneral: 'Reglamento Registrado • Escrituración Inmediata',
      descripcionEditorial: 'Refugio andino de montaña concebido para estancias de descanso y renta corta. Módulos en madera laminada certificada con chimenea y terraza privada.',
      fotoPrincipal16_9: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1280&h=720&q=80',
      fotoAlt: 'Suites contemporáneas de montaña en Guasca',
      videoUrl: 'https://www.youtube.com/watch?v=gU5AYz8x0YU',
      planoUrl: '',
      galeria: [],
      visible: true,
      destacado: false,
      serviciosPublicos: [
        'Calefacción pasiva y paneles solares complementarios',
        'Planta de tratamiento de agua potable certificada',
        'Servicio de conserjería y operación hotelera',
        'Senderos ecológicos hacia reserva de alta montaña'
      ],
      unidadesInventario: [
        { codigo: 'Suite 102', area: '85 m²', precioCOP: 410000000, estado: 'Disponible', matricula: 'FMI-50N-998102' },
        { codigo: 'Duplex 204', area: '120 m²', precioCOP: 560000000, estado: 'Disponible', matricula: 'FMI-50N-998204' },
        { codigo: 'Penthouse 301', area: '160 m²', precioCOP: 720000000, estado: 'Disponible', matricula: 'FMI-50N-998301' }
      ]
    }
  ];

  /**
   * Migra automáticamente pruebas viejas (ej. Lote 16) al catálogo real de Mirador del Arrayán
   */
  function ensureCatalogVersion() {
    try {
      const savedVer = localStorage.getItem(CATALOG_VERSION_KEY);
      if (savedVer !== CURRENT_CATALOG_VERSION) {
        localStorage.removeItem(PROJECTS_STORAGE_KEY);
        localStorage.setItem(CATALOG_VERSION_KEY, CURRENT_CATALOG_VERSION);
      }
    } catch (e) { /* Ignorar si storage está restringido */ }
  }

  function getProjects() {
    ensureCatalogVersion();
    try {
      const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!raw) return DEFAULT_PROJECTS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROJECTS;
    } catch (err) {
      return DEFAULT_PROJECTS;
    }
  }

  function getVisibleProjects() {
    return getProjects().slice(0, 5).filter((p) => p.visible !== false);
  }

  function getActiveTypologies() {
    if (global.TERRANOVA_CONFIG && typeof global.TERRANOVA_CONFIG.get === 'function') {
      const cfg = global.TERRANOVA_CONFIG.get();
      if (Array.isArray(cfg.typologies) && cfg.typologies.length > 0) {
        return cfg.typologies.slice(0, 5);
      }
    }
    return [
      { id: 'lote', label: 'Lotes Campestres' },
      { id: 'casa', label: 'Casas Campestres' },
      { id: 'apartamento', label: 'Apartamentos de Montaña' }
    ];
  }

  function getActiveWhatsApp() {
    if (global.TERRANOVA_CONFIG && typeof global.TERRANOVA_CONFIG.get === 'function') {
      const cfg = global.TERRANOVA_CONFIG.get();
      if (cfg.whatsapp && cfg.whatsapp !== '573100000000') {
        return String(cfg.whatsapp).replace(/[^0-9]/g, '');
      }
    }
    return '573208103010';
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function buildWhatsAppUrl(message) {
    return `https://wa.me/${getActiveWhatsApp()}?text=${encodeURIComponent(message)}`;
  }

  function getUnitStatusBadgeHtml(estado) {
    if (estado === 'Disponible') {
      return `<span class="badge-status-dot dot-active"></span>Disponible`;
    }
    if (estado === 'Vendido') {
      return `<span class="badge-status-dot" style="background-color: #A62B2B;"></span>Vendido`;
    }
    return `<span class="badge-status-dot dot-reserved"></span>${escapeHtml(estado || 'Reservado')}`;
  }

  function extractShortNumber(codigo, idx) {
    const m = String(codigo || '').match(/\d+/);
    return m ? String(parseInt(m[0], 10)) : String(idx + 1);
  }

  function openLightboxPhoto(url, caption) {
    const existing = document.getElementById('galleryLightboxModal');
    if (existing) existing.remove();

    const html = `
      <div class="terranova-quiet-modal-backdrop" id="galleryLightboxModal" role="dialog" aria-modal="true">
        <div class="quiet-modal-card" style="max-width: 960px;">
          <div class="modal-card-header">
            <div>
              <span class="modal-pre-title">SOPORTE VISUAL</span>
              <h2 class="modal-serif-title" style="font-size: 1.25rem;">${escapeHtml(caption || 'Registro del Proyecto')}</h2>
            </div>
            <button type="button" class="btn-close-modal" id="btnCloseLightbox" aria-label="Cerrar imagen">✕</button>
          </div>
          <div class="modal-card-body" style="padding: 16px; background-color: #111111;">
            <img src="${escapeHtml(url)}" alt="${escapeHtml(caption)}" style="width: 100%; max-height: 75vh; object-fit: contain; margin: 0 auto;">
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = document.getElementById('galleryLightboxModal');
    document.getElementById('btnCloseLightbox').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  function syncFeaturedVideoFacade() {
    if (document.body.getAttribute('data-page')) return;
    const visible = getVisibleProjects();
    const featured = visible.find((p) => p.destacado) || visible[0];
    if (!featured) return;

    const facade = document.getElementById('videoFacade');
    if (!facade) return;

    const img = facade.querySelector('.cinema-facade-img');
    const tag = facade.querySelector('.caption-tag');
    const lead = facade.querySelector('.caption-lead');

    if (img && featured.fotoPrincipal16_9) img.src = featured.fotoPrincipal16_9;
    if (tag) tag.textContent = `PROYECTO DESTACADO • ${featured.municipio.toUpperCase()}`;
    if (lead) lead.textContent = `${featured.nombre} — Recorrido aéreo y linderos`;
  }

  function renderCatalog(filterType) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    const activeFilter = filterType || 'todos';
    const visibleProjects = getVisibleProjects();
    const filtered = activeFilter === 'todos'
      ? visibleProjects
      : visibleProjects.filter((p) => (p.categoriaFiltro || '').toLowerCase() === activeFilter.toLowerCase());

    const badgeNum = document.querySelector('.header-summary-badge .badge-number');
    if (badgeNum) {
      badgeNum.textContent = String(filtered.length).padStart(2, '0');
    }

    if (filtered.length === 0) {
      container.innerHTML = `<p class="noscript-alert">No hay proyectos visibles registrados bajo esta tipología.</p>`;
      return;
    }

    container.innerHTML = filtered.map((proj, index) => {
      const numLabel = String(index + 1).padStart(2, '0');
      const units = Array.isArray(proj.unidadesInventario) ? proj.unidadesInventario : [];
      const availableCount = units.filter((u) => u.estado === 'Disponible').length;
      const projectUrl = `proyecto.html?id=${encodeURIComponent(proj.id)}`;
      const inventoryUrl = `inventario.html?project=${encodeURIComponent(proj.id)}`;

      return `
        <article class="project-editorial-card" data-project-id="${escapeHtml(proj.id)}">
          <a href="${projectUrl}" class="project-card-visual-chassis" aria-label="Explorar ${escapeHtml(proj.nombre)}">
            <div class="project-aspect-ratio-16-9">
              <img src="${escapeHtml(proj.fotoPrincipal16_9)}"
                   alt="${escapeHtml(proj.fotoAlt || proj.nombre)}"
                   class="project-card-cover-photo"
                   loading="lazy">
              <div class="project-visual-shade" aria-hidden="true"></div>
              <div class="project-top-badges">
                <span class="badge-index-tech">${numLabel}.</span>
                <span class="badge-typology-quiet">${escapeHtml(proj.tipologia)}</span>
              </div>
            </div>
          </a>

          <div class="project-card-data-body">
            <div class="project-header-group">
              <span class="project-location-meta">${escapeHtml(proj.municipio)} • ${escapeHtml(proj.distanciaBogota || 'Cundinamarca')}</span>
              <h3 class="project-serif-name">
                <a href="${projectUrl}">${escapeHtml(proj.nombre)}</a>
              </h3>
              <p class="project-brief-narrative">${escapeHtml(proj.descripcionEditorial)}</p>
            </div>

            <div class="project-specs-quiet-row">
              <div class="spec-quiet-item">
                <span class="spec-label-tech">METRAJE</span>
                <span class="spec-val-strong">${escapeHtml(proj.rangoAreas)}</span>
              </div>
              <div class="spec-quiet-item">
                <span class="spec-label-tech">INVERSIÓN DESDE</span>
                <span class="spec-val-strong">${escapeHtml(proj.precioDesdeFormato)}</span>
              </div>
              <div class="spec-quiet-item">
                <span class="spec-label-tech">UNIDADES</span>
                <span class="spec-val-strong">${availableCount} de ${units.length} disponibles</span>
              </div>
            </div>

            <div class="project-notarial-guarantee">
              <span class="guarantee-icon" aria-hidden="true">⚖</span>
              <span class="guarantee-text">${escapeHtml(proj.estadoNotarialGeneral || 'Tradición jurídica independiente')}</span>
            </div>

            <div class="project-actions-footer">
              <a href="${projectUrl}" class="btn-project-dossier">
                <span>VER PROYECTO</span>
                <span class="action-arrow" aria-hidden="true">→</span>
              </a>
              <a href="${inventoryUrl}" class="btn-project-inspect-quick">
                VER ${units.length} UNIDADES
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function initPortfolioFilters() {
    const filterBar = document.getElementById('portfolioFilterBar');
    if (!filterBar) return;

    const visibleCount = getVisibleProjects().length;
    const typos = getActiveTypologies();

    filterBar.innerHTML = `<button type="button" class="pill-action-item is-active" data-filter-type="todos">TODOS (${String(visibleCount).padStart(2, '0')})</button>` +
      typos.map((t) => `<span class="pill-dot-sep">•</span><button type="button" class="pill-action-item" data-filter-type="${escapeHtml(t.id)}">${escapeHtml(t.label.toUpperCase())}</button>`).join('');

    const buttons = filterBar.querySelectorAll('[data-filter-type]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderCatalog(btn.getAttribute('data-filter-type'));
      });
    });
  }

  /**
   * 5. HIDRATADOR DE PÁGINA INDIVIDUAL DE PROYECTO (proyecto.html?id=...)
   */
  function renderProjectDetailPage() {
    if (document.body.getAttribute('data-page') !== 'project-detail') return;

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id');
    const visible = getVisibleProjects();
    const proj = visible.find((p) => p.id === requestedId || p.slug === requestedId) || visible[0];
    if (!proj) return;

    const defaultProj = DEFAULT_PROJECTS.find((d) => d.id === proj.id);
    document.title = `${proj.nombre} | TERRANOVA Desarrollos`;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el && value !== undefined) el.textContent = value;
    };

    const heroImg = document.getElementById('projectHeroImg');
    if (heroImg && proj.fotoPrincipal16_9) {
      heroImg.src = proj.fotoPrincipal16_9;
      heroImg.alt = proj.fotoAlt || proj.nombre;
    }

    const units = Array.isArray(proj.unidadesInventario) ? proj.unidadesInventario : [];

    setText('projectHeroKicker', `${proj.tipologia.toUpperCase()} • ${proj.municipio.toUpperCase()}`);
    setText('projectHeroTitle', proj.nombre);
    setText('projectHeroDesc', proj.descripcionEditorial);
    setText('projectTypologyTag', `01. ${proj.tipologia.toUpperCase()}`);
    setText('projectOverviewTitle', proj.nombre);
    setText('projectOverviewNarrative', proj.descripcionEditorial);
    setText('projectUnitsCount', String(units.length).padStart(2, '0'));
    setText('projectSpecLocation', `${proj.municipio} (${proj.distanciaBogota || 'Cundinamarca'})`);
    setText('projectSpecAreas', proj.rangoAreas);
    setText('projectSpecPrice', proj.precioDesdeFormato);
    setText('projectNotarialText', proj.estadoNotarialGeneral || 'Tradición jurídica independiente');
    setText('projectFinancingText', proj.financiacionDirecta || 'Esquemas flexibles de financiación directa.');

    const videoSection = document.getElementById('projectVideoSection');
    const videoFacadeImg = document.getElementById('projectVideoFacadeImg');
    const videoBtn = document.getElementById('btnTriggerProjectVideo');
    const effectiveVideo = (proj.videoUrl && proj.videoUrl.trim()) || (defaultProj && defaultProj.videoUrl) || FALLBACK_AERIAL_VIDEO;

    if (videoSection && videoBtn) {
      videoSection.style.display = 'block';
      videoBtn.setAttribute('data-video-url', effectiveVideo);
      if (videoFacadeImg && proj.fotoPrincipal16_9) videoFacadeImg.src = proj.fotoPrincipal16_9;
    }

    const gallerySection = document.getElementById('projectGallerySection');
    const galleryGrid = document.getElementById('projectGalleryGrid');
    const galleryItems = (Array.isArray(proj.galeria) && proj.galeria.length > 0)
      ? proj.galeria.slice(0, 5)
      : (defaultProj && Array.isArray(defaultProj.galeria) ? defaultProj.galeria.slice(0, 5) : []);

    if (gallerySection && galleryGrid && galleryItems.length > 0) {
      gallerySection.style.display = 'block';
      galleryGrid.innerHTML = galleryItems.map((item, idx) => `
        <article class="gallery-photo-card" data-gallery-idx="${idx}">
          <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.caption || proj.nombre)}" loading="lazy">
          <div class="gallery-photo-caption">${escapeHtml(item.caption || `Registro 0${idx + 1}`)}</div>
        </article>
      `).join('');

      galleryGrid.querySelectorAll('.gallery-photo-card').forEach((card) => {
        card.addEventListener('click', () => {
          const item = galleryItems[Number(card.getAttribute('data-gallery-idx'))];
          if (item) openLightboxPhoto(item.url, item.caption);
        });
      });
    } else if (gallerySection) {
      gallerySection.style.display = 'none';
    }

    // Plano Topográfico con Círculos Centrados Numerados
    const blueprintCard = document.getElementById('projectBlueprintCard');
    const blueprintStage = document.getElementById('blueprintInteractiveStage');
    const effectivePlano = (proj.planoUrl && proj.planoUrl.trim()) || (defaultProj && defaultProj.planoUrl) || '';

    if (blueprintCard && blueprintStage && effectivePlano) {
      blueprintCard.style.display = 'block';
      const pinsHtml = units.filter((u) => u.cx !== undefined && u.cy !== undefined).map((unit, idx) => {
        const estadoLower = String(unit.estado || 'Disponible').toLowerCase();
        const pinClass = estadoLower === 'vendido'
          ? 'pin-vendido'
          : (estadoLower === 'reservado' ? 'pin-reservado' : 'pin-disponible');
        const priceFmt = `$ ${Number(unit.precioCOP || 0).toLocaleString('es-CO')} COP`;
        const waHref = estadoLower === 'vendido'
          ? 'javascript:void(0);'
          : buildWhatsAppUrl(`Cordial saludo. Me interesa consultar por el *${unit.codigo}* (${unit.area}, ${priceFmt}) en *${proj.nombre}*.`);
        const targetAttr = estadoLower === 'vendido' ? '' : 'target="_blank" rel="noopener noreferrer"';
        const shortNum = unit.num || extractShortNumber(unit.codigo, idx);
        const tooltipText = `${unit.codigo} • ${unit.area} • ${unit.estado}`;

        return `
          <a href="${waHref}" ${targetAttr}
             class="blueprint-lot-pin ${pinClass}"
             style="left: ${unit.cx}%; top: ${unit.cy}%;"
             aria-label="${escapeHtml(tooltipText)}">
            <span>${escapeHtml(shortNum)}</span>
            <span class="pin-tooltip">${escapeHtml(tooltipText)}</span>
          </a>
        `;
      }).join('');

      blueprintStage.innerHTML = `
        <img src="${escapeHtml(effectivePlano)}" alt="Plano general de ${escapeHtml(proj.nombre)}" class="blueprint-base-img">
        ${pinsHtml}
      `;
    } else if (blueprintCard) {
      blueprintCard.style.display = 'none';
    }

    const directWaBtn = document.getElementById('projectDirectWaBtn');
    if (directWaBtn) {
      directWaBtn.href = buildWhatsAppUrl(`Cordial saludo. Solicito asesoría y el plano general de *${proj.nombre}*.`);
      directWaBtn.target = '_blank';
      directWaBtn.rel = 'noopener noreferrer';
    }

    const amenitiesGrid = document.getElementById('projectAmenitiesGrid');
    if (amenitiesGrid && Array.isArray(proj.serviciosPublicos)) {
      amenitiesGrid.innerHTML = proj.serviciosPublicos.map((item, idx) => `
        <article class="criterion-luxury-card">
          <span class="criterion-counter">${String(idx + 1).padStart(2, '0')}</span>
          <h3 class="criterion-title">Especificación Técnica</h3>
          <p class="criterion-body">${escapeHtml(item)}</p>
        </article>
      `).join('');
    }

    const tableBody = document.getElementById('projectUnitsTableBody');
    if (tableBody) {
      tableBody.innerHTML = units.map((unit) => {
        const isAvailable = unit.estado === 'Disponible';
        const priceFmt = `$ ${Number(unit.precioCOP || 0).toLocaleString('es-CO')} COP`;
        const waUnitUrl = buildWhatsAppUrl(
          `Cordial saludo. Me interesa la unidad *${unit.codigo}* (${unit.area}, ${priceFmt}) en *${proj.nombre}*. Solicito ficha técnica.`
        );

        return `
          <tr class="unit-row ${isAvailable ? 'is-available' : 'is-reserved'}">
            <td><strong>${escapeHtml(unit.codigo)}</strong></td>
            <td>${escapeHtml(unit.area)}</td>
            <td>${escapeHtml(priceFmt)}</td>
            <td>${getUnitStatusBadgeHtml(unit.estado)}</td>
            <td class="unit-fmi">${escapeHtml(unit.matricula)}</td>
            <td>
              ${unit.estado === 'Vendido'
                ? '<span style="font-size: 0.72rem; color: var(--color-text-subtle);">NO DISPONIBLE</span>'
                : `<a href="${waUnitUrl}" target="_blank" rel="noopener noreferrer" class="btn-project-inspect-quick" style="padding: 6px 12px; min-height: 36px;">CONSULTAR →</a>`
              }
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  /**
   * 6. LISTADO Y FILTROS GLOBALES DE INVENTARIO (inventario.html)
   */
  function initGlobalInventoryPage() {
    if (document.body.getAttribute('data-page') !== 'inventory') return;

    const visible = getVisibleProjects();
    const typos = getActiveTypologies();
    const selectProject = document.getElementById('filterProject');
    const selectTypology = document.getElementById('filterTypology');
    const selectStatus = document.getElementById('filterStatus');

    const params = new URLSearchParams(window.location.search);
    const preselectedProject = params.get('project');

    if (selectProject) {
      selectProject.innerHTML = `<option value="todos">Todos los Proyectos (${String(visible.length).padStart(2, '0')})</option>` +
        visible.map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.nombre)}</option>`).join('');
      if (preselectedProject && visible.some((p) => p.id === preselectedProject)) {
        selectProject.value = preselectedProject;
      }
    }

    if (selectTypology) {
      selectTypology.innerHTML = '<option value="todos">Todas las Tipologías</option>' +
        typos.map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.label)}</option>`).join('');
    }

    if (selectStatus && !selectStatus.querySelector('option[value="Vendido"]')) {
      const optVendido = document.createElement('option');
      optVendido.value = 'Vendido';
      optVendido.textContent = 'Vendidos';
      selectStatus.appendChild(optVendido);
    }

    function renderGlobalTable() {
      const tbody = document.getElementById('globalInventoryBody');
      const countEl = document.getElementById('inventoryTotalCount');
      if (!tbody) return;

      const fProj = selectProject ? selectProject.value : 'todos';
      const fTypo = selectTypology ? selectTypology.value : 'todos';
      const fStat = selectStatus ? selectStatus.value : 'todos';

      const rows = [];
      visible.forEach((proj) => {
        if (fProj !== 'todos' && proj.id !== fProj) return;
        if (fTypo !== 'todos' && (proj.categoriaFiltro || '').toLowerCase() !== fTypo.toLowerCase()) return;

        const units = Array.isArray(proj.unidadesInventario) ? proj.unidadesInventario : [];
        units.forEach((unit) => {
          if (fStat !== 'todos' && unit.estado !== fStat) return;
          const isAvailable = unit.estado === 'Disponible';
          const priceFmt = `$ ${Number(unit.precioCOP || 0).toLocaleString('es-CO')} COP`;
          const projectUrl = `proyecto.html?id=${encodeURIComponent(proj.id)}`;

          rows.push(`
            <tr class="unit-row ${isAvailable ? 'is-available' : 'is-reserved'}">
              <td><strong>${escapeHtml(proj.nombre)}</strong></td>
              <td>${escapeHtml(unit.codigo)}</td>
              <td>${escapeHtml(proj.tipologia)}</td>
              <td>${escapeHtml(unit.area)}</td>
              <td>${escapeHtml(priceFmt)}</td>
              <td>${getUnitStatusBadgeHtml(unit.estado)}</td>
              <td class="unit-fmi">${escapeHtml(unit.matricula)}</td>
              <td>
                <a href="${projectUrl}" class="btn-project-inspect-quick" style="padding: 6px 12px; min-height: 36px;">
                  VER PROYECTO →
                </a>
              </td>
            </tr>
          `);
        });
      });

      if (countEl) countEl.textContent = String(rows.length).padStart(2, '0');
      tbody.innerHTML = rows.length > 0
        ? rows.join('')
        : '<tr><td colspan="8" style="text-align: center; padding: 32px;">No se encontraron unidades con los filtros seleccionados.</td></tr>';
    }

    [selectProject, selectTypology, selectStatus].forEach((el) => {
      if (el) el.addEventListener('change', renderGlobalTable);
    });

    renderGlobalTable();
  }

  function initAll() {
    syncFeaturedVideoFacade();
    renderCatalog('todos');
    initPortfolioFilters();
    renderProjectDetailPage();
    initGlobalInventoryPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.addEventListener('terranova:config-updated', initAll);
  window.addEventListener('storage', (e) => {
    if (e.key === PROJECTS_STORAGE_KEY) initAll();
  });

  global.TERRANOVA_PROJECTS = {
    STORAGE_KEY: PROJECTS_STORAGE_KEY,
    DEFAULT_PROJECTS,
    get: getProjects,
    getVisible: getVisibleProjects,
    render: renderCatalog
  };

})(typeof window !== 'undefined' ? window : this);