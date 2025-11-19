import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Object3D, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Creates an orthographic projection matrix manually.
 *
 * @param {number} left - Left plane of the frustum.
 * @param {number} right - Right plane of the frustum.
 * @param {number} top - Top plane of the frustum.
 * @param {number} bottom - Bottom plane of the frustum.
 * @param {number} near - Near clipping plane.
 * @param {number} far - Far clipping plane.
 * @returns {THREE.Matrix4} The resulting orthographic projection matrix.
 */
const createOrthographicMatrix = (left: number, right: number, top: number, bottom: number, near: number, far: number) => {
  const lr = 1 / (right - left);
  const bt = 1 / (top - bottom);
  const nf = 1 / (far - near);
  const m = new THREE.Matrix4();
  m.set(
    2 * lr, 0, 0, 0,
    0, 2 * bt, 0, 0,
    0, 0, -2 * nf, 0,
    -(right + left) * lr,
    -(top + bottom) * bt,
    -(far + near) * nf,
    1,
  );
  return m;
};

/**
 * React hook that sets up a Three.js viewport with optional model loading,
 * camera controls, and orthographic/perspective toggle.
 *
 * @param {string | null} modelPath - Path to the 3D model (GLB) to load. If null, the scene initializes empty.
 * @returns Object containing scene control refs and functions.
 */
const useThreeViewport = (modelPath: string | null) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

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

  const keysPressed = useRef<Record<string, boolean>>({});

  /**
   * Main scene setup and teardown lifecycle.
   * Initializes the renderer, scene, lighting, controls, and loads the model.
   */
  useEffect(() => {
    if (!containerRef.current || !modelPath) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    const rotationSensitivity = 0.005;
    const panSensitivity = 0.02; // sensitivity for panning (moving the camera up/down/left/right)

    /**
     * Handles mouse down events to begin rotating the scene.
     * @param {MouseEvent} event - Browser mouse down event.
     */
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) return;
      isDragging = true;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    /**
     * Handles mouse move events to rotate the scene.
     * @param {MouseEvent} event - Browser mouse move event.
     */
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousMouseX;
      const deltaY = event.clientY - previousMouseY;
      scene.rotation.y += deltaX * rotationSensitivity;
      scene.rotation.x += deltaY * rotationSensitivity;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    /**
     * Handles mouse up events.
     */
    const handleMouseUp = () => { isDragging = false; };
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    
    // --- Lighting setup ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbebebe, 1.0);
    scene.add(hemiLight);
    scene.background = new THREE.Color(0xf5f5f5);

    // --- Directional + ambient light ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));

    // --- Ground ---
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Camera setup ---
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    cameraRef.current = camera;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Load Model ---
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(modelPath, gltf => {
      const model = gltf.scene;
      model.traverse((child: Object3D) => { if (child instanceof Mesh) child.castShadow = true; });
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
     * Handles window resize events to keep the camera and renderer aligned with viewport size.
     */
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Keyboard ---
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // --- Wheel zoom ---
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const camera = cameraRef.current;
      if (!camera) return;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      camera.position.addScaledVector(dir, e.deltaY * 0.001);
    };
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false });

    // --- Render loop ---
    const animate = () => {
      requestAnimationFrame(animate);

      if (camera && scene) {
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();
        const up = new THREE.Vector3(0,1,0);
        const moveSpeed = panSensitivity;

        if (keysPressed.current.w || keysPressed.current.ArrowUp) camera.position.addScaledVector(up, moveSpeed);
        if (keysPressed.current.s || keysPressed.current.ArrowDown) camera.position.addScaledVector(up, -moveSpeed);
        if (keysPressed.current.a || keysPressed.current.ArrowLeft) camera.position.addScaledVector(right, -moveSpeed);
        if (keysPressed.current.d || keysPressed.current.ArrowRight) camera.position.addScaledVector(right, moveSpeed);
      }

      if (camera && scene) renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      scene.clear();
      dracoLoader.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [modelPath]);

  /**
   * Resets the camera to its initial position and rotation based on current view mode.
   */
  const handleResetCamera = () => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const init = initialCameraState.current;
    const orthoInit = orthoCameraState.current;
    if (!scene || !camera || !init) return;
    scene.rotation.set(0,0,0);

    if (isPerspective) {
      camera.position.copy(init.position);
      camera.rotation.copy(init.rotation);
    } else if (orthoInit) {
      camera.position.copy(orthoInit.position);
      camera.rotation.copy(orthoInit.rotation);
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
      const orthoMatrix = createOrthographicMatrix(-scale*aspect, scale*aspect, scale, -scale, 0.1, 1000);
      camera.projectionMatrix.copy(orthoMatrix);
      camera.projectionMatrixInverse.copy(orthoMatrix.clone().invert());
      orthoCameraState.current = { position: camera.position.clone(), rotation: camera.rotation.clone() };
      setIsPerspective(false);
    } else {
      camera.fov = init.fov;
      camera.aspect = init.aspect;
      camera.near = init.near;
      camera.far = init.far;
      camera.updateProjectionMatrix();
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
