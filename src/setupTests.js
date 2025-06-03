import '@testing-library/jest-dom'
import { jest } from '@jest/globals'
import { TextEncoder, TextDecoder } from 'node:util'

// Add TextEncoder for React Router compatibility
globalThis.TextEncoder = TextEncoder
globalThis.TextDecoder = TextDecoder

// Provides a mock implementation of window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
})