/**
 * Kenya geography for the cinematic hero.
 *
 * Source: Natural Earth 1:10m Admin 0 Countries (public domain), simplified
 * for the web. Coordinates are [longitude, latitude]. The outline is kept at
 * 118 points so the silhouette and proportions stay recognisably Kenyan at
 * hero scale without shipping a large GIS payload.
 */

export type LonLat = readonly [number, number];

export const KENYA_OUTLINE: LonLat[] = [
  [35.706, 4.619],
  [35.739, 4.681],
  [35.778, 4.678],
  [35.781, 4.62],
  [35.921, 4.619],
  [35.94, 4.508],
  [36.041, 4.444],
  [36.844, 4.432],
  [37.016, 4.371],
  [38.102, 3.613],
  [38.446, 3.602],
  [38.509, 3.651],
  [38.895, 3.514],
  [39.068, 3.527],
  [39.219, 3.469],
  [39.316, 3.495],
  [39.504, 3.403],
  [39.764, 3.686],
  [39.848, 3.867],
  [40.764, 4.285],
  [41.163, 3.943],
  [41.885, 3.977],
  [41.343, 3.201],
  [40.965, 2.814],
  [40.98, -0.871],
  [41.523, -1.573],
  [41.535, -1.697],
  [41.283, -1.969],
  [41.219, -1.922],
  [41.186, -1.99],
  [41.109, -1.978],
  [41.013, -2.042],
  [40.98, -2.005],
  [41.006, -1.902],
  [40.945, -2.073],
  [40.861, -1.963],
  [40.912, -2.192],
  [40.979, -2.242],
  [40.945, -2.309],
  [40.863, -2.231],
  [40.774, -2.279],
  [40.817, -2.398],
  [40.651, -2.539],
  [40.491, -2.528],
  [40.232, -2.669],
  [40.175, -2.763],
  [40.163, -2.934],
  [40.233, -2.982],
  [40.164, -3.067],
  [40.123, -3.267],
  [39.989, -3.373],
  [39.966, -3.321],
  [39.879, -3.605],
  [39.781, -3.567],
  [39.867, -3.695],
  [39.786, -3.917],
  [39.684, -3.917],
  [39.745, -3.969],
  [39.708, -4.038],
  [39.66, -3.971],
  [39.606, -3.97],
  [39.636, -4.017],
  [39.564, -4.033],
  [39.567, -4.081],
  [39.615, -4.059],
  [39.666, -4.112],
  [39.54, -4.43],
  [39.451, -4.582],
  [39.444, -4.52],
  [39.391, -4.571],
  [39.396, -4.629],
  [39.3, -4.595],
  [39.191, -4.678],
  [37.771, -3.655],
  [37.708, -3.527],
  [37.599, -3.513],
  [37.585, -3.413],
  [37.7, -3.314],
  [37.645, -3.046],
  [34.0, -1.003],
  [33.904, -1.003],
  [33.954, -0.154],
  [33.894, 0.11],
  [34.085, 0.347],
  [34.15, 0.604],
  [34.388, 0.816],
  [34.487, 1.082],
  [34.798, 1.232],
  [34.779, 1.389],
  [34.973, 1.654],
  [35.006, 1.917],
  [34.866, 2.348],
  [34.924, 2.477],
  [34.876, 2.591],
  [34.819, 2.598],
  [34.73, 2.853],
  [34.641, 2.86],
  [34.585, 2.929],
  [34.534, 3.118],
  [34.434, 3.182],
  [34.381, 3.477],
  [34.435, 3.526],
  [34.44, 3.668],
  [34.337, 3.735],
  [34.29, 3.703],
  [34.241, 3.784],
  [34.152, 3.776],
  [34.205, 3.875],
  [34.085, 3.877],
  [34.069, 4.088],
  [33.977, 4.22],
  [34.381, 4.62],
  [35.412, 5.03],
  [35.396, 4.926],
  [35.571, 4.904],
  [35.522, 4.78],
  [35.61, 4.621],
  [35.7, 4.589]
];

export const KENYA_ISLAND: LonLat[] = [
  [41.054, -2.05],
  [41.066, -2.036],
  [41.093, -2.038],
  [41.143, -2.06],
  [41.163, -2.091],
  [41.155, -2.112],
  [41.137, -2.115],
  [41.123, -2.094],
  [41.123, -2.116],
  [41.105, -2.134],
  [41.092, -2.133],
  [41.082, -2.122],
  [41.069, -2.123],
  [41.014, -2.149],
  [41.004, -2.142],
  [40.996, -2.144],
  [40.986, -2.166],
  [41.01, -2.187],
  [41.006, -2.197],
  [40.994, -2.197],
  [40.981, -2.182],
  [40.98, -2.169],
  [40.957, -2.174],
  [40.957, -2.151],
  [40.969, -2.12],
  [40.983, -2.097],
  [41.045, -2.07]
];

