"use client";
import React from "react";
import { SceneData } from "@/lib/video/types";
import { TextScene } from "./scenes/TextScene";
import { ComparisonScene } from "./scenes/ComparisonScene";
import { CodeScene } from "./scenes/CodeScene";
import { TerminalScene } from "./scenes/TerminalScene";

interface Props {
  scene: SceneData;
}

export const SceneRenderer: React.FC<Props> = ({ scene }) => {
  if (!scene) return null;

  switch (scene.type) {
    case "TextScene":
      return <TextScene data={scene.data} />;
    case "ComparisonScene":
      return <ComparisonScene data={scene.data} />;
    case "CodeScene":
      return <CodeScene data={scene.data} />;
    case "TerminalScene":
      return <TerminalScene data={scene.data} />;
    default:
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
          <p className="text-xl">Unknown Scene Type: {scene.type}</p>
        </div>
      );
  }
};
