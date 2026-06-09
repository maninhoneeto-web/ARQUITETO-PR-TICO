import React from 'react';
import { 
  Square, Sofa, LayoutGrid, Hammer, Plus, Home, Zap, Droplet, Compass, AlertTriangle
} from 'lucide-react';
import { FurnitureType, FloorMaterial, Room } from '../types';

interface SidebarPaletteProps {
  onAddRoom: (type: string) => void;
  onAddFurniture: (type: FurnitureType) => void;
  selectedRoom: Room | null;
  onUpdateRoomFloor: (roomId: string, material: FloorMaterial) => void;
  activeTab: 'build' | 'items' | 'materials';
  setActiveTab: (tab: 'build' | 'items' | 'materials') => void;
  activeLayer: 'architectural' | 'electrical' | 'hydraulic' | 'structural';
  setActiveLayer: (layer: 'architectural' | 'electrical' | 'hydraulic' | 'structural') => void;
}

const ROOM_TEMPLATES = [
  { name: 'Sala de Estar', type: 'Sala de Estar', color: '#e2f0fb' },
  { name: 'Dormitório', type: 'Dormitório', color: '#fce7f3' },
  { name: 'Cozinha', type: 'Cozinha', color: '#fef3c7' },
  { name: 'Banheiro', type: 'Banheiro', color: '#ccfbf1' },
  { name: 'Varanda Integrada', type: 'Varanda', color: '#fef2f2' },
  { name: 'Escritório', type: 'Escritório', color: '#f3e8ff' },
];

const FURNITURE_ITEMS: { name: string; type: FurnitureType; category: string }[] = [
  // Living room
  { name: 'Sofá Clássico', type: 'couch', category: 'Sala' },
  { name: 'Televisão & Rack', type: 'tv', category: 'Sala' },
  { name: 'Mesa de Centro', type: 'table', category: 'Sala' },
  { name: 'Cadeira de Estar', type: 'chair', category: 'Sala' },
  
  // Bedroom
  { name: 'Cama Casal Queen', type: 'bed', category: 'Quarto' },
  { name: 'Gabinete / Armário', type: 'cabinet', category: 'Quarto' },
  
  // Kitchen
  { name: 'Geladeira Duplex', type: 'fridge', category: 'Cozinha' },
  { name: 'Fogão Embutir', type: 'stove', category: 'Cozinha' },
  { name: 'Balcão Planejado', type: 'cabinet', category: 'Cozinha' },
  
  // Bathroom
  { name: 'Chuveiro & Box', type: 'shower', category: 'Banheiro' },
  { name: 'Pia Clean', type: 'sink', category: 'Banheiro' },
  { name: 'Vaso Sanitário', type: 'toilet', category: 'Banheiro' },
  
  // Decoration
  { name: 'Vaso de Planta', type: 'plant', category: 'Decor' },
];

