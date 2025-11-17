import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

export interface HDRIPreset {
  name: string;
  path: string;
  intensity: number;
}

export interface UseHDRIOptions {
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  presets: HDRIPreset[];
  initialPreset?: string;
}

export interface UseHDRIReturn {
  currentPreset: string | null;
  switchPreset: (presetName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  preloadAll: () => Promise<void>;
}

const useHDRI = ({ scene, renderer, presets, initialPreset }: UseHDRIOptions): UseHDRIReturn => {
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());
  const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null);
  const loaderRef = useRef<HDRLoader | null>(null);
  const hasInitialized = useRef(false);

  // Track the current scene and renderer
  const sceneRef = useRef(scene);
  const rendererRef = useRef(renderer);

  useEffect(() => {
    sceneRef.current = scene;
    rendererRef.current = renderer;
  }, [scene, renderer]);

  /**
   * Initialize loader and PMREMGenerator
   */
  useEffect(() => {
    if (!rendererRef.current) return;

    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current.toneMappingExposure = 1.0;

    pmremGeneratorRef.current = new THREE.PMREMGenerator(rendererRef.current);
    pmremGeneratorRef.current.compileEquirectangularShader();

    loaderRef.current = new HDRLoader();

    return () => {
      pmremGeneratorRef.current?.dispose();
    };
  }, [renderer]);

  const loadPreset = useCallback(
    async (presetName: string): Promise<THREE.Texture> => {
      if (
        !sceneRef.current ||
        !rendererRef.current ||
        !pmremGeneratorRef.current ||
        !loaderRef.current
      ) {
        throw new Error('Scene, renderer, or loaders not initialized');
      }

      const cached = textureCache.current.get(presetName);
      if (cached) {
        return cached;
      }

      const preset = presets.find(p => p.name === presetName);
      if (!preset) {
        throw new Error(`Preset "${presetName}" not found`);
      }

      return new Promise((resolve, reject) => {
        loaderRef.current!.load(
          preset.path,
          texture => {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            const renderTarget = pmremGeneratorRef.current!.fromEquirectangular(texture);
            const envMap = renderTarget.texture;

            textureCache.current.set(presetName, envMap);
            texture.dispose();

            resolve(envMap);
          },
          undefined,
          err => {
            reject(new Error(`Failed to load HDRI: ${err}`));
          },
        );
      });
    },
    [presets],
  );

  const switchPreset = useCallback(
    async (presetName: string) => {
      if (!sceneRef.current) {
        console.warn('Scene not available yet');
        return;
      }

      // Handle "default" preset - remove HDRI
      if (presetName === 'default') {
        sceneRef.current.environment = null;
        sceneRef.current.background = new THREE.Color(0xf5f5f5); // Original gray background
        setCurrentPreset('default');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const envMap = await loadPreset(presetName);
        const preset = presets.find(p => p.name === presetName);

        if (!preset) {
          throw new Error(`Preset "${presetName}" not found`);
        }

        sceneRef.current.environment = envMap;
        sceneRef.current.background = envMap;

        if ('environmentIntensity' in sceneRef.current) {
          (sceneRef.current as any).environmentIntensity = preset.intensity;
        }

        setCurrentPreset(presetName);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading HDRI';
        setError(errorMessage);
        setIsLoading(false);
        console.error('HDRI loading error:', err);
      }
    },
    [presets, loadPreset],
  );

  const preloadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all(presets.map(preset => loadPreset(preset.name)));
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error preloading HDRIs';
      setError(errorMessage);
      setIsLoading(false);
      console.error('HDRI preload error:', err);
    }
  }, [presets, loadPreset]);

  /**
   * Load initial preset when scene and renderer become available
   */
  useEffect(() => {
    if (scene && renderer && initialPreset && !hasInitialized.current) {
      hasInitialized.current = true;
      switchPreset(initialPreset);
    }
  }, [scene, renderer, initialPreset, switchPreset]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (sceneRef.current) {
        sceneRef.current.environment = null;
        sceneRef.current.background = null;
      }

      textureCache.current.forEach(texture => {
        texture.dispose();
      });
      textureCache.current.clear();
    };
  }, []);

  return {
    currentPreset,
    switchPreset,
    isLoading,
    error,
    preloadAll,
  };
};

export default useHDRI;
