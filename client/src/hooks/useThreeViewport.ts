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
  const targetZRef = useRef<number>(1);
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

  function countUniqueVertices(geometry: THREE.BufferGeometry) {
    const pos = geometry.attributes.position;
    const unique = new Set<string>();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i).toFixed(5);
      const y = pos.getY(i).toFixed(5);
      const z = pos.getZ(i).toFixed(5);

      unique.add(`${x},${y},${z}`);
    }

    return unique.size;
  }

  function countTopologicalEdges(geometry: THREE.BufferGeometry) {
    const pos = geometry.attributes.position;
    const index = geometry.index;

    // Build unique vertex map (same as vertex function)
    const vertMap = new Map<string, number>();
    let vid = 0;

    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(5)},${pos.getY(i).toFixed(5)},${pos.getZ(i).toFixed(5)}`;
      if (!vertMap.has(key)) vertMap.set(key, vid++);
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

  function getVid(pos: THREE.BufferAttribute, vertMap: Map<string, number>, i: number) {
    const key = `${pos.getX(i).toFixed(5)},${pos.getY(i).toFixed(5)},${pos.getZ(i).toFixed(5)}`;
    return vertMap.get(key);
  }

  function addEdge(edgeSet: Set<string>, a: number, b: number) {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    edgeSet.add(key);
  }


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
    const sensitivity = 0.005;

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
      scene.rotation.y += deltaX * sensitivity;
      scene.rotation.x += deltaY * sensitivity;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    /**
     * Handles mouse up events to stop rotating the scene.
     */
    const handleMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);

    // --- Lighting setup ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbebebe, 1.0);
    scene.add(hemiLight);
    scene.background = new THREE.Color(0xf5f5f5);

    // --- Camera setup ---
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    cameraRef.current = camera;

    /**
     * Handles zooming via mouse wheel events.
     * Moves the camera along its forward vector.
     * @param {WheelEvent} event - Browser wheel event.
     */
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const camera = cameraRef.current;
      if (!camera) return;

      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const zoomAmount = event.deltaY * 0.001;
      camera.position.addScaledVector(direction, zoomAmount);
      targetZRef.current = camera.position.z;
    };
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false });

    // --- Renderer setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Directional + ambient light ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));

    // --- Ground plane ---
    const groundGeo = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

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
     * Handles window resize events to keep the camera and renderer aligned with viewport size.
     */
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Render loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      renderer.dispose();
      scene.clear();
      dracoLoader.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
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
      const scale = 2.0;
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
    modelEdges
  };
};

export default useThreeViewport;
