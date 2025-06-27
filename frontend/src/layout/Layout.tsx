import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { Progress } from '../components';
import Header from './Header';
import { LayoutProvider } from './LayoutProvider';

const Content = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  background:
    linear-gradient(
      225deg,
      rgba(222, 225, 245, 0.67) 11.94%,
      rgba(233, 234, 248, 0.67) 45.82%,
      rgba(255, 255, 255, 0.67) 93.89%
    ),
    url('/agentic-font.png') lightgray 50% / cover no-repeat;
`;

const Layout = () => {
  const initializing = false;
  const initialized = true;

  return (
    <div className="h-full w-full bg-primary-background">
      <div className="relative z-50">
        <div className="fixed top-0 block w-full">
          <Header />
        </div>
      </div>
      <div className="relative z-10 mt-[64px]">
        {initializing ? (
          <Content>
            <div
              className="flex min-h-[700px] w-full flex-1 flex-col items-center justify-center gap-1"
              style={{
                borderRadius: 'var(--radius-small, 4px)',
                border: '1px solid var(--color-stroke, #EBEBF1)',
                background: 'var(--color-white, #FFF)',
                /* shadow card */
                boxShadow: '0px 1px 10px 0px rgba(72, 71, 86, 0.09)',
              }}
            >
              <span>Initializing...</span>
              <Progress />
            </div>
          </Content>
        ) : initialized ? (
          <Content>
            <div className="flex w-full justify-center">
              <LayoutProvider>
                <Outlet />
              </LayoutProvider>
            </div>
          </Content>
        ) : (
          <>Failed to initialize</>
        )}
      </div>
    </div>
  );
};

export default Layout;
