*** Begin Patch
*** Update File: my-app/components/StaticCar.tsx
@@
-import { Suspense, useEffect, useMemo, useRef } from "react";
+import Image from "next/image";
+import { Suspense, useEffect, useMemo, useRef, useState } from "react";
@@
 export default function StaticCar() {
+  const rotatingCards = [
+    {
+      title: "Cabin detail",
+      image: "/ANOTHERINTERIO.avif",
+      description: "296 GTB-inspired cockpit with carbon and leather contrast.",
+    },
+    {
+      title: "Italia cockpit",
+      image: "/ITALIAinterio.avif",
+      description: "Driver-first layout, stitched leather, and F1-style controls.",
+    },
+  ];
+
+  const staticCard = {
+    title: "Italia powertrain",
+    image: "/firrariItaliaengine.avif",
+    description: "Mid-mounted V8 layout that anchors the car’s balance and thrust.",
+  };
+
+  const [activeIdx, setActiveIdx] = useState(0);
+
+  useEffect(() => {
+    const id = setInterval(() => {
+      setActiveIdx((idx) => (idx + 1) % rotatingCards.length);
+    }, 10_000);
+    return () => clearInterval(id);
+  }, [rotatingCards.length]);
+
   return (
-    <div
-      className="w-full overflow-hidden bg-black"
-      style={{
-        aspectRatio: "16 / 5",
-        height: "calc((100vw / 16) * 5 - 130px)",
-        minHeight: "260px",
-      }}
-    >
-      <Canvas
-        shadows
-        camera={{ position: [3.0, 2.0, 3.8], fov: 45 }}
-        gl={{
-          antialias: true,
-          toneMapping: ACESFilmicToneMapping,
-          outputColorSpace: SRGBColorSpace,
-          physicallyCorrectLights: true,
-        }}
-        onCreated={({ scene }) => {
-          scene.background = new Color("#000000");
-        }}
-      >
-        <Suspense fallback={null}>
-          <ambientLight intensity={0.5} />
-          <directionalLight
-            castShadow
-            intensity={1.5}
-            position={[6, 8, 6]}
-            shadow-mapSize-width={1024}
-            shadow-mapSize-height={1024}
-          />
-          <StaticCarModel />
-          <OrbitControls
-            enableDamping
-            enablePan={false}
-            enableRotate={false}
-            enableZoom={false}
-            autoRotate
-            autoRotateSpeed={1.1}
-            minDistance={3}
-            maxDistance={8}
-            target={[0, 0.8, 0]}
-          />
-        </Suspense>
-      </Canvas>
+    <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "16 / 5", height: "calc((100vw / 16) * 5 - 130px)", minHeight: "260px" }}>
+      <Canvas
+        shadows
+        camera={{ position: [3.0, 2.0, 3.8], fov: 45 }}
+        gl={{
+          antialias: true,
+          toneMapping: ACESFilmicToneMapping,
+          outputColorSpace: SRGBColorSpace,
+          physicallyCorrectLights: true,
+        }}
+        onCreated={({ scene }) => {
+          scene.background = new Color("#000000");
+        }}
+      >
+        <Suspense fallback={null}>
+          <ambientLight intensity={0.5} />
+          <directionalLight
+            castShadow
+            intensity={1.5}
+            position={[6, 8, 6]}
+            shadow-mapSize-width={1024}
+            shadow-mapSize-height={1024}
+          />
+          <StaticCarModel />
+          <OrbitControls
+            enableDamping
+            enablePan={false}
+            enableRotate={false}
+            enableZoom={false}
+            autoRotate
+            autoRotateSpeed={1.1}
+            minDistance={3}
+            maxDistance={8}
+            target={[0, 0.8, 0]}
+          />
+        </Suspense>
+      </Canvas>
+
+      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 sm:px-6 lg:px-10">
+        <div className="flex max-w-xs flex-col gap-3">
+          {rotatingCards.map((card, idx) => {
+            const isActive = idx === activeIdx;
+            return (
+              <div
+                key={card.title}
+                className={`pointer-events-auto flex gap-3 rounded-xl bg-white/80 p-3 shadow-lg backdrop-blur transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0 absolute"}`}
+                aria-hidden={!isActive}
+              >
+                <div className="relative h-20 w-28 overflow-hidden rounded-lg">
+                  <Image src={card.image} alt={card.title} fill sizes="120px" className="object-cover" />
+                </div>
+                <div className="flex min-w-0 flex-col">
+                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-700">{card.title}</div>
+                  <div className="text-sm text-neutral-800 line-clamp-3">{card.description}</div>
+                </div>
+              </div>
+            );
+          })}
+        </div>
+
+        <div className="pointer-events-auto hidden max-w-xs flex-col gap-3 rounded-xl bg-white/80 p-3 shadow-lg backdrop-blur sm:flex">
+          <div className="relative h-28 w-full overflow-hidden rounded-lg">
+            <Image src={staticCard.image} alt={staticCard.title} fill sizes="220px" className="object-cover" />
+          </div>
+          <div className="flex flex-col gap-1">
+            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-700">{staticCard.title}</div>
+            <div className="text-sm text-neutral-800 line-clamp-3">{staticCard.description}</div>
+          </div>
+        </div>
+      </div>
     </div>
   );
 }
*** End Patch