import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Texture } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";

import { ShaderMaterial } from "three";
//import SmokeScreenVertexShader from "./shaders/smoke/vertex.glsl";
//import SmokeScreenFragmentShader from "./shaders/smoke/fragment.glsl";
import SmokeScreenVertexShader2 from "../shaders/smoke/vertex2.glsl";
import SmokeScreenFragmentShader2 from "../shaders/smoke/fragment2.glsl";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { TextureLoader } from "three";
import { useMemo } from "react";
import { useState } from "react";

import { useTexture } from "@react-three/drei";

const SmokeScreen = ({
  texturePath,
  //vertexShader,
  // fragmentShader,
  width = 1.0,
  height = 0.2,
  widthSegments = 100,
  heightSegments = 100,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}) => {
  const meshRef = useRef();
  const texture = useLoader(TextureLoader, texturePath);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // Set texture wrapping mode
  const time = useRef(0); // Create a ref to hold the time value

  useFrame((state, delta) => {
    time.current += delta * 2.8;
    meshRef.current.material.uniforms.uTime.value = time.current;
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height, widthSegments, heightSegments]} />
        <shaderMaterial
          vertexShader={SmokeScreenVertexShader2}
          fragmentShader={SmokeScreenFragmentShader2}
          uniforms={{
            uPerlinTexture: { value: texture },
            uTime: { value: time.current },
          }}
          transparent={true}
          depthWrite={false}
          side={2}
        />
      </mesh>
    </group>
  );
};

export default SmokeScreen;
