'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  KENYA_CITY_POINTS,
  KENYA_WORLD_LAKES,
  KENYA_WORLD_OUTLINE,
  MAP_HEIGHT,
  MAP_WIDTH,
  projectWorld
} from './kenya-geo';

/**
 * Grade reference: frames sampled from the founder-supplied 10-second clip
 * (480x854 portrait, 24fps) supplied the slate horizon (#878f9c) and umber
 * foreground (#5d4a3d) used in the cool fill and the bronze plinth.
 *
 * The clip itself is intentionally not played in the hero: its framing is not
 * a map plate, so the map below is real geometry, not a re-skinned video. It
 * also means no audio track is ever attached to the experience.
 */

type KenyaSceneProps = {
  onReady?: () => void;
  onFail?: () => void;
};

type CityWorld = {
  name: string;
  x: number;
  z: number;
  weight: number;
  label: boolean;
};

type BuildingWorld = {
  x: number;
  z: number;
  ground: number;
  width: number;
  depth: number;
  height: number;
  delay: number;
  rise: number;
};

type WindowPanelWorld = {
  building: BuildingWorld;
  offsetX: number;
  offsetZ: number;
  width: number;
  rotation: number;
};

const CITIES: CityWorld[] = KENYA_CITY_POINTS.map((city) => ({
  name: city.name,
  x: city.x,
  z: city.z,
  weight: city.weight,
  label: city.label
}));

const MT_KENYA = projectWorld(37.308, -0.152);
const ABERDARE = projectWorld(36.72, -0.42);
const MAU = projectWorld(35.72, -0.48);
const ELGON = projectWorld(34.55, 1.118);
const NYAMBENE = projectWorld(37.9, 0.28);
const SHIMBA = projectWorld(39.3, -4.18);
const RIFT_X = projectWorld(36.18, 0).x;

const PLANE_W = MAP_WIDTH * 1.16;
const PLANE_H = MAP_HEIGHT * 1.16;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function gaussian(x: number, z: number, cx: number, cz: number, sx: number, sz: number) {
  const dx = (x - cx) / sx;
  const dz = (z - cz) / sz;
  return Math.exp(-(dx * dx + dz * dz) * 2.2);
}

function pointInPolygon(x: number, z: number, points: { x: number; z: number }[]) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i];
    const b = points[j];
    const intersects =
      a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z || Number.EPSILON) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function distanceToOutline(x: number, z: number) {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0, j = KENYA_WORLD_OUTLINE.length - 1; i < KENYA_WORLD_OUTLINE.length; j = i++) {
    const a = KENYA_WORLD_OUTLINE[j];
    const b = KENYA_WORLD_OUTLINE[i];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const lengthSq = dx * dx + dz * dz || 1;
    const t = clamp01(((x - a.x) * dx + (z - a.z) * dz) / lengthSq);
    const px = a.x + dx * t;
    const pz = a.z + dz * t;
    best = Math.min(best, Math.hypot(x - px, z - pz));
  }
  return best;
}

function terrainHeight(x: number, z: number, borderDistance: number) {
  const noise =
    Math.sin(x * 29.1 + z * 41.7) * 0.5 +
    Math.sin(x * 67.3 - z * 53.1 + 1.7) * 0.28 +
    Math.sin(x * 131.7 + z * 97.3 + 3.1) * 0.14;

  const riftLine = RIFT_X + Math.sin(z * 4.1) * 0.032;
  const rift =
    Math.exp(-Math.pow((x - riftLine) / 0.052, 2)) *
    Math.exp(-Math.pow((z + 0.12) / 0.92, 2));

  let height = 0.014 + (noise + 0.5) * 0.012;
  height += gaussian(x, z, MT_KENYA.x, MT_KENYA.z, 0.075, 0.09) * 0.31;
  height += gaussian(x, z, ABERDARE.x, ABERDARE.z, 0.13, 0.19) * 0.13;
  height += gaussian(x, z, MAU.x, MAU.z, 0.12, 0.22) * 0.1;
  height += gaussian(x, z, ELGON.x, ELGON.z, 0.085, 0.1) * 0.19;
  height += gaussian(x, z, NYAMBENE.x, NYAMBENE.z, 0.1, 0.14) * 0.08;
  height += gaussian(x, z, SHIMBA.x, SHIMBA.z, 0.07, 0.09) * 0.055;
  height -= rift * 0.052;
  height += smoothstep(-0.34, 0.4, x) * 0.008;

  const edge = smoothstep(0, 0.045, borderDistance);
  return Math.max(0.002, height * (0.22 + edge * 0.78));
}

