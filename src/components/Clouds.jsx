import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Clouds,
  Cloud,
  CameraControls,
  Sky as SkyImpl,
  StatsGl,
} from "@react-three/drei";
// import { useControls } from "leva";

export default function AtmosphericClouds() {
  const ref = useRef();
  const cloud0 = useRef();
  const cloud1 = useRef();

  useFrame((state, delta) => {
    // ref.current.rotation.y = Math.cos(state.clock.elapsedTime / 2) / 2;
    // ref.current.rotation.x = Math.sin(state.clock.elapsedTime / 2) / 2;
    cloud0.current.rotation.y -= delta;
  });
  return (
    <>
      {/* <SkyImpl /> */}
      <group ref={ref}>
        <Clouds material={THREE.MeshLambertMaterial} limit={400} range={344}>
          <Cloud
            ref={cloud0}
            segments={50}
            volume={200}
            opacity={0.13}
            fade={10}
            growth={13}
            speed={0.1}
            bounds={[27.3, 0.1, 57.5]}
            color="#eed0d0"
            seed={8}
            position={[-114.5, 192.0, -1.9]}
          />
          <Cloud
            ref={cloud0}
            segments={26}
            volume={4.5}
            opacity={0.6}
            fade={2}
            growth={2}
            speed={0.01}
            bounds={[4, 0.7, 4]}
            color="#ff5833"
            seed={9}
            position={[-83.5, 10.0, -69.9]}
          />
        </Clouds>
      </group>
    </>
  );
}
