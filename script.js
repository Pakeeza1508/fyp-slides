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
  4: { title: "Introduction", points: ["Regional challenges in South Punjab."], tip: "Focus on secondary salinization." },
  5: { title: "Problem Statement", points: ["Three core agricultural pressures in South Punjab."], tip: "Reveal cards step-by-step." }
};

document.addEventListener('DOMContentLoaded', () => {
  let currentSlide = 1;
  const totalSlides = 16; // Three compact references slides
  const visibleSlides = 15; // Abstract (slide 3) remains archived
  let leafletMap = null;
  let mapInitialized = false;

  // Slide 05 Step Tracker
  let probStep = 0; // 0 = none, 1 = Card 1, 2 = Card 2, 3 = Card 3

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

  // =========================================================================
  // SLIDE 05: SUB-STEP CONTROLLER
  // =========================================================================
  function updateProbCards() {
    const cards = document.querySelectorAll('#slide-05-problem .prob-card');
    const hint = document.getElementById('prob-step-hint');
    
    cards.forEach((card, index) => {
      if (index < probStep) {
        card.classList.add('seen');
      } else {
        card.classList.remove('seen');
      }
    });

    if (hint) {
      if (probStep === 0) hint.innerText = "Press Next → or Space to reveal pressures (0 / 3)";
      else if (probStep === 1) hint.innerText = "Press Next → to reveal next pressure (1 / 3)";
      else if (probStep === 2) hint.innerText = "Press Next → to reveal next pressure (2 / 3)";
      else hint.innerText = "All pressures revealed • Press Next → for Scope (3 / 3)";
    }
  }

  // =========================================================================
  // 3D STACK INTERACTIVE TWO-WAY HOVER CONTROLLER
  // =========================================================================
  const tiers = ['1', '2', '3', '4'];

  tiers.forEach(tier => {
    const layer = document.querySelector(`.layer-tier-${tier}`);
    const card = document.querySelector(`#card-tier-${tier}`);
    const line = document.querySelector(`.conn-tier-${tier}`);
    const pins = document.querySelectorAll(`.pin-tier-${tier}`);

    function activate() {
      layer?.classList.add('active-hover');
      card?.classList.add('active-hover');
      line?.classList.add('active-hover');
      pins.forEach(pin => pin.classList.add('active-hover'));
    }

    function deactivate() {
      layer?.classList.remove('active-hover');
      card?.classList.remove('active-hover');
      line?.classList.remove('active-hover');
      pins.forEach(pin => pin.classList.remove('active-hover'));
    }

    // Hover listeners on SVG disc
    layer?.addEventListener('mouseenter', activate);
    layer?.addEventListener('mouseleave', deactivate);

    // Hover listeners on HTML side card
    card?.addEventListener('mouseenter', activate);
    card?.addEventListener('mouseleave', deactivate);
  });

  // =========================================================================
  // MASTER NAVIGATION HANDLERS (STEP-AWARE)
  // =========================================================================
  function handleNext() {
    // If on Slide 5 and cards are not all revealed, reveal next card
    if (currentSlide === 5 && document.querySelector('#slide-05-problem .prob-card') && probStep < 3) {
      probStep++;
      updateProbCards();
      return; // Do NOT advance slide
    }
    goToSlide(currentSlide + 1);
  }

  function handlePrev() {
    goToSlide(currentSlide - 1);
  }

  // Slide Switcher Function
  function goToSlide(target) {
    if (target < 1 || target > totalSlides) return;
    // Skip the archived Abstract slide in both directions and on direct jumps.
    if (target === 3) target = currentSlide <= 2 ? 4 : 2;

    // Handle Slide 5 entry state
    if (target === 5) {
      // If coming forward from slide 4 -> start with 0 cards revealed
      // If coming backward from slide 6 -> keep all 3 cards visible
      probStep = (currentSlide > 5) ? 3 : 0;
       updateProbCards();
    }

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
      slideCounter.innerHTML = `${String(currentSlide > 3 ? currentSlide - 1 : currentSlide).padStart(2, '0')} <span>/ ${visibleSlides}</span>`;
    }
    if (telemetrySlideNum) {
      telemetrySlideNum.innerText = `SLIDE ${String(currentSlide > 3 ? currentSlide - 1 : currentSlide).padStart(2, '0')}`;
    }
    if (progressBarFill) {
      progressBarFill.style.width = `${((currentSlide > 3 ? currentSlide - 1 : currentSlide) / visibleSlides) * 100}%`;
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
  // NAVIGATION EVENT LISTENERS (ONLY ONE PAIR OF HANDLERS)
  // =========================================================================
  btnNext?.addEventListener('click', (e) => {
    e.preventDefault();
    handleNext();
  });

  btnPrev?.addEventListener('click', (e) => {
    e.preventDefault();
    handlePrev();
  });

  document.getElementById('btn-hero-start')?.addEventListener('click', () => goToSlide(2));
  document.getElementById('btn-hero-arch')?.addEventListener('click', () => goToSlide(9));
  document.getElementById('btn-restart-pres')?.addEventListener('click', () => goToSlide(1));

  // Universal Click Listener for all cards with data-target-slide
  document.querySelectorAll('[data-target-slide]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetSlide = parseInt(card.dataset.targetSlide, 10);
      if (targetSlide) {
        goToSlide(targetSlide);
      }
    });
  });

  // Single Keyboard Navigation Handler
  // =========================================================================
  // MASTER SLIDE KEYBOARD NAVIGATION
  // =========================================================================
  window.addEventListener('keydown', e => {
    // Left/Right Arrow and Space now ALWAYS change slides smoothly
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'PageDown') {
      handleNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      handlePrev();
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
  // SLIDE 08/09: TOOLS TABLE ZOOM CONTROLLER
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

  // =========================================================================
  // LIVE LEAFLET SATELLITE MAP
  // =========================================================================
  function initLeafletMap() {
    const mapContainer = document.getElementById('live-leaflet-map');
    if (!mapContainer || mapInitialized || typeof L === 'undefined') return;

    leafletMap = L.map('live-leaflet-map', { scrollWheelZoom: false }).setView([30.4, 69.35], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(leafletMap);

    L.circleMarker([29.3957, 71.6833], {
      radius: 10, color: '#f59e0b', weight: 3,
      fillColor: '#fbbf24', fillOpacity: 0.9
    }).addTo(leafletMap)
      .bindTooltip('Bahawalpur', { permanent: true, direction: 'right', offset: [12, 0] });

    mapInitialized = true;
    setTimeout(() => leafletMap.invalidateSize(), 100);
  }

  

  // =========================================================================
  // MODULES INSPECTOR (SLIDE 10)
  // =========================================================================
  const moduleData = {
    M1: { tag: "MODULE M1", name: "Soil Salinity Assessment & Field Mapping", scope: "Continuous spaceborne soil electrical conductivity (ECe) prediction.", input: "NASA EMIT L2A surface reflectance, Sentinel-2 SWIR/RedEdge", meth: "1D-CNN + XGBoost Regressor", output: "Continuous soil ECe (dS/m) raster", deliv: "Detects subsurface salinization before visual crusting." },
    M2: { tag: "MODULE M2", name: "Crop and Seasonal Analysis", scope: "Multi-temporal phenological trajectory analysis.", input: "Sentinel-2 time series (NDVI, SAVI, NDRE)", meth: "Savitzky-Golay filtering + double logistic modeling", output: "Growth stage milestones & vigor baselines", deliv: "Decouples natural drying from salt wilting." },
    M3: { tag: "MODULE M3", name: "Weather & Climate Intelligence", scope: "Agro-meteorological modeling.", input: "ERA5-Land reanalysis + PMD station records", meth: "FAO-56 Penman-Monteith reference ETo", output: "Daily ETo surfaces & heat stress alerts", deliv: "Provides evaporative driver for capillary salt accumulation." },
    M4: { tag: "MODULE M4", name: "Crop Yield Prediction & Explainability", scope: "Multi-feature pre-harvest yield modeling.", input: "EMIT spectral features, multi-stage VIs, soil ECe", meth: "Stacked Ensemble (LightGBM + Random Forest) + TreeSHAP", output: "Yield estimates (Maunds/Acre) + SHAP factor breakdown", deliv: "Converts black-box predictions into transparent reasons." },
    M5: { tag: "MODULE M5", name: "Smart Irrigation & Resource Advisory", scope: "Water requirement scheduling and leaching bounds.", input: "Crop coefficients (Kc), soil texture, root depth", meth: "FAO-56 water balance + leaching fraction optimization", output: "Optimal irrigation depth (mm) & safe blending ratio", deliv: "Prevents toxic tubewell water application." },
    M6: { tag: "MODULE M6", name: "Farmer Advisory & Android Application", scope: "Smallholder-facing mobile application.", input: "GPS field coordinates, M1–M5 backend APIs", meth: "Native Android (Kotlin) + SQLite offline cache", output: "Color-coded indicators, Urdu voice advisories", deliv: "Overcomes rural digital divide for farmers." }
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
  // URDU / ENGLISH BILINGUAL TOGGLE
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
      document.getElementById('phone-advisory-text').innerText = "زمین میں نمکیات کی زیادتی پائی گئی ہے۔ اگلی آبپاشی میں نہری پانی کا استعمال کریں۔";
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
      document.getElementById('phone-advisory-text').innerText = "Root-zone salinity threshold exceeded. Avoid saline tubewell pumping.";
      document.getElementById('phone-guidance-1').innerText = "• Apply 15% leaching fraction";
      document.getElementById('phone-guidance-2').innerText = "• Blend tubewell:canal at 1:2 ratio";
    }
  });

  // Start at Slide 1 and initialize the Table Viewer
  goToSlide(1);
  initTableViewer();

  // Lazy-load Slide 11 Iframe when active
  const targetSlide11 = document.getElementById("slide-11-external");
  const iframe11 = document.getElementById("external-slide-frame");

  if (targetSlide11 && iframe11) {
    const targetUrl = iframe11.getAttribute("data-src");
    const observer11 = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isActive = targetSlide11.classList.contains("active");
          if (isActive) {
           if (iframe11.getAttribute("src") !== targetUrl) {
              iframe11.setAttribute("src", targetUrl);
            }
          } else {
            if (iframe11.src !== "about:blank") {
              iframe11.src = "about:blank";
            }
          }
        }
      });
    });
    observer11.observe(targetSlide11, { attributes: true });
    if (targetSlide11.classList.contains("active")) {
  iframe11.setAttribute("src", targetUrl);
}
  }
});

