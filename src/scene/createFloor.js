import * as THREE from 'three';

export function createFloor() {
  const group = new THREE.Group();
  group.name = 'Piso da sala';
  const geometry = new THREE.BoxGeometry(1, 0.12, 1);
  const material = new THREE.MeshStandardMaterial({ color: '#e5e9e9', roughness: 0.8 });
  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: '#a1b0bd', transparent: true, opacity: 0.26 });
  const outlines = new THREE.Group();
  const tiles = [];
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      const tile = new THREE.Mesh(geometry, material);
      tile.position.set(column - 1, -0.06, row - 1);
      tile.name = `Piso ${String(tiles.length + 1).padStart(2, '0')}`;
      tile.userData = { id: `PISO-${String(tiles.length + 1).padStart(2, '0')}`, row, column, area: 1 };
      tile.receiveShadow = true;
      tile.castShadow = true;
      group.add(tile);
      tiles.push(tile);
      const outline = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      outline.position.copy(tile.position);
      outlines.add(outline);
    }
  }
  group.add(outlines);
  const platform = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.09, 3.1), new THREE.MeshStandardMaterial({ color: '#b8c5d3', roughness: 0.85 }));
  platform.position.y = -0.165;
  platform.receiveShadow = true;
  platform.castShadow = true;
  group.add(platform);
  return { group, tiles, outlines, material };
}
