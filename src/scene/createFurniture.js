import * as THREE from 'three';

export function createFurniture() {
  const group = new THREE.Group();
  group.name = 'Escritório executivo';
  const mats = Object.fromEntries(Object.entries({ white: '#edf0ef', oak: '#cfb991', blue: '#3465cf', dark: '#26364d', metal: '#8f9caa', screen: '#172d45', green: '#659b7c', pot: '#e6e9e3', paper: '#faf8ef' }).map(([key, color]) => [key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true })]));
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  function box(parent, size, position, material) {
    const mesh = new THREE.Mesh(boxGeometry, mats[material]);
    mesh.scale.set(...size); mesh.position.set(...position);
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
    return mesh;
  }
  function item(name, x, z) { const obj = new THREE.Group(); obj.name = name; obj.position.set(x, 0, z); group.add(obj); return obj; }
  const desk = item('Mesa do CEO', -0.38, -0.43);
  box(desk, [1.24, 0.065, 0.62], [0, 0.75, 0], 'oak');
  box(desk, [1.22, 0.025, 0.60], [0, 0.708, 0], 'white');
  for (const x of [-0.5, 0.5]) box(desk, [0.045, 0.7, 0.48], [x, 0.35, 0], 'white');
  box(desk, [0.98, 0.24, 0.025], [0, 0.51, -0.18], 'white');
  // Monitor faces the chair behind the desk; its blue rear badge faces the room.
  box(desk, [0.21, 0.025, 0.14], [-0.12, 0.8, -0.05], 'metal');
  box(desk, [0.035, 0.18, 0.035], [-0.12, 0.89, -0.05], 'metal');
  box(desk, [0.46, 0.29, 0.035], [-0.12, 1.08, -0.05], 'dark');
  box(desk, [0.42, 0.245, 0.005], [-0.12, 1.08, -0.071], 'screen');
  box(desk, [0.055, 0.055, 0.005], [-0.12, 1.08, -0.029], 'blue');
  box(desk, [0.29, 0.018, 0.1], [-0.12, 0.796, -0.23], 'metal');
  box(desk, [0.17, 0.025, 0.22], [0.38, 0.797, 0.03], 'blue');
  box(desk, [0.15, 0.008, 0.2], [0.38, 0.815, 0.03], 'paper');
  box(desk, [0.07, 0.09, 0.07], [-0.45, 0.825, -0.14], 'white');
  function chair(name, x, z, executive = false) {
    const obj = item(name, x, z);
    const color = executive ? 'dark' : 'blue';
    box(obj, [0.44, 0.09, 0.43], [0, 0.44, 0], color);
    box(obj, [0.44, executive ? 0.5 : 0.34, 0.07], [0, executive ? 0.73 : 0.65, -0.20], color);
    for (const side of [-1, 1]) {
      box(obj, [0.04, 0.18, 0.04], [side * 0.235, 0.53, 0], 'metal');
      box(obj, [0.065, 0.04, 0.3], [side * 0.235, 0.63, 0], color);
    }
    if (executive) {
      box(obj, [0.055, 0.34, 0.055], [0, 0.22, 0], 'metal');
      box(obj, [0.45, 0.04, 0.055], [0, 0.055, 0], 'metal');
      box(obj, [0.055, 0.04, 0.4], [0, 0.055, 0], 'metal');
      for (const s of [-1, 1]) box(obj, [0.07, 0.06, 0.07], [s * 0.2, 0.03, 0], 'dark');
    } else for (const x of [-0.17, 0.17]) for (const z of [-0.16, 0.16]) box(obj, [0.035, 0.4, 0.035], [x, 0.2, z], 'metal');
    return obj;
  }
  chair('Cadeira do CEO', -0.38, -1.08, true);
  chair('Poltrona de visitante', -0.91, 0.87).rotation.y = Math.PI;
  const plant = item('Planta decorativa', 1.04, -1.08);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.27, 8), mats.pot);
  pot.position.y = 0.135; pot.castShadow = true; plant.add(pot);
  box(plant, [0.035, 0.47, 0.035], [0, 0.47, 0], 'oak');
  const foliage = new THREE.IcosahedronGeometry(0.23, 0);
  for (const [x, y, z, scale] of [[0, 0.8, 0, 1], [-0.1, 0.6, 0.04, 0.8], [0.12, 0.65, -0.03, 0.75]]) {
    const leaf = new THREE.Mesh(foliage, mats.green); leaf.position.set(x, y, z); leaf.scale.set(scale, scale * 1.3, scale); leaf.castShadow = true; plant.add(leaf);
  }
  return {
    group,
    // Footprints include seats and armrests. Navigation adds clearance for Jean.
    obstacles: [
      { minX: -1, maxX: 0.24, minZ: -0.74, maxZ: -0.12 },
      { minX: -0.65, maxX: -0.11, minZ: -1.32, maxZ: -0.84 },
      { minX: -1.18, maxX: -0.64, minZ: 0.63, maxZ: 1.11 },
      { minX: 0.84, maxX: 1.24, minZ: -1.28, maxZ: -0.88 },
    ],
  };
}
