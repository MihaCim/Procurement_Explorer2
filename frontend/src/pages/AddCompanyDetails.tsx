import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import AcceptIcon from '../assets/icons/accept.svg?react';
import CrossIcon from '../assets/icons/cross.svg?react';
import IconButton from '../components/commons/IconButton';
import { FormState } from '../components/FormState';
import { ConfirmationModal } from '../components/modals';
import PageContainer from '../components/PageContainer';
import ProcessingStatus from '../components/ProcessingStatus';
import TitleWithBack from '../components/TitleWithBack';
import { H2 } from '../components/Typography';
import { useProcessingCompanyContext } from '../context/ProcessingCompanyProvider';

const SLabeledText_Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const SLabeledText_Label = styled.div`
  font-size: 14px;
  color: #9e9e9e;
`;

const SLabeledText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface ILabeledTextProps {
  label: string;
  value: string;
}
const LabeledText: React.FC<ILabeledTextProps> = ({ label, value }) => {
  return (
    <SLabeledText_Container>
      <SLabeledText_Label>{label}</SLabeledText_Label>
      <SLabeledText>{value}</SLabeledText>
    </SLabeledText_Container>
  );
};

const PageLayout = styled.div`
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  flex: 1 0 0;
  background: #fff;
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
  align-items: flex-start;
  gap: 32px;
  align-self: stretch;
`;

enum ActionType {
  Accept,
  Reject,
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
    state: { selectedProcessingCompany },
    rejectCompany,
    acceptCompany,
  } = useProcessingCompanyContext();
  const navigate = useNavigate();
  const goBack = () => {
    navigate('/add');
  };

  const readOnly =
    selectedProcessingCompany?.progress?.toLowerCase() !== 'waiting for review';

  const [openModal, setOpenModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    ActionType | undefined
  >();

  const handleConfirm = async () => {
    if (selectedAction === ActionType.Accept) {
      await acceptCompany(selectedProcessingCompany?.id ?? 0);
    } else if (selectedAction === ActionType.Reject) {
      // TODO: Call update company status service in place of reject to keep the company in the list of history
      await rejectCompany(selectedProcessingCompany?.id ?? 0);
    }
    handleClose();
    goBack();
  };
  const handleClose = () => {
    setOpenModal(false);
    setSelectedAction(undefined);
  };

  // TODO: Update the company details, This is not yet implemented due to the lack of an endpoint for updating company information in the backend.
  const [formState, setFormState] = useState<FormState<CompanyUpdate>>({
    company_name: selectedProcessingCompany?.Company_name ?? '',
    industry: selectedProcessingCompany?.details?.Subindustry?.join(', ') ?? '',
    sub_industry:
      selectedProcessingCompany?.details?.Subindustry?.join(', ') ?? '',
    company_size: selectedProcessingCompany?.details?.Company_size ?? '',
    specializations:
      selectedProcessingCompany?.details?.Specializations?.join(', ') ?? '',
    product_portfolio:
      selectedProcessingCompany?.details?.Products_portfolio?.join(', ') ?? '',
    services_portfolio:
      selectedProcessingCompany?.details?.Service_portfolio?.join(' ') ?? '',
    tools_technologies:
      selectedProcessingCompany?.details?.Specific_tools_and_technologies?.join(
        ', ',
      ) ?? '',
    quality_standards:
      selectedProcessingCompany?.details?.Quality_standards?.join(', ') ?? '',
    company_profile: selectedProcessingCompany?.details?.Company_profile ?? '',
  });
  useEffect(() => {
    if (selectedProcessingCompany) {
      setFormState({
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
          selectedProcessingCompany?.details?.Service_portfolio?.join(' ') ??
          '',
        tools_technologies:
          selectedProcessingCompany?.details?.Specific_tools_and_technologies?.join(
            ', ',
          ) ?? '',
        quality_standards:
          selectedProcessingCompany?.details?.Quality_standards?.join(', ') ??
          '',
        company_profile:
          selectedProcessingCompany?.details?.Company_profile ?? '',
      });
    }
  }, [selectedProcessingCompany]);

  return (
    <PageContainer>
      <TitleWithBack label="Results" onClick={goBack} />
      <PageLayout>
        <Container>
          <H2>Results for {selectedProcessingCompany?.Company_name}</H2>
          <ProcessingStatus
            status={selectedProcessingCompany?.progress ?? 'Unknown'}
          />
          <div style={{ paddingBottom: '16px' }}>
            You can edit the information before accepting or refusing.
          </div>
          <DetailsContainer>
            <ColumnContainer>
              <LabeledText
                label="Company name"
                value={formState?.company_name ?? ''}
              />
              <LabeledText label="Industry" value={formState?.industry ?? ''} />
              <LabeledText
                label="SubIndustry"
                value={formState?.sub_industry ?? ''}
              />
            </ColumnContainer>
            <ColumnContainer>
              <LabeledText
                label="Company size"
                value={formState?.company_size ?? ''}
              />
              <LabeledText
                label="Specializations"
                value={formState?.specializations ?? ''}
              />
              <LabeledText
                label="Product portfolio"
                value={formState?.product_portfolio ?? ''}
              />
            </ColumnContainer>
            <ColumnContainer>
              <LabeledText
                label="Services portfolio"
                value={formState?.services_portfolio ?? ''}
              />
              <LabeledText
                label="Specif tools and technologies"
                value={formState?.tools_technologies ?? ''}
              />
              <LabeledText
                label="Quality standards"
                value={formState?.quality_standards ?? ''}
              />
            </ColumnContainer>
          </DetailsContainer>
          <LabeledText
            label="Company profile"
            value={formState?.company_profile ?? ''}
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
                <IconButton
                  variant="outlined"
                  onClick={() => {
                    setSelectedAction(ActionType.Reject);
                    setOpenModal(true);
                  }}
                >
                  <CrossIcon />
                  Reject
                </IconButton>
                <IconButton
                  variant="contained"
                  onClick={() => {
                    setSelectedAction(ActionType.Accept);
                    setOpenModal(true);
                  }}
                >
                  <AcceptIcon />
                  Accept
                </IconButton>
              </>
            )}
          </ActionsContainer>
        </Container>
        <ConfirmationModal
          isOpen={openModal}
          onConfirm={handleConfirm}
          onRequestClose={handleClose}
          title="Confirmation"
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
