import { useCallback, useEffect, useState } from "react"

import { userRepository } from "../../services/repositories/supabase"
import { Profile } from "../../services/repositories/types"

export function useUserSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Profile[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }
    setIsSearching(true)
    try {
      const users = await userRepository.searchUsers(searchTerm.trim(), 20)
      setResults(users)
    } catch {
      // Search failed silently
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, searchUsers])

  const clearQuery = useCallback(() => {
    setQuery("")
    setResults([])
  }, [])

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearQuery,
    hasQuery: query.trim().length > 0,
  }
}
