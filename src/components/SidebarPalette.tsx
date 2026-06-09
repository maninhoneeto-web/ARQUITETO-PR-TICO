import React from 'react';
import { 
  Square, Sofa, LayoutGrid, Hammer, Plus, Home, Zap, Droplet, Compass, AlertTriangle, Trash2, RotateCw, Sparkles, Sliders, Check, FileText
} from 'lucide-react';
import { FurnitureType, FloorMaterial, Room, Furniture, EngineeringLayer } from '../types';

interface SidebarPaletteProps {
  onAddRoom: (type: string) => void;
  onAddFurniture: (type: FurnitureType) => void;
  selectedRoom: Room | null;
  onUpdateRoomFloor: (roomId: string, material: FloorMaterial) => void;
  activeTab: 'build' | 'items' | 'materials';
  setActiveTab: (tab: 'build' | 'items' | 'materials') => void;
  activeLayer: EngineeringLayer;
  setActiveLayer: (layer: EngineeringLayer) => void;
  selectedFurniture: Furniture | null;
  onRotateFurniture: (furnitureId: string) => void;
  onDeleteFurniture: (furnitureId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onSelectRoom: (room: Room | null) => void;
  onSelectFurniture: (furniture: Furniture | null) => void;
  onAddDoor: (roomId: string, wall: 'top' | 'bottom' | 'left' | 'right') => void;
  onAddWindow: (roomId: string, wall: 'top' | 'bottom' | 'left' | 'right') => void;
  onOptimizeLayout: (strategy: 'row' | 'grid' | 'lshape' | 'compact' | 'furniture') => void;
}

const ROOMS_CATALOG = [
  { name: 'Sala de Estar Conjugada', type: 'Sala de Estar', color: '#e2f0fb', desc: 'Espaço social amplo para convívio' },
  { name: 'Suíte Master Casal', type: 'Dormitório', color: '#fce7f3', desc: 'Quarto privativo com espaço para closet' },
  { name: 'Cozinha Linear integrada', type: 'Cozinha', color: '#fef3c7', desc: 'Área otimizada para bancada úmida' },
  { name: 'Banheiro Completo', type: 'Banheiro', color: '#ccfbf1', desc: 'Instalação sanitária compacta segura' },
  { name: 'Varanda de Serviço / Gourmet', type: 'Varanda', color: '#fef2f2', desc: 'Iluminação nativa e ventilação externa' },
  { name: 'Gabinete Home Office', type: 'Escritório', color: '#f3e8ff', desc: 'Foco e isolamento acústico adequado' },
];

const FURNITURE_ITEMS: { name: string; type: FurnitureType; category: string; icon: string }[] = [
  // Living room
  { name: 'Sofá de Canto Retrátil', type: 'couch', category: 'Sala', icon: '🛋️' },
  { name: 'Painel TV & Rack Baixo', type: 'tv', category: 'Sala', icon: '📺' },
  { name: 'Mesa de Jantar Redonda', type: 'table', category: 'Sala', icon: '🍽️' },
  { name: 'Poltrona de Leitura', type: 'chair', category: 'Sala', icon: '🪑' },
  
  // Bedroom
  { name: 'Cama Queen Box', type: 'bed', category: 'Quarto', icon: '🛏️' },
  { name: 'Guarda-Roupa Embutido', type: 'cabinet', category: 'Quarto', icon: '🚪' },
  
  // Kitchen
  { name: 'Geladeira Duplex Inox', type: 'fridge', category: 'Cozinha', icon: '🧊' },
  { name: 'Fogão de Indução Cooktop', type: 'stove', category: 'Cozinha', icon: '🔥' },
  { name: 'Gabinete Planejado de Cozinha', type: 'cabinet', category: 'Cozinha', icon: '📁' },
  
  // Bathroom
  { name: 'Box Blindex & Chuveiro', type: 'shower', category: 'Banheiro', icon: '🚿' },
  { name: 'Cuba Esculpida em Quartzo', type: 'sink', category: 'Banheiro', icon: '🚰' },
  { name: 'Vaso com Caixa Acoplada 6L', type: 'toilet', category: 'Banheiro', icon: '🚽' },
  
  // Decoration
  { name: 'Vaso de Folhagem (Costela)', type: 'plant', category: 'Decor', icon: '🌿' },
];

const FLOOR_MATERIALS_CATALOG: { name: string; type: FloorMaterial; bg: string; spec: string; price: string }[] = [
  { name: 'Madeira Natural Freijó', type: 'wood', bg: 'bg-amber-800', spec: 'Réguas vinílicas estruturadas acústicas', price: 'R$ 250/m²' },
  { name: 'Porcelanato Calacata Satin', type: 'tile', bg: 'bg-stone-300', spec: 'Retificado ultra-resistente junta 1mm', price: 'R$ 110/m²' },
  { name: 'Cimento Queimado Polido', type: 'concrete', bg: 'bg-neutral-500', spec: 'Resina mineral de base cimentícia', price: 'R$ 100/m²' },
  { name: 'Carpete Bouclé Linho', type: 'carpet', bg: 'bg-zinc-400', spec: 'Isolante acústico ideal para escritório', price: 'R$ 100/m²' },
  { name: 'Mármore Nero Portoro', type: 'marble', bg: 'bg-slate-900 border border-slate-700', spec: 'Nobre pedra polida alto brilho', price: 'R$ 550/m²' },
];

export function SidebarPalette({
  onAddRoom,
  onAddFurniture,
  selectedRoom,
  onUpdateRoomFloor,
  activeTab,
  setActiveTab,
  activeLayer,
  setActiveLayer,
  selectedFurniture,
  onRotateFurniture,
  onDeleteFurniture,
  onDeleteRoom,
  onSelectRoom,
  onSelectFurniture,
  onAddDoor,
  onAddWindow,
  onOptimizeLayout,
}: SidebarPaletteProps) {
  return (
    <div className="w-full lg:w-96 bg-zinc-50 border-r border-zinc-200 flex flex-col h-full shrink-0 shadow-sm overflow-hidden select-none" id="studio-sidebar-container">
      
      {/* BRANDING HEADER - ESTÚDIO DE DESIGN E ARQUITETURA */}
      <div className="p-5 bg-zinc-900 text-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-black tracking-tighter">
              M⊞
            </div>
            <div>
              <h2 className="text-xs font-black tracking-widest uppercase text-white font-mono">
                MÉT_RICA® CO.
              </h2>
              <p className="text-[9px] text-zinc-405 tracking-wider uppercase">Plataforma de Engenharia & CAD</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md px-2 py-0.5 font-bold uppercase font-mono">
              BIM 2026.1
            </span>
          </div>
        </div>
      </div>

      {/* 1. PRINCIPAL MÓDULO DE ESPECIALIDADE (ABAS DO PROJETO - CORE SYSTEM) */}
      <div className="p-4 bg-zinc-100 border-b border-zinc-250 shrink-0 space-y-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
          📐 Seleção de Camadas Hidro/Elé/Estr:
        </span>
        
        {/* TAB GRID DE ESPECIALIZAÇÕES COM SELETOR DE CAMADA PRINCIPAL */}
        <div className="grid grid-cols-2 gap-1.5 bg-zinc-200 p-1 rounded-lg">
          <button
            id="sidebar-layer-architectural"
            onClick={() => setActiveLayer('architectural')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-md text-[11px] font-bold transition-all shadow-xs ${
              activeLayer === 'architectural'
                ? 'bg-blue-600 text-white font-black'
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Arquitetura</span>
          </button>
          
          <button
            id="sidebar-layer-electrical"
            onClick={() => setActiveLayer('electrical')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-md text-[11px] font-bold transition-all shadow-xs ${
              activeLayer === 'electrical'
                ? 'bg-amber-600 text-white font-black animate-pulse'
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Elétrica</span>
          </button>
          
          <button
            id="sidebar-layer-hydraulic"
            onClick={() => setActiveLayer('hydraulic')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-md text-[11px] font-bold transition-all shadow-xs ${
              activeLayer === 'hydraulic'
                ? 'bg-sky-600 text-white font-black'
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-300'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>3. Hidráulica</span>
          </button>
          
          <button
            id="sidebar-layer-structural"
            onClick={() => setActiveLayer('structural')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-md text-[11px] font-bold transition-all shadow-xs ${
              activeLayer === 'structural'
                ? 'bg-rose-600 text-white font-black'
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-300'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>4. Estrutural</span>
          </button>
        </div>
      </div>

      {/* 2. AREA CENTRAL FLUIDA DE FERRAMENTAS DO SITE */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {activeLayer === 'architectural' ? (
          <div className="space-y-4">
            {/* SUB-TABS INTERNAS DE ARQUITETURA */}
            <div className="flex border-b border-zinc-250 bg-zinc-100 p-1 gap-1 rounded-lg">
              <button
                id="subtab-build"
                onClick={() => setActiveTab('build')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all text-center flex justify-center items-center gap-1.5 ${
                  activeTab === 'build'
                    ? 'bg-white text-zinc-900 shadow-sm font-extrabold border border-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-850'
                }`}
              >
                <Square className="w-3.5 h-3.5 text-zinc-600" />
                <span>Cômodos</span>
              </button>
              <button
                id="subtab-items"
                onClick={() => setActiveTab('items')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all text-center flex justify-center items-center gap-1.5 ${
                  activeTab === 'items'
                    ? 'bg-white text-zinc-900 shadow-sm font-extrabold border border-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-850'
                }`}
              >
                <Sofa className="w-3.5 h-3.5 text-zinc-600" />
                <span>Mobiliários</span>
              </button>
              <button
                id="subtab-materials"
                onClick={() => setActiveTab('materials')}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all text-center flex justify-center items-center gap-1.5 ${
                  activeTab === 'materials'
                    ? 'bg-white text-zinc-900 shadow-sm font-extrabold border border-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-850'
                }`}
              >
                <Hammer className="w-3.5 h-3.5 text-zinc-600" />
                <span>Pisos e Revestimentos</span>
              </button>
            </div>

            {/* TAB CORREGIDA: CÔMODOS ARQUITETÔNICOS */}
            {activeTab === 'build' && (
              <div className="space-y-3">
                {/* AUTO-LAYOUT BIM SPACIAL OPTIMIZER CONTROL PANEL */}
                <div className="p-3.5 bg-zinc-900 text-white rounded-xl border border-zinc-800 space-y-2.5 shadow-md" id="bim-spatial-optimizer-widget">
                  <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-cyan-400 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    BIM AUTO-ARRUMAÇÃO & FLUXO
                  </div>
                  <p className="text-[10px] text-zinc-300 leading-relaxed">
                    Arranjo dinâmico inteligente para desembaraçar cômodos e organizar mobílias:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      id="opt-refit-compact"
                      onClick={() => onOptimizeLayout('compact')}
                      className="px-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-100 rounded border border-zinc-700 transition flex items-center gap-1 justify-center active:scale-95"
                      title="Organiza salas encostadas sem que fiquem sobrepostas"
                    >
                      <span>🔄 Desembaraçar</span>
                    </button>
                    <button
                      id="opt-refit-furniture"
                      onClick={() => onOptimizeLayout('furniture')}
                      className="px-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-100 rounded border border-zinc-700 transition flex items-center gap-1 justify-center active:scale-95"
                      title="Coloca toda mobília encostada nas paredes do seu cômodo"
                    >
                      <span>🛋️ Alocar Móveis</span>
                    </button>
                    <button
                      id="opt-refit-grid"
                      onClick={() => onOptimizeLayout('grid')}
                      className="px-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-100 rounded border border-zinc-700 transition flex items-center gap-1 justify-center active:scale-95"
                      title="Enfileira os comodos em uma grade elegante"
                    >
                      <span>⊞ Alinhar Grade</span>
                    </button>
                    <button
                      id="opt-refit-lshape"
                      onClick={() => onOptimizeLayout('lshape')}
                      className="px-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-100 rounded border border-zinc-700 transition flex items-center gap-1 justify-center active:scale-95"
                      title="Organiza as salas em uma estrutura rotativa e fluida"
                    >
                      <span>📐 Layout em L</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-105 rounded-xl">
                  <h4 className="text-xs font-bold text-blue-905 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-600" />
                    Adicionar Novos Espaços à Planta
                  </h4>
                  <p className="text-[11px] text-blue-805 mt-0.5 leading-normal">
                    Selecione um cômodo abaixo para inseri-lo instantaneamente no centro do desenho técnico. Em seguida, arraste-o livremente para acoplar paredes.
                  </p>
                </div>

                <div className="space-y-2">
                  {ROOMS_CATALOG.map((room) => (
                    <button
                      id={`sidebar-add-${room.type}`}
                      key={room.name}
                      onClick={() => onAddRoom(room.type)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border border-black/10 shadow-inner" 
                          style={{ backgroundColor: room.color }}
                        />
                        <div>
                          <p className="text-xs font-bold text-zinc-800">{room.name}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{room.desc}</p>
                        </div>
                      </div>
                      <div className="bg-zinc-100 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded text-[10px] font-black tracking-wide text-zinc-550 uppercase transition-all">
                        + INSERIR
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CORREGIDA: MOBÍLIA E DECORAÇÕES */}
            {activeTab === 'items' && (
              <div className="space-y-3">
                {selectedRoom ? (
                  <div className="p-3 bg-zinc-900 text-white rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Espaço Destinatário</p>
                      <p className="text-xs font-extrabold text-blue-400">{selectedRoom.name}</p>
                    </div>
                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-350">
                      {(selectedRoom.width * selectedRoom.height).toFixed(1)} m²
                    </span>
                  </div>
                ) : (
                  <div className="p-3 border border-amber-200 bg-amber-50/70 rounded-xl text-xs text-amber-805 flex flex-col gap-1.5 leading-snug">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>ATENÇÃO: Nenhum Espaço Selecionado</span>
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium">
                      Clique em qualquer cômodo (sala, quarto, cozinha etc.) dentro do desenho à direita para poder adicionar móveis correspondentes a ele.
                    </p>
                  </div>
                )}

                {['Sala', 'Quarto', 'Cozinha', 'Banheiro', 'Decor'].map((cat) => {
                  const items = FURNITURE_ITEMS.filter(f => f.category === cat);
                  return (
                    <div key={cat} className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider font-mono block pl-1">
                        📁 Mobília para {cat}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {items.map((item) => (
                          <button
                            id={`sidebar-add-item-${item.type}`}
                            key={item.name}
                            disabled={!selectedRoom}
                            onClick={() => onAddFurniture(item.type)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-xs font-semibold ${
                              selectedRoom 
                                ? 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-350 text-zinc-800' 
                                : 'opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-400 border-dashed border-zinc-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{item.icon}</span>
                              <span className="truncate max-w-[200px]">{item.name}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold bg-zinc-100 px-1.5 py-0.5 rounded">
                              + Adicionar
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CORREGIDA: PISOS E REVESTIMENTOS */}
            {activeTab === 'materials' && (
              <div className="space-y-3">
                {selectedRoom ? (
                  <div className="p-3 bg-zinc-900 text-white rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Cômodo Selecionado</p>
                      <p className="text-xs font-extrabold text-blue-400">{selectedRoom.name}</p>
                    </div>
                    <span className="text-[11px] text-zinc-350">
                      Piso atual: <strong className="underline text-white font-black">{selectedRoom.floorMaterial}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="p-3 border border-amber-200 bg-amber-50/70 rounded-xl text-xs text-amber-805 flex flex-col gap-1.5 leading-snug">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Selecione um cômodo para mudar o Revestimento</span>
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium">
                      Clique em um cômodo no desenho técnico para poder atualizar os materiais de revestimento de piso.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {FLOOR_MATERIALS_CATALOG.map((mat) => (
                    <button
                      id={`sidebar-mat-${mat.type}`}
                      key={mat.type}
                      disabled={!selectedRoom}
                      onClick={() => onUpdateRoomFloor(selectedRoom!.id, mat.type)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedRoom
                          ? 'border-zinc-200 bg-white hover:border-zinc-350'
                          : 'opacity-45 cursor-not-allowed bg-zinc-100'
                      } ${selectedRoom?.floorMaterial === mat.type ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/10' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded shrink-0 shadow-inner ${mat.bg}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-zinc-900 flex justify-between items-center">
                          <span className="truncate">{mat.name}</span>
                          {selectedRoom?.floorMaterial === mat.type && (
                            <span className="text-[9px] text-blue-600 font-extrabold bg-blue-100 border border-blue-200 px-1.5 py-0.2 rounded shrink-0">Ativo</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{mat.spec}</p>
                        <p className="text-[9px] font-mono text-zinc-500 mt-1 font-bold">{mat.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* MÓDULO ELÉTRICO CON SISTEMA DE ABAS (NBR 5410) */}
        {activeLayer === 'electrical' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl">
              <h4 className="text-xs font-bold text-amber-805 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600 fill-amber-500/10" />
                Pontos de Carga e Conduítes Elétricos
              </h4>
              <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                Adicione tomadas, interruptores, pontos de iluminação e painéis disjuntores vinculados às normas NBR 5410 de instalações comerciais e residenciais.
              </p>
            </div>

            {selectedRoom ? (
              <div className="p-3 bg-zinc-900 text-white rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Lançando Redes Elétricas em:</p>
                  <p className="text-xs font-extrabold text-amber-400">{selectedRoom.name}</p>
                </div>
                <span className="text-[10px] bg-zinc-805 text-zinc-350 px-2 py-0.5 rounded font-bold font-mono">Fios Amarelos</span>
              </div>
            ) : (
              <div className="p-3 border border-amber-200 bg-amber-50/70 rounded-xl text-xs text-amber-805 flex flex-col gap-1.5 leading-snug">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Selecione um Espaço</span>
                </div>
                <p className="text-[11px] text-amber-700 font-medium font-mono">
                  Selecione um cômodo na planta para que o painel de lançamento de elementos elétricos seja habilitado.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <button
                id="sidebar-add-light"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('light')}
                className={`w-full flex items-center gap-4.5 p-3 rounded-xl border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-105 cursor-not-allowed'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-yellow-100 border border-yellow-250 text-yellow-650 font-bold text-lg text-center flex items-center justify-center shrink-0">
                  💡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800">Luz no Teto Central (100W)</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">Ponto de iluminação básico de teto integrado</p>
                </div>
              </button>

              <button
                id="sidebar-add-socket"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('socket')}
                className={`w-full flex items-center gap-4.5 p-3 rounded-xl border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-105 cursor-not-allowed'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-250 text-amber-650 font-bold text-lg text-center flex items-center justify-center shrink-0">
                  🔌
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Tomada Geral TUG (NBR 14136)</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">Ponto de tomada residencial simples para eletrônicos</p>
                </div>
              </button>

              <button
                id="sidebar-add-switch"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('switch')}
                className={`w-full flex items-center gap-4.5 p-3 rounded-xl border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-105 cursor-not-allowed'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-250 text-emerald-650 font-bold text-lg text-center flex items-center justify-center shrink-0">
                  🎛️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Interruptor Simples de Parede</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">Comando para ligar a iluminação geral</p>
                </div>
              </button>

              <button
                id="sidebar-add-qdc"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('qdc')}
                className={`w-full flex items-center gap-4.5 p-3 rounded-xl border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-105 cursor-not-allowed'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-white font-bold text-lg text-center flex items-center justify-center shrink-0">
                  📟
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900">Quadro de Distribuição (QDC)</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">Quadro central de disjuntores protetores de circuito</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* MÓDULO HIDRÁULICO CON SISTEMA DE ABAS (NBR 5626) */}
        {activeLayer === 'hydraulic' && (
          <div className="space-y-4">
            <div className="p-3 bg-sky-50 border border-sky-150 rounded-xl">
              <h4 className="text-xs font-bold text-sky-805 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-sky-600 fill-sky-500/10" />
                Redes Hidrossanitárias Residenciais
              </h4>
              <p className="text-[11px] text-sky-750 leading-relaxed mt-0.5">
                Trace ramificações de água fria comercial e tubulações de esgoto sanitário. Linhas azuis retratam água potável e linhas marrons o descarte sanitário.
              </p>
            </div>

            {selectedRoom ? (
              <div className="p-3 bg-zinc-900 text-white rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Infra Hidráulica Em:</p>
                  <p className="text-xs font-extrabold text-sky-400">{selectedRoom.name}</p>
                </div>
                <span className="text-[10px] bg-sky-950/40 text-sky-350 border border-sky-900 px-2 py-0.5 rounded font-mono font-bold">AF & ESG</span>
              </div>
            ) : (
              <div className="p-3 border border-amber-200 bg-amber-50/70 rounded-xl text-xs text-amber-805 flex flex-col gap-1.5 leading-snug">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Selecione um Cômodo para Hidráulica</span>
                </div>
                <p className="text-[11px] text-amber-700 font-medium select-none font-mono">
                  Por favor, selecione um espaço (ex: Banheiro/Cozinha) no plano técnico para poder lançar as prumadas hidráulicas.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <button
                id="sidebar-add-shower-hydr"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('shower')}
                className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-50 cursor-not-allowed'
                }`}
              >
                <div className="w-9 h-9 rounded bg-teal-550/10 border border-teal-200 text-teal-600 text-center flex items-center justify-center shrink-0 font-bold">
                  🚿
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-800">Box Ducha Aquecimento a Gás</div>
                  <p className="text-[10px] text-zinc-400 leading-normal">Chuveiro com ralo ø100mm e ligação de esgoto</p>
                </div>
              </button>

              <button
                id="sidebar-add-toilet-hydr"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('toilet')}
                className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-50 cursor-not-allowed'
                }`}
              >
                <div className="w-9 h-9 rounded bg-indigo-550/10 border border-indigo-200 text-indigo-600 text-center flex items-center justify-center shrink-0 font-bold font-mono">
                  🚽
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-800">Bacia Sanitária Ecológica 6L</div>
                  <p className="text-[10px] text-zinc-400 leading-normal">Vaso com ligação de ø100mm para rede primária</p>
                </div>
              </button>

              <button
                id="sidebar-add-sink-hydr"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('sink')}
                className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-50 cursor-not-allowed'
                }`}
              >
                <div className="w-9 h-9 rounded bg-sky-550/10 border border-sky-200 text-sky-600 text-center flex items-center justify-center shrink-0 font-bold">
                  🚰
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-805">Pia com Sifão de Copo Metálico</div>
                  <p className="text-[10px] text-zinc-400 leading-normal">Lavatório com ponto ø20mm de água fripotável</p>
                </div>
              </button>

              <button
                id="sidebar-add-caixa-hydr"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('caixa_insp')}
                className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-50 cursor-not-allowed'
                }`}
              >
                <div className="w-9 h-9 rounded bg-orange-550/10 border border-orange-200 text-orange-700 text-center flex items-center justify-center shrink-0 font-bold font-mono">
                  ⭕
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-800">Caixa de Inspeção Pluvial/Rede</div>
                  <p className="text-[10px] text-zinc-400 leading-normal">Caixa receptora exterior para limpeza e vistorias</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* MÓDULO ESTRUTURAL (NBR 6118) */}
        {activeLayer === 'structural' && (
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl">
              <h4 className="text-xs font-bold text-rose-805 flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-rose-600 fill-rose-500/10" />
                Vigas e Pilares de Concreto Armado (Estrural)
              </h4>
              <p className="text-[11px] text-rose-750 leading-relaxed mt-0.5">
                Insira componentes estruturais que garantem a segurança do esqueleto da residência. Configure pilares de ancoragem nos cantos e vigas sobre as paredes.
              </p>
            </div>

            {selectedRoom ? (
              <div className="p-3 bg-zinc-900 text-white rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Vigas e Pilares locados em:</p>
                  <p className="text-xs font-extrabold text-rose-450">{selectedRoom.name}</p>
                </div>
                <span className="text-[10px] bg-rose-950/40 text-rose-350 border border-rose-900 px-2 py-0.5 rounded font-bold font-mono">HACHURA</span>
              </div>
            ) : (
              <div className="p-3 border border-amber-200 bg-amber-50/70 rounded-xl text-xs text-amber-805 flex flex-col gap-1.5 leading-snug">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Selecione um Espaço</span>
                </div>
                <p className="text-[11px] text-amber-700 font-medium font-mono">
                  Por favor, marque um cômodo no editor cartesiano para habilitar a implantação de superestruturas de reforço.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <button
                id="sidebar-add-pilar"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('pilar')}
                className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-50 cursor-not-allowed'
                }`}
              >
                <div className="w-9 h-9 rounded bg-red-100 border border-red-200 text-red-700 text-center flex items-center justify-center shrink-0 font-bold font-mono text-lg">
                  🏗️
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-800">Pilar de Concreto Armado (15x20)</div>
                  <p className="text-[10px] text-zinc-450 leading-normal">Pilar de canto para suporte de cargas verticais pesadas</p>
                </div>
              </button>

              <button
                id="sidebar-add-viga"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('viga')}
                className={`w-full flex items-center gap-4 py-2.5 px-3 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-zinc-200 bg-white hover:border-zinc-350 hover:bg-zinc-50' : 'opacity-40 bg-zinc-50 cursor-not-allowed'
                }`}
              >
                <div className="w-9 h-9 rounded bg-amber-100 border border-amber-200 text-amber-750 text-center flex items-center justify-center shrink-0 font-bold text-lg">
                  🧱
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-800">Viga de Transição para Lajes (15x30)</div>
                  <p className="text-[10px] text-zinc-450 leading-normal">Viga horizontal moldada in loco vinculada ao pilar</p>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. EXCELENTE CONTROLADOR FLUTUANTE PARA ITEM SELECIONADO (MOBÍLIA / CÔMODOS) */}
      {selectedFurniture ? (
        <div className="p-4 bg-zinc-900 text-white border-t border-zinc-700 shrink-0 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">🔌 Elemento Ativo Selecionado</span>
            <button 
              id="sidebar-unselect-furniture"
              onClick={() => onSelectFurniture(null)}
              className="text-[10px] text-zinc-400 hover:text-white underline"
            >
              Desmarcar
            </button>
          </div>
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-400 truncate">{selectedFurniture.name}</p>
              <p className="text-[9px] text-zinc-450 font-mono">ID: {selectedFurniture.id.substring(0,8)}... ({selectedFurniture.rotation}° rot)</p>
            </div>

            <div className="flex gap-1.5">
              <button
                id="sidebar-rotate-furn"
                onClick={() => onRotateFurniture(selectedFurniture.id)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg border border-zinc-700 flex items-center justify-center transition-all"
                title="Rotacionar 90"
              >
                <RotateCw className="w-3.5 h-3.5 text-zinc-300" />
              </button>
              <button
                id="sidebar-delete-furn"
                onClick={() => {
                  onDeleteFurniture(selectedFurniture.id);
                  onSelectFurniture(null);
                }}
                className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 p-2 rounded-lg flex items-center justify-center transition-all"
                title="Apagar elemento"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-300 pointer-events-none" />
              </button>
            </div>
          </div>
        </div>
      ) : selectedRoom ? (
        <div className="p-4 bg-zinc-900 text-zinc-100 border-t border-zinc-750 shrink-0 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">🏰 Compartimento Técnico Selecionado</span>
            <button 
              id="sidebar-unselect-room"
              onClick={() => {
                onSelectRoom(null);
                onSelectFurniture(null);
              }}
              className="text-[10px] text-zinc-400 hover:text-white underline font-mono font-bold"
            >
              Desmarcar
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-blue-400 truncate">{selectedRoom.name}</p>
              <p className="text-[10px] font-mono text-zinc-400 leading-normal">
                {selectedRoom.width.toFixed(1)}m × {selectedRoom.height.toFixed(1)}m • <strong className="text-white">{(selectedRoom.width * selectedRoom.height).toFixed(1)} m²</strong>
              </p>
            </div>

            {/* QUICK ACTIONS IN SIDEBAR TO PREVENT CONFUSION */}
            <div className="flex gap-1">
              <button
                id="sidebar-add-door-fast"
                onClick={() => onAddDoor(selectedRoom.id, 'bottom')}
                className="py-1 px-2.5 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-750 text-white rounded border border-zinc-700 transition"
              >
                + Porta
              </button>
              <button
                id="sidebar-add-win-fast"
                onClick={() => onAddWindow(selectedRoom.id, 'top')}
                className="py-1 px-2.5 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-750 text-white rounded border border-zinc-700 transition"
              >
                + Janela
              </button>
              <button
                id="sidebar-delete-room"
                onClick={() => {
                  onDeleteRoom(selectedRoom.id);
                  onSelectRoom(null);
                  onSelectFurniture(null);
                }}
                className="p-1 px-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 rounded transition flex items-center justify-center font-bold"
                title="Deletar Cômodo e conteúdo"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-305 pointer-events-none" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-zinc-150 border-t border-zinc-250 shrink-0">
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest font-mono block">Dica do Projetista</span>
          <p className="text-[11px] text-zinc-550 leading-relaxed mt-0.5 select-none text-justify">
            Clique sobre um cômodo ou móvel no desenho técnico à direita para fazer modificações (mover, rotacionar, mudar o piso, colocar portas/janelas ou apagá-los).
          </p>
        </div>
      )}
      
    </div>
  );
}
