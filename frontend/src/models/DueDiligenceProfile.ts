export interface DueDiligenceProfile {
  id: number;
  name: string;
  url: string;
  email: string;
  founded: number;
  founder: string;
  address: Address;
  country: string;
  Last_revision: string;
  risk_level: number;
  status: string;
  description: string;
  key_individuals: KeyIndividuals;
  security_risk: SecurityRisk;
  financial_risk: FinancialRisk;
  operational_risk: OperationalRisk;
  key_relationships: KeyRelationships;
  due_diligence_timestamp: string;
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
