import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders job portal homepage', () => {
  render(<App />);
  const titleElement = screen.getByText(/Job Portal/i);
  expect(titleElement).toBeInTheDocument();
});
