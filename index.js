import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ============================================
// DOM
// ============================================

const mainContent = document.getElementById("main-content");

const fileInput = document.getElementById("file-input");

const lightSlider = document.getElementById("light-intensity");
const lightValue = document.getElementById("light-val");

const autoRotateSwitch = document.getElementById("auto-rotate");

const shadedBtn = document.getElementById("btn-shaded");
const wireframeBtn = document.getElementById("btn-wireframe");

const gridToggle = document.getElementById("toggle-grid");
const measureToggle = document.getElementById("toggle-measure");

// ============================================
// Scene
// ============================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10161d);

// ============================================
// Camera
// ============================================

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    10000
);

camera.position.set(0, 2, 5);

// ============================================
// Renderer
// ============================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.localClippingEnabled = true;

mainContent.appendChild(renderer.domElement);

// ============================================
// Lights
// ============================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.2
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

directionalLight.position.set(
    10,
    10,
    10
);

directionalLight.castShadow = true;

scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(
    0xffffff,
    0.8
);

fillLight.position.set(
    -10,
    5,
    -5
);

scene.add(fillLight);

// ============================================
// Helpers
// ============================================

const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(
    20,
    20,
    0x00ff00,
    0x333333
);

gridHelper.visible = true;

scene.add(gridHelper);

// ============================================
// Controls
// ============================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.08;

controls.enablePan = true;

controls.minDistance = 0.1;
controls.maxDistance = 10000;

controls.target.set(
    0,
    0,
    0
);

controls.update();

// ============================================
// Globals
// ============================================

const loader = new GLTFLoader();

let currentModel = null;

let currentBoxHelper = null;

let originalMaterials = new Map();

const wireframeMaterial = new THREE.MeshBasicMaterial({

    color: 0x00e5ff,

    wireframe: true

});

let clippingPlane = new THREE.Plane(
    new THREE.Vector3(-1, 0, 0),
    100000
);

// ============================================
// Utility Functions
// ============================================

function disposeModel(model) {

    model.traverse((child) => {

        if (child.isMesh) {

            child.geometry.dispose();

            if (Array.isArray(child.material)) {

                child.material.forEach((m) => m.dispose());

            } else {

                child.material.dispose();

            }

        }

    });

}

function clearSceneModel() {

    if (!currentModel) return;

    scene.remove(currentModel);

    disposeModel(currentModel);

    currentModel = null;

    originalMaterials.clear();

    if (currentBoxHelper) {

        scene.remove(currentBoxHelper);

        currentBoxHelper = null;

    }

}

// ============================================
// Camera Utilities
// ============================================

function fitCameraToObject(object, offset = 1.5) {

    const box = new THREE.Box3().setFromObject(object);

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);

    const fov = camera.fov * (Math.PI / 180);

    let cameraDistance = maxDim / (2 * Math.tan(fov / 2));

    cameraDistance *= offset;

    camera.near = Math.max(cameraDistance / 1000, 0.01);
    camera.far = cameraDistance * 100;

    camera.updateProjectionMatrix();

    camera.position.set(
        center.x,
        center.y + maxDim * 0.3,
        center.z + cameraDistance
    );

    controls.target.copy(center);
    controls.update();
}

function centerModel(model) {

    const box = new THREE.Box3().setFromObject(model);

    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);

}

function normalizeModelScale(model) {

    const box = new THREE.Box3().setFromObject(model);

    const size = box.getSize(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);

    if (maxSize === 0) return;

    let scale = 1;

    if (maxSize > 1000) {

        scale = 1 / maxSize;

    }

    else if (maxSize < 0.1) {

        scale = 10 / maxSize;

    }

    model.scale.multiplyScalar(scale);

}

// ============================================
// Load Model
// ============================================

fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    clearSceneModel();

    console.clear();

    console.log("Loading:", file.name);

    loader.load(

        url,

        (gltf) => {

            currentModel = gltf.scene;

            scene.add(currentModel);

            normalizeModelScale(currentModel);

            centerModel(currentModel);

            fitCameraToObject(currentModel);

            originalMaterials.clear();

            let meshCount = 0;

            currentModel.traverse((child) => {

                if (!child.isMesh) return;

                meshCount++;

                originalMaterials.set(child, child.material);

                child.castShadow = true;

                child.receiveShadow = true;

                child.material.side = THREE.DoubleSide;

                child.material.clippingPlanes = [clippingPlane];

                child.material.clipShadows = true;

            });

            currentBoxHelper = new THREE.BoxHelper(
                currentModel,
                0xffff00
            );

            scene.add(currentBoxHelper);

            const box = new THREE.Box3().setFromObject(currentModel);

            const size = box.getSize(new THREE.Vector3());

            console.log("========== MODEL ==========");
            console.log("Meshes:", meshCount);
            console.log("Size:", size);
            console.log("Min:", box.min);
            console.log("Max:", box.max);
            console.log("===========================");

            URL.revokeObjectURL(url);

            console.log("Model loaded successfully");

        },

        (xhr) => {

            if (xhr.total) {

                console.log(
                    `${((xhr.loaded / xhr.total) * 100).toFixed(0)}% loaded`
                );

            }

        },

        (error) => {

            console.error(error);

            alert("Unable to load model.");

            URL.revokeObjectURL(url);

        }

    );

});

