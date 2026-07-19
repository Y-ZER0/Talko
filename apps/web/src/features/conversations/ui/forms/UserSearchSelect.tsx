"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchUsers } from "@/features/users/hooks/useSearchUsers";
import { useDebouncedValue } from "@/features/search/hooks/useDebouncedValue";
import { Avatar } from "@/shared/ui/components/Avatar";
import { inputClass } from "./FormField";
import type { UserSearchResult } from "@/features/users/services/user.service";

export function UserSearchSelect({
  value,
  onSelect,
  error,
}: {
  value: string;
  onSelect: (user: UserSearchResult) => void;
  error?: { message?: string };
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const { data: users, isFetching } = useSearchUsers(debouncedQuery);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(user: UserSearchResult) {
    setSelectedUser(user);
    setSearchQuery("");
    setShowDropdown(false);
    onSelect(user);
  }

  function handleClear() {
    setSelectedUser(null);
    setSearchQuery("");
    onSelect(null as unknown as UserSearchResult);
  }

  if (selectedUser) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl">
        <Avatar name={selectedUser.username} userId={selectedUser.id} size="sm" />
        <span className="flex-1 text-sm text-text font-medium truncate">
          {selectedUser.username}
        </span>
        <button
          type="button"
          onClick={handleClear}
          className="text-text-muted hover:text-text transition-colors text-xs"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id="participant-id"
        type="text"
        placeholder="Search by username..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className={inputClass}
      />

      {showDropdown && debouncedQuery.trim().length >= 2 && (
        <div className="absolute z-10 top-full mt-1 w-full bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {isFetching && (
            <div className="px-4 py-3 text-sm text-text-muted">Searching...</div>
          )}
          {!isFetching && users && users.length === 0 && (
            <div className="px-4 py-3 text-sm text-text-muted">No users found</div>
          )}
          {!isFetching && users?.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-muted transition-colors text-left"
            >
              <Avatar name={user.username} userId={user.id} size="sm" />
              <span className="text-sm text-text font-medium truncate">{user.username}</span>
            </button>
          ))}
        </div>
      )}

      {error?.message && (
        <p className="mt-1 text-xs text-danger">{error.message}</p>
      )}
    </div>
  );
}
