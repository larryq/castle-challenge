"use client"; // Required for ModelViewer which uses client-side hooks

import ModelViewer from "@/components/ModelViewer";

export default function Home() {
  return (
    <main>
      <ModelViewer />
    </main>
  );
}
