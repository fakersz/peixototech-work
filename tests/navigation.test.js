import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { createFurniture } from '../src/scene/createFurniture.js';
import { createRoomNavigation } from '../src/interaction/roomNavigation.js';
import { createJean } from '../src/characters/createJean.js';

test('Routes around office furniture remain in free space, including clicks inside a desk', () => {
  const { obstacles } = createFurniture();
  const navigation = createRoomNavigation(obstacles);
  const home = new Vector3(0.76, 0, 0.35);
  for (const end of [new Vector3(-1.1, 0, -1), new Vector3(-0.4, 0, -0.4), new Vector3(-0.2, 0, 1)]) {
    const jean = createJean({ navigation, start: home });
    jean.moveTo(end);
    for (let i = 0; i < 1000; i++) {
      jean.update(1 / 60, new Vector3());
      assert.ok(navigation.isFree(jean.group.position), 'Jean intersected furniture');
    }
    assert.ok(jean.group.position.distanceTo(jean.target) < 0.006);
  }
});

test('Keyboard cannot cross the desk even when held down', () => {
  const navigation = createRoomNavigation(createFurniture().obstacles);
  const jean = createJean({ navigation, start: new Vector3(0.76, 0, -0.4) });
  for (let i = 0; i < 300; i++) {
    jean.update(1 / 60, new Vector3(-1, 0, 0));
    assert.ok(navigation.isFree(jean.group.position));
  }
  assert.ok(jean.group.position.x >= 0.49);
});
