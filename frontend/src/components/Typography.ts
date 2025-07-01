import styled from 'styled-components';

export const LargeFontH1 = styled.h1`
  color: var(--color-text-primary, #292c3d);
  font-family: Poppins;
  font-size: 38px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const H1 = styled.h1`
  color: var(--color-text-primary, #292c3d);
  /* H1 */
  font-family: Poppins;
  font-size: 22px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const H2 = styled.h2`
  font-family: Poppins;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis; /* This will work for single line overflow, but -webkit-line-clamp handles the multiline ellipsis */
  white-space: normal; /* Ensure text wraps normally within the lines */
`;

export const AttachmentTypo = styled.p`
  color: var(--color-primary, #173fa5);
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 171.429% */
`;

export const P = styled.p`
  color: #000000;
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 19px; /* 135.714% */
  letter-spacing: -0.14px;
`;

export const H4 = styled.h4`
  color: #121213;
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;
