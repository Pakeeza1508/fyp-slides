# ZARKHEZ AI — Interactive 3D Viva Defense Presentation

A cinematic, publication-grade interactive 3D web presentation engineered for the university viva defense of **ZARKHEZ AI** (Satellite Hyperspectral & Machine Learning Framework for Precision Crop Yield & Soil Salinity Mapping in Southern Punjab). Built purely with vanilla HTML5, CSS3, and JavaScript (with a local Three.js engine), optimized for university projector displays, and completely self-contained for offline operation.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following project parameters were aligned during initial clarification:
> - **Presentation Controls & Viva Aids**: Manual slide navigation with dedicated slide-by-slide Presenter Notes toggle (`N`), keyboard hotkeys, and quick-jump slide navigation menu.
> - **3D Earth & Regional Visualization**: Interactive Three.js global sphere with procedural atmospheric glow, orbital satellite track, and cinematic zoom transition into the Southern Punjab study area (Bahawalpur, Bahawalnagar, Rahim Yar Khan).
> - **Scientific Metric Presentation**: Real empirical metrics (R², RMSE, MAE) with interactive model comparison sliders (XGBoost vs. LightGBM vs. Random Forest vs. Stacking Ensemble) and SHAP feature importance indicators rather than static or fabricated charts.
> - **Technical Constraint**: Zero external build frameworks (No React, Vue, Vite dependencies in runtime presentation code); structured cleanly in `index.html`, `style.css`, `script.js`, and local `assets/` so it can be opened directly or presented offline anywhere.

---

## 1. Overview & Core Concept

- **What It Delivers**: A 12-slide, high-definition (16:9 responsive) interactive web presentation system built to deliver a defense for an FYP viva committee. It combines real-time WebGL graphics with structured scientific storytelling.
- **Target Audience**: Final Year Project examination committee, academic supervisors, agricultural remote sensing evaluators, and precision agriculture stakeholders.
- **Core Value**: Transforms static PowerPoint bullet points into a dynamic scientific briefing with real-time 3D Earth & hyperspectral cube slicing, animated algorithmic workflows, six clickable functional modules, interactive model performance comparisons, and a live Android mobile mockup.

---

## 2. User Experience & Visual Design

### 12-Slide Curriculum & Progression

```
[Slide 01] Title & Defense Cover ───────────► High-impact hero, project metadata, authors & supervisors
[Slide 02] Problem Statement & Motivation ──► Indus basin salinization, yield loss data, ground-truth crisis
[Slide 03] Study Area & Geographic Profile ─► 3D Earth zoom to Bahawalpur, Bahawalnagar, Rahim Yar Khan
[Slide 04] Satellite & Hyperspectral Feeds ─► Sentinel-2, Landsat-8/9, PRISMA/EnMAP bands & soil sampling
[Slide 05] Hyperspectral Data Cube Explorer ► Interactive 3D band slicer (Vis/NIR/SWIR) & spectral curves
[Slide 06] Preprocessing & Correction ─────► Radiometric, Sen2Cor, cloud masking, PCA dimensional reduction
[Slide 07] End-to-End System Architecture ──► Data Ingestion ➔ Feature Engine ➔ ML Pipeline ➔ Advisory API
[Slide 08] Six Core Modules (M1–M6) ────────► Interactive tabbed inspection of all 6 ZARKHEZ AI subsystems
[Slide 09] Crop Yield & Salinity Prediction ─► Real model comparisons, interactive error slider, SHAP rankings
[Slide 10] Farmer Android Application Mockup ─► Interactive smartphone UI with Urdu toggle & offline alerts
[Slide 11] Nine-Month Project Timeline ─────► 3-phase interactive Gantt chart tracking milestones to viva
[Slide 12] Conclusion & Scientific Reference ─► Key deliverables, FAO/IEEE citations, acknowledgments, Q&A
```

