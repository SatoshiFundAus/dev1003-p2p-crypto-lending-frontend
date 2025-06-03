import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RequestLoan from '../components/RequestLoan'

// Test data constants
const TEST_USER_EMAIL = 'test@example.com'
const TEST_USER_ID = '123'
const TEST_TOKEN = 'fake-token'

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

describe('RequestLoan Component', () => {
  const mockInterestTerms = [
    { _id: '1', loan_length: 3, interest_rate: 5 }
  ]

  const mockCryptos = [
    { _id: '1', name: 'Bitcoin', symbol: 'BTC' }
  ]

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Mock successful API responses
    globalThis.fetch.mockImplementation((url) => {
      if (url.includes('interest-terms')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockInterestTerms)
        })
      }
      if (url.includes('crypto')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCryptos)
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      })
    })
  })

  // Test 1: Initial loading state
  test('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <RequestLoan />
      </BrowserRouter>
    )
    expect(screen.getByText('Loading wallet...')).toBeInTheDocument();
  })

  // Test 2: Form renders after loading
  test('renders form after loading', async () => {
    render(
      <BrowserRouter>
        <RequestLoan />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Request a Loan')).toBeInTheDocument();
    })
  })

  // Test 3: Form fields are present
  test('renders all form fields', async () => {
    render(
      <BrowserRouter>
        <RequestLoan />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Requested Loan Amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Cryptocurrency/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Term Length/i)).toBeInTheDocument();
    })
  })

  // Test 4: Collateral information is displayed
  test('displays collateral information', async () => {
    render(
      <BrowserRouter>
        <RequestLoan />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Collateral Information')).toBeInTheDocument();
      expect(screen.getByText('Collateral Required:')).toBeInTheDocument();
      expect(screen.getByText('0.00000000 BTC')).toBeInTheDocument();
    })
  })
})