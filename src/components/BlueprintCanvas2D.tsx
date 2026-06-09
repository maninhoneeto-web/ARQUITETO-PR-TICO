import React, { useRef, useState, useEffect } from 'react';
import { 
  Trash2, RotateCw, Plus, Columns, Info, Layers, Zap, Droplet, LayoutGrid, 
  Compass, FileSpreadsheet, Ruler, Cpu
} from 'lucide-react';
import { Room, Door, Window, Furniture, FloorPlanData, FurnitureType, EngineeringLayer } from '../types';

interface BlueprintCanvas2DProps {
  floorPlan: FloorPlanData;
  selectedRoom: Room | null;
  onSelectRoom: (room: Room | null) => void;
  selectedFurniture: Furniture | null;
  onSelectFurniture: (furniture: Furniture | null) => void;
  onMoveRoom: (roomId: string, newX: number, newY: number) => void;
  onResizeRoom: (roomId: string, newWidth: number, newHeight: number) => void;
  onMoveFurniture: (furnitureId: string, newX: number, newY: number) => void;
  onRotateFurniture: (furnitureId: string) => void;
  onAddDoor: (roomId: string, wall: 'top' | 'bottom' | 'left' | 'right') => void;
  onAddWindow: (roomId: string, wall: 'top' | 'bottom' | 'left' | 'right') => void;
  onDeleteRoom: (roomId: string) => void;
  onDeleteFurniture: (furnitureId: string) => void;
  onDeleteDoor: (doorId: string) => void;
  onDeleteWindow: (windowId: string) => void;
  activeLayer: EngineeringLayer;
  setActiveLayer: (layer: EngineeringLayer) => void;
}

