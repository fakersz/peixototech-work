import * as THREE from 'three';

export function createLighting(scene) {
  const ambient = new THREE.HemisphereLight('#f2f5f5', '#727978', 2.4);
  const sun = new THREE.DirectionalLight('#fff6e7', 3.2);
  sun.position.set(3, 7, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  const fill = new THREE.DirectionalLight('#dce9f1', 0.8);
  fill.position.set(-3, 4, -2);
  scene.add(ambient, sun, fill);
  return () => sun.shadow.dispose();
}
