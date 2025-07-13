"use client";

import { useState } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

// Add a reusable Button component at the top of the file
function Button({
  children,
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function SearchBar({
  onSearch,
  placeholder = "Search for parking...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      onSearch(query.trim());
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            });
          }
        );

        const { latitude, longitude } = position.coords;
        const locationQuery = `${latitude}, ${longitude}`;
        setQuery(locationQuery);
        onSearch(locationQuery);
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setIsLocating(false);
      }
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto px-2 py-2">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl transition-all duration-300 focus-within:scale-[1.03] focus-within:shadow-2xl ${
          isFocused ? "ring-2 ring-blue-400" : ""
        }`}
        role="search"
        aria-label="Search for parking lots"
      >
        <div className="pl-4 flex items-center">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-white/80" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent outline-none border-none px-4 py-4 text-white placeholder-white/70 font-body text-base sm:text-lg focus:ring-0"
          aria-label="Search input"
        />
        {query && (
          <Button
            type="button"
            onClick={handleClear}
            className="p-2 text-white/70 hover:text-white hover:bg-blue-400/30 rounded-xl"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
        <Button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="p-3 mr-2 bg-white/20 hover:bg-white/30 text-white rounded-xl shadow-md hover:shadow-lg"
          title="Use current location"
          aria-label="Use current location"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
        </Button>
      </form>
      {query && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 font-heading">
              Recent searches
            </div>
            <div className="space-y-1">
              {["Downtown Parking", "Central Station", "Shopping Mall"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      onSearch(suggestion);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="font-body">{suggestion}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-body">Searching for parking...</span>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
