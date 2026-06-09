import React, { useState } from 'react';
import { 
  Square, Sofa, DoorClosed, LayoutGrid, Hammer, Plus, RotateCw, Trash2, Home
} from 'lucide-react';
import { FurnitureType, FloorMaterial, Room } from '../types';

interface SidebarPaletteProps {
  onAddRoom: (type: string) => void;
  onAddFurniture: (type: FurnitureType) => void;
  selectedRoom: Room | null;
  onUpdateRoomFloor: (roomId: string, material: FloorMaterial) => void;
  activeTab: 'build' | 'items' | 'materials';
  setActiveTab: (tab: 'build' | 'items' | 'materials') => void;
}

const ROOM_TEMPLATES = [
  { name: 'Sala de Estar', type: 'Sala de Estar', color: '#e2f0fb' },
  { name: 'Dormitório', type: 'Dormitório', color: '#fce7f3' },
  { name: 'Cozinha', type: 'Cozinha', color: '#fef3c7' },
  { name: 'Banheiro', type: 'Banheiro', color: '#ccfbf1' },
  { name: 'Varanda Alaranjada', type: 'Varanda', color: '#fef2f2' },
  { name: 'Escritório Home Office', type: 'Escritório', color: '#f3e8ff' },
];

const FURNITURE_ITEMS: { name: string; type: FurnitureType; icon: any; category: string }[] = [
  // Living room
  { name: 'Sofá Macio', type: 'couch', icon: Sofa, category: 'Sala' },
  { name: 'Televisão & Rack', type: 'tv', icon: Sofa, category: 'Sala' },
  { name: 'Mesa de Centro', type: 'table', icon: Sofa, category: 'Sala' },
  { name: 'Cadeira de Design', type: 'chair', icon: Sofa, category: 'Sala' },
  
  // Bedroom
  { name: 'Cama Casal Queen', type: 'bed', icon: LayoutGrid, category: 'Quarto' },
  { name: 'Armário Embutido', type: 'cabinet', icon: LayoutGrid, category: 'Quarto' },
  
  // Kitchen
  { name: 'Geladeira Duplex', type: 'fridge', icon: Hammer, category: 'Cozinha' },
  { name: 'Fogão de Indução', type: 'stove', icon: Hammer, category: 'Cozinha' },
  { name: 'Balcão Planejado', type: 'cabinet', icon: Hammer, category: 'Cozinha' },
  
  // Bathroom
  { name: 'Chuveiro & Box', type: 'shower', icon: Square, category: 'Banheiro' },
  { name: 'Pia Clean', type: 'sink', icon: Square, category: 'Banheiro' },
  { name: 'Vaso com Bacia', type: 'toilet', icon: Square, category: 'Banheiro' },
  
  // Decoration
  { name: 'Costela de Adão (Planta)', type: 'plant', icon: Sofa, category: 'Decor' },
];

const FLOOR_MATERIALS: { name: string; type: FloorMaterial; bg: string; description: string }[] = [
  { name: 'Madeira Laminada', type: 'wood', bg: 'bg-amber-800', description: 'Visual quente de freijó nativo' },
  { name: 'Porcelanato', type: 'tile', bg: 'bg-stone-300', description: 'Superfície asséptica impermeável' },
  { name: 'Cimento Queimado', type: 'concrete', bg: 'bg-neutral-500', description: 'Estilo industrial contemporâneo' },
  { name: 'Carpete Felpudo', type: 'carpet', bg: 'bg-zinc-400', description: 'Aconchego acústico extra' },
  { name: 'Mármore Carrara', type: 'marble', bg: 'bg-slate-100 border border-slate-300', description: 'Luxuosa pedra branca fria' },
];