### Visual Identity & Theme
- **Dominant Palette (60-30-10 Rule)**:
  - **60% Deep Obsidian/Navy Canvas**: `#070B14` and `#0B132B` providing clinical projector contrast without eye strain.
  - **30% Structural Surfaces**: Subdued emerald slate `#112233`, hairline borders `rgba(16, 185, 129, 0.2)` and `rgba(6, 182, 212, 0.2)`, grid meshes, and dark glass panels.
  - **10% Precision Telemetry Accents**: Agricultural emerald `#10B981` (vegetation/yield), satellite cyan `#06B6D4` (spectral bands/telemetry), and warning amber `#F59E0B` (soil salinity zones).
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` / `Outfit` (clean geometric weight 600/700, balanced line wrapping).
  - Body & Descriptions: `Plus Jakarta Sans` (400 regular, 1.6 line height).
  - Telemetry & Measurements: Monospace tabular numerals (`JetBrains Mono`, `font-mono tabular-nums`) for coordinates, wavelengths, and statistical metrics.
- **Motion & Cinematic Transitions**:
  - Smooth camera lerping and exponential damping (`THREE.MathUtils.damp`) for 3D globe and hyperspectral cube.
  - CSS hardware-accelerated slide transitions (`opacity`, `transform: translate3d`) under 350ms.
  - Animated SVG pipelines showing pulse signals flowing along data bus lines.

### Presentation Controls & Presenter HUD
- **Bottom Navigation Dock**: Sleek, non-occluding floating dock with Previous (`←`), Next (`→`), Slide Counter (`04 / 12`), Slide Progress Indicator bar, Fullscreen (`F`), Slide Directory Menu (`M`), and Presenter Notes toggle (`N`).
- **Collapsible Presenter Viva Notes**: Dedicated side-drawer or bottom HUD displaying speaking points, defense hints, key equations, and anticipated committee questions for the active slide.
- **Keyboard Shortcuts**: `Left/Right Arrow`, `Spacebar`, `PageUp/PageDown`, `Home/End`, `F`, `N`, `M`, and `Escape`.

---

## 3. Key Product Decisions & Trade-Offs

- **Vanilla HTML5/CSS3/JS Architecture**:
  - *Chosen Approach*: Single standard `index.html`, external `style.css`, and modular vanilla `script.js` with self-contained assets.
  - *Rationale*: Guarantees zero installation friction, instant boot time, zero node runtime dependencies for presentation, and absolute reliability when presenting on an offline viva laptop or projector.
- **Local Three.js Runtime**:
  - *Chosen Approach*: Bundled Three.js engine in `assets/three.min.js` with zero external CDN dependency.
  - *Rationale*: Academic defense venues often have erratic Wi-Fi; a local runtime prevents 404s and network timeout failures.
- **Procedural 3D Texturing & Visuals**:
  - *Chosen Approach*: High-resolution procedural canvas textures for the 3D globe continents, latitude/longitude graticules, atmospheric halo shader, and 3D hyperspectral cube slices.
  - *Rationale*: Eliminates external multi-megabyte image downloading while ensuring crisp 4K rendering on large projectors.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION RUNTIME                          │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   SLIDE CONTROLLER    │  │          THREE.JS 3D ENGINE           │  │
│  │  - Keyboard Listener  │  │  - WebGLRenderer (ACESFilmic)         │  │
│  │  - Slide Index State  │  │  - Scene Graph (Globe, Satellites)    │  │
│  │  - URL Hash Sync      │  │  - Hyperspectral Cube Visualizer      │  │
│  │  - Presenter Notes    │  │  - Camera Lerp & Regional Zoom        │  │
│  └───────────┬───────────┘  └───────────────────┬───────────────────┘  │
│              │                                  │                      │
│              ▼                                  ▼                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        ACTIVE SLIDE DOM                          │  │
│  │  • Slide 1: Cover & Defense Deck Metadata                        │  │
│  │  • Slide 2: Indus Basin Soil Salinity & Yield Problem Matrix     │  │
│  │  • Slide 3: 3D Geo-Targeting (Bahawalpur, Bahawalnagar, RYK)     │  │
│  │  • Slide 4: Multi-Sensor Remote Sensing Ingestion Matrix         │  │
│  │  • Slide 5: Interactive 3D Hyperspectral Data Cube               │  │
│  │  • Slide 6: Multi-Stage Radiometric & Atmospheric Preprocessing  │  │
│  │  • Slide 7: Scalable System Architecture Flow                    │  │
│  │  • Slide 8: Interactive M1–M6 Core Module Inspection             │  │
│  │  • Slide 9: ML Model Benchmarks, Error Sliders & SHAP Values     │  │
│  │  • Slide 10: Interactive Farmer Android Application Mockup       │  │
│  │  • Slide 11: 9-Month Engineering Gantt Timeline                  │  │
│  │  • Slide 12: Viva Defense Synthesis & Research Citations         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                  │                                     │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   INTERACTIVE CONTROLS DOCK                      │  │
│  │   [⏮ Prev]  [04 / 12]  [Next ⏭]  [📑 Menu]  [📝 Notes]  [⛶ Full]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mapping

| Slide & Feature | Interactive Controls | State & DOM Behavior |
| :--- | :--- | :--- |
| **Slide 03: Study Area** | District Selector buttons (`Bahawalpur`, `Bahawalnagar`, `Rahim Yar Khan`, `All Region`) | Smoothly pivots Three.js globe camera to target coordinates, pulses district boundary vectors, and updates soil salinity/acreage stats. |
| **Slide 05: Hyperspectral Cube** | Spectral Band Slider (400nm – 2400nm) & Index toggles (`NDVI`, `SAVI`, `NDSI`, `SI`) | Dynamically adjusts the 3D slicing plane through the hyperspectral cube, updates the reflectance curve graph, and reveals false-color vegetation/salinity masks. |
| **Slide 06: Pipeline** | Step-by-step pipeline stepper (`1. Ingest` ➔ `2. Sen2Cor` ➔ `3. Cloud Mask` ➔ `4. PCA`) | Highlights active pipeline phase, triggers animated data flow packets, and reveals processing parameters (SNR, cloud threshold). |
| **Slide 08: Modules M1–M6** | Clickable Module Cards (M1 to M6) | Displays detailed input/output schema, algorithms used, and validation metrics for the selected module. |
| **Slide 09: ML Predictions** | Model Switcher (XGBoost, LightGBM, Random Forest, Stacked Ensemble) & Salinity Threshold Slider | Updates live evaluation metrics (R², RMSE, MAE), shifts residual error plots, and displays corresponding SHAP feature weightings. |
| **Slide 10: Mobile Mockup** | Language Toggle (`English` / `اردو`), Soil Advisory Tab, Yield Forecast Tab, Irrigation Alert Tab | Updates phone screen with localized farmer recommendations, advisory status indicators, and offline sync simulations. |
| **Slide 11: Timeline** | Phase filter tabs (`Phase 1: Research`, `Phase 2: Modeling`, `Phase 3: Viva & Field Trials`) | Filters and highlights Gantt chart milestones with delivery dates, deliverables, and status. |
| **Presenter HUD** | Notes Toggle (`N` key or dock button) | Slides in semi-transparent speaker notes card with bulleted talking points and committee defense advice for the active slide. |

---

## 5. Implementation Strategy & Next Steps

1. **Local Assets Setup**: Prepare clean, offline-ready local `assets/three.min.js` and high-fidelity satellite/agricultural visuals.
2. **HTML5 Master Shell (`index.html`)**: Construct semantic, easily editable 12-slide structure with accessible markup and clear research annotations.
3. **Cinematic CSS3 Design System (`style.css`)**: Implement dark navy/emerald/cyan scientific theme, typography, glassmorphism, responsive 16:9 projection rules, and smooth compositor transitions.
4. **Vanilla JavaScript Controller (`script.js`)**: Implement slide state management, keyboard listeners, presenter notes drawer, interactive charts, and Three.js 3D Earth and Hyperspectral Cube scenes.
5. **Validation**: Test projector responsiveness, keyboard accessibility, smooth animations, and zero-error execution.
