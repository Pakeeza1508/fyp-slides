An interactive 3D web presentation for the ZARKHEZ AI final-year project. The presentation includes slide navigation, speaker notes, an interactive satellite map, Three.js visualizations, a hyperspectral data cube, a salinity simulator, and Urdu/English advisory content.

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A modern browser such as Chrome, Edge, or Firefox
- Internet connection for the Leaflet satellite map and CDN-hosted libraries

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Pakeeza1508/fyp-slides.git
   cd fyp-slides
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the URL shown in the terminal. The configured development port is usually:

   ```text
   http://localhost:3000
   ```

   If port `3000` is already in use, Vite may display another available URL in the terminal.

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot reload. |
| `npm run build` | Creates an optimized production build in the `dist/` directory. |
| `npm run preview` | Serves the production build locally for testing. Run `npm run build` first. |
| `npm run lint` | Runs the TypeScript type check without emitting files. |
| `npm run clean` | Removes generated build files and `server.js` on macOS/Linux. |

## Test the Production Build

```bash
npm run build
npm run preview
```

Then open the preview URL printed by Vite, normally:

```text
http://localhost:4173
```

## Environment Variables

The current presentation can run without a local `.env` file. If you use the optional Gemini/server-side features, create a `.env.local` file in the project root based on `.env.example`:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

Do not commit real API keys or other secrets to GitHub.

## Presentation Controls

- **Right Arrow / Space:** Next slide
- **Left Arrow:** Previous slide
- **M:** Open the slide menu
- **N:** Open presenter notes
- **F:** Toggle fullscreen
- **Escape:** Close open menus or notes
- Use the on-screen buttons to start the presentation, inspect modules, change language, and interact with the maps and simulations.

## Project Structure

```text
.
├── index.html       # Main presentation markup
├── script.js        # Slide navigation and interactive behavior
├── style.css        # Presentation styles
├── assets/          # Local static assets
├── package.json     # Dependencies and npm scripts
├── vite.config.ts   # Vite configuration
└── .env.example     # Optional environment variable template
```

## Notes

- The live satellite map uses external ESRI/Leaflet resources, so map tiles may not appear without an internet connection.
- Font Awesome, Leaflet, and Three.js resources are loaded from CDNs in `index.html`.
- This repository contains the presentation frontend. The proposed backend, machine-learning pipeline, and Android application are described in the slides but are not included as runnable services in this repository.
