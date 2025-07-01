"use client";

import React from "react";
import { Html } from "@react-three/drei";
import type * as THREE from "three";
import PulsatingBullseye from "./PulsatingBullseye";

interface StickyNoteProps {
  position: THREE.Vector3Tuple;
  label: string;
  onClick: () => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  position,
  label,
  onClick,
}) => {
  return (
    <Html
      position={position}
      center
      distanceFactor={0}
      transform={true}
      zIndexRange={[3, 0]}
    >
      <PulsatingBullseye onClick={onClick} aria-label={`Note: ${label}`} />
    </Html>
  );
};

export default StickyNote;
