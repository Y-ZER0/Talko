"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchUsers } from "@/features/users/hooks/useSearchUsers";
import { useDebouncedValue } from "@/features/search/hooks/useDebouncedValue";
import { Avatar } from "@/shared/ui/components/Avatar";
import { inputClass } from "./FormField";
import type { UserSearchResult } from "@/features/users/services/user.service";

export function MultiUserSearchSelect({
  selectedUsers,
  onSelect,
  error,
}: {
  selectedUsers: UserSearchResult[];
  onSelect: (users: UserSearchResult[]) => void;
  error?: { message?: string };
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const { data: users, isFetching } = useSearchUsers(debouncedQuery);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIds = new Set(selectedUsers.map((u) => u.id));

  const filteredUsers = (users ?? []).filter((u) => !selectedIds.has(u.id));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (user: UserSearchResult) => {
      onSelect([...selectedUsers, user]);
      setSearchQuery("");
      setShowDropdown(false);
      inputRef.current?.focus();
    },
    [selectedUsers, onSelect],
  );

  const handleRemove = useCallback(
    (userId: string) => {
      onSelect(selectedUsers.filter((u) => u.id !== userId));
    },
    [selectedUsers, onSelect],
  );

  return (
    <div ref={containerRef}>
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUsers.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-surface-muted border border-border rounded-full text-sm"
            >
              <Avatar name={user.username} userId={user.id} size="sm" />
              <span className="text-text font-medium truncate max-w-[120px]">
                {user.username}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(user.id)}
                className="text-text-muted hover:text-danger transition-colors ml-0.5 leading-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={
            selectedUsers.length === 0
              ? "Search by username..."
              : "Add more..."
          }
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
            {!isFetching && filteredUsers.length === 0 && (
              <div className="px-4 py-3 text-sm text-text-muted">No users found</div>
            )}
            {!isFetching &&
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-muted transition-colors text-left"
                >
                  <Avatar name={user.username} userId={user.id} size="sm" />
                  <span className="text-sm text-text font-medium truncate">
                    {user.username}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {error?.message && (
        <p className="mt-1 text-xs text-danger">{error.message}</p>
      )}
    </div>
  );
}
