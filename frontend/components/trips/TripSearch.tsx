"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce"; // Optional: helps reduce lag, or use standard timeout
import { Input } from "../ui/input";

export default function TripSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Function to update URL params
  const handleSearch = (term: string, key: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set(key, term);
    } else {
      params.delete(key);
    }
    // Updates the URL without a page reload
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border border-border mb-6 flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-secondary-foreground mb-1">
          From
        </label>
        <Input
          type="text"
          placeholder="e.g. Lagos"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleSearch(e.target.value, "source")}
          defaultValue={searchParams.get("source")?.toString()}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-secondary-foreground mb-1">
          To
        </label>
        <Input
          type="text"
          placeholder="e.g. Abuja"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleSearch(e.target.value, "destination")}
          defaultValue={searchParams.get("destination")?.toString()}
        />
      </div>
    </div>
  );
}
