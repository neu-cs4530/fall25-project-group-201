import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Object3D, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Creates an orthographic projection matrix manually.
 */
const createOrthographicMatrix = (
  left: number,
  right: number,
  top: number,
  bottom: number,
  near: number,
  far: number,
) => {
  const lr = 1 / (right - left);
  const bt = 1 / (top - bottom);
  const nf = 1 / (far - near);
  const m = new THREE.Matrix4();
  m.set(
    2 * lr,
    0,
    0,
    0,
    0,
    2 * bt,
    0,
    0,
    0,
    0,
    -2 * nf,
    0,
    -(right + left) * lr,
    -(top + bottom) * bt,
    -(far + near) * nf,
    1,
  );
  return m;
};

/**
 * Returns number of edges of a 3D model
 * @param geometry of the .glb file
 * @returns number of edges of the 3D model
 */
function countTopologicalEdges(geometry: THREE.BufferGeometry) {
  const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
  const index = geometry.index;

  // Build unique vertex map (same as vertex function)
  const vertMap = new Map<string, number>();
  let vid = 0;

  for (let i = 0; i < pos.count; i += 1) {
    const key = `${pos.getX(i).toFixed(5)},${pos.getY(i).toFixed(5)},${pos.getZ(i).toFixed(5)}`;
    if (!vertMap.has(key)) vertMap.set(key, (vid += 1));
  }

  // Make index array (handle non-indexed geometry)
  const idx = index ? index.array : [...Array(pos.count).keys()];

  // Build a set of unique edges
  const edges = new Set<string>();

  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i];
    const b = idx[i + 1];
    const c = idx[i + 2];

    // convert to topological vertex IDs
    const va = getVid(pos, vertMap, a);
    const vb = getVid(pos, vertMap, b);
    const vc = getVid(pos, vertMap, c);

    addEdge(edges, va, vb);
    addEdge(edges, vb, vc);
    addEdge(edges, vc, va);
  }

  return edges.size;
}

/**
 * Retrieves the vertex ID for a given vertex index in a geometry. Each vertex position is
 * converted to a string key and looked up in the provided vertMap to obtain a unique integer ID
 * @param pos - the BufferAttribute containing vertex positions
 * @param vertMap that stores vertex positions to unique vertex IDs
 * @param i - index of the vertex in the BufferAttribute
 * @returns vertex ID corresponding to the given vertex index
 */
function getVid(pos: THREE.BufferAttribute, vertMap: Map<string, number>, i: number): number {
  const key = `${pos.getX(i).toFixed(5)},${pos.getY(i).toFixed(5)},${pos.getZ(i).toFixed(5)}`;
  return vertMap.get(key)!;
}

/**
 * Adds an edge to a set of unique edges in a topological mesh
 *
 * @param edgeSet - set storing unique edges as strings
 * @param a - first vertex ID of the edge
 * @param b - second vertex ID of the edge
 */
function addEdge(edgeSet: Set<string>, a: number, b: number) {
  const key = a < b ? `${a}-${b}` : `${b}-${a}`;
  edgeSet.add(key);
}

/**
 * React hook that sets up a Three.js viewport with optional model loading, camera controls (rotating,
 * zooming, panning, tilting), orthogonal/perspective toggle, camera resetting, and camera reference
 * management.
 *
 * @param modelPath - Path to the 3D model (GLB) to load.
 * @param rotationSetting - rotation setting (if any) for the 3D model
 * @param setRotationSetting - sets rotationSetting
 * @param translationSetting - translation setting (if any) for the camera
 * @param setTranslationSetting - sets translationSetting
 * @returns Object containing scene control refs and functions.
 */
