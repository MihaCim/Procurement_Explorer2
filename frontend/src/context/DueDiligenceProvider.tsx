import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useMutation, useQuery } from '@tanstack/react-query';

import { CompanyDetails } from '../models/Company';
import {
  DueDiligenceLog,
  DueDiligenceProfile,
  isStatusGenerated,
  NOT_AVAILABLE_STATUS,
} from '../models/DueDiligenceProfile';
import useCompanyService from '../services/companyService';
import useDueDiligenceService from '../services/dueDiligenceService';

interface DueDiligenceContext {
  state: IDueDiligenceState;
  startDueDiligence: (url: string) => Promise<void>;
  deleteProfile: () => Promise<void>;
}
export interface IDueDiligenceState {
  updating: boolean;
  loadingCompany: boolean;
  loadingProfile: boolean;
  profile: DueDiligenceProfile | null;
  logs: DueDiligenceLog[];
  company: CompanyDetails | null;
  profile_generated: boolean;
  profile_started: boolean;
  profile_initiating: boolean;
}

const DueDiligenceContext = createContext({} as DueDiligenceContext);

export const DueDiligenceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    getDueDiligenceProfile,
    startDueDiligenceProfile,
    deleteDueDiligenceProfile,
  } = useDueDiligenceService();
  const { getCompanyById } = useCompanyService();
  const { id } = useParams();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const [profile_generated, set_profile_generated] = React.useState(false);
  const [profile_started, set_profile_started] = React.useState(false);
  const [profile_initiating, set_profile_initiating] = React.useState(false);

  const [profile_url, set_profile_url] = React.useState<string | null>(null);
  const startInitiatedRef = useRef<string | null>(null);

  const { data: company, isLoading: loadingCompany } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(Number(id)),
    enabled: !!getCompanyById && id !== undefined && !isNaN(Number(id)),
  });

  const refreshEnabled = useMemo(() => {
    return (
      !!getDueDiligenceProfile &&
      !profile_generated &&
      !!profile_url &&
      profile_started
    );
  }, [getDueDiligenceProfile, profile_generated, profile_url, profile_started]);

  const {
    data: profile,
    isLoading: loadingProfile,
    // refetch,
  } = useQuery({
    queryKey: ['profile', profile_url],
    queryFn: ({ queryKey }) => getDueDiligenceProfile(queryKey[1]!, true, true),
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

  const deleteMutation = useMutation({
    mutationKey: ['deleteProfile'],
    mutationFn: async () => {
      if (profile_url) {
        const res = await deleteDueDiligenceProfile(profile_url, true, true);
        return res;
      }
      throw new Error('Profile URL is not defined');
    },
    onSuccess: () => {
      set_profile_generated(false);
      set_profile_started(false);
      set_profile_url(null);
      startInitiatedRef.current = null;
    },
  });

  const deleteProfile = useCallback(async () => {
    if (profile_url) {
      try {
        await deleteMutation.mutateAsync();
        navigate('/'); // Redirect to home or another page after deletion
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  }, [deleteMutation, navigate, profile_url]);

  useEffect(() => {
    if (isStatusGenerated(profile?.status) && !profile_generated)
      set_profile_generated(true);
  }, [profile?.status, profile_generated]);

  useEffect(() => {
    if (company?.dd_status !== NOT_AVAILABLE_STATUS) {
      const url = company?.website ?? '';
      startInitiatedRef.current = url;
      set_profile_started(true);
      setSearchParams({ url });
      set_profile_url(url);
    }
  }, [company?.dd_status, company?.website, setSearchParams]);

  const startDueDiligence = useCallback(
    async (url: string) => {
      if (!url) return;

      if (profile_initiating || (profile_started && profile_url === url)) {
        return;
      }
      if (startInitiatedRef.current === url) {
        return;
      }

      try {
        set_profile_initiating(true);
        startInitiatedRef.current = url;
        await startDueDiligenceProfile(url);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        set_profile_started(true);
        set_profile_url(url);
        setSearchParams({ url });
        console.log('Due diligence started for URL:', url);
      } catch (error) {
        console.error('Error starting due diligence:', error);
        startInitiatedRef.current = null;
      } finally {
        set_profile_initiating(false);
      }
    },
    [
      setSearchParams,
      startDueDiligenceProfile,
      profile_initiating,
      profile_started,
      profile_url,
    ],
  );

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
          profile: profile ?? null,
          logs: profile?.logs ?? [],
          company: company ?? null,
          loadingCompany: loadingCompany ?? false,
          loadingProfile: loadingProfile ?? false,
          updating: false,
          profile_initiating,
          profile_generated,
          profile_started,
        },
        startDueDiligence,
        deleteProfile,
      }}
    >
      {children}
    </DueDiligenceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDueDiligenceContext = () =>
  React.useContext(DueDiligenceContext);
