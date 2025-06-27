export interface DueDiligenceProfile {
  id?: number;
  name: string;
  website?: string;
  contacts?: Record<string, string>;
  founded?: number;
  founder?: string;
  address?: Record<string, string>;
  country?: string;
  last_revision?: string; // ISO 8601 datetime string
  risk_level?: number;
  description?: string;
  key_individuals?: Record<string, string>;
  security_risk?: Record<string, string>;
  financial_risk?: Record<string, string>;
  operational_risk?: Record<string, string>;
  key_relationships?: Record<string, string>;
  due_diligence_timestamp?: string; // ISO 8601 datetime string
}

export interface Address {
  zip: string;
  city: string;
  state: string;
  street: string;
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
