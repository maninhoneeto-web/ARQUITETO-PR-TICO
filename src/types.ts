export type FloorMaterial = 'wood' | 'tile' | 'concrete' | 'carpet' | 'marble';

export interface Room {
  id: string;
  name: string;
  x: number; // in meters
  y: number; // in meters
  width: number; // in meters
  height: number; // in meters
  color: string; // HEX code for UI
  floorMaterial: FloorMaterial;
  wallColor: string;
}

export interface Door {
  id: string;
  roomId: string;
  wall: 'top' | 'bottom' | 'left' | 'right';
  offset: number; // in meters from top-left of that wall
  width: number; // in meters
  isOpen: boolean;
}

export interface Window {
  id: string;
  roomId: string;
  wall: 'top' | 'bottom' | 'left' | 'right';
  offset: number; // in meters from top-left of that wall
  width: number; // in meters
}

export type FurnitureType =
  | 'couch'
  | 'bed'
  | 'table'
  | 'chair'
  | 'plant'
  | 'tv'
  | 'sink'
  | 'toilet'
  | 'shower'
  | 'fridge'
  | 'stove'
  | 'cabinet';

export interface Furniture {
  id: string;
  name: string;
  type: FurnitureType;
  roomId: string;
  x: number; // in meters relative to room top-left
  y: number; // in meters relative to room top-left
  width: number; // in meters
  height: number; // in meters
  rotation: number; // in degrees (0, 90, 180, 270)
}

export interface MaterialCostItem {
  item: string;
  quantity: string;
  cost: number;
}

export interface EstimatedCost {
  structural: number;
  flooring: number;
  installations: number;
  total: number;
  materialsBreakdown: MaterialCostItem[];
}

export interface AgentMessage {
  id: string;
  agent: 'vision' | 'designer' | 'engineer';
  message: string;
  timestamp: string;
}

export type EngineeringLayer = 'architectural' | 'electrical' | 'hydraulic' | 'structural';
export type RenderingStyle = 'standard' | 'sketchup' | 'autocad' | 'marketing';

export interface FloorPlanData {
  rooms: Room[];
  doors: Door[];
  windows: Window[];
  furniture: Furniture[];
  estimatedCost: EstimatedCost;
  agentDebates: AgentMessage[];
}
