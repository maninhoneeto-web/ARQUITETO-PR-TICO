import React, { useState, useRef } from 'react';
import { 
  Sparkles, UploadCloud, Send, MessageSquare, ShieldCheck, Cpu, ArrowRight, Image as ImageIcon, Loader2
} from 'lucide-react';
import { AgentMessage, FloorPlanData } from '../types';

interface AgentPanelProps {
  agentDebates: AgentMessage[];
  onUploadBlueprint: (base64Image: string, userInstruction: string) => Promise<void>;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onSelectPreset: (presetType: 'studio' | 'rural') => void;
}

export function AgentPanel({
  agentDebates,
  onUploadBlueprint,
  onSendMessage,
  isLoading,
  onSelectPreset,
}: AgentPanelProps) {
  const [inputText, setInputText] = useState('');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert uploaded image file directly to base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, faça upload apenas de arquivos de imagem (JPEG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setBase64Image(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Submit image processing to backend Vision agent
  const handleAnalyzeImage = async () => {
    if (!base64Image) return;
    const instruction = inputText.trim() || 'Gere a planta baixa detalhada a partir deste rascunho de casa.';
    
    await onUploadBlueprint(base64Image, instruction);
    
    // reset image after import is finished
    setBase64Image(null);
    setInputText('');
  };

  const handleSendPromptOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  return (
    <div className="w-full lg:w-96 bg-white border-l border-slate-100 flex flex-col h-full shrink-0 shadow-sm overflow-hidden">
      
      {/* PANEL TITLE WRAPPER */}
      <div className="p-4 border-b border-slate-100 bg-linear-to-r from-blue-50/50 to-indigo-50/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              Agentes Autônomos IA
              <span className="bg-amber-100 text-amber-700 text-[9px] px-1 py-0.2 rounded font-bold">ALPHA</span>
            </h2>
            <p className="text-[10px] text-slate-400">Debate espacial em tempo real</p>
          </div>
        </div>
      </div>

      {/* QUICK PRESETS INSERTS */}
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-col gap-1.5 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planos Pré-configurados</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            id="preset-studio"
            onClick={() => onSelectPreset('studio')}
            className="p-1 px-2 border border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 text-left text-[11px] font-semibold text-slate-800 rounded-md transition-all shadow-2xs"
          >
            Apartamento Studio
            <div className="text-[9px] text-slate-450 font-normal">Compacto • 38 m²</div>
          </button>
          <button
            id="preset-rural"
            onClick={() => onSelectPreset('rural')}
            className="p-1 px-2 border border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 text-left text-[11px] font-semibold text-slate-800 rounded-md transition-all shadow-2xs"
          >
            Casa Rural Rústica
            <div className="text-[9px] text-slate-450 font-normal">Espaçosa • 72 m²</div>
          </button>
        </div>
      </div>

      {/* CHAT AGENTS THREAD AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-slate-50/30">
        
        {agentDebates.length === 0 ? (
          <div className="my-8 text-center px-4 space-y-3">
            <Sparkles className="w-10 h-10 text-blue-500 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">Crie ou Ajuste com I.A.</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Faça o upload do rascunho em papel da planta, fotos de móveis ou envie ordens para que o arquiteto faça as modificações por voz/texto.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Discussão de Projeto</span>
            
            {agentDebates.map((log) => {
              const isVision = log.agent === 'vision';
              const isDesigner = log.agent === 'designer';
              
              let avatarBg = 'bg-blue-100 text-blue-700';
              let agentTitle = 'Agente de Visão Espacial';
              if (isDesigner) {
                avatarBg = 'bg-pink-100 text-pink-700';
                agentTitle = 'Designer de Interiores';
              } else if (log.agent === 'engineer') {
                avatarBg = 'bg-emerald-100 text-emerald-700';
                agentTitle = 'Físico Estrutural & Técnico';
              }

              return (
                <div 
                  key={log.id} 
                  className="bg-white p-3 rounded-lg border border-slate-150/80 shadow-3xs hover:shadow-2xs transition-all space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded text-[10px] font-bold ${avatarBg}`}>
                      {log.agent.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800">{agentTitle}</h4>
                      <span className="text-[9px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {log.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* LOADING SIMULATOR BAR */}
        {isLoading && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-bold text-blue-800">Agentes Cooperativos Co-projetistas...</div>
              <p className="text-[10px] text-blue-600 leading-normal">
                Analisando contornos, calculando integridade de vigas e arranjo de móveis.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DRAG-DROP PHOTO INPUT & WRITE TEXT FIELD */}
      <div className="p-4 border-t border-slate-100 space-y-3 shrink-0 bg-white">
        
        {/* Render selected attachment file indicator */}
        {base64Image ? (
          <div className="p-2 border border-amber-200 bg-amber-50/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-600" />
              <div className="text-[10px] text-slate-600">
                <span className="font-bold">Foto Carregada</span> (Pronto para processar)
              </div>
            </div>
            <button
              id="clear-attachment"
              onClick={() => setBase64Image(null)}
              className="text-[11px] font-bold text-red-600 hover:underline"
            >
              Remover
            </button>
          </div>
        ) : (
          /* Drag and drop sandbox */
          <div
            id="drag-drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-lg p-3 text-center transition-all ${
              dragOver 
                ? 'border-blue-500 bg-blue-50/30' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <div className="text-[11px] font-semibold text-slate-700">Faça upload ou arraste foto de rascunhos</div>
            <p className="text-[9px] text-slate-400 mt-0.5">JPEG, PNG • Escaneie rascunhos manuais</p>
          </div>
        )}

        {/* INPUT PROMPT TEXT & TRIGGER BUTTONS */}
        <form onSubmit={handleSendPromptOnly} className="space-y-2">
          <div className="relative">
            <textarea
              id="chat-prompt-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                base64Image 
                  ? "Instrua os agentes sobre essa foto... (ex: 'Converta em planta padrão')"
                  : "Diga o que mudar: 'Adicione uma banheira', 'Aumente o quarto'..."
              }
              rows={3}
              className="w-full p-2.5 pr-10 border border-slate-250 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-blue-600 leading-normal resize-none bg-slate-50/20"
            />
            
            {/* Direct Send button if prompt-only */}
            {!base64Image && (
              <button
                id="submit-text-prompt"
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="absolute right-2 bottom-3 p-1.5 rounded-md bg-slate-100 hover:bg-blue-600 text-slate-550 hover:text-white transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* If there is an image to submit, we trigger a dedicated Action button */}
          {base64Image && (
            <button
              id="submit-image-and-prompt"
              type="button"
              onClick={handleAnalyzeImage}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Enviar Foto para Processamento IA
            </button>
          )}
        </form>
      </div>

    </div>
  );
}