// ============================================
// Animation Loop
// ============================================

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    controls.update(delta);

    if (currentModel && autoRotateSwitch.checked) {

        currentModel.rotation.y += 0.005;

    }

    if (currentBoxHelper) {

        currentBoxHelper.update();

    }

    renderer.render(scene, camera);

}

animate();

// ============================================
// Resize Handling
// ============================================

function onWindowResize() {

    const width = mainContent.clientWidth;
    const height = mainContent.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}

const resizeObserver = new ResizeObserver(() => {

    onWindowResize();

});

resizeObserver.observe(mainContent);

window.addEventListener("resize", onWindowResize);

// ============================================
// Lighting Controls
// ============================================

lightSlider.addEventListener("input", (event) => {

    const intensity = parseFloat(event.target.value);

    ambientLight.intensity = intensity;

    directionalLight.intensity = intensity * 2;

    fillLight.intensity = intensity;

    lightValue.textContent = intensity.toFixed(1) + "x";

});

// ============================================
// Material Modes
// ============================================

wireframeBtn.addEventListener("click", () => {

    if (!currentModel) return;

    currentModel.traverse((child) => {

        if (!child.isMesh) return;

        child.material = wireframeMaterial;

    });

    wireframeBtn.classList.add("active");

    shadedBtn.classList.remove("active");

});

shadedBtn.addEventListener("click", () => {

    if (!currentModel) return;

    currentModel.traverse((child) => {

        if (!child.isMesh) return;

        const material = originalMaterials.get(child);

        if (material) {

            child.material = material;

        }

    });

    shadedBtn.classList.add("active");

    wireframeBtn.classList.remove("active");

});

// ============================================
// Grid Toggle
// ============================================

gridToggle.addEventListener("change", (event) => {

    gridHelper.visible = event.target.checked;

});

// ============================================
// Auto Rotate
// ============================================

autoRotateSwitch.addEventListener("change", () => {

    controls.update();

});

// ============================================
// Camera Presets
// ============================================

function setCameraView(view) {

    if (!currentModel) return;

    const box = new THREE.Box3().setFromObject(currentModel);

    const size = box.getSize(new THREE.Vector3());

    const max = Math.max(size.x, size.y, size.z);

    switch (view) {

        case "front":

            camera.position.set(0, 0, max * 2);

            break;

        case "back":

            camera.position.set(0, 0, -max * 2);

            break;

        case "left":

            camera.position.set(-max * 2, 0, 0);

            break;

        case "right":

            camera.position.set(max * 2, 0, 0);

            break;

        case "top":

            camera.position.set(0, max * 2, 0);

            break;

        case "bottom":

            camera.position.set(0, -max * 2, 0);

            break;

        case "iso":

        default:

            camera.position.set(
                max * 1.5,
                max * 1.2,
                max * 1.5
            );

            break;

    }

    controls.target.set(0, 0, 0);

    controls.update();

}

// ============================================
// Measurement Tool
// ============================================

let measureMode = false;

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();

let measurePoints = [];
let measureObjects = [];

// Toggle Measure Mode
measureToggle.addEventListener("change", (event) => {

    measureMode = event.target.checked;

    clearMeasurements();

});

// ============================================
// Clear Measurements
// ============================================

function clearMeasurements() {

    measurePoints = [];

    measureObjects.forEach((obj) => {

        scene.remove(obj);

        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {

            if (Array.isArray(obj.material)) {

                obj.material.forEach(m => m.dispose());

            } else {

                obj.material.dispose();

            }

        }

    });

    measureObjects = [];

}

// ============================================
// Mouse Picking
// ============================================

renderer.domElement.addEventListener("pointerdown", (event) => {

    if (!measureMode) return;

    if (!currentModel) return;

    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    mouse.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(
        currentModel,
        true
    );

    if (intersects.length === 0) return;

    const point = intersects[0].point.clone();

    measurePoints.push(point);

    createMeasurePoint(point);

    if (measurePoints.length === 2) {

        createMeasurement(
            measurePoints[0],
            measurePoints[1]
        );

        measurePoints = [];

    }

});

// ============================================
// Point Marker
// ============================================

function createMeasurePoint(position) {

    const geometry = new THREE.SphereGeometry(
        0.03,
        16,
        16
    );

    const material = new THREE.MeshBasicMaterial({

        color: 0xff0000

    });

    const sphere = new THREE.Mesh(
        geometry,
        material
    );

    sphere.position.copy(position);

    scene.add(sphere);

    measureObjects.push(sphere);

}

// ============================================
// Measurement Line
// ============================================

function createMeasurement(start, end) {

    const geometry = new THREE.BufferGeometry().setFromPoints([
        start,
        end
    ]);

    const material = new THREE.LineBasicMaterial({

        color: 0xffff00

    });

    const line = new THREE.Line(
        geometry,
        material
    );

    scene.add(line);

    measureObjects.push(line);

    const distance = start.distanceTo(end);

    console.log(
        "Distance:",
        distance.toFixed(3),
        "units"
    );

    createDistanceSprite(
        start,
        end,
        distance
    );

}

// ============================================
// Distance Label
// ============================================

function createDistanceSprite(start, end, distance) {

    const canvas = document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 64;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";

    ctx.font = "28px Arial";

    ctx.fillText(
        `${distance.toFixed(2)} units`,
        10,
        40
    );

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({

        map: texture,

        depthTest: false

    });

    const sprite = new THREE.Sprite(material);

    // Initial scale is no longer needed as it's dynamically set in the animate loop
    // sprite.scale.set(
    //     1,
    //     0.25,
    //     1
    // );

    sprite.position.copy(
        start.clone().lerp(end, 0.5)
    );

    scene.add(sprite);

    measureObjects.push(sprite);

}

// ============================================
// Keyboard Shortcuts
// ============================================

window.addEventListener("keydown", (event) => {

    switch (event.key.toLowerCase()) {

        case "g":

            gridHelper.visible = !gridHelper.visible;

            break;

        case "w":

            wireframeBtn.click();

            break;

        case "s":

            shadedBtn.click();

            break;

        case "c":

            fitCameraToObject(currentModel);

            break;

        case "escape":

            clearMeasurements();

            break;

    }

});

// ============================================
// Drag & Drop Support
// ============================================

mainContent.addEventListener("dragover", (event) => {

    event.preventDefault();

    mainContent.style.outline = "2px dashed #00e5ff";

});

mainContent.addEventListener("dragleave", () => {

    mainContent.style.outline = "none";

});

mainContent.addEventListener("drop", (event) => {

    event.preventDefault();

    mainContent.style.outline = "none";

    if (!event.dataTransfer.files.length) return;

    const file = event.dataTransfer.files[0];

    if (
        !file.name.toLowerCase().endsWith(".glb") &&
        !file.name.toLowerCase().endsWith(".gltf")
    ) {

        alert("Please drop a .glb or .gltf file.");

        return;

    }

    fileInput.files = event.dataTransfer.files;

    fileInput.dispatchEvent(new Event("change"));

});

// ============================================
// Model Statistics
// ============================================

function printModelStatistics(model) {

    let meshes = 0;
    let vertices = 0;
    let triangles = 0;

    model.traverse((child) => {

        if (!child.isMesh) return;

        meshes++;

        const geometry = child.geometry;

        if (!geometry) return;

        if (geometry.attributes.position) {

            vertices += geometry.attributes.position.count;

        }

        if (geometry.index) {

            triangles += geometry.index.count / 3;

        } else if (geometry.attributes.position) {

            triangles += geometry.attributes.position.count / 3;

        }

    });

    console.log("========== MODEL STATS ==========");
    console.log("Meshes:", meshes);
    console.log("Vertices:", vertices);
    console.log("Triangles:", triangles);
    console.log("================================");

}

// ============================================
// Optional Clipping Controls
// ============================================

let clippingEnabled = true;

function enableClipping(enabled) {

    clippingEnabled = enabled;

    if (!currentModel) return;

    currentModel.traverse((child) => {

        if (!child.isMesh) return;

        if (enabled) {

            child.material.clippingPlanes = [clippingPlane];

        } else {

            child.material.clippingPlanes = [];

        }

        child.material.needsUpdate = true;

    });

}

// ============================================
// Reset Viewer
// ============================================

function resetViewer() {

    clearMeasurements();

    if (!currentModel) return;

    currentModel.rotation.set(0, 0, 0);

    fitCameraToObject(currentModel);

}

// ============================================
// Debug Helpers
// ============================================

window.viewer = {

    scene,
    camera,
    renderer,
    controls,

    currentModel,

    fitCamera: () => {

        if (currentModel) {

            fitCameraToObject(currentModel);

        }

    },

    reset: resetViewer,

    stats: () => {

        if (currentModel) {

            printModelStatistics(currentModel);

        }

    }

};

// ============================================
// Final Initialization
// ============================================

console.log("======================================");
console.log("3D Viewer Ready");
console.log("======================================");

console.log("Keyboard Shortcuts");
console.log("G = Toggle Grid");
console.log("W = Wireframe");
console.log("S = Shaded");
console.log("C = Fit Camera");
console.log("ESC = Clear Measurements");

console.log("Drag & Drop Enabled");

onWindowResize();