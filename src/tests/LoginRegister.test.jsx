import { describe, test, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../components/LoginRegister'

// Checks if login form renders correctly
describe('Login Component', () => {
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login name="Log In" />
      </BrowserRouter>
    )
    
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  })
})