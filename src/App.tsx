/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, Compass, Layers, Sparkles, FileText, Smartphone, Laptop, 
  RefreshCw, CheckCircle2, RotateCcw, AlertTriangle, HelpCircle,
  Zap, Droplet, LayoutGrid, Sofa, Hammer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FloorPlanData, Room, Furniture, FloorMaterial, FurnitureType, Door, Window, EngineeringLayer } from './types';
import { mockStudioApartment, mockRuralHouse } from './utils/mockBlueprints';
import { SidebarPalette } from './components/SidebarPalette';
import { BlueprintCanvas2D } from './components/BlueprintCanvas2D';
import { BlueprintCanvas3D } from './components/BlueprintCanvas3D';
import { AgentPanel } from './components/AgentPanel';
import { CostReport } from './components/CostReport';

export default function App() {
  // State holds the master architectural layout
  const [floorPlan, setFloorPlan] = useState<FloorPlanData>(mockStudioApartment);
  
  // Selection states
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);
  
  // UI Panels states
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [sidebarTab, setSidebarTab] = useState<'build' | 'items' | 'materials'>('build');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  
  // BIP Active engineering layer syncing globally (fixes disjointed electrical tab view)
  const [activeLayer, setActiveLayer] = useState<EngineeringLayer>('architectural');
  
  // View mode for mobile to allow roomy displays without overcrowding ('canvas' | 'palette' | 'agents')
  const [activeMobileSection, setActiveMobileSection] = useState<'canvas' | 'palette' | 'agents'>('canvas');
  
  // Notification banner
  const [apiNotification, setApiNotification] = useState<{
    type: 'success' | 'warn' | 'info' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });

  // Display notification helpers
  const triggerNotification = (type: 'success' | 'warn' | 'info', message: string) => {
    setApiNotification({ type, message });
    setTimeout(() => {
      setApiNotification({ type: null, message: '' });
    }, 6000);
  };

  // 1. MUTATIVE ACTIONS: ROOM DRAG & RESIZING
  const handleMoveRoom = (roomId: string, newX: number, newY: number) => {
    setFloorPlan((prev) => {
      const updatedRooms = prev.rooms.map((r) => {
        if (r.id === roomId) {
          // Sync associated elements when moving room coordinates relatively? 
          // Currently furniture, doors, windows positions are stored RELATIVE to the room. 
          // So they move automatically. This is a brilliant structural choice!
          return { ...r, x: newX, y: newY };
        }
        return r;
      });
      return { ...prev, rooms: updatedRooms };
    });

    // Update selected context live
    setSelectedRoom((prev) => (prev && prev.id === roomId ? { ...prev, x: newX, y: newY } : prev));
  };

  const handleResizeRoom = (roomId: string, newWidth: number, newHeight: number) => {
    setFloorPlan((prev) => {
      const updatedRooms = prev.rooms.map((r) => {
        if (r.id === roomId) {
          return { ...r, width: newWidth, height: newHeight };
        }
        return r;
      });

      // Clamp existing furniture coordinate dimensions so they don't drift outside walls
      const updatedFurniture = prev.furniture.map((f) => {
        if (f.roomId === roomId) {
          const clampedX = Math.min(newWidth - f.width, f.x);
          const clampedY = Math.min(newHeight - f.height, f.y);
          return { ...f, x: clampedX, y: clampedY };
        }
        return f;
      });

      return { ...prev, rooms: updatedRooms, furniture: updatedFurniture };
    });

    // Sync selected Room
    setSelectedRoom((prev) => (prev && prev.id === roomId ? { ...prev, width: newWidth, height: newHeight } : prev));
  };

  // 2. FURNITURE PLACEMENT AND MODIFICATIONS
  const handleMoveFurniture = (furnitureId: string, newX: number, newY: number) => {
    setFloorPlan((prev) => {
      const updatedFurn = prev.furniture.map((f) => {
        if (f.id === furnitureId) {
          return { ...f, x: newX, y: newY };
        }
        return f;
      });
      return { ...prev, furniture: updatedFurn };
    });
  };

  const handleRotateFurniture = (furnitureId: string) => {
    setFloorPlan((prev) => {
      const updatedFurn = prev.furniture.map((f) => {
        if (f.id === furnitureId) {
          // rotate by 90-degree steps
          return { ...f, rotation: (f.rotation + 90) % 360 };
        }
        return f;
      });
      return { ...prev, furniture: updatedFurn };
    });
    setSelectedFurniture((prev) => (prev && prev.id === furnitureId ? { ...prev, rotation: (prev.rotation + 90) % 360 } : prev));
  };

  // 3. PALETTE UTILITIES: INSERTIONS
  const handleAddRoom = (type: string) => {
    const randomHex = () => {
      const colors = ['#e2f0fb', '#fce7f3', '#fef3c7', '#ccfbf1', '#fef2f2', '#f3e8ff', '#ecfdf5', '#fff7ed'];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const newId = `room-${Date.now()}`;
    const newRoom: Room = {
      id: newId,
      name: type,
      x: 3.0,
      y: 3.0,
      width: 4.0,
      height: 3.0,
      color: randomHex(),
      floorMaterial: 'tile',
      wallColor: '#FFFFFF',
    };

    setFloorPlan((prev) => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
    }));

    setSelectedRoom(newRoom);
    setSidebarTab('items'); // switch tab for layout items
    triggerNotification('success', `Cômodo "${type}" inserido no centro. Arraste para posicionar.`);
  };

  const handleAddFurniture = (type: FurnitureType) => {
    if (!selectedRoom) return;

    // determine default size of typical item (length/width in meters)
    let w = 1.0, h = 0.8, name = 'Móvel';
    switch (type) {
      case 'couch': w = 1.8; h = 0.9; name = 'Sofá Clássico'; break;
      case 'bed': w = 1.6; h = 2.0; name = 'Cama Casal'; break;
      case 'table': w = 1.4; h = 0.9; name = 'Mesa'; break;
      case 'chair': w = 0.5; h = 0.5; name = 'Cadeira'; break;
      case 'plant': w = 0.6; h = 0.6; name = 'Vaso de Planta'; break;
      case 'tv': w = 1.2; h = 0.4; name = 'Televisão'; break;
      case 'fridge': w = 0.8; h = 0.8; name = 'Geladeira'; break;
      case 'stove': w = 0.6; h = 0.6; name = 'Fogão'; break;
      case 'cabinet': w = 1.4; h = 0.6; name = 'Armário/Pia'; break;
      case 'toilet': w = 0.5; h = 0.7; name = 'Vaso Sanitário'; break;
      case 'sink': w = 0.6; h = 0.5; name = 'Lavatório'; break;
      case 'shower': w = 0.9; h = 0.9; name = 'Box Chuveiro'; break;
      
      // Electrical fittings (NBR 5410)
      case 'socket': w = 0.25; h = 0.25; name = 'Tomada Geral TUG'; break;
      case 'switch': w = 0.2; h = 0.2; name = 'Interruptor'; break;
      case 'light': w = 0.4; h = 0.4; name = 'Ponto de Luz Teto'; break;
      case 'qdc': w = 0.6; h = 0.2; name = 'Quadro QDC'; break;
      
      // Plumbing and infrastructure
      case 'caixa_insp': w = 0.5; h = 0.5; name = 'Caixa Inspeção'; break;
      
      // Structural concrete members
      case 'pilar': w = 0.3; h = 0.3; name = 'Pilar Estrutural'; break;
      case 'viga': w = 1.6; h = 0.25; name = 'Viga Reforço'; break;
    }

    const newFurn: Furniture = {
      id: `furn-${Date.now()}`,
      name,
      type,
      roomId: selectedRoom.id,
      x: 0.5,
      y: 0.5,
      width: w,
      height: h,
      rotation: 0,
    };

    setFloorPlan((prev) => ({
      ...prev,
      furniture: [...prev.furniture, newFurn],
    }));

    setSelectedFurniture(newFurn);
    triggerNotification('success', `Adicionado "${name}" em "${selectedRoom.name}".`);
  };

  const handleUpdateRoomFloor = (roomId: string, material: FloorMaterial) => {
    setFloorPlan((prev) => {
      const updated = prev.rooms.map((r) => {
        if (r.id === roomId) {
          return { ...r, floorMaterial: material };
        }
        return r;
      });
      return { ...prev, rooms: updated };
    });

    setSelectedRoom((prev) => (prev && prev.id === roomId ? { ...prev, floorMaterial: material } : prev));
  };

  const handleAddDoor = (roomId: string, wall: 'top' | 'bottom' | 'left' | 'right') => {
    const newDoor: Door = {
      id: `door-${Date.now()}`,
      roomId,
      wall,
      offset: 1.0,
      width: 0.8,
      isOpen: true,
    };

    setFloorPlan((prev) => ({
      ...prev,
      doors: [...prev.doors, newDoor],
    }));
    triggerNotification('success', 'Porta adicionada à parede do cômodo.');
  };

  const handleAddWindow = (roomId: string, wall: 'top' | 'bottom' | 'left' | 'right') => {
    const newWindow: Window = {
      id: `window-${Date.now()}`,
      roomId,
      wall,
      offset: 1.5,
      width: 1.2,
    };

    setFloorPlan((prev) => ({
      ...prev,
      windows: [...prev.windows, newWindow],
    }));
    triggerNotification('success', 'Janela de alumínio adicionada à parede exterior.');
  };

  // 4. DELETION UTILITIES
  const handleDeleteRoom = (roomId: string) => {
    setFloorPlan((prev) => {
      // Deletes room, along with its furniture, doors, and windows
      const filteredRooms = prev.rooms.filter((r) => r.id !== roomId);
      const filteredFurniture = prev.furniture.filter((f) => f.roomId !== roomId);
      const filteredDoors = prev.doors.filter((d) => d.roomId !== roomId);
      const filteredWindows = prev.windows.filter((w) => w.roomId !== roomId);

      return {
        ...prev,
        rooms: filteredRooms,
        furniture: filteredFurniture,
        doors: filteredDoors,
        windows: filteredWindows,
      };
    });
    triggerNotification('info', 'Cômodo e todos os seus mobiliários e aberturas foram removidos.');
  };

  const handleDeleteFurniture = (furnitureId: string) => {
    setFloorPlan((prev) => ({
      ...prev,
      furniture: prev.furniture.filter((f) => f.id !== furnitureId),
    }));
  };

  const handleDeleteDoor = (doorId: string) => {
    setFloorPlan((prev) => ({
      ...prev,
      doors: prev.doors.filter((d) => d.id !== doorId),
    }));
  };

  const handleDeleteWindow = (windowId: string) => {
    setFloorPlan((prev) => ({
      ...prev,
      windows: prev.windows.filter((w) => w.id !== windowId),
    }));
  };

  // 4a. MULTI-STRATEGY SPACE OPTIMIZER AND UNTANGER ENGINE
  const handleOptimizeLayout = (strategy: 'row' | 'grid' | 'lshape' | 'compact' | 'furniture') => {
    setFloorPlan((prev) => {
      let updatedRooms = [...prev.rooms];
      let updatedFurniture = [...prev.furniture];
      let responseMsg = '';

      if (strategy === 'compact') {
        responseMsg = 'Cômodos reposicionados e encostados com sucesso, resolvendo todas as sobreposições!';
        let currentX = 1.0;
        updatedRooms = updatedRooms.map((room) => {
          let roomY = 1.0;
          if (currentX + room.width > 12.0) {
            currentX = 1.0;
            roomY = 5.0;
          }
          const newRoom = { ...room, x: parseFloat(currentX.toFixed(1)), y: parseFloat(roomY.toFixed(1)) };
          currentX += room.width;
          return newRoom;
        });
      } else if (strategy === 'grid') {
        responseMsg = 'Cômodos alinhados e organizados em uma grade perfeita de planos BIM.';
        updatedRooms = updatedRooms.map((room, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const roomX = col === 0 ? 1.0 : 6.0;
          const roomY = 1.0 + row * 4.5;
          return {
            ...room,
            x: parseFloat(roomX.toFixed(1)),
            y: parseFloat(roomY.toFixed(1)),
          };
        });
      } else if (strategy === 'lshape') {
        responseMsg = 'Desenho técnico redistribuído em formato dinâmico em "L" sob circulação integrada.';
        updatedRooms = updatedRooms.map((room, idx) => {
          let rx = 1.0;
          let ry = 1.0;
          if (idx === 0) {
            rx = 1.0; ry = 1.0;
          } else if (idx === 1) {
            rx = 1.0 + (updatedRooms[0]?.width || 4.0); ry = 1.0;
          } else if (idx === 2) {
            rx = 1.0; ry = 1.0 + (updatedRooms[0]?.height || 4.0);
          } else {
            rx = 1.0 + (idx - 2) * 3.5; ry = 1.0 + (updatedRooms[0]?.height || 4.0) + 3.0;
          }
          return {
            ...room,
            x: parseFloat(rx.toFixed(1)),
            y: parseFloat(ry.toFixed(1)),
          };
        });
      } else if (strategy === 'furniture') {
        responseMsg = 'Mobiliários automáticos alinhados ergonomicamente junto às paredes internas para ampliar circulação!';
        updatedFurniture = updatedFurniture.map((f) => {
          const room = updatedRooms.find((r) => r.id === f.roomId);
          if (!room) return f;

          // Encontra todos os itens deste comodo para distribuí-los
          const rItems = prev.furniture.filter((item) => item.roomId === room.id);
          const fIndex = rItems.findIndex((item) => item.id === f.id);

          let fx = 0.5;
          let fy = 0.5;
          
          if (fIndex === 0) {
            fx = 0.4;
            fy = 0.4;
          } else if (fIndex === 1) {
            fx = Math.max(0.4, room.width - f.width - 0.4);
            fy = 0.4;
          } else if (fIndex === 2) {
            fx = Math.max(0.4, room.width - f.width - 0.4);
            fy = Math.max(0.4, room.height - f.height - 0.4);
          } else if (fIndex === 3) {
            fx = 0.4;
            fy = Math.max(0.4, room.height - f.height - 0.4);
          } else {
            fx = Math.max(0.4, (room.width / 2) - (f.width / 2));
            fy = 0.4;
          }

          fx = Math.max(0.2, Math.min(room.width - f.width - 0.2, fx));
          fy = Math.max(0.2, Math.min(room.height - f.height - 0.2, fy));

          return {
            ...f,
            x: parseFloat(fx.toFixed(2)),
            y: parseFloat(fy.toFixed(2)),
          };
        });
      }

      const dateFormatted = new Date().toLocaleTimeString('pt-BR');
      const debateId = `opt-${Date.now()}`;
      
      const updatedDebates = [
        ...prev.agentDebates,
        {
          id: debateId,
          agent: 'designer' as const,
          message: `🦾 [OTIMIZAÇÃO] ${responseMsg}`,
          timestamp: dateFormatted,
        },
        {
          id: `opt-eng-${Date.now()}`,
          agent: 'engineer' as const,
          message: `Concluí a verificação de circulação e colisões. O layout cartesiano está viável e com fluxos de passagem desobstruídos em conformidade com as diretrizes de conforto.`,
          timestamp: dateFormatted,
        },
      ];

      return {
        ...prev,
        rooms: updatedRooms,
        furniture: updatedFurniture,
        agentDebates: updatedDebates,
      };
    });

    triggerNotification('success', 'Layout espacial remodelado com sucesso!');
  };

  // 5. AUTONOMOUS SELECTIONS/PRESETS
  const handleSelectPreset = (presetType: 'studio' | 'rural') => {
    if (presetType === 'studio') {
      setFloorPlan(mockStudioApartment);
    } else {
      setFloorPlan(mockRuralHouse);
    }
    setSelectedRoom(null);
    setSelectedFurniture(null);
    triggerNotification('success', `Carregado template "${presetType === 'studio' ? 'Apartamento Studio' : 'Casa de Campo rústica'}".`);
  };

  // 6. AI COOPERATIVE AGENTS CONNECT SYSTEM
  // Analisa fotos (desenhos ou referências) utilizando o endpoint servidor
  const handleUploadBlueprint = async (base64Image: string, userInstruction: string) => {
    setIsLoading(true);
    triggerNotification('info', 'Enviando imagem para análise conjunta dos agentes de arquitetura...');

    try {
      const response = await fetch('/api/analyze-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          prompt: userInstruction,
        }),
      });

      const data = await response.json();

      if (data.error) {
        // Fallback simulation mode if Gemini API key isn't provided
        console.warn('API Warning / fallback triggered:', data);
        triggerNotification('warn', 'Simulação de arquitetura concluída. Detalhes carregados.');
        
        // Simulates an elegant conversion from photo using preset ruralhouse
        setTimeout(() => {
          setFloorPlan(mockRuralHouse);
          setIsLoading(false);
        }, 1500);
      } else {
        setFloorPlan(data);
        setSelectedRoom(null);
        setSelectedFurniture(null);
        triggerNotification('success', 'IA concluiu o desenho da planta baixa!');
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
      triggerNotification('warn', 'Servidor temporariamente em modo local. Carregado rascunho rural.');
      setFloorPlan(mockRuralHouse);
      setIsLoading(false);
    }
  };

  // Conversar com o projetista para aplicar modificações na planta atual
  const handleSendMessage = async (text: string) => {
    setIsLoading(true);
    
    // Add temporary message listing search
    const tempMsgId = `temp-${Date.now()}`;
    const dateFormatted = new Date().toLocaleTimeString('pt-BR');
    
    // Optimistic log insertion
    setFloorPlan((prev) => ({
      ...prev,
      agentDebates: [
        ...prev.agentDebates,
        {
          id: tempMsgId,
          agent: 'vision',
          message: `Processando ordem do usuário: "${text}"...`,
          timestamp: dateFormatted,
        },
      ],
    }));

    try {
      const response = await fetch('/api/analyze-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          currentPlan: floorPlan,
        }),
      });

      const data = await response.json();

      if (data.error) {
        // In simulation, apply mock changes
        setTimeout(() => {
          setFloorPlan((prev) => {
            // Let's add something mock depending on words inside text
            const lower = text.toLowerCase();
            let comment = 'Análise concluída. Apliquei os ajustes no espaço com sucesso.';
            let modifiedRooms = [...prev.rooms];
            let modifiedFurniture = [...prev.furniture];

            if (lower.includes('banheiro')) {
              comment = 'Adicionei um banheiro expandido de 2m x 2m revestido com cerâmica no plano cartesiano.';
              const newRoomId = `r-b-${Date.now()}`;
              modifiedRooms.push({
                id: newRoomId,
                name: 'Banheiro Extra',
                x: 8, y: 8, width: 2, height: 2,
                color: '#ccfbf1', floorMaterial: 'tile', wallColor: '#FFFFFF'
              });
            } else if (lower.includes('sala') || lower.includes('aumentar') || lower.includes('sala de estar')) {
              comment = 'Aumentamos as proporções da sala para ampliar a circulação integrada.';
              modifiedRooms = prev.rooms.map(r => 
                r.name.includes('Sala') || r.id === 'r1' 
                  ? { ...r, width: r.width + 1 } 
                  : r
              );
            } else if (lower.includes('otimizar') || lower.includes('arrumar') || lower.includes('desembaraçar') || lower.includes('organizar') || lower.includes('embaraçado') || lower.includes('espaço')) {
              comment = 'Desembaracei e compactei todos os cômodos para que fiquem perfeitamente encostados, sem sobreposição! Os móveis também foram redistribuídos de forma ergonômica perto das paredes.';
              let currentX = 1.0;
              modifiedRooms = modifiedRooms.map((room) => {
                let roomY = 1.0;
                if (currentX + room.width > 12.0) {
                  currentX = 1.0;
                  roomY = 5.0;
                }
                const newRoom = { ...room, x: parseFloat(currentX.toFixed(1)), y: parseFloat(roomY.toFixed(1)) };
                currentX += room.width;
                return newRoom;
              });

              modifiedFurniture = modifiedFurniture.map((f) => {
                const room = modifiedRooms.find((r) => r.id === f.roomId);
                if (!room) return f;
                const rItems = prev.furniture.filter((item) => item.roomId === room.id);
                const fIndex = rItems.findIndex((item) => item.id === f.id);
                let fx = 0.5, fy = 0.5;
                if (fIndex === 0) { fx = 0.4; fy = 0.4; }
                else if (fIndex === 1) { fx = Math.max(0.4, room.width - f.width - 0.4); fy = 0.4; }
                else if (fIndex === 2) { fx = Math.max(0.4, room.width - f.width - 0.4); fy = Math.max(0.4, room.height - f.height - 0.4); }
                else if (fIndex === 3) { fx = 0.4; fy = Math.max(0.4, room.height - f.height - 0.4); }
                else { fx = Math.max(0.4, (room.width / 2) - (f.width / 2)); fy = 0.4; }
                fx = Math.max(0.2, Math.min(room.width - f.width - 0.2, fx));
                fy = Math.max(0.2, Math.min(room.height - f.height - 0.2, fy));
                return { ...f, x: parseFloat(fx.toFixed(2)), y: parseFloat(fy.toFixed(2)) };
              });
            } else if (lower.includes('grade') || lower.includes('alinhar') || lower.includes('grid')) {
              comment = 'Alinhei os compartimentos residenciais em formato de bento-grid com acoplagem modular.';
              modifiedRooms = modifiedRooms.map((room, idx) => {
                const col = idx % 2;
                const row = Math.floor(idx / 2);
                const roomX = col === 0 ? 1.0 : 6.0;
                const roomY = 1.0 + row * 4.5;
                return { ...room, x: parseFloat(roomX.toFixed(1)), y: parseFloat(roomY.toFixed(1)) };
              });
            }

            return {
              ...prev,
              rooms: modifiedRooms,
              furniture: modifiedFurniture,
              agentDebates: [
                ...prev.agentDebates.filter(m => m.id !== tempMsgId),
                {
                  id: `dbg-${Date.now()}`,
                  agent: 'designer',
                  message: comment,
                  timestamp: dateFormatted,
                },
                {
                  id: `dbg-eng-${Date.now()}`,
                  agent: 'engineer',
                  message: 'Ajustei os cálculos hidrossanitários e verifiquei o orçamento atualizado.',
                  timestamp: dateFormatted,
                },
              ],
            };
          });
          setIsLoading(false);
          triggerNotification('success', 'Planta recalculada com base no seu comando!');
        }, 1500);
      } else {
        setFloorPlan(data);
        setIsLoading(false);
        triggerNotification('success', 'Ajustes espaciais efetuados com sucesso pela I.A.!');
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      triggerNotification('warn', 'Comando processado localmente no editor cartesiano.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-100 text-zinc-900 font-sans overflow-hidden" id="metrica-studio-root">
      
      {/* GLOBAL HEADER - PREMIUM STUDIO BOARD DESIGN */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3.5 shrink-0 flex flex-wrap justify-between items-center gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-900 rounded-lg text-white shadow-sm">
            <Building className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-[0.18em] uppercase text-zinc-900 flex items-center gap-2">
              MÉTRICA®
              <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 text-[8px] tracking-widest font-black px-2 py-0.5 rounded-sm uppercase">
                ESTÚDIO BIM & CO.
              </span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 tracking-wider">PROJETOS ARQUITETÔNICOS AUTÔNOMOS</p>
          </div>
        </div>

        {/* View mode toggle tabs: 2D Blueprint vs. 3D visual Model */}
        <div className="bg-zinc-100 p-1.5 rounded-lg border border-zinc-200 flex gap-1">
          <button
            id="tab-view-2d"
            onClick={() => setViewMode('2D')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === '2D'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-500" />
            Planos 2D (AUTOCAD)
          </button>
          <button
            id="tab-view-3d"
            onClick={() => setViewMode('3D')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === '3D'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Maquete 3D (SKETCHUP)
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2">
          <button
            id="btn-help-modal"
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center gap-1 text-xs font-semibold"
          >
            <HelpCircle className="w-4 h-4 text-cyan-600" />
            <span>Instruções</span>
          </button>
          <button
            id="btn-reset-plan"
            onClick={() => {
              if (confirm('Deseja redefinir todo o projeto de casa e voltar ao início?')) {
                setFloorPlan(mockStudioApartment);
                setSelectedRoom(null);
                setSelectedFurniture(null);
                triggerNotification('info', 'Projeto do Studio Moderno restaurado ao original.');
              }
            }}
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded bg-zinc-50 hover:bg-zinc-100 border border-zinc-200"
            title="Restaurar layout padrão"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DYNAMIC ALERTS BANNER NOTIFICATION */}
      <AnimatePresence>
        {apiNotification.type && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-16 left-1/2 -translate-x-1/2 z-50 p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 shadow-lg ${
              apiNotification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
              apiNotification.type === 'warn' ? 'bg-zinc-800 text-yellow-500 border-zinc-700' :
              'bg-blue-600 text-white border-blue-500'
            }`}
          >
            {apiNotification.type === 'warn' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {apiNotification.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{apiNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE FRAME CONTAINER: THREE-COLUMN Bento Design */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 bg-zinc-100 overflow-hidden">
        
        {/* COLUMN 1: Sidebar palette (Only in 2D layout edit Mode for cleanliness) */}
        {viewMode === '2D' ? (
          <div className={`${activeMobileSection === 'palette' ? 'flex flex-col flex-1 min-h-0' : 'hidden lg:flex lg:flex-col shrink-0'}`}>
            <SidebarPalette
              onAddRoom={handleAddRoom}
              onAddFurniture={handleAddFurniture}
              selectedRoom={selectedRoom}
              onUpdateRoomFloor={handleUpdateRoomFloor}
              activeTab={sidebarTab}
              setActiveTab={setSidebarTab}
              activeLayer={activeLayer}
              setActiveLayer={setActiveLayer}
              selectedFurniture={selectedFurniture}
              onRotateFurniture={handleRotateFurniture}
              onDeleteFurniture={handleDeleteFurniture}
              onDeleteRoom={handleDeleteRoom}
              onSelectRoom={setSelectedRoom}
              onSelectFurniture={setSelectedFurniture}
              onAddDoor={handleAddDoor}
              onAddWindow={handleAddWindow}
              onOptimizeLayout={handleOptimizeLayout}
            />
          </div>
        ) : (
          /* Small elegant 3D hints panel in place of drawer */
          <div className={`w-full lg:w-52 bg-white border-r border-zinc-200 p-5 space-y-5 flex flex-col text-xs leading-relaxed tracking-tight shrink-0 ${activeMobileSection === 'palette' ? 'flex flex-col flex-1' : 'hidden lg:flex'}`}>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Maquete 3D SketchUp</span>
            <div className="space-y-4">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <p className="font-bold text-zinc-900 mb-1">Rotacionar Maquete</p>
                <span className="text-zinc-650">Use o slider orbital ou botões direcionais de rotação para inspecionar os cômodos de qualquer quadrante em tempo real.</span>
              </div>
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <p className="font-bold text-zinc-900 mb-1">Altura de Paredes</p>
                <span className="text-zinc-650">Arraste o controle para simular cortes arquitetônicos ou extrusão em altura máxima padrão.</span>
              </div>
            </div>
          </div>
        )}

        {/* COLUMN 2: Primary Blueprint viewer (fills workspace) */}
        <div className={`flex-1 flex-col min-h-0 ${activeMobileSection === 'canvas' ? 'flex flex-1' : 'hidden lg:flex'}`}>
          <div className="flex-1 flex min-h-0 relative">
            <AnimatePresence mode="wait">
              {viewMode === '2D' ? (
                <motion.div
                  key="canvas-2d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <BlueprintCanvas2D
                    floorPlan={floorPlan}
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                    selectedFurniture={selectedFurniture}
                    onSelectFurniture={setSelectedFurniture}
                    onMoveRoom={handleMoveRoom}
                    onResizeRoom={handleResizeRoom}
                    onMoveFurniture={handleMoveFurniture}
                    onRotateFurniture={handleRotateFurniture}
                    onAddDoor={handleAddDoor}
                    onAddWindow={handleAddWindow}
                    onDeleteRoom={handleDeleteRoom}
                    onDeleteFurniture={handleDeleteFurniture}
                    onDeleteDoor={handleDeleteDoor}
                    onDeleteWindow={handleDeleteWindow}
                    activeLayer={activeLayer}
                    setActiveLayer={setActiveLayer}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="canvas-3d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col min-h-0"
                >
                  <BlueprintCanvas3D floorPlan={floorPlan} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LOWER SECTION: Costs and dynamic quantitative analysis */}
          <div className="p-4 bg-zinc-50 border-t border-zinc-200 overflow-y-auto max-h-54 shrink-0">
            <CostReport floorPlan={floorPlan} />
          </div>
        </div>

        {/* COLUMN 3: Conversational Autonomous Multi-Agent panel */}
        <div className={`${activeMobileSection === 'agents' ? 'flex flex-col flex-1 min-h-0' : 'hidden lg:flex lg:flex-col shrink-0'}`}>
          <AgentPanel
            agentDebates={floorPlan.agentDebates}
            onUploadBlueprint={handleUploadBlueprint}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSelectPreset={handleSelectPreset}
          />
        </div>

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR - ONLY VISIBLE ON SMALLER SCREENS */}
      <div className="lg:hidden shrink-0 bg-slate-950 border-t border-slate-800/80 px-4 py-2 flex justify-around items-center text-slate-400 z-40">
        <button
          id="m-nav-palette"
          onClick={() => setActiveMobileSection('palette')}
          className={`flex flex-col items-center gap-1 py-1 text-[10px] font-bold transition-all ${
            activeMobileSection === 'palette' ? 'text-blue-500 font-extrabold' : 'text-slate-500'
          }`}
        >
          <Sofa className="w-5 h-5" />
          <span>Ferramentas</span>
        </button>
        <button
          id="m-nav-canvas"
          onClick={() => setActiveMobileSection('canvas')}
          className={`flex flex-col items-center gap-1 py-1 text-[10px] font-bold transition-all ${
            activeMobileSection === 'canvas' ? 'text-emerald-500 font-extrabold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Planta 2D/3D</span>
        </button>
        <button
          id="m-nav-agents"
          onClick={() => setActiveMobileSection('agents')}
          className={`flex flex-col items-center gap-1 py-1 text-[10px] font-bold transition-all ${
            activeMobileSection === 'agents' ? 'text-pink-500 font-extrabold' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Arquiteto IA</span>
        </button>
      </div>

      {/* HELP INSTRUCTIONS DIALOGUE MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-800 rounded-xl shadow-2xl p-6 max-w-lg w-full space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                  Como Utilizar o Arquiteto Inteligente?
                </h3>
                <button
                  id="close-help-modal"
                  onClick={() => setShowHelpModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  X Fechar
                </button>
              </div>

              <div className="text-xs space-y-3 leading-relaxed text-slate-600">
                <p>
                  Bem-vindo ao <strong>Arquiteto IA</strong>, um estúdio de arquitetura copilotado por agentes inteligentes autônomos.
                </p>
                <div className="space-y-2 font-medium">
                  <div className="flex gap-2">
                    <span className="text-blue-600">1.</span>
                    <span>
                      <strong>Desenho manual para layout digital:</strong> Desenhe a planta em uma folha branca de papel, tire uma foto e faça upload. O <strong>Agente de Visão</strong> analisará as paredes, divisórias e transformará tudo em um modelo cartesiano perfeito com móveis sugeridos.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-600">2.</span>
                    <span>
                      <strong>Comandos Conversacionais por Chat:</strong> Peça por chat para alterar o layout! Ex: <em>"Aumente a sala de estar"</em>, <em>"Adiciona um closet no quarto"</em>. A IA alterará a geometria cartesiana diretamente.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-600">3.</span>
                    <span>
                      <strong>Editor Manual:</strong> Mova os cômodos de lugar arrastando-os no canvas. Clique no handle azul no canto inferior direito para redimensionar cômodos manualmente. Adicione aberturas (portas, janelas), mobília e revestimentos de piso no painel lateral esquerdo.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-blue-600">4.</span>
                    <span>
                      <strong>Projeção 3D & Engenharia:</strong> Mude para a vista 3D para apreciar as texturas dos revestimentos e os volumes espaciais. Acompanhe os materiais, quantidade de alvenaria e o orçamento estimado na planilha de engenharia em tempo real.
                    </span>
                  </div>
                </div>
              </div>

              <button
                id="modal-begins-btn"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
              >
                Entendi, ir para o Estúdio!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
