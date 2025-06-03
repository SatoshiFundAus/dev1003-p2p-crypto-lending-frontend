import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import BTCPrice from '../components/BitcoinLivePrice'

describe('BitcoinLivePrice Component', () => {
  const mockPriceData = {
    amount: 50000,
    last_updated_at_in_utc_epoch_seconds: Math.floor(Date.now() / 1000)
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Mock console.error to prevent error output in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore()
  })

  // Test 1: Initial loading state
  test('shows loading state initially', async () => {
    // Mock a delayed response to ensure we can see the loading state
    globalThis.fetch = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve(mockPriceData)
          })
        }, 100)
      })
    })

    render(<BTCPrice />)

    // Immediately check for loading state
    expect(screen.getByText('Loading Bitcoin price...')).toBeInTheDocument();
  })

  // Test 2: Displays price after loading
  test('displays price after loading', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPriceData)
      })
    })

    render(<BTCPrice />)
    
    await waitFor(() => {
      expect(screen.getByText('$50000')).toBeInTheDocument();
    })
  })

  // Test 3: Shows last updated time
  test('shows last updated time', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPriceData)
      })
    })

    render(<BTCPrice />)
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated at/i)).toBeInTheDocument();
    })
  })

  // Test 4: Handles API error
  test('handles API error', async () => {
    // Mock failed API response
    globalThis.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 500
      })
    })

    render(<BTCPrice />)
    
    await waitFor(() => {
      expect(screen.getByText('Unable to retrieve current Bitcoin price.')).toBeInTheDocument()
    })
  })
})