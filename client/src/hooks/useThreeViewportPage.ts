import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Object3D, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const useThreeViewportPage = (modelPath: string | null) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!containerRef.current || !modelPath) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    // --- Mouse controls for rotating the scene around the model ---
    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - previousMouseX;
      const deltaY = event.clientY - previousMouseY;

      const sensitivity = 0.005; // adjust this for faster/slower rotation

      scene.rotation.y += deltaX * sensitivity; // left/right
      scene.rotation.x += deltaY * sensitivity; // up/down

      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);

    // Add subtle gradient-like background using a large hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbebebe, 1.0);
    scene.add(hemiLight);
    scene.background = new THREE.Color(0xf5f5f5);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );

    cameraRef.current = camera;

    // --- Camera controls (zoom in/zoom out) ---
    const moveSpeed = 0.05;
    const handleWheel = (event: WheelEvent) => {
      camera.position.z += event.deltaY * moveSpeed;
    };
    window.addEventListener('wheel', handleWheel);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    scene.add(dirLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // --- Ground Plane ---
    const groundGeo = new THREE.PlaneGeometry(20, 20, 1, 1);
    const groundMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 10,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.position.y = -0.5; // will adjust once model loads
    scene.add(ground);

    // --- Loader setup ---
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      modelPath,
      gltf => {
        const model = gltf.scene;
        model.traverse((child: Object3D) => {
          if (child instanceof Mesh) {
            child.castShadow = true;
            child.receiveShadow = false;
          }
        });
        scene.add(model);

        // --- Center and scale model ---
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center model at origin
        model.position.sub(center);

        // Scale model to fit in view
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim;
        model.scale.setScalar(scale);

        // Adjust so the model rests on the ground plane
        box.setFromObject(model);
        //const newSize = box.getSize(new THREE.Vector3());
        const newMin = box.min;
        model.position.y -= newMin.y; // lift model so its lowest point touches y=0

        ground.position.y = 0;

        // --- Frame model with camera ---
        const boundingSphere = box.getBoundingSphere(new THREE.Sphere());
        const radius = boundingSphere.radius;
        const fov = camera.fov * (Math.PI / 180);
        const cameraZ = radius / Math.sin(fov / 2);

        camera.position.set(0, radius * 0.8, cameraZ * 1.2);
        camera.lookAt(0, radius * 0.3, 0);
      },
      undefined,
      /*
      error => {
        console.error(`Error loading model (${modelPath}):`, error);
      },*/
    );

    // --- Handle window resize ---
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
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
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  const handleResetCamera = () => {
    const scene = sceneRef.current;

    if (scene) {
      scene.rotation.set(0, 0, 0);
    }
  };

  return { containerRef, handleResetCamera };
};

export default useThreeViewportPage;