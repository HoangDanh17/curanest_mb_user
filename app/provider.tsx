import React, { createContext, useState, useContext, ReactNode } from "react";

type SearchContextType = {
  isSearch: boolean;
  setIsSearch: (value: boolean) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [isSearch, setIsSearch] = useState<boolean>(false);

  return (
    <SearchContext.Provider value={{ isSearch, setIsSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

// ✅ Add a default export
export default SearchProvider;
