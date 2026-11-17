import * as THREE from 'three';

export function createOfficeSign() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 192;
  const context = canvas.getContext('2d');
  context.fillStyle = '#f4f5ef'; context.fillRect(0, 0, 1024, 192);
  context.fillStyle = '#315ee8'; context.fillRect(36, 63, 60, 60);
  context.fillStyle = '#34415a'; context.font = '600 57px sans-serif'; context.fillText('PEIXOTO TECH', 128, 114);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.178), new THREE.MeshBasicMaterial({ map: texture }));
  sign.position.set(0.02, 1.28, -1.493);
  return sign;
}
