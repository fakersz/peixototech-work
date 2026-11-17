import * as THREE from 'three';

export function createWalls() {
  const group = new THREE.Group();
  group.name = 'Paredes da sala';
  const material = new THREE.MeshStandardMaterial({ color: '#dce0dd', roughness: 0.92 });
  const height = 1.45;
  const geometry = new THREE.BoxGeometry(3, height, 0.12);
  const back = new THREE.Mesh(geometry, material);
  back.name = 'Parede do fundo';
  back.position.set(0, height / 2, -1.56);
  const left = new THREE.Mesh(geometry, material);
  left.name = 'Parede esquerda';
  left.rotation.y = Math.PI / 2;
  left.position.set(-1.56, height / 2, 0);
  for (const wall of [back, left]) {
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.type = 'wall';
    group.add(wall);
  }
  // Blue architectural accents echo the floating toolbar and reference image.
  const trimMaterial = new THREE.MeshStandardMaterial({ color: '#315ee8', roughness: 0.75 });
  const trimGeometry = new THREE.BoxGeometry(3, 0.045, 0.025);
  const backTrim = new THREE.Mesh(trimGeometry, trimMaterial);
  backTrim.position.set(0, 0.06, -1.487);
  const leftTrim = new THREE.Mesh(trimGeometry, trimMaterial);
  leftTrim.rotation.y = Math.PI / 2;
  leftTrim.position.set(-1.487, 0.06, 0);
  group.add(backTrim, leftTrim);
  const capMaterial = new THREE.MeshStandardMaterial({ color: '#f5f4ed', roughness: 0.8 });
  const capGeometry = new THREE.BoxGeometry(3.12, 0.045, 0.16);
  const backCap = new THREE.Mesh(capGeometry, capMaterial);
  backCap.position.set(-0.04, height + 0.012, -1.56);
  const leftCap = new THREE.Mesh(capGeometry, capMaterial);
  leftCap.rotation.y = Math.PI / 2;
  leftCap.position.set(-1.56, height + 0.012, -0.04);
  group.add(backCap, leftCap);
  const corner = new THREE.Mesh(new THREE.BoxGeometry(0.12, height, 0.12), material);
  corner.position.set(-1.56, height / 2, -1.56);
  group.add(corner);
  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.57, 1.04), capMaterial);
  windowFrame.position.set(-1.487, 0.96, -0.24);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.47, 0.94), new THREE.MeshStandardMaterial({ color: '#b7d0dd', roughness: 0.4, metalness: 0.15 }));
  glass.position.set(-1.46, 0.96, -0.24);
  const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.49, 0.025), capMaterial);
  mullion.position.set(-1.444, 0.96, -0.24);
  group.add(windowFrame, glass, mullion);
  return { group, walls: [back, left] };
}
