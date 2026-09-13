type MetroAssetId = number;

interface NodeRequire {
  (id: `${string}.png`): MetroAssetId;
  (id: `${string}.jpg`): MetroAssetId;
  (id: `${string}.jpeg`): MetroAssetId;
  (id: `${string}.gif`): MetroAssetId;
  (id: `${string}.webp`): MetroAssetId;
  (id: `${string}.svg`): MetroAssetId;
}

declare namespace __MetroModuleApi {
  interface RequireFunction {
    (path: `${string}.png`): MetroAssetId;
    (path: `${string}.jpg`): MetroAssetId;
    (path: `${string}.jpeg`): MetroAssetId;
    (path: `${string}.gif`): MetroAssetId;
    (path: `${string}.webp`): MetroAssetId;
    (path: `${string}.svg`): MetroAssetId;
  }
}
