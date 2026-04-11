import React, { createContext, useContext, useState } from "react";

interface KeySetupContextType {
  isKeyReady: boolean;
  setIsKeyReady: (ready: boolean) => void;
}

const KeySetupContext = createContext<KeySetupContextType>({
  isKeyReady: false,
  setIsKeyReady: () => {},
});

export const KeySetupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isKeyReady, setIsKeyReady] = useState(false);
  return (
    <KeySetupContext.Provider value={{ isKeyReady, setIsKeyReady }}>
      {children}
    </KeySetupContext.Provider>
  );
};

export const useKeyReady = () => useContext(KeySetupContext);
