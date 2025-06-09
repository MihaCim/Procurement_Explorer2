import styled from 'styled-components';

interface ILinkProps {
  textTitle: string;
  textContent: string;
  href: string;
}

const StyledTitle = styled.div`
  color: var(--color-text-primary, #292c3d);
  font-size: 13px;
  font-weight: 400;
`;

const StyledContent = styled.div`
  color: var(--Color-color-primary, #014289);
  font-weight: 600;
  line-height: normal;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: none;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
`;

const Link = ({ textTitle, textContent, href }: ILinkProps) => {
  return (
    <a href={'https://' + href} className="flex-col">
      <StyledTitle> {textTitle}</StyledTitle>
      <StyledContent> {textContent}</StyledContent>
    </a>
  );
};

export default Link;
