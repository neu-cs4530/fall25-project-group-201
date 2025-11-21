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

  // keep refs up-to-date when parents pass new values
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
   * Initialization effect — runs once on mount.
   * Does NOT reference reactive props directly (uses refs when runtime access needed).
   */
  useEffect(() => {
    if (!containerRef.current) return;

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

      // write back to parent if setter exists (via ref)
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

    // wheel/zoom handler uses cameraRef + setterRef
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    // wheel listener attached to container element (passive: false so preventDefault works)
    const handleWheelContainer = containerRef.current; // capture the ref value
    if (!handleWheelContainer) return;
    handleWheelContainer.addEventListener('wheel', handleWheel, { passive: false });

    // --- Resize handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation loop ---
    let stopped = false;
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
      if (keysPressed.current.a || keysPressed.current.ArrowLeft) {
        cam.position.addScaledVector(right, -moveSpeed);
        if (setTranslationSettingRef.current) {
          setTranslationSettingRef.current([cam.position.x, cam.position.y, cam.position.z]);
        }
      }
      if (keysPressed.current.d || keysPressed.current.ArrowRight) {
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
          sceneCur.rotation.y += rotateSpeed;
          if (setRotationSettingRef.current) {
            setRotationSettingRef.current([
              sceneCur.rotation.x,
              sceneCur.rotation.y,
              sceneCur.rotation.z,
            ]);
          }
        }
        if (keysPressed.current.d) {
          sceneCur.rotation.y -= rotateSpeed;
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

    // cleanup
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
  }, []);

  /**
   * Model load effect: only triggers when modelPath changes.
   * Uses existing scene & camera (created by the initialization effect).
   */
  useEffect(() => {
    if (!modelPath) return;
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

  // Lightweight effect: if parent changes rotationSetting prop, apply it to the scene immediately.
  useEffect(() => {
    if (!rotationSetting) return;
    const scene = sceneRef.current;
    if (!scene) return;

    scene.rotation.set(rotationSetting[0], rotationSetting[1], rotationSetting[2]);
  }, [rotationSetting]);

  // Lightweight effect: if parent changes translationSetting prop, apply it to the camera immediately.
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
  };
};

export default useThreeViewport;
