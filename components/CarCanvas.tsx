"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  Color,
  CubeTextureLoader,
  MathUtils,
  Group,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  Quaternion,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
} from "three";

type ControlState = {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
};

type CarParts = {
  scene: Group;
  frontWheels: Mesh[];
  rearWheels: Mesh[];
  steeringWheel?: Mesh;
  baseQuats: Map<Mesh, Quaternion>;
};

function useEnvMap() {
  const { gl } = useThree();
  const loader = useMemo(() => new CubeTextureLoader(), []);

  return useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const cube = loader.load([
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
  }, [gl, loader]);
}

function useCar(envMap: Texture): CarParts {
  const gltf = useGLTF("/models/ferrari.glb");
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const { frontWheels, rearWheels, steeringWheel, baseQuats } = useMemo<CarParts>(() => {
    const fronts: Mesh[] = [];
    const rears: Mesh[] = [];
    const bases = new Map<Mesh, Quaternion>();
    let steer: Mesh | undefined;

    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      bases.set(obj, obj.quaternion.clone());

      const name = obj.name.toLowerCase();
      const isSteering = name.includes("steering");
      const isTyre = name.includes("tyre") || name.includes("tire");
      const isWheelish =
        name.includes("wheel") ||
        name.startsWith("wheel_") ||
        name.startsWith("rim") ||
        name.startsWith("rim_") ||
        name === "rim_fl" ||
        name === "rim_fr" ||
        name === "rim_rl" ||
        name === "rim_rr";

      if (isWheelish && !isTyre && !isSteering) {
        const isFront =
          name.includes("front") ||
          name.includes("_fl") ||
          name.includes("_fr") ||
          name.endsWith("fl") ||
          name.endsWith("fr");
        if (isFront) {
          fronts.push(obj);
        } else {
          rears.push(obj);
        }
      }
      if (!steer && isSteering) {
        steer = obj;
      }
    });

    return { scene, frontWheels: fronts, rearWheels: rears, steeringWheel: steer, baseQuats: bases };
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
        matName.includes("glass") ||
        matName.includes("head") ||
        matName.includes("lamp") ||
        meshName.includes("glass") ||
        meshName.includes("lens");
      const isRim =
        meshName === "rim_fl" ||
        meshName === "rim_fr" ||
        meshName === "rim_rl" ||
        meshName === "rim_rr" ||
        meshName.startsWith("rim") ||
        meshName.startsWith("wheel_");
      const isTyre = meshName.includes("tyre") || meshName.includes("tire");

      if (isGlass) {
        mat.transparent = true;
        mat.opacity = 0.2;
        mat.roughness = 0.04;
        mat.metalness = 0;
        mat.envMapIntensity = 1.35;
        mat.color = new Color("#e9f0ff");
      } else if (isRim && !isTyre) {
        mat.metalness = 1;
        mat.roughness = 0.18;
        mat.envMapIntensity = 1.7;
        mat.color = new Color("#d5d7dc");
      } else {
        mat.envMapIntensity = mat.envMapIntensity ?? 1.0;
        mat.envMapIntensity = Math.min(Math.max(mat.envMapIntensity, 1.0), 1.2);
      }
    });
  }, [envMap, scene]);

  return { scene, frontWheels, rearWheels, steeringWheel, baseQuats };
}

function Ground({ ao }: { ao: Texture }) {
  const aoMap = useMemo(() => {
    const cloned = ao.clone();
    cloned.flipY = false;
    return cloned;
  }, [ao]);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color="#f4ede3" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]} renderOrder={-1}>
        <planeGeometry args={[8, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} alphaMap={aoMap} />
      </mesh>
    </>
  );
}

