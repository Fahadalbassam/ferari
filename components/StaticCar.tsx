"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  Color,
  CubeTextureLoader,
  Group,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  Quaternion,
  SRGBColorSpace,
  Texture,
} from "three";

type CarParts = {
  scene: Group;
  baseQuats: Map<Mesh, Quaternion>;
};

function useEnvMap() {
  const { gl } = useThree();
  return useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const cube = new CubeTextureLoader().load([
      "/textures/cube/skyboxsun25deg/px.jpg",
      "/textures/cube/skyboxsun25deg/nx.jpg",
      "/textures/cube/skyboxsun25deg/py.jpg",
      "/textures/cube/skyboxsun25deg/ny.jpg",
      "/textures/cube/skyboxsun25deg/pz.jpg",
      "/textures/cube/skyboxsun25deg/nz.jpg",
    ]);
    cube.colorSpace = SRGBColorSpace;
    const env = pmrem.fromCubemap(cube).texture;
    cube.dispose();
    pmrem.dispose();
    return env;
  }, [gl]);
}

function useCar(envMap: Texture): CarParts {
  const gltf = useGLTF("/models/ferrari.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const baseQuats = useMemo(() => {
    const map = new Map<Mesh, Quaternion>();
    scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        map.set(obj, obj.quaternion.clone());
      }
    });
    return map;
  }, [scene]);

  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      const mat = obj.material as MeshStandardMaterial;
      mat.envMap = envMap;
      mat.needsUpdate = true;

      const matName = (mat.name || obj.name || "").toLowerCase();
      const meshName = obj.name.toLowerCase();
      const isGlass =
        matName.includes("glass") || matName.includes("head") || matName.includes("lamp") || meshName.includes("glass");
      const isRim = matName.includes("rim") || meshName.includes("rim");

      if (isGlass) {
        mat.transparent = true;
        mat.opacity = 0.22;
        mat.roughness = 0.03;
        mat.metalness = 0;
        mat.envMapIntensity = 1.4;
        mat.color = new Color("#e7efff");
      } else if (isRim) {
        mat.metalness = 1;
        mat.roughness = 0.18;
        mat.envMapIntensity = 1.8;
        mat.color = new Color("#dfe3e6");
      }
    });
  }, [envMap, scene]);

  // ensure no drift
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        const base = baseQuats.get(obj);
        if (base) obj.quaternion.copy(base);
      }
    });
  }, [baseQuats, scene]);

  return { scene, baseQuats };
}

function StaticCarModel() {
  const envMap = useEnvMap();
  const { scene } = useCar(envMap);
  const ref = useRef<Group>(null);
  return <primitive object={scene} ref={ref} castShadow receiveShadow />;
}

export default function StaticCar() {
  return (
    <div
      className="w-full overflow-hidden bg-black"
      style={{
        aspectRatio: "16 / 5",
        height: "calc((100vw / 16) * 5 - 130px)",
        minHeight: "260px",
      }}
    >
      <Canvas
        shadows
        camera={{ position: [3.0, 2.0, 3.8], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
          physicallyCorrectLights: true,
        }}
        onCreated={({ scene }) => {
          scene.background = new Color("#000000");
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            intensity={1.5}
            position={[6, 8, 6]}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <StaticCarModel />
          <OrbitControls
            enableDamping
            enablePan={false}
            enableRotate={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={1.1}
            minDistance={3}
            maxDistance={8}
            target={[0, 0.8, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/ferrari.glb");

