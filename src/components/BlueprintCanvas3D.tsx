import React, { useRef, useState, useEffect } from 'react';
import { 
  RotateCcw, RotateCw, Sun, Moon, Eye, Layers, 
  Sparkles, Cpu, Laptop, Compass, Utensils, Tv, 
  Download, Image as ImageIcon, CheckCircle2, Sliders 
} from 'lucide-react';
import { FloorPlanData, Room, Furniture, FloorMaterial, RenderingStyle } from '../types';

// Let's reference the photorealistic renders we generated
const PREGENERATED_RENDERS = {
  kitchen: '/src/assets/images/modern_kitchen_render_1781025047606.png',
  lounge: '/src/assets/images/luxury_lounge_render_1781025062387.png'
};

interface BlueprintCanvas3DProps {
  floorPlan: FloorPlanData;
}

export function BlueprintCanvas3D({ floorPlan }: BlueprintCanvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 3D Camera & State Controls
  const [rotation, setRotation] = useState<number>(45); // in degrees
  const [tilt, setTilt] = useState<number>(45); // in degrees
  const [wallHeight, setWallHeight] = useState<number>(1.6); // wall height in meters (adjustable 0.2 to 2.6)
  const [renderingStyle, setRenderingStyle] = useState<RenderingStyle>('standard');
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState({ width: 620, height: 500 });

  // Photo Lab Realism Simulator State
  const [activePhotoPreview, setActivePhotoPreview] = useState<'kitchen' | 'lounge'>('kitchen');
  const [sunlightIntensity, setSunlightIntensity] = useState<number>(85); // 0 to 100
  const [raytraceSamples, setRaytraceSamples] = useState<number>(128); // 32, 64, 128, 256
  const [isGeneratingRender, setIsGeneratingRender] = useState<boolean>(false);
  const [isRenderFinished, setIsRenderFinished] = useState<boolean>(false);

  // Monitor div dimensions and keep canvas responsive
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: Math.max(380, entry.contentRect.width),
          height: Math.max(380, entry.contentRect.height),
        });
      }
    });

    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, []);

  // Trigger simulated render compilation
  const handleCompileRender = () => {
    setIsGeneratingRender(true);
    setIsRenderFinished(false);
    setTimeout(() => {
      setIsGeneratingRender(false);
      setIsRenderFinished(true);
    }, 2400); // 2.4s simulation time
  };

  // Real-time render loop inside the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas high resolution for sharp drawing
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerSize.width * dpr;
    canvas.height = containerSize.height * dpr;
    ctx.scale(dpr, dpr);

    // Context shadow/glow optimization
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // 1. CLEAR & BACKGROUND SELECTION BASED ON RENDERING STYLE
    if (renderingStyle === 'autocad') {
      ctx.fillStyle = '#080c14'; // Strict Dark CAD Viewport
      ctx.fillRect(0, 0, containerSize.width, containerSize.height);

      // Draw engineering crosshairs in background
      ctx.strokeStyle = 'rgba(0, 160, 255, 0.05)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < containerSize.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, containerSize.height); ctx.stroke();
      }
      for (let y = 0; y < containerSize.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(containerSize.width, y); ctx.stroke();
      }
    } else if (renderingStyle === 'sketchup') {
      ctx.fillStyle = '#fbf9f3'; // Warm Ivory Drawing paper
      ctx.fillRect(0, 0, containerSize.width, containerSize.height);
    } else if (renderingStyle === 'marketing') {
      // Sleek dark anthracite background for dramatic mockups
      ctx.fillStyle = '#0f131d'; 
      ctx.fillRect(0, 0, containerSize.width, containerSize.height);
      
      // Radial modern studio wash
      const grad = ctx.createRadialGradient(
        containerSize.width / 2, containerSize.height / 2, 80,
        containerSize.width / 2, containerSize.height / 2, 400
      );
      grad.addColorStop(0, '#1e2436');
      grad.addColorStop(1, '#080a0f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, containerSize.width, containerSize.height);
    } else {
      // Standard view
      if (isNightMode) {
        ctx.fillStyle = '#0f172a'; // dark slate
      } else {
        ctx.fillStyle = '#f8fafc'; // light slate
      }
      ctx.fillRect(0, 0, containerSize.width, containerSize.height);
    }

    const cx_offset = containerSize.width / 2;
    const cy_offset = containerSize.height / 2 + 30; // shift down slightly of center

    // Camera values in radians
    const theta = (rotation * Math.PI) / 180; // horizontal rot
    const phi = (tilt * Math.PI) / 180; // vertical perspective tilt

    // Scale parameter: pixels per meter (adjust dynamically so it fits gracefully)
    const scale = Math.min(containerSize.width, containerSize.height) / 15; 

    // Find house bounding center to rotate houses about their actual geometric centroid
    let minX = 12, maxX = 0, minY = 12, maxY = 0;
    floorPlan.rooms.forEach(r => {
      if (r.x < minX) minX = r.x;
      if (r.x + r.width > maxX) maxX = r.x + r.width;
      if (r.y < minY) minY = r.y;
      if (r.y + r.height > maxY) maxY = r.y + r.height;
    });

    const centerX = (minX + maxX) / 2 || 6;
    const centerY = (minY + maxY) / 2 || 6;

    // Helper 3D Projection coordinate system
    // mz goes straight UP on the 2D plane screen
    const project = (mx: number, my: number, mz: number) => {
      // Rotate around room centroid
      const dx = mx - centerX;
      const dy = my - centerY;

      const rx = dx * Math.cos(theta) - dy * Math.sin(theta);
      const ry = dx * Math.sin(theta) + dy * Math.cos(theta);

      // Apply vertical projection tilt & scale
      const screenX = cx_offset + rx * scale;
      const screenY = cy_offset + (ry * Math.sin(phi)) * scale - (mz * scale);

      return { x: screenX, y: screenY, depth: ry }; // depth is used for painter's ordering sorting
    };

    // Style-specific helper to draw extensions at sketchy corners (for SketchUp pencil look!)
    const drawSketchyLine = (p1: { x: number; y: number }, p2: { x: number; y: number }, thickness = 1.2) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) return;

      const overshot = 5; // Overlap by 5px past corner vertices
      const ox = (dx / len) * overshot;
      const oy = (dy / len) * overshot;

      ctx.beginPath();
      // Draw with shaky handwritten jitter offsets
      ctx.moveTo(p1.x - ox + (Math.random() - 0.5) * 0.4, p1.y - oy + (Math.random() - 0.5) * 0.4);
      ctx.lineTo(p2.x + ox + (Math.random() - 0.5) * 0.4, p2.y + oy + (Math.random() - 0.5) * 0.4);
      
      ctx.strokeStyle = 'rgba(30, 30, 40, 0.9)';
      ctx.lineWidth = thickness;
      ctx.stroke();
    };

    // PAINTER'S ALGORITHM sorting: To render 3D overlapping rooms and elements correctly,
    // we sort objects by their projected "depth" (from back-to-front relative to camera).
    interface PaintableGroup {
      type: 'floor' | 'wall' | 'furniture' | 'decor';
      id: string;
      depth: number;
      render: () => void;
    }

    const renderList: PaintableGroup[] = [];

    // 1. FLOORING BLOCKS
    floorPlan.rooms.forEach((room) => {
      const centerProj = project(room.x + room.width / 2, room.y + room.height / 2, 0);

      renderList.push({
        type: 'floor',
        id: room.id,
        depth: centerProj.depth - 10, // floors always painted in back
        render: () => {
          const p1 = project(room.x, room.y, 0);
          const p2 = project(room.x + room.width, room.y, 0);
          const p3 = project(room.x + room.width, room.y + room.height, 0);
          const p4 = project(room.x, room.y + room.height, 0);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();

          // Floor coloring base configuration
          let fillColor = '#cbd5e1';
          if (renderingStyle === 'autocad') {
            fillColor = 'rgba(0, 255, 120, 0.02)'; // Clean empty vector fill
            ctx.fillStyle = fillColor;
            ctx.fill();
            
            // Draw fine neon green CAD box outline
            ctx.strokeStyle = 'rgba(0, 255, 120, 0.35)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            return;
          }

          if (renderingStyle === 'sketchup') {
            fillColor = '#fafaf8'; // Clean model foamcore white
            ctx.fillStyle = fillColor;
            ctx.fill();

            // Sketchy borders
            drawSketchyLine(p1, p2, 1);
            drawSketchyLine(p2, p3, 1);
            drawSketchyLine(p3, p4, 1);
            drawSketchyLine(p4, p1, 1);
            return;
          }

          // Modern / Marketing / Standard flooring colors
          const isMarketingMood = renderingStyle === 'marketing';
          if (room.floorMaterial === 'wood') fillColor = isMarketingMood ? '#5c3a21' : '#a15c07'; 
          else if (room.floorMaterial === 'tile') fillColor = isMarketingMood ? '#2e3541' : '#e2e8f0'; 
          else if (room.floorMaterial === 'carpet') fillColor = isMarketingMood ? '#414856' : '#a1a1aa'; 
          else if (room.floorMaterial === 'concrete') fillColor = isMarketingMood ? '#334155' : '#64748b'; 
          else if (room.floorMaterial === 'marble') fillColor = isMarketingMood ? '#cbd5e0' : '#ffffff'; 

          ctx.fillStyle = fillColor;
          ctx.fill();

          // Flooring CAD grids
          ctx.strokeStyle = isNightMode || isMarketingMood ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
          ctx.lineWidth = 1;
          
          if (room.floorMaterial === 'tile') {
            for (let i = 0; i <= room.width; i += 0.8) {
              const start = project(room.x + i, room.y, 0);
              const end = project(room.x + i, room.y + room.height, 0);
              ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
            }
            for (let j = 0; j <= room.height; j += 0.8) {
              const start = project(room.x, room.y + j, 0);
              const end = project(room.x + room.width, room.y + j, 0);
              ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
            }
          } else if (room.floorMaterial === 'wood') {
            for (let i = 0; i <= room.width; i += 0.4) {
              const start = project(room.x + i, room.y, 0);
              const end = project(room.x + i, room.y + room.height, 0);
              ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
            }
          }

          // Subtle ambient boundary lines
          ctx.strokeStyle = isNightMode || isMarketingMood ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.1)';
          ctx.stroke();
        }
      });
    });

    // 2. EXTRA WALL ELEVATIONS
    floorPlan.rooms.forEach((room) => {
      const h = wallHeight; // height of extrusion in meters

      const walls: Array<{
        name: string;
        x1: number; y1: number;
        x2: number; y2: number;
        nx: number; ny: number; // normals for sorting and lighting
      }> = [
        { name: 'top', x1: room.x, y1: room.y, x2: room.x + room.width, y2: room.y, nx: 0, ny: -1 },
        { name: 'left', x1: room.x, y1: room.y, x2: room.x, y2: room.y + room.height, nx: -1, ny: 0 },
        { name: 'right', x1: room.x + room.width, y1: room.y, x2: room.x + room.width, y2: room.y + room.height, nx: 1, ny: 0 },
        { name: 'bottom', x1: room.x, y1: room.y + room.height, x2: room.x + room.width, y2: room.y + room.height, nx: 0, ny: 1 },
      ];

      walls.forEach((w) => {
        const mx_mid = (w.x1 + w.x2) / 2;
        const my_mid = (w.y1 + w.y2) / 2;
        const midProj = project(mx_mid, my_mid, h / 2);

        // Angle relative to camera view (dot product estimation)
        const wallLightFactor = Math.abs(w.nx * Math.cos(theta) + w.ny * Math.sin(theta));

        renderList.push({
          type: 'wall',
          id: `${room.id}-wall-${w.name}`,
          depth: midProj.depth,
          render: () => {
            const p1 = project(w.x1, w.y1, 0);
            const p2 = project(w.x2, w.y2, 0);
            const p3 = project(w.x2, w.y2, h);
            const p4 = project(w.x1, w.y1, h);

            // AutoCAD Vector styling (Glowing Neon Wireframe)
            if (renderingStyle === 'autocad') {
              // Add a neon glow filter
              ctx.shadowColor = '#00ff88';
              ctx.shadowBlur = 4;
              
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p4.x, p4.y);
              ctx.moveTo(p2.x, p2.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.moveTo(p4.x, p4.y);
              ctx.lineTo(p3.x, p3.y);
              
              ctx.strokeStyle = '#00ff88'; // Fluorescent CAD green
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Clear shadow
              ctx.shadowBlur = 0;
              ctx.shadowColor = 'transparent';
              return;
            }

            // SketchUp style walls
            if (renderingStyle === 'sketchup') {
              // Faint card texture inside
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.lineTo(p4.x, p4.y);
              ctx.closePath();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
              ctx.fill();

              // Pencil strokes
              drawSketchyLine(p1, p4, 1);
              drawSketchyLine(p2, p3, 1);
              drawSketchyLine(p4, p3, 1.8); // outline on top of walls is heavier
              return;
            }

            // Standard / Marketing Premium styled faces
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.closePath();

            const isMarketing = renderingStyle === 'marketing';
            if (isMarketing) {
              // Smooth high-end plaster concrete shading
              const wallShading = 0.45 + wallLightFactor * 0.35;
              ctx.fillStyle = `rgba(32, 41, 57, ${wallShading})`;
              ctx.fill();
              
              // Clean white sleek wall cap outline
              ctx.beginPath();
              ctx.moveTo(p4.x, p4.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.strokeStyle = '#f8fafc';
              ctx.lineWidth = 2;
              ctx.stroke();
            } else {
              // Standard View
              if (isNightMode) {
                ctx.fillStyle = `rgba(30, 41, 59, ${0.4 + wallLightFactor * 0.25})`; 
              } else {
                ctx.fillStyle = `rgba(226, 232, 240, ${0.45 + wallLightFactor * 0.35})`;
              }
              ctx.fill();
              
              ctx.strokeStyle = isNightMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(15, 23, 42, 0.15)';
              ctx.lineWidth = 1;
              ctx.stroke();

              // Wall cap
              ctx.beginPath();
              ctx.moveTo(p4.x, p4.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.strokeStyle = isNightMode ? '#38bdf8' : '#1e293b';
              ctx.lineWidth = 2.2;
              ctx.stroke();
            }
          }
        });
      });
    });

    // 3. FURNITURE MESHES
    floorPlan.furniture.forEach((furniture) => {
      const room = floorPlan.rooms.find((r) => r.id === furniture.roomId);
      if (!room) return;

      const rad = (furniture.rotation * Math.PI) / 180;
      const f_centerX = room.x + furniture.x + furniture.width / 2;
      const f_centerY = room.y + furniture.y + furniture.height / 2;
      
      const f_height = furniture.type === 'fridge' ? 1.6 :
                       furniture.type === 'bed' ? 0.6 :
                       furniture.type === 'couch' ? 0.72 :
                       furniture.type === 'tv' ? 1.0 :
                       furniture.type === 'table' ? 0.75 :
                       furniture.type === 'cabinet' ? 0.95 : 0.45;

      const centProj = project(f_centerX, f_centerY, f_height / 2);

      renderList.push({
        type: 'furniture',
        id: furniture.id,
        depth: centProj.depth + 1.5,
        render: () => {
          const w_half = furniture.width / 2;
          const h_half = furniture.height / 2;

          const localCorners = [
            { dx: -w_half, dy: -h_half },
            { dx: w_half, dy: -h_half },
            { dx: w_half, dy: h_half },
            { dx: -w_half, dy: h_half },
          ];

          const projectedCornersBase = localCorners.map((cor) => {
            const rx = cor.dx * Math.cos(rad) - cor.dy * Math.sin(rad);
            const ry = cor.dx * Math.sin(rad) + cor.dy * Math.cos(rad);
            return project(f_centerX + rx, f_centerY + ry, 0);
          });

          const projectedCornersTop = localCorners.map((cor) => {
            const rx = cor.dx * Math.cos(rad) - cor.dy * Math.sin(rad);
            const ry = cor.dx * Math.sin(rad) + cor.dy * Math.cos(rad);
            return project(f_centerX + rx, f_centerY + ry, f_height);
          });

          // AutoCAD Glow-wireframe styling for furniture
          if (renderingStyle === 'autocad') {
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 3;
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)'; // Amber CAD wire glow
            ctx.lineWidth = 1;

            // Draw orange wireframe cubes
            for (let i = 0; i < 4; i++) {
              const next = (i + 1) % 4;
              ctx.beginPath();
              ctx.moveTo(projectedCornersBase[i].x, projectedCornersBase[i].y);
              ctx.lineTo(projectedCornersBase[next].x, projectedCornersBase[next].y);
              ctx.lineTo(projectedCornersTop[next].x, projectedCornersTop[next].y);
              ctx.lineTo(projectedCornersTop[i].x, projectedCornersTop[i].y);
              ctx.closePath();
              ctx.stroke();
            }

            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';

            // Tiny engineering label
            ctx.fillStyle = '#64748b';
            ctx.font = '7.5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(furniture.name.toUpperCase(), projectedCornersTop[0].x, projectedCornersTop[0].y - 4);
            return;
          }

          // SketchUp Sketchy furniture blocks
          if (renderingStyle === 'sketchup') {
            // Draw sketchy white card block
            for (let i = 0; i < 4; i++) {
              const next = (i + 1) % 4;
              ctx.beginPath();
              ctx.moveTo(projectedCornersBase[i].x, projectedCornersBase[i].y);
              ctx.lineTo(projectedCornersBase[next].x, projectedCornersBase[next].y);
              ctx.lineTo(projectedCornersTop[next].x, projectedCornersTop[next].y);
              ctx.lineTo(projectedCornersTop[i].x, projectedCornersTop[i].y);
              ctx.closePath();
              ctx.fillStyle = '#ffffff';
              ctx.fill();

              drawSketchyLine(projectedCornersBase[i], projectedCornersTop[i], 0.7);
              drawSketchyLine(projectedCornersTop[i], projectedCornersTop[next], 0.9);
            }
            return;
          }

          // Standard / Marketing Style coloring
          let boxColor = '#fb923c'; // warm modern copper orange
          if (furniture.type === 'bed') boxColor = '#f472b6'; 
          else if (['toilet', 'sink', 'shower'].includes(furniture.type)) boxColor = '#5eead4'; 
          else if (furniture.type === 'plant') boxColor = '#a3e635'; 
          else if (['tv', 'fridge', 'stove'].includes(furniture.type)) boxColor = '#94a3b8'; 
          else if (['table', 'chair'].includes(furniture.type)) boxColor = '#a7f3d0';

          const isMarketing = renderingStyle === 'marketing';
          if (isMarketing) {
            boxColor = '#475569'; // High-end slate look
            if (furniture.type === 'couch') boxColor = '#9a3412'; // luxurious amber leather couch texture
            else if (furniture.type === 'bed') boxColor = '#a21caf'; // purple linen bed style
            else if (['sink', 'toilet', 'shower'].includes(furniture.type)) boxColor = '#f8fafc'; // ceramic porcelain gloss white
            else if (furniture.type === 'plant') boxColor = '#15803d'; // photorealistic forest green
          }

          // Side faces drawing with shade depth modeling
          for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            ctx.beginPath();
            ctx.moveTo(projectedCornersBase[i].x, projectedCornersBase[i].y);
            ctx.lineTo(projectedCornersBase[next].x, projectedCornersBase[next].y);
            ctx.lineTo(projectedCornersTop[next].x, projectedCornersTop[next].y);
            ctx.lineTo(projectedCornersTop[i].x, projectedCornersTop[i].y);
            ctx.closePath();
            
            ctx.fillStyle = boxColor;
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Overlay artificial shadow factor
            ctx.fill();
            
            ctx.strokeStyle = isMarketing ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }

          // Draw upper top cap face
          ctx.beginPath();
          ctx.moveTo(projectedCornersTop[0].x, projectedCornersTop[0].y);
          projectedCornersTop.forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.fillStyle = boxColor;
          ctx.fill();
          
          if (isMarketing) {
            ctx.fillStyle = 'rgba(255,255,255,0.06)'; // Light sun specular gloss
            ctx.fill();
          }
          
          ctx.strokeStyle = isNightMode || isMarketing ? 'rgba(255,255,255,0.35)' : '#334155';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Labels
          ctx.fillStyle = isMarketing ? '#f8fafc' : '#0f172a';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';

          const topCenterX = projectedCornersTop.reduce((sum, p) => sum + p.x, 0) / 4;
          const topCenterY = projectedCornersTop.reduce((sum, p) => sum + p.y, 0) / 4;
          ctx.fillText(furniture.name, topCenterX, topCenterY + 3);
        }
      });
    });

    // Run custom Painter's depth sorting algorithm
    renderList.sort((a, b) => a.depth - b.depth);

    // DRAW SHAPES SEQUENTIALLY
    renderList.forEach((group) => {
      group.render();
    });

    // AutoCAD HUD Overlays (Scale, origin indicators, axis coordinates)
    if (renderingStyle === 'autocad') {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      
      // UCS icon (Origin guide) in top left
      ctx.beginPath();
      ctx.moveTo(25, 80); ctx.lineTo(45, 80); // X axis
      ctx.moveTo(25, 80); ctx.lineTo(25, 60); // Y axis
      ctx.stroke();
      
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 8px sans-serif';
      ctx.fillText('X', 48, 83);
      ctx.fillStyle = '#3b82f6'; ctx.fillText('Y', 25, 55);

      ctx.fillStyle = 'rgba(0, 255, 120, 0.85)';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('AUTOCAD REFLINE [ON]', 15, 20);
      ctx.fillText(`CÂMERA POSS: ${rotation}°, ${tilt}°`, 15, 32);
    } else if (renderingStyle === 'sketchup') {
      ctx.fillStyle = '#7a766c';
      ctx.font = 'italic 10px serif';
      ctx.fillText('Esboço Conceitual Rápido SketchUp®', 15, 25);
    } else {
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = isNightMode || renderingStyle === 'marketing' ? '#94a3b8' : '#475569';
      ctx.textAlign = 'left';
      ctx.fillText(`CAM ROT: ${rotation}°  TILT: ${tilt}°  ALTURA: ${wallHeight.toFixed(1)}m`, 15, 20);
    }

  }, [floorPlan, rotation, tilt, wallHeight, renderingStyle, isNightMode, containerSize]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-slate-100 min-h-0 h-full relative select-none overflow-hidden">
      
      {/* 3D CAMERA & STYLE SELECTOR CONTROLS PANEL */}
      <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 flex flex-col min-h-0 h-full">
        
        {/* UPPER TITLE */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 text-blue-600 font-bold mb-1">
            <Laptop className="w-5 h-5 text-indigo-600" />
            <span className="uppercase text-xs tracking-wider font-extrabold text-indigo-700">Estúdio de Render & Maquete</span>
          </div>
          <p className="text-[11px] text-slate-500">Configure visualizações realistas de marketing e exporte maquetes técnicas virtuais.</p>
        </div>

        {/* INTEGRATED STYLE PICKER BUTTONS */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Selecione o Estilo de Visualização</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="style-std"
              onClick={() => setRenderingStyle('standard')}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                renderingStyle === 'standard'
                  ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-500" />
              <div>
                <p className="font-bold text-[11px] leading-tight">Padrão BIM</p>
                <p className="text-[9px] text-slate-400">Pastel limpo</p>
              </div>
            </button>

            <button
              id="style-sku"
              onClick={() => setRenderingStyle('sketchup')}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                renderingStyle === 'sketchup'
                  ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Cpu className="w-4 h-4 text-amber-600" />
              <div>
                <p className="font-bold text-[11px] leading-tight">SketchUp Pencil</p>
                <p className="text-[9px] text-slate-400">Esboço à mão</p>
              </div>
            </button>

            <button
              id="style-cad"
              onClick={() => setRenderingStyle('autocad')}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                renderingStyle === 'autocad'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="font-bold text-[11px] leading-tight">AutoCAD Wire</p>
                <p className="text-[9px] text-slate-400">Glow vetorial</p>
              </div>
            </button>

            <button
              id="style-mrkt"
              onClick={() => setRenderingStyle('marketing')}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                renderingStyle === 'marketing'
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="font-bold text-[11px] leading-tight">Marketing 3D</p>
                <p className="text-[9px] text-slate-400">Raytracing fotorreal</p>
              </div>
            </button>
          </div>
        </div>

        {/* CAMERAS & ANGLES SCROLL BOX */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* CAMERA INPUTS */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Controles da Câmera Virtual</span>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Rotação Horizontal</span>
                <span className="font-mono">{rotation}°</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setRotation(r => (r - 15 + 360) % 360)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  value={rotation} 
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <button 
                  onClick={() => setRotation(r => (r + 15) % 360)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Ângulo de Inclinação (Pitch)</span>
                <span className="font-mono">{tilt}°</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="range" 
                  min="15" 
                  max="80" 
                  value={tilt} 
                  onChange={(e) => setTilt(Number(e.target.value))}
                  className="flex-1 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Pé Direito (Altura Parede)</span>
                <span className="font-mono">{wallHeight.toFixed(1)}m</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-450 shrink-0 text-slate-400" />
                <input 
                  type="range" 
                  min="0.2" 
                  max="2.6" 
                  step="0.2"
                  value={wallHeight} 
                  onChange={(e) => setWallHeight(Number(e.target.value))}
                  className="flex-1 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* SIMULATION UTILITIES ACCESSIBILITY */}
          <div className="pt-2 border-t border-slate-100">
            <button 
              id="daynight-toggle-side"
              onClick={() => setIsNightMode(!isNightMode)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border font-bold text-xs transition-all ${
                isNightMode 
                  ? 'bg-slate-800 text-yellow-400 border-slate-700 hover:bg-slate-700' 
                  : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200/85'
              }`}
            >
              {isNightMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-yellow-400" /> Simular Iluminação Solar (Dia)
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600 fill-slate-200" /> Simular Iluminação Artificial (Noite)
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-[10.5px] leading-relaxed text-slate-600 space-y-1 font-mono">
            <div className="font-bold text-slate-800">CÁLCULO VOLUMÉTRICO LOCAL:</div>
            <div>Cômodos computados em tempo real na aba de engenharia. Altere o Pé Direito para recalculá-los volumetricamente.</div>
          </div>

        </div>

      </div>

      {/* CORE CANVAS WORKSPACE OVERLAY / PREMIUM PHOTO LAB ON THE RIGHT */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 h-full relative bg-slate-200">
        
        {/* CENTER STAGE ENGINE CANVAS */}
        <div className="flex-1 flex flex-col bg-slate-50 relative min-h-0 h-full items-center justify-center p-4">
          <canvas 
            ref={canvasRef} 
            className="rounded-xl shadow-xl max-w-full max-h-full border border-slate-250 bg-white"
            style={{ 
              width: `${containerSize.width}px`, 
              height: `${containerSize.height}px`,
              transition: 'background-color 0.4s ease'
            }}
          />
        </div>

        {/* REAL-LIFE MARKETING PHOTO-LAB SIDEBAR */}
        {renderingStyle === 'marketing' && (
          <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-4 shrink-0 flex flex-col gap-4 text-white overflow-y-auto font-sans">
            
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">Fotorrealismo AI (V-Ray)</h3>
                <p className="text-[9px] text-slate-500 font-mono">Simulador de Imagens de Alta Definição</p>
              </div>
            </div>

            {/* SELECTION TABS FOR HD RENDERS */}
            <div className="space-y-3">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-mono">Escolher Visual de Marketing</span>
              
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
                <button
                  onClick={() => {
                    setActivePhotoPreview('kitchen');
                    setIsRenderFinished(false);
                  }}
                  className={`flex-1 py-1 px-2 rounded font-bold text-[10px] transition-all flex items-center justify-center gap-1 ${
                    activePhotoPreview === 'kitchen' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Utensils className="w-3 h-3" /> Cozinha Escandinava
                </button>
                <button
                  onClick={() => {
                    setActivePhotoPreview('lounge');
                    setIsRenderFinished(false);
                  }}
                  className={`flex-1 py-1 px-2 rounded font-bold text-[10px] transition-all flex items-center justify-center gap-1 ${
                    activePhotoPreview === 'lounge' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tv className="w-3 h-3" /> Living Premium
                </button>
              </div>
            </div>

            {/* ACTIVE PHOTOREAL PREVIEW CONTAINER */}
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 relative aspect-video flex items-center justify-center group shadow-md">
              
              {isGeneratingRender ? (
                <div className="flex flex-col items-center gap-3 p-4 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-300">Compilando Raytracer...</p>
                    <p className="text-[10px] text-slate-500 font-mono">Processando shaders & oclusão de ambiente</p>
                  </div>
                </div>
              ) : isRenderFinished ? (
                <div className="w-full h-full relative">
                  <img
                    src={activePhotoPreview === 'kitchen' ? PREGENERATED_RENDERS.kitchen : PREGENERATED_RENDERS.lounge}
                    alt="Realistic render output"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono bg-slate-950/80 px-1.5 py-0.5 rounded border border-emerald-900/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        RENDER CONCLUÍDO (HD)
                      </div>
                      <a
                        href={activePhotoPreview === 'kitchen' ? PREGENERATED_RENDERS.kitchen : PREGENERATED_RENDERS.lounge}
                        download="render_marketing_premium.png"
                        className="p-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:scale-105 transition-all text-[9px] font-bold flex items-center gap-0.5"
                        title="Download Render file"
                      >
                        <Download className="w-2.5 h-2.5" />
                        Salvar
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center text-slate-400">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                  <div className="space-y-1">
                    <p className="text-[10.5px] font-semibold">Renderização Pendente</p>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      Ajuste os parâmetros abaixo e clique para iniciar a síntese foto-realista da maquete SketchUp no motor Gemini V-Ray.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* ADJUSTMENT SLIDERS */}
            <div className="space-y-3.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-mono flex items-center gap-1">
                <Sliders className="w-3 h-3 text-indigo-400" /> Parâmetros de Traçamento de Raios
              </span>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Intensidade Luz Solar (HDR)</span>
                  <span className="text-white font-bold">{sunlightIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={sunlightIntensity}
                  onChange={(e) => {
                    setSunlightIntensity(Number(e.target.value));
                    setIsRenderFinished(false);
                  }}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Qualidade / Amostragem</span>
                  <span className="text-white font-bold">{raytraceSamples} Spp</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[64, 128, 256, 512].map((sam) => (
                    <button
                      key={`sample-${sam}`}
                      onClick={() => {
                        setRaytraceSamples(sam);
                        setIsRenderFinished(false);
                      }}
                      className={`text-[9px] py-1 font-bold font-mono rounded ${
                        raytraceSamples === sam 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-400'
                      }`}
                    >
                      {sam}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COMPILATION TRIGGER BUTTON */}
            <button
              onClick={handleCompileRender}
              disabled={isGeneratingRender}
              className={`w-full py-2.5 rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
                isGeneratingRender
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-900/40 hover:scale-[1.02]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingRender ? 'RENDERIZANDO MAQUETE...' : 'GERAR VISUALIZAÇÃO FOTORREALISTA'}
            </button>

            <div className="text-[9.5px] leading-relaxed text-slate-500 font-mono space-y-1.5 pt-1">
              <p>✔ Texturização e dimensionamentos de paredes alinhados aos dados do painel AutoCAD.</p>
              <p>✔ Configurações integradas com AutoCAD (NBR 5410) e hidráulica predial.</p>
            </div>

          </div>
        )}

      </div>
      
    </div>
  );
}
