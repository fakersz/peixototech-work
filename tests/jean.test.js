import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { createJean } from '../src/characters/createJean.js';
import { createWalls } from '../src/scene/createWalls.js';

const idleInput = new Vector3();

test('Jean walks to a destination without overshooting or leaving the room', () => {
  const jean = createJean();
  jean.moveTo({ x: 100, z: -100 });
  assert.equal(jean.target.x, 1.16);
  assert.equal(jean.target.z, -1.16);
  for (let i = 0; i < 200; i++) jean.update(1 / 60, idleInput);
  assert.ok(jean.group.position.distanceTo(jean.target) < 0.006);
  assert.equal(jean.moving, false);
});

test('Keyboard movement stops at the room boundary', () => {
  const jean = createJean();
  for (let i = 0; i < 500; i++) jean.update(1 / 60, new Vector3(1, 0, 0));
  assert.ok(jean.group.position.x <= 1.16);
  assert.ok(jean.group.position.x > 1.15);
  assert.equal(jean.group.position.y, 0);
});

test('Waving stops the walk, finishes, and Jean can return to the center', () => {
  const jean = createJean();
  jean.moveTo({ x: 1, z: 1 });
  jean.update(0.5, idleInput);
  jean.wave();
  const start = jean.group.position.clone();
  assert.equal(jean.waving, true);
  for (let i = 0; i < 150; i++) jean.update(1 / 60, idleInput);
  assert.equal(jean.waving, false);
  assert.ok(jean.group.position.equals(start));
  jean.moveTo({ x: 0, z: 0 });
  for (let i = 0; i < 150; i++) jean.update(1 / 60, idleInput);
  assert.ok(jean.group.position.length() < 0.006);
});

test('Both walls have a cutaway height of 1.45 m', () => {
  const { walls } = createWalls();
  assert.equal(walls.length, 2);
  for (const wall of walls) {
    assert.equal(wall.geometry.parameters.height, 1.45);
    assert.equal(wall.position.y, 1.45 / 2);
  }
});
