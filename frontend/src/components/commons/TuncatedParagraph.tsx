import styled from 'styled-components';

interface StyledParagraphProps {
  maxLines?: number;
}

const TruncatedParagraph = styled.p<StyledParagraphProps>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: ${({ maxLines }) =>
    maxLines || 3}; /* Default to 3 lines */
  -webkit-box-orient: vertical;
  text-overflow: ellipsis; /* This will work for single line overflow, but -webkit-line-clamp handles the multiline ellipsis */
  white-space: normal; /* Ensure text wraps normally within the lines */
`;

export default TruncatedParagraph;
