const STORAGE_KEY = 'iaBotAlcaldiaDigitalConfigV2';
const BACKUP_KEY = 'iaBotAlcaldiaDigitalConfigBackupV124';
const PRELOADER_MESSAGES = [
  'Inicializando Núcleo Cognitivo...',
  'Cargando Arquitectura Neural...',
  'Sincronizando Base de Conocimiento...',
  'Validando Modelos de Inteligencia Artificial...',
  'Conectando con la Infraestructura Digital...',
  'Procesando Proyectos Estratégicos...',
  'Compilando Información Institucional...',
  'Construyendo Contexto Inteligente...',
  'Preparando Motor de Respuestas...',
  'Optimizando Parámetros Conversacionales...',
  'Activando Gobierno Digital...',
  'Inicializando Servicios Ciudadanos...',
  'Sistema listo.'
];

const DEFAULT_CONFIG = {
  schemaVersion: '1.2.5',
  logoUrl: '',
  institutionLine1: 'ALCALDÍA DIGITAL',
  institutionLine2: 'INNOVACIÓN · SERVICIO · TRANSPARENCIA',
  institutionLine3: 'MEMORIA Y CUENTA',
  line1Size: 28,
  line2Size: 16,
  line3Size: 18,
  lineGap: 3,
  logoWidth: 78,
  logoHeight: 78,
  logoPadding: 7,
  logoFit: 'contain',
  fixedTitle: 'Gestión pública conectada con el ciudadano',
  rotatingTexts: [
    'Tecnología al servicio de una administración más cercana, eficiente y transparente.',
    'Información institucional disponible en tiempo real para ciudadanos y servidores públicos.',
    'Un nuevo modelo de atención impulsado por inteligencia artificial y participación ciudadana.'
  ],
  rotateSeconds: 5,
  eventLabel: 'EVENTO INSTITUCIONAL',
  videoUrl: '',
  videoOpacity: 1,
  videoBrightness: 1,
  overlayColor: '#06131f',
  overlayOpacity: 0.64,
  accentColor: '#27e7ff',
  fxIntensity: 0.75,
  preloaderDuration: 8,
  fullscreenOnStart: true,
  avatarEnabled: false,
  avatarWebmUrl: '',
  avatarAltUrl: '',
  avatarFallbackUrl: '',
  avatarPosition: 'chat-left',
  avatarScreenX: 78,
  avatarScreenY: 62,
  avatarWidth: 300,
  avatarHeight: 480,
  avatarOffsetX: 0,
  avatarOffsetY: 0,
  avatarScale: 1,
  avatarRotation: 0,
  avatarFlipX: false,
  avatarOpacity: 1,
  avatarGlow: 0.65,
  avatarPlaybackRate: 1,
  avatarZIndex: 8,
  chatTitle: 'IA Bot Institucional',
  embedCode: '',
  embedPresentation: {
    mode: 'column',
    showOuterPanel: false,
    showHeader: false,
    fitMode: 'contain',
    contentWidth: 440,
    contentHeight: 600,
    areaWidth: 680,
    areaHeight: 760,
    positionX: 50,
    positionY: 50,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1,
    transformOrigin: 'center center',
    overflowHidden: true,
    forceExpanded: true,
    zIndex: 12
  },
  cloudProvider: 'none',
  supabaseUrl: '',
  supabaseAnonKey: '',
  boardId: 'alcaldia-principal',
  updatedAt: null
};

let config = loadLocalConfig();
let rotatorTimer = null;
let rotatingIndex = 0;
let toastTimer = null;
let adminAccessGranted = false;
let hlsInstance = null;
let embedResizeObserver = null;
let cloudStartupState = { state: 'loading', message: 'NUBE: CONECTANDO', detail: '' };

const $ = (id) => document.getElementById(id);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getLegacyAvatarCoordinates(position) {
  const presets = {
    'chat-left': { x: 60, y: 66 },
    'chat-right': { x: 92, y: 66 },
    'inside-left': { x: 68, y: 72 },
    'inside-right': { x: 88, y: 72 }
  };
  return presets[position] || presets['chat-left'];
}

function sanitizeConfig(input = {}) {
  const legacy = getLegacyAvatarCoordinates(input.avatarPosition);
  const merged = { ...DEFAULT_CONFIG, ...input };
  merged.schemaVersion = '1.2.5';
  merged.rotatingTexts = Array.isArray(input.rotatingTexts)
    ? [...input.rotatingTexts, ...DEFAULT_CONFIG.rotatingTexts].slice(0, 3)
    : DEFAULT_CONFIG.rotatingTexts;
  merged.rotateSeconds = clamp(Number(merged.rotateSeconds) || 5, 2, 30);
  merged.overlayOpacity = clamp(Number(merged.overlayOpacity) || 0.64, 0, 0.95);
  merged.fxIntensity = clamp(Number(merged.fxIntensity) || 0.75, 0, 1);
  merged.logoWidth = clamp(Number(merged.logoWidth) || 78, 42, 320);
  merged.logoHeight = clamp(Number(merged.logoHeight) || 78, 42, 240);
  merged.logoPadding = clamp(Number(merged.logoPadding) || 0, 0, 30);
  merged.logoFit = ['contain', 'cover', 'fill'].includes(merged.logoFit) ? merged.logoFit : 'contain';
  merged.videoOpacity = clamp(Number(merged.videoOpacity) || 1, 0.1, 1);
  merged.videoBrightness = clamp(Number(merged.videoBrightness) || 1, 0.4, 1.6);
  merged.preloaderDuration = clamp(Number(merged.preloaderDuration) || 8, 3, 20);
  merged.fullscreenOnStart = merged.fullscreenOnStart !== false;
  merged.avatarEnabled = Boolean(merged.avatarEnabled);
  merged.avatarPosition = ['chat-left', 'chat-right', 'inside-left', 'inside-right'].includes(merged.avatarPosition) ? merged.avatarPosition : 'chat-left';
  merged.avatarScreenX = clamp(Number(input.avatarScreenX ?? legacy.x), 0, 100);
  merged.avatarScreenY = clamp(Number(input.avatarScreenY ?? legacy.y), 0, 100);
  merged.avatarWidth = clamp(Number(merged.avatarWidth) || 300, 120, 900);
  merged.avatarHeight = clamp(Number(merged.avatarHeight) || 480, 160, 1000);
  merged.avatarOffsetX = clamp(Number(merged.avatarOffsetX) || 0, -600, 600);
  merged.avatarOffsetY = clamp(Number(merged.avatarOffsetY) || 0, -500, 500);
  merged.avatarScale = clamp(Number(merged.avatarScale) || 1, 0.25, 2.5);
  merged.avatarRotation = clamp(Number(merged.avatarRotation) || 0, -180, 180);
  merged.avatarFlipX = Boolean(merged.avatarFlipX);
  merged.avatarOpacity = clamp(Number(merged.avatarOpacity) || 1, 0.1, 1);
  merged.avatarGlow = clamp(Number(merged.avatarGlow) || 0, 0, 1);
  merged.avatarPlaybackRate = clamp(Number(merged.avatarPlaybackRate) || 1, 0.25, 2);
  merged.avatarZIndex = clamp(Number(merged.avatarZIndex ?? 8), 0, 25);
  merged.line1Size = clamp(Number(merged.line1Size) || 28, 14, 58);
  merged.line2Size = clamp(Number(merged.line2Size) || 16, 10, 38);
  merged.line3Size = clamp(Number(merged.line3Size) || 18, 10, 42);
  merged.lineGap = clamp(Number(merged.lineGap) || 3, 0, 24);

  const presentationInput = input.embedPresentation && typeof input.embedPresentation === 'object'
    ? input.embedPresentation
    : {};
  const presentation = { ...DEFAULT_CONFIG.embedPresentation, ...presentationInput };
  presentation.mode = ['column', 'free', 'fullscreen'].includes(presentation.mode) ? presentation.mode : 'column';
  presentation.showOuterPanel = presentation.showOuterPanel === true;
  presentation.showHeader = presentation.showHeader === true;
  presentation.fitMode = ['manual', 'contain', 'cover', 'stretch'].includes(presentation.fitMode) ? presentation.fitMode : 'contain';
  presentation.contentWidth = clamp(Number(presentation.contentWidth) || 440, 240, 1400);
  presentation.contentHeight = clamp(Number(presentation.contentHeight) || 600, 280, 1400);
  presentation.areaWidth = clamp(Number(presentation.areaWidth) || 680, 320, 1800);
  presentation.areaHeight = clamp(Number(presentation.areaHeight) || 760, 320, 1400);
  const positionX = Number(presentation.positionX);
  const positionY = Number(presentation.positionY);
  presentation.positionX = clamp(Number.isFinite(positionX) ? positionX : 50, 0, 100);
  presentation.positionY = clamp(Number.isFinite(positionY) ? positionY : 50, 0, 100);
  presentation.offsetX = clamp(Number(presentation.offsetX) || 0, -900, 900);
  presentation.offsetY = clamp(Number(presentation.offsetY) || 0, -700, 700);
  presentation.scale = clamp(Number(presentation.scale) || 1, 0.25, 3.5);
  presentation.scaleX = clamp(Number(presentation.scaleX) || 1, 0.5, 2.5);
  presentation.scaleY = clamp(Number(presentation.scaleY) || 1, 0.5, 2.5);
  presentation.transformOrigin = [
    'center center', 'center top', 'center bottom',
    'left center', 'right center', 'left top', 'right top',
    'left bottom', 'right bottom'
  ].includes(presentation.transformOrigin) ? presentation.transformOrigin : 'center center';
  presentation.overflowHidden = presentation.overflowHidden !== false;
  presentation.forceExpanded = presentation.forceExpanded !== false;
  presentation.zIndex = clamp(Number(presentation.zIndex) || 12, 1, 60);
  merged.embedPresentation = presentation;
  return merged;
}

function loadLocalConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return sanitizeConfig(raw ? JSON.parse(raw) : DEFAULT_CONFIG);
  } catch (error) {
    console.warn('No se pudo cargar la configuración local:', error);
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) return sanitizeConfig(JSON.parse(backup).config || JSON.parse(backup));
    } catch (backupError) {
      console.warn('Tampoco fue posible restaurar el respaldo local:', backupError);
    }
    return sanitizeConfig(DEFAULT_CONFIG);
  }
}

function createLocalBackup(reason = 'before-save') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    localStorage.setItem(BACKUP_KEY, JSON.stringify({
      schemaVersion: '1.2.5',
      createdAt: new Date().toISOString(),
      reason,
      config: JSON.parse(raw)
    }));
  } catch (error) {
    console.warn('No se pudo crear el respaldo local:', error);
  }
}

function saveLocalConfig({ backupReason = 'before-save' } = {}) {
  createLocalBackup(backupReason);
  config.schemaVersion = '1.2.5';
  config.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  showToast('Configuración completa guardada en esta laptop.');
}

function hexToRgbString(hex) {
  const clean = String(hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '39, 231, 255';
  return `${parseInt(clean.slice(0, 2), 16)}, ${parseInt(clean.slice(2, 4), 16)}, ${parseInt(clean.slice(4, 6), 16)}`;
}

function applyConfig() {
  $('institutionLine1').textContent = config.institutionLine1;
  $('institutionLine2').textContent = config.institutionLine2;
  $('institutionLine3').textContent = config.institutionLine3;
  $('fixedTitle').textContent = config.fixedTitle;
  $('eventLabel').textContent = config.eventLabel;
  $('chatPanelTitle').textContent = config.chatTitle;

  document.documentElement.style.setProperty('--accent', config.accentColor);
  document.documentElement.style.setProperty('--accent-rgb', hexToRgbString(config.accentColor));
  document.documentElement.style.setProperty('--fx', config.fxIntensity);
  document.documentElement.style.setProperty('--line1-size', `${config.line1Size}px`);
  document.documentElement.style.setProperty('--line2-size', `${config.line2Size}px`);
  document.documentElement.style.setProperty('--line3-size', `${config.line3Size}px`);
  document.documentElement.style.setProperty('--line-gap', `${config.lineGap}px`);
  document.documentElement.style.setProperty('--logo-w', `${config.logoWidth}px`);
  document.documentElement.style.setProperty('--logo-h', `${config.logoHeight}px`);
  document.documentElement.style.setProperty('--logo-padding', `${config.logoPadding}px`);
  document.documentElement.style.setProperty('--video-opacity', config.videoOpacity);
  document.documentElement.style.setProperty('--video-brightness', config.videoBrightness);
  document.documentElement.style.setProperty('--avatar-w', `${config.avatarWidth}px`);
  document.documentElement.style.setProperty('--avatar-h', `${config.avatarHeight}px`);
  document.documentElement.style.setProperty('--avatar-screen-x', `${config.avatarScreenX}vw`);
  document.documentElement.style.setProperty('--avatar-screen-y', `${config.avatarScreenY}vh`);
  document.documentElement.style.setProperty('--avatar-x', `${config.avatarOffsetX}px`);
  document.documentElement.style.setProperty('--avatar-y', `${config.avatarOffsetY}px`);
  document.documentElement.style.setProperty('--avatar-scale', config.avatarScale);
  document.documentElement.style.setProperty('--avatar-rotation', `${config.avatarRotation}deg`);
  document.documentElement.style.setProperty('--avatar-flip', config.avatarFlipX ? -1 : 1);
  document.documentElement.style.setProperty('--avatar-opacity', config.avatarOpacity);
  document.documentElement.style.setProperty('--avatar-glow-blur', `${Math.round(config.avatarGlow * 52)}px`);
  document.documentElement.style.setProperty('--avatar-glow-alpha', config.avatarGlow);
  document.documentElement.style.setProperty('--avatar-z', config.avatarZIndex);

  $('colorOverlay').style.background = config.overlayColor;
  $('colorOverlay').style.opacity = config.overlayOpacity;

  updateLogo();
  updateVideo();
  updateAvatar();
  applyEmbedPresentation();
  updateEmbed();
  updateFullscreenStatus();
  startRotator();
}

function updateLogo() {
  const logo = $('institutionLogo');
  const placeholder = $('logoPlaceholder');
  if (config.logoUrl) {
    logo.src = config.logoUrl;
    logo.style.objectFit = config.logoFit;
    logo.style.display = 'block';
    placeholder.style.display = 'none';
    logo.onerror = () => {
      logo.style.display = 'none';
      placeholder.style.display = 'block';
    };
  } else {
    logo.removeAttribute('src');
    logo.style.display = 'none';
    placeholder.style.display = 'block';
  }
}

function setVideoStatus(message, state = 'neutral') {
  const status = $('videoStatus');
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function destroyHls() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
}

async function tryPlayVideo(video) {
  try {
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    await video.play();
    video.classList.add('is-ready');
    setVideoStatus('Video reproduciéndose correctamente.', 'success');
  } catch (error) {
    console.warn('Autoplay del video bloqueado:', error);
    setVideoStatus('El video cargó, pero el navegador bloqueó la reproducción automática. Haz clic en “Probar / recargar video”.', 'warning');
  }
}

function updateVideo(forceReload = false) {
  const video = $('backgroundVideo');
  const url = String(config.videoUrl || '').trim();

  destroyHls();
  video.classList.remove('is-ready');
  video.pause();
  video.removeAttribute('src');
  video.load();

  if (!url) {
    setVideoStatus('Sin video configurado.', 'neutral');
    return;
  }

  setVideoStatus('Verificando enlace y formato del video...', 'loading');

  const markReady = () => {
    video.classList.add('is-ready');
    setVideoStatus('Video cargado. Preparando reproducción...', 'loading');
  };
  const markPlaying = () => {
    video.classList.add('is-ready');
    setVideoStatus('Video reproduciéndose correctamente.', 'success');
  };
  const markError = () => {
    const mediaError = video.error;
    const details = mediaError ? ` Código ${mediaError.code}.` : '';
    setVideoStatus(`No se pudo reproducir el video.${details} Comprueba que la CDN entregue MP4/WebM o HLS y permita solicitudes parciales.`, 'error');
    showToast('El video no pudo reproducirse. Revisa el diagnóstico en el panel.');
  };

  video.onloadedmetadata = markReady;
  video.onloadeddata = markReady;
  video.oncanplay = () => tryPlayVideo(video);
  video.onplaying = markPlaying;
  video.onerror = markError;
  video.onstalled = () => setVideoStatus('La carga del video está detenida temporalmente. Intentando continuar...', 'warning');
  video.onwaiting = () => setVideoStatus('El video está almacenando datos en búfer...', 'loading');

  const cleanUrl = url.split('?')[0].toLowerCase();
  const isHls = cleanUrl.endsWith('.m3u8');

  if (isHls) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.load();
      tryPlayVideo(video);
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30
      });
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => tryPlayVideo(video));
      hlsInstance.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setVideoStatus(`Error HLS: ${data.details || 'no especificado'}.`, 'error');
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) hlsInstance.startLoad();
          else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) hlsInstance.recoverMediaError();
          else destroyHls();
        }
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      return;
    }
    setVideoStatus('Este navegador no puede reproducir HLS y la librería HLS no está disponible.', 'error');
    return;
  }

  video.src = url;
  video.load();
  tryPlayVideo(video);
}
function setAvatarStatus(message, state = 'neutral') {
  const status = $('avatarStatus');
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function hideAvatarMedia() {
  const video = $('avatarVideo');
  const fallback = $('avatarFallback');
  video.classList.remove('is-ready');
  fallback.classList.remove('is-ready');
}

async function tryPlayAvatar() {
  const video = $('avatarVideo');
  try {
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    await video.play();
    video.classList.add('is-ready');
    $('avatarFallback').classList.remove('is-ready');
    setAvatarStatus('Avatar transparente reproduciéndose correctamente.', 'success');
  } catch (error) {
    console.warn('No se pudo iniciar el avatar:', error);
    if (config.avatarFallbackUrl) {
      $('avatarFallback').classList.add('is-ready');
      setAvatarStatus('El video no inició; se muestra la imagen de respaldo.', 'warning');
    } else {
      setAvatarStatus('El navegador bloqueó o no soporta el video del avatar.', 'warning');
    }
  }
}

function updateAvatar(forceReload = false) {
  const stage = $('avatarStage');
  const video = $('avatarVideo');
  const webmSource = $('avatarWebmSource');
  const altSource = $('avatarAltSource');
  const fallback = $('avatarFallback');

  stage.className = 'avatar-stage';
  document.documentElement.style.setProperty('--avatar-w', `${config.avatarWidth}px`);
  document.documentElement.style.setProperty('--avatar-h', `${config.avatarHeight}px`);
  document.documentElement.style.setProperty('--avatar-screen-x', `${config.avatarScreenX}vw`);
  document.documentElement.style.setProperty('--avatar-screen-y', `${config.avatarScreenY}vh`);
  document.documentElement.style.setProperty('--avatar-x', `${config.avatarOffsetX}px`);
  document.documentElement.style.setProperty('--avatar-y', `${config.avatarOffsetY}px`);
  document.documentElement.style.setProperty('--avatar-scale', config.avatarScale);
  document.documentElement.style.setProperty('--avatar-rotation', `${config.avatarRotation}deg`);
  document.documentElement.style.setProperty('--avatar-flip', config.avatarFlipX ? -1 : 1);
  document.documentElement.style.setProperty('--avatar-opacity', config.avatarOpacity);
  document.documentElement.style.setProperty('--avatar-glow-blur', `${Math.round(config.avatarGlow * 52)}px`);
  document.documentElement.style.setProperty('--avatar-glow-alpha', config.avatarGlow);
  document.documentElement.style.setProperty('--avatar-z', config.avatarZIndex);
  video.playbackRate = config.avatarPlaybackRate;

  const hasMedia = Boolean(config.avatarWebmUrl || config.avatarAltUrl || config.avatarFallbackUrl);
  if (!config.avatarEnabled || !hasMedia) {
    stage.classList.remove('is-visible');
    stage.setAttribute('aria-hidden', 'true');
    video.pause();
    hideAvatarMedia();
    setAvatarStatus(config.avatarEnabled ? 'Configura una URL de video o imagen para mostrar el avatar.' : 'Avatar desactivado.', 'neutral');
    return;
  }

  stage.classList.add('is-visible');
  stage.setAttribute('aria-hidden', 'false');
  fallback.src = config.avatarFallbackUrl || '';
  fallback.onerror = () => fallback.classList.remove('is-ready');

  const currentWebm = webmSource.getAttribute('src') || '';
  const currentAlt = altSource.getAttribute('src') || '';
  if (forceReload || currentWebm !== config.avatarWebmUrl || currentAlt !== config.avatarAltUrl) {
    video.pause();
    hideAvatarMedia();
    webmSource.src = config.avatarWebmUrl || '';
    altSource.src = config.avatarAltUrl || '';
    if (config.avatarAltUrl) {
      const extension = config.avatarAltUrl.split('?')[0].toLowerCase();
      altSource.type = extension.endsWith('.mov') ? 'video/quicktime' : extension.endsWith('.mp4') ? 'video/mp4' : '';
    } else {
      altSource.removeAttribute('type');
    }
    video.load();
  }

  video.oncanplay = tryPlayAvatar;
  video.onplaying = () => {
    video.playbackRate = config.avatarPlaybackRate;
    video.classList.add('is-ready');
    fallback.classList.remove('is-ready');
    setAvatarStatus('Avatar alfa reproduciéndose detrás de la presentación sin bloquear el chat.', 'success');
  };
  video.onerror = () => {
    video.classList.remove('is-ready');
    if (config.avatarFallbackUrl) {
      fallback.classList.add('is-ready');
      setAvatarStatus('Formato de video no compatible; se muestra la imagen de respaldo.', 'warning');
    } else {
      setAvatarStatus('No se pudo cargar el avatar. Verifica el formato, la URL y los permisos de la CDN.', 'error');
    }
  };

  if (config.avatarWebmUrl || config.avatarAltUrl) {
    tryPlayAvatar();
  } else if (config.avatarFallbackUrl) {
    fallback.classList.add('is-ready');
    setAvatarStatus('Mostrando imagen transparente de respaldo.', 'success');
  }
}

function getEmbedPresentation() {
  return config.embedPresentation || DEFAULT_CONFIG.embedPresentation;
}

function calculateEmbedScale(viewport, presentation) {
  const viewportWidth = Math.max(1, viewport?.clientWidth || presentation.areaWidth || 1);
  const viewportHeight = Math.max(1, viewport?.clientHeight || presentation.areaHeight || 1);
  const baseWidth = Math.max(1, presentation.contentWidth);
  const baseHeight = Math.max(1, presentation.contentHeight);
  const ratioX = viewportWidth / baseWidth;
  const ratioY = viewportHeight / baseHeight;

  let fitX = 1;
  let fitY = 1;

  if (presentation.fitMode === 'contain') {
    const fit = Math.min(ratioX, ratioY);
    fitX = fit;
    fitY = fit;
  } else if (presentation.fitMode === 'cover') {
    const fit = Math.max(ratioX, ratioY);
    fitX = fit;
    fitY = fit;
  } else if (presentation.fitMode === 'stretch') {
    fitX = ratioX;
    fitY = ratioY;
  }

  return {
    x: clamp(fitX * presentation.scale * presentation.scaleX, 0.05, 8),
    y: clamp(fitY * presentation.scale * presentation.scaleY, 0.05, 8)
  };
}

function applyEmbedPresentation() {
  const zone = $('chatZone');
  const topbar = $('chatTopbar');
  const container = $('chatEmbedContainer');
  const viewport = $('chatEmbedViewport');
  const stage = $('chatEmbedStage');
  if (!zone || !container || !viewport || !stage) return;

  const presentation = getEmbedPresentation();
  zone.dataset.embedMode = presentation.mode;
  zone.classList.toggle('bot-panel-hidden', !presentation.showOuterPanel);
  zone.classList.toggle('bot-header-hidden', !presentation.showHeader);
  topbar?.setAttribute('aria-hidden', presentation.showHeader ? 'false' : 'true');

  zone.style.setProperty('--bot-area-width', `${presentation.areaWidth}px`);
  zone.style.setProperty('--bot-area-height', `${presentation.areaHeight}px`);
  zone.style.setProperty('--bot-position-x', `${presentation.positionX}%`);
  zone.style.setProperty('--bot-position-y', `${presentation.positionY}%`);
  zone.style.setProperty('--bot-offset-x', `${presentation.offsetX}px`);
  zone.style.setProperty('--bot-offset-y', `${presentation.offsetY}px`);
  zone.style.setProperty('--bot-content-width', `${presentation.contentWidth}px`);
  zone.style.setProperty('--bot-content-height', `${presentation.contentHeight}px`);
  zone.style.setProperty('--bot-transform-origin', presentation.transformOrigin);
  zone.style.setProperty('--bot-z-index', presentation.zIndex);
  viewport.style.overflow = presentation.overflowHidden ? 'hidden' : 'visible';

  const effective = calculateEmbedScale(viewport, presentation);
  zone.style.setProperty('--bot-effective-scale-x', effective.x);
  zone.style.setProperty('--bot-effective-scale-y', effective.y);

  if (embedResizeObserver) embedResizeObserver.disconnect();
  if ('ResizeObserver' in window) {
    embedResizeObserver = new ResizeObserver(() => {
      const current = getEmbedPresentation();
      const next = calculateEmbedScale(viewport, current);
      zone.style.setProperty('--bot-effective-scale-x', next.x);
      zone.style.setProperty('--bot-effective-scale-y', next.y);
    });
    embedResizeObserver.observe(viewport);
  }
}

function prepareEmbeddedElements(mount) {
  const presentation = getEmbedPresentation();

  mount.querySelectorAll('iframe').forEach((frame) => {
    frame.setAttribute('allow', frame.getAttribute('allow') || 'microphone; autoplay');
    frame.style.setProperty('width', '100%', 'important');
    frame.style.setProperty('height', '100%', 'important');
    frame.style.setProperty('min-height', '0', 'important');
    frame.style.setProperty('border', '0', 'important');
    frame.style.setProperty('display', 'block', 'important');
  });

  mount.querySelectorAll('elevenlabs-convai').forEach((widget) => {
    if (presentation.forceExpanded) widget.setAttribute('variant', 'expanded');
    widget.style.setProperty('display', 'block', 'important');
    widget.style.setProperty('position', 'relative', 'important');
    widget.style.setProperty('inset', 'auto', 'important');
    widget.style.setProperty('width', '100%', 'important');
    widget.style.setProperty('height', '100%', 'important');
    widget.style.setProperty('max-width', 'none', 'important');
    widget.style.setProperty('max-height', 'none', 'important');
    widget.style.setProperty('margin', '0', 'important');
  });
}

function activateEmbedScripts(mount) {
  mount.querySelectorAll('script').forEach((oldScript) => {
    const src = oldScript.getAttribute('src');
    if (src && document.querySelector(`script[data-dynamic-embed-src="${CSS.escape(src)}"]`)) {
      oldScript.remove();
      return;
    }

    const script = document.createElement('script');
    [...oldScript.attributes].forEach((attr) => script.setAttribute(attr.name, attr.value));
    if (src) script.dataset.dynamicEmbedSrc = src;
    script.textContent = oldScript.textContent;
    oldScript.replaceWith(script);
  });
}

function updateEmbed() {
  const mount = $('chatEmbedMount');
  if (!mount) return;

  if (!config.embedCode.trim()) {
    mount.innerHTML = `<div class="chat-placeholder"><div class="bot-orb">IA</div><h3>Área de integración del agente</h3><p>Abre el panel administrativo y pega aquí el código embed de tu chatbot.</p></div>`;
    applyEmbedPresentation();
    return;
  }

  mount.innerHTML = config.embedCode;
  prepareEmbeddedElements(mount);
  activateEmbedScripts(mount);
  applyEmbedPresentation();

  if (window.customElements?.whenDefined && mount.querySelector('elevenlabs-convai')) {
    window.customElements.whenDefined('elevenlabs-convai').then(() => {
      prepareEmbeddedElements(mount);
      applyEmbedPresentation();
    }).catch(() => {});
  }
}

function setRotatingText(text) {
  $('rotatingText').textContent = text || '';
}

function startRotator() {
  clearInterval(rotatorTimer);
  rotatingIndex = 0;
  setRotatingText(config.rotatingTexts[0]);
  rotatorTimer = setInterval(() => {
    rotatingIndex = (rotatingIndex + 1) % 3;
    const node = $('rotatingText');
    node.classList.add('is-changing');
    setTimeout(() => {
      setRotatingText(config.rotatingTexts[rotatingIndex]);
      node.classList.remove('is-changing');
    }, 350);
  }, config.rotateSeconds * 1000);
}

function updateClock() {
  const now = new Date();
  $('liveDate').textContent = new Intl.DateTimeFormat('es-PR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(now);
  $('liveTime').textContent = new Intl.DateTimeFormat('es-PR', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now);
}

function fillForm() {
  $('cfgLogoUrl').value = config.logoUrl;
  $('cfgLine1').value = config.institutionLine1;
  $('cfgLine2').value = config.institutionLine2;
  $('cfgLine3').value = config.institutionLine3;
  $('cfgLine1Size').value = config.line1Size;
  $('cfgLine2Size').value = config.line2Size;
  $('cfgLine3Size').value = config.line3Size;
  $('cfgLineGap').value = config.lineGap;
  $('cfgLogoWidth').value = config.logoWidth;
  $('cfgLogoHeight').value = config.logoHeight;
  $('cfgLogoPadding').value = config.logoPadding;
  $('cfgLogoFit').value = config.logoFit;
  $('cfgFixedTitle').value = config.fixedTitle;
  $('cfgRotate1').value = config.rotatingTexts[0];
  $('cfgRotate2').value = config.rotatingTexts[1];
  $('cfgRotate3').value = config.rotatingTexts[2];
  $('cfgRotateSeconds').value = config.rotateSeconds;
  $('cfgEventLabel').value = config.eventLabel;
  $('cfgVideoUrl').value = config.videoUrl;
  $('cfgVideoOpacity').value = config.videoOpacity;
  $('cfgVideoBrightness').value = config.videoBrightness;
  $('cfgOverlayColor').value = config.overlayColor;
  $('cfgOverlayOpacity').value = config.overlayOpacity;
  $('cfgAccentColor').value = config.accentColor;
  $('cfgFxIntensity').value = config.fxIntensity;
  $('cfgPreloaderDuration').value = config.preloaderDuration;
  $('cfgFullscreenOnStart').checked = config.fullscreenOnStart;
  $('cfgAvatarEnabled').checked = config.avatarEnabled;
  $('cfgAvatarWebmUrl').value = config.avatarWebmUrl;
  $('cfgAvatarAltUrl').value = config.avatarAltUrl;
  $('cfgAvatarFallbackUrl').value = config.avatarFallbackUrl;
  $('cfgAvatarScreenX').value = config.avatarScreenX;
  $('cfgAvatarScreenY').value = config.avatarScreenY;
  $('cfgAvatarWidth').value = config.avatarWidth;
  $('cfgAvatarHeight').value = config.avatarHeight;
  $('cfgAvatarOffsetX').value = config.avatarOffsetX;
  $('cfgAvatarOffsetY').value = config.avatarOffsetY;
  $('cfgAvatarScale').value = config.avatarScale;
  $('cfgAvatarRotation').value = config.avatarRotation;
  $('cfgAvatarFlipX').checked = config.avatarFlipX;
  $('cfgAvatarOpacity').value = config.avatarOpacity;
  $('cfgAvatarGlow').value = config.avatarGlow;
  $('cfgAvatarPlaybackRate').value = config.avatarPlaybackRate;
  $('cfgAvatarZIndex').value = config.avatarZIndex;
  $('cfgChatTitle').value = config.chatTitle;
  $('cfgEmbedCode').value = config.embedCode;
  const embedPresentation = getEmbedPresentation();
  $('cfgEmbedMode').value = embedPresentation.mode;
  $('cfgEmbedShowOuterPanel').checked = embedPresentation.showOuterPanel;
  $('cfgEmbedShowHeader').checked = embedPresentation.showHeader;
  $('cfgEmbedFitMode').value = embedPresentation.fitMode;
  $('cfgEmbedContentWidth').value = embedPresentation.contentWidth;
  $('cfgEmbedContentHeight').value = embedPresentation.contentHeight;
  $('cfgEmbedAreaWidth').value = embedPresentation.areaWidth;
  $('cfgEmbedAreaHeight').value = embedPresentation.areaHeight;
  $('cfgEmbedPositionX').value = embedPresentation.positionX;
  $('cfgEmbedPositionY').value = embedPresentation.positionY;
  $('cfgEmbedOffsetX').value = embedPresentation.offsetX;
  $('cfgEmbedOffsetY').value = embedPresentation.offsetY;
  $('cfgEmbedScale').value = embedPresentation.scale;
  $('cfgEmbedScaleX').value = embedPresentation.scaleX;
  $('cfgEmbedScaleY').value = embedPresentation.scaleY;
  $('cfgEmbedTransformOrigin').value = embedPresentation.transformOrigin;
  $('cfgEmbedOverflowHidden').checked = embedPresentation.overflowHidden;
  $('cfgEmbedForceExpanded').checked = embedPresentation.forceExpanded;
  $('cfgEmbedZIndex').value = embedPresentation.zIndex;
  $('cfgCloudProvider').value = config.cloudProvider;
  $('cfgSupabaseUrl').value = config.supabaseUrl;
  $('cfgSupabaseAnonKey').value = config.supabaseAnonKey;
  $('cfgBoardId').value = config.boardId;
  updateControlOutputs();
}

function readForm() {
  config = sanitizeConfig({
    ...config,
    logoUrl: $('cfgLogoUrl').value.trim(),
    institutionLine1: $('cfgLine1').value.trim(),
    institutionLine2: $('cfgLine2').value.trim(),
    institutionLine3: $('cfgLine3').value.trim(),
    line1Size: Number($('cfgLine1Size').value),
    line2Size: Number($('cfgLine2Size').value),
    line3Size: Number($('cfgLine3Size').value),
    lineGap: Number($('cfgLineGap').value),
    logoWidth: Number($('cfgLogoWidth').value),
    logoHeight: Number($('cfgLogoHeight').value),
    logoPadding: Number($('cfgLogoPadding').value),
    logoFit: $('cfgLogoFit').value,
    fixedTitle: $('cfgFixedTitle').value.trim(),
    rotatingTexts: [
      $('cfgRotate1').value.trim(),
      $('cfgRotate2').value.trim(),
      $('cfgRotate3').value.trim()
    ],
    rotateSeconds: Number($('cfgRotateSeconds').value),
    eventLabel: $('cfgEventLabel').value.trim(),
    videoUrl: $('cfgVideoUrl').value.trim(),
    videoOpacity: Number($('cfgVideoOpacity').value),
    videoBrightness: Number($('cfgVideoBrightness').value),
    overlayColor: $('cfgOverlayColor').value,
    overlayOpacity: Number($('cfgOverlayOpacity').value),
    accentColor: $('cfgAccentColor').value,
    fxIntensity: Number($('cfgFxIntensity').value),
    preloaderDuration: Number($('cfgPreloaderDuration').value),
    fullscreenOnStart: $('cfgFullscreenOnStart').checked,
    avatarEnabled: $('cfgAvatarEnabled').checked,
    avatarWebmUrl: $('cfgAvatarWebmUrl').value.trim(),
    avatarAltUrl: $('cfgAvatarAltUrl').value.trim(),
    avatarFallbackUrl: $('cfgAvatarFallbackUrl').value.trim(),
    avatarScreenX: Number($('cfgAvatarScreenX').value),
    avatarScreenY: Number($('cfgAvatarScreenY').value),
    avatarWidth: Number($('cfgAvatarWidth').value),
    avatarHeight: Number($('cfgAvatarHeight').value),
    avatarOffsetX: Number($('cfgAvatarOffsetX').value),
    avatarOffsetY: Number($('cfgAvatarOffsetY').value),
    avatarScale: Number($('cfgAvatarScale').value),
    avatarRotation: Number($('cfgAvatarRotation').value),
    avatarFlipX: $('cfgAvatarFlipX').checked,
    avatarOpacity: Number($('cfgAvatarOpacity').value),
    avatarGlow: Number($('cfgAvatarGlow').value),
    avatarPlaybackRate: Number($('cfgAvatarPlaybackRate').value),
    avatarZIndex: Number($('cfgAvatarZIndex').value),
    chatTitle: $('cfgChatTitle').value.trim(),
    embedCode: $('cfgEmbedCode').value,
    embedPresentation: {
      mode: $('cfgEmbedMode').value,
      showOuterPanel: $('cfgEmbedShowOuterPanel').checked,
      showHeader: $('cfgEmbedShowHeader').checked,
      fitMode: $('cfgEmbedFitMode').value,
      contentWidth: Number($('cfgEmbedContentWidth').value),
      contentHeight: Number($('cfgEmbedContentHeight').value),
      areaWidth: Number($('cfgEmbedAreaWidth').value),
      areaHeight: Number($('cfgEmbedAreaHeight').value),
      positionX: Number($('cfgEmbedPositionX').value),
      positionY: Number($('cfgEmbedPositionY').value),
      offsetX: Number($('cfgEmbedOffsetX').value),
      offsetY: Number($('cfgEmbedOffsetY').value),
      scale: Number($('cfgEmbedScale').value),
      scaleX: Number($('cfgEmbedScaleX').value),
      scaleY: Number($('cfgEmbedScaleY').value),
      transformOrigin: $('cfgEmbedTransformOrigin').value,
      overflowHidden: $('cfgEmbedOverflowHidden').checked,
      forceExpanded: $('cfgEmbedForceExpanded').checked,
      zIndex: Number($('cfgEmbedZIndex').value)
    },
    cloudProvider: $('cfgCloudProvider').value,
    supabaseUrl: $('cfgSupabaseUrl').value.trim(),
    supabaseAnonKey: $('cfgSupabaseAnonKey').value.trim(),
    boardId: $('cfgBoardId').value.trim() || 'alcaldia-principal'
  });
}

function updateControlOutputs() {
  if ($('cfgLogoWidthValue')) $('cfgLogoWidthValue').textContent = `${$('cfgLogoWidth').value} px`;
  if ($('cfgLogoHeightValue')) $('cfgLogoHeightValue').textContent = `${$('cfgLogoHeight').value} px`;
  if ($('cfgLogoPaddingValue')) $('cfgLogoPaddingValue').textContent = `${$('cfgLogoPadding').value} px`;
  if ($('cfgVideoOpacityValue')) $('cfgVideoOpacityValue').textContent = `${Math.round(Number($('cfgVideoOpacity').value) * 100)}%`;
  if ($('cfgVideoBrightnessValue')) $('cfgVideoBrightnessValue').textContent = `${Math.round(Number($('cfgVideoBrightness').value) * 100)}%`;
  if ($('cfgOverlayOpacityValue')) $('cfgOverlayOpacityValue').textContent = `${Math.round(Number($('cfgOverlayOpacity').value) * 100)}%`;
  if ($('cfgAvatarScreenXValue')) $('cfgAvatarScreenXValue').textContent = `${$('cfgAvatarScreenX').value}%`;
  if ($('cfgAvatarScreenYValue')) $('cfgAvatarScreenYValue').textContent = `${$('cfgAvatarScreenY').value}%`;
  if ($('cfgAvatarWidthValue')) $('cfgAvatarWidthValue').textContent = `${$('cfgAvatarWidth').value} px`;
  if ($('cfgAvatarHeightValue')) $('cfgAvatarHeightValue').textContent = `${$('cfgAvatarHeight').value} px`;
  if ($('cfgAvatarOffsetXValue')) $('cfgAvatarOffsetXValue').textContent = `${$('cfgAvatarOffsetX').value} px`;
  if ($('cfgAvatarOffsetYValue')) $('cfgAvatarOffsetYValue').textContent = `${$('cfgAvatarOffsetY').value} px`;
  if ($('cfgAvatarScaleValue')) $('cfgAvatarScaleValue').textContent = `${Math.round(Number($('cfgAvatarScale').value) * 100)}%`;
  if ($('cfgAvatarRotationValue')) $('cfgAvatarRotationValue').textContent = `${$('cfgAvatarRotation').value}°`;
  if ($('cfgAvatarOpacityValue')) $('cfgAvatarOpacityValue').textContent = `${Math.round(Number($('cfgAvatarOpacity').value) * 100)}%`;
  if ($('cfgAvatarGlowValue')) $('cfgAvatarGlowValue').textContent = `${Math.round(Number($('cfgAvatarGlow').value) * 100)}%`;
  if ($('cfgAvatarPlaybackRateValue')) $('cfgAvatarPlaybackRateValue').textContent = `${Math.round(Number($('cfgAvatarPlaybackRate').value) * 100)}%`;
  if ($('cfgAvatarZIndexValue')) $('cfgAvatarZIndexValue').textContent = $('cfgAvatarZIndex').value;
  if ($('cfgEmbedContentWidthValue')) $('cfgEmbedContentWidthValue').textContent = `${$('cfgEmbedContentWidth').value} px`;
  if ($('cfgEmbedContentHeightValue')) $('cfgEmbedContentHeightValue').textContent = `${$('cfgEmbedContentHeight').value} px`;
  if ($('cfgEmbedAreaWidthValue')) $('cfgEmbedAreaWidthValue').textContent = `${$('cfgEmbedAreaWidth').value} px`;
  if ($('cfgEmbedAreaHeightValue')) $('cfgEmbedAreaHeightValue').textContent = `${$('cfgEmbedAreaHeight').value} px`;
  if ($('cfgEmbedPositionXValue')) $('cfgEmbedPositionXValue').textContent = `${$('cfgEmbedPositionX').value}%`;
  if ($('cfgEmbedPositionYValue')) $('cfgEmbedPositionYValue').textContent = `${$('cfgEmbedPositionY').value}%`;
  if ($('cfgEmbedOffsetXValue')) $('cfgEmbedOffsetXValue').textContent = `${$('cfgEmbedOffsetX').value} px`;
  if ($('cfgEmbedOffsetYValue')) $('cfgEmbedOffsetYValue').textContent = `${$('cfgEmbedOffsetY').value} px`;
  if ($('cfgEmbedScaleValue')) $('cfgEmbedScaleValue').textContent = `${Math.round(Number($('cfgEmbedScale').value) * 100)}%`;
  if ($('cfgEmbedScaleXValue')) $('cfgEmbedScaleXValue').textContent = `${Math.round(Number($('cfgEmbedScaleX').value) * 100)}%`;
  if ($('cfgEmbedScaleYValue')) $('cfgEmbedScaleYValue').textContent = `${Math.round(Number($('cfgEmbedScaleY').value) * 100)}%`;
  if ($('cfgEmbedZIndexValue')) $('cfgEmbedZIndexValue').textContent = $('cfgEmbedZIndex').value;
}

function applyLogoPreview() {
  config.logoWidth = clamp(Number($('cfgLogoWidth').value) || 78, 42, 320);
  config.logoHeight = clamp(Number($('cfgLogoHeight').value) || 78, 42, 240);
  config.logoPadding = clamp(Number($('cfgLogoPadding').value) || 0, 0, 30);
  config.logoFit = ['contain', 'cover', 'fill'].includes($('cfgLogoFit').value) ? $('cfgLogoFit').value : 'contain';
  document.documentElement.style.setProperty('--logo-w', `${config.logoWidth}px`);
  document.documentElement.style.setProperty('--logo-h', `${config.logoHeight}px`);
  document.documentElement.style.setProperty('--logo-padding', `${config.logoPadding}px`);
  $('institutionLogo').style.objectFit = config.logoFit;
  updateControlOutputs();
}

function applyVideoAppearancePreview() {
  config.videoOpacity = clamp(Number($('cfgVideoOpacity').value) || 1, 0.1, 1);
  config.videoBrightness = clamp(Number($('cfgVideoBrightness').value) || 1, 0.4, 1.6);
  config.overlayColor = $('cfgOverlayColor').value;
  config.overlayOpacity = clamp(Number($('cfgOverlayOpacity').value) || 0, 0, 0.95);
  document.documentElement.style.setProperty('--video-opacity', config.videoOpacity);
  document.documentElement.style.setProperty('--video-brightness', config.videoBrightness);
  $('colorOverlay').style.background = config.overlayColor;
  $('colorOverlay').style.opacity = config.overlayOpacity;
  updateControlOutputs();
}

function applyAvatarPreview() {
  config.avatarEnabled = $('cfgAvatarEnabled').checked;
  config.avatarScreenX = clamp(Number($('cfgAvatarScreenX').value) || 0, 0, 100);
  config.avatarScreenY = clamp(Number($('cfgAvatarScreenY').value) || 0, 0, 100);
  config.avatarWidth = clamp(Number($('cfgAvatarWidth').value) || 300, 120, 900);
  config.avatarHeight = clamp(Number($('cfgAvatarHeight').value) || 480, 160, 1000);
  config.avatarOffsetX = clamp(Number($('cfgAvatarOffsetX').value) || 0, -600, 600);
  config.avatarOffsetY = clamp(Number($('cfgAvatarOffsetY').value) || 0, -500, 500);
  config.avatarScale = clamp(Number($('cfgAvatarScale').value) || 1, 0.25, 2.5);
  config.avatarRotation = clamp(Number($('cfgAvatarRotation').value) || 0, -180, 180);
  config.avatarFlipX = $('cfgAvatarFlipX').checked;
  config.avatarOpacity = clamp(Number($('cfgAvatarOpacity').value) || 1, 0.1, 1);
  config.avatarGlow = clamp(Number($('cfgAvatarGlow').value) || 0, 0, 1);
  config.avatarPlaybackRate = clamp(Number($('cfgAvatarPlaybackRate').value) || 1, 0.25, 2);
  config.avatarZIndex = clamp(Number($('cfgAvatarZIndex').value ?? 8), 0, 25);
  updateControlOutputs();
  updateAvatar(false);
}

function applyEmbedPreview({ rerender = false } = {}) {
  const current = getEmbedPresentation();
  config.embedPresentation = sanitizeConfig({
    ...config,
    embedPresentation: {
      ...current,
      mode: $('cfgEmbedMode').value,
      showOuterPanel: $('cfgEmbedShowOuterPanel').checked,
      showHeader: $('cfgEmbedShowHeader').checked,
      fitMode: $('cfgEmbedFitMode').value,
      contentWidth: Number($('cfgEmbedContentWidth').value),
      contentHeight: Number($('cfgEmbedContentHeight').value),
      areaWidth: Number($('cfgEmbedAreaWidth').value),
      areaHeight: Number($('cfgEmbedAreaHeight').value),
      positionX: Number($('cfgEmbedPositionX').value),
      positionY: Number($('cfgEmbedPositionY').value),
      offsetX: Number($('cfgEmbedOffsetX').value),
      offsetY: Number($('cfgEmbedOffsetY').value),
      scale: Number($('cfgEmbedScale').value),
      scaleX: Number($('cfgEmbedScaleX').value),
      scaleY: Number($('cfgEmbedScaleY').value),
      transformOrigin: $('cfgEmbedTransformOrigin').value,
      overflowHidden: $('cfgEmbedOverflowHidden').checked,
      forceExpanded: $('cfgEmbedForceExpanded').checked,
      zIndex: Number($('cfgEmbedZIndex').value)
    }
  }).embedPresentation;
  updateControlOutputs();
  if (rerender) {
    config.embedCode = $('cfgEmbedCode').value;
    updateEmbed();
  } else {
    applyEmbedPresentation();
  }
}

function resetEmbedPresentationControls() {
  const defaults = DEFAULT_CONFIG.embedPresentation;
  $('cfgEmbedMode').value = defaults.mode;
  $('cfgEmbedShowOuterPanel').checked = defaults.showOuterPanel;
  $('cfgEmbedShowHeader').checked = defaults.showHeader;
  $('cfgEmbedFitMode').value = defaults.fitMode;
  $('cfgEmbedContentWidth').value = defaults.contentWidth;
  $('cfgEmbedContentHeight').value = defaults.contentHeight;
  $('cfgEmbedAreaWidth').value = defaults.areaWidth;
  $('cfgEmbedAreaHeight').value = defaults.areaHeight;
  $('cfgEmbedPositionX').value = defaults.positionX;
  $('cfgEmbedPositionY').value = defaults.positionY;
  $('cfgEmbedOffsetX').value = defaults.offsetX;
  $('cfgEmbedOffsetY').value = defaults.offsetY;
  $('cfgEmbedScale').value = defaults.scale;
  $('cfgEmbedScaleX').value = defaults.scaleX;
  $('cfgEmbedScaleY').value = defaults.scaleY;
  $('cfgEmbedTransformOrigin').value = defaults.transformOrigin;
  $('cfgEmbedOverflowHidden').checked = defaults.overflowHidden;
  $('cfgEmbedForceExpanded').checked = defaults.forceExpanded;
  $('cfgEmbedZIndex').value = defaults.zIndex;
  applyEmbedPreview({ rerender: true });
}

function showToast(message) {
  clearTimeout(toastTimer);
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function exportJson() {
  readForm();
  const safeExport = { ...config, supabaseAnonKey: config.supabaseAnonKey ? '[REMOVED_FOR_SECURITY]' : '' };
  const blob = new Blob([JSON.stringify(safeExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `config-${config.boardId || 'evento'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function importJson(file) {
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed.supabaseAnonKey === '[REMOVED_FOR_SECURITY]') delete parsed.supabaseAnonKey;
    createLocalBackup('before-json-import');
    config = sanitizeConfig({ ...config, ...parsed });
    fillForm();
    applyConfig();
    saveLocalConfig({ backupReason: 'after-json-import' });
    showToast('JSON importado correctamente.');
  } catch (error) {
    showToast('El archivo JSON no es válido.');
  }
}

function setCloudSyncState(state, message, detail = '') {
  cloudStartupState = { state, message, detail };
  const badge = $('cloudSyncBadge');
  if (badge) {
    badge.dataset.state = state;
    const label = badge.querySelector('strong');
    if (label) label.textContent = message;
    badge.title = detail || message;
  }
  const status = $('cloudStatus');
  if (status) {
    status.dataset.state = state;
    status.textContent = detail ? `${message}. ${detail}` : message;
  }
}

function normalizeSupabaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getBootstrapCloudConfig() {
  const raw = window.IA_CLOUD_BOOTSTRAP || {};
  const supabaseUrl = normalizeSupabaseUrl(raw.supabaseUrl);
  const publishableKey = String(raw.supabasePublishableKey || raw.supabaseAnonKey || '').trim();
  const boardId = String(raw.boardId || '').trim();
  const table = String(raw.table || 'presentation_boards').trim() || 'presentation_boards';
  const timeoutMs = clamp(Number(raw.timeoutMs) || 12000, 3000, 30000);
  const placeholders = /PEGA_|TU_|XXXX|SUPABASE_URL|PUBLISHABLE_KEY/i;
  let validUrl = false;

  try {
    const parsed = new URL(supabaseUrl);
    validUrl = parsed.protocol === 'https:' && Boolean(parsed.hostname);
  } catch (_error) {
    validUrl = false;
  }

  const configured = raw.enabled === true
    && validUrl
    && publishableKey.length > 20
    && !placeholders.test(`${supabaseUrl} ${publishableKey} ${boardId}`)
    && boardId.length > 0;

  return {
    configured,
    enabled: raw.enabled === true,
    autoLoad: raw.autoLoad !== false,
    supabaseUrl,
    publishableKey,
    boardId,
    table,
    timeoutMs
  };
}

function getCloudConnection() {
  const bootstrap = getBootstrapCloudConfig();
  if (bootstrap.configured) {
    return {
      source: 'bootstrap',
      supabaseUrl: bootstrap.supabaseUrl,
      publishableKey: bootstrap.publishableKey,
      boardId: bootstrap.boardId,
      table: bootstrap.table,
      timeoutMs: bootstrap.timeoutMs
    };
  }

  return {
    source: 'panel',
    supabaseUrl: normalizeSupabaseUrl(config.supabaseUrl),
    publishableKey: String(config.supabaseAnonKey || '').trim(),
    boardId: String(config.boardId || '').trim(),
    table: 'presentation_boards',
    timeoutMs: 12000
  };
}

function applyCloudConnectionToConfig(connection) {
  if (!connection?.supabaseUrl || !connection?.publishableKey || !connection?.boardId) return;
  config.cloudProvider = 'supabase';
  config.supabaseUrl = connection.supabaseUrl;
  config.supabaseAnonKey = connection.publishableKey;
  config.boardId = connection.boardId;
}

function primeBootstrapConnection() {
  const bootstrap = getBootstrapCloudConfig();
  if (!bootstrap.configured) {
    setCloudSyncState(
      'warning',
      'NUBE: NO CONFIGURADA',
      'cloud-bootstrap.js no contiene una conexión pública válida.'
    );
    return false;
  }

  applyCloudConnectionToConfig({
    supabaseUrl: bootstrap.supabaseUrl,
    publishableKey: bootstrap.publishableKey,
    boardId: bootstrap.boardId
  });
  setCloudSyncState('loading', 'NUBE: CONECTANDO', `Pizarrón: ${bootstrap.boardId}`);
  return true;
}

function cloudFetch(input, init = {}) {
  return fetch(input, {
    ...init,
    cache: 'no-store'
  });
}

function getSupabaseClient() {
  if (!window.supabase?.createClient) throw new Error('No se cargó la librería de Supabase.');
  const connection = getCloudConnection();
  if (!connection.supabaseUrl || !connection.publishableKey || !connection.boardId) {
    throw new Error('La conexión automática de Supabase no está configurada.');
  }
  return {
    client: window.supabase.createClient(connection.supabaseUrl, connection.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: cloudFetch }
    }),
    connection
  };
}

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timeoutId));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readCloudRowWithClient(connection) {
  const { client } = getSupabaseClient();
  const { data, error } = await withTimeout(
    client
      .from(connection.table)
      .select('config,updated_at')
      .eq('board_id', connection.boardId)
      .limit(1)
      .maybeSingle(),
    connection.timeoutMs,
    'La consulta con supabase-js excedió el tiempo de espera.'
  );

  if (error) {
    const code = error.code ? ` [${error.code}]` : '';
    throw new Error(`supabase-js${code}: ${error.message || 'consulta rechazada'}`);
  }
  if (!data?.config) throw new Error(`No existe la fila "${connection.boardId}" o la política SELECT no permite leerla.`);
  return data;
}

async function readCloudRowWithRest(connection) {
  const endpoint = `${connection.supabaseUrl}/rest/v1/${encodeURIComponent(connection.table)}`
    + `?board_id=eq.${encodeURIComponent(connection.boardId)}`
    + '&select=config,updated_at&limit=1';

  const response = await withTimeout(
    fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        // Las claves sb_publishable_* son API keys, no JWT.
        // Deben viajar en el encabezado apikey y no como Bearer token.
        apikey: connection.publishableKey,
        Accept: 'application/json'
      }
    }),
    connection.timeoutMs,
    'La consulta REST excedió el tiempo de espera.'
  );

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`REST ${response.status}: ${body.slice(0, 280) || response.statusText}`);
  }

  let rows;
  try {
    rows = JSON.parse(body);
  } catch (_error) {
    throw new Error('Supabase devolvió una respuesta que no es JSON válido.');
  }

  if (!Array.isArray(rows) || !rows[0]?.config) {
    throw new Error(`La API no devolvió la fila "${connection.boardId}". Revisa board_id, GRANT SELECT y RLS.`);
  }
  return rows[0];
}

async function readCloudRow(connection) {
  const errors = [];
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await readCloudRowWithClient(connection);
    } catch (clientError) {
      errors.push(`Intento ${attempt} cliente: ${clientError.message}`);
      try {
        return await readCloudRowWithRest(connection);
      } catch (restError) {
        errors.push(`Intento ${attempt} REST: ${restError.message}`);
      }
    }
    if (attempt < 3) await delay(900 * attempt);
  }
  throw new Error(errors.join(' | '));
}

function mergeCloudConfiguration(data, connection) {
  createLocalBackup('before-automatic-cloud-load');
  config = sanitizeConfig({
    ...config,
    ...(data.config || {}),
    cloudProvider: 'supabase',
    supabaseUrl: connection.supabaseUrl,
    supabaseAnonKey: connection.publishableKey,
    boardId: connection.boardId
  });
  config.updatedAt = data.updated_at || config.updatedAt;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

async function autoLoadCloudConfig() {
  const bootstrap = getBootstrapCloudConfig();
  if (!bootstrap.configured || !bootstrap.autoLoad) {
    setCloudSyncState(
      'warning',
      'NUBE: NO CONFIGURADA',
      'La presentación continuará con la copia local.'
    );
    return { loaded: false, reason: 'bootstrap-not-configured' };
  }

  const connection = getCloudConnection();
  applyCloudConnectionToConfig(connection);

  const preloaderMessage = $('preloaderMessage');
  const preloaderSubMessage = $('preloaderSubMessage');
  if (preloaderMessage) preloaderMessage.textContent = 'Sincronizando configuración institucional...';
  if (preloaderSubMessage) preloaderSubMessage.textContent = `Consultando el pizarrón ${connection.boardId}.`;
  setCloudSyncState('loading', 'NUBE: CONECTANDO', `Pizarrón: ${connection.boardId}`);

  try {
    const data = await readCloudRow(connection);
    mergeCloudConfiguration(data, connection);

    if (preloaderMessage) preloaderMessage.textContent = 'Configuración institucional sincronizada.';
    if (preloaderSubMessage) preloaderSubMessage.textContent = 'Cargando la experiencia oficial del Consejo de Gobierno.';
    setCloudSyncState(
      'success',
      'NUBE: SINCRONIZADA',
      data.updated_at ? `Actualizada: ${new Date(data.updated_at).toLocaleString()}` : 'Configuración recibida correctamente.'
    );
    return { loaded: true, updatedAt: data.updated_at, source: connection.source };
  } catch (error) {
    console.error('Sincronización automática de Supabase fallida:', error);
    if (preloaderMessage) preloaderMessage.textContent = 'No fue posible sincronizar la nube.';
    if (preloaderSubMessage) preloaderSubMessage.textContent = 'Se utilizará la última configuración local disponible.';
    setCloudSyncState('error', 'NUBE: ERROR', error.message);
    return { loaded: false, reason: error.message };
  }
}

async function saveCloud() {
  readForm();
  const connection = getCloudConnection();
  applyCloudConnectionToConfig(connection);
  if (!connection.supabaseUrl || !connection.publishableKey || !connection.boardId) {
    return showToast('La conexión de Supabase no está configurada.');
  }
  const status = $('cloudStatus');
  try {
    status.textContent = 'Guardando configuración en la nube...';
    const { client } = getSupabaseClient();
    const cloudPayload = { ...config, supabaseAnonKey: '' };
    const { error } = await client
      .from(connection.table)
      .upsert(
        { board_id: connection.boardId, config: cloudPayload, updated_at: new Date().toISOString() },
        { onConflict: 'board_id' }
      );
    if (error) throw error;
    saveLocalConfig();
    setCloudSyncState('success', 'NUBE: GUARDADA', 'Configuración actualizada correctamente en Supabase.');
    showToast('Configuración guardada en la nube.');
  } catch (error) {
    console.error(error);
    setCloudSyncState('error', 'NUBE: ERROR', error.message);
    showToast('No se pudo guardar en la nube.');
  }
}

async function loadCloud() {
  readForm();
  const connection = getCloudConnection();
  applyCloudConnectionToConfig(connection);
  if (!connection.supabaseUrl || !connection.publishableKey || !connection.boardId) {
    return showToast('La conexión de Supabase no está configurada.');
  }
  try {
    setCloudSyncState('loading', 'NUBE: CARGANDO', `Pizarrón: ${connection.boardId}`);
    const data = await readCloudRow(connection);
    mergeCloudConfiguration(data, connection);
    fillForm();
    applyConfig();
    setCloudSyncState(
      'success',
      'NUBE: SINCRONIZADA',
      data.updated_at ? `Actualizada: ${new Date(data.updated_at).toLocaleString()}` : 'Configuración recibida correctamente.'
    );
    showToast('Configuración cargada desde la nube.');
  } catch (error) {
    console.error(error);
    setCloudSyncState('error', 'NUBE: ERROR', error.message);
    showToast('No se pudo cargar desde la nube.');
  }
}

function downloadCloudBootstrap() {
  readForm();
  const connection = getCloudConnection();
  if (!connection.supabaseUrl || !connection.publishableKey || !connection.boardId) {
    showToast('Completa la URL, clave pública y ID del pizarrón antes de generar el archivo.');
    return;
  }

  const content = `// Conexión pública de arranque para IA BOT ALCALDÍA DIGITAL.\n// La publishable key puede estar en el frontend cuando RLS está habilitado.\n// Nunca coloques aquí una secret key ni service_role.\nwindow.IA_CLOUD_BOOTSTRAP = Object.freeze(${JSON.stringify({
    enabled: true,
    autoLoad: true,
    supabaseUrl: connection.supabaseUrl,
    supabasePublishableKey: connection.publishableKey,
    boardId: connection.boardId,
    table: connection.table || 'presentation_boards',
    timeoutMs: 12000
  }, null, 2)});\n`;

  const blob = new Blob([content], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'cloud-bootstrap.js';
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('Archivo de conexión automática generado. Súbelo a la raíz de GitHub.');
}

function isEffectivelyFullscreen() {
  if (document.fullscreenElement) return true;
  if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
  const heightGap = Math.abs((window.screen?.height || 0) - window.innerHeight);
  const widthGap = Math.abs((window.screen?.width || 0) - window.innerWidth);
  return heightGap <= 4 && widthGap <= 4;
}

function updateFullscreenStatus() {
  const status = $('fullscreenStatus');
  if (!status) return;
  status.textContent = isEffectivelyFullscreen()
    ? 'Estado: modo auditorio en pantalla completa.'
    : 'Estado: modo ventana. Puede activarse manualmente o mediante el lanzador de kiosco.';
}

async function requestAppFullscreen({ silent = false } = {}) {
  if (isEffectivelyFullscreen()) {
    updateFullscreenStatus();
    return true;
  }
  const root = document.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
  if (!request) {
    if (!silent) showToast('Este navegador no expone la API de pantalla completa. Usa el lanzador de modo auditorio.');
    updateFullscreenStatus();
    return false;
  }
  try {
    await request.call(root, { navigationUI: 'hide' });
    updateFullscreenStatus();
    return true;
  } catch (error) {
    console.info('La pantalla completa requiere una interacción del usuario:', error);
    if (!silent) showToast('El navegador requiere un clic para activar la pantalla completa.');
    updateFullscreenStatus();
    return false;
  }
}

async function exitAppFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
  } catch (error) {
    console.warn('No se pudo salir de pantalla completa:', error);
  }
  updateFullscreenStatus();
}

function finishBootSequence() {
  const preloader = $('preloader');
  preloader.classList.add('done');
  setTimeout(() => {
    preloader.classList.remove('active');
    preloader.setAttribute('aria-hidden', 'true');
    if (config.videoUrl) tryPlayVideo($('backgroundVideo'));
    if (config.avatarEnabled) tryPlayAvatar();
  }, 800);
}

function decodePassword() {
  return String.fromCharCode(52, 76, 67, 52, 76, 68, 49, 52, 48, 82, 49, 78, 48, 67, 48);
}

function openAdmin() {
  fillForm();
  $('adminPanel').classList.add('is-open');
  $('adminPanel').setAttribute('aria-hidden', 'false');
}

function closeAdmin() {
  $('adminPanel').classList.remove('is-open');
  $('adminPanel').setAttribute('aria-hidden', 'true');
}

function showAccessGate() {
  const gate = $('accessGate');
  const input = $('accessPassword');
  const status = $('accessStatus');
  const lock = $('lockVisual');

  input.value = '';
  status.textContent = 'Entorno cifrado listo para validación.';
  status.className = 'gate-status';
  lock.classList.remove('is-open', 'is-error');
  gate.classList.add('show');
  gate.setAttribute('aria-hidden', 'false');
  setTimeout(() => input.focus(), 180);
}

function closeAccessGate() {
  const gate = $('accessGate');
  gate.classList.remove('show', 'is-unlocking');
  gate.setAttribute('aria-hidden', 'true');
}

function unlockExperience() {
  const gate = $('accessGate');
  const status = $('accessStatus');
  const lock = $('lockVisual');

  adminAccessGranted = true;
  status.textContent = 'Acceso autorizado. Abriendo control operativo...';
  status.className = 'gate-status success';
  lock.classList.add('is-open');
  gate.classList.add('is-unlocking');

  setTimeout(() => {
    closeAccessGate();
    openAdmin();
  }, 1050);
}

function validateAccess() {
  const input = $('accessPassword');
  const status = $('accessStatus');
  const lock = $('lockVisual');
  if (input.value.trim() === decodePassword()) {
    unlockExperience();
    return;
  }
  status.textContent = 'Clave inválida. Validación de seguridad rechazada.';
  status.className = 'gate-status error';
  lock.classList.remove('is-open');
  lock.classList.add('is-error');
  setTimeout(() => lock.classList.remove('is-error'), 520);
  input.select();
}

function runBootSequence() {
  const preloader = $('preloader');
  const msg = $('preloaderMessage');
  const sub = $('preloaderSubMessage');
  const bar = $('preloaderBar');
  const percent = $('preloaderPercent');
  const status = $('preloaderStatus');
  const duration = config.preloaderDuration * 1000;
  const start = performance.now();
  let currentMessageIndex = -1;

  function frame(now) {
    const elapsed = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    const progressPercent = Math.round(progress * 100);
    const messageIndex = Math.min(PRELOADER_MESSAGES.length - 1, Math.floor(progress * PRELOADER_MESSAGES.length));

    if (messageIndex !== currentMessageIndex) {
      currentMessageIndex = messageIndex;
      msg.textContent = PRELOADER_MESSAGES[messageIndex];
      sub.textContent = PRELOADER_MESSAGES[Math.min(PRELOADER_MESSAGES.length - 1, messageIndex + 1)] || 'Preparando entorno institucional inteligente...';
    }

    bar.style.width = `${progressPercent}%`;
    percent.textContent = `${progressPercent}%`;
    status.textContent = progressPercent < 100 ? 'BOOTING' : 'READY';

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      setTimeout(async () => {
        if (config.fullscreenOnStart && !isEffectivelyFullscreen()) {
          await requestAppFullscreen({ silent: true });
        }
        if (config.fullscreenOnStart && !isEffectivelyFullscreen()) {
          $('fullscreenLaunch').hidden = false;
          msg.textContent = 'Sistema listo para entrar al futuro.';
          sub.textContent = 'Active el modo auditorio para iniciar la experiencia institucional.';
        } else {
          finishBootSequence();
        }
      }, 300);
    }
  }
  requestAnimationFrame(frame);
}

$('adminToggle').addEventListener('click', () => {
  if (adminAccessGranted) {
    openAdmin();
  } else {
    showAccessGate();
  }
});
$('adminClose').addEventListener('click', closeAdmin);
$('previewChanges').addEventListener('click', () => {
  readForm();
  applyConfig();
  showToast('Vista previa aplicada.');
});
$('saveLocal').addEventListener('click', () => {
  readForm();
  applyConfig();
  saveLocalConfig();
});
$('exportJson').addEventListener('click', exportJson);
$('importJson').addEventListener('change', (event) => event.target.files[0] && importJson(event.target.files[0]));
$('resetConfig').addEventListener('click', () => {
  if (!confirm('¿Restablecer todos los datos de esta pizarra?')) return;
  config = sanitizeConfig(DEFAULT_CONFIG);
  fillForm();
  applyConfig();
  saveLocalConfig();
});
$('cloudSave').addEventListener('click', saveCloud);
$('cloudLoad').addEventListener('click', loadCloud);
$('downloadCloudBootstrap').addEventListener('click', downloadCloudBootstrap);
$('accessSubmit').addEventListener('click', validateAccess);
$('accessClose').addEventListener('click', closeAccessGate);
$('accessPassword').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') validateAccess();
});

$('launchFullscreen').addEventListener('click', async () => {
  await requestAppFullscreen({ silent: false });
  $('fullscreenLaunch').hidden = true;
  finishBootSequence();
});
$('enterFullscreen').addEventListener('click', () => requestAppFullscreen({ silent: false }));
$('exitFullscreen').addEventListener('click', exitAppFullscreen);
$('cfgFullscreenOnStart').addEventListener('change', () => {
  config.fullscreenOnStart = $('cfgFullscreenOnStart').checked;
});
$('testAvatar').addEventListener('click', () => {
  readForm();
  updateAvatar(true);
});
$('centerAvatar').addEventListener('click', () => {
  $('cfgAvatarScreenX').value = 50;
  $('cfgAvatarScreenY').value = 55;
  $('cfgAvatarOffsetX').value = 0;
  $('cfgAvatarOffsetY').value = 0;
  applyAvatarPreview();
});
['cfgAvatarWebmUrl', 'cfgAvatarAltUrl', 'cfgAvatarFallbackUrl'].forEach((id) => {
  $(id).addEventListener('change', () => {
    readForm();
    updateAvatar(true);
  });
});
document.addEventListener('fullscreenchange', () => { updateFullscreenStatus(); applyEmbedPresentation(); });
document.addEventListener('webkitfullscreenchange', () => { updateFullscreenStatus(); applyEmbedPresentation(); });
window.addEventListener('resize', () => applyEmbedPresentation(), { passive: true });

document.querySelectorAll('[data-logo-live]').forEach((control) => {
  control.addEventListener('input', applyLogoPreview);
  control.addEventListener('change', applyLogoPreview);
});
document.querySelectorAll('[data-video-live]').forEach((control) => {
  control.addEventListener('input', applyVideoAppearancePreview);
  control.addEventListener('change', applyVideoAppearancePreview);
});
document.querySelectorAll('[data-avatar-live]').forEach((control) => {
  control.addEventListener('input', applyAvatarPreview);
  control.addEventListener('change', applyAvatarPreview);
});
document.querySelectorAll('[data-embed-live]').forEach((control) => {
  control.addEventListener('input', () => applyEmbedPreview());
  control.addEventListener('change', () => applyEmbedPreview({ rerender: control.id === 'cfgEmbedForceExpanded' }));
});
$('testEmbed').addEventListener('click', () => applyEmbedPreview({ rerender: true }));
$('centerEmbed').addEventListener('click', () => {
  $('cfgEmbedPositionX').value = 50;
  $('cfgEmbedPositionY').value = 50;
  $('cfgEmbedOffsetX').value = 0;
  $('cfgEmbedOffsetY').value = 0;
  applyEmbedPreview();
});
$('containEmbed').addEventListener('click', () => {
  $('cfgEmbedFitMode').value = 'contain';
  applyEmbedPreview();
});
$('coverEmbed').addEventListener('click', () => {
  $('cfgEmbedFitMode').value = 'cover';
  applyEmbedPreview();
});
$('stretchEmbed').addEventListener('click', () => {
  $('cfgEmbedFitMode').value = 'stretch';
  applyEmbedPreview();
});
$('resetEmbedPresentation').addEventListener('click', resetEmbedPresentationControls);
$('testVideo').addEventListener('click', () => {
  readForm();
  applyVideoAppearancePreview();
  updateVideo(true);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { closeAdmin(); closeAccessGate(); }
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') $('adminToggle').click();
});

function armFullscreenOnFirstInteraction() {
  if (!config.fullscreenOnStart || isEffectivelyFullscreen()) return;
  const attempt = async () => {
    await requestAppFullscreen({ silent: true });
    cleanup();
  };
  const cleanup = () => {
    window.removeEventListener('pointerdown', attempt, true);
    window.removeEventListener('keydown', attempt, true);
    window.removeEventListener('touchstart', attempt, true);
  };
  window.addEventListener('pointerdown', attempt, true);
  window.addEventListener('keydown', attempt, true);
  window.addEventListener('touchstart', attempt, true);
}

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  let reloadingForNewWorker = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadingForNewWorker) return;
    reloadingForNewWorker = true;
    location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js?v=1.2.5', { updateViaCache: 'none' })
      .then(async (registration) => {
        if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
        await registration.update();
      })
      .catch((error) => console.warn('PWA no registrada:', error));
  });
}

async function initializeApp() {
  updateClock();
  setInterval(updateClock, 1000);

  primeBootstrapConnection();
  await autoLoadCloudConfig();

  fillForm();
  updateControlOutputs();
  applyConfig();
  armFullscreenOnFirstInteraction();
  if (config.fullscreenOnStart) requestAppFullscreen({ silent: true });
  runBootSequence();
}

initializeApp().catch((error) => {
  console.error('Error durante la inicialización:', error);
  fillForm();
  updateControlOutputs();
  applyConfig();
  runBootSequence();
});
