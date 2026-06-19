import { MAX_SENTENCE_LENGTH } from './constants'

export interface ValidationResult {
  valid: boolean
  error?: string
}

// Validate a sentence submission
export function validateSentence(content: string): ValidationResult {
  const trimmed = content.trim()

  if (!trimmed) {
    return { valid: false, error: 'Your sentence cannot be empty.' }
  }

  if (trimmed.length > MAX_SENTENCE_LENGTH) {
    return { valid: false, error: `Your sentence must be ${MAX_SENTENCE_LENGTH} characters or fewer. Currently: ${trimmed.length}.` }
  }

  // Must end with sentence-ending punctuation
  const validEndings = ['.', '!', '?', '"', "'", '…', '—']
  const lastChar = trimmed[trimmed.length - 1]
  if (!validEndings.includes(lastChar)) {
    return { valid: false, error: 'Your sentence must end with proper punctuation (. ! ? " \' … —).' }
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: 'Your sentence must contain at least one letter.' }
  }

  // Check for multiple sentences (rough heuristic: more than 2 sentence-ending punctuation marks)
  const sentenceEnders = trimmed.match(/[.!?]+/g) || []
  if (sentenceEnders.length > 3) {
    return { valid: false, error: 'Please submit a single sentence, not a paragraph.' }
  }

  return { valid: true }
}
