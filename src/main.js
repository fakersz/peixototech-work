import './styles/style.css';
import { createScene } from './scene/createScene.js';
import { createFloor } from './scene/createFloor.js';
import { createWalls } from './scene/createWalls.js';
import { createLighting } from './scene/createLighting.js';
import { createCameraControls } from './controls/cameraControls.js';
import { createJean } from './characters/createJean.js';
import { createOfficeInteraction } from './interaction/officeInteraction.js';
import { createFurniture } from './scene/createFurniture.js';
import { createRoomNavigation } from './interaction/roomNavigation.js';
import { Vector3 } from 'three';
import { createOfficeSign } from './scene/createOfficeSign.js';

const viewport = document.querySelector('#viewport');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const listeners = new AbortController();
let dispose = () => {};

function showError(message) {
  const panel = document.querySelector('#error-message');
  panel.textContent = message;
  panel.hidden = false;
}

try {
  const { scene, camera, renderer, grid } = createScene(viewport);
  const floor = createFloor();
  const { group: wallGroup, walls } = createWalls();
  scene.add(floor.group, wallGroup);
  scene.add(createOfficeSign());
  grid.visible = false;
  const furniture = createFurniture();
  scene.add(furniture.group);
  const navigation = createRoomNavigation(furniture.obstacles);
  const home = new Vector3(0.76, 0, 0.35);
  const jean = createJean({ navigation, start: home });
  scene.add(jean.group);
  const disposeLighting = createLighting(scene);
  let activeView = 'isometric';
  function markView(view) {
    activeView = view;
    viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  }
  const cameraControls = createCameraControls(camera, renderer.domElement, () => markView(null));
  const interaction = createOfficeInteraction({
    scene, camera, canvas: renderer.domElement, tiles: floor.tiles, walls, jean, furniture: furniture.group,
    label: document.querySelector('#jean-label'),
  });
  const eventOptions = { signal: listeners.signal };
  document.querySelector('#wave-jean').addEventListener('click', () => jean.wave(), eventOptions);
  document.querySelector('#return-jean').addEventListener('click', () => jean.moveTo(home), eventOptions);
  viewButtons.forEach(button => button.addEventListener('click', () => {
    cameraControls.setView(button.dataset.view);
    markView(button.dataset.view);
  }, eventOptions));
  document.querySelector('#center-camera').addEventListener('click', () => cameraControls.center(), eventOptions);
  document.querySelector('#toggle-grid').addEventListener('click', event => {
    floor.outlines.visible = !floor.outlines.visible;
    event.currentTarget.setAttribute('aria-pressed', String(floor.outlines.visible));
  }, eventOptions);
  renderer.domElement.addEventListener('contextmenu', event => event.preventDefault(), eventOptions);
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    showError('A renderização 3D foi interrompida. Recarregue a página para retomar.');
  }, eventOptions);

  function resize() {
    camera.aspect = viewport.clientWidth / viewport.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    if (activeView) cameraControls.setView(activeView);
  }
  window.addEventListener('resize', resize, eventOptions);
  let frame;
  let previousTime = performance.now();
  function animate(time) {
    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    cameraControls.controls.update(delta);
    scene.updateMatrixWorld();
    interaction.update(delta);
    const activity = jean.moving ? 'Caminhando pelo escritório' : jean.waving ? 'Acenando para você' : 'No escritório';
    const activityLabel = document.querySelector('#jean-activity');
    if (activityLabel.textContent !== activity) activityLabel.textContent = activity;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  }
  frame = requestAnimationFrame(animate);

  dispose = () => {
    cancelAnimationFrame(frame);
    listeners.abort();
    interaction.dispose();
    cameraControls.dispose();
    disposeLighting();
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material));
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => {
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      material.dispose();
    });
    textures.forEach(texture => texture.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
} catch (error) {
  console.error(error);
  showError('Não foi possível iniciar o ambiente 3D. Use um navegador com WebGL 2 e aceleração gráfica habilitada.');
}

window.addEventListener('pagehide', event => { if (!event.persisted) dispose(); }, { signal: listeners.signal });
if (import.meta.hot) import.meta.hot.dispose(() => dispose());
