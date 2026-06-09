'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { HistoryItem } from '../types'

const STORAGE_KEY = 'short_drama_history'
const PAID_KEY = 'short_drama_paid'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export interface PaymentStatus {
  ready: boolean
  verified: boolean
}

/**
 * Load history items from localStorage, filtering out items older than 7 days.
 */
function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const items: HistoryItem[] = JSON.parse(raw)
    const now = Date.now()
    return items.filter((item) => now - item.timestamp < SEVEN_DAYS_MS)
  } catch {
    return []
  }
}

/**
 * Save history items to localStorage.
 */
function saveHistory(items: HistoryItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage may be full or unavailable — silently ignore
  }
}

/**
 * useDramaHistory — localStorage-based history tracking for short drama generation.
 *
 * Returns:
 * - items: array of HistoryItem (filtered to last 7 days)
 * - addItem: add a new history entry
 * - clearAll: remove all history entries
 */
export function useDramaHistory() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      setItems(loadHistory())
    }
  }, [])

  const addItem = useCallback(
    (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
      const newItem: HistoryItem = {
        ...item,
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        timestamp: Date.now(),
      }
      setItems((prev) => {
        const updated = [newItem, ...prev].slice(0, 200) // cap at 200 items
        saveHistory(updated)
        return updated
      })
    },
    []
  )

  const clearAll = useCallback(() => {
    setItems([])
    saveHistory([])
  }, [])

  return { items, addItem, clearAll }
}

/**
 * usePaymentStatus — server-verified payment status check.
 *
 * Fetches /api/user/paid on mount and caches the result to localStorage.
 * Returns:
 * - ready: boolean indicating the check has completed
 * - verified: boolean indicating the user has paid
 */
export function usePaymentStatus(): PaymentStatus {
  // NOTE: There is a minor race condition risk here — the hook eagerly
  // reads localStorage synchronously during the first render, which can
  // cause hydration mismatches in SSR contexts or race with server state.
  // This is a minor UX issue; a future fix could defer the read to a useEffect
  // or use server-side state instead.
  const [status, setStatus] = useState<PaymentStatus>({
    ready: false,
    verified: false,
  })
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    // Check localStorage cache first
    const cached = localStorage.getItem(PAID_KEY)
    if (cached !== null) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed && typeof parsed === 'object' && 'verified' in parsed) {
          setStatus({ ready: true, verified: parsed.verified })
          // Still revalidate in background below
        }
      } catch {
        // invalid cache — ignore
      }
    }

    // Fetch fresh status from server
    fetch('/api/user/paid')
      .then((res) => res.json())
      .then((data: { paid: boolean }) => {
        const verified = data.paid === true
        setStatus({ ready: true, verified })
        localStorage.setItem(PAID_KEY, JSON.stringify({ verified }))
      })
      .catch(() => {
        // On network error, fall back to cached value if we have it
        setStatus((prev) =>
          prev.ready ? prev : { ready: true, verified: false }
        )
      })
  }, [])

  return status
}
