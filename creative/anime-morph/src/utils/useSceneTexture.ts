/**
 * useSceneTexture — loads a static asset as a THREE.Texture.
 * Uses Remotion's delayRender / continueRender so the renderer
 * waits for the texture before capturing any frame.
 *
 * Falls back to null (BaseScene shows gradient) if load fails.
 */
import { useEffect, useRef, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';

export function useSceneTexture(assetPath: string): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const handleRef = useRef<number | null>(null);

  useEffect(() => {
    // Tell Remotion: "don't capture frames yet"
    handleRef.current = delayRender(`Loading texture: ${assetPath}`);

    const loader = new THREE.TextureLoader();
    const url    = staticFile(assetPath);

    loader.load(
      url,
      (tex) => {
        tex.minFilter    = THREE.LinearFilter;
        tex.magFilter    = THREE.LinearFilter;
        tex.colorSpace   = THREE.SRGBColorSpace;
        tex.needsUpdate  = true;
        setTexture(tex);
        if (handleRef.current !== null) {
          continueRender(handleRef.current);
          handleRef.current = null;
        }
      },
      undefined,
      (_err) => {
        // Asset missing during development — use gradient fallback
        console.warn(`[anime-morph] Could not load ${url} — using gradient fallback`);
        if (handleRef.current !== null) {
          continueRender(handleRef.current);
          handleRef.current = null;
        }
      },
    );

    return () => {
      if (handleRef.current !== null) {
        continueRender(handleRef.current);
        handleRef.current = null;
      }
    };
  }, [assetPath]);

  return texture;
}
