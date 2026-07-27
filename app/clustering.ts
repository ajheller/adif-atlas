export type ProjectedItem<T> = {
  item: T;
  x: number;
  y: number;
};

export type PointCluster<T> = {
  items: T[];
  x: number;
  y: number;
};

/**
 * Groups projected points that are within `radius` screen units of one
 * another. A small spatial index keeps this quick for large ADIF logs.
 */
export function clusterProjectedItems<T>(
  points: ProjectedItem<T>[],
  radius: number,
): PointCluster<T>[] {
  if (!points.length) return [];
  if (radius <= 0) {
    return points.map(({ item, x, y }) => ({ items: [item], x, y }));
  }

  const cellSize = radius;
  const radiusSquared = radius * radius;
  const cells = new Map<string, number[]>();
  const parent = points.map((_, index) => index);

  const find = (index: number): number => {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    while (parent[index] !== index) {
      const next = parent[index];
      parent[index] = root;
      index = next;
    }
    return root;
  };

  const union = (first: number, second: number) => {
    const firstRoot = find(first);
    const secondRoot = find(second);
    if (firstRoot !== secondRoot) parent[secondRoot] = firstRoot;
  };

  points.forEach((point, index) => {
    const cellX = Math.floor(point.x / cellSize);
    const cellY = Math.floor(point.y / cellSize);

    for (let x = cellX - 1; x <= cellX + 1; x += 1) {
      for (let y = cellY - 1; y <= cellY + 1; y += 1) {
        for (const otherIndex of cells.get(`${x}:${y}`) ?? []) {
          const other = points[otherIndex];
          const deltaX = point.x - other.x;
          const deltaY = point.y - other.y;
          if (deltaX * deltaX + deltaY * deltaY <= radiusSquared) {
            union(index, otherIndex);
          }
        }
      }
    }

    const key = `${cellX}:${cellY}`;
    const occupants = cells.get(key) ?? [];
    occupants.push(index);
    cells.set(key, occupants);
  });

  const grouped = new Map<number, ProjectedItem<T>[]>();
  points.forEach((point, index) => {
    const root = find(index);
    const group = grouped.get(root) ?? [];
    group.push(point);
    grouped.set(root, group);
  });

  return Array.from(grouped.values()).map((group) => ({
    items: group.map(({ item }) => item),
    x: group.reduce((sum, point) => sum + point.x, 0) / group.length,
    y: group.reduce((sum, point) => sum + point.y, 0) / group.length,
  }));
}

/**
 * Fans out points that would otherwise occupy the same marker. This is the
 * final expansion step for QSOs sharing a grid square or entity centroid.
 */
export function spreadOverlappingItems<T>(
  points: ProjectedItem<T>[],
  overlapRadius: number,
  ringSpacing: number,
): ProjectedItem<T>[] {
  const groups = clusterProjectedItems(points, overlapRadius);
  const spread: ProjectedItem<T>[] = [];

  for (const group of groups) {
    if (group.items.length === 1) {
      spread.push({ item: group.items[0], x: group.x, y: group.y });
      continue;
    }

    let itemIndex = 0;
    let ring = 1;
    while (itemIndex < group.items.length) {
      const capacity = ring * 8;
      const count = Math.min(capacity, group.items.length - itemIndex);
      const radius = ringSpacing * ring;
      for (let slot = 0; slot < count; slot += 1) {
        const angle = -Math.PI / 2 + (slot / count) * Math.PI * 2;
        spread.push({
          item: group.items[itemIndex++],
          x: group.x + Math.cos(angle) * radius,
          y: group.y + Math.sin(angle) * radius,
        });
      }
      ring += 1;
    }
  }

  return spread;
}
