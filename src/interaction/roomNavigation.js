import { Vector3 } from 'three';

// A tiny, fixed grid is enough for a single furnished room. No runtime service.
export function createRoomNavigation(obstacles, clearance = 0.25) {
  const limit = 1.16;
  const count = 31;
  const step = limit * 2 / (count - 1);
  const point = index => new Vector3(-limit + (index % count) * step, 0, -limit + Math.floor(index / count) * step);
  function isFree(p) {
    return Math.abs(p.x) <= limit + 1e-8 && Math.abs(p.z) <= limit + 1e-8 && !obstacles.some(o => p.x > o.minX - clearance && p.x < o.maxX + clearance && p.z > o.minZ - clearance && p.z < o.maxZ + clearance);
  }
  const free = Array.from({ length: count * count }, (_, i) => isFree(point(i)));
  function segmentFree(a, b) {
    const n = Math.max(1, Math.ceil(a.distanceTo(b) / 0.025));
    const p = new Vector3();
    for (let i = 0; i <= n; i++) if (!isFree(p.lerpVectors(a, b, i / n))) return false;
    return true;
  }
  function findPath(start, destination) {
    // Breadth-first search covers reachable free cells; clicks in furniture resolve
    // to the nearest reachable point rather than teleporting through an obstacle.
    let first = -1, nearest = Infinity;
    for (let i = 0; i < free.length; i++) if (free[i]) {
      const d = point(i).distanceToSquared(start);
      if (d < nearest && segmentFree(start, point(i))) { nearest = d; first = i; }
    }
    if (first < 0) return [];
    const parents = new Int32Array(free.length).fill(-2);
    parents[first] = -1;
    const queue = [first];
    let best = first;
    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      if (point(current).distanceToSquared(destination) < point(best).distanceToSquared(destination)) best = current;
      const x = current % count, z = Math.floor(current / count);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (x + dx < 0 || x + dx >= count || z + dz < 0 || z + dz >= count) continue;
        const next = current + dx + dz * count;
        if (!free[next] || parents[next] !== -2) continue;
        parents[next] = current; queue.push(next);
      }
    }
    const route = [];
    for (let index = best; index !== -1; index = parents[index]) route.unshift(point(index));
    if (isFree(destination) && segmentFree(point(best), destination)) route.push(destination.clone());
    const smoothed = [];
    let from = start;
    for (let i = 0; i < route.length;) {
      let end = i;
      while (end + 1 < route.length && segmentFree(from, route[end + 1])) end++;
      smoothed.push(route[end]); from = route[end]; i = end + 1;
    }
    return smoothed;
  }
  function resolveStep(start, desired) {
    if (segmentFree(start, desired)) return desired;
    const slideX = new Vector3(desired.x, 0, start.z);
    if (segmentFree(start, slideX)) return slideX;
    const slideZ = new Vector3(start.x, 0, desired.z);
    return segmentFree(start, slideZ) ? slideZ : start.clone();
  }
  return { isFree, segmentFree, findPath, resolveStep };
}
