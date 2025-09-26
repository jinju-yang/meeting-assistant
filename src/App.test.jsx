import { render, screen } from "@testing-library/react";
import App from "./App.jsx";

test("renders Service name app", () => {
  render(<App />);
  const linkElement = screen.getByText(/Chat with AI/i);
  expect(linkElement).toBeInTheDocument();
});
