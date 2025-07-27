export interface Client {
  id?: string;
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string[];
  GroupTag: string;
  AttributesJSON: Record<string, any>;
}

export interface Worker {
  id?: string;
  WorkerID: string;
  WorkerName: string;
  Skills: string[];
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: string;
}

export interface Task {
  id?: string;
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string[];
  PreferredPhases: number[];
  MaxConcurrent: number;
}

export interface ValidationResult {
  entity: string;
  row: number;
  message: string;
}

export interface Rule {
  type: string;
  tasks?: string[];
  group?: string;
  minCommonSlots?: number;
  maxSlotsPerPhase?: number;
  allowedPhases?: number[];
  pattern?: string;
  overrideType?: 'global' | 'specific';
  priority?: number;
}

export interface Correction {
  entity: string;
  row: number;
  field: string;
  suggestedValue: any;
}
