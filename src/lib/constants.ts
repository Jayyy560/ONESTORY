// The epoch: when One Story begins. Set this to the deployment date.
export const STORY_EPOCH = new Date('2026-06-19T00:00:00+05:30')

// Maximum sentence length
export const MAX_SENTENCE_LENGTH = 500

// Maximum sentences accepted per day
export const MAX_DAILY_ACCEPTED = 30

// Cooldown period after acceptance (in days)
export const COOLDOWN_DAYS = 45

// Daily lock time: 11 PM IST = 17:30 UTC
export const DAILY_LOCK_HOUR_UTC = 17
export const DAILY_LOCK_MINUTE_UTC = 30

// Calculate current day number
export function getCurrentDayNumber(): number {
  const now = new Date()
  const diffMs = now.getTime() - STORY_EPOCH.getTime()
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
}

// Format date in archival style
export function formatArchivalDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Get time remaining until daily lock
export function getTimeUntilLock(): { hours: number; minutes: number; seconds: number } | null {
  const now = new Date()
  const lockTime = new Date(now)
  lockTime.setUTCHours(DAILY_LOCK_HOUR_UTC, DAILY_LOCK_MINUTE_UTC, 0, 0)

  if (now >= lockTime) {
    return null // Lock has passed for today
  }

  const diffMs = lockTime.getTime() - now.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  return { hours, minutes, seconds }
}