export function BlueprintCanvas2D({
  floorPlan,
  selectedRoom,
  onSelectRoom,
  selectedFurniture,
  onSelectFurniture,
  onMoveRoom,
  onResizeRoom,
  onMoveFurniture,
  onRotateFurniture,
  onAddDoor,
  onAddWindow,
  onDeleteRoom,
  onDeleteFurniture,
  onDeleteDoor,
  onDeleteWindow,
  activeLayer,
  setActiveLayer,
}: BlueprintCanvas2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dragging states
  const [dragState, setDragState] = useState<{
    type: 'room' | 'room-resize' | 'furniture' | null;
    id: string; // id of item being dragged
    startX: number;
    startY: number;
    originalX: number;
    originalY: number;
    originalWidth: number;
    originalHeight: number;
  }>({
    type: null,
    id: '',
    startX: 0,
    startY: 0,
    originalX: 0,
    originalY: 0,
    originalWidth: 0,
    originalHeight: 0,
  });

  // Scale: pixels per meter (default 40px = 1m)
  const scale = 36;
  const gridSize = 12; // 12m x 12m canvas

  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'room' | 'room-resize' | 'furniture',
    id: string,
    initialX: number,
    initialY: number,
    initialW = 0,
    initialH = 0
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    setDragState({
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      originalX: initialX,
      originalY: initialY,
      originalWidth: initialW,
      originalHeight: initialH,
    });

    if (type === 'room') {
      const room = floorPlan.rooms.find((r) => r.id === id) || null;
      onSelectRoom(room);
      onSelectFurniture(null);
    } else if (type === 'furniture') {
      const furn = floorPlan.furniture.find((f) => f.id === id) || null;
      onSelectFurniture(furn);
      if (furn) {
        const parentRoom = floorPlan.rooms.find((r) => r.id === furn.roomId) || null;
        onSelectRoom(parentRoom);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.type) return;
    
    const dx = (e.clientX - dragState.startX) / scale;
    const dy = (e.clientY - dragState.startY) / scale;

    // snap tolerance 0.1m
    const snap = (val: number) => {
      return Math.round(val * 10) / 10;
    };

    if (dragState.type === 'room') {
      let targetX = snap(dragState.originalX + dx);
      let targetY = snap(dragState.originalY + dy);
      
      // boundaries
      const room = floorPlan.rooms.find((r) => r.id === dragState.id);
      if (room) {
        targetX = Math.max(0, Math.min(gridSize - room.width, targetX));
        targetY = Math.max(0, Math.min(gridSize - room.height, targetY));
        onMoveRoom(dragState.id, targetX, targetY);
      }
    } else if (dragState.type === 'room-resize') {
      let targetW = snap(dragState.originalWidth + dx);
      let targetH = snap(dragState.originalHeight + dy);

      // bounds
      targetW = Math.max(1.5, Math.min(8.0, targetW));
      targetH = Math.max(1.5, Math.min(8.0, targetH));
      onResizeRoom(dragState.id, targetW, targetH);
    } else if (dragState.type === 'furniture') {
      const furn = floorPlan.furniture.find((f) => f.id === dragState.id);
      if (furn) {
        let relX = snap(dragState.originalX + dx);
        let relY = snap(dragState.originalY + dy);

        // Limit inside room coordinates
        const room = floorPlan.rooms.find((r) => r.id === furn.roomId);
        if (room) {
          relX = Math.max(0, Math.min(room.width - furn.width, relX));
          relY = Math.max(0, Math.min(room.height - furn.height, relY));
          onMoveFurniture(dragState.id, relX, relY);
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState.type) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragState({
      type: null,
      id: '',
      startX: 0,
      startY: 0,
      originalX: 0,
      originalY: 0,
      originalWidth: 0,
      originalHeight: 0,
    });
  };

  // Helper vectors for rendering doors and windows accurately on room sides
  const getStructureCoordinates = (
    room: Room,
    wall: 'top' | 'bottom' | 'left' | 'right',
    offset: number,
    width: number
  ) => {
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0, angle = 0;
    
    // Base coords relative to canvas
    const rx = room.x * scale;
    const ry = room.y * scale;
    const rw = room.width * scale;
    const rh = room.height * scale;
    const off = offset * scale;
    const w = width * scale;

    switch (wall) {
      case 'top':
        x1 = rx + off;
        y1 = ry;
        x2 = x1 + w;
        y2 = ry;
        angle = 0;
        break;
      case 'bottom':
        x1 = rx + off;
        y1 = ry + rh;
        x2 = x1 + w;
        y2 = ry + rh;
        angle = 180;
        break;
      case 'left':
        x1 = rx;
        y1 = ry + off;
        x2 = rx;
        y2 = y1 + w;
        angle = 270;
        break;
      case 'right':
        x1 = rx + rw;
        y1 = ry + off;
        x2 = rx + rw;
        y2 = y1 + w;
        angle = 90;
        break;
    }

    return { x1, y1, x2, y2, angle, w };
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-100 relative min-h-0 h-full select-none" id="blueprint-main-canvas-wrapper">
      
      {/* 2D CANVAS LAYER SELECTOR BAR */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex flex-wrap gap-2 items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-bold">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="uppercase tracking-widest text-[9px] text-zinc-300 font-mono">CAD Vistas & Camadas:</span>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 gap-1">
          <button
            id="layer-arch"
            onClick={() => setActiveLayer('architectural')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeLayer === 'architectural'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            1. Arquitetônico
          </button>
          <button
            id="layer-elec"
            onClick={() => setActiveLayer('electrical')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeLayer === 'electrical'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            2. Elétrico (NBR 5410)
          </button>
          <button
            id="layer-hydr"
            onClick={() => setActiveLayer('hydraulic')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeLayer === 'hydraulic'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            3. Hidrossanitário
          </button>
          <button
            id="layer-struct"
            onClick={() => setActiveLayer('structural')}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              activeLayer === 'structural'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            4. Estrutural
          </button>
        </div>

        <div className="text-[9px] bg-zinc-950 font-mono py-1 px-2.5 rounded border border-zinc-800 text-cyan-400 tracking-wider">
          {activeLayer === 'architectural' && 'PLANTA DE ARQUITETURA'}
          {activeLayer === 'electrical' && 'FUTURO LANÇAMENTO DE FIAÇÕES'}
          {activeLayer === 'hydraulic' && 'RAMAIS DE ESGOTO E AF'}
          {activeLayer === 'structural' && 'CADASTRO DE PILARES/LAJES'}
        </div>
      </div>

      {/* 2D CANVAS HEADER */}
      <div className="bg-white border-b border-zinc-200 px-4 py-2.5 flex justify-between items-center sm:flex-row flex-col gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <Info className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>
            {activeLayer === 'architectural' && (
              <>Arraste e posicione cômodos. Clique no handle <strong className="text-blue-600">█</strong> azul inferior direito para redimensionar.</>
            )}
            {activeLayer === 'electrical' && (
              <>Lançamento de cargas NBR 5410. Fios elétricos amarelos de conduíte ligam automaticamente as tomadas ao QDC.</>
            )}
            {activeLayer === 'hydraulic' && (
              <>Tubulações potáveis em <strong className="text-sky-650 font-bold">azul</strong> e águas negras em <strong className="text-amber-850 font-bold">marrom</strong>.</>
            )}
            {activeLayer === 'structural' && (
              <>Pilares estruturais de canto e vigas horizontais para distribuição estável de momentos.</>
            )}
          </span>
        </div>

        {/* Quick room action toolset if room is selected */}
        {selectedRoom && activeLayer === 'architectural' && (
          <div className="flex gap-1.5 shrink-0 scale-90 sm:scale-100">
            <button
              id="btn-add-door-top"
              onClick={() => onAddDoor(selectedRoom.id, 'bottom')}
              className="px-2.5 py-1 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md flex items-center gap-1 border border-zinc-250"
            >
              <Plus className="w-3 h-3 text-zinc-500" /> + Porta
            </button>
            <button
              id="btn-add-win-top"
              onClick={() => onAddWindow(selectedRoom.id, 'top')}
              className="px-2.5 py-1 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-md flex items-center gap-1 border border-zinc-250"
            >
              <Plus className="w-3 h-3 text-zinc-500" /> + Janela
            </button>
            <button
              id="btn-del-room"
              onClick={() => {
                onDeleteRoom(selectedRoom.id);
                onSelectRoom(null);
                onSelectFurniture(null);
              }}
              className="px-2.5 py-1 text-[11px] font-bold bg-red-50 hover:bg-red-100 text-red-650 rounded-md flex items-center gap-1 border border-red-200"
            >
              <Trash2 className="w-3 h-3" /> Excluir Sala
            </button>
          </div>
        )}
      </div>

      {/* CORE FRAME: SPLIT VIEW BETWEEN CANVAS AND ENGINEERING TECHNICAL SPECS */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full overflow-hidden">
        
        {/* RENDER GRID WORKSPACE */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto flex items-center justify-center p-6 relative bg-zinc-200 border-r border-zinc-300"
          onPointerMove={handlePointerMove}
        >
          {/* Cyanotype blueprint container block */}
          <div 
            className="relative bg-[#09152b] shadow-2xl border-4 border-zinc-805 rounded-xl overflow-hidden"
            style={{ width: `${gridSize * scale}px`, height: `${gridSize * scale}px` }}
          >
            {/* Blueprint SVG Engine */}
            <svg 
              className="absolute inset-0 w-full h-full"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Grid Pattern Background */}
              <defs>
                <pattern id="grid-pattern" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#122a57" strokeWidth="0.8" />
                  <path d={`M ${scale / 2} 0 L 0 0 0 ${scale / 2}`} fill="none" stroke="#0d1f42" strokeWidth="0.4" />
                </pattern>
                
                {/* Diagonal hatch pattern for concrete columns */}
                <pattern id="hatch-pattern" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#4b5563" strokeWidth="1.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />

              {/* 1. ROOMS RENDER */}
              {floorPlan.rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const rx = room.x * scale;
                const ry = room.y * scale;
                const rw = room.width * scale;
                const rh = room.height * scale;

                const isSchematic = activeLayer !== 'architectural';
                // Higher opacity ensures the user can easily find, select and see rooms on mobile!
                const opacityVal = isSchematic ? '0.18' : '0.40';

                return (
                  <g key={room.id} className="cursor-move">
                    {/* Outer Chamber Fill */}
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill={room.color}
                      fillOpacity={opacityVal}
                      stroke={isSelected ? '#06b6d4' : isSchematic ? '#1e3a75' : '#1d4ed8'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      onPointerDown={(e) => handlePointerDown(e, 'room', room.id, room.x, room.y)}
                      onClick={() => onSelectRoom(room)}
                    />

                    {/* Room Area Label Text */}
                    <g pointerEvents="none" opacity={isSchematic ? 0.6 : 1}>
                      {/* Using bright white label on dark blue blueprint canvas for high legibility */}
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 - 6}
                        textAnchor="middle"
                        className="text-[12px] font-mono font-black fill-white tracking-wide"
                      >
                        {room.name.toUpperCase()}
                      </text>
                      <text
                        x={rx + rw / 2}
                        y={ry + rh / 2 + 10}
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold fill-cyan-400"
                      >
                        {(room.width * room.height).toFixed(1)} m²
                      </text>
                    </g>

                    {/* WALL THICKNESS RENDER */}
                    <rect
                      x={rx}
                      y={ry}
                      width={rw}
                      height={rh}
                      fill="none"
                      stroke={isSchematic ? '#1e3a75' : '#ffffff'}
                      strokeWidth={isSchematic ? '1.5' : '3.5'}
                      strokeDasharray={isSchematic ? '4 4' : 'none'}
                      fillOpacity="0"
                      pointerEvents="none"
                    />

                    {/* Corner Resize Handle on bottom right */}
                    {isSelected && activeLayer === 'architectural' && (
                      <rect
                        x={rx + rw - 12}
                        y={ry + rh - 12}
                        width="14"
                        height="14"
                        className="fill-cyan-400 cursor-se-resize stroke-slate-900 stroke-2"
                        onPointerDown={(e) =>
                          handlePointerDown(e, 'room-resize', room.id, room.x, room.y, room.width, room.height)
                        }
                      />
                    )}
                  </g>
                );
              })}

              {/* 2. ARCHITECTURAL DOORS STRUCTURE RENDER */}
              {floorPlan.doors.map((door) => {
                const room = floorPlan.rooms.find((r) => r.id === door.roomId);
                if (!room) return null;

                const { x1, y1, angle, w } = getStructureCoordinates(room, door.wall, door.offset, door.width);
                if (activeLayer !== 'architectural') {
                  // Lightweight outline for schematics
                  return (
                    <line key={`door-line-${door.id}`} x1={x1} y1={y1} x2={x1 + w} y2={y1} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                  );
                }
                
                return (
                  <g 
                    key={door.id} 
                    transform={`translate(${x1}, ${y1}) rotate(${angle})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Deletar esta porta?')) onDeleteDoor(door.id);
                    }}
                  >
                    <rect x="0" y="-3" width={w} height="6" fill="white" stroke="white" strokeWidth="1" />
                    {door.isOpen ? (
                      <path
                        d={`M 0 0 A ${w} ${w} 0 0 1 ${w} ${-w} L ${w} 0`}
                        fill="none"
                        stroke="#bfdbfe"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    ) : null}
                    <line
                      x1="0"
                      y1="0"
                      x2={w}
                      y2={door.isOpen ? -w : 0}
                      stroke="#b45309"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* 3. ARCHITECTURAL WINDOWS RENDER */}
              {floorPlan.windows.map((win) => {
                const room = floorPlan.rooms.find((r) => r.id === win.roomId);
                if (!room) return null;

                const { x1, y1, angle, w } = getStructureCoordinates(room, win.wall, win.offset, win.width);
                if (activeLayer !== 'architectural') {
                  return (
                    <line key={`win-line-${win.id}`} x1={x1} y1={y1} x2={x1 + w} y2={y1} stroke="#cbd5e1" strokeWidth="1.5" />
                  );
                }

                return (
                  <g 
                    key={win.id} 
                    transform={`translate(${x1}, ${y1}) rotate(${angle})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Deletar esta janela?')) onDeleteWindow(win.id);
                    }}
                  >
                    <rect x="0" y="-4" width={w} height="8" fill="white" stroke="#334155" strokeWidth="1.5" />
                    <line x1="0" y1="0" x2={w} y2="0" stroke="#38bdf8" strokeWidth="3" />
                    <line x1="0" y1="-2" x2={w} y2="-2" stroke="#334155" strokeWidth="0.5" />
                    <line x1="0" y1="2" x2={w} y2="2" stroke="#334155" strokeWidth="0.5" />
                  </g>
                );
              })}

              {/* 4. ELECTRICAL OVERLAY SCHEMATIC (LAYER: ELECTRICAL) */}
              {activeLayer === 'electrical' && (
                <>
                  {floorPlan.rooms.map((room, index) => {
                    const cx = (room.x + room.width / 2) * scale;
                    const cy = (room.y + room.height / 2) * scale;

                    const mainRoom = floorPlan.rooms[0] || room;
                    const qdcX = (mainRoom.x + 0.3) * scale;
                    const qdcY = (mainRoom.y + 0.6) * scale;

                    const qdcControlPointX = (cx + qdcX) / 2;
                    const qdcControlPointY = (cy + qdcY) / 2 - 40;

                    return (
                      <g key={`elec-wires-${room.id}`} pointerEvents="none">
                        {index > 0 && (
                          <path
                            d={`M ${qdcX} ${qdcY} Q ${qdcControlPointX} ${qdcControlPointY} ${cx} ${cy}`}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="2.2"
                            strokeDasharray="4 2"
                            opacity="0.85"
                          />
                        )}

                        {floorPlan.doors.filter(d => d.roomId === room.id).map((door) => {
                          const rx = room.x * scale;
                          const ry = room.y * scale;
                          const rw = room.width * scale;
                          const rh = room.height * scale;

                          let dx = rx + 20;
                          let dy = ry + 20;
                          if (door.wall === 'bottom') { dx = rx + door.offset * scale; dy = ry + rh - 15; }
                          else if (door.wall === 'right') { dx = rx + rw - 15; dy = ry + door.offset * scale; }
                          else if (door.wall === 'top') { dx = rx + door.offset * scale; dy = ry + 15; }
                          else { dx = rx + 15; dy = ry + door.offset * scale; }

                          return (
                            <g key={`door-conduit-${door.id}`}>
                              <path
                                d={`M ${cx} ${cy} Q ${(cx+dx)/2 - 10} ${(cy+dy)/2 - 10} ${dx} ${dy}`}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                                opacity="0.7"
                              />
                              <circle cx={dx} cy={dy} r="5" fill="#fef08a" stroke="#b45309" strokeWidth="1.2" />
                              <line x1={dx} y1={dy} x2={dx + 4} y2={dy - 4} stroke="#b45309" strokeWidth="1.2" />
                              <text x={dx + 7} y={dy - 4} className="text-[8px] font-black font-mono fill-amber-700">S_a</text>
                            </g>
                          );
                        })}

                        {/* Wall socket outlets */}
                        {(() => {
                          const rx = room.x * scale;
                          const ry = room.y * scale;
                          const rw = room.width * scale;
                          const rh = room.height * scale;
                          return [
                            { sx: rx + 15, sy: ry + (rh / 2), type: 'TUG' },
                            { sx: rx + rw - 15, sy: ry + (rh / 2), type: 'TUG' },
                            { sx: rx + (rw / 2), sy: ry + rh - 15, type: 'TUG' },
                          ];
                        })().map((sock, sIdx) => {
                          return (
                            <g key={`sock-${room.id}-${sIdx}`}>
                              <path
                                d={`M ${cx} ${cy} Q ${(cx+sock.sx)/2} ${(cy+sock.sy)/2 - 15} ${sock.sx} ${sock.sy}`}
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth="1.2"
                                strokeDasharray="2 3"
                                opacity="0.6"
                              />
                              <polygon points={`${sock.sx},${sock.sy - 4} ${sock.sx - 4},${sock.sy + 4} ${sock.sx + 4},${sock.sy + 4}`} fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
                              <line x1={sock.sx} y1={sock.sy + 4} x2={sock.sx} y2={sock.sy + 7} stroke="#ca8a04" strokeWidth="1.2" />
                              <text x={sock.sx + 6} y={sock.sy + 4} className="text-[7.5px] font-mono fill-amber-600 font-bold">100VA</text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}

                  {floorPlan.rooms.map((room) => {
                    const cx = (room.x + room.width / 2) * scale;
                    const cy = (room.y + room.height / 2) * scale;
                    const cCode = room.name.includes('Cozinha') || room.name.includes('Banheiro') ? 'Circ. 3' : 'Circ. 1';

                    return (
                      <g key={`elec-light-${room.id}`} pointerEvents="none">
                        <circle cx={cx} cy={cy} r="12" fill="#fef08a" fillOpacity="0.85" stroke="#ca8a04" strokeWidth="1.5" />
                        <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke="#ca8a04" strokeWidth="0.5" />
                        <line x1={cx} y1={cy - 12} x2={cx} y2={cy + 12} stroke="#ca8a04" strokeWidth="0.5" />
                        <text x={cx} y={cy - 15} textAnchor="middle" className="text-[8px] font-mono font-black fill-yellow-950">100W ({cCode})</text>
                      </g>
                    );
                  })}

                  {floorPlan.rooms.length > 0 && (() => {
                    const mainRoom = floorPlan.rooms[0];
                    const qdcX = (mainRoom.x + 0.3) * scale;
                    const qdcY = (mainRoom.y + 0.6) * scale;
                    return (
                      <g pointerEvents="none">
                        <rect x={qdcX - 10} y={qdcY - 6} width="22" height="12" fill="#1e293b" stroke="#000" strokeWidth="1.2" />
                        <path d={`M ${qdcX - 10} ${qdcY + 6} L ${qdcX + 12} ${qdcY - 6}`} stroke="white" strokeWidth="1" />
                        <polygon points={`${qdcX - 10},${qdcY - 6} ${qdcX + 12},${qdcY - 6} ${qdcX - 10},${qdcY + 6}`} fill="#000" />
                        <text x={qdcX} y={qdcY + 20} textAnchor="middle" className="text-[8px] font-bold font-mono fill-slate-900 bg-white px-1 shadow-xs">QDC - 127V/220V</text>
                      </g>
                    );
                  })()}
                </>
              )}

              {/* 5. HYDRAULIC OVERLAY PIPING (LAYER: HYDRAULIC) */}
              {activeLayer === 'hydraulic' && (
                <>
                  {floorPlan.rooms.map((room) => {
                    const rx = room.x * scale;
                    const ry = room.y * scale;

                    const isWetRoom = room.name.includes('Cozinha') || room.name.includes('Banheiro');
                    const riserX = rx + 15;
                    const riserY = ry + 15;

                    return (
                      <g key={`hydr-${room.id}`} pointerEvents="none">
                        {isWetRoom && (
                          <g>
                            <circle cx={riserX} cy={riserY} r="8" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
                            <circle cx={riserX} cy={riserY} r="2.5" fill="white" />
                            <text x={riserX + 10} y={riserY + 3} className="text-[8px] font-black fill-blue-700 font-mono">CAF (ø25)</text>

                            <circle cx={riserX + 15} cy={riserY + 15} r="8" fill="#a16207" stroke="#78350f" strokeWidth="1.5" />
                            <text x={riserX + 26} y={riserY + 18} className="text-[8px] font-black fill-amber-800 font-mono">CI (ø100)</text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {floorPlan.furniture.map((furn) => {
                    const room = floorPlan.rooms.find(r => r.id === furn.roomId);
                    if (!room) return null;

                    const fx = (room.x + furn.x) * scale;
                    const fy = (room.y + furn.y) * scale;
                    const fw = furn.width * scale;
                    const fh = furn.height * scale;

                    const isWetFixture = ['sink', 'toilet', 'shower', 'fridge'].includes(furn.type);
                    if (!isWetFixture) return null;

                    const connX = fx + fw / 2;
                    const connY = fy + fh / 2;

                    const rx = room.x * scale;
                    const ry = room.y * scale;
                    const colX = rx + 15;
                    const colY = ry + 15;

                    return (
                      <g key={`plumb-run-${furn.id}`} pointerEvents="none">
                        <path
                          d={`M ${colX} ${colY} L ${connX} ${colY} L ${connX} ${connY}`}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          opacity="0.85"
                        />
                        <circle cx={connX} cy={connY} r="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
                        <text x={connX - 10} y={connY - 8} className="text-[7.5px] font-bold font-mono fill-blue-800">ø20 AF</text>

                        <path
                          d={`M ${connX} ${connY} L ${connX} ${connY + 15} L ${colX + 15} ${colY + 15}`}
                          fill="none"
                          stroke="#9a3412"
                          strokeWidth="3"
                          strokeLinecap="round"
                          opacity="0.8"
                        />
                        <text x={connX + 8} y={connY + 12} className="text-[7.5px] font-bold font-mono fill-amber-800">
                          {furn.type === 'toilet' ? 'ø100 ESG (1%)' : 'ø40 ESG (2%)'}
                        </text>
                      </g>
                    );
                  })}

                  <g pointerEvents="none">
                    <circle cx={scale * 1.5} cy={scale * 10.5} r="14" fill="#15803d" stroke="#166534" strokeWidth="2" />
                    <circle cx={scale * 1.5} cy={scale * 10.5} r="9" fill="#22c55e" />
                    <line x1={scale * 1.5 - 14} y1={scale * 10.5} x2={scale * 1.5 + 14} y2={scale * 10.5} stroke="#166534" strokeWidth="1" />
                    <text x={scale * 1.5 + 18} y={scale * 10.5 + 3} className="text-[8px] font-bold fill-emerald-800 font-mono">Caixa de Gordura (CG ø400)</text>

                    <circle cx={scale * 4.2} cy={scale * 10.5} r="14" fill="#ca8a04" stroke="#a16207" strokeWidth="2" />
                    <circle cx={scale * 4.2} cy={scale * 10.5} r="9" fill="#facc15" />
                    <line x1={scale * 4.2 - 14} y1={scale * 10.5} x2={scale * 4.2 + 14} y2={scale * 10.5} stroke="#a16207" strokeWidth="1" />
                    <text x={scale * 4.2 + 18} y={scale * 10.5 + 3} className="text-[8px] font-bold fill-amber-700 font-mono">Caixa de Inspeção (CI ø600)</text>
                  </g>
                </>
              )}

              {/* 6. STRUCTURAL OVERLAY BEAMS & PILLARS (LAYER: STRUCTURAL) */}
              {activeLayer === 'structural' && (
                <>
                  {floorPlan.rooms.map((room) => {
                    const rx = room.x * scale;
                    const ry = room.y * scale;
                    const rw = room.width * scale;
                    const rh = room.height * scale;

                    const corners = [
                      { px: rx, py: ry, code: 'P1' },
                      { px: rx + rw, py: ry, code: 'P2' },
                      { px: rx + rw, py: ry + rh, code: 'P3' },
                      { px: rx, py: ry + rh, code: 'P4' },
                    ];

                    return (
                      <g key={`struct-g-${room.id}`} pointerEvents="none">
                        <rect
                          x={rx}
                          y={ry}
                          width={rw}
                          height={rh}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3.2"
                          strokeDasharray="6 3"
                          opacity="0.85"
                        />
                        <text x={rx + rw / 2} y={ry - 6} textAnchor="middle" className="text-[8.5px] font-black font-mono fill-red-700">Viga V1 (15x30cm)</text>
                        <text x={rx - 10} y={ry + rh / 2} textAnchor="middle" transform={`rotate(-90, ${rx - 10}, ${ry + rh / 2})`} className="text-[8.5px] font-black font-mono fill-red-700">Viga V2 (15x30cm)</text>

                        {/* Slab direction arrows */}
                        <path
                          d={`M ${rx + rw/2 - 25} ${ry + rh/2} L ${rx + rw/2 + 25} ${ry + rh/2}`}
                          stroke="#b91c1c"
                          strokeWidth="2"
                          opacity="0.75"
                        />
                        <polygon points={`${rx + rw/2 - 25},${ry + rh/2} ${rx + rw/2 - 20},${ry + rh/2 - 4} ${rx + rw/2 - 20},${ry + rh/2 + 4}`} fill="#b91c1c" />
                        <polygon points={`${rx + rw/2 + 25},${ry + rh/2} ${rx + rw/2 + 20},${ry + rh/2 - 4} ${rx + rw/2 + 20},${ry + rh/2 + 4}`} fill="#b91c1c" />
                        
                        <text x={rx + rw/2} y={ry + rh/2 + 20} textAnchor="middle" className="text-[8.5px] font-black fill-red-800 font-mono">Laje Unidirecional h=12cm</text>
                        <text x={rx + rw/2} y={ry + rh/2 + 30} textAnchor="middle" className="text-[8px] font-bold fill-red-600 font-mono">Carga de Projeto: 1.5 kN/m²</text>

                        {corners.map((cor, cIdx) => {
                          const idCode = `${room.id}-${cor.code}-${cIdx}`;
                          return (
                            <g key={idCode}>
                              <rect
                                x={cor.px - 7}
                                y={cor.py - 7}
                                width="14"
                                height="14"
                                fill="url(#hatch-pattern)"
                                stroke="#111827"
                                strokeWidth="2"
                              />
                              <text x={cor.px + 10} y={cor.py - 10} className="text-[7.5px] font-black font-mono fill-slate-900 bg-white border border-slate-300 px-0.5 shadow-xs">
                                {cor.code} (15x20)
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </>
              )}

              {/* 7. GENERAL FURNITURE RENDERS */}
              {floorPlan.furniture.map((furniture) => {
                const room = floorPlan.rooms.find((r) => r.id === furniture.roomId);
                if (!room) return null;

                const fx = (room.x + furniture.x) * scale;
                const fy = (room.y + furniture.y) * scale;
                const fw = furniture.width * scale;
                const fh = furniture.height * scale;
                const isSelected = selectedFurniture?.id === furniture.id;

                const isElectrical = ['socket', 'switch', 'light', 'qdc'].includes(furniture.type);
                const isHydraulic = ['sink', 'toilet', 'shower', 'caixa_insp'].includes(furniture.type);
                const isStructural = ['pilar', 'viga'].includes(furniture.type);
                const isArchitectural = !isElectrical && !isHydraulic && !isStructural;

                const isPrimaryForLayer = 
                  (activeLayer === 'architectural' && isArchitectural) ||
                  (activeLayer === 'electrical' && isElectrical) ||
                  (activeLayer === 'hydraulic' && isHydraulic) ||
                  (activeLayer === 'structural' && isStructural);

                if (!isPrimaryForLayer) {
                  // Render a clean background overlay guide that is passive so the user has references
                  return (
                    <g key={`passive-${furniture.id}`} transform={`translate(${fx}, ${fy})`} pointerEvents="none" opacity="0.12">
                      <g transform={`rotate(${furniture.rotation}, ${fw / 2}, ${fh / 2})`}>
                        <rect
                          x="0"
                          y="0"
                          width={fw}
                          height={fh}
                          rx="2"
                          fill="none"
                          stroke={isElectrical ? '#b45309' : isHydraulic ? '#2563eb' : isStructural ? '#e11d48' : '#475569'}
                          strokeWidth="0.8"
                          strokeDasharray="3 3"
                        />
                      </g>
                    </g>
                  );
                }

                return (
                  <g 
                    key={furniture.id} 
                    transform={`translate(${fx}, ${fy})`}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <g 
                      transform={`rotate(${furniture.rotation}, ${fw / 2}, ${fh / 2})`}
                      onPointerDown={(e) => handlePointerDown(e, 'furniture', furniture.id, furniture.x, furniture.y)}
                    >
                      {/* Architectural elements are styled originally, whereas special BIM nodes get styled realistically */}
                      {isArchitectural ? (
                        <rect
                          x="0"
                          y="0"
                          width={fw}
                          height={fh}
                          rx="4"
                          fill={
                            furniture.type === 'couch' ? '#fed7aa' :
                            furniture.type === 'bed' ? '#fbcfe8' :
                            furniture.type === 'table' ? '#e5e7eb' :
                            furniture.type === 'fridge' || furniture.type === 'stove' ? '#cbd5e1' :
                            '#d9f99d'
                          }
                          stroke={isSelected ? '#2563eb' : '#334155'}
                          strokeWidth={isSelected ? '2.5' : '1.2'}
                        />
                      ) : (
                        /* Special installation nodes (BIM) style according to standards */
                        <rect
                          x="0"
                          y="0"
                          width={fw}
                          height={fh}
                          rx="2"
                          fill={
                            furniture.type === 'light' ? '#fef08a' :
                            furniture.type === 'qdc' ? '#1e293b' :
                            furniture.type === 'pilar' ? 'url(#hatch-pattern)' :
                            furniture.type === 'viga' ? '#ffe4e6' :
                            furniture.type === 'caixa_insp' ? '#fed7aa' :
                            furniture.type === 'shower' ? '#ccfbf1' :
                            furniture.type === 'toilet' ? '#f3e8ff' :
                            furniture.type === 'sink' ? '#e0f2fe' :
                            '#fef08a'
                          }
                          stroke={
                            isSelected ? '#3b82f6' :
                            isElectrical ? '#ca8a04' :
                            isHydraulic ? '#0284c7' :
                            isStructural ? '#b91c1c' :
                            '#2563eb'
                          }
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                        />
                      )}

                      {/* Custom inner schematic designs for real architectural/engineering feel */}
                      {furniture.type === 'couch' && (
                        <g opacity="0.4" pointerEvents="none">
                          <rect x="3" y="3" width={fw - 6} height={fh - 10} fill="none" stroke="#6b21a8" strokeWidth="0.5" />
                          <line x1={fw / 2} y1="3" x2={fw / 2} y2={fh - 7} stroke="#6b21a8" strokeWidth="0.5" />
                        </g>
                      )}
                      {furniture.type === 'bed' && (
                        <g opacity="0.4" pointerEvents="none">
                          <rect x="2" y="2" width={fw - 4} height={fh / 3} fill="#f472b6" />
                          <circle cx={fw/4} cy={fh/6} r="3" fill="white" />
                          <circle cx={(3*fw)/4} cy={fh/6} r="3" fill="white" />
                        </g>
                      )}

                      {/* Special NBR 5410 vectors */}
                      {furniture.type === 'light' && (
                        <g opacity="0.85" pointerEvents="none">
                          <line x1={fw/2 - 12} y1={fh/2} x2={fw/2 + 12} y2={fh/2} stroke="#ca8a04" strokeWidth="1" />
                          <line x1={fw/2} y1={fh/2 - 12} x2={fw/2} y2={fh/2 + 12} stroke="#ca8a04" strokeWidth="1" />
                        </g>
                      )}
                      {furniture.type === 'socket' && (
                        <g opacity="0.9" pointerEvents="none" transform={`translate(${fw/2}, ${fh/2}) scale(0.9)`}>
                          <polygon points="0,-7 -7,5 7,5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
                          <line x1="0" y1="5" x2="0" y2="9" stroke="#ca8a04" strokeWidth="1.2" />
                        </g>
                      )}
                      {furniture.type === 'switch' && (
                        <g opacity="0.9" pointerEvents="none" transform={`translate(${fw/2}, ${fh/2}) scale(0.9)`}>
                          <circle cx="0" cy="0" r="5" fill="#ecfdf5" stroke="#059669" strokeWidth="1.2" />
                          <text x="-2" y="2.5" className="text-[6.5px] font-black fill-emerald-800">S</text>
                        </g>
                      )}
                      {furniture.type === 'qdc' && (
                        <g opacity="0.95" pointerEvents="none">
                          <polygon points={`0,0 ${fw},0 0,${fh}`} fill="#0f172a" />
                        </g>
                      )}

                      {/* Special structural concrete hatching visuals */}
                      {furniture.type === 'pilar' && (
                        <g pointerEvents="none">
                          <text x={fw / 2} y={fh / 2 + 2} textAnchor="middle" className="text-[7.5px] font-black fill-white bg-black">P</text>
                        </g>
                      )}
                      {furniture.type === 'viga' && (
                        <g opacity="0.3" pointerEvents="none">
                          <line x1="0" y1="0" x2={fw} y2={fh} stroke="#b91c1c" strokeWidth="1" />
                          <line x1={fw} y1="0" x2="0" y2={fh} stroke="#b91c1c" strokeWidth="1" />
                        </g>
                      )}

                      {/* Text node designation */}
                      <text
                        x={fw / 2}
                        y={fh / 2 + 3}
                        textAnchor="middle"
                        className={`text-[8.5px] pointer-events-none font-semibold ${
                          furniture.type === 'qdc' ? 'fill-slate-100' : 'fill-slate-800'
                        }`}
                        pointerEvents="none"
                        transform={`rotate(${-furniture.rotation}, ${fw / 2}, ${fh / 2})`}
                      >
                        {furniture.type === 'light' ? '💡 Luz' :
                         furniture.type === 'socket' ? '🔌 TUG' :
                         furniture.type === 'switch' ? '🎛️ S' :
                         furniture.type === 'qdc' ? 'QDC' :
                         furniture.type === 'pilar' ? 'Pilar' :
                         furniture.type === 'viga' ? 'Viga' :
                         furniture.name}
                      </text>
                    </g>

                    {isSelected && (
                      <g transform={`translate(${fw + 4}, 0)`}>
                        <circle
                          cx="10"
                          cy="10"
                          r="10"
                          className="fill-yellow-500 hover:fill-yellow-600 cursor-pointer stroke-white stroke-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRotateFurniture(furniture.id);
                          }}
                        />
                        <g pointerEvents="none" transform="translate(4,4) scale(0.4)">
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          <path d="M3 3v5h5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </g>

                        <circle
                          cx="10"
                          cy="32"
                          r="10"
                          className="fill-red-500 hover:fill-red-600 cursor-pointer stroke-white stroke-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFurniture(furniture.id);
                            onSelectFurniture(null);
                          }}
                        />
                        <g pointerEvents="none" transform="translate(4,26) scale(0.41)">
                          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                        </g>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* HIGH-TECH ENGINEERING CALCULATIONS PANEL (MEMORIAL DE CÁLCULO) */}
        <div className="w-full lg:w-80 bg-slate-950 p-4 shrink-0 flex flex-col gap-4 text-xs overflow-y-auto text-slate-300 font-sans border-t lg:border-t-0 lg:border-l border-slate-800">
          
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 font-bold" />
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Memorial de Cálculo</h3>
              <p className="text-[9px] text-slate-500 font-mono">BIM & Normas de Engenharia ABNT</p>
            </div>
          </div>

          {activeLayer === 'architectural' && (
            <div className="space-y-4">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Métrica de Compartimentos</span>
              <div className="space-y-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Lista de áreas e dimensões limpas para checar as normas de conforto lumínico e térmico das divisões:
                </p>
                <div className="space-y-1.5 pt-1.5">
                  {floorPlan.rooms.map(room => (
                    <div key={`cal-arch-${room.id}`} className="flex justify-between items-center text-[10.5px] font-mono border-b border-slate-800/40 pb-1">
                      <span className="text-slate-400 font-semibold">{room.name}</span>
                      <span className="text-white font-bold">{(room.width * room.height).toFixed(2)} m²</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-emerald-400 pt-1.5">
                    <span>Área Total</span>
                    <span>{floorPlan.rooms.reduce((s, r) => s + r.width * r.height, 0).toFixed(2)} m²</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg space-y-1">
                <h4 className="font-bold text-blue-300 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" /> Cubagem de Paredes
                </h4>
                <p className="text-[10px] text-slate-405 leading-normal text-slate-400">
                  Paredes calculadas a pé direito padrão de 2,80m. Alvenaria de vedação estimada em tijolos cerâmicos normativos de alto isolamento térmico e acústico.
                </p>
              </div>
            </div>
          )}

          {activeLayer === 'electrical' && (() => {
            let totalLightingPowerVal = 0;
            let socketTugCount = 0;

            floorPlan.rooms.forEach(room => {
              const area = room.width * room.height;
              let rPow = 100;
              if (area > 6) {
                rPow += Math.floor((area - 6) / 4) * 60;
              }
              totalLightingPowerVal += rPow;

              const perimeter = 2 * (room.width + room.height);
              const isKitchenOrBath = room.name.includes('Cozinha') || room.name.includes('Banheiro');
              const specSockets = isKitchenOrBath ? Math.ceil(perimeter / 3.5) : Math.ceil(perimeter / 5);
              socketTugCount += specSockets;
            });

            const hasShower = floorPlan.furniture.some(f => f.type === 'shower');
            const tuePower = (hasShower ? 7500 : 0) + 2000;

            return (
              <div className="space-y-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Auditoria NBR 5410</span>
                
                <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Potência Iluminação:</span>
                    <span className="text-yellow-400 font-bold">{totalLightingPowerVal} VA</span>
                  </div>
                  <div className="flex justify-between text-[11px] border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Tomadas Gerais (TUG):</span>
                    <span className="text-yellow-400 font-bold">{socketTugCount} tomadas</span>
                  </div>
                  
                  <div className="flex justify-between text-[11px] pt-1.5">
                    <span className="text-slate-400">Carga Especial (TUE):</span>
                    <span className="text-white font-bold">{tuePower} W</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-400 font-bold pt-1.5 border-t border-slate-800">
                    <span>Instalada Demanda:</span>
                    <span>{((totalLightingPowerVal * 0.9 + socketTugCount * 100 + tuePower) / 1000).toFixed(2)} kVA</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-mono">Quadro de Circuitos (QDC)</span>
                  <div className="text-[10px] space-y-1 font-mono">
                    <div className="p-1.5 bg-slate-900 rounded border-l-2 border-yellow-500 flex justify-between">
                      <span>#1 - Iluminação Geral</span>
                      <span className="text-slate-400">1.5mm² • 10A</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded border-l-2 border-yellow-500 flex justify-between">
                      <span>#2 - Tomadas Comuns</span>
                      <span className="text-slate-400">2.5mm² • 16A</span>
                    </div>
                    <div className="p-1.5 bg-slate-900 rounded border-l-2 border-yellow-500 flex justify-between">
                      <span>#3 - Tomadas de Cozinha</span>
                      <span className="text-slate-400">2.5mm² • 20A</span>
                    </div>
                    {hasShower && (
                      <div className="p-1.5 bg-slate-950 rounded border-l-2 border-rose-500 flex justify-between">
                        <span>#4 - Chuveiro (TUE)</span>
                        <span className="text-rose-400 font-bold">6.0mm² • 40A</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {activeLayer === 'hydraulic' && (() => {
            const sinksCount = floorPlan.furniture.filter(f => f.type === 'sink').length;
            const toiletCount = floorPlan.furniture.filter(f => f.type === 'toilet').length;
            const showerCount = floorPlan.furniture.filter(f => f.type === 'shower').length;

            const totalUhp = (sinksCount * 1.0) + (toiletCount * 0.3) + (showerCount * 2.0);
            const reserveLiters = totalUhp > 0 ? 1000 : 0;

            return (
              <div className="space-y-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Vazão NBR 5626</span>
                
                <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Pontos Hidráulicos:</span>
                    <span className="text-sky-400 font-bold">{sinksCount + toiletCount + showerCount} conexões</span>
                  </div>
                  <div className="flex justify-between text-[11px] border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Contribuição (Peso UHP):</span>
                    <span className="text-sky-400 font-bold">{totalUhp.toFixed(1)} UHP</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1.5">
                    <span className="text-slate-400">Vazão Estimada Barrilete:</span>
                    <span className="text-white font-bold">{(0.3 * Math.sqrt(totalUhp || 1)).toFixed(2)} L/s</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-sky-400 font-bold pt-1.5 border-t border-slate-800">
                    <span>Reservatório Solicitado:</span>
                    <span>{reserveLiters} Litros</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block font-mono">Seções de Tubulações (PVC)</span>
                  <div className="text-[10px] space-y-1 font-mono text-slate-400">
                    <p className="flex justify-between p-1 bg-slate-900 rounded">
                      <span>Alimentação Geral:</span> <strong className="text-white">ø25 mm</strong>
                    </p>
                    <p className="flex justify-between p-1 bg-slate-900 rounded">
                      <span>Bacia Sanitária:</span> <strong className="text-white">ø100 mm</strong>
                    </p>
                    <p className="flex justify-between p-1 bg-slate-900 rounded">
                      <span>Ralos e Lavatórios:</span> <strong className="text-white">ø40 mm</strong>
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeLayer === 'structural' && (() => {
            const totalArea = floorPlan.rooms.reduce((s, r) => s + r.width * r.height, 0);
            const rawColCount = floorPlan.rooms.length * 4;
            const estimatedColumns = Math.max(4, Math.round(rawColCount * 0.7));

            const slabConcrete = totalArea * 0.12;
            const colConcrete = estimatedColumns * (0.15 * 0.20 * 2.80);
            
            let perimeterMeters = 0;
            floorPlan.rooms.forEach(r => { perimeterMeters += 2 * (r.width + r.height); });
            const beamConcrete = (perimeterMeters * 0.70) * (0.15 * 0.30);
            
            const totalConcrete = slabConcrete + colConcrete + beamConcrete;
            const steelSizing = totalConcrete * 85;

            return (
              <div className="space-y-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Dimensionamento de Carga</span>
                
                <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Laje de Cobertura:</span>
                    <span className="text-rose-400 font-bold">{totalArea.toFixed(1)} m²</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Pilares Necessários:</span>
                    <span className="text-rose-400 font-bold">{estimatedColumns} Unidades</span>
                  </div>
                  <div className="flex justify-between text-[11px] border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Estimativa Armadura Aço:</span>
                    <span className="text-rose-400 font-bold">{steelSizing.toFixed(0)} kg</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-400 font-bold pt-1.5">
                    <span>Cubagem Total Concreto:</span>
                    <span>{totalConcrete.toFixed(2)} m³</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg space-y-1 text-slate-400">
                  <p className="font-bold text-rose-300">Normativa NBR 6118 / ABNT</p>
                  <p className="text-[9px] leading-relaxed">
                    Resistência Mínima do Concreto (Fck): <strong>30 MPa</strong>. Estrutura dimensionada para sapatas ancoradas em profundidade adequada de solo firme.
                  </p>
                </div>
              </div>
            );
          })()}

        </div>

      </div>

    </div>
  );
}
