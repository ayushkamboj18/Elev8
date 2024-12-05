/* eslint-disable react/prop-types */
import { createContext, useEffect, useState } from "react";
import axios from 'axios';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(() => {

    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // If there is no user in the state and we're making an API call
    if (!user) {
      axios.get('/profile')
        .then(({ data }) => {
          setUser(data);
          // Save the user data in localStorage
          localStorage.setItem('user', JSON.stringify(data));
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
        });
    }
  }, [user]); // Dependency array makes sure this effect runs only when `user` is undefined.

  // Whenever the user is updated, also save it to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