export function SidebarPalette({
  onAddRoom,
  onAddFurniture,
  selectedRoom,
  onUpdateRoomFloor,
  activeTab,
  setActiveTab,
}: SidebarPaletteProps) {
  return (
    <div className="w-full lg:w-80 bg-white border-r border-slate-100 flex flex-col h-full shrink-0 shadow-sm">
      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 p-1 gap-1">
        <button
          id="tab-build"
          onClick={() => setActiveTab('build')}
          className={`py-2 px-3 text-xs font-semibold rounded-md transition-all text-center flex flex-col items-center gap-1 ${
            activeTab === 'build'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Square className="w-4 h-4" />
          <span>Cômodos</span>
        </button>
        <button
          id="tab-items"
          onClick={() => setActiveTab('items')}
          className={`py-2 px-3 text-xs font-semibold rounded-md transition-all text-center flex flex-col items-center gap-1 ${
            activeTab === 'items'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sofa className="w-4 h-4" />
          <span>Mobília</span>
        </button>
        <button
          id="tab-materials"
          onClick={() => setActiveTab('materials')}
          className={`py-2 px-3 text-xs font-semibold rounded-md transition-all text-center flex flex-col items-center gap-1 ${
            activeTab === 'materials'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>Pisos</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* BUILD TAB */}
        {activeTab === 'build' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Estruturas de Espaço</h3>
              <p className="text-xs text-slate-500 leading-snug mb-3">
                Clique nos botões abaixo para inserir um cômodo de dimensões padrões no plano cartesiano.
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                {ROOM_TEMPLATES.map((tmpl) => (
                  <button
                    id={`btn-add-room-${tmpl.type}`}
                    key={tmpl.name}
                    onClick={() => onAddRoom(tmpl.type)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50 transition-all text-left text-xs font-medium text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-white" 
                        style={{ backgroundColor: tmpl.color }}
                      />
                      <span>{tmpl.name}</span>
                    </div>
                    <div className="bg-white/80 p-1 rounded border border-slate-100 text-[10px] text-slate-400">
                      + Adicionar
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-blue-600" />
                Interação Direta
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Você pode mover as salas arrastando-as no plano e dimensioná-la através do seletor e do menu rápido inferior.
              </p>
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mobiliário & Acessórios</h3>
              <p className="text-xs text-slate-500 leading-snug mb-3">
                Para inserir, tenha certeza de ter um cômodo selecionado (clique sobre ele no grid) e adicione o item.
              </p>

              {selectedRoom ? (
                <div className="p-2 border border-blue-100 bg-blue-50/50 rounded-lg text-xs mb-4 text-blue-700">
                  Adicionando itens em: <span className="font-bold">{selectedRoom.name}</span>
                </div>
              ) : (
                <div className="p-2 border border-amber-100 bg-amber-50/50 rounded-lg text-xs mb-4 text-amber-700 leading-snug">
                  📌 <strong>Aviso:</strong> Selecione um cômodo na planta baixa para poder inserir mobília dentro dele.
                </div>
              )}

              {['Sala', 'Quarto', 'Cozinha', 'Banheiro', 'Decor'].map((cat) => {
                const items = FURNITURE_ITEMS.filter(f => f.category === cat);
                return (
                  <div key={cat} className="mb-4">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{cat}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => (
                        <button
                          id={`btn-add-item-${item.type}`}
                          key={item.name}
                          disabled={!selectedRoom}
                          onClick={() => onAddFurniture(item.type)}
                          className={`flex flex-col items-center text-center p-2 rounded-lg border transition-all text-xs font-medium ${
                            selectedRoom 
                              ? 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-800' 
                              : 'opacity-50 cursor-not-allowed bg-slate-50/20 text-slate-400 border-dashed border-slate-200'
                          }`}
                        >
                          <span className="text-slate-600 font-normal truncate max-w-full text-[11px] mb-1">{item.name}</span>
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Revestimentos & Pisos</h3>
              <p className="text-xs text-slate-500 leading-snug mb-3">
                Selecione o cômodo desejado e aplique as texturas de piso recomendadas para sua casa.
              </p>

              {selectedRoom ? (
                <div className="p-2 border border-blue-100 bg-blue-50/50 rounded-lg text-xs mb-3 text-blue-700">
                  Modificando o piso de: <span className="font-bold">{selectedRoom.name}</span>
                </div>
              ) : (
                <div className="p-2 border border-amber-100 bg-amber-50/50 rounded-lg text-xs mb-3 text-amber-700 leading-snug">
                  📌 Selecione um cômodo para atualizar seus materiais de acabamento.
                </div>
              )}

              <div className="space-y-2">
                {FLOOR_MATERIALS.map((mat) => (
                  <button
                    id={`btn-mat-${mat.type}`}
                    key={mat.type}
                    disabled={!selectedRoom}
                    onClick={() => onUpdateRoomFloor(selectedRoom!.id, mat.type)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                      selectedRoom
                        ? 'border-slate-100 bg-slate-50 hover:border-slate-300'
                        : 'opacity-40 cursor-not-allowed bg-slate-50'
                    } ${selectedRoom?.floorMaterial === mat.type ? 'border-amber-600 bg-amber-50/10' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-md shrink-0 shadow-sm ${mat.bg}`} />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-800 flex justify-between items-center">
                        <span>{mat.name}</span>
                        {selectedRoom?.floorMaterial === mat.type && (
                          <span className="text-[10px] text-amber-600 font-bold">Ativo</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{mat.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Element quick control info */}
      {selectedRoom && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Cômodo Selecionado</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded shadow-xs border border-slate-200">
              <span className="text-[10px] text-slate-600 font-mono">
                {selectedRoom.width.toFixed(1)}m × {selectedRoom.height.toFixed(1)}m
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">{selectedRoom.name}</span>
            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
              Área de { (selectedRoom.width * selectedRoom.height).toFixed(1) } m², revestimento em{' '}
              <strong className="text-slate-600">{
                selectedRoom.floorMaterial === 'wood' ? 'Madeira' :
                selectedRoom.floorMaterial === 'tile' ? 'Porcelanato' :
                selectedRoom.floorMaterial === 'concrete' ? 'Cimento' :
                selectedRoom.floorMaterial === 'carpet' ? 'Carpete' : 'Mármore'
              }</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
