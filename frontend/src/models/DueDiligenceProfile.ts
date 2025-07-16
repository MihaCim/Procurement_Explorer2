export interface DueDiligenceProfile {
  name: string;
  url: string;
  founded: string;
  founder: string;
  address: unknown;
  description: string;
  due_diligence_timestamp?: string; // ISO 8601 datetime string

  //THESE SEEMS INJECTED IN ADDITION OF LLM RESULT
  metadata?: Record<string, string>;
  status?: string;
  // END

  key_individuals: unknown;

  security_risks: unknown;

  financial_risks: unknown;

  key_relationships: unknown;

  operational_risks: unknown;

  risk_level: unknown;

  risk_level_int: number;
  summary?: string; //Is it used or is it description ?
}

export interface KeyRelationship {
  name: string;
  details: string;
}

export interface DueDiligenceLog {
  [key: string]: string;
}

export interface DueDiligenceResult extends DueDiligenceProfile {
  logs: DueDiligenceLog[];
  errors?: string[];
}

export interface DueDiligenceCreationResult {
  msg: string;
  status: 'ok' | 'nok';
}

export interface Address {
  street: string;
  city: string;
  country: string;
}

export interface KeyIndividuals {
  [key: string]: string;
}

export interface SecurityRisk {
  level: string;
  details: string;
}

export interface FinancialRisk {
  level: string;
  details: string;
}

export interface OperationalRisk {
  level: string;
  details: string;
}

export interface KeyRelationships {
  partners: string[];
}

export const NOT_AVAILABLE_STATUS = 'not available';
export const QUEUED_STATUS = 'queued';
export const RUNNING_STATUS = 'running';
export const GENERATED_STATUS = 'generated';
export const APPROVED_STATUS = 'approved';

export const STATUS_LIST = [
  NOT_AVAILABLE_STATUS,
  QUEUED_STATUS,
  RUNNING_STATUS,
  GENERATED_STATUS,
  APPROVED_STATUS,
];

export const isStatusGenerated = (status?: string): boolean => {
  return status === GENERATED_STATUS || status === APPROVED_STATUS;
};
