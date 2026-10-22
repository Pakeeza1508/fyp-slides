/* ==========================================================================
   ZARKHEZ AI — Presentation Controller Script
   Handles: Slide Navigation, Leaflet Satellite Map, 3D Hyperspectral Cube,
            Literature Review Table Viewer, Maas-Hoffman Simulator, & Module Inspector.
   ========================================================================== */

// Fallback speaker notes object to prevent undefined reference crashes
const speakerNotes = {
  1: { title: "Title Slide", points: ["Formal Project Identification.", "Presenting BSCS Proposal Defense."], tip: "Introduce team and research title within 60s." },
  2: { title: "Agenda", points: ["Walkthrough of the presentation flow."], tip: "Highlight Literature Review and Methodology." },
  3: { title: "Abstract", points: ["Core objectives and architecture."], tip: "Emphasize zero on-farm hardware requirement." },
  4: { title: "Introduction", points: ["Regional challenges in South Punjab."], tip: "Focus on secondary salinization." }
};

document.addEventListener('DOMContentLoaded', () => {
  let currentSlide = 1;
  const totalSlides = 14; // Total slides in your deck
  let leafletMap = null;
  let mapInitialized = false;

  // DOM Elements (Safely Queried)
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

    // Remove active class from all slides
    slides.forEach(s => s.classList.remove('active'));

    // Activate the requested slide
    const nextSlideEl = document.querySelector(`.slide[data-slide="${target}"]`);
    if (nextSlideEl) {
      nextSlideEl.classList.add('active');
    }

    currentSlide = target;

    // Safely update UI telemetry if elements exist
    if (slideCounter) {
      slideCounter.innerHTML = `${String(currentSlide).padStart(2, '0')} <span>/ ${totalSlides}</span>`;
    }
    if (telemetrySlideNum) {
      telemetrySlideNum.innerText = `SLIDE ${String(currentSlide).padStart(2, '0')}`;
    }
    if (progressBarFill) {
      progressBarFill.style.width = `${(currentSlide / totalSlides) * 100}%`;
    }

    // Highlight Menu Item if modal exists
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.toggle('active', parseInt(item.dataset.slide) === currentSlide);
    });

    // Safely update speaker notes
    updateSpeakerNotes(currentSlide);

    // Slide 4: Reset laser crop scan animation
    if (currentSlide === 4) {
      const crop = document.querySelector('#slide-04-intro .crop-transformation');
      if (crop) {
        crop.classList.remove('restart-animation');
        const animatedElements = crop.querySelectorAll('.crop-after, .crop-laser, .crop-scan-label');
        animatedElements.forEach((element) => {
          element.style.animation = 'none';
          void element.offsetWidth; // Force CSS reflow
          element.style.animation = '';
        });
      }
    }

    // Initialize or resize Leaflet Map if moving to Slide 3 or 4
    if (currentSlide === 4) {
      setTimeout(() => {
        if (!mapInitialized) {
          initLeafletMap();
        } else if (leafletMap) {
          leafletMap.invalidateSize();
        }
      }, 250);
    }
  }

  // =========================================================================
  // SLIDE 08: TOOLS TABLE ZOOM CONTROLLER
  // =========================================================================
  const toolsStage = document.getElementById("toolsStage");
  const toolsImg = document.getElementById("toolsTableImg");
  const toolsZoomBtn = document.getElementById("toolsZoomBtn");

  const toggleToolsZoom = (e) => {
    e?.stopPropagation();
    toolsStage?.classList.toggle("zoomed");
  };

  toolsZoomBtn?.addEventListener("click", toggleToolsZoom);
  toolsImg?.addEventListener("click", toggleToolsZoom);

  // Navigation Event Listeners
  btnNext?.addEventListener('click', (e) => {
    e.preventDefault();
    goToSlide(currentSlide + 1);
  });

  btnPrev?.addEventListener('click', (e) => {
    e.preventDefault();
    goToSlide(currentSlide - 1);
  });

  document.getElementById('btn-hero-start')?.addEventListener('click', () => goToSlide(2));
  document.getElementById('btn-hero-arch')?.addEventListener('click', () => goToSlide(9));
  document.getElementById('btn-restart-pres')?.addEventListener('click', () => goToSlide(1));

  // Universal Click Listener for all cards with data-target-slide (TOC + Slide 6 Cards)
  document.querySelectorAll('[data-target-slide]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetSlide = parseInt(card.dataset.targetSlide, 10);
      if (targetSlide) {
        goToSlide(targetSlide);
      }
    });
  });

  // Keyboard Navigation
  window.addEventListener('keydown', e => {
    // If table viewer on Slide 7 is active, let left/right arrows paginate table pages
    const isTableSlideActive = document.querySelector('.slide[data-slide="8"].active');

    if (e.key === ' ' || (!isTableSlideActive && e.key === 'ArrowRight')) {
      goToSlide(currentSlide + 1);
    } else if (!isTableSlideActive && e.key === 'ArrowLeft') {
      goToSlide(currentSlide - 1);
    } else if (e.key.toLowerCase() === 'm' && menuModal) {
      menuModal.classList.toggle('open');
    } else if (e.key.toLowerCase() === 'n' && notesDrawer) {
      notesDrawer.classList.toggle('open');
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key === 'Escape') {
      menuModal?.classList.remove('open');
      notesDrawer?.classList.remove('open');
    }
  });

  // Modal Handlers
  btnMenu?.addEventListener('click', () => menuModal?.classList.add('open'));
  btnCloseMenu?.addEventListener('click', () => menuModal?.classList.remove('open'));
  btnNotes?.addEventListener('click', () => notesDrawer?.classList.toggle('open'));
  btnCloseNotes?.addEventListener('click', () => notesDrawer?.classList.remove('open'));

  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      goToSlide(parseInt(item.dataset.slide));
      menuModal?.classList.remove('open');
    });
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  btnFullscreen?.addEventListener('click', toggleFullscreen);

  // Safe Speaker Notes Updater
  function updateSpeakerNotes(slideNum) {
    if (typeof speakerNotes === 'undefined') return;
    const data = speakerNotes[slideNum];
    if (!data) return;
    const titleEl = document.getElementById('notes-slide-title');
    if (titleEl) titleEl.innerText = data.title;
    const pointsList = document.getElementById('notes-talking-points');
    if (pointsList) {
      pointsList.innerHTML = '';
      data.points.forEach(pt => {
        const li = document.createElement('li');
        li.innerText = pt;
        pointsList.appendChild(li);
      });
    }
    const tipEl = document.getElementById('notes-defense-tip');
    if (tipEl) tipEl.innerHTML = data.tip;
  }

  // =========================================================================
  // LIVE LEAFLET SATELLITE MAP
  // =========================================================================
  function initLeafletMap() {
    const mapContainer = document.getElementById('live-leaflet-map');
    if (!mapContainer || mapInitialized) return;

    leafletMap = L.map('live-leaflet-map').setView([29.35, 71.69], 8);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; NASA, USGS, USDA'
    }).addTo(leafletMap);

    L.circleMarker([29.3957, 71.6833], { radius: 11, color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.85 })
      .addTo(leafletMap)
      .bindPopup("<b>Bahawalpur Central (Training Zone)</b><br>Intensive wheat-cotton rotation.<br>High tubewell dependence; secondary root-zone salinity.");

    L.circleMarker([28.4212, 70.2989], { radius: 10, color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.85 })
      .addTo(leafletMap)
      .bindPopup("<b>Rahim Yar Khan (Training Zone)</b><br>Sugarcane and cotton belt.<br>Tubewell water ECw ranges between 0.8–5.2 dS/m.");

    L.circleMarker([29.9986, 73.2536], { radius: 10, color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.85 })
      .addTo(leafletMap)
      .bindPopup("<b>Bahawalnagar (Training Zone)</b><br>Eastern Sadiqia canal command.<br>Severe tail-end water constraints and white crust formation.");

    L.circleMarker([29.5339, 71.6331], { radius: 13, color: '#ef4444', fillColor: '#b91c1c', fillOpacity: 0.95 })
      .addTo(leafletMap)
      .bindPopup("<b style='color:#ef4444;'>Lodhran District (INDEPENDENT HOLDOUT)</b><br><strong>Zero Lodhran data used in training!</strong><br>Reserved strictly to test out-of-domain spatial generalization.")
      .openPopup();

    mapInitialized = true;
  }

  // =========================================================================
  // MAAS-HOFFMAN INTERACTIVE EQUATION (SLIDE 11)
  // =========================================================================
  const salinitySlider = document.getElementById('salinity-ece-slider');
  const salinityValText = document.getElementById('salinity-slider-val');
  const salinityClassBadge = document.getElementById('salinity-class-badge');
  const wheatLossText = document.getElementById('wheat-loss-val');
  const cottonLossText = document.getElementById('cotton-loss-val');

  salinitySlider?.addEventListener('input', e => {
    const ece = parseFloat(e.target.value);
    if (salinityValText) salinityValText.innerText = `${ece.toFixed(1)} dS/m`;

    if (salinityClassBadge) {
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
    }

    let wheatLoss = ece > 6.0 ? (ece - 6.0) * 7.1 : 0;
    wheatLoss = Math.min(100, wheatLoss);
    if (wheatLossText) wheatLossText.innerText = `-${wheatLoss.toFixed(1)}% potential`;

    let cottonLoss = ece > 7.7 ? (ece - 7.7) * 5.2 : 0;
    cottonLoss = Math.min(100, cottonLoss);
    if (cottonLossText) cottonLossText.innerText = `-${cottonLoss.toFixed(1)}% potential`;
  });

  // =========================================================================
  // MODULES INSPECTOR (SLIDE 10)
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
  // URDU / ENGLISH BILINGUAL TOGGLE (SLIDE 12)
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

  // Start at Slide 1 and initialize the Table Viewer
  goToSlide(1);
  initTableViewer();
});

// =========================================================================
// SLIDE 07: LITERATURE REVIEW TABLE VIEWER (STANDALONE CONTROLLER)
// =========================================================================
const tablePages = [
  { page: 1, file: "Table1.png", label: "Papers [1]–[3]", desc: "Sun et al. (KGMT), Arshad et al. (Stacked ML & Hybrid Ensemble)" },
  { page: 2, file: "Table2.png", label: "Papers [4]–[6]", desc: "Rehman et al. (Water Stress), Arshad et al. (Multi-Source ML), Nadeem et al. (SAFER)" },
  { page: 3, file: "Table3.png", label: "Papers [7]–[9]", desc: "Haseeb et al. (Comparative ML), Zhang et al. (Pix2Pix cGAN), Mahender et al. (YieldActionAI)" },
  { page: 4, file: "Table4.png", label: "Papers [10]–[12]", desc: "Khan et al. (Bari Doab Crop Mapping), Tan et al. (SOA-RF), Latif et al. (Spatial Salinity)" },
  { page: 5, file: "Table5.png", label: "Papers [13]–[16]", desc: "Aihaiti et al. (PolSAR-MLP), Abbas et al., Liu et al. (Multimodal DNN), Rana et al. (SWIR Anchor)" },
  { page: 6, file: "Table6.png", label: "Papers [17]–[19]", desc: "Khan et al. (GRACE-GMS Flow), Athar et al. (SAM 2 SPARC), Najam et al. (MultiRocket-XGBoost)" },
  { page: 7, file: "Table7.png", label: "Papers [20]–[22]", desc: "Kheir et al. (PBM-ML-RS), Afzal et al. (GAMEAS-Markov), Rawat et al. (Systematic RS SSM)" },
  { page: 8, file: "Table8.png", label: "Papers [23]–[25]", desc: "Lu et al. (Salinity Meta-Analysis), Akhtar et al. (VSD-AHP), Rahman et al. (PCA-VHI)" },
  { page: 9, file: "Table9.png", label: "Papers [26]–[28]", desc: "Chen et al. (Water-Salinity Opt), Chu et al. (Ensemble Stacking), Mohammed et al. (SVM-RFE NuSVR)" },
  { page: 10, file: "Table10.png", label: "Papers [29]–[30]", desc: "Rahman et al. (Drought Resilience), Akbar et al. (FAO CROPWAT 8.0 Schedules)" }
];

