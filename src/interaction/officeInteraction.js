import * as THREE from 'three';

export function createOfficeInteraction({ scene, camera, canvas, tiles, walls, jean, label, furniture }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const keys = new Set();
  const keyDirection = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const anchor = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const objects = [...tiles, ...walls, furniture, jean.group].filter(Boolean);
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.10, 0.13, 32), new THREE.MeshBasicMaterial({ color: '#315ee8', transparent: true, opacity: 0.7, depthWrite: false }));
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.008;
  marker.visible = false;
  scene.add(marker);
  const events = new AbortController();
  const options = { signal: events.signal };
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  let down = null;
  let markerAge = 0;
  const pointers = new Set();
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'Escritório de Jean, CEO. Clique no chão para caminhar, use WASD ou setas. Arraste para girar a câmera.');
  function getHit(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    scene.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(objects, true)[0];
  }
  canvas.addEventListener('pointerdown', event => {
    pointers.add(event.pointerId);
    canvas.focus({ preventScroll: true });
    if (pointers.size === 1 && event.button === 0) down = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
    else down = null;
  }, options);
  canvas.addEventListener('pointermove', event => {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) down.dragged = true;
    if (!pointers.size) {
      const hit = getHit(event);
      let object = hit?.object;
      while (object && object !== jean.group) object = object.parent;
      canvas.style.cursor = hit && (tiles.includes(hit.object) || object === jean.group) ? 'pointer' : 'grab';
    } else canvas.style.cursor = 'grabbing';
  }, options);
  canvas.addEventListener('pointerup', event => {
    pointers.delete(event.pointerId);
    const click = down && down.id === event.pointerId && !down.dragged && Math.hypot(event.clientX - down.x, event.clientY - down.y) < 5;
    down = null;
    if (!click) return;
    const hit = getHit(event);
    if (!hit) return;
    let object = hit.object;
    while (object && object !== jean.group) object = object.parent;
    if (object === jean.group) { jean.wave(); return; }
    if (tiles.includes(hit.object) && hit.face.normal.y > 0.5) {
      jean.moveTo(hit.point);
      marker.position.set(jean.target.x, 0.008, jean.target.z);
      marker.visible = true;
      markerAge = 0;
    }
  }, options);
  function cancel(event) { pointers.delete(event.pointerId); down = null; }
  canvas.addEventListener('pointercancel', cancel, options);
  canvas.addEventListener('lostpointercapture', cancel, options);
  window.addEventListener('keydown', event => {
    if (!movementKeys.has(event.code) || (event.target !== canvas && event.target !== document.body) || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    keys.add(event.code);
  }, options);
  window.addEventListener('keyup', event => keys.delete(event.code), options);
  window.addEventListener('blur', () => { keys.clear(); down = null; pointers.clear(); }, options);
  canvas.addEventListener('blur', () => keys.clear(), options);
  document.addEventListener('visibilitychange', () => keys.clear(), options);

  return {
    update(delta) {
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, camera.up).normalize();
      const x = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
      const z = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'));
      keyDirection.copy(forward).multiplyScalar(z).addScaledVector(right, x).normalize();
      jean.update(delta, keyDirection);
      markerAge += delta;
      marker.material.opacity = Math.max(0, 0.65 - markerAge * 0.35);
      marker.visible = marker.visible && markerAge < 1.8 && jean.moving;
      anchor.copy(jean.group.position).y = 1.98;
      projected.copy(anchor).project(camera);
      raycaster.set(camera.position, forward.subVectors(anchor, camera.position).normalize());
      const obstruction = raycaster.intersectObjects(walls, false)[0];
      label.hidden = projected.z > 1 || projected.z < -1 || Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Boolean(obstruction && obstruction.distance < camera.position.distanceTo(anchor));
      label.style.transform = `translate(-50%, -100%) translate(${(projected.x * 0.5 + 0.5) * canvas.clientWidth}px, ${(-projected.y * 0.5 + 0.5) * canvas.clientHeight}px)`;
    },
    dispose() {
      events.abort();
      scene.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
    },
  };
}
