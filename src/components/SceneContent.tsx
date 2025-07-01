"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { shaderMaterial, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import StickyNote from "./StickyNote";
import Loader3 from "./Loader3";
import { extend, useFrame } from "@react-three/fiber";
// @ts-expect-error: GLSL module is not yet typed
import surfaceVertexShader from "../shaders/vertex.glsl";
// @ts-expect-error: GLSL module is not yet typed
import surfaceFragmentShader from "../shaders/fragment.glsl";
import Clouds from "./Clouds.jsx";

// Define the structure of a note
export interface Note {
  id: string;
  position: THREE.Vector3Tuple; // [x, y, z]
  label: string;
  description?: string; // Optional description
  // Target camera position when this note is active
  cameraTargetPosition: THREE.Vector3Tuple;
  // Target point for OrbitControls to look at when this note is active
  controlsLookAtTarget: THREE.Vector3Tuple;
}

interface SceneContentProps {
  notes: Note[];
  onNoteClick: (noteId: string) => void;
  modelPath: string;
}

interface ModelProps {
  modelPath: string;
}

// Placeholder model component
const PlaceholderModel: React.FC = () => {
  return (
    <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hsl(var(--primary))" />
    </mesh>
  );
};

// Actual model loading component
const Model: React.FC<ModelProps> = ({ modelPath }) => {
  // IMPORTANT: Place your model.gltf in the public/models/ directory
  // If your model has a different name, update the path below.

  const { scene } = useGLTF(modelPath);
  const shaderMaterialRef = useRef<
    THREE.ShaderMaterial | typeof WellWaterMaterial | null
  >(null);
  const WellWaterMaterial = shaderMaterial(
    {
      uTime: 0,
      uSurfaceColor: new THREE.Color("#3264a8"),
      uDepthColor: new THREE.Color("#0e2038"),
      uBigWavesElevation: 0.22,
      uBigWavesFrequency: new THREE.Vector2(1, 1),
      uBigWavesSpeed: 1.15,

      uSmallWavesElevation: 0.35,
      uSmallWavesFrequency: 1.0,
      uSmallWavesSpeed: 1.15,
      uSmallIterations: 4.0,

      uColorOffset: 0.925,
      uColorMultiplier: 1,
    },
    surfaceVertexShader,
    surfaceFragmentShader
  );

  extend({ WellWaterMaterial });

  const grassShaderMaterialRef = useRef<
    THREE.ShaderMaterial | typeof GrassMaterial | null
  >(null);
  const GrassMaterial = shaderMaterial(
    {
      uTime: 0,
      uSurfaceColor: new THREE.Color("#2aa149"),
      uDepthColor: new THREE.Color("#165727"),
      uBigWavesElevation: 0.22,
      uBigWavesFrequency: new THREE.Vector2(110, 110),
      uBigWavesSpeed: 1.15,

      uSmallWavesElevation: 0.35,
      uSmallWavesFrequency: 1.0,
      uSmallWavesSpeed: 1.15,
      uSmallIterations: 4.0,

      uColorOffset: 0.925,
      uColorMultiplier: 1,
    },
    surfaceVertexShader,
    surfaceFragmentShader
  );

  extend({ GrassMaterial });

  useEffect(() => {
    scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        if (object.name === "well_water") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const customMaterial = new (WellWaterMaterial as any)();
          object.material = customMaterial;
          shaderMaterialRef.current = customMaterial; // Store ref to update uniforms
        }
        // if (object.name === "moat") {
        //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //   const grassMaterial = new (GrassMaterial as any)();
        //   object.material = grassMaterial;
        //   grassShaderMaterialRef.current = grassMaterial; // Store ref to update uniforms
        // }
      }
    });
  }, [WellWaterMaterial, GrassMaterial, scene]); // Re-run effect if scene object changes (unlikely for static models)

  useFrame((state, delta) => {
    if (shaderMaterialRef.current) {
      // Update your uniform for animation
      // @ts-expect-error: GLSL module is not yet typed
      shaderMaterialRef.current.uniforms.uTime.value += delta;
    }

    if (grassShaderMaterialRef.current) {
      // Update your uniform for animation
      // @ts-expect-error: GLSL module is not yet typed
      grassShaderMaterialRef.current.uniforms.uTime.value += delta;
    }
  });

  // This assumes your model is oriented and scaled appropriately.
  // You might need to adjust position, rotation, or scale of the scene.
  // e.g., <primitive object={scene} scale={0.5} position={[0, -1, 0]} />
  return <primitive object={scene} castShadow receiveShadow />;

  // return <PlaceholderModel />;
};

const SceneContent: React.FC<SceneContentProps> = ({
  notes,
  onNoteClick,
  modelPath,
}) => {
  //console.log("Rendering SceneContent with modelPath:", modelPath);
  return (
    <>
      <Clouds />
      <Model modelPath={modelPath} />
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          position={note.position}
          label={note.label}
          onClick={() => onNoteClick(note.id)}
        />
      ))}
      {/* Floor */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="hsl(var(--secondary))"
          opacity={0.5}
          transparent
        />
      </mesh>
    </>
  );
};

//useGLTF.preload(modelPath);

export default SceneContent;
