<div align="center">
  <h1>Blender Model Previewer</h1>
</div>

![Posters](assets/Poster.png)

## Overview 

The Blender Model Previewer is a high-performance, lightweight desktop application built on the Electron framework designed for rapid, localized 3D asset inspection. By leveraging a Three.js-powered render engine, it provides seamless 3D model viewing directly on your system.

---

## Repository Structure & Roles

```text
├── assets/                  # Branding assets, UI graphics, and application poster
├── index.html               # Frontend application viewport shell
├── index.js                 # Three.js core engine: scene initialization, lights, and render loops
├── main.js                  # Electron main process (native lifecycle & window management)
├── preload.js               # Electron context bridge (secure IPC communication)
├── style.css                # Retro Neon Blue theme styling and structural layout
├── vite.config.js           # Development server configuration and production bundling
└── package.json             # Build scripts, project metadata, and dependency tree
```

---

## Installation Guide

### Prerequisites

Before installing the Blender Model Previewer, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** as your package manager
- **Git** (optional, for cloning the repository) - [Download](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Darrenvandervelde/Blender-Model-Previewer.git
cd Blender-Model-Previewer
```

Or download the repository as a ZIP file and extract it to your desired location.

### Step 2: Install Dependencies

Install all required dependencies using npm:

```bash
npm install
```

This will install:
- **Electron** - Desktop application framework
- **Three.js** - 3D graphics rendering engine
- **Vite** - Development server and build tool
- **electron-builder** - Application packaging and distribution

### Step 3: Development Setup

To run the application in development mode with hot module reloading:

```bash
npm run dev
```

In a separate terminal, start the Electron application:

```bash
npm start
```

### Step 4: Build for Production

#### Build Web Assets

```bash
npm run build
```

This generates optimized production files in the `dist/` directory.

#### Build Desktop Application

For Windows (NSIS installer):

```bash
npm run electron-build
```

The packaged application will be available in the `release/` directory.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with hot reload |
| `npm start` | Launch the Electron application |
| `npm run build` | Build optimized production assets |
| `npm run preview` | Preview production build locally |
| `npm run electron-build` | Package application into an installer |

---

## Troubleshooting

### Issue: `npm install` fails
- **Solution:** Ensure Node.js v16+ is installed. Run `node --version` to verify.

### Issue: Electron fails to start
- **Solution:** Try clearing the node_modules folder and reinstalling:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Issue: Three.js models don't render
- **Solution:** Ensure your model files are in a supported format (GLTF, GLB, OBJ) and located in the correct directory.

### Issue: Build fails on Windows
- **Solution:** Install the required build tools via Visual Studio or run `npm install --global windows-build-tools`

---

## System Requirements

- **OS:** Windows 10+, macOS 10.13+, or Linux (Ubuntu 18.04+)
- **RAM:** 2GB minimum (4GB recommended)
- **Storage:** 500MB for application and dependencies
- **GPU:** Any GPU with WebGL support (for smooth 3D rendering)

---

## Contributing

Feel free to submit issues and pull requests to improve the Blender Model Previewer!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
