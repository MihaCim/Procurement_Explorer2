/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { DetailedCompany } from '../models/Company';
import {
  DueDiligenceLog,
  DueDiligenceProfile,
} from '../models/DueDiligenceProfile';
import useCompanyService from '../services/companyService';
import useDueDiligenceService from '../services/dueDiligenceService';

interface DueDiligenceContext {
  state: IDueDiligenceState;
  startDueDiligence: (url: string) => Promise<void>;
}
export interface IDueDiligenceState {
  updating: boolean;
  loadingCompany: boolean;
  loadingProfile: boolean;
  profile: DueDiligenceProfile | null;
  logs: DueDiligenceLog[];
  company: DetailedCompany | null;
  profile_generated: boolean;
  profile_started: boolean;
}

const DueDiligenceContext = createContext({} as DueDiligenceContext);

export const DueDiligenceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { getDueDiligenceProfile, startDueDiligenceProfile } =
    useDueDiligenceService();
  const { getCompanyById } = useCompanyService();
  const { id } = useParams();

  const [profile_generated, set_profile_generated] = React.useState(false);
  const [profile_started, set_profile_started] = React.useState(false);

  const [profile_url, set_profile_url] = React.useState<string | null>(null);

  const { data: company, isLoading: loadingCompany } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(Number(id)),
    enabled: !!getCompanyById && id !== undefined && !isNaN(Number(id)),
  });

  const pathId = useMemo(() => {
    return id && !isNaN(Number(id)) ? Number(id) : null;
  }, [id]);

  const refreshEnabled = useMemo(() => {
    if (pathId)
      return (
        !!getDueDiligenceProfile &&
        !!company &&
        !profile_generated &&
        !!profile_url &&
        profile_started
      );
    else
      return (
        !!getDueDiligenceProfile &&
        !profile_generated &&
        !!profile_url &&
        profile_started
      );
  }, [
    company,
    getDueDiligenceProfile,
    pathId,
    profile_generated,
    profile_url,
    profile_started,
  ]);

  const {
    data,
    isLoading: loadingProfile,
    // refetch,
  } = useQuery({
    queryKey: ['profile', profile_url],
    queryFn: () => getDueDiligenceProfile(Number(id)),
    enabled: refreshEnabled,
    refetchInterval: 2000,
  });

  // const updateQuery = useMutation({
  //   mutationKey: ['updateProfile'],
  //   mutationFn: async (data: any) => {
  //     console.log(data);
  //     const res = await updateDueDiligenceProfile(Number(id), data);
  //     if (res) await refetch();
  //     return data;
  //   },
  // });
  // const updateProfile = async (data: any) => {
  //   updateQuery.mutate(data);
  // };

  const { profile, logs } = data ?? { profile: null, logs: [], errors: [] };

  useEffect(() => {
    if (profile?.status === 'finished' && !profile_generated)
      set_profile_generated(true);
  }, [profile?.status, profile_generated]);

  const startDueDiligence = useCallback(
    async (url: string) => {
      if (url) {
        try {
          await startDueDiligenceProfile(url);
          set_profile_url(url);
          set_profile_started(true);
        } catch (error) {
          console.log(error); //TODO
        }
      }
    },
    [startDueDiligenceProfile],
  );

  // useEffect(() => {
  //   if (profile) {
  //     setRiskLevel(profile.risk_level_int ?? 0);
  //   }
  //   console.log(profile);
  // }, [profile]);

  //Export to PDF

  // const targetRef = React.useRef<HTMLDivElement>(null);

  // const exportToPDF = () => {
  //   {
  //     if (
  //       targetRef == null ||
  //       !('current' in targetRef) ||
  //       targetRef.current == null
  //     )
  //       throw new Error('Ref is null');
  //     //get items to hide or change for the export
  //     const buttons = targetRef.current?.getElementsByTagName('button') ?? [];
  //     const sidePanel =
  //       targetRef.current?.querySelector<HTMLDivElement>('#sidepanel');
  //     try {
  //       for (let i = 0; i < buttons.length; i++) {
  //         buttons[0].style.display = 'none';
  //         console.log(buttons[0]);
  //       }

  //       sidePanel!.style.position = 'static';

  //       generatePDF(targetRef, {
  //         filename: `${profile?.company_name.replace(/ +/g, '_') ?? 'UNKNOW'}_DueDiligence.pdf`,
  //         page: { margin: 5 },
  //         overrides: {
  //           canvas: { windowWidth: 1400 },
  //         },
  //       });
  //     } catch (e) {
  //       console.error(e);
  //     } finally {
  //       for (let i = 0; i < buttons.length; i++) {
  //         buttons[0].style.display = 'block';
  //         console.log(buttons[0]);
  //       }
  //       sidePanel!.style.position = 'sticky';
  //     }
  //   }
  // };
  return (
    <DueDiligenceContext.Provider
      value={{
        // export: { exportToPDF, targetRef },
        state: {
          profile,
          logs: logs ?? [],
          company: company ?? null,
          loadingCompany: loadingCompany ?? false,
          loadingProfile: loadingProfile ?? false,
          updating: false,
          profile_generated,
          profile_started,
        },
        startDueDiligence,
      }}
    >
      {children}
    </DueDiligenceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDueDiligenceContext = () =>
  React.useContext(DueDiligenceContext);
