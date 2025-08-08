import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import InterestTerms from '../pages/InterestTerms'

// Test data constants
const TEST_USER_EMAIL = 'test@example.com'
const TEST_TOKEN = 'fake-token'

// Mock fetch and localStorage
globalThis.fetch = jest.fn();
globalThis.localStorage = {
  getItem: jest.fn(() => TEST_TOKEN)
}

// Mock atob for token decoding
globalThis.atob = jest.fn(() => JSON.stringify({ 
  email: TEST_USER_EMAIL
}))

describe('InterestTerms Component', () => {
  const mockInterestTerms = [
    { loan_length: 3, interest_rate: 5 },
    { loan_length: 6, interest_rate: 7 }
  ]

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  })

  // Test 1: Initial loading state
  test('shows loading state initially', async () => {
    // Mock a delayed response to ensure we can see the loading state
    globalThis.fetch.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve(mockInterestTerms)
          })
        }, 100)
      })
    })

    render(
      <BrowserRouter>
        <InterestTerms />
      </BrowserRouter>
    )

    // Immediately check for loading state
    expect(screen.getByText('Loading interest terms...')).toBeInTheDocument();
  })

  // Test 2: Renders title and table after loading
  test('renders title and table after loading', async () => {
    globalThis.fetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockInterestTerms)
      })
    })

    render(
      <BrowserRouter>
        <InterestTerms />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Loan Terms')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    })
  })

  // Test 3: Displays interest term data
  test('displays interest term data', async () => {
    globalThis.fetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockInterestTerms)
      })
    })

    render(
      <BrowserRouter>
        <InterestTerms />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('3 months')).toBeInTheDocument();
      expect(screen.getByText('5.0%')).toBeInTheDocument();
    })
  })

  // Test 4: Shows informative note
  test('shows informative note about monthly repayments', async () => {
    globalThis.fetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockInterestTerms)
      })
    })

    render(
      <BrowserRouter>
        <InterestTerms />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText(/All loans are subject to monthly interest repayments/i)).toBeInTheDocument();
    })
  })
})