const GAME_ASSET_URLS = [
  '/assets/ground/ground-tile.png',
  '/assets/ground/tile_0020.png',
  '/assets/ground/tile_0021.png',
  '/assets/ground/tile_0022.png',
  '/assets/ground/tile_0023.png',
  '/assets/ground/tile_0120.png',
  '/assets/ground/tile_0121.png',
  '/assets/ground/tile_0122.png',
  '/assets/ground/tile_0123.png',
  '/assets/ground/tile_0141.png',
  '/assets/ground/tile_0142.png',
  '/assets/ground/tile_0143.png',
  '/assets/buildings/Building1aboutnobg.png',
  '/assets/buildings/Building2Skillsnobg.png',
  '/assets/buildings/Building3Projectsnobg.png',
  '/assets/buildings/Building4Contactnobg.png',
  '/assets/player/character-spritesheet.png'
];

let preloadPromise: Promise<void> | null = null;

export const preloadGameAssets = (): Promise<void> => {
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = Promise.all(
    GAME_ASSET_URLS.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve anyway to prevent blocking forever on asset error
          img.src = src;
        })
    )
  ).then(() => undefined);

  return preloadPromise;
};
