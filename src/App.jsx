import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header.jsx";
import NewPage from "./pages/NewPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import { GlobalStyle, AppContainer } from "./styles/GlobalStyles.jsx";

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <AppContainer>
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/new" replace />} />
            <Route path="/new" element={<NewPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </AppContainer>
      </Router>
    </>
  );
}

export default App;
