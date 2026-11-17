import * as THREE from 'three';

export function createJean({ navigation = null, start = new THREE.Vector3() } = {}) {
  const group = new THREE.Group();
  group.name = 'Jean — CEO';
  group.position.copy(start);
  const body = new THREE.Group();
  group.add(body);
  const material = color => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true });
  const skin = material('#cf9672');
  const hair = material('#302a29');
  const jacket = material('#315ee8');
  const shirt = material('#f4f6fc');
  const pants = material('#25314c');
  const shoes = material('#182038');
  const glasses = material('#192238');
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  function box(parent, size, position, mat) {
    const mesh = new THREE.Mesh(boxGeometry, mat);
    mesh.scale.set(...size);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  box(body, [0.44, 0.5, 0.27], [0, 0.98, 0], jacket);
  box(body, [0.15, 0.43, 0.014], [0, 1.01, 0.143], shirt);
  box(body, [0.105, 0.1, 0.15], [0, 1.28, 0], skin);
  const head = new THREE.Group();
  head.position.y = 1.48;
  body.add(head);
  box(head, [0.36, 0.36, 0.32], [0, 0, 0], skin);
  box(head, [0.385, 0.105, 0.34], [0, 0.165, -0.005], hair);
  box(head, [0.37, 0.2, 0.08], [0, 0.04, -0.15], hair);
  box(head, [0.29, 0.065, 0.02], [0, -0.133, 0.163], hair);
  box(head, [0.055, 0.065, 0.06], [0, -0.015, 0.175], skin);
  for (const side of [-1, 1]) {
    // Thin rectangular frames, with open centers so the face remains readable.
    const x = side * 0.088;
    for (const y of [0.015, 0.095]) box(head, [0.135, 0.018, 0.025], [x, y, 0.169], glasses);
    for (const dx of [-0.059, 0.059]) box(head, [0.017, 0.08, 0.025], [x + dx, 0.055, 0.169], glasses);
    box(head, [0.025, 0.029, 0.012], [x, 0.052, 0.165], glasses);
  }
  box(head, [0.05, 0.018, 0.025], [0, 0.06, 0.169], glasses);
  const legs = [];
  const arms = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.115, 0.74, 0);
    body.add(leg);
    box(leg, [0.17, 0.61, 0.19], [0, -0.305, 0], pants);
    box(leg, [0.19, 0.12, 0.29], [0, -0.68, 0.045], shoes);
    legs.push(leg);
    const arm = new THREE.Group();
    arm.position.set(side * 0.28, 1.18, 0);
    body.add(arm);
    box(arm, [0.14, 0.41, 0.2], [0, -0.19, 0], jacket);
    box(arm, [0.12, 0.14, 0.15], [0, -0.45, 0.01], skin);
    arms.push(arm);
  }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.31, 0.335, 48), new THREE.MeshBasicMaterial({ color: '#557bf0', transparent: true, opacity: 0.55, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.006;
  group.add(ring);
  group.rotation.y = Math.PI / 4;
  const target = start.clone();
  let route = [];
  const direction = new THREE.Vector3();
  let time = 0;
  let waveTime = 0;
  let moving = false;
  let walkBlend = 0;
  const limit = 1.16;
  function moveTo(point) {
    target.set(THREE.MathUtils.clamp(point.x, -limit, limit), 0, THREE.MathUtils.clamp(point.z, -limit, limit));
    route = navigation ? navigation.findPath(group.position, target) : [];
    if (navigation) target.copy(route.at(-1) ?? group.position);
    waveTime = 0;
  }
  return {
    group,
    target,
    get moving() { return moving; },
    get waving() { return waveTime > 0; },
    moveTo,
    wave() { route = []; target.copy(group.position); waveTime = 2.2; },
    update(delta, keyboardDirection) {
      time += delta;
      if (keyboardDirection.lengthSq() > 0) {
        route = [];
        direction.copy(keyboardDirection).multiplyScalar(delta * 1.05).add(group.position);
        direction.x = THREE.MathUtils.clamp(direction.x, -limit, limit);
        direction.z = THREE.MathUtils.clamp(direction.z, -limit, limit);
        target.copy(navigation ? navigation.resolveStep(group.position, direction) : direction);
        waveTime = 0;
      }
      while (route.length && route[0].distanceTo(group.position) < 0.006) route.shift();
      direction.subVectors(route[0] ?? target, group.position);
      const distance = direction.length();
      moving = distance > 0.006;
      if (moving) {
        group.position.addScaledVector(direction, Math.min(1, delta * 1.15 / distance));
        const angle = Math.atan2(direction.x, direction.z);
        group.rotation.y += Math.atan2(Math.sin(angle - group.rotation.y), Math.cos(angle - group.rotation.y)) * Math.min(1, delta * 12);
      }
      walkBlend = THREE.MathUtils.damp(walkBlend, moving ? 1 : 0, 10, delta);
      const stride = Math.sin(time * 9) * 0.36 * walkBlend;
      legs[0].rotation.x = THREE.MathUtils.damp(legs[0].rotation.x, stride, 18, delta);
      legs[1].rotation.x = -legs[0].rotation.x;
      arms[0].rotation.x = -legs[0].rotation.x * 0.65;
      arms[1].rotation.x = legs[0].rotation.x * 0.65;
      waveTime = Math.max(0, waveTime - delta);
      arms[1].rotation.z = THREE.MathUtils.damp(arms[1].rotation.z, waveTime > 0 ? 2.45 + Math.sin(time * 15) * 0.22 : 0, 12, delta);
      body.position.y = Math.abs(Math.sin(time * 9)) * 0.018 * walkBlend + Math.sin(time * 2.2) * 0.006 * (1 - walkBlend);
      head.rotation.y = Math.sin(time * 0.8) * 0.035 * (1 - walkBlend);
    },
  };
}
