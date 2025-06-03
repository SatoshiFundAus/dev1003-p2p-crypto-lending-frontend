import { describe, test, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/LoginRegister';

describe('Login Function', () => {
  // Test 1: Check if login form renders with heading
  test('renders login form with heading', () => {
    render(
      <BrowserRouter>
        <Login name="Log In" />
      </BrowserRouter>
    )
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  })

  // Test 2: Check if login form has required input fields
  test('login form has email and password input fields', () => {
    render(
      <BrowserRouter>
        <Login name="Log In" />
      </BrowserRouter>
    )
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  })

  // Test 3: Check if submit button exists on login form
  test('login has submit button', () => {
    render(
      <BrowserRouter>
        <Login name="Log In" />
      </BrowserRouter>
    )
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  })

  // Test 4: Check if register link exists in login form
  test('login has register link', () => {
    render(
      <BrowserRouter>
        <Login name="Log In" />
      </BrowserRouter>
    )
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  })

  // Test 5: Check if register form renders with heading
  test('renders register form with heading', () => {
    render(
      <BrowserRouter>
        <Login name="Register" />
      </BrowserRouter>
    )
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
  })

  // Test 6: Check if register form has all required fields
  test('register form has all required fields', () => {
    render(
      <BrowserRouter>
        <Login name="Register" />
      </BrowserRouter>
    )
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  })

  // Test 7: Check if register has submit button
  test('register has submit button', () => {
    render(
      <BrowserRouter>
        <Login name="Register" />
      </BrowserRouter>
    )
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  })

  // Test 8: Check if login link exists in register 
  test('register has login link', () => {
    render(
      <BrowserRouter>
        <Login name="Register" />
      </BrowserRouter>
    )
    expect(screen.getByRole('link', { name: /login here/i })).toBeInTheDocument();
  })
})