let currentTableIndex = 0;

function initTableViewer() {
  const chipsContainer = document.getElementById("tableChipsContainer");
  const imgElement = document.getElementById("currentTableImg");
  const counterText = document.getElementById("pageCounterText");
  const rangeLabel = document.getElementById("tableRangeLabel");
  const prevBtn = document.getElementById("prevTableBtn");
  const nextBtn = document.getElementById("nextTableBtn");
  const zoomBtn = document.getElementById("zoomToggleBtn");
  const stage = document.getElementById("tableStage");

  if (!chipsContainer || !imgElement || !prevBtn || !nextBtn) return;

  // Build the quick navigation chips
  chipsContainer.innerHTML = "";
  tablePages.forEach((item, idx) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `table-chip ${idx === 0 ? "active" : ""}`;
    chip.innerText = item.label;
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      showPage(idx);
    });
    chipsContainer.appendChild(chip);
  });

  function showPage(index) {
    if (index < 0 || index >= tablePages.length) return;
    currentTableIndex = index;
    const target = tablePages[index];

    imgElement.src = target.file;
    if (counterText) counterText.innerText = `Part ${target.page} / ${tablePages.length}`;
    if (rangeLabel) rangeLabel.innerText = `${target.label}: ${target.desc}`;

    document.querySelectorAll(".table-chip").forEach((chip, i) => {
      chip.classList.toggle("active", i === index);
    });

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === tablePages.length - 1;

    // Reset zoom when navigating
    stage?.classList.remove("zoomed");
    if (stage) {
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    }
  }

  // Next / Prev listeners for Table Images
  prevBtn.onclick = (e) => {
    e.stopPropagation();
    if (currentTableIndex > 0) showPage(currentTableIndex - 1);
  };

  nextBtn.onclick = (e) => {
    e.stopPropagation();
    if (currentTableIndex < tablePages.length - 1) showPage(currentTableIndex + 1);
  };

  // Zoom toggling
  const toggleZoom = (e) => {
    e?.stopPropagation();
    stage?.classList.toggle("zoomed");
  };

  zoomBtn.onclick = toggleZoom;
  imgElement.onclick = toggleZoom;

  // Arrow navigation for table images when Slide 07 is active
  window.addEventListener("keydown", (e) => {
    const slide08 = document.querySelector('.slide[data-slide="8"].active');
    if (slide08) {
      if (e.key === "ArrowLeft" && currentTableIndex > 0) {
        showPage(currentTableIndex - 1);
      } else if (e.key === "ArrowRight" && currentTableIndex < tablePages.length - 1) {
        showPage(currentTableIndex + 1);
      }
    }
  });

  // Display the first page
  showPage(0);
}

// =========================================================================
// SLIDE 01: 3D ROTATING ORBITAL WIREFRAME
// =========================================================================
function initTitle3DOrbit() {
  const container = document.getElementById('hero-3d-orbit');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 3.2);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const sphereGeo = new THREE.SphereGeometry(0.8, 14, 14);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0xd97706, wireframe: true, transparent: true, opacity: 0.35 });
  const globe = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(globe);

  const ringGeo = new THREE.RingGeometry(1.05, 1.1, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x65a30d, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
  const orbitRing = new THREE.Mesh(ringGeo, ringMat);
  orbitRing.rotation.x = Math.PI / 3;
  scene.add(orbitRing);

  const satGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const satellite = new THREE.Mesh(satGeo, satMat);
  scene.add(satellite);

  let angle = 0;
  function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.006;
    globe.rotation.x += 0.002;
    angle += 0.03;
    satellite.position.x = Math.cos(angle) * 1.08;
    satellite.position.y = Math.sin(angle) * 1.08 * Math.cos(Math.PI / 3);
    satellite.position.z = Math.sin(angle) * 1.08 * Math.sin(Math.PI / 3);
    renderer.render(scene, camera);
  }
  animate();
}

window.addEventListener('load', initTitle3DOrbit);