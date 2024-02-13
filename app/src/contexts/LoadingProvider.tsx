import { ChildrenProps } from '@/types/ChildrenProps';
import { createContext, useContext, useState } from 'react';

// Create the context with a default value
export const LoadingContext = createContext({
  isMoveLoading: false,
  setIsMoveLoading: (value: boolean) => {},
});

export const LoadingProvider = ({ children }: ChildrenProps) => {
    const [isMoveLoading, setIsMoveLoading] = useState<boolean>(false);
  
    return (
      <LoadingContext.Provider value={{isMoveLoading, setIsMoveLoading}}>
        {children}
      </LoadingContext.Provider>
    );
  };

