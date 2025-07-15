import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import AcceptIcon from '../assets/icons/blueaccept.svg?react';
import CrossIcon from '../assets/icons/redcross.svg?react';
import { PrimaryButton } from '../components';
import IconButton from '../components/commons/IconButton';
import LabeledValue from '../components/forms/editableLabeledValue/LabeledValue';
import { FormState } from '../components/FormState';
import { ConfirmationModal } from '../components/modals';
import PageContainer from '../components/PageContainer';
import ProcessingStatus from '../components/ProcessingStatus';
import TitleWithBack from '../components/TitleWithBack';
import { H2 } from '../components/Typography';
import { useProcessingCompanyContext } from '../context/ProcessingCompanyProvider';

const PageLayout = styled.div`
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  flex: 1 0 0;
  background: var(--Color-new-bg-card, rgba(255, 255, 255, 0.58));

  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
`;

const DetailsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 48px;
  align-self: stretch;
  width: 100%;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
  height: 100%;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  align-self: stretch;
`;

enum ActionType {
  Accept,
  Reject,
  AcceptAndStartDD,
}
interface CompanyUpdate {
  company_name: string;
  industry: string;
  sub_industry: string;
  company_size: string;
  specializations: string;
  product_portfolio: string;
  services_portfolio: string;
  tools_technologies: string;
  quality_standards: string;
  company_profile: string;
}
const AddCompanyDetails: React.FC = () => {
  const {
    state: { selectedProcessingCompany, updating },
    rejectCompany,
    acceptCompany,
  } = useProcessingCompanyContext();
  const navigate = useNavigate();
  const goBack = () => {
    navigate('/add');
  };

  const readOnly =
    selectedProcessingCompany?.status?.toLowerCase() !== 'waiting for review';

  const [openModal, setOpenModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    ActionType | undefined
  >();

  const handleConfirm = async () => {
    if (
      selectedAction === ActionType.Accept ||
      selectedAction === ActionType.AcceptAndStartDD
    ) {
      if (!selectedProcessingCompany) throw new Error('No company selected');
      const companyProcessing = {
        ...selectedProcessingCompany,
      };
      await acceptCompany(companyProcessing);
      if (selectedAction === ActionType.AcceptAndStartDD) {
        navigate(`/diligence/${selectedProcessingCompany.id}}`);
      }
    } else if (selectedAction === ActionType.Reject) {
      await rejectCompany(selectedProcessingCompany?.id ?? 0);
    }
    handleClose();
    goBack();
  };
  const handleClose = () => {
    setOpenModal(false);
    setSelectedAction(undefined);
  };

  const initialData = useMemo(
    () => ({
      company_name: selectedProcessingCompany?.Company_name ?? '',
      industry:
        selectedProcessingCompany?.details?.Subindustry?.join(', ') ?? '',
      sub_industry:
        selectedProcessingCompany?.details?.Subindustry?.join(', ') ?? '',
      company_size: selectedProcessingCompany?.details?.Company_size ?? '',
      specializations:
        selectedProcessingCompany?.details?.Specializations?.join(', ') ?? '',
      product_portfolio:
        selectedProcessingCompany?.details?.Products_portfolio?.join(', ') ??
        '',
      services_portfolio:
        selectedProcessingCompany?.details?.Service_portfolio?.join(' ') ?? '',
      tools_technologies:
        selectedProcessingCompany?.details?.Specific_tools_and_technologies?.join(
          ', ',
        ) ?? '',
      quality_standards:
        selectedProcessingCompany?.details?.Quality_standards?.join(', ') ?? '',
      company_profile:
        selectedProcessingCompany?.details?.Company_profile ?? '',
    }),
    [selectedProcessingCompany],
  );

  const [formState, setFormState] =
    useState<FormState<CompanyUpdate>>(initialData);

  useEffect(() => {
    setFormState(initialData);
  }, [initialData]);

  return (
    <PageContainer>
      <TitleWithBack label="Results" onClick={goBack} />
      <PageLayout>
        <Container>
          <H2>Results for {selectedProcessingCompany?.name}</H2>
          <ProcessingStatus
            status={selectedProcessingCompany?.status ?? 'Unknown'}
          />
          <div style={{ paddingBottom: '16px' }}>
            You can edit the information before accepting or refusing.
          </div>
          <DetailsContainer>
            <ColumnContainer>
              <LabeledValue
                textTitle="Company name"
                textContent={initialData?.company_name ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    company_name: newText,
                  }));
                }}
              />
              <LabeledValue
                textTitle="Industry"
                textContent={initialData?.industry ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    industry: newText,
                  }));
                }}
              />
              <LabeledValue
                textTitle="SubIndustry"
                textContent={initialData?.sub_industry ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    sub_industry: newText,
                  }));
                }}
              />
            </ColumnContainer>
            <ColumnContainer>
              <LabeledValue
                textTitle="Company size"
                textContent={initialData?.company_size ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    company_size: newText,
                  }));
                }}
              />
              <LabeledValue
                textTitle="Specializations"
                textContent={initialData?.specializations ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    specializations: newText,
                  }));
                }}
              />
              <LabeledValue
                textTitle="Product portfolio"
                textContent={initialData?.product_portfolio ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    product_portfolio: newText,
                  }));
                }}
              />
            </ColumnContainer>
            <ColumnContainer>
              <LabeledValue
                textTitle="Services portfolio"
                textContent={initialData?.services_portfolio ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    services_portfolio: newText,
                  }));
                }}
              />
              <LabeledValue
                textTitle="Specif tools and technologies"
                textContent={initialData?.tools_technologies ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    tools_technologies: newText,
                  }));
                }}
              />
              <LabeledValue
                textTitle="Quality standards"
                textContent={initialData?.quality_standards ?? ''}
                editable={true}
                onSave={(newText) => {
                  setFormState((prev) => ({
                    ...prev,
                    quality_standards: newText,
                  }));
                }}
              />
            </ColumnContainer>
          </DetailsContainer>
          <LabeledValue
            textTitle="Company profile"
            textContent={initialData?.company_profile ?? ''}
            editable={true}
            onSave={(newText) => {
              setFormState((prev) => ({
                ...prev,
                company_profile: newText,
              }));
            }}
          />
          <ActionsContainer>
            {readOnly ? (
              <IconButton
                variant="outlined"
                onClick={() => {
                  goBack();
                }}
              >
                Go back
              </IconButton>
            ) : (
              <>
                <PrimaryButton
                  variant="outlinedreject"
                  startEndorment={<CrossIcon />}
                  onClick={() => {
                    setSelectedAction(ActionType.Reject);
                    setOpenModal(true);
                  }}
                >
                  Reject
                </PrimaryButton>
                <PrimaryButton
                  startEndorment={<AcceptIcon />}
                  variant="outlined"
                  onClick={() => {
                    setSelectedAction(ActionType.Accept);
                    setOpenModal(true);
                  }}
                >
                  Accept and close
                </PrimaryButton>
                <PrimaryButton
                  startEndorment={<AcceptIcon />}
                  variant="contained"
                  onClick={() => {
                    setSelectedAction(ActionType.AcceptAndStartDD);
                    setOpenModal(true);
                  }}
                >
                  Accept start due diligence
                </PrimaryButton>
              </>
            )}
          </ActionsContainer>
        </Container>
        <ConfirmationModal
          isOpen={openModal}
          onConfirm={handleConfirm}
          onRequestClose={handleClose}
          title="Confirmation"
          loading={updating}
        >
          Are you sure you want to{' '}
          <b> {selectedAction == ActionType.Reject ? 'Reject' : 'Accept'} </b>{' '}
          this company?
        </ConfirmationModal>
      </PageLayout>
    </PageContainer>
  );
};

export default AddCompanyDetails;
