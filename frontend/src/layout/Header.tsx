import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import ProjectIcon from '../assets/icons/project.svg?react';
import HeaderButton from '../components/HeaderButton';

const StyledHeader = styled.header`
  display: flex;
  opacity: 0.99;
  padding: 8px 19px;
  height: 64px;
  font-size: 15px;
  gap: 16px;
  flex: 1 0 0;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-bottom: 1.5px solid var(--color-primary, #014289);
  background: var(--color-white, #fff);
  /* shadow card */
  box-shadow: 0px 1px 10px 0px rgba(72, 71, 86, 0.09);
`;

const HeaderLeft = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  position: absolute;
  left: 16px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  position: absolute;
  right: 16px;
`;

const HeaderTypography = styled.p`
  color: var(--color-text-primary, #292c3d);
  font-family: Poppins;
  font-size: 17px;
  font-style: normal;
  font-weight: 600;
  line-height: 19px; /* 111.765% */
  letter-spacing: -0.17px;
`;

const Header = () => {
  const location = useLocation();
  const isSearchActive =
    location.pathname === '/' ||
    (/^\/[^/]+$/.test(location.pathname) && location.pathname !== '/scraping');

  return (
    <StyledHeader>
      <HeaderLeft>
        <ProjectIcon />
        <a href="/">
          <HeaderTypography>Procurement Sourcing</HeaderTypography>
        </a>
      </HeaderLeft>
      <HeaderButton>
        <NavLink
          to="/"
          className={`h-full w-full px-5 py-3 ${isSearchActive ? 'active' : ''}`}
        >
          Search for a company
        </NavLink>
      </HeaderButton>

      <HeaderButton>
        <NavLink
          to="/scraping"
          onClick={(e) => {
            e.preventDefault();
          }}
          className="h-full w-full px-5 py-3 text-gray-500 cursor-not-allowed"
        >
          Scraping
        </NavLink>
      </HeaderButton>

      <HeaderRight>
        <img src={`/logo.png`} alt="logo" />
      </HeaderRight>
    </StyledHeader>
  );
};

export default Header;
