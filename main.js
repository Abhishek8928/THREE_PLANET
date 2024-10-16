import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import gsap from "gsap";

// Constants
const PLANET_COUNT = 4;
const PLANET_RADIUS = 1.4;
const PLANET_SEGMENTS = 50;
const PLANET_ORBIT_RADIUS = 6;
const CAMERA_FOV = 55;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_INITIAL_Z = 8;
const SCROLL_THROTTLE_DELAY = 2000;
const ROTATION_ANGLE = 1.57; // Approximately PI/2

const BACKGROUND_SPHERE_RADIUS = 50;

// Scene setup
const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const camera = new THREE.PerspectiveCamera(
  CAMERA_FOV,
  window.innerWidth / window.innerHeight,
  CAMERA_NEAR,
  CAMERA_FAR
);
const planetGroup = new THREE.Group();

// Planet setup
const planetTexturePaths = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];
const planets = createPlanets(planetTexturePaths);
planetGroup.add(...planets);
scene.add(planetGroup);
planetGroup.rotation.x = 0.2;

// Camera setup
camera.position.z = CAMERA_INITIAL_Z;

// Renderer setup
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// UI elements
const headings = document.querySelectorAll(".heading-wrapper > h2");

function rotatePlanets(planets, deltaTime) {
  for (let planet of planets) {
    planet.rotation.y += deltaTime * 0.0001;
  }
}

const clock = new THREE.Clock();

function animate() {
  const deltaTime = clock.getElapsedTime();
  requestAnimationFrame(animate);
  rotatePlanets(planets, deltaTime);
  renderer.render(scene, camera);
}

// Event listeners
let lastScrollTime = 0;
let currentPlanetIndex = 0;
window.addEventListener("wheel", throttledScroll);
window.addEventListener("resize", handleWindowResize);
canvas.addEventListener("webglcontextlost", handleContextLost, false);
canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

// Start animation
animate();

const backgroundTexture = textureLoader.load(
  "./stars.jpg"
);
backgroundTexture.colorSpace = THREE.SRGBColorSpace;
const backgroundGeometry = new THREE.SphereGeometry(
  BACKGROUND_SPHERE_RADIUS,
  64,
  64
);
const backgroundMaterial = new THREE.MeshBasicMaterial({
  map: backgroundTexture,
  side: THREE.BackSide,
  transparent:true,
  opacity:0.4
});
const backgroundSphere = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(backgroundSphere);

// Function definitions
function createPlanets(texturePaths) {
  const meshes = [];
  for (let i = 0; i < PLANET_COUNT; i++) {
    const geometry = new THREE.SphereGeometry(
      PLANET_RADIUS,
      PLANET_SEGMENTS,
      PLANET_SEGMENTS
    );
    const texture = textureLoader.load(texturePaths[i]);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);

    const angle = i * ROTATION_ANGLE;
    mesh.position.x = PLANET_ORBIT_RADIUS * Math.cos(angle);
    mesh.position.z = PLANET_ORBIT_RADIUS * Math.sin(angle);

    meshes.push(mesh);
  }
  return meshes;
}
let resetHandlerValue = 0;
function throttledScroll(event) {
  const currentTime = Date.now();
  if (currentTime - lastScrollTime < SCROLL_THROTTLE_DELAY) return;
  lastScrollTime = currentTime;
  
  const value = (resetHandlerValue + 1) % 4
  console.log(value)
  if (value !== 0) {
    gsap.to(headings, {
      y: `-=${100}%`,
      duration: 1,
    });
  }
  
  gsap.to(planetGroup.rotation, {
    y: `-=${ROTATION_ANGLE}`,
    duration: 1,
    ease: "circ.out",
  });
  resetHandlerValue++;

  if (value === 0) {
    gsap.to(headings, {
      y: "0",
      duration: 1,
      ease: "circ.out",
    });
  }
}

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleContextLost(event) {
  event.preventDefault();
  console.log("WebGL context lost");
}

function handleContextRestored() {
  console.log("WebGL context restored");
}
