/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, ReactNode, Ref, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import generatePDF from 'react-to-pdf';

import { useMutation, useQuery } from '@tanstack/react-query';

import { DetailedCompany } from '../models/Company';
import { DueDiligenceProfile } from '../models/DueDiligenceProfile';
import useCompanyService from '../services/companyService';
import useDueDiligenceService from '../services/dueDiligenceService';

interface DueDiligenceContext {
  state: IDueDiligenceState;
  setRiskLevel: (value: number) => void;
  updateProfile: (data: any) => void;
  export: {
    exportToPDF: () => void;
    targetRef: Ref<any>;
  };
}
export interface IDueDiligenceState {
  updating: boolean;
  loading: boolean;
  profile: DueDiligenceProfile | null;
  company: DetailedCompany | null;
  risk_level: number;
}
const DueDiligenceContext = createContext({} as DueDiligenceContext);

export const DueDiligenceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { getDueDiligenceProfile, updateDueDiligenceProfile } =
    useDueDiligenceService();
  const { getCompanyById } = useCompanyService();
  const { id } = useParams();

  const [risk_level, setRiskLevel] = React.useState<number>(0);

  const { data: company, isLoading: loadingCompany } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(Number(id)),
    enabled: !!getCompanyById && id !== undefined && !isNaN(Number(id)),
  });

  const {
    data: profileData,
    isLoading: loadingProfile,
    refetch,
  } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getDueDiligenceProfile(Number(id)),
    enabled:
      !!company &&
      company.status === 'Available' &&
      !!getDueDiligenceProfile &&
      id !== undefined &&
      !isNaN(Number(id)),
  });

  const updateQuery = useMutation({
    mutationKey: ['updateProfile'],
    mutationFn: async (data: any) => {
      console.log(data);
      const res = await updateDueDiligenceProfile(Number(id), data);
      if (res) await refetch();
      return data;
    },
  });
  const updateProfile = async (data: any) => {
    updateQuery.mutate(data);
  };

  const profile = profileData ?? null;

  useEffect(() => {
    if (profile) {
      setRiskLevel(profile.risk_level ?? 0);
    }
    console.log(profile);
  }, [profile]);

  //Export to PDF

  const targetRef = React.useRef<HTMLDivElement>(null);

  const exportToPDF = () => {
    {
      if (
        targetRef == null ||
        !('current' in targetRef) ||
        targetRef.current == null
      )
        throw new Error('Ref is null');
      //get items to hide or change for the export
      const buttons = targetRef.current?.getElementsByTagName('button') ?? [];
      const sidePanel =
        targetRef.current?.querySelector<HTMLDivElement>('#sidepanel');
      try {
        for (let i = 0; i < buttons.length; i++) {
          buttons[0].style.display = 'none';
          console.log(buttons[0]);
        }

        sidePanel!.style.position = 'static';

        generatePDF(targetRef, {
          filename: `${profile?.name.replace(/ +/g, '_') ?? 'UNKNOW'}_DueDiligence.pdf`,
          page: { margin: 5 },
          overrides: {
            canvas: { windowWidth: 1400 },
          },
        });
      } catch (e) {
        console.error(e);
      } finally {
        for (let i = 0; i < buttons.length; i++) {
          buttons[0].style.display = 'block';
          console.log(buttons[0]);
        }
        sidePanel!.style.position = 'sticky';
      }
    }
  };
  return (
    <DueDiligenceContext.Provider
      value={{
        export: { exportToPDF, targetRef },
        state: {
          profile,
          company: company ?? null,
          loading: (loadingCompany || loadingProfile) ?? false,
          updating: false,
          risk_level,
        },
        setRiskLevel,
        updateProfile,
      }}
    >
      {children}
    </DueDiligenceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDueDiligenceContext = () =>
  React.useContext(DueDiligenceContext);
