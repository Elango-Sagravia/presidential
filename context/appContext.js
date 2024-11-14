// app/context/AppContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const isSubscribed = email.length > 0;

  useEffect(() => {
    // Check if localStorage is available
    const storedEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("presidential_summary_email")
        : null;
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSetEmail = (newEmail) => {
    setEmail(newEmail);
    if (typeof window !== "undefined") {
      localStorage.setItem("presidential_summary_email", newEmail); // Save to localStorage
    }
  };

  return (
    <AppContext.Provider
      value={{
        email,
        setEmail: handleSetEmail,
        isSubscribed,
        setMessage,
        message,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
