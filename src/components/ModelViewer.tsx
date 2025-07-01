"use client";

import React, {
  Suspense,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Canvas, useFrame, Camera, useThree, extend } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera as DreiPerspectiveCamera,
  Html,
  shaderMaterial,
  Environment,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import SceneContent, { type Note } from "./SceneContent";
import Spinner from "./Spinner";
// @ts-expect-error: GLSL module is not yet typed
import surfaceVertexShader from "../shaders/vertex.glsl";
import Image from "next/image";
// @ts-expect-error: GLSL module is not yet typed
import surfaceFragmentShader from "../shaders/fragment.glsl";
import SmokeScreen from "./SmokeScreen.jsx";

const modelPath = "/models/castle.glb";

function Loader3() {
  return (
    <Image
      src="/castle_splash.png"
      alt="Loading..."
      id="loading-image"
      width={500}
      height={500}
    />
  );
}

function WellWaterSetup() {
  const WellWaterMaterial = shaderMaterial(
    {
      uTime: 0,
      uSurfaceColor: new THREE.Color("#F93827"),
      uDepthColor: new THREE.Color("#2030AD"),
      uBigWavesElevation: 0.22,
      uBigWavesFrequency: new THREE.Vector2(4, 4),
      uBigWavesSpeed: 0.15,

      uSmallWavesElevation: 0.35,
      uSmallWavesFrequency: 3.0,
      uSmallWavesSpeed: 0.15,
      uSmallIterations: 4.0,

      uColorOffset: 0.925,
      uColorMultiplier: 1,
    },
    surfaceVertexShader,
    surfaceFragmentShader
  );

  extend({ WellWaterMaterial });
}

// Define hardcoded notes here.
// Replace these with actual coordinates from your model.
const notesData: Note[] = [
  {
    id: "note1",
    position: [25, 56, 25], // Position of the bullseye on the model
    label: "Tower 1",
    cameraTargetPosition: [30, 61, 30], //[1, 1.5, 3.5], // Where camera should move
    controlsLookAtTarget: [0, 40, 0], // What camera should look at
  },
  {
    id: "note2",
    position: [-80, 53, 24],
    label: "walkway",
    cameraTargetPosition: [-85, 58, 29],
    controlsLookAtTarget: [-80, 53, 24],
  },
  {
    id: "note3",
    position: [-59.1, 50, -150],
    label: "Tower 2",
    cameraTargetPosition: [-54.1, 55, -145],
    controlsLookAtTarget: [59.1, 50, 150],
  },
];

const CAMERA_ANIMATION_DURATION = 1.0; // seconds

interface AnimationState {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  startLookAt: THREE.Vector3;
  endLookAt: THREE.Vector3;
  progress: number;
}

// New component to handle animation and useFrame
const AnimationHandler: React.FC<{
  animationState: AnimationState | null;
  setAnimationState: React.Dispatch<
    React.SetStateAction<AnimationState | null>
  >;
  setCurrentCameraPosition: React.Dispatch<
    React.SetStateAction<THREE.Vector3 | null>
  >;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>;
}> = ({
  animationState,
  setAnimationState,
  setCurrentCameraPosition,
  cameraRef,
  orbitControlsRef,
}) => {
  const { camera } = useThree();
  useFrame((state, delta) => {
    if (animationState && cameraRef.current && orbitControlsRef.current) {
      let newProgress =
        animationState.progress + delta / CAMERA_ANIMATION_DURATION;
      let animationComplete = false;
      if (newProgress >= 1) {
        newProgress = 1;
        animationComplete = true;
      }

      camera.position.lerpVectors(
        animationState.startPosition,
        animationState.endPosition,
        newProgress
      );
      orbitControlsRef.current.target.lerpVectors(
        animationState.startLookAt,
        animationState.endLookAt,
        newProgress
      );

      orbitControlsRef.current.update(); // Crucial for OrbitControls to reflect changes

      setCurrentCameraPosition(camera.position.clone());

      setAnimationState((prev) =>
        prev ? { ...prev, progress: newProgress } : null
      );

      if (animationComplete) {
        // Ensure final position and target are set precisely
        cameraRef.current.position.copy(animationState.endPosition);
        setCurrentCameraPosition(animationState.endPosition);
        orbitControlsRef.current.target.copy(animationState.endLookAt);
        //orbitControlsRef.current.target.copy(animationState.endPosition);
        orbitControlsRef.current.update();
        console.log(
          "new orbit controls location",
          orbitControlsRef.current.target
        );

        setAnimationState(null); // End animation
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = true;
        }
      } else {
        // Disable controls during animation
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = false;
        }
      }
    } else {
      // Ensure controls are enabled if not animating
      if (orbitControlsRef.current && !orbitControlsRef.current.enabled) {
        orbitControlsRef.current.enabled = true;
      }
    }
  });
  return null;
};

