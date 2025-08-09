import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Cryptocurrencies from '../pages/Cryptocurrencies'

// Test data constants
const TEST_USER_EMAIL = 'test@example.com'
const TEST_TOKEN = 'fake-token'

// Mock fetch and localStorage
globalThis.fetch = jest.fn()
globalThis.localStorage = {
  getItem: jest.fn(() => TEST_TOKEN)
}

// Mock atob for token decoding
globalThis.atob = jest.fn(() => JSON.stringify({ 
  email: TEST_USER_EMAIL
}))

describe('Cryptocurrencies Component', () => {
  const mockCryptos = [
    { name: 'Bitcoin', symbol: 'BTC' },
    { name: 'Ethereum', symbol: 'ETH' }
  ]

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  })

  // Test 1: Initial loading state
  test('shows loading state initially', async () => {
    globalThis.fetch.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve(mockCryptos)
          })
        }, 100)
      })
    })

    render(
      <BrowserRouter>
        <Cryptocurrencies />
      </BrowserRouter>
    )

    expect(screen.getByText('Loading cryptocurrencies...')).toBeInTheDocument();
  })

  // Test 2: Renders title and table after loading
  test('renders title and table after loading', async () => {
    globalThis.fetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCryptos)
      })
    })

    render(
      <BrowserRouter>
        <Cryptocurrencies />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Supported Cryptocurrencies')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    })
  })

  // Test 3: Displays Bitcoin data
  test('displays Bitcoin data', async () => {
    globalThis.fetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCryptos)
      })
    })

    render(
      <BrowserRouter>
        <Cryptocurrencies />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      expect(screen.getByText('BTC')).toBeInTheDocument();
    })
  })

  // Test 4: Shows informative note
  test('shows informative note about cryptocurrencies', async () => {
    globalThis.fetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCryptos)
      })
    })

    render(
      <BrowserRouter>
        <Cryptocurrencies />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText(/These cryptocurrencies are available for lending and borrowing on our platform/i)).toBeInTheDocument();
    })
  })
})