export const KENYA_LAKES: { name: string; ring: LonLat[] }[] = [
  {
    name: 'Lake Turkana',
    ring: [
      [36.698, 2.769],
      [36.702, 2.486],
      [36.636, 2.409],
      [36.558, 2.394],
      [36.532, 2.423],
      [36.518, 2.552],
      [36.443, 2.631],
      [36.436, 2.73],
      [36.381, 2.846],
      [36.261, 2.938],
      [36.247, 2.981],
      [36.213, 2.963],
      [36.127, 2.988],
      [36.148, 3.213],
      [36.042, 3.244],
      [35.948, 3.339],
      [35.94, 3.541],
      [35.926, 3.552],
      [35.936, 3.497],
      [35.918, 3.481],
      [35.896, 3.561],
      [35.841, 3.63],
      [35.833, 3.72],
      [35.86, 3.792],
      [35.854, 3.959],
      [35.923, 4.118],
      [35.915, 4.423],
      [35.949, 4.577],
      [35.988, 4.635],
      [36.004, 4.635],
      [36.032, 4.525],
      [36.058, 4.56],
      [36.025, 4.603],
      [36.043, 4.637],
      [36.107, 4.638],
      [36.127, 4.622],
      [36.124, 4.663],
      [36.155, 4.664],
      [36.187, 4.625],
      [36.168, 4.615],
      [36.198, 4.547],
      [36.208, 4.443],
      [36.188, 4.339],
      [36.215, 4.286],
      [36.216, 4.2],
      [36.245, 4.145],
      [36.182, 3.962],
      [36.266, 3.754],
      [36.246, 3.694],
      [36.211, 3.659],
      [36.206, 3.54],
      [36.244, 3.371],
      [36.223, 3.322],
      [36.292, 3.243],
      [36.301, 3.199],
      [36.376, 3.123],
      [36.401, 3.011],
      [36.532, 2.902],
      [36.658, 2.899],
      [36.689, 2.881]
    ]
  }
];

export const KENYA_CITIES = [
  { name: 'Nairobi', lon: 36.8219, lat: -1.2921, weight: 1, label: true },
  { name: 'Mombasa', lon: 39.6682, lat: -4.0435, weight: 0.82, label: true },
  { name: 'Kisumu', lon: 34.768, lat: -0.0917, weight: 0.68, label: true },
  { name: 'Nakuru', lon: 36.08, lat: -0.3031, weight: 0.58, label: true },
  { name: 'Eldoret', lon: 35.2698, lat: 0.5143, weight: 0.52, label: false },
  { name: 'Nyeri', lon: 36.9517, lat: -0.4169, weight: 0.38, label: false },
  { name: 'Meru', lon: 37.6456, lat: 0.0515, weight: 0.4, label: false },
  { name: 'Garissa', lon: 39.6461, lat: -0.4536, weight: 0.34, label: false },
  { name: 'Malindi', lon: 40.1169, lat: -3.2192, weight: 0.34, label: false },
  { name: 'Lodwar', lon: 35.5973, lat: 3.1191, weight: 0.3, label: false },
  { name: 'Marsabit', lon: 37.9899, lat: 2.3348, weight: 0.24, label: false },
  { name: 'Wajir', lon: 40.0573, lat: 1.7471, weight: 0.24, label: false }
] as const;

const BOUNDS = {
  west: 33.894,
  east: 41.885,
  south: -4.678,
  north: 5.03
};

const CENTER_LON = (BOUNDS.west + BOUNDS.east) / 2;
const CENTER_LAT = (BOUNDS.south + BOUNDS.north) / 2;
const LON_SPAN = BOUNDS.east - BOUNDS.west;
const LAT_SPAN = BOUNDS.north - BOUNDS.south;

/**
 * Kenya is taller than it is wide. Keeping this ratio means the terrain never
 * gets the stretched, logo-like look of a flat map graphic.
 */
export const MAP_HEIGHT = 1.92;
export const MAP_WIDTH = (MAP_HEIGHT * LON_SPAN * Math.cos((CENTER_LAT * Math.PI) / 180)) / LAT_SPAN;

export function projectWorld(lon: number, lat: number) {
  return {
    x: ((lon - CENTER_LON) / LON_SPAN) * MAP_WIDTH,
    z: -((lat - CENTER_LAT) / LAT_SPAN) * MAP_HEIGHT
  };
}

export const KENYA_WORLD_OUTLINE = KENYA_OUTLINE.map(([lon, lat]) => projectWorld(lon, lat));
export const KENYA_WORLD_ISLAND = KENYA_ISLAND.map(([lon, lat]) => projectWorld(lon, lat));
export const KENYA_WORLD_LAKES = KENYA_LAKES.map((lake) => ({
  name: lake.name,
  points: lake.ring.map(([lon, lat]) => projectWorld(lon, lat)),
  lonLat: lake.ring
}));

/** SVG projection used by the server-rendered fallback and the loading art. */
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 1200;
const SVG_PADDING = 74;
const SVG_SCALE = Math.min(
  (SVG_WIDTH - SVG_PADDING * 2) / MAP_WIDTH,
  (SVG_HEIGHT - SVG_PADDING * 2) / MAP_HEIGHT
);

export function projectSvg(lon: number, lat: number) {
  const point = projectWorld(lon, lat);
  return {
    x: SVG_WIDTH / 2 + point.x * SVG_SCALE,
    y: SVG_HEIGHT / 2 + point.z * SVG_SCALE
  };
}

function toPath(points: LonLat[]) {
  return points
    .map(([lon, lat], index) => {
      const { x, y } = projectSvg(lon, lat);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ')
    .concat(' Z');
}

export const KENYA_SVG_PATH = toPath(KENYA_OUTLINE);
export const KENYA_SVG_ISLAND_PATH = toPath(KENYA_ISLAND);
export const KENYA_SVG_LAKE_PATHS = KENYA_LAKES.map((lake) => ({
  name: lake.name,
  path: toPath(lake.ring)
}));

export const KENYA_SVG_VIEWBOX = `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`;

export const KENYA_CITY_POINTS = KENYA_CITIES.map((city) => ({
  ...city,
  ...projectWorld(city.lon, city.lat),
  svg: projectSvg(city.lon, city.lat)
}));