function CarRig({ follow }: { follow: boolean }) {
  const envMap = useEnvMap();
  const { scene, frontWheels, rearWheels, steeringWheel, baseQuats } = useCar(envMap);
  const group = useRef<Group>(null!);
  const controls = useRef<ControlState>({
    forward: false,
    back: false,
    left: false,
    right: false,
    brake: false,
  });
  const velocity = useRef(0);
  const heading = useRef(0);
  const position = useRef(new Vector3(0, 0, 0));
  const spin = useRef(0);
  const steering = useRef(0);
  const { camera } = useThree();
  const steerQuat = useMemo(() => new Quaternion(), []);
  const spinQuat = useMemo(() => new Quaternion(), []);
  const xAxis = useMemo(() => new Vector3(1, 0, 0), []);
  const yAxis = useMemo(() => new Vector3(0, 1, 0), []);

  useEffect(() => {
    const handledKeys = new Set([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "W",
      "a",
      "A",
      "s",
      "S",
      "d",
      "D",
      " ",
    ]);
    const down = (e: KeyboardEvent) => {
      if (handledKeys.has(e.key)) e.preventDefault();
      if (["ArrowUp", "w", "W"].includes(e.key)) controls.current.forward = true;
      if (["ArrowDown", "s", "S"].includes(e.key)) controls.current.back = true;
      if (["ArrowLeft", "a", "A"].includes(e.key)) controls.current.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) controls.current.right = true;
      if (e.code === "Space" || e.key === " ") controls.current.brake = true;
    };
    const up = (e: KeyboardEvent) => {
      if (handledKeys.has(e.key)) e.preventDefault();
      if (["ArrowUp", "w", "W"].includes(e.key)) controls.current.forward = false;
      if (["ArrowDown", "s", "S"].includes(e.key)) controls.current.back = false;
      if (["ArrowLeft", "a", "A"].includes(e.key)) controls.current.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) controls.current.right = false;
      if (e.code === "Space" || e.key === " ") controls.current.brake = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    const accel = controls.current.forward ? 16 : 0;
    const brakeForce = controls.current.brake ? 30 : 0;
    const reverse = controls.current.back ? 10 : 0;
    const targetSteer = controls.current.left ? 0.7 : controls.current.right ? -0.7 : 0;

    velocity.current += (accel - brakeForce - velocity.current * 2.2) * delta;
    velocity.current -= reverse * delta;
    velocity.current = MathUtils.clamp(velocity.current, -14, 26);

    steering.current = MathUtils.lerp(steering.current, targetSteer, 0.18);
    heading.current += steering.current * velocity.current * 0.12 * delta;

    const forward = new Vector3(0, 0, -1).applyAxisAngle(new Vector3(0, 1, 0), heading.current);
    position.current.addScaledVector(forward, velocity.current * delta);

    const rig = group.current;
    rig.position.copy(position.current);
    rig.rotation.y = heading.current;

    // wheel spin & steer
    spin.current += (velocity.current * delta) / 0.35;
    const applyWheel = (wheel: Mesh, steer: number) => {
      const base = baseQuats.get(wheel);
      if (!base) return;
      steerQuat.setFromAxisAngle(yAxis, steer);
      spinQuat.setFromAxisAngle(xAxis, -spin.current);
      wheel.quaternion.copy(base).multiply(steerQuat).multiply(spinQuat);
    };
    frontWheels.forEach((w) => applyWheel(w, steering.current));
    rearWheels.forEach((w) => applyWheel(w, 0));

    if (steeringWheel) {
      const base = baseQuats.get(steeringWheel);
      if (base) {
        steeringWheel.quaternion.copy(base);
        steeringWheel.rotateZ(steering.current * 1.6);
      }
    }

    if (follow) {
      const targetPos = new Vector3(0, 1.4, 6)
        .applyAxisAngle(new Vector3(0, 1, 0), heading.current)
        .add(position.current);
      camera.position.lerp(targetPos, 0.08);
      const look = new Vector3(position.current.x, position.current.y + 0.6, position.current.z);
      camera.lookAt(look);
    }
  });

  return <primitive object={scene} ref={group} castShadow receiveShadow />;
}

export default function CarCanvas() {
  const [follow, setFollow] = useState(true);
  const ao = useLoader(TextureLoader, "/models/ferrari_ao.png");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      void el.requestFullscreen().catch(() => {});
    } else {
      void document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
      <div className="pointer-events-none absolute left-3 top-3 z-10 space-y-2 text-xs font-semibold text-neutral-800">
        <div className="rounded-md bg-white/80 px-3 py-2 shadow">
          Drive: W/S or ↑/↓ — Steer: A/D or ←/→ — Brake: Space — Camera: Orbit (when follow off)
        </div>
      </div>
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setFollow((v) => !v)}
          className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-neutral-800"
        >
          {follow ? "Disable follow cam" : "Enable follow cam"}
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-neutral-800"
        >
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </div>
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
          physicallyCorrectLights: true,
        }}
        onCreated={({ scene }) => {
          scene.background = new Color("#f4ede3");
          scene.castShadow = true;
          scene.receiveShadow = true;
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
          <Ground ao={ao} />
          <CarRig follow={follow} />
          {!follow && <OrbitControls maxDistance={50} minDistance={4} target={[0, 0.8, 0]} />}
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/ferrari.glb");