function makeRadialTexture(stops: [number, string][], size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);
  const radius = size / 2;
  const gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function makeLabelTexture(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(243, 236, 220, 0.96)';
  context.font = '600 30px Inter, Arial, Helvetica, sans-serif';
  context.letterSpacing = '7px';
  context.fillText(text.toUpperCase(), 8, 58);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function makeWindowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);

  context.clearRect(0, 0, canvas.width, canvas.height);
  let seed = 4819;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const windowColors = ['#ffd99a', '#ffc06d', '#fff0c5', '#b8d8cf'];

  for (let row = 0; row < 16; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      if (random() > 0.58) continue;
      const width = 5 + Math.floor(random() * 5);
      const height = 4 + Math.floor(random() * 4);
      const x = 7 + column * 15 + Math.floor(random() * 3);
      const y = 9 + row * 15 + Math.floor(random() * 3);
      context.globalAlpha = 0.32 + random() * 0.68;
      context.fillStyle = windowColors[Math.floor(random() * windowColors.length)];
      context.fillRect(x, y, width, height);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function makeTerrainMask(size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);
  context.fillStyle = '#000';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#fff';
  context.strokeStyle = '#fff';
  context.lineJoin = 'round';
  context.lineWidth = Math.max(2, size / 360);
  context.beginPath();
  KENYA_WORLD_OUTLINE.forEach((point, index) => {
    const x = (point.x / PLANE_W + 0.5) * size;
    const y = (point.z / PLANE_H + 0.5) * size;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.closePath();
  context.fill();
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function makeEnvironment(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const background = context.createLinearGradient(0, 0, 0, 256);
  background.addColorStop(0, '#183b2d');
  background.addColorStop(0.52, '#0a241c');
  background.addColorStop(1, '#06110d');
  context.fillStyle = background;
  context.fillRect(0, 0, 512, 256);
  const sun = context.createRadialGradient(372, 78, 4, 372, 78, 120);
  sun.addColorStop(0, 'rgba(255, 224, 164, 0.95)');
  sun.addColorStop(0.22, 'rgba(227, 163, 59, 0.44)');
  sun.addColorStop(1, 'rgba(227, 163, 59, 0)');
  context.fillStyle = sun;
  context.fillRect(0, 0, 512, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromEquirectangular(texture);
  pmrem.dispose();
  texture.dispose();
  return target;
}

function materialList(material: THREE.Material | THREE.Material[]) {
  return Array.isArray(material) ? material : [material];
}

export function KenyaScene({ onReady, onFail }: KenyaSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(onReady);
  const failRef = useRef(onFail);

  readyRef.current = onReady;
  failRef.current = onFail;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A fresh canvas per effect run avoids reusing a context that a previous
    // Strict Mode mount already disposed.
    const canvas = document.createElement('canvas');
    canvas.className = 'ps-kenya__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    const section = host.closest('.ps-cinema') as HTMLElement | null;
    const pin = host.closest('.ps-cinema__pin') as HTMLElement | null;
    if (!section || !pin) {
      canvas.remove();
      return;
    }

    const initialWidth = Math.max(1, host.clientWidth);
    const initialHeight = Math.max(1, host.clientHeight);
    const lowPower =
      initialWidth < 760 ||
      (typeof navigator !== 'undefined' &&
        ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
          ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 2));

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !lowPower,
        powerPreference: 'high-performance'
      });
    } catch {
      canvas.remove();
      failRef.current?.();
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = !lowPower;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.8));
    renderer.setSize(initialWidth, initialHeight, false);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071a12, lowPower ? 0.075 : 0.105);

    const camera = new THREE.PerspectiveCamera(34, initialWidth / initialHeight, 0.01, 30);
    const mapRoot = new THREE.Group();
    const isWide = initialWidth / initialHeight > 1.04;
    mapRoot.position.x = isWide ? MAP_WIDTH * 0.19 : 0;
    mapRoot.position.y = isWide ? 0.01 : 0.13;
    scene.add(mapRoot);

    let environmentTarget: THREE.WebGLRenderTarget | null = null;
    if (!lowPower) {
      try {
        environmentTarget = makeEnvironment(renderer);
        if (environmentTarget) {
          scene.environment = environmentTarget.texture;
          scene.environmentIntensity = 0.48;
        }
      } catch {
        environmentTarget = null;
      }
    }

    // Lighting: warm low sun, cool sky, ochre rim. The low sun keeps the
    // terrain readable while the rim light separates Kenya from the night.
    scene.add(new THREE.HemisphereLight(0xa8c2b0, 0x170d07, 0.72));

    const key = new THREE.DirectionalLight(0xffd8a0, 2.4);
    key.position.set(-2.6, 4.4, 2.7);
    key.target.position.set(0, 0, 0);
    scene.add(key.target);
    key.castShadow = !lowPower;
    if (!lowPower) {
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -2.2;
      key.shadow.camera.right = 2.2;
      key.shadow.camera.top = 2.2;
      key.shadow.camera.bottom = -2.2;
      key.shadow.camera.near = 0.1;
      key.shadow.camera.far = 9;
      key.shadow.bias = -0.00035;
      key.shadow.normalBias = 0.015;
    }
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x91a6a4, 0.7);
    fill.position.set(2.8, 2.3, -2.4);
    scene.add(fill);

    const rim = new THREE.PointLight(0xe3a33b, 10, 5.2, 2);
    rim.position.set(1.35, 1.15, -2.1);
    scene.add(rim);

    const cityGlowLight = new THREE.PointLight(0xe6aa43, 3.2, 2.2, 2);
    cityGlowLight.position.set(0.05, 0.4, 0.15);
    scene.add(cityGlowLight);

    // The terrain is a real heightfield. The mask makes the rectangular plane
    // resolve into the exact Kenya silhouette instead of a rectangular tile.
    const segments = lowPower ? 112 : 230;
    const geometry = new THREE.PlaneGeometry(
      PLANE_W,
      PLANE_H,
      Math.round(segments * (PLANE_W / Math.max(PLANE_W, PLANE_H))),
      Math.round(segments * (PLANE_H / Math.max(PLANE_W, PLANE_H)))
    );
    geometry.rotateX(-Math.PI / 2);

    const position = geometry.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    const lowColor = new THREE.Color(0x6b6541);
    const midColor = new THREE.Color(0x415d3d);
    const highColor = new THREE.Color(0x8b784f);
    const peakColor = new THREE.Color(0xd8cbb4);
    const waterColor = new THREE.Color(0x0a3e3d);

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const inside = pointInPolygon(x, z, KENYA_WORLD_OUTLINE);
      if (!inside) {
        position.setY(i, 0.002);
        colors[i * 3] = 0.03;
        colors[i * 3 + 1] = 0.08;
        colors[i * 3 + 2] = 0.06;
        continue;
      }

      const borderDistance = distanceToOutline(x, z);
      let height = terrainHeight(x, z, borderDistance);
      let vertexColor = lowColor;

      const inLake = KENYA_WORLD_LAKES.some((lake) => pointInPolygon(x, z, lake.points));
      if (inLake) {
        height = 0.006;
        vertexColor = waterColor;
      } else {
        const t = clamp01((height - 0.01) / 0.33);
        if (t < 0.42) {
          vertexColor = lowColor.clone().lerp(midColor, t / 0.42);
        } else if (t < 0.74) {
          vertexColor = midColor.clone().lerp(highColor, (t - 0.42) / 0.32);
        } else {
          vertexColor = highColor.clone().lerp(peakColor, (t - 0.74) / 0.26);
        }
        color.copy(vertexColor);
        const relief = 0.92 + (Math.sin(x * 91.2 + z * 63.7) * 0.5 + 0.5) * 0.12;
        colors[i * 3] = color.r * relief;
        colors[i * 3 + 1] = color.g * relief;
        colors[i * 3 + 2] = color.b * relief;
        position.setY(i, height);
        continue;
      }

      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
      position.setY(i, height);
    }
    position.needsUpdate = true;
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const mask = makeTerrainMask(lowPower ? 512 : 1024);
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.78,
      metalness: 0.1,
      alphaMap: mask,
      alphaTest: 0.42,
      side: THREE.FrontSide,
      envMapIntensity: 0.42,
      emissive: 0x1a1108,
      emissiveIntensity: 0
    });
    const terrain = new THREE.Mesh(geometry, terrainMaterial);
    // The solid country plinth below casts a country-shaped shadow. Excluding
    // the alpha-masked plane keeps its rectangular bounds out of the shadow
    // map, which would otherwise print a square onto the floor.
    terrain.castShadow = false;
    terrain.receiveShadow = !lowPower;
    mapRoot.add(terrain);

    // A translucent fresnel layer catches the low sun on ridges and on the
    // cut edge of the country, which is what gives the plate its glow.
    const rimUniforms = {
      uMask: { value: mask },
      uColor: { value: new THREE.Color(0xf0c77e) },
      uOpacity: { value: 0.18 }
    };
    const rimMaterial = new THREE.ShaderMaterial({
      uniforms: rimUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          vViewDirection = normalize(cameraPosition - worldPosition.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMask;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        void main() {
          float presence = texture2D(uMask, vUv).g;
          if (presence < 0.42) discard;
          float fresnel = pow(1.0 - max(dot(normalize(vWorldNormal), normalize(vViewDirection)), 0.0), 2.4);
          gl_FragColor = vec4(uColor, fresnel * uOpacity * presence);
        }
      `
    });
    const rimGlow = new THREE.Mesh(geometry, rimMaterial);
    rimGlow.renderOrder = 2;
    mapRoot.add(rimGlow);

    // The geological plinth: dark bronze sides under the living surface.
    const baseShape = new THREE.Shape();
    KENYA_WORLD_OUTLINE.forEach((point, index) => {
      if (index === 0) baseShape.moveTo(point.x, -point.z);
      else baseShape.lineTo(point.x, -point.z);
    });
    baseShape.closePath();
    const baseGeometry = new THREE.ExtrudeGeometry(baseShape, {
      depth: 0.13,
      bevelEnabled: true,
      bevelSegments: lowPower ? 1 : 2,
      bevelSize: 0.008,
      bevelThickness: 0.008,
      curveSegments: 1
    });
    baseGeometry.rotateX(-Math.PI / 2);
    const base = new THREE.Mesh(baseGeometry, [
      new THREE.MeshStandardMaterial({
        color: 0x173328,
        roughness: 0.62,
        metalness: 0.25,
        emissive: 0x07140e,
        emissiveIntensity: 0.4
      }),
      new THREE.MeshStandardMaterial({
        color: 0x4d3822,
        roughness: 0.32,
        metalness: 0.72,
        emissive: 0x160d05,
        emissiveIntensity: 0.55,
        envMapIntensity: 1.1
      })
    ]);
    base.position.y = -0.13;
    base.castShadow = !lowPower;
    base.receiveShadow = true;
    mapRoot.add(base);

    const backingShape = new THREE.Shape();
    KENYA_WORLD_OUTLINE.forEach((point, index) => {
      const x = point.x * 1.018;
      const z = point.z * 1.018;
      if (index === 0) backingShape.moveTo(x, -z);
      else backingShape.lineTo(x, -z);
    });
    backingShape.closePath();
    const backingGeometry = new THREE.ExtrudeGeometry(backingShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      curveSegments: 1
    });
    backingGeometry.rotateX(-Math.PI / 2);
    const backing = new THREE.Mesh(
      backingGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x241a10,
        roughness: 0.47,
        metalness: 0.58,
        emissive: 0x0c0602,
        emissiveIntensity: 0.3
      })
    );
    backing.position.y = -0.175;
    mapRoot.add(backing);

    // The illuminated boundary is a real tube, so it stays legible at any
    // camera angle instead of relying on an unsupported wide WebGL line.
    const rimCurve = new THREE.CatmullRomCurve3(
      KENYA_WORLD_OUTLINE.map((point) => new THREE.Vector3(point.x, 0.012, point.z)),
      true,
      'catmullrom',
      0.08
    );
    const rimTube = new THREE.Mesh(
      new THREE.TubeGeometry(rimCurve, lowPower ? 280 : 460, lowPower ? 0.003 : 0.0036, 4, true),
      new THREE.MeshBasicMaterial({
        color: 0xf0c77e,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    mapRoot.add(rimTube);
    const rimHalo = new THREE.Mesh(
      new THREE.TubeGeometry(rimCurve, lowPower ? 220 : 340, 0.018, 4, true),
      new THREE.MeshBasicMaterial({
        color: 0xe3a33b,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    mapRoot.add(rimHalo);

    // Lake Turkana is a separate water plane with a darker, glossier response.
    KENYA_WORLD_LAKES.forEach((lake) => {
      const lakeShape = new THREE.Shape();
      lake.points.forEach((point, index) => {
        if (index === 0) lakeShape.moveTo(point.x, -point.z);
        else lakeShape.lineTo(point.x, -point.z);
      });
      lakeShape.closePath();
      const lakeGeometry = new THREE.ShapeGeometry(lakeShape);
      lakeGeometry.rotateX(-Math.PI / 2);
      const water = new THREE.Mesh(
        lakeGeometry,
        new THREE.MeshStandardMaterial({
          color: 0x0a3b3b,
          roughness: 0.18,
          metalness: 0.55,
          emissive: 0x082a2a,
          emissiveIntensity: 0.5,
          envMapIntensity: 0.8,
          side: THREE.DoubleSide
        })
      );
      water.position.y = 0.012;
      mapRoot.add(water);
    });

    const floorGlowTexture = makeRadialTexture([
      [0, 'rgba(240, 199, 126, 0.42)'],
      [0.32, 'rgba(227, 163, 59, 0.16)'],
      [0.7, 'rgba(31, 106, 79, 0.06)'],
      [1, 'rgba(6, 23, 16, 0)']
    ], 512);
    const floorGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.25, 3.25),
      new THREE.MeshBasicMaterial({
        map: floorGlowTexture,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -0.205;
    mapRoot.add(floorGlow);

    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0xe7c58f,
      transparent: true,
      opacity: 0.11,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    [1.08, 1.28, 1.5].forEach((radius, index) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 0.0018, 160), orbitMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.195 - index * 0.002;
      mapRoot.add(ring);
    });

    if (!lowPower) {
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 3.4),
        new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.38 })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.225;
      shadowPlane.receiveShadow = true;
      mapRoot.add(shadowPlane);
    } else {
      const contactTexture = makeRadialTexture([
        [0, 'rgba(0, 0, 0, 0.55)'],
        [0.52, 'rgba(0, 0, 0, 0.24)'],
        [1, 'rgba(0, 0, 0, 0)']
      ], 256);
      const contact = new THREE.Mesh(
        new THREE.PlaneGeometry(2.3, 2.8),
        new THREE.MeshBasicMaterial({
          map: contactTexture,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
        })
      );
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = -0.21;
      mapRoot.add(contact);
    }

    // City constellation. The beams are shader-gradient cylinders, not flat
    // sprites, so they read as three-dimensional light in the scene.
    const glowTexture = makeRadialTexture([
      [0, 'rgba(255, 246, 221, 1)'],
      [0.14, 'rgba(255, 213, 135, 0.95)'],
      [0.42, 'rgba(227, 163, 59, 0.36)'],
      [1, 'rgba(227, 163, 59, 0)']
    ]);
    const dotMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffdf9f,
      transparent: true,
      opacity: 0.86,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const beamUniforms = { uColor: { value: new THREE.Color(0xe8b866) }, uOpacity: { value: 0.42 } };
    const beamMaterial = new THREE.ShaderMaterial({
      uniforms: beamUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float a = smoothstep(0.0, 0.16, vUv.y) * (1.0 - smoothstep(0.48, 1.0, vUv.y));
          gl_FragColor = vec4(uColor, a * uOpacity);
        }
      `
    });
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xe3a33b,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const beams: THREE.Mesh[] = [];
    const dots: THREE.Sprite[] = [];
    const labels: { sprite: THREE.Sprite; material: THREE.SpriteMaterial; city: CityWorld }[] = [];

    CITIES.forEach((city) => {
      const ground = terrainHeight(city.x, city.z, distanceToOutline(city.x, city.z));
      const beamHeight = 0.035 + city.weight * 0.17;
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0055, beamHeight, 6, 1, true), beamMaterial);
      beam.position.set(city.x, ground + beamHeight / 2, city.z);
      mapRoot.add(beam);
      beams.push(beam);

      const dot = new THREE.Sprite(dotMaterial);
      dot.position.set(city.x, ground + 0.012, city.z);
      const size = 0.036 + city.weight * 0.055;
      dot.scale.set(size, size, 1);
      mapRoot.add(dot);
      dots.push(dot);

      if (city.weight >= 0.52) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.016, 0.021, 40), ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(city.x, ground + 0.008, city.z);
        mapRoot.add(ring);
      }

      if (city.label) {
        const labelMaterial = new THREE.SpriteMaterial({
          map: makeLabelTexture(city.name),
          transparent: true,
          opacity: 0.82,
          depthWrite: false,
          depthTest: false
        });
        const sprite = new THREE.Sprite(labelMaterial);
        sprite.position.set(city.x + 0.07, ground + beamHeight + 0.055, city.z);
        sprite.scale.set(0.28, 0.0525, 1);
        sprite.renderOrder = 5;
        mapRoot.add(sprite);
        labels.push({ sprite, material: labelMaterial, city });
      }
    });

    // ---------- The city that Kenya becomes ----------
    // This is the second state of the same plate: as the visitor scrolls, real
    // instanced towers rise out of the terrain, windows light up, and street
    // lines appear. It is driven only by scroll progress, so scrolling back up
    // dismantles the city and returns to the untouched Kenya map.
    const cityBudget = lowPower ? 160 : 340;
    const cityWeightTotal = CITIES.reduce((sum, city) => sum + Math.pow(city.weight, 1.8), 0);
    const cityClusters = CITIES.map((city) => ({
      city,
      radius: 0.045 + city.weight * 0.15,
      maxHeight: 0.055 + city.weight * 0.185,
      count: Math.max(3, Math.round((cityBudget * Math.pow(city.weight, 1.8)) / cityWeightTotal))
    }));
    const cityBuildings: BuildingWorld[] = [];
    const randomCity = (() => {
      let seed = 74291;
      return () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
    })();

    cityClusters.forEach(({ city, radius, maxHeight, count }) => {
      for (let index = 0; index < count; index += 1) {
        for (let attempt = 0; attempt < 9; attempt += 1) {
          const radial = radius * Math.pow(randomCity(), 1.45);
          const angle = randomCity() * Math.PI * 2;
          const x = city.x + Math.cos(angle) * radial;
          const z = city.z + Math.sin(angle) * radial;
          if (!pointInPolygon(x, z, KENYA_WORLD_OUTLINE)) continue;
          if (KENYA_WORLD_LAKES.some((lake) => pointInPolygon(x, z, lake.points))) continue;
          const borderDistance = distanceToOutline(x, z);
          if (borderDistance < 0.012) continue;
          const ground = terrainHeight(x, z, borderDistance);
          if (ground <= 0.008) continue;

          const tower = randomCity() > 0.88;
          const footprint = (0.0045 + randomCity() * 0.008) * (0.8 + city.weight * 0.4) * (tower ? 1.12 : 1);
          const height = Math.min(
            maxHeight *
              (tower ? 1.28 + randomCity() * 0.32 : 0.3 + randomCity() * 0.54) *
              (1 - (radial / radius) * 0.48),
            maxHeight * 1.55
          );
          cityBuildings.push({
            x,
            z,
            ground,
            width: footprint,
            depth: footprint * (0.82 + randomCity() * 0.32),
            height: Math.max(0.014, height),
            delay: Math.min(0.55, 0.06 + (radial / radius) * 0.34 + randomCity() * 0.12),
            rise: 0
          });
          break;
        }
      }
    });

    const cityPanels: WindowPanelWorld[] = [];
    cityBuildings.forEach((building) => {
      const side = 0.0015;
      cityPanels.push(
        { building, offsetX: 0, offsetZ: building.depth / 2 + side, width: building.width, rotation: 0 },
        { building, offsetX: 0, offsetZ: -building.depth / 2 - side, width: building.width, rotation: Math.PI },
        { building, offsetX: building.width / 2 + side, offsetZ: 0, width: building.depth, rotation: Math.PI / 2 },
        { building, offsetX: -building.width / 2 - side, offsetZ: 0, width: building.depth, rotation: -Math.PI / 2 }
      );
    });

    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c2b25,
      roughness: 0.62,
      metalness: 0.22,
      emissive: 0x0c0b08,
      emissiveIntensity: 0.32,
      envMapIntensity: 0.5
    });
    const buildingsMesh = new THREE.InstancedMesh(
      buildingGeometry,
      buildingMaterial,
      Math.max(1, cityBuildings.length)
    );
    buildingsMesh.count = cityBuildings.length;
    buildingsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    buildingsMesh.castShadow = !lowPower;
    buildingsMesh.receiveShadow = !lowPower;
    buildingsMesh.frustumCulled = false;
    mapRoot.add(buildingsMesh);

    const windowTexture = makeWindowTexture();
    const windowMaterial = new THREE.MeshBasicMaterial({
      map: windowTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide
    });
    const windowGeometry = new THREE.PlaneGeometry(1, 1);
    const windowsMesh = new THREE.InstancedMesh(windowGeometry, windowMaterial, Math.max(1, cityPanels.length));
    windowsMesh.count = cityPanels.length;
    windowsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    windowsMesh.frustumCulled = false;
    windowsMesh.renderOrder = 4;
    mapRoot.add(windowsMesh);

    // Street lines are draped over the real terrain height, so the city keeps
    // the same geography as the map instead of sitting on a flat sticker.
    const roadPositions: number[] = [];
    const roadPoint = (x: number, z: number) => {
      if (!pointInPolygon(x, z, KENYA_WORLD_OUTLINE)) return null;
      if (KENYA_WORLD_LAKES.some((lake) => pointInPolygon(x, z, lake.points))) return null;
      return new THREE.Vector3(x, terrainHeight(x, z, distanceToOutline(x, z)) + 0.008, z);
    };
    cityClusters.forEach(({ city, radius }) => {
      const arterialCount = lowPower ? 4 : 7;
      for (let arterial = 0; arterial < arterialCount; arterial += 1) {
        const angle = (arterial / arterialCount) * Math.PI * 2 + 0.24;
        let previous: THREE.Vector3 | null = null;
        for (let step = 0.12; step <= 1.001; step += 0.18) {
          const point = roadPoint(
            city.x + Math.cos(angle) * radius * step,
            city.z + Math.sin(angle) * radius * step
          );
          if (previous && point) {
            roadPositions.push(previous.x, previous.y, previous.z, point.x, point.y, point.z);
          }
          previous = point;
        }
      }

      let previousRingPoint: THREE.Vector3 | null = null;
      let firstRingPoint: THREE.Vector3 | null = null;
      const ringSegments = lowPower ? 16 : 26;
      for (let segment = 0; segment <= ringSegments; segment += 1) {
        const angle = (segment / ringSegments) * Math.PI * 2;
        const point = roadPoint(
          city.x + Math.cos(angle) * radius * 0.62,
          city.z + Math.sin(angle) * radius * 0.62
        );
        if (!point) {
          previousRingPoint = null;
          continue;
        }
        if (!firstRingPoint) firstRingPoint = point;
        if (previousRingPoint) {
          roadPositions.push(
            previousRingPoint.x,
            previousRingPoint.y,
            previousRingPoint.z,
            point.x,
            point.y,
            point.z
          );
        }
        previousRingPoint = point;
      }
      if (firstRingPoint && previousRingPoint && previousRingPoint !== firstRingPoint) {
        roadPositions.push(
          previousRingPoint.x,
          previousRingPoint.y,
          previousRingPoint.z,
          firstRingPoint.x,
          firstRingPoint.y,
          firstRingPoint.z
        );
      }
    });
    const roadGeometry = new THREE.BufferGeometry();
    roadGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(roadPositions), 3));
    const roadMaterial = new THREE.LineBasicMaterial({
      color: 0xf0c77e,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const roads = new THREE.LineSegments(roadGeometry, roadMaterial);
    roads.frustumCulled = false;
    roads.renderOrder = 3;
    mapRoot.add(roads);

    const cityHalos: { material: THREE.MeshBasicMaterial }[] = [];
    cityClusters.forEach(({ city, radius }) => {
      const ground = terrainHeight(city.x, city.z, distanceToOutline(city.x, city.z));
      const material = new THREE.MeshBasicMaterial({
        map: glowTexture,
        color: 0xe3a33b,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(city.x, ground + 0.009, city.z);
      halo.scale.set(radius * 3.4, radius * 3.4, 1);
      halo.renderOrder = 1;
      mapRoot.add(halo);
      cityHalos.push({ material });
    });

    const nairobi = CITIES.find((city) => city.name === 'Nairobi') ?? CITIES[0]!;
    const nairobiGround = terrainHeight(nairobi.x, nairobi.z, distanceToOutline(nairobi.x, nairobi.z));
    const cityObject = new THREE.Object3D();

    const updateCity = (phase: number) => {
      cityBuildings.forEach((building, index) => {
        const rise = smoothstep(building.delay, 1, phase);
        building.rise = rise;
        const height = building.height * rise;
        cityObject.position.set(building.x, building.ground + height / 2, building.z);
        cityObject.rotation.set(0, 0, 0);
        cityObject.scale.set(building.width, Math.max(0.0001, height), building.depth);
        cityObject.updateMatrix();
        buildingsMesh.setMatrixAt(index, cityObject.matrix);
      });
      buildingsMesh.instanceMatrix.needsUpdate = true;

      cityPanels.forEach((panel, index) => {
        const building = panel.building;
        const height = building.height * building.rise;
        cityObject.position.set(
          building.x + panel.offsetX,
          building.ground + height / 2,
          building.z + panel.offsetZ
        );
        cityObject.rotation.set(0, panel.rotation, 0);
        cityObject.scale.set(panel.width, Math.max(0.0001, height), 1);
        cityObject.updateMatrix();
        windowsMesh.setMatrixAt(index, cityObject.matrix);
      });
      windowsMesh.instanceMatrix.needsUpdate = true;

      windowMaterial.opacity = smoothstep(0.18, 0.92, phase);
      buildingMaterial.emissiveIntensity = 0.24 + phase * 0.48;
      roadMaterial.opacity = phase * 0.28;
      cityHalos.forEach(({ material }) => {
        material.opacity = phase * 0.18;
      });
    };

    const fogStart = new THREE.Color(0x071a12);
    const fogEnd = new THREE.Color(0x0d1418);
    const keyStart = new THREE.Color(0xffd8a0);
    const keyEnd = new THREE.Color(0xffc77c);

    const dust = (() => {
      const amount = lowPower ? 90 : 180;
      const positions = new Float32Array(amount * 3);
      let seed = 49273;
      const random = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
      for (let i = 0; i < amount; i += 1) {
        const radius = 1.1 + random() * 2.6;
        const angle = random() * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = 0.12 + random() * 2.2;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: 0xe9dec7,
        size: 0.011,
        map: glowTexture,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      const points = new THREE.Points(dustGeometry, material);
      scene.add(points);
      return { points, material };
    })();

    const sunGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeRadialTexture([
          [0, 'rgba(240, 199, 126, 0.28)'],
          [0.35, 'rgba(227, 163, 59, 0.11)'],
          [1, 'rgba(227, 163, 59, 0)']
        ], 512),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true
      })
    );
    sunGlow.position.set(1.05, 0.9, -1.8);
    sunGlow.scale.set(3.6, 3.6, 1);
    sunGlow.renderOrder = -1;
    scene.add(sunGlow);

    let width = initialWidth;
    let height = initialHeight;
    let fitDistance = 1;
    let currentProgress = 0;
    let targetProgress = 0;
    let raf = 0;
    let lastTime = 0;
    let visible = true;
    let started = false;

    const computeFitDistance = () => {
      const fov = (camera.fov * Math.PI) / 180;
      const fitHeight = (MAP_HEIGHT * 1.06) / (2 * Math.tan(fov / 2));
      const widthPadding = camera.aspect < 1.05 ? 1.22 : 1.12;
      const fitWidth =
        (MAP_WIDTH * widthPadding) / (2 * Math.tan(fov / 2) * Math.max(camera.aspect, 0.35));
      return Math.max(fitHeight, fitWidth);
    };

    const updateScene = (progress: number) => {
      const eased = progress * progress * (3 - 2 * progress);
      const wide = width / height > 1.04;
      const cityPhase = smoothstep(0.12, 0.94, eased);
      const cityFocus = smoothstep(0.32, 0.92, eased);
      const distance =
        fitDistance *
        (wide ? 0.86 + eased * 0.18 - cityFocus * 0.06 : 0.82 + eased * 0.22 - cityFocus * 0.035);
      const phi = 1.105 - eased * 0.37 + cityFocus * 0.08;
      const theta = -0.42 + eased * 0.44;
      const citySceneX = (wide ? MAP_WIDTH * 0.19 : 0) + nairobi.x;
      const target = new THREE.Vector3(
        (wide ? 0.03 : 0) + (citySceneX - (wide ? 0.03 : 0)) * cityFocus * 0.4,
        (wide ? 0.06 : 0.11) + cityFocus * 0.02,
        nairobi.z * cityFocus * 0.26
      );

      camera.position.set(
        target.x + Math.sin(phi) * Math.sin(theta) * distance,
        target.y + Math.cos(phi) * distance,
        target.z + Math.sin(phi) * Math.cos(theta) * distance
      );
      camera.lookAt(target);

      key.intensity = 1.65 + eased * 0.7 + cityPhase * 0.4;
      key.color.copy(keyStart).lerp(keyEnd, cityFocus);
      rim.intensity = 7 + eased * 4 + cityPhase * 3;
      cityGlowLight.position.set(
        0.05 + (citySceneX - 0.05) * cityPhase,
        0.4 + (nairobiGround + 0.2 - 0.4) * cityPhase,
        0.15 + (nairobi.z - 0.15) * cityPhase
      );
      cityGlowLight.intensity = 2.2 + cityPhase * 5.2;
      rimUniforms.uOpacity.value = 0.13 + eased * 0.1 + cityPhase * 0.04;
      floorGlow.material.opacity = 0.42 + eased * 0.14 + cityPhase * 0.08;
      dust.material.opacity = 0.14 + eased * 0.14 + cityPhase * 0.08;
      sunGlow.material.opacity = 0.38 + eased * 0.16 + cityPhase * 0.08;
      beamUniforms.uOpacity.value = 0.32 - cityPhase * 0.2;
      dotMaterial.opacity = 0.72 - cityPhase * 0.22;
      rimHalo.material.opacity = 0.08 + eased * 0.06 + cityPhase * 0.04;
      terrainMaterial.emissiveIntensity = cityPhase * 0.12;
      labels.forEach(({ material, city }) => {
        const labelBase = (city.name === 'Nairobi' ? 0.9 : 0.68) + eased * 0.12;
        material.opacity = labelBase * (1 - cityPhase * 0.22);
        const labelVisible = wide ? width > 900 : city.name === 'Nairobi' && width > 420;
        material.visible = labelVisible;
      });

      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(fogStart).lerp(fogEnd, cityFocus);
        scene.fog.density = (lowPower ? 0.075 : 0.105) - cityFocus * (lowPower ? 0.002 : 0.005);
      }

      updateCity(cityPhase);
      mapRoot.position.x = wide ? MAP_WIDTH * 0.19 : 0;
      mapRoot.position.y = wide ? 0.01 : 0.13;
      mapRoot.updateMatrixWorld();
    };

    const renderFrame = () => {
      renderer.render(scene, camera);
    };

    const tick = (time: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      const delta = lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0.016;
      lastTime = time;
      const damping = 1 - Math.exp(-delta * 8.5);
      currentProgress += (targetProgress - currentProgress) * damping;
      if (Math.abs(targetProgress - currentProgress) < 0.0007) {
        currentProgress = targetProgress;
        updateScene(currentProgress);
        renderFrame();
        raf = 0;
        return;
      }
      updateScene(currentProgress);
      renderFrame();
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible) return;
      lastTime = 0;
      raf = requestAnimationFrame(tick);
    };

    const readScroll = () => {
      if (!started) return;
      const sectionRect = section.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - pin.offsetHeight);
      const next = clamp01((pinRect.top - sectionRect.top) / travel);
      targetProgress = next;
      section.style.setProperty('--cinema-p', next.toFixed(4));
      wake();
    };

    const resize = () => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.8));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      fitDistance = computeFitDistance();
      updateScene(currentProgress);
      if (visible) renderFrame();
      wake();
    };

    const onScroll = () => readScroll();
    const onResize = () => resize();
    const onVisibility = () => {
      if (!document.hidden) wake();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      failRef.current?.();
    };

    if (typeof ResizeObserver === 'undefined' || typeof IntersectionObserver === 'undefined') {
      renderer.dispose();
      canvas.remove();
      failRef.current?.();
      return;
    }

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(host);
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) wake();
      },
      { rootMargin: '160px 0px' }
    );
    intersectionObserver.observe(section);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);

    fitDistance = computeFitDistance();
    started = true;
    readScroll();
    currentProgress = targetProgress;
    updateScene(currentProgress);
    renderFrame();
    section.style.setProperty('--cinema-p', targetProgress.toFixed(4));
    // Wait one paint so the server-rendered plate is already under the canvas.
    const readyTimer = window.setTimeout(() => readyRef.current?.(), 60);

    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (raf) cancelAnimationFrame(raf);
      const disposedGeometries = new Set<THREE.BufferGeometry>();
      const disposedMaterials = new Set<THREE.Material>();
      scene.traverse((object) => {
        const renderable = object as THREE.Object3D & {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };
        if (renderable.geometry) disposedGeometries.add(renderable.geometry);
        if (renderable.material) {
          materialList(renderable.material).forEach((material) => disposedMaterials.add(material));
        }
      });
      disposedGeometries.forEach((geometry) => geometry.dispose());
      disposedMaterials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) value.dispose();
        });
        material.dispose();
      });
      mask.dispose();
      floorGlowTexture.dispose();
      glowTexture.dispose();
      environmentTarget?.dispose();
      renderer.dispose();
      canvas.remove();
      section.style.removeProperty('--cinema-p');
    };
  }, []);

  return <div ref={hostRef} className="ps-kenya__canvasHost" aria-hidden="true" />;
}
