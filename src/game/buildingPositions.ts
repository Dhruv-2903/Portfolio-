export interface BuildingConfig {
  id: string;
  key: string;
  name: string;
  x: number;
}

export const DEFAULT_PLAYER_SPAWN_X = 100;

export const BUILDING_CONFIGS: BuildingConfig[] = [
  { id: 'about', key: 'building-about', name: 'About', x: 700 },
  { id: 'skills', key: 'building-skills', name: 'Skills', x: 2300 },
  { id: 'projects', key: 'building-projects', name: 'Projects', x: 3900 },
  { id: 'contact', key: 'building-contact', name: 'Contact', x: 5500 }
];

export const BUILDING_POSITIONS: Record<string, number> = BUILDING_CONFIGS.reduce(
  (acc, building) => {
    acc[building.id] = building.x;
    return acc;
  },
  {} as Record<string, number>
);

export const BUILDING_ELEVATIONS: Record<string, number> = {
  about: 0,
  skills: 60,
  projects: 120,
  contact: 50
};

/**
 * Returns player starting x coordinate.
 * If buildingId is specified, spawns player just outside that building's doorway (offset by -30px).
 * Otherwise returns DEFAULT_PLAYER_SPAWN_X.
 */
export const getSpawnX = (buildingId?: string): number => {
  if (buildingId && BUILDING_POSITIONS[buildingId] !== undefined) {
    return BUILDING_POSITIONS[buildingId] - 30;
  }
  return DEFAULT_PLAYER_SPAWN_X;
};

/**
 * Returns player starting y coordinate matching elevated platform base height.
 */
export const getSpawnY = (groundY: number, buildingId?: string): number => {
  if (buildingId && BUILDING_ELEVATIONS[buildingId] !== undefined) {
    return groundY - BUILDING_ELEVATIONS[buildingId];
  }
  return groundY;
};

