const GAME_ASSET_URLS = [
  '/assets/ground/ground-tile.png',
  '/assets/ground/tile_0017.png',
  '/assets/ground/tile_0018.png',
  '/assets/ground/tile_0019.png',
  '/assets/ground/tile_0020.png',
  '/assets/ground/tile_0021.png',
  '/assets/ground/tile_0022.png',
  '/assets/ground/tile_0023.png',
  '/assets/ground/tile_0037.png',
  '/assets/ground/tile_0038.png',
  '/assets/ground/tile_0039.png',
  '/assets/ground/tile_0057.png',
  '/assets/ground/tile_0058.png',
  '/assets/ground/tile_0059.png',
  '/assets/ground/tile_0068.png',
  '/assets/ground/tile_0069.png',
  '/assets/ground/tile_0077.png',
  '/assets/ground/tile_0078.png',
  '/assets/ground/tile_0079.png',
  '/assets/ground/tile_0084.png',
  '/assets/ground/tile_0085.png',
  '/assets/ground/tile_0086.png',
  '/assets/ground/tile_0087.png',
  '/assets/ground/tile_0088.png',
  '/assets/ground/tile_0089.png',
  '/assets/ground/tile_0096.png',
  '/assets/ground/tile_0097.png',
  '/assets/ground/tile_0098.png',
  '/assets/ground/tile_0099.png',
  '/assets/ground/tile_0105.png',
  '/assets/ground/tile_0116.png',
  '/assets/ground/tile_0117.png',
  '/assets/ground/tile_0118.png',
  '/assets/ground/tile_0119.png',
  '/assets/ground/tile_0120.png',
  '/assets/ground/tile_0121.png',
  '/assets/ground/tile_0122.png',
  '/assets/ground/tile_0123.png',
  '/assets/ground/tile_0124.png',
  '/assets/ground/tile_0125.png',
  '/assets/ground/tile_0136.png',
  '/assets/ground/tile_0137.png',
  '/assets/ground/tile_0138.png',
  '/assets/ground/tile_0139.png',
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
