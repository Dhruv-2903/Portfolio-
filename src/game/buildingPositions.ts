export interface BuildingConfig {
  id: string;
  key: string;
  name: string;
  x: number;
}

export const DEFAULT_PLAYER_SPAWN_X = 100;

export const BUILDING_CONFIGS: BuildingConfig[] = [
  { id: 'about', key: 'building-about', name: 'About', x: 450 },
  { id: 'skills', key: 'building-skills', name: 'Skills', x: 1150 },
  { id: 'projects', key: 'building-projects', name: 'Projects', x: 1850 },
  { id: 'contact', key: 'building-contact', name: 'Contact', x: 2550 }
];

export const BUILDING_POSITIONS: Record<string, number> = BUILDING_CONFIGS.reduce(
  (acc, building) => {
    acc[building.id] = building.x;
    return acc;
  },
  {} as Record<string, number>
);

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
