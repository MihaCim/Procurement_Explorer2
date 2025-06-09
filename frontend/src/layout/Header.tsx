import styled from 'styled-components';

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

const Text = styled.p`
  color: var(--color-text-primary, #292c3d);
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 19px; /* 135.714% */
  letter-spacing: -0.14px;
`;

const Header = () => {
  return (
    <StyledHeader>
      <HeaderLeft>
        <a href="/">
          <img src={`/logo.png`} alt="logo" />
        </a>
        <Text>Due Diligence</Text>
      </HeaderLeft>
      {/* <HeaderButton>
        <NavLink to="/" className="h-full w-full px-5 py-3">
          Home
        </NavLink>
      </HeaderButton>

      <HeaderButton>
        <NavLink to="/admin" className="h-full w-full px-5 py-3">
          Administration
        </NavLink>
      </HeaderButton> */}
    </StyledHeader>
  );
};

export default Header;
