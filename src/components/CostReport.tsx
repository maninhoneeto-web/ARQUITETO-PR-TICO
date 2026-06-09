import React from 'react';
import { 
  Building, DollarSign, Leaf, Ruler, Activity, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { FloorPlanData, MaterialCostItem } from '../types';

interface CostReportProps {
  floorPlan: FloorPlanData;
}

export function CostReport({ floorPlan }: CostReportProps) {
  const { rooms, windows, doors, furniture, estimatedCost } = floorPlan;

  // Real-time calculation of house areas
  const totalArea = rooms.reduce((sum, r) => sum + r.width * r.height, 0);
  const totalFurniture = furniture.length;
  const totalWindows = windows.length;
  const totalDoors = doors.length;

  // Ventilation Ratio (total window widths vs. floor area)
  // Standard building regulation (e.g. Brazilian NBR 15220) suggests window areas should be at least 1/8 (12.5%) or 10% of floor area
  const totalWindowWidth = windows.reduce((sum, w) => sum + w.width, 0);
  const ventilationRatio = totalArea > 0 ? (totalWindowWidth / totalArea) * 100 : 0;
  
  let ventilationRating = 'Selo C - Baixa Ventilação';
  let ventilationColor = 'text-red-600 bg-red-50 border-red-200';
  let ventilationAdvice = 'Considere adicionar mais janelas para otimizar a iluminação natural e o fluxo de ar.';

  if (ventilationRatio >= 11) {
    ventilationRating = 'Selo A - Conforto Térmico Máximo';
    ventilationColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    ventilationAdvice = 'Excelente ventilação cruzada. Ótimo aproveitamento térmico passivo.';
  } else if (ventilationRatio >= 6) {
    ventilationRating = 'Selo B - Conforto Médio';
    ventilationColor = 'text-amber-700 bg-amber-50 border-amber-200';
    ventilationAdvice = 'Adequado para a maioria dos climas. Pode requerer ar-condicionado em picos de verão.';
  }

  // Dynamic cost estimates based on real current space dimensions
  // Simulates a realistic contractor quote in Brazilian Reais (BRL)
  const structuralCost = rooms.reduce((sum, r) => sum + (r.width * r.height) * 450, 0) + (totalDoors * 900) + (totalWindows * 1400);
  const flooringCost = rooms.reduce((sum, r) => {
    let pricePerSquareMeter = 100; // carpet/concrete
    if (r.floorMaterial === 'wood') pricePerSquareMeter = 250;
    else if (r.floorMaterial === 'tile') pricePerSquareMeter = 110;
    else if (r.floorMaterial === 'marble') pricePerSquareMeter = 550;
    return sum + (r.width * r.height) * pricePerSquareMeter;
  }, 0);
  const installationCost = (rooms.length * 4000) + (totalFurniture * 450);
  const calculatedTotal = structuralCost + flooringCost + installationCost;

  // Format monetary value to BRL (R$) format
  const formatCost = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start border-b border-slate-150 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Building className="w-4.5 h-4.5 text-blue-600" />
            Relatório de Quantitativos e Engenharia
          </h3>
          <p className="text-xs text-slate-450 mt-0.5">Mapeamento estrutural calculado em tempo real</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Área Construída</span>
          <span className="text-lg font-mono font-bold text-blue-700">{totalArea.toFixed(1)} m²</span>
        </div>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Cômodos</span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">{rooms.length}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Portas</span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">{totalDoors}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Janelas</span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">{totalWindows}</span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Mobiliário</span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">{totalFurniture}</span>
        </div>
      </div>

      {/* DETAILED BUDGET ESTIMATION */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Orçamento de Construção Estimado (R$)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-slate-205 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">Serralheria & Alvenaria</span>
              <span className="text-xs font-bold font-mono text-slate-800">{formatCost(structuralCost)}</span>
            </div>
          </div>
          <div className="border border-slate-205 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">Revestimento & Pisagem</span>
              <span className="text-xs font-bold font-mono text-slate-800">{formatCost(flooringCost)}</span>
            </div>
          </div>
          <div className="border border-slate-205 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">Serviços & Infraestrutura</span>
              <span className="text-xs font-bold font-mono text-slate-800">{formatCost(installationCost)}</span>
            </div>
          </div>
        </div>

        {/* GRAND TOTAL ROW */}
        <div className="p-3 bg-linear-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-100 rounded-lg flex justify-between items-center">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Estimado de Obra</span>
          <span className="text-base font-mono font-bold text-emerald-700">{formatCost(calculatedTotal)}</span>
        </div>
      </div>

      {/* VENTILATION & SUSTAINABILITY RATING */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-emerald-500" />
          Ventilação e Conforto Sustentável
        </h4>

        <div className={`p-3.5 border rounded-lg ${ventilationColor} space-y-1.5`}>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold">{ventilationRating}</span>
            <span className="text-xs font-mono font-bold">{ventilationRatio.toFixed(1)}% de vão</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            {ventilationAdvice} Estudo preliminar com base nas dimensões acumuladas de {totalArea.toFixed(1)} m² de área e {totalWindowWidth.toFixed(1)}m de esquadrias e janelas.
          </p>
        </div>
      </div>

      {/* ROOMS PROPORTIONS SVG BAR GRAPH */}
      {rooms.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-500" />
            Distribuição de Área por Ambiente
          </h4>

          <div className="space-y-2 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
            {rooms.map((room) => {
              const rArea = room.width * room.height;
              const percentage = totalArea > 0 ? (rArea / totalArea) * 100 : 0;
              return (
                <div key={room.id} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-700">{room.name}</span>
                    <span className="font-mono text-slate-500 font-bold">
                      {rArea.toFixed(1)} m² ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Dynamic Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: room.color || '#3b82f6' 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
