import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- DOM ELEMENTS ---
const mainContent = document.getElementById('main-content');
const lightSlider = document.getElementById('light-slider');
const lightValue = document.getElementById('light-value');
const autoRotateSwitch = document.getElementById('auto-rotate-switch');
const shadedBtn = document.getElementById('shaded-btn');
const wireframeBtn = document.getElementById('wireframe-btn');

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10161d); // Match the UI background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, mainContent.clientWidth / mainContent.clientHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(mainContent.clientWidth, mainContent.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
mainContent.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.screenSpacePanning = false;
controls.minDistance = 2;
controls.maxDistance = 10;

let currentModel = null;
let wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true });
let originalMaterials = new Map();

// GLTF Model Loader
const loader = new GLTFLoader();

const fileInput = document.getElementById('file-input');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    const url = URL.createObjectURL(file);

    // Clear previous model
    if (currentModel) {
      scene.remove(currentModel);
    }

    loader.load(
      url,
      (gltf) => {
        currentModel = gltf.scene;
        scene.add(currentModel);

        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        currentModel.position.sub(center);

        originalMaterials.clear();
        currentModel.traverse((node) => {
          if (node.isMesh && node.material) {
            originalMaterials.set(node, node.material);
          }
        });

        console.log('Model loaded successfully');
        URL.revokeObjectURL(url); // Clean up object URL
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the model.', error);
      }
    );
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (currentModel && autoRotateSwitch.checked) {
    currentModel.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

// Handle window resize
const resizeObserver = new ResizeObserver(() => {
  onWindowResize();
});
resizeObserver.observe(mainContent);

function onWindowResize() {
  camera.aspect = mainContent.clientWidth / mainContent.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(mainContent.clientWidth, mainContent.clientHeight);
}

animate();

// --- UI Event Listeners ---
lightSlider.addEventListener('input', (e) => {
  const intensity = parseFloat(e.target.value);
  directionalLight.intensity = intensity * 1.5; // Scale for a good range
  ambientLight.intensity = intensity * 0.8;
  lightValue.textContent = `${intensity.toFixed(1)}x`;
});

wireframeBtn.addEventListener('click', () => {
  if (currentModel) {
    currentModel.traverse((node) => {
      if (node.isMesh) {
        node.material = wireframeMaterial;
      }
    });
  }
  wireframeBtn.classList.add('active');
  shadedBtn.classList.remove('active');
});

shadedBtn.addEventListener('click', () => {
  if (currentModel) {
    currentModel.traverse((node) => {
      if (node.isMesh && originalMaterials.has(node)) {
        node.material = originalMaterials.get(node);
      }
    });
  }
  shadedBtn.classList.add('active');
  wireframeBtn.classList.remove('active');
});