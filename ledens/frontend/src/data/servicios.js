/**
 * Service catalogue — one entry per service page.
 *
 * Each service maps to a route at /servicios/:slug.
 * Images reference files from src/images/ (imported lazily in the component).
 */

export const SERVICIOS = [
  /* ── 1. Albañilería ─────────────────────────────────────────────────────── */
  {
    slug:     'albanileria',
    name:     'Albañilería',
    icon:     'ri-hammer-line',
    menuDesc: 'Obra, alicatado y solados',
    hero: {
      eyebrow: 'Albañilería · Málaga',
      title:   ['Albañilería ', { em: 'sin polvo en tu salón' }, '\ny con remates de calidad.'],
      lead:    'Demolición controlada, alicatado, solados, recibos y reparación de fachadas. Protegemos tu vivienda y entregamos limpio.',
      imgKey:  'tilos19', // mapped in component
    },
    bullets: [
      { t: 'Demolición y retirada',    s: 'Apertura de huecos, retirada de tabiques y gestión de residuos en vertedero autorizado.' },
      { t: 'Alicatado y solado',       s: 'Porcelánico de gran formato con junta mínima y nivelado por láser.' },
      { t: 'Microcemento y resinas',   s: 'Acabados continuos en suelos, paredes y duchas de obra.' },
      { t: 'Reparación de fachadas',   s: 'Saneado, monocapa o silicato y pintura para fachadas de comunidades.' },
      { t: 'Impermeabilizaciones',     s: 'Cubiertas, terrazas y baños con telas asfálticas y resinas líquidas.' },
      { t: 'Protección anti-polvo',    s: 'Cerramos zonas con plástico, sellamos puertas y aspiramos al final de cada día.' },
    ],
    casos: [
      { tag: 'Piso · Centro Histórico', title: 'Apertura de salón-cocina', body: 'Derribo de muro de carga con sustitución por viga IPE. Cálculo y proyecto incluidos.', imgKey: 'tilos17' },
      { tag: 'Reforma integral · Teatinos', title: 'Solado de gran formato', body: 'Porcelánico 120×60 cm con junta de 2 mm en 95 m² de vivienda. Acabado uniforme.', imgKey: 'tilos19' },
      { tag: 'Baño · Pedregalejo',     title: 'Ducha de obra microcemento', body: 'Plato de ducha continuo en microcemento con pendiente al sumidero lineal.', imgKey: 'tilos04' },
    ],
    cta: {
      title:    ['¿Necesitas tirar ', { em: 'una pared o alicatar?' }],
      subtitle: 'Trabajamos con plásticos, aspirador industrial y entrega impecable. Presupuesto cerrado en 24 h.',
    },
  },

  /* ── 2. Electricidad ────────────────────────────────────────────────────── */
  {
    slug:     'electricidad',
    name:     'Electricidad',
    icon:     'ri-flashlight-line',
    menuDesc: 'Instalación, cuadro y domótica',
    hero: {
      eyebrow: 'Electricidad · Málaga',
      title:   ['Instalación eléctrica ', { em: 'sin sorpresas en la factura' }, '\nni en el presupuesto.'],
      lead:    'Desde el cuadro de distribución hasta la última toma de corriente. Certificado de instalación incluido y tramitación ante distribuidora.',
      imgKey:  'tilos24',
    },
    bullets: [
      { t: 'Cuadro de distribución',   s: 'Sustitución o ampliación con magnetotérmicos y diferenciales de últimas generación.' },
      { t: 'Línea y tomas',            s: 'Cableado empotrado en regata o canal. Norma UNE-HD 60364.' },
      { t: 'Iluminación técnica',      s: 'Focos empotrables, tiras LED y circuitos independientes regulables.' },
      { t: 'Puntos de recarga VE',     s: 'Wallbox monofásicos y trifásicos en garaje o plaza de parking.' },
      { t: 'Domótica y automatización',s: 'Control de persianas, calefacción y seguridad integrados en app.' },
      { t: 'Certificado y legalización',s: 'Tramitamos el boletín ante Endesa/distribuidora y entregamos copia en 24 h.' },
    ],
    casos: [
      { tag: 'Piso · Teatinos',        title: 'Reforma eléctrica completa', body: 'Nuevo cuadro, 34 puntos de luz y 12 enchufes con circuitos independientes. 80 m².', imgKey: 'tilos23' },
      { tag: 'Chalet · Costa del Sol', title: 'Wallbox + solar',            body: 'Instalación de cargador bidirecccional Wallbox y conexión a placas fotovoltaicas existentes.', imgKey: 'img1478' },
      { tag: 'Local · Málaga centro',  title: 'Domótica KNX',               body: 'Sistema de automatización de alumbrado, persianas y climatización en oficina de 200 m².', imgKey: 'tilos19' },
    ],
    cta: {
      title:    ['¿Tu instalación tiene ', { em: 'más de 20 años?' }],
      subtitle: 'La revisamos gratis en tu visita técnica. Presupuesto cerrado en 24 h, obra en 48 h.',
    },
  },

  /* ── 3. Fontanería ──────────────────────────────────────────────────────── */
  {
    slug:     'fontaneria',
    name:     'Fontanería',
    icon:     'ri-drop-line',
    menuDesc: 'Tuberías, sanitarios, fugas',
    hero: {
      eyebrow: 'Fontanería · Málaga',
      title:   ['Fontanería sin ', { em: 'goteras a medias\nnoche' }, ' ni presupuestos abiertos.'],
      lead:    'Reparamos fugas, renovamos instalaciones y montamos baños completos. Interlocutor único y precio cerrado antes de empezar.',
      imgKey:  'tilos05',
    },
    bullets: [
      { t: 'Detección de fugas',       s: 'Cámara termográfica y correlación acústica. Localizamos sin levantar solería.' },
      { t: 'Renovación de tuberías',   s: 'Sustitución de plomo o galvanizado por multicapa PEX-AL-PEX o cobre.' },
      { t: 'Baños completos',          s: 'Plato de ducha empotrado, mampara, inodoro suspendido y mueble a medida.' },
      { t: 'Instalación de calefacción',s: 'Caldera de condensación, suelo radiante y radiadores de bajo consumo.' },
      { t: 'Aerotermia y ACS solar',   s: 'Bombas de calor para agua caliente sanitaria y apoyo a calefacción.' },
      { t: 'Desatascos industriales',  s: 'Hidro-jetting, cámara de inspección y repaso de bajantes en 24 h.' },
    ],
    casos: [
      { tag: 'Baño · Tilos 57',        title: 'Baño con ducha de obra',    body: 'Sustitución completa de instalación. Ducha de obra con mampara de cristal y microcemento.', imgKey: 'tilos05' },
      { tag: 'Piso · El Palo',         title: 'Renovación total de tuberías',body: 'Plomo a multicapa en piso de 1980. Trabajo en dos fines de semana sin alojamiento fuera.', imgKey: 'tilos02' },
      { tag: 'Baño principal · Tilos 57',title:'Baño principal renovado',   body: 'Inodoro suspendido, mueble suspendido con lavabo integrado y griferías termostáticas.', imgKey: 'tilos04' },
    ],
    cta: {
      title:    ['¿Tienes una fuga o ', { em: 'quieres renovar el baño?' }],
      subtitle: 'Visita técnica gratis. Presupuesto cerrado en 24 h y equipo trabajando en 48 h.',
    },
  },

  /* ── 4. Climatización ───────────────────────────────────────────────────── */
  {
    slug:     'climatizacion',
    name:     'Climatización',
    icon:     'ri-temp-cold-line',
    menuDesc: 'Aire acondicionado y aerotermia',
    hero: {
      eyebrow: 'Climatización · Málaga',
      title:   ['Frío en agosto, calor en enero,', { em: '\nsin facturas\nsorpresa.' }],
      lead:    'Instalamos, sustituimos y mantenemos sistemas de climatización residencial y terciario. Marca y modelo cerrados en presupuesto.',
      imgKey:  'tilos17',
    },
    bullets: [
      { t: 'Split y multi-split',      s: 'Mitsubishi, Daikin, Fujitsu y Panasonic. Instalación limpia con canaleta o empotrado.' },
      { t: 'Conductos ocultos',        s: 'Cassette o fan-coil de conductos integrado en falso techo de Pladur.' },
      { t: 'Aerotermia',               s: 'Bomba de calor A++ para ACS, calefacción y refrigeración en un solo equipo.' },
      { t: 'Suelo radiante',           s: 'Hidrónico eléctrico o hidrónico de agua, compatible con aerotermia.' },
      { t: 'Mantenimiento anual',      s: 'Limpieza de filtros, revisión de gas y comprobación eléctrica. Contrato anual.' },
      { t: 'Control inteligente',      s: 'Termostatos Wi-Fi y Tado: programación por zona y control remoto desde el móvil.' },
    ],
    casos: [
      { tag: 'Piso · Málaga Centro',   title: 'Multi-split 4×1',           body: '4 unidades interiores en piso de 3 habitaciones. Instalación oculta con canaleta pintada.', imgKey: 'img1492' },
      { tag: 'Chalet · Mijas Costa',   title: 'Aerotermia + suelo radiante',body: 'Sustitución de caldera de gas por bomba de calor aerotérmica y suelo radiante hidrónico.', imgKey: 'img1641' },
      { tag: 'Oficina · Teatinos',     title: 'Cassette de conductos',      body: '5 zonas de 40 m² controladas por termostatos KNX. Instalación en falso techo existente.', imgKey: 'tilos23' },
    ],
    cta: {
      title:    ['Presupuesto de ', { em: 'climatización cerrado en 24 h.' }],
      subtitle: 'Incluye equipo, instalación y puesta en marcha. Sin coste oculto de refrigerante ni conexionado.',
    },
  },

  /* ── 5. Pladur ──────────────────────────────────────────────────────────── */
  {
    slug:     'pladur',
    name:     'Pladur',
    icon:     'ri-layout-2-line',
    menuDesc: 'Tabiques, techos y armarios',
    hero: {
      eyebrow: 'Pladur · Málaga',
      title:   ['Paredes nuevas ', { em: 'sin obra\nsucia' }, ' y con garantía de 2 años.'],
      lead:    'Tabiquería, trasdosados, techos continuos y armarios empotrados. Trabajo limpio, plazo fijo y precio que no varía.',
      imgKey:  'tilos03',
    },
    bullets: [
      { t: 'Tabiquería divisoria',     s: 'Doble placa con lana de roca: aislamiento acústico de 52 dB.' },
      { t: 'Trasdosado de fachadas',   s: 'Mejora de aislamiento térmico sin perder más de 7 cm de pared.' },
      { t: 'Techos continuos',         s: 'Techo liso o con peinazos. Integración de iluminación y climatización.' },
      { t: 'Techos acústicos',         s: 'Lana de vidrio + placa fonoabsorbente para estudios y salas de reunión.' },
      { t: 'Armarios a medida',        s: 'Estructura de Pladur con puerta lacada o con tapizado de tela.' },
      { t: 'Acabado y pintura',        s: 'Masillado, lijado y primera mano de pintura incluidos en el precio.' },
    ],
    casos: [
      { tag: 'Piso · La Malagueta',    title: 'Redistribución completa',    body: 'Retirada de todos los tabiques y nueva distribución con Pladur. De 3 a 4 habitaciones.', imgKey: 'tilos24' },
      { tag: 'Dúplex · Centro',        title: 'Techo acústico media planta',body: 'Instalación de techo flotante con cámara de lana de roca bajo solería de madera.', imgKey: 'img1640' },
      { tag: 'Oficina · Teatinos',     title: 'Sala de reuniones Pladur',   body: 'Cerramiento con doble placa RF60 y puerta de cristal. Privacidad visual y acústica.', imgKey: 'tilos19' },
    ],
    cta: {
      title:    ['¿Quieres ', { em: 'redistribuir o mejorar el aislamiento?' }],
      subtitle: 'Visita técnica sin compromiso. Presupuesto cerrado en 24 h. Inicio de obra en 48 h.',
    },
  },

  /* ── 6. Carpintería ─────────────────────────────────────────────────────── */
  {
    slug:     'carpinteria',
    name:     'Carpintería',
    icon:     'ri-door-open-line',
    menuDesc: 'Madera, puertas y a medida',
    hero: {
      eyebrow: 'Carpintería · Málaga',
      title:   ['Puertas, armarios y ', { em: 'madera a medida' }, '\nque dura décadas.'],
      lead:    'Fabricamos e instalamos carpintería de madera maciza, lacada y de melamina. Armarios empotrados, puertas de paso y tarimas de roble.',
      imgKey:  'img1641',
    },
    bullets: [
      { t: 'Puertas de paso',          s: 'Modelos lacados, de madera maciza y de cristal. Herraje antipandeo incluido.' },
      { t: 'Armarios empotrados',      s: 'Medidas a plano, interiores organizados y puertas correderas o abatibles.' },
      { t: 'Tarimas y parqués',        s: 'Roble, nogal y fresno. Flotante o encolada. Lijado y barnizado in situ.' },
      { t: 'Cocinas a medida',         s: 'Muebles de cocina en melamina, lacado o madera maciza con encimera a elegir.' },
      { t: 'Escaleras de madera',      s: 'Revestimiento de peldaños y renovación de barandillas en roble o pino.' },
      { t: 'Ventanas de madera',       s: 'Carpintería exterior maciza con doble vidrio y RPT. Pintura al agua.' },
    ],
    casos: [
      { tag: 'Dormitorio · Tilos 57',  title: 'Armario empotrado a medida', body: '4 puertas correderas en espejo. Interior con cajones y zapatero. Suelo a techo.', imgKey: 'img1641' },
      { tag: 'Cocina · Málaga Centro', title: 'Cocina lacada con isla',      body: 'Muebles lacados en blanco roto, encimera de silestone y isla de madera maciza de roble.', imgKey: 'img1492' },
      { tag: 'Salón · Tilos 57',       title: 'Tarima de roble flotante',    body: '65 m² de tarima de roble europeo en distintas anchuras. Instalación flotante silenciosa.', imgKey: 'img1478' },
    ],
    cta: {
      title:    ['¿Qué pieza de ', { em: 'madera necesitas?' }],
      subtitle: 'Te hacemos una propuesta con planos en 24 h. Fabricación propia, garantía de 2 años.',
    },
  },
];

/* Quick lookup by slug */
export const SERVICIOS_BY_SLUG = Object.fromEntries(
  SERVICIOS.map(s => [s.slug, s])
);

/** Maps imgKey strings to dynamic import functions for Vite. */
export const SERVICE_IMAGES = {
  tilos19: () => import('../images/Tilos 57-19.webp'),
  tilos04: () => import('../images/Tilos 57-04.webp'),
  tilos05: () => import('../images/Tilos 57-05.webp'),
  tilos02: () => import('../images/Tilos 57-02.webp'),
  tilos17: () => import('../images/Tilos 57-17.webp'),
  tilos23: () => import('../images/Tilos 57-23.webp'),
  tilos24: () => import('../images/Tilos 57-24.webp'),
  tilos03: () => import('../images/Tilos 57-03.webp'),
  img1478: () => import('../images/IMG_1478.webp'),
  img1492: () => import('../images/IMG_1492.webp'),
  img1641: () => import('../images/IMG_1641.webp'),
  img1640: () => import('../images/IMG_1640.webp'),
  img1470: () => import('../images/IMG_1470.webp'),
};
