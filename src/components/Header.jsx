import React, { useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import styled from "styled-components";

const HeaderContainer = styled.header`
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  h1 {
    color: #4fc3f7;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
`;

const Nav = styled.nav`
  ul {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin: 0;
    padding: 0;
  }

  a {
    color: #ffffff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease, opacity 0.3s ease;
    opacity: ${(props) => (props.isActive ? 1 : 0.7)};

    &:hover {
      color: #4fc3f7;
    }
  }
`;

const NavLink = styled(RouterNavLink)`
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease, opacity 0.3s ease;
  opacity: 0.7;

  &.active {
    opacity: 1;
  }

  &:hover {
    color: #4fc3f7;
  }
`;

const HistoryNavItem = styled.li`
  position: relative;
`;

const HistoryTooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 0.5rem;
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transform: translateX(-50%)
    translateY(${(props) => (props.$isVisible ? 0 : -10)}px);
  transition: all 0.3s ease;
  pointer-events: ${(props) => (props.$isVisible ? "auto" : "none")};
`;

const TooltipSection = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Header = () => {
  const [showHistoryOptions, setShowHistoryOptions] = useState(false);

  return (
    <HeaderContainer>
      <Container>
        <Logo>
          <h1>Aichatter</h1>
        </Logo>
        <Nav>
          <ul>
            <li>
              <NavLink to="/new">New</NavLink>
            </li>
            <HistoryNavItem
              onMouseEnter={() => setShowHistoryOptions(true)}
              onMouseLeave={() => setShowHistoryOptions(false)}
            >
              <NavLink to="/history">History</NavLink>
              <HistoryTooltip $isVisible={showHistoryOptions}>
                <TooltipSection>
                  <NavLink
                    to="/history?sort=participant"
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.25rem",
                      marginBottom: "0.5rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(79, 195, 247, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(79, 195, 247, 0.1)";
                      e.target.style.borderColor = "#4fc3f7";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.05)";
                      e.target.style.borderColor = "rgba(79, 195, 247, 0.3)";
                    }}
                  >
                    <div
                      style={{
                        color: "#4fc3f7",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Participant
                    </div>
                    <div style={{ color: "#cccccc", fontSize: "0.8rem" }}>
                      참석자별 회의 보기
                    </div>
                  </NavLink>

                  <NavLink
                    to="/history?sort=time"
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.25rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(79, 195, 247, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(79, 195, 247, 0.1)";
                      e.target.style.borderColor = "#4fc3f7";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.05)";
                      e.target.style.borderColor = "rgba(79, 195, 247, 0.3)";
                    }}
                  >
                    <div
                      style={{
                        color: "#4fc3f7",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Time
                    </div>
                    <div style={{ color: "#cccccc", fontSize: "0.8rem" }}>
                      시간순 회의 보기
                    </div>
                  </NavLink>
                </TooltipSection>
              </HistoryTooltip>
            </HistoryNavItem>
          </ul>
        </Nav>
      </Container>
    </HeaderContainer>
  );
};

export default Header;