// =========================================================================
// SLIDE 08: LITERATURE REVIEW TABLE VIEWER (STANDALONE CONTROLLER)
// =========================================================================
const tablePages = [
  { page: 1, file: "Table1.png", label: "1", desc: "Sun et al. (KGMT), Arshad et al. (Stacked ML & Hybrid Ensemble)" },
  { page: 2, file: "Table2.png", label: "2", desc: "Rehman et al. (Water Stress), Arshad et al. (Multi-Source ML), Nadeem et al. (SAFER)" },
  { page: 3, file: "Table3.png", label: "3", desc: "Haseeb et al. (Comparative ML), Zhang et al. (Pix2Pix cGAN), Mahender et al. (YieldActionAI)" },
  { page: 4, file: "Table4.png", label: "4", desc: "Khan et al. (Bari Doab Crop Mapping), Tan et al. (SOA-RF), Latif et al. (Spatial Salinity)" },
  { page: 5, file: "Table5.png", label: "5", desc: "Aihaiti et al. (PolSAR-MLP), Abbas et al., Liu et al. (Multimodal DNN), Rana et al. (SWIR Anchor)" },
  { page: 6, file: "Table6.png", label: "6", desc: "Khan et al. (GRACE-GMS Flow), Athar et al. (SAM 2 SPARC), Najam et al. (MultiRocket-XGBoost)" },
  { page: 7, file: "Table7.png", label: "7", desc: "Kheir et al. (PBM-ML-RS), Afzal et al. (GAMEAS-Markov), Rawat et al. (Systematic RS SSM)" },
  { page: 8, file: "Table8.png", label: "8", desc: "Lu et al. (Salinity Meta-Analysis), Akhtar et al. (VSD-AHP), Rahman et al. (PCA-VHI)" },
  { page: 9, file: "Table9.png", label: "9", desc: "Chen et al. (Water-Salinity Opt), Chu et al. (Ensemble Stacking), Mohammed et al. (SVM-RFE NuSVR)" },
  { page: 10, file: "Table10.png", label: "10", desc: "Rahman et al. (Drought Resilience), Akbar et al. (FAO CROPWAT 8.0 Schedules)" }
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

    stage?.classList.remove("zoomed");
    if (stage) {
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    }
  }

  prevBtn.onclick = (e) => {
    e.stopPropagation();
    if (currentTableIndex > 0) showPage(currentTableIndex - 1);
  };

  nextBtn.onclick = (e) => {
    e.stopPropagation();
    if (currentTableIndex < tablePages.length - 1) showPage(currentTableIndex + 1);
  };

  const toggleZoom = (e) => {
    e?.stopPropagation();
    stage?.classList.toggle("zoomed");
  };

  zoomBtn.onclick = toggleZoom;
  imgElement.onclick = toggleZoom;

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