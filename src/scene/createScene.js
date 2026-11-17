import * as THREE from 'three';

export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e3e9ee');
  scene.fog = new THREE.Fog('#e3e9ee', 16, 40);
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 80);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.setAttribute('aria-label', 'Escritório virtual do CEO');
  container.append(renderer.domElement);

  const grid = new THREE.GridHelper(30, 30, '#a4b1c5', '#bdc7d4');
  grid.position.y = -0.15;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  scene.add(grid);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.08 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.215;
  ground.receiveShadow = true;
  scene.add(ground);
  return { scene, camera, renderer, grid };
}
