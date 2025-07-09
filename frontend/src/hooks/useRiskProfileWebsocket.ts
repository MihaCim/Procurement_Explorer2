import { useCallback, useEffect, useState } from 'react';

import { useWebSocket } from '../context/WebSocketContext';
import { DueDiligenceProfile } from '../models/DueDiligenceProfile';

export type RiskProfilGenerationStatus = 'PENDING' | 'DONE' | 'ERROR';

export interface RiskProfileGenerationState {
  status: RiskProfilGenerationStatus;
  profile?: DueDiligenceProfile;
}

const useRiskProfileWebsocket = () => {
  const [generationState, setGenerationState] =
    useState<RiskProfileGenerationState>({
      status: 'PENDING',
    });
  const { subscribe, unsubscribe } = useWebSocket();

  const profileListener = useCallback((payload: DueDiligenceProfile) => {
    console.log('profile payload received:', payload);
    setGenerationState((prev) => ({ ...prev, profile: payload }));
  }, []);

  const finalReportListener = useCallback(
    (payload: DueDiligenceProfile) => {
      console.log('final report received:', payload);
      setGenerationState(() => ({ status: 'DONE', profile: payload }));
      unsubscribe('profile', finalReportListener);
    },
    [unsubscribe],
  );

  useEffect(() => {
    subscribe('profile', profileListener);
    return () => {
      unsubscribe('profile', profileListener);
    };
  }, [profileListener, subscribe, unsubscribe]);

  useEffect(() => {
    subscribe('profile', finalReportListener);
    return () => {
      unsubscribe('profile', finalReportListener);
    };
  }, [finalReportListener, subscribe, unsubscribe]);

  return generationState;
};

export default useRiskProfileWebsocket;
