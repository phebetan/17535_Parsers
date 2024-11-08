import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userid, setUserid] = useState(null);

  return (
    <UserContext.Provider value={{ userid, setUserid }}>
      {children}
    </UserContext.Provider>
  );
};