const FLOOR_MATERIALS: { name: string; type: FloorMaterial; bg: string; description: string }[] = [
  { name: 'Madeira Laminada', type: 'wood', bg: 'bg-amber-800', description: 'Visual quente de freijó nativo' },
  { name: 'Porcelanato Satin', type: 'tile', bg: 'bg-stone-300', description: 'Superfície asséptica impermeável' },
  { name: 'Cimento Queimado', type: 'concrete', bg: 'bg-neutral-500', description: 'Estilo industrial moderno' },
  { name: 'Carpete Felpudo', type: 'carpet', bg: 'bg-zinc-400', description: 'Silêncio e conforto extra' },
  { name: 'Mármore Carrara', type: 'marble', bg: 'bg-slate-100 border border-slate-300', description: 'Luxuosa pedra branca fria' },
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
}: SidebarPaletteProps) {
  return (
    <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-xs select-none">
      
      {/* 1. PROJECT LAYER QUICK SELECTOR (Garante sincronismo de abas) */}
      <div className="p-3 bg-slate-950 border-b border-slate-850 space-y-2">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
          🗂️ Especialização do Projeto:
        </span>
        <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg">
          <button
            id="nav-layer-arch"
            onClick={() => setActiveLayer('architectural')}
            className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-bold transition-all ${
              activeLayer === 'architectural'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Compass className="w-3 h-3 text-blue-300" />
            Arquitetura
          </button>
          <button
            id="nav-layer-elec"
            onClick={() => setActiveLayer('electrical')}
            className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-bold transition-all ${
              activeLayer === 'electrical'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-300" />
            Elétrica
          </button>
          <button
            id="nav-layer-hydr"
            onClick={() => setActiveLayer('hydraulic')}
            className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-bold transition-all ${
              activeLayer === 'hydraulic'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Droplet className="w-3 h-3 text-sky-300" />
            Hidráulica
          </button>
          <button
            id="nav-layer-struct"
            onClick={() => setActiveLayer('structural')}
            className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded text-[10px] font-bold transition-all ${
              activeLayer === 'structural'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <LayoutGrid className="w-3 h-3 text-rose-300" />
            Estrutura
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC WORKSPACE PALETTE OPTIONS BASED ON ACTIVE LAYER */}
      {activeLayer === 'architectural' && (
        <>
          {/* Main Architectural Navigation Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 p-1 gap-1">
            <button
              id="tab-build"
              onClick={() => setActiveTab('build')}
              className={`py-1.5 px-1 text-[11px] font-bold rounded-md transition-all text-center flex flex-col items-center gap-0.5 ${
                activeTab === 'build'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Cômodos</span>
            </button>
            <button
              id="tab-items"
              onClick={() => setActiveTab('items')}
              className={`py-1.5 px-1 text-[11px] font-bold rounded-md transition-all text-center flex flex-col items-center gap-0.5 ${
                activeTab === 'items'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sofa className="w-3.5 h-3.5" />
              <span>Mobília</span>
            </button>
            <button
              id="tab-materials"
              onClick={() => setActiveTab('materials')}
              className={`py-1.5 px-1 text-[11px] font-bold rounded-md transition-all text-center flex flex-col items-center gap-0.5 ${
                activeTab === 'materials'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Pisos</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* BUILD TAB */}
            {activeTab === 'build' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Estruturas Habitacionais</h3>
                  <p className="text-[11px] text-slate-500 leading-normal mb-3">
                    Clique abaixo para inserir um cômodo normatizado na planta.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {ROOM_TEMPLATES.map((tmpl) => (
                      <button
                        id={`btn-add-room-${tmpl.type}`}
                        key={tmpl.name}
                        onClick={() => onAddRoom(tmpl.type)}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50 transition-all text-left text-xs font-medium text-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3.5 h-3.5 rounded border border-white" 
                            style={{ backgroundColor: tmpl.color }}
                          />
                          <span>{tmpl.name}</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-slate-200 text-[9px] text-slate-400 font-bold">
                          + Adicionar
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-blue-600" />
                    Manipulação de Paredes
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Você pode reposicionar arrastando os cômodos e redimensionar as paredes usando o handle azul no canto inferior direito da sala selecionada.
                  </p>
                </div>
              </div>
            )}

            {/* ITEMS TAB */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mobiliário de Ambiente</h3>
                  <p className="text-[11px] text-slate-500 leading-normal mb-3">
                    Selecione um cômodo na planta clicando nele no grid para habilitar a inserção de móveis.
                  </p>

                  {selectedRoom ? (
                    <div className="p-2 border border-blue-100 bg-blue-50/50 rounded-lg text-[11px] mb-3 text-blue-700 font-semibold">
                      Inserindo móveis em: <span className="font-bold underline">{selectedRoom.name}</span>
                    </div>
                  ) : (
                    <div className="p-2.5 border border-amber-100 bg-amber-50/50 rounded-lg text-[11px] mb-3 text-amber-800 flex items-start gap-1.5 leading-snug">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>Selecione um cômodo na planta baixa para poder inserir a mobília.</span>
                    </div>
                  )}

                  {['Sala', 'Quarto', 'Cozinha', 'Banheiro', 'Decor'].map((cat) => {
                    const items = FURNITURE_ITEMS.filter(f => f.category === cat);
                    return (
                      <div key={cat} className="mb-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{cat}</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          {items.map((item) => (
                            <button
                              id={`btn-add-item-${item.type}`}
                              key={item.name}
                              disabled={!selectedRoom}
                              onClick={() => onAddFurniture(item.type)}
                              className={`flex flex-col items-center text-center p-2 rounded-lg border transition-all text-[11px] font-semibold ${
                                selectedRoom 
                                  ? 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700' 
                                  : 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-dashed border-slate-200'
                              }`}
                            >
                              <span className="truncate max-w-full">{item.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MATERIALS TAB */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Acabamentos e Revestimentos</h3>
                  <p className="text-[11px] text-slate-500 leading-normal mb-3">
                    Altere o material do piso de cada compartimento para atualizar a planilha de custos.
                  </p>

                  {selectedRoom ? (
                    <div className="p-2 border border-blue-100 bg-blue-50/50 rounded-lg text-[11px] mb-3 text-blue-700 font-semibold">
                      Modificando piso de: <span className="font-bold underline">{selectedRoom.name}</span>
                    </div>
                  ) : (
                    <div className="p-2.5 border border-amber-100 bg-amber-50/50 rounded-lg text-[11px] mb-3 text-amber-800 flex items-start gap-1.5 leading-snug">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>Selecione um cômodo para atualizar seus materiais de acabamento.</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {FLOOR_MATERIALS.map((mat) => (
                      <button
                        id={`btn-mat-${mat.type}`}
                        key={mat.type}
                        disabled={!selectedRoom}
                        onClick={() => onUpdateRoomFloor(selectedRoom!.id, mat.type)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all text-left ${
                          selectedRoom
                            ? 'border-slate-100 bg-slate-50 hover:border-slate-200'
                            : 'opacity-40 cursor-not-allowed bg-slate-50'
                        } ${selectedRoom?.floorMaterial === mat.type ? 'border-blue-600 bg-blue-50/10' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded shrink-0 shadow-xs ${mat.bg}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 flex justify-between items-center">
                            <span className="truncate">{mat.name}</span>
                            {selectedRoom?.floorMaterial === mat.type && (
                              <span className="text-[9px] text-blue-600 font-extrabold bg-blue-50 px-1 py-0.2 rounded shrink-0">Ativo</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{mat.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ELECTRICAL LAYER TAB (FERRAMENTAS ELETRICAS) */}
      {activeLayer === 'electrical' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" /> Instalações Elétricas (NBR 5410)
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal mb-3">
              Selecione o cômodo desejado e adicione os elementos de carga e conduítes. Eles aparecerão em amarelo no grid.
            </p>

            {selectedRoom ? (
              <div className="p-2 border border-blue-100 bg-blue-50/50 rounded-lg text-[11px] mb-3 text-blue-700 font-semibold">
                Inserindo elétrica em: <span className="font-bold underline">{selectedRoom.name}</span>
              </div>
            ) : (
              <div className="p-2.5 border border-amber-100 bg-amber-50/50 rounded-lg text-[11px] mb-3 text-amber-800 flex items-start gap-1.5 leading-snug">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Selecione um cômodo para poder inserir materiais elétricos dentro dele.</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                id="btn-add-light"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('light')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-yellow-100 text-yellow-600 font-bold text-center flex items-center justify-center shrink-0">
                  💡
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Ponto de Luz no Teto (100W)</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Luminária geral de teto vinculada à fiação</p>
                </div>
              </button>

              <button
                id="btn-add-socket"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('socket')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-amber-100 text-amber-600 font-bold text-center flex items-center justify-center shrink-0">
                  🔌
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Tomada Geral TUG (100VA)</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Tomada comum para alimentação de eletrônicos</p>
                </div>
              </button>

              <button
                id="btn-add-switch"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('switch')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 font-bold text-center flex items-center justify-center shrink-0">
                  🎛️
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Interruptor Simples</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Interruptor para ligar a iluminação do cômodo</p>
                </div>
              </button>

              <button
                id="btn-add-qdc"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('qdc')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-slate-800 text-white font-bold text-center flex items-center justify-center shrink-0">
                  📟
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Quadro de Distribuição (QDC)</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Painel disjuntor principal para proteção (QDC)</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HYDRAULIC LAYER TAB (PLUMBING CONEXOES) */}
      {activeLayer === 'hydraulic' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Droplet className="w-4 h-4 text-sky-500 fill-sky-500/20" /> Instalações Hidráulicas (NBR 5626)
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal mb-3">
              Insira louças e ligações hidrossanitárias. A fiação azul (Água Fria) e marrom (Esgoto) será calculada de forma autônoma.
            </p>

            {selectedRoom ? (
              <div className="p-2 border border-blue-100 bg-blue-50/50 rounded-lg text-[11px] mb-3 text-blue-700 font-semibold">
                Inserindo hidráulica em: <span className="font-bold underline">{selectedRoom.name}</span>
              </div>
            ) : (
              <div className="p-2.5 border border-amber-100 bg-amber-50/50 rounded-lg text-[11px] mb-3 text-amber-800 flex items-start gap-1.5 leading-snug">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Selecione um cômodo (ex: Cozinha/Banheiro) para inserir conexões hidráulicas.</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                id="btn-add-shower-hydr"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('shower')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-teal-100 text-teal-600 font-bold text-center flex items-center justify-center shrink-0">
                  🚿
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Box de Chuveiro / Ducha</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Chuveiro com vazão estimada e bueiro ø100mm</p>
                </div>
              </button>

              <button
                id="btn-add-toilet-hydr"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('toilet')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 font-bold text-center flex items-center justify-center shrink-0">
                  🚽
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Vaso Sanitário com Caixa</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Louça sanitária com descarga ecológica</p>
                </div>
              </button>

              <button
                id="btn-add-sink-hydr"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('sink')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 font-bold text-center flex items-center justify-center shrink-0">
                  🚰
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Lavatório / Pia com Misturador</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Torneira com ponto ø20mm de água fria limpa</p>
                </div>
              </button>

              <button
                id="btn-add-caixa-hydr"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('caixa_insp')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-yellow-50 text-amber-700 font-bold text-center flex items-center justify-center shrink-0">
                  ⭕
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Caixa de Inspeção Esgoto</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Caixa receptora sanitária exterior (ø600mm)</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRUCTURAL LAYER TAB (PILAR VIGA REFORCO) */}
      {activeLayer === 'structural' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <LayoutGrid className="w-4 h-4 text-rose-500 fill-rose-500/20" /> Suportes Estruturais (NBR 6118)
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal mb-3">
              Crie pilares de concreto e vigas de transição para apoiar as lajes da residência de forma segura.
            </p>

            {selectedRoom ? (
              <div className="p-2 border border-blue-100 bg-blue-50/50 rounded-lg text-[11px] mb-3 text-blue-700 font-semibold">
                Inserindo estrutura em: <span className="font-bold underline">{selectedRoom.name}</span>
              </div>
            ) : (
              <div className="p-2.5 border border-amber-100 bg-amber-50/50 rounded-lg text-[11px] mb-3 text-amber-800 flex items-start gap-1.5 leading-snug">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Selecione um cômodo para poder cadastrar nós de pilares ou vigas.</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                id="btn-add-pilar"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('pilar')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-red-100 text-red-650 font-bold text-center flex items-center justify-center shrink-0">
                  🏗️
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Pilar de Concreto Armado (15x20)</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Pilarete vertical para ancoragem contra cargas de vento</p>
                </div>
              </button>

              <button
                id="btn-add-viga"
                disabled={!selectedRoom}
                onClick={() => onAddFurniture('viga')}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  selectedRoom ? 'border-slate-100 bg-slate-50 hover:bg-slate-100' : 'opacity-40'
                }`}
              >
                <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 font-bold text-center flex items-center justify-center shrink-0">
                  🧱
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Viga de Sustentação de Borda</div>
                  <p className="text-[10px] text-slate-400 leading-normal">Viga horizontal de transição (15x30cm)</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Element Quick Info Pane */}
      {selectedRoom && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Ambiente Ativo</span>
            <span className="font-mono text-slate-600">
              {selectedRoom.width.toFixed(1)}m × {selectedRoom.height.toFixed(1)}m
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">{selectedRoom.name}</span>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
              Proporções: <strong>{(selectedRoom.width * selectedRoom.height).toFixed(1)} m²</strong>. Toque nos botões de adicionar nas ferramentas para enriquecer este ambiente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
