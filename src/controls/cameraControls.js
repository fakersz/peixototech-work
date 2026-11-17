import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createCameraControls(camera, canvas, onManualChange) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.55;
  controls.screenSpacePanning = false;
  controls.minDistance = 4.5;
  controls.maxDistance = 11;
  controls.minPolarAngle = 0.001;
  controls.maxPolarAngle = Math.PI / 2.8;
  controls.minAzimuthAngle = 0.12;
  controls.maxAzimuthAngle = Math.PI / 2 - 0.12;
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  controls.zoomSpeed = 0.8;
  controls.panSpeed = 0.7;
  const center = new THREE.Vector3(0, 0.72, 0);
  const offset = new THREE.Vector3();
  const previousTarget = new THREE.Vector3();

  function constrainTarget() {
    previousTarget.copy(controls.target);
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, -0.45, 0.45);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, -0.45, 0.45);
    controls.target.y = center.y;
    // Translate both camera and target, preserving the orbit at the pan limits.
    camera.position.add(offset.subVectors(controls.target, previousTarget));
  }
  controls.addEventListener('change', constrainTarget);
  controls.addEventListener('start', onManualChange);

  function setView(view) {
    // Flush damping before applying an exact preset.
    controls.enableDamping = false;
    controls.update();
    controls.target.copy(center);
    const scale = Math.max(1, 0.95 / camera.aspect);
    const positions = {
      isometric: new THREE.Vector3(3.7, 4.2, 4.3),
      top: new THREE.Vector3(0.001, 6, 0.008),
      front: new THREE.Vector3(0.6, 2.5, 5.3),
    };
    offset.copy(positions[view] ?? positions.isometric).multiplyScalar(scale);
    controls.maxDistance = Math.max(11, offset.length() * 1.2);
    camera.position.copy(center).add(offset);
    controls.update();
    controls.enableDamping = true;
  }
  setView('isometric');
  return {
    controls,
    setView,
    center() {
      controls.enableDamping = false;
      controls.update();
      offset.subVectors(camera.position, controls.target);
      controls.target.copy(center);
      camera.position.copy(center).add(offset);
      controls.update();
      controls.enableDamping = true;
    },
    dispose() {
      controls.removeEventListener('change', constrainTarget);
      controls.removeEventListener('start', onManualChange);
      controls.dispose();
    },
  };
}
