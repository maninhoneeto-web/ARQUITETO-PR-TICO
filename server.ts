import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger JSON body limits to support base64 photo uploads
app.use(express.json({ limit: '15mb' }));

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
const geminiKey = process.env.GEMINI_API_KEY;

if (geminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini client initialized successfully!');
  } catch (err) {
    console.error('Error initializing Gemini client:', err);
  }
} else {
  console.log('No GEMINI_API_KEY found. Server will run in mock / simulation mode for AI actions.');
}

// 2D & 3D Conversational Architectural Agent Endpoint
app.post('/api/analyze-blueprint', async (req, res) => {
  try {
    const { image, prompt, currentPlan } = req.body;

    if (!ai) {
      return res.status(200).json({
        error: 'No key configured',
        message: 'A chave da API do Gemini não está configurada no painel de Secrets. Executando simulação de arquitetura...',
        simulated: true,
      });
    }

    const systemInstruction = `Você é um ecossistema de Agentes de Arquitetura Autônomos trabalhando juntos para projetar ou ajustar a planta de uma casa em 2D e 3D.
Os membros da equipe são:
1. Agente de Visão (Vision Agent): Interpreta o rascunho, imagem ou comando espacial do usuário, localizando cômodos, paredes, aberturas de portas e janelas.
2. Agente de Design de Interiores (Interior Designer): Otimiza o aproveitamento de espaço, define os tipos de piso (madeira, porcelanato, mármore), posiciona a mobília de forma fluida.
3. Agentes de Engenharia Rígida (Technical Engineer): Calcula orçamento estimado em Reais (BRL), áreas quadradas dos cômodos, garante sustentabilidade, ventilação e segurança.

Instruções para geração ou modificação de layouts:
- Respeite fielmente os limites de coordenadas (de 0 a 12 metros horizontais e verticais). Os cômodos NUNCA devem ultrapassar a área utilizável ou se sobrepor bizarramente, a menos que compartilhem paredes paralelas.
- Se o usuário forneceu uma PLANTA ATUAL (currentPlan) e pediu alterações (ex: "adicione um banheiro na suíte" ou "mude o piso da sala"), você DEVE partir do estado da planta atual e aplicar as modificações lógicas requisitadas!
- Cada objeto de porta (doors) ou janela (windows) deve possuir um "roomId" válido do cômodo em que está inserido. O campo "wall" deve ser "top", "bottom", "left" ou "right", e o "offset" (em metros) define o deslocamento a partir do canto superior esquerdo (para paredes top/bottom) ou superior (para paredes left/right) daquele cômodo específico.
- Mobílias (furniture) devem ser posicionadas com "x" e "y" lógicos relativos às dimensões internas do "roomId" onde estão. Ex: se o quarto tem width: 4m e height: 4m, a mobília dele deve ter x e y entre 0 e 4 metros.
- Escreva réplicas realistas do debate entre os agentes detalhando o raciocínio na área "agentDebates" com os agentes 'vision', 'designer' e 'engineer'.`;

    const contents: any[] = [];

    if (image) {
      // Strip any base64 headers
      const strippedImage = image.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: strippedImage,
        },
      });
    }

    const currentPlanContext = currentPlan
      ? `\nPlanta Baixa Atual (Use como ponto de partida para modificações):\n${JSON.stringify(currentPlan, null, 2)}`
      : '\nNenhuma planta inicial configurada. Crie uma nova proposta arquitetônica do zero a partir do input.';

    contents.push({
      text: `Instrução do usuário: "${prompt}"${currentPlanContext}\n\nPor favor, processe a solicitação e retorne um modelo de layout de acordo com o esquema JSON configurado.`,
    });

    console.log(`Sending draft/request to Gemini with size of image: ${image ? 'Present' : 'None'}. Prompt: "${prompt}"`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rooms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  x: { type: Type.NUMBER, description: 'Posição horizontal em metros do canto superior esquerdo do cômodo (de 0 a 11 metros)' },
                  y: { type: Type.NUMBER, description: 'Posição vertical em metros do canto superior esquerdo do cômodo (de 0 a 11 metros)' },
                  width: { type: Type.NUMBER, description: 'Largura em metros do cômodo' },
                  height: { type: Type.NUMBER, description: 'Comprimento em metros do cômodo' },
                  color: { type: Type.STRING, description: 'Código hexadecimal claro e moderno de destaque da sala para o plano 2D' },
                  floorMaterial: { type: Type.STRING, description: 'wood, tile, concrete, carpet ou marble' },
                  wallColor: { type: Type.STRING, description: 'Cor hex das paredes em formato "#FFFFFF" ou tom pastel' },
                },
                required: ['id', 'name', 'x', 'y', 'width', 'height', 'color', 'floorMaterial', 'wallColor'],
              },
            },
            doors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  roomId: { type: Type.STRING, description: 'ID do cômodo que contém essa porta' },
                  wall: { type: Type.STRING, description: 'top, bottom, left ou right' },
                  offset: { type: Type.NUMBER, description: 'Distância em metros do início da parede correspondente' },
                  width: { type: Type.NUMBER, description: 'Largura típica como 0.8 ou 0.9 metros' },
                  isOpen: { type: Type.BOOLEAN },
                },
                required: ['id', 'roomId', 'wall', 'offset', 'width', 'isOpen'],
              },
            },
            windows: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  roomId: { type: Type.STRING, description: 'ID do cômodo que contém essa janela' },
                  wall: { type: Type.STRING, description: 'top, bottom, left ou right' },
                  offset: { type: Type.NUMBER, description: 'Distância em metros do início da parede correspondente para alinhar a janela' },
                  width: { type: Type.NUMBER, description: 'Largura da janela (ex: 1.2, 1.5, 2.0)' },
                },
                required: ['id', 'roomId', 'wall', 'offset', 'width'],
              },
            },
            furniture: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'couch, bed, table, chair, plant, tv, sink, toilet, shower, fridge, stove, cabinet' },
                  roomId: { type: Type.STRING },
                  x: { type: Type.NUMBER, description: 'Coordenada horizontal relativa interna dentro do cômodo (entre 0 e o width do room)' },
                  y: { type: Type.NUMBER, description: 'Coordenada vertical relativa interna dentro do cômodo (entre 0 e o height do room)' },
                  width: { type: Type.NUMBER, description: 'Largura do móvel em metros' },
                  height: { type: Type.NUMBER, description: 'Comprimento do móvel em metros' },
                  rotation: { type: Type.NUMBER, description: 'Rotação do móvel em graus (0, 90, 180, 270)' },
                },
                required: ['id', 'name', 'type', 'roomId', 'x', 'y', 'width', 'height', 'rotation'],
              },
            },
            estimatedCost: {
              type: Type.OBJECT,
              properties: {
                structural: { type: Type.NUMBER, description: 'Custo de alvenaria estrutural em BRL (R$)' },
                flooring: { type: Type.NUMBER, description: 'Custo de fornecimento e assentamento de pisos em BRL (R$)' },
                installations: { type: Type.NUMBER, description: 'Custo de conexões elétricas e hidráulicas em BRL (R$)' },
                total: { type: Type.NUMBER, description: 'Soma total de custos em BRL (R$)' },
                materialsBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      item: { type: Type.STRING, description: 'Descrição elegante do item ou serviço' },
                      quantity: { type: Type.STRING, description: 'Unidade de medida ou quantidade aplicada' },
                      cost: { type: Type.NUMBER, description: 'Custo em BRL' },
                    },
                    required: ['item', 'quantity', 'cost'],
                  },
                },
              },
              required: ['structural', 'flooring', 'installations', 'total', 'materialsBreakdown'],
            },
            agentDebates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  agent: { type: Type.STRING, description: 'vision, designer ou engineer' },
                  message: { type: Type.STRING, description: 'Raciocínio ou contribuição especializada para a planta' },
                  timestamp: { type: Type.STRING, description: 'Carimbo de hora, ex: ' },
                },
                required: ['id', 'agent', 'message', 'timestamp'],
              },
            },
          },
          required: ['rooms', 'doors', 'windows', 'furniture', 'estimatedCost', 'agentDebates'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Retorno vazio da API de inteligência artificial.');
    }

    const parsedPlan = JSON.parse(textOutput.trim());
    return res.status(200).json(parsedPlan);

  } catch (error: any) {
    console.error('Failure in blueprint analysis / update:', error);
    return res.status(500).json({
      error: 'Failed to process blueprint',
      details: error.message || error,
    });
  }
});

// Configure Vite middleware and static delivery
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production-built assets from /dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Architect IA Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
