import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../components/Dashboard';

// Test data constants
const TEST_WALLET_BALANCE = 0.05 // 0.05 BTC
const TEST_USER_EMAIL = 'test@example.com'
const TEST_TOKEN = 'fake-token'
const TEST_USER_ID = '123'

// Mock fetch and localStorage
globalThis.fetch = jest.fn()
globalThis.localStorage = {
  getItem: jest.fn(() => TEST_TOKEN)
}

// Mock atob for token decoding
globalThis.atob = jest.fn(() => JSON.stringify({ 
  email: TEST_USER_EMAIL,
  id: TEST_USER_ID 
}))

describe('Dashboard Function', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Mock successful API responses
    globalThis.fetch.mockImplementation((url) => {
      // Return a resolved promise for all API calls
      return Promise.resolve({
        ok: true,
        json: () => {
          if (url.includes('wallet-balance')) {
            return Promise.resolve({ 
              walletBalance: TEST_WALLET_BALANCE,
              currency: 'BTC'
            })
          }
          if (url.includes('collateral')) {
            return Promise.resolve([]);
          }
          if (url.includes('loan-requests')) {
            return Promise.resolve([]);
          }
          if (url.includes('borrower-deals')) {
            return Promise.resolve([]);
          }
          if (url.includes('lender-deals')) {
            return Promise.resolve([]);
          }
          if (url.includes('transactions')) {
            return Promise.resolve([]);
          }
          if (url.includes('interest-terms')) {
            return Promise.resolve({ interest_rate: 5 });
          }
          return Promise.resolve([]);
        }
      })
    })
  })

  // Test 1: Confirms that the dashboard header is rendered
  test('renders dashboard header', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    expect(screen.getByRole('banner')).toBeInTheDocument();
  })

  // Test 2: Confirms that the loading state is shown initially
  test('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  })

  // Test 3: Confirms that the footer is rendered
  test('renders footer', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  })

  // Test 4: Confirms that the header contains the logo
  test('header contains logo', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    expect(screen.getByText('SatoshiFund')).toBeInTheDocument();
  })

  // Test 5: Confirms that the header contains the Bitcoin symbol
  test('header contains Bitcoin symbol', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    expect(screen.getByText('₿')).toBeInTheDocument();
  })

  // Test 6: Confirms that the header contains the user icon
  test('header contains user icon', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    const userIcon = screen.getByTitle('Click to logout');
    expect(userIcon).toBeInTheDocument();
  })
})