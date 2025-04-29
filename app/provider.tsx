import { UserData } from "@/app/(tabs)/profile";
import React, { createContext, useState, useContext, ReactNode } from "react";

type SearchContextType = {
  userData: UserData | undefined;
  setUserData: (data: UserData | undefined) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | undefined>();

  return (
    <SearchContext.Provider value={{ userData, setUserData }}>
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

export default SearchProvider;
