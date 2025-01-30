// app/context/AppContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const isSubscribed = email.length > 0;
  const [tempEmail, setTempEmail] = useState("");

  useEffect(() => {
    // Check if localStorage is available
    const storedEmail =
      typeof window !== "undefined"
        ? localStorage.getItem("presidential_summary_email")
        : null;
    if (storedEmail) {
      setEmail(storedEmail);
      storedEmail.length > 0 && setMessage("successfully subscribed");
    }
  }, []);

  const handleSetEmail = (newEmail) => {
    setEmail(newEmail);
    newEmail.length > 0 && setMessage("successfully subscribed");
    newEmail.length === 0 && setMessage("");
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
        tempEmail,
        setTempEmail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
