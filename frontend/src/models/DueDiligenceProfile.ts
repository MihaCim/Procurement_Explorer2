export interface DueDiligenceProfile {
  company_name: string;
  url: string;
  founded: string;
  founder: string;
  address: Address;
  description: string;
  due_diligence_timestamp?: string; // ISO 8601 datetime string

  //THESE SEEMS INJECTED IN ADDITION OF LLM RESULT
  metadata?: Record<string, string>;
  status?: 'running' | 'finished' | 'not_available';
  // END

  key_individuals: {
    [role: string]: unknown;
  };
  security_risks: {
    [key: string]: unknown;
  };
  financial_risks: {
    [key: string]: unknown;
  };
  key_relationships: {
    [key: string]: unknown;
  };
  operational_risks: {
    [key: string]: unknown;
  };

  risk_level: {
    [key: string]: unknown;
  };
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