const ModelViewer: React.FC = () => {
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [currentCameraPosition, setCurrentCameraPosition] =
    useState<THREE.Vector3 | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [previousViewState, setPreviousViewState] = useState<{
    position: THREE.Vector3;
    lookAt: THREE.Vector3;
  } | null>(null);

  const [animationState, setAnimationState] = useState<AnimationState | null>(
    null
  );

  const [initialControlTarget, setInitialControlTarget] =
    useState<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));

  const handleNoteClick = useCallback(
    (noteId: string) => {
      if (!cameraRef.current || !orbitControlsRef.current) return;
      const currentCameraPos = currentCameraPosition
        ? currentCameraPosition.clone()
        : cameraRef.current.position.clone();
      const currentLookAt = orbitControlsRef.current.target.clone();
      const clickedNote = notesData.find((n) => n.id === noteId);

      if (!clickedNote) return;

      if (activeNoteId === noteId) {
        // Clicked active note, fly back
        if (previousViewState) {
          setAnimationState({
            startPosition: currentCameraPos,
            endPosition: previousViewState.position,
            startLookAt: currentLookAt,
            endLookAt: previousViewState.lookAt,
            progress: 0,
          });
          setActiveNoteId(null);
          setPreviousViewState(null); // Clear previous state once we start returning
        }
      } else {
        // Clicked a new note or from free roam
        if (!activeNoteId && !previousViewState) {
          // Coming from free roam, store current state
          setPreviousViewState({
            position: currentCameraPos,
            lookAt: currentLookAt,
          });
        }
        // If already focused on a note, previousViewState is already set, so we don't update it.
        // This means clicking another note while focused will return to the original free-roam view, not the view of the previously focused note.
        // To change this behavior, update previousViewState here:
        // setPreviousViewState({ position: currentCameraPos, lookAt: currentLookAt });

        setAnimationState({
          startPosition: currentCameraPos,
          endPosition: new THREE.Vector3(...clickedNote.cameraTargetPosition),
          startLookAt: currentLookAt,
          endLookAt: new THREE.Vector3(...clickedNote.controlsLookAtTarget),
          progress: 0,
        });
        setActiveNoteId(noteId);
      }
    },
    [activeNoteId, previousViewState, currentCameraPosition]
  );

  useEffect(() => {
    // Set initial look-at target for OrbitControls
    if (orbitControlsRef.current) {
      orbitControlsRef.current.target.copy(initialControlTarget);
      orbitControlsRef.current.update();
    }
  }, [initialControlTarget]); // Dependency on initialControlTarget
  //console.log("Rendering ModelViewer with modelPath:", modelPath);
  return (
    <div className="h-screen w-screen bg-background">
      <Canvas shadows>
        <DreiPerspectiveCamera
          ref={cameraRef}
          position={[75, 50.5, 197]} // Initial camera position
          fov={35}
          makeDefault
        />
        <Environment preset="forest" backgroundIntensity={0.002} />
        {/* <SmokeScreen
          texturePath="./perlin.png"
          width={6}
          height={35.3}
          widthSegments={64}
          heightSegments={256}
          position={[-85, 34, -75]} // Set the position (x, y, z)
          rotation={[0, 0, 0]} // Set the rotation (x, y, z in radians)
          scale={[2, 2, 4]} // Set the scale (x, y, z)
        />
        <SmokeScreen
          texturePath="./perlin.png"
          width={6}
          height={35.3}
          widthSegments={64}
          heightSegments={256}
          position={[-85, 34, -75]} // Set the position (x, y, z)
          rotation={[0, Math.PI, 0]} // Set the rotation (x, y, z in radians)
          scale={[2, 2, 4]} // Set the scale (x, y, z)
        /> */}
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[5, 10, 7.5]}
          intensity={1.5}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[5, 25, -5]} intensity={0.5} />

        <Suspense
          fallback={
            <Html center>
              <Spinner />
              {/* <Loader3 /> */}
            </Html>
          }
        >
          <SceneContent
            notes={notesData}
            onNoteClick={handleNoteClick}
            modelPath={modelPath}
          />
        </Suspense>

        {/* Animation handler to manage camera transitions */}
        {/* This component uses useFrame to animate the camera position and target */}
        {/* It does not render anything itself, just handles the animation logic */}
        {/* This is crucial to ensure the camera updates smoothly */}
        {/* It also ensures OrbitControls are disabled during animation */}
        <AnimationHandler
          animationState={animationState}
          setAnimationState={setAnimationState}
          cameraRef={cameraRef}
          orbitControlsRef={orbitControlsRef}
          setCurrentCameraPosition={setCurrentCameraPosition}
        />

        <OrbitControls
          ref={orbitControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
          //target={initialControlTarget} // Set initial target
          target={new THREE.Vector3(0, 0, 0)}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 p-2 bg-card text-card-foreground rounded-md shadow-lg text-sm">
        <p className="font-semibold">Model Notes Controls:</p>
        <ul className="list-disc list-inside">
          <li>Orbit: Left-click + drag</li>
          <li>Zoom: Scroll wheel</li>
          <li>Pan: Right-click + drag / Ctrl + Left-click + drag</li>
          <li>Click bullseyes to focus. Click again to return.</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelViewer;
