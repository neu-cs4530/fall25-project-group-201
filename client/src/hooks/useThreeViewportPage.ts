import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Object3D, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const createOrthographicMatrix = (left: number, right: number, top: number, bottom: number, near: number, far: number) => {
  const lr = 1 / (right - left);
  const bt = 1 / (top - bottom);
  const nf = 1 / (far - near);
  const m = new THREE.Matrix4();
  m.set(
    2 * lr, 0, 0, 0,
    0, 2 * bt, 0, 0,
    0, 0, -2 * nf, 0,
    -(right + left) * lr, -(top + bottom) * bt, -(far + near) * nf, 1
  );
  return m;
};

const useThreeViewportPage = (modelPath: string | null) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const [isPerspective, setIsPerspective] = useState(true);

  // Initial camera state
  const initialCameraState = useRef<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
    fov: number;
    aspect: number;
    near: number;
    far: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current || !modelPath) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // --- Mouse rotation ---
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    const sensitivity = 0.005;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const handleMouseUp = () => { isDragging = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;
      scene.rotation.y += deltaX * sensitivity;
      scene.rotation.x += deltaY * sensitivity;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbebebe, 1.0));
    scene.background = new THREE.Color(0xf5f5f5);

    // --- Camera ---
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    cameraRef.current = camera;

    // --- Zoom ---
    const moveSpeed = 0.05;
    const handleWheel = (event: WheelEvent) => {
      camera.position.z += event.deltaY * moveSpeed;
    };
    containerRef.current.addEventListener('wheel', handleWheel);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Lights and ground ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Load model ---
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(modelPath, gltf => {
      const model = gltf.scene;
      model.traverse((child: Object3D) => {
        if (child instanceof Mesh) child.castShadow = true;
      });
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);

      const scale = 1.5 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);
      box.setFromObject(model);

      const min = box.min;
      model.position.y -= min.y;
      ground.position.y = 0;

      const boundingSphere = box.getBoundingSphere(new THREE.Sphere());
      const radius = boundingSphere.radius;
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = radius / Math.sin(fov / 2);

      camera.position.set(0, radius * 0.8, cameraZ * 1.2);
      camera.lookAt(0, radius * 0.3, 0);

      // ✅ Save initial camera state
      initialCameraState.current = {
        position: camera.position.clone(),
        rotation: camera.rotation.clone(),
        fov: camera.fov,
        aspect: camera.aspect,
        near: camera.near,
        far: camera.far,
      };
    });

    // --- Resize ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
      dracoLoader.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [modelPath]);

  // --- Reset camera rotation ---
  const handleResetCamera = () => {
    const scene = sceneRef.current;
    if (scene) scene.rotation.set(0, 0, 0);
  };

  // --- Toggle Perspective ---
  const handleTogglePerspective = () => {
    const camera = cameraRef.current;
    const container = containerRef.current;
    const init = initialCameraState.current;
    if (!camera || !container || !init) return;

    const aspect = container.clientWidth / container.clientHeight;

    if (isPerspective) {
      // Switch to orthographic (math-based)
      const scale = 2.0;
      const orthoMatrix = createOrthographicMatrix(
        -scale * aspect, scale * aspect, scale, -scale, 0.1, 1000
      );
      camera.projectionMatrix.copy(orthoMatrix);
      camera.projectionMatrixInverse.copy(orthoMatrix.clone().invert());
      camera.position.copy(init.position);
      camera.rotation.copy(init.rotation);

      setIsPerspective(false);
    } else {
      // Restore PerspectiveCamera properly
      camera.fov = init.fov;
      camera.aspect = init.aspect;
      camera.near = init.near;
      camera.far = init.far;
      camera.updateProjectionMatrix();
      camera.position.copy(init.position);
      camera.rotation.copy(init.rotation);

      setIsPerspective(true);
    }
  };

  return {
    containerRef,
    handleResetCamera,
    handleTogglePerspective,
    isPerspective,
  };
};

export default useThreeViewportPage;
