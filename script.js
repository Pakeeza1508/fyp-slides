/* ==========================================================================
   ZARKHEZ AI — Presentation Controller Script
   Handles: Slide Navigation, Leaflet Satellite Map, 3D Hyperspectral Cube,
            Maas-Hoffman Simulator, Module Inspector & Bilingual Toggle.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  let currentSlide = 1;
  const totalSlides = 12;
  let leafletMap = null;
  let mapInitialized = false;

  // DOM Elements
  const slides = document.querySelectorAll('.slide');
  const slideCounter = document.getElementById('slide-counter');
  const telemetrySlideNum = document.getElementById('telemetry-slide-num');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnMenu = document.getElementById('btn-menu');
  const btnCloseMenu = document.getElementById('btn-close-menu');
  const menuModal = document.getElementById('slide-menu-modal');
  const btnNotes = document.getElementById('btn-notes');
  const btnCloseNotes = document.getElementById('btn-close-notes');
  const notesDrawer = document.getElementById('presenter-notes-drawer');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // Slide Switcher Function
  function goToSlide(target) {
    if (target < 1 || target > totalSlides) return;

    slides.forEach(s => s.classList.remove('active'));
    const nextSlideEl = document.querySelector(`.slide[data-slide="${target}"]`);
    if (nextSlideEl) nextSlideEl.classList.add('active');

    currentSlide = target;
    slideCounter.innerHTML = `${String(currentSlide).padStart(2, '0')} <span>/ ${totalSlides}</span>`;
    telemetrySlideNum.innerText = `SLIDE ${String(currentSlide).padStart(2, '0')}`;
    progressBarFill.style.width = `${(currentSlide / totalSlides) * 100}%`;

    // Highlight Menu Item
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.toggle('active', parseInt(item.dataset.slide) === currentSlide);
    });

    // Update Speaker Notes for Current Slide
    updateSpeakerNotes(currentSlide);

    // Initialize or resize Leaflet Map if moving to Slide 3
    if (currentSlide === 3) {
      setTimeout(() => {
        if (!mapInitialized) {
          initLeafletMap();
        } else if (leafletMap) {
          leafletMap.invalidateSize();
        }
      }, 250);
    }
  }

  // Navigation Event Listeners
  btnNext.addEventListener('click', () => goToSlide(currentSlide + 1));
  btnPrev.addEventListener('click', () => goToSlide(currentSlide - 1));

  document.getElementById('btn-hero-start')?.addEventListener('click', () => goToSlide(2));
  document.getElementById('btn-hero-arch')?.addEventListener('click', () => goToSlide(8));
  document.getElementById('btn-restart-pres')?.addEventListener('click', () => goToSlide(1));

  // Keyboard Shortcuts
  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'Space') {
      goToSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft') {
      goToSlide(currentSlide - 1);
    } else if (e.key.toLowerCase() === 'm') {
      menuModal.classList.toggle('open');
    } else if (e.key.toLowerCase() === 'n') {
      notesDrawer.classList.toggle('open');
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key === 'Escape') {
      menuModal.classList.remove('open');
      notesDrawer.classList.remove('open');
    }
  });

  // Modal Handlers
  btnMenu.addEventListener('click', () => menuModal.classList.add('open'));
  btnCloseMenu.addEventListener('click', () => menuModal.classList.remove('open'));
  btnNotes.addEventListener('click', () => notesDrawer.classList.toggle('open'));
  btnCloseNotes.addEventListener('click', () => notesDrawer.classList.remove('open'));

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      goToSlide(parseInt(item.dataset.slide));
      menuModal.classList.remove('open');
    });
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  btnFullscreen.addEventListener('click', toggleFullscreen);

  // =========================================================================
  // LIVE LEAFLET SATELLITE MAP (SLIDE 03)
  // =========================================================================
  function initLeafletMap() {
    const mapContainer = document.getElementById('live-leaflet-map');
    if (!mapContainer || mapInitialized) return;

    // Centered at Bahawalpur Division (29.35°N, 71.69°E)
    leafletMap = L.map('live-leaflet-map').setView([29.35, 71.69], 8);

    // High-Resolution ESRI World Imagery Basemap
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; NASA, USGS, USDA'
    }).addTo(leafletMap);

    // Training District 1: Bahawalpur Central
    L.circleMarker([29.3957, 71.6833], {
      radius: 11,
      color: '#d97706',
      fillColor: '#f59e0b',
      fillOpacity: 0.85
    }).addTo(leafletMap)
      .bindPopup("<b>Bahawalpur Central (Training Zone)</b><br>Intensive wheat-cotton rotation.<br>High tubewell dependence; secondary root-zone salinity.");

    // Training District 2: Rahim Yar Khan
    L.circleMarker([28.4212, 70.2989], {
      radius: 10,
      color: '#d97706',
      fillColor: '#f59e0b',
      fillOpacity: 0.85
    }).addTo(leafletMap)
      .bindPopup("<b>Rahim Yar Khan (Training Zone)</b><br>Sugarcane and cotton belt.<br>Tubewell water ECw ranges between 0.8–5.2 dS/m.");

    // Training District 3: Bahawalnagar
    L.circleMarker([29.9986, 73.2536], {
      radius: 10,
      color: '#d97706',
      fillColor: '#f59e0b',
      fillOpacity: 0.85
    }).addTo(leafletMap)
      .bindPopup("<b>Bahawalnagar (Training Zone)</b><br>Eastern Sadiqia canal command.<br>Severe tail-end water constraints and white crust formation.");

    // INDEPENDENT EXTERNAL HOLDOUT: Lodhran District
    L.circleMarker([29.5339, 71.6331], {
      radius: 13,
      color: '#ef4444',
      fillColor: '#b91c1c',
      fillOpacity: 0.95
    }).addTo(leafletMap)
      .bindPopup("<b style='color:#ef4444;'>Lodhran District (INDEPENDENT HOLDOUT)</b><br><strong>Zero Lodhran data used in training!</strong><br>Reserved strictly to test out-of-domain spatial generalization.")
      .openPopup();

    // Cholistan Desert Transition Zone
    L.circleMarker([28.55, 71.85], {
      radius: 12,
      color: '#eab308',
      fillColor: '#eab308',
      fillOpacity: 0.5
    }).addTo(leafletMap)
      .bindPopup("<b>Cholistan Desert Margin</b><br>Hyper-arid sandy terrain, high evaporative deficit, hyper-saline groundwater.");

    mapInitialized = true;
  }

  // =========================================================================
  // 3D HYPERSPECTRAL DATA CUBE (THREE.JS - SLIDE 05)
  // =========================================================================
  function initHyperspectralCube() {
    const container = document.getElementById('hyperspectral-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(3.2, 2.8, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    // Warm Soil, Sand & Crop Spectral Palette
    const bandColors = [0x65a30d, 0x84cc16, 0xe0a96d, 0xd97706, 0xb45309, 0xc2410c, 0x78350f];
    const numSlices = 7;

    for (let i = 0; i < numSlices; i++) {
      const geom = new THREE.BoxGeometry(1.9, 1.9, 0.07);
      const edges = new THREE.EdgesGeometry(geom);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: bandColors[i], linewidth: 2 }));
      const mat = new THREE.MeshBasicMaterial({ color: bandColors[i], transparent: true, opacity: 0.28 });
      const sliceMesh = new THREE.Mesh(geom, mat);
      sliceMesh.add(line);
      sliceMesh.position.z = (i - numSlices / 2) * 0.32;
      cubeGroup.add(sliceMesh);
    }
    scene.add(cubeGroup);

    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    container.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mousemove', e => {
      if (!isDragging) return;
      cubeGroup.rotation.y += (e.clientX - prevMouse.x) * 0.01;
      cubeGroup.rotation.x += (e.clientY - prevMouse.y) * 0.01;
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    function animate() {
      requestAnimationFrame(animate);
      if (!isDragging) cubeGroup.rotation.y += 0.004;
      renderer.render(scene, camera);
    }
    animate();

    // Band Scrubber Listener
    const bandSlider = document.getElementById('spectral-band-slider');
    const bandWlReadout = document.getElementById('band-readout-wl');
    const bandNameReadout = document.getElementById('band-readout-name');

    bandSlider?.addEventListener('input', e => {
      const wl = parseInt(e.target.value);
      bandWlReadout.innerText = `${wl} nm`;
      if (wl < 700) {
        bandNameReadout.innerText = `Visible Spectrum (${wl} nm): Chlorophyll absorption trough`;
      } else if (wl <= 1300) {
        bandNameReadout.innerText = `Near-Infrared NIR (${wl} nm): Canopy mesophyll internal scattering plateau`;
      } else {
        bandNameReadout.innerText = `Shortwave Infrared SWIR (${wl} nm): Saline mineral absorption (Halite/Gypsum/Soil)`;
      }
    });
  }

  // =========================================================================
  // MAAS-HOFFMAN INTERACTIVE EQUATION (SLIDE 09)
  // =========================================================================
  const salinitySlider = document.getElementById('salinity-ece-slider');
  const salinityValText = document.getElementById('salinity-slider-val');
  const salinityClassBadge = document.getElementById('salinity-class-badge');
  const wheatLossText = document.getElementById('wheat-loss-val');
  const cottonLossText = document.getElementById('cotton-loss-val');

  salinitySlider?.addEventListener('input', e => {
    const ece = parseFloat(e.target.value);
    salinityValText.innerText = `${ece.toFixed(1)} dS/m`;

    // Categorization
    if (ece < 2.0) {
      salinityClassBadge.innerText = "Non-Saline (<2 dS/m): Normal agricultural production";
      salinityClassBadge.style.color = "var(--crop-light)";
    } else if (ece <= 4.0) {
      salinityClassBadge.innerText = "Slightly Saline (2–4 dS/m): Sensitive pulse crops restricted";
      salinityClassBadge.style.color = "var(--sand-dune)";
    } else if (ece <= 8.0) {
      salinityClassBadge.innerText = "Moderately Saline (4–8 dS/m): Significant yield depression across wheat";
      salinityClassBadge.style.color = "var(--sand-amber)";
    } else {
      salinityClassBadge.innerText = "Highly Saline (>8 dS/m): Only salt-tolerant halophytes survive";
      salinityClassBadge.style.color = "#f87171";
    }

    // Maas-Hoffman equation: Y = 100 - b(ECe - a)
    // Wheat: threshold a = 6.0 dS/m, slope b = 7.1%
    let wheatLoss = 0;
    if (ece > 6.0) wheatLoss = (ece - 6.0) * 7.1;
    wheatLoss = Math.min(100, wheatLoss);
    wheatLossText.innerText = `-${wheatLoss.toFixed(1)}% potential`;

    // Cotton: threshold a = 7.7 dS/m, slope b = 5.2%
    let cottonLoss = 0;
    if (ece > 7.7) cottonLoss = (ece - 7.7) * 5.2;
    cottonLoss = Math.min(100, cottonLoss);
    cottonLossText.innerText = `-${cottonLoss.toFixed(1)}% potential`;
  });

  // =========================================================================
  // MODULES INSPECTOR (SLIDE 08)
  // =========================================================================
  const moduleData = {
    M1: {
      tag: "MODULE M1",
      name: "Soil Salinity Assessment & Field Mapping",
      scope: "Continuous spaceborne soil electrical conductivity (ECe) prediction and spatial hazard zonation.",
      input: "NASA EMIT L2A surface reflectance, Sentinel-2 SWIR/RedEdge, DEM terrain slope",
      meth: "1D-CNN (spectral band reduction) + XGBoost / Random Forest Regressor",
      output: "Continuous soil ECe (dS/m) raster & categorical risk classes (Normal, Slight, Moderate, High)",
      deliv: "Detects subsurface salinization before visual white crusting destroys the crop."
    },
    M2: {
      tag: "MODULE M2",
      name: "Crop and Seasonal Analysis",
      scope: "Multi-temporal phenological trajectory analysis and crop calendar synchronization.",
      input: "Sentinel-2 time series (NDVI, SAVI, NDRE), GDD accumulation curves",
      meth: "Savitzky-Golay filtering + double logistic phenology modeling",
      output: "Growth stage milestones (Tillering, Anthesis, Maturity) & vigor baselines",
      deliv: "Decouples natural end-of-season crop drying from premature salt-induced wilting."
    },
    M3: {
      tag: "MODULE M3",
      name: "Weather & Climate Intelligence",
      scope: "Agro-meteorological modeling and evaporative demand estimation.",
      input: "ERA5-Land reanalysis + PMD station records (Tmax, Tmin, Radiation, Wind)",
      meth: "FAO-56 Penman-Monteith reference evapotranspiration (ETo) computation",
      output: "Daily ETo surfaces, heat stress alerts, and vapor pressure deficit (VPD)",
      deliv: "Provides the climatic evaporative driver governing soil capillary salt accumulation."
    },
    M4: {
      tag: "MODULE M4",
      name: "Crop Yield Prediction & Explainability",
      scope: "Multi-feature pre-harvest yield modeling and transparent SHAP factor attribution.",
      input: "EMIT spectral features, multi-stage VIs, soil ECe, seasonal rainfall, cumulative GDD",
      meth: "Stacked Ensemble (LightGBM + Random Forest + GBR meta-learner) + TreeSHAP",
      output: "Field-level yield estimates (Maunds/Acre) + SHAP factor contribution breakdown",
      deliv: "Converts black-box predictions into transparent agronomic reasons for agronomists."
    },
    M5: {
      tag: "MODULE M5",
      name: "Smart Irrigation & Resource Advisory",
      scope: "Water requirement scheduling, deficit irrigation bounds, and tubewell blending safety.",
      input: "Crop coefficients (Kc), soil texture, root depth, groundwater ECw, canal schedules",
      meth: "FAO-56 root-zone soil water balance + leaching fraction optimization equations",
      output: "Optimal irrigation depth (mm), pumping hours, and safe canal:tubewell blending ratio",
      deliv: "Prevents toxic tubewell water application and reduces diesel/electric pumping costs."
    },
    M6: {
      tag: "MODULE M6",
      name: "Farmer Advisory & Android Application",
      scope: "Smallholder-facing mobile application delivering actionable guidance in Urdu and English.",
      input: "GPS field coordinates, cadastral boundaries, M1–M5 backend API endpoints",
      meth: "Native Android (Kotlin / Jetpack Compose) + local SQLite caching layer",
      output: "Color-coded risk indicators, vernacular voice advisories, and offline field cards",
      deliv: "Overcomes rural digital divide and low literacy barriers for Southern Punjab farmers."
    }
  };

  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.module-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const m = moduleData[card.dataset.module];
      if (m) {
        document.getElementById('mod-detail-tag').innerText = m.tag;
        document.getElementById('mod-detail-name').innerText = m.name;
        document.getElementById('mod-detail-scope').innerText = m.scope;
        document.getElementById('mod-detail-input').innerText = m.input;
        document.getElementById('mod-detail-meth').innerText = m.meth;
        document.getElementById('mod-detail-output').innerText = m.output;
        document.getElementById('mod-detail-deliv').innerText = m.deliv;
      }
    });
  });

  // =========================================================================
  // URDU / ENGLISH BILINGUAL TOGGLE (SLIDE 10)
  // =========================================================================
  let isUrdu = true;
  const btnLang = document.getElementById('btn-phone-lang');
  btnLang?.addEventListener('click', () => {
    isUrdu = !isUrdu;
    if (isUrdu) {
      document.getElementById('phone-app-title').innerText = "زرخیز AI ایڈوائزری";
      document.getElementById('phone-field-loc').innerText = "چک 12/BC، بہاولپور";
      document.getElementById('phone-crop-label').innerText = "زیرِ کاشت: گندم (ربیع فصل)";
      document.getElementById('phone-ece-label').innerText = "زمین کی شوریدگی کی کیفیت:";
      document.getElementById('phone-ece-status').innerText = "معتدل شورزدہ (Moderate Salt)";
      document.getElementById('phone-yield-label').innerText = "تخمینہ پیداوار: 31 من فی ایکڑ";
      document.getElementById('phone-advisory-title').innerText = "زرعی مشورہ (Advisory):";
      document.getElementById('phone-advisory-text').innerText = "زمین میں نمکیات کی زیادتی پائی گئی ہے۔ اگلی آبپاشی میں ٹیوب ویل کے کھارے پانی کے بجائے نہری پانی کا استعمال کریں تاکہ نمک پودوں کی جڑوں سے نیچے نکل جائے۔";
      document.getElementById('phone-guidance-1').innerText = "• یوریا کھاد ڈالنے سے پہلے نہری پانی دیں";
      document.getElementById('phone-guidance-2').innerText = "• لیچنگ فریکشن 15٪ تک برقرار رکھیں";
    } else {
      document.getElementById('phone-app-title').innerText = "ZARKHEZ AI Advisory";
      document.getElementById('phone-field-loc').innerText = "Chak 12/BC, Bahawalpur";
      document.getElementById('phone-crop-label').innerText = "Target Crop: Wheat (Rabi)";
      document.getElementById('phone-ece-label').innerText = "Soil Salinity Status:";
      document.getElementById('phone-ece-status').innerText = "Moderate Risk (ECe 4.8 dS/m)";
      document.getElementById('phone-yield-label').innerText = "Yield Forecast: 31 Maunds/Acre";
      document.getElementById('phone-advisory-title').innerText = "Agronomic Action:";
      document.getElementById('phone-advisory-text').innerText = "Root-zone salinity threshold exceeded. Avoid saline tubewell pumping. Utilize scheduled canal turn to leach salts below root zone.";
      document.getElementById('phone-guidance-1').innerText = "• Apply 15% leaching fraction";
      document.getElementById('phone-guidance-2').innerText = "• Blend tubewell:canal at 1:2 ratio";
    }
  });

  // =========================================================================
  // SPEAKER NOTES DATA
  // =========================================================================
  const speakerNotes = {
    1: {
      title: "Slide 1: Title & Candidacy",
      points: [
        "Welcome the committee: Minhal Zubair, Pakeeza Khalid, and Maryam Jamil under the supervision of Dr. Mariam Nosheen.",
        "Emphasize our focus on Bahawalpur Division: tackling soil salinity and erratic water.",
        "State our guiding motto: Maximum Yield from Minimum Inputs."
      ],
      tip: "Be ready to confirm that Lodhran is held out completely to evaluate true spatial generalization."
    },
    2: {
      title: "Slide 2: Secondary Salinization",
      points: [
        "Explain osmotic crop stress: high salts mimic severe drought even in moist soil.",
        "Highlight that 50%+ of sampled tubewells in Bahawalpur pump unfit water.",
        "Frame the research gap: lack of open hyperspectral sensing, spatial leakage in past models, and no farmer tool."
      ],
      tip: "Define ECe (soil paste extract) vs ECw (water salinity) clearly."
    },
    3: {
      title: "Slide 3: Live Satellite Map",
      points: [
        "Demonstrate the interactive map: Bahawalpur, Bahawalnagar, and Rahim Yar Khan along the canal commands.",
        "Click on Lodhran to show the committee our independent spatial holdout boundary.",
        "Point out the southern Cholistan desert border and its intense heat advection."
      ],
      tip: "If asked why 3 districts: they represent the core Southern Punjab cotton-wheat belt facing severe canal tail-end constraints."
    },
    4: {
      title: "Slide 4: Satellite Data Feeds",
      points: [
        "Explain the synergy: NASA EMIT provides 285 narrow contiguous channels for mineralogy; Sentinel-2 provides 5-day revisit for vegetative phenology.",
        "Emphasize: 100% open-access data, zero farmer hardware needed."
      ],
      tip: "Reiterate that EMIT L2A is surface reflectance, eliminating the need to run Sen2Cor on NASA data."
    },
    5: {
      title: "Slide 5: 3D Hyperspectral Cube",
      points: [
        "Showcase how continuous bands differentiate subtle salt crust features at 1.4, 1.9, and 2.2 μm from dry sand.",
        "Drag the slider across visible, NIR, and SWIR wavelengths to explain mesophyll vs mineral absorption."
      ],
      tip: "Multispectral satellites only have 8-12 wide bands, which cannot isolate diagnostic mineral crystal absorption."
    },
    6: {
      title: "Slide 6: Four-Stage Preprocessing",
      points: [
        "Walk through the 4 stages: Quality masking, 30m grid harmonization, phenology compositing, and spatial block partitioning.",
        "Explain spatial autocorrelation and why random K-fold splits cause data leakage in GIS AI."
      ],
      tip: "Citing Tobler's First Law of Geography proves strong remote sensing literacy to the examiners."
    },
    7: {
      title: "Slide 7: Proposed Architecture",
      points: [
        "Walk through Tier 1 (Ingestion) to Tier 4 (Android Client delivery).",
        "Emphasize the decoupled Python FastAPI backend and PostGIS spatial feature store."
      ],
      tip: "Clarify that heavy ML inference runs on the server; the mobile app handles lightweight display and offline caching."
    },
    8: {
      title: "Slide 8: Subsystems M1–M6",
      points: [
        "Click each card: M1 (Salinity), M2 (Crop), M3 (Climate), M4 (Yield), M5 (Irrigation), M6 (Android).",
        "Demonstrate that responsibilities and deliverables are balanced and comprehensive."
      ],
      tip: "Explain that M5 uses deterministic agronomic equations (FAO-56), avoiding generative LLM hallucinations."
    },
    9: {
      title: "Slide 9: ML Benchmarks & Simulator",
      points: [
        "Explain our hybrid candidate: 1D-CNN extracts narrow-band spectral features, which are fed into XGBoost.",
        "Use the Maas-Hoffman slider live to show the committee physiological crop yield decline as ECe increases past thresholds."
      ],
      tip: "Wheat threshold is 6.0 dS/m; cotton is more salt-tolerant at 7.7 dS/m."
    },
    10: {
      title: "Slide 10: Android Prototype & Urdu",
      points: [
        "Demonstrate the interactive Urdu/English toggle.",
        "Highlight offline SQLite caching for rural areas with intermittent connectivity.",
        "Explain how the app gives hours of diesel pumping rather than raw milliliter figures."
      ],
      tip: "Committee members value practical usability over purely theoretical algorithms."
    },
    11: {
      title: "Slide 11: Approved 9-Month Roadmap",
      points: [
        "Outline the 3 phases across 9 months.",
        "Show that data ingestion, ML training, and client development overlap realistically for timely completion."
      ],
      tip: "Point out that Lodhran testing happens in Months 7-9 as an untouched final validation."
    },
    12: {
      title: "Slide 12: Expected Outcomes & References",
      points: [
        "Summarize the 4 core deliverables.",
        "Acknowledge supervisory guidance from Dr. Mariam Nosheen and cite foundational peer-reviewed literature."
      ],
      tip: "Close with confidence: 'Thank you, we are ready for the examination committee discussion.'"
    }
  };

  function updateSpeakerNotes(slideNum) {
    const data = speakerNotes[slideNum];
    if (!data) return;
    document.getElementById('notes-slide-title').innerText = data.title;
    const pointsList = document.getElementById('notes-talking-points');
    pointsList.innerHTML = '';
    data.points.forEach(pt => {
      const li = document.createElement('li');
      li.innerText = pt;
      pointsList.appendChild(li);
    });
    document.getElementById('notes-defense-tip').innerHTML = data.tip;
  }

  // Initial Boot
  goToSlide(1);
  initHyperspectralCube();
});