const useThreeViewport = (
  modelPath: string | null,
  rotationSetting?: number[] | null,
  setRotationSetting?: React.Dispatch<React.SetStateAction<number[] | null>>,
  translationSetting?: number[] | null,
  setTranslationSetting?: React.Dispatch<React.SetStateAction<number[] | null>>,
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetZRef = useRef<number>(1);
  const keysPressed = useRef<Record<string, boolean>>({});
  const [modelVerts, setModelVerts] = useState(0);
  const [modelFaces, setModelFaces] = useState(0);
  const [modelEdges, setModelEdges] = useState(0);

  const [isPerspective, setIsPerspective] = useState(true);

  const initialCameraState = useRef<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    fov: number;
    aspect: number;
    near: number;
    far: number;
  } | null>(null);

  const orthoCameraState = useRef<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
  } | null>(null);

  // Refs to mirror incoming props so the animation loop and handlers can use them
  const rotationSettingRef = useRef<number[] | null | undefined>(rotationSetting);
  const translationSettingRef = useRef<number[] | null | undefined>(translationSetting);
  const setRotationSettingRef = useRef<typeof setRotationSetting | undefined>(setRotationSetting);
  const setTranslationSettingRef = useRef<typeof setTranslationSetting | undefined>(
    setTranslationSetting,
  );

  useEffect(() => {
    rotationSettingRef.current = rotationSetting;
  }, [rotationSetting]);

  useEffect(() => {
    translationSettingRef.current = translationSetting;
  }, [translationSetting]);

  useEffect(() => {
    setRotationSettingRef.current = setRotationSetting;
  }, [setRotationSetting]);

  useEffect(() => {
    setTranslationSettingRef.current = setTranslationSetting;
  }, [setTranslationSetting]);

  /**
   * Returns number of unique vertices of a 3D model (does not double count for vertices that
   * make up more than one edge)
   * @param geometry of the .glb file
   * @returns the number of unique vertices
   */
  function countUniqueVertices(geometry: THREE.BufferGeometry) {
    const pos = geometry.attributes.position;
    const unique = new Set<string>();

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i).toFixed(5);
      const y = pos.getY(i).toFixed(5);
      const z = pos.getZ(i).toFixed(5);

      unique.add(`${x},${y},${z}`);
    }

    return unique.size;
  }

  /**
   * Initialization
   */
  useEffect(() => {
    if (!containerRef.current || !modelPath) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    const sensitivity = 0.005;
    const panSensitivity = 0.02;

    // --- Camera setup ---
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    cameraRef.current = camera;

    // --- Renderer setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // lighting / ground
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbebebe, 1.0);
    scene.add(hemiLight);
    scene.background = new THREE.Color(0xf5f5f5);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));

    const groundGeo = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Input handlers (use refs inside handlers) ---

    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) return;
      isDragging = true;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousMouseX;
      const deltaY = event.clientY - previousMouseY;
      scene.rotation.y += deltaX * sensitivity;
      scene.rotation.x += deltaY * sensitivity;

      if (setRotationSettingRef.current) {
        setRotationSettingRef.current([scene.rotation.x, scene.rotation.y, scene.rotation.z]);
      }

      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const camera = cameraRef.current;
      if (!camera) return;

      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const zoomAmount = event.deltaY * 0.001;
      camera.position.addScaledVector(direction, zoomAmount);
      targetZRef.current = camera.position.z;

      if (setTranslationSettingRef.current) {
        setTranslationSettingRef.current([camera.position.x, camera.position.y, camera.position.z]);
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    containerRef.current.addEventListener('keyup', handleKeyUp);
    containerRef.current.addEventListener('mousedown', handleMouseDown);
    containerRef.current.addEventListener('mouseup', handleMouseUp);
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    // wheel listener attached to container element (passive: false so preventDefault works)
    const handleWheelContainer = containerRef.current; // capture the ref value
    if (!handleWheelContainer) return;
    handleWheelContainer.addEventListener('wheel', handleWheel, { passive: false });

    // --- Load model using GLTF + DRACO ---
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(modelPath, gltf => {
      const model = gltf.scene;

      let totalFaces = 0;
      let totalUniqueVerts = 0;
      let totalEdges = 0;

      model.traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          child.castShadow = true;

          const geo = child.geometry;
          totalUniqueVerts += countUniqueVertices(geo);
          totalEdges += countTopologicalEdges(child.geometry);

          const index = geo.index;

          let triCount = 0;

          if (index) {
            // Indexed geometry
            triCount = index.count / 3;
          } else {
            // Non-indexed geometry
            triCount = geo.attributes.position.count / 3;
          }

          totalFaces += triCount;
        }
      });

      setModelVerts(totalUniqueVerts);
      setModelEdges(totalEdges);
      setModelFaces(totalFaces);
      scene.add(model);

      // Center, scale, and ground-align the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.5 / maxDim;
      model.scale.setScalar(scale);
      box.setFromObject(model);
      model.position.y -= box.min.y;

      // Frame model in view
      const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = radius / Math.sin(fov / 2);
      camera.position.set(0, radius * 0.8, cameraZ * 1.2);
      camera.lookAt(0, radius * 0.3, 0);

      // Save initial camera state
      initialCameraState.current = {
        position: camera.position.clone(),
        rotation: camera.rotation.clone(),
        fov: camera.fov,
        aspect: camera.aspect,
        near: camera.near,
        far: camera.far,
      };
    });

    /**
     * Handles container resizing
     */
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let stopped = false;

    /**
     * Animation loop
     */
    const animate = () => {
      if (stopped) return;
      requestAnimationFrame(animate);

      // camera & movement
      const cam = cameraRef.current!;
      const sceneCur = sceneRef.current!;
      const forward = new THREE.Vector3();
      cam.getWorldDirection(forward);
      const right = new THREE.Vector3();
      right.crossVectors(forward, cam.up).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const moveSpeed = panSensitivity;

      if (keysPressed.current.w || keysPressed.current.ArrowUp) {
        cam.position.addScaledVector(up, moveSpeed);
        if (setTranslationSettingRef.current) {
          setTranslationSettingRef.current([cam.position.x, cam.position.y, cam.position.z]);
        }
      }
      if (keysPressed.current.s || keysPressed.current.ArrowDown) {
        cam.position.addScaledVector(up, -moveSpeed);
        if (setTranslationSettingRef.current) {
          setTranslationSettingRef.current([cam.position.x, cam.position.y, cam.position.z]);
        }
      }
      if (keysPressed.current.a) {
        cam.position.addScaledVector(right, moveSpeed);
        if (setTranslationSettingRef.current) {
          setTranslationSettingRef.current([cam.position.x, cam.position.y, cam.position.z]);
        }
      }
      if (keysPressed.current.d) {
        cam.position.addScaledVector(right, -moveSpeed);
        if (setTranslationSettingRef.current) {
          setTranslationSettingRef.current([cam.position.x, cam.position.y, cam.position.z]);
        }
      }
      if (keysPressed.current.ArrowLeft) {
        cam.position.addScaledVector(right, -moveSpeed);
        if (setTranslationSettingRef.current) {
          setTranslationSettingRef.current([cam.position.x, cam.position.y, cam.position.z]);
        }
      }
      if (keysPressed.current.ArrowRight) { 
        cam.position.addScaledVector(right, moveSpeed);
        if (setTranslationSettingRef.current) {
          setTranslationSettingRef.current([cam.position.x, cam.position.y, cam.position.z]);
        }
      }

      // model rotation with WASD (affects scene rotation)
      const model = sceneCur.children.find(obj => obj.userData?.isModel) as
        | THREE.Object3D
        | undefined;
      if (model) {
        const rotateSpeed = 0.02;
        if (keysPressed.current.w) {
          sceneCur.rotation.x -= rotateSpeed;
          if (setRotationSettingRef.current) {
            setRotationSettingRef.current([
              sceneCur.rotation.x,
              sceneCur.rotation.y,
              sceneCur.rotation.z,
            ]);
          }
        }
        if (keysPressed.current.s) {
          sceneCur.rotation.x += rotateSpeed;
          if (setRotationSettingRef.current) {
            setRotationSettingRef.current([
              sceneCur.rotation.x,
              sceneCur.rotation.y,
              sceneCur.rotation.z,
            ]);
          }
        }
        if (keysPressed.current.a) {
          sceneCur.rotation.y -= rotateSpeed;
          if (setRotationSettingRef.current) {
            setRotationSettingRef.current([
              sceneCur.rotation.x,
              sceneCur.rotation.y,
              sceneCur.rotation.z,
            ]);
          }
        }
        if (keysPressed.current.d) {
          sceneCur.rotation.y += rotateSpeed;
          if (setRotationSettingRef.current) {
            setRotationSettingRef.current([
              sceneCur.rotation.x,
              sceneCur.rotation.y,
              sceneCur.rotation.z,
            ]);
          }
        }
      }

      renderer.render(sceneCur, cam);
    };

    animate();

    /**
     * Cleanup
     */
    return () => {
      stopped = true;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      if (handleWheelContainer) {
        handleWheelContainer.removeEventListener('wheel', handleWheel);
      }
      // dispose renderer and clear scene
      try {
        renderer.dispose();
      } catch (e) {
        // ignore dispose errors
      }
      if (scene) {
        // traverse and dispose geometries/materials if you need to free GPU memory
        scene.clear();
      }
      // remove canvas
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
    // run only on mount/unmount
  }, [modelPath]);

  /**
   * Model load effect: only triggers when modelPath changes.
   * Uses existing scene & camera (created by the initialization effect).
   */
  useEffect(() => {
    if (!modelPath) return;

    containerRef.current?.focus();

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!scene || !camera || !renderer || !containerRef.current) return;

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    let loadedModel: THREE.Object3D | null = null;
    let active = true;

    loader.load(
      modelPath,
      gltf => {
        if (!active) return;
        const model = gltf.scene;
        model.userData.isModel = true;
        model.traverse((child: Object3D) => {
          if ((child as Mesh) instanceof Mesh) (child as Mesh).castShadow = true;
        });

        // Remove any previous model
        const prev = scene.children.find(obj => obj.userData?.isModel) as
          | THREE.Object3D
          | undefined;
        if (prev) {
          scene.remove(prev);
        }

        scene.add(model);
        loadedModel = model;

        // Center, scale, and ground-align the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1.5 / maxDim;
        model.scale.setScalar(scale);
        box.setFromObject(model);
        model.position.y -= box.min.y;

        // Apply last-known rotationSetting (from ref)
        const rs = rotationSettingRef.current;
        if (rs) {
          model.rotation.set(rs[0], rs[1], rs[2]);
        }

        // Apply last-known translationSetting (from ref) to camera if present
        const ts = translationSettingRef.current;
        if (ts && camera) {
          camera.position.set(ts[0], ts[1], ts[2]);
        }

        // Frame model in view (safe fallback if camera not yet positioned)
        const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
        const fov = camera.fov * (Math.PI / 180);
        if (fov > 0) {
          const cameraZ = radius / Math.sin(fov / 2);
          camera.position.set(0, radius * 0.8, cameraZ * 1.2);
          camera.lookAt(0, radius * 0.3, 0);
        }

        // inform parent of new translation if setter present
        if (setTranslationSettingRef.current) {
          setTranslationSettingRef.current([
            camera.position.x,
            camera.position.y,
            camera.position.z,
          ]);
        }

        // Save initial camera state
        initialCameraState.current = {
          position: camera.position.clone(),
          rotation: camera.rotation.clone(),
          fov: camera.fov,
          aspect: camera.aspect,
          near: camera.near,
          far: camera.far,
        };
      },
      undefined,
    );

    return () => {
      active = false;
      // remove loaded model if any
      if (loadedModel && scene) {
        scene.remove(loadedModel);
      }
      dracoLoader.dispose();
    };
  }, [modelPath]);

  /**
   * Updates scene rotation if rotationSetting updates
   */
  useEffect(() => {
    if (!rotationSetting) return;
    const scene = sceneRef.current;
    if (!scene) return;

    scene.rotation.set(rotationSetting[0], rotationSetting[1], rotationSetting[2]);
  }, [rotationSetting]);

  /**
   * Updates camera position if translationSetting updates
   */
  useEffect(() => {
    if (!translationSetting) return;
    const camera = cameraRef.current;
    if (!camera) return;

    camera.position.set(translationSetting[0], translationSetting[1], translationSetting[2]);
  }, [translationSetting]);

  /**
   * Resets the camera to its initial position and rotation based on current view mode.
   */
  const handleResetCamera = () => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const init = initialCameraState.current;
    const orthoInit = orthoCameraState.current;
    if (!scene || !camera || !init) return;

    scene.rotation.set(0, 0, 0);
    if (isPerspective) {
      camera.position.copy(init.position);
      camera.rotation.copy(init.rotation);
      targetZRef.current = init.position.z;
    } else if (orthoInit) {
      camera.position.copy(orthoInit.position);
      camera.rotation.copy(orthoInit.rotation);
      targetZRef.current = orthoInit.position.z;
    }

    if (setRotationSettingRef.current) {
      setRotationSettingRef.current([0,0,0]);
    }

    if (setTranslationSettingRef.current) {
      setTranslationSettingRef.current([0, 0.77, 3.02]);
    }
  };

  /**
   * Toggles between perspective and orthographic camera projections.
   */
  const handleTogglePerspective = () => {
    const camera = cameraRef.current;
    const container = containerRef.current;
    const init = initialCameraState.current;
    if (!camera || !container || !init) return;

    const aspect = container.clientWidth / container.clientHeight;

    if (isPerspective) {
      const scale = 1.0;
      const orthoMatrix = createOrthographicMatrix(
        -scale * aspect,
        scale * aspect,
        scale,
        -scale,
        0.1,
        1000,
      );
      camera.projectionMatrix.copy(orthoMatrix);
      camera.projectionMatrixInverse.copy(orthoMatrix.clone().invert());
      const target = new THREE.Vector3(0, 0, 0);
      const orthoPosition = init.position.clone().multiplyScalar(0.1);
      camera.position.copy(orthoPosition);
      camera.lookAt(target);
      orthoCameraState.current = {
        position: orthoPosition.clone(),
        rotation: camera.rotation.clone(),
      };
      setIsPerspective(false);
    } else {
      camera.fov = init.fov;
      camera.aspect = init.aspect;
      camera.near = init.near;
      camera.far = init.far;
      camera.updateProjectionMatrix();
      camera.position.copy(init.position);
      camera.rotation.copy(init.rotation);
      targetZRef.current = init.position.z;
      setIsPerspective(true);
    }
  };

  return {
    containerRef,
    sceneRef,
    rendererRef,
    handleResetCamera,
    handleTogglePerspective,
    isPerspective,
    modelVerts,
    modelFaces,
    modelEdges,
  };
};

export default useThreeViewport;
