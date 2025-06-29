"use client";

import { useState } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search for parking...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

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
    <div className="relative group">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-20 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl text-gray-800 placeholder-gray-500 font-medium"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            title="Use current location"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {query && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2">
            <div className="text-sm text-gray-500 px-3 py-2">
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
                    <span>{suggestion}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              Searching for parking...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
