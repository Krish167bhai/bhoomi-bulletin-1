import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompareContextType {
  compareIds: string[];
  addToCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bb_compare_ids');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bb_compare_ids', JSON.stringify(compareIds));
  }, [compareIds]);

  const addToCompare = (id: string): boolean => {
    if (compareIds.includes(id)) return true;
    if (compareIds.length >= 4) {
      alert('You can compare a maximum of 4 properties at a time.');
      return false;
    }
    setCompareIds((prev) => [...prev, id]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setCompareIds((prev) => prev.filter((item) => item !== id));
  };

  const clearCompare = () => {
    setCompareIds([]);
  };

  const isInCompare = (id: string) => compareIds.includes(id);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};
