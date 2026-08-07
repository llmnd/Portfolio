'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface ThreeExperienceProps {
  techs: string[];
  onTechClick?: (tech: string) => void;
}

export default function ThreeExperience({ techs, onTechClick }: ThreeExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || 'ontouchstart' in window;
  }, []);

  const createLabelTexture = useCallback((text: string, color: string) => {
    const canvas = document.createElement('canvas');
    const size = isMobile ? 256 : 512;
    canvas.width = size;
    canvas.height = size / 4;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pillWidth = Math.max(ctx.measureText(text).width + 50, 160);
    const pillHeight = 48;
    const x = (canvas.width - pillWidth) / 2;
    const y = (canvas.height - pillHeight) / 2;

    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    const grad = ctx.createLinearGradient(x, y, x, y + pillHeight);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
    grad.addColorStop(1, 'rgba(30, 41, 59, 0.92)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, pillWidth, pillHeight, 24);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(x, y, pillWidth, pillHeight, 24);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${isMobile ? 24 : 34}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  }, [isMobile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050d);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(4, 3, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // --- Génération de l'environnement IBL (Reflexions physiques) ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomScene = new THREE.Scene();
    const lightBox = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.BackSide })
    );
    roomScene.add(lightBox);
    const envTexture = pmremGenerator.fromScene(roomScene).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // --- Post-Processing ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    if (!isMobile) {
      const ssaoPass = new SSAOPass(scene, camera, width, height);
      ssaoPass.kernelRadius = 0.4;
      ssaoPass.minDistance = 0.001;
      ssaoPass.maxDistance = 0.1;
      composer.addPass(ssaoPass);
    }

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.25, 0.4, 0.85);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = !isMobile;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minPolarAngle = Math.PI / 4.5;
    controls.target.set(0, 0.4, 0);

    // --- Lumières studio PBR ---
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
    keyLight.position.set(3, 5, 2);
    keyLight.castShadow = !isMobile;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.55);
    rimLight.position.set(0, 2, -4);
    scene.add(rimLight);

    // --- Plateau / Sol ---
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.1,
      metalness: 0.9,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Bureau ---
    const deskMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
    });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.1, 3.2), deskMat);
    desk.position.set(0, 0, 0);
    desk.castShadow = true;
    desk.receiveShadow = true;
    scene.add(desk);

    // Baffle / Pieds sous le bureau
    const legMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.8, roughness: 0.3 });
    const legLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 2.8), legMat);
    legLeft.position.set(-2.4, -0.6, 0);
    const legRight = legLeft.clone();
    legRight.position.x = 2.4;
    scene.add(legLeft, legRight);

    // --- Moniteur ---
    const screenGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.4, metalness: 0.8 });

    // Stand
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.04, 32), frameMat);
    standBase.position.y = 0.07;
    const standArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.08), frameMat);
    standArm.position.set(0, 0.35, -0.1);
    standArm.rotation.x = -0.15;
    screenGroup.add(standBase, standArm);

    // Écran
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.4, 0.04), frameMat);
    frame.position.set(0, 0.95, -0.05);
    frame.castShadow = true;
    screenGroup.add(frame);

    // Surface dynamique d'affichage
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d')!;
    const screenTexture = new THREE.CanvasTexture(canvas);

    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
    const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.44, 1.34), screenMat);
    screenMesh.position.set(0, 0.95, -0.029);
    screenGroup.add(screenMesh);

    screenGroup.position.set(-1.2, 0, -0.2);
    screenGroup.rotation.y = 0.25;
    scene.add(screenGroup);

    // Contenu écran dynamique
    const drawScreenContent = (time: number) => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, 40);
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(20, 20, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(40, 20, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(60, 20, 6, 0, Math.PI * 2); ctx.fill();

      const lines = [
        'import { Workspace } from "@studio/core";',
        '',
        'function RenderPipeline() {',
        '  const status = useSystemStatus();',
        '  return <Engine quality="ultra" fps={60} />;',
        '}',
        '',
        'export default RenderPipeline;'
      ];

      ctx.font = '32px "Fira Code", monospace';
      lines.forEach((line, index) => {
        ctx.fillStyle = index % 2 === 0 ? '#38bdf8' : '#a855f7';
        ctx.fillText(line, 40, 90 + index * 42);
      });

      if (Math.floor(time * 2) % 2 === 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(40 + ctx.measureText(lines[lines.length - 1]).width + 5, 385, 12, 28);
      }
      screenTexture.needsUpdate = true;
    };

    // --- Tech Objects ---
    const techGroup = new THREE.Group();
    const techMeshes: THREE.Mesh[] = [];
    const techSprites: THREE.Sprite[] = [];
    const basePositions: THREE.Vector3[] = [];

    const palette = [0x38bdf8, 0xa855f7, 0xf43f5e, 0x10b981, 0xf59e0b, 0x6366f1];

    techs.forEach((tech, i) => {
      const color = palette[i % palette.length];
      let geo: THREE.BufferGeometry;

      switch (i % 4) {
        case 0: geo = new THREE.IcosahedronGeometry(0.18, 0); break;
        case 1: geo = new THREE.TorusGeometry(0.14, 0.05, 16, 32); break;
        case 2: geo = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 16); break;
        default: geo = new THREE.OctahedronGeometry(0.18, 0); break;
      }

      const mat = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.6,
        thickness: 0.5,
        clearcoat: 1,
        emissive: color,
        emissiveIntensity: 0.1,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const row = Math.floor(i / 3);
      const col = i % 3;
      const pos = new THREE.Vector3(0.7 + col * 0.7, 0.2, -0.4 + row * 0.7);
      mesh.position.copy(pos);
      mesh.userData = { tech };

      techGroup.add(mesh);
      techMeshes.push(mesh);
      basePositions.push(pos.clone());

      const spriteMat = new THREE.SpriteMaterial({
        map: createLabelTexture(tech, '#' + color.toString(16).padStart(6, '0')),
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(pos.x, pos.y + 0.35, pos.z);
      sprite.scale.set(1.2, 0.3, 1);
      techGroup.add(sprite);
      techSprites.push(sprite);
    });

    scene.add(techGroup);

    // --- Interaction ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(techMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        setHoveredTech(hit.userData.tech);
        document.body.style.cursor = 'pointer';
      } else {
        setHoveredTech(null);
        document.body.style.cursor = 'default';
      }
    };

    const handlePointerDown = () => {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(techMeshes);
      if (intersects.length > 0 && onTechClick) {
        onTechClick(intersects[0].object.userData.tech);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // --- Resize ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();

      drawScreenContent(t);

      techMeshes.forEach((mesh, index) => {
        mesh.rotation.x = t * 0.3 + index;
        mesh.rotation.y = t * 0.4 + index;
        const floatY = Math.sin(t * 1.5 + index) * 0.025;
        mesh.position.y = basePositions[index].y + floatY;
        if (techSprites[index]) {
          techSprites[index].position.y = basePositions[index].y + 0.35 + floatY;
        }
      });

      controls.update();
      composer.render();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
      composer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [techs, onTechClick, createLabelTexture, isMobile]);

  return (
    <div ref={containerRef} className="h-full w-full relative overflow-hidden bg-slate-950">
      {hoveredTech && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-sky-400/30 backdrop-blur-md px-5 py-2 rounded-full text-sm font-sans font-medium text-sky-400 shadow-2xl pointer-events-none z-10">
          {hoveredTech}
        </div>
      )}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[0.65rem] font-mono tracking-wider text-slate-400">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        WORKSPACE ACTIVE
      </div>
    </div>
  );
}