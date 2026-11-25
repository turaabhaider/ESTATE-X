import React, { createContext, useState, useContext } from 'react';
import { CITIES, INITIAL_MESSAGES } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [wishlist, setWishlist] = useState(['prop-1', 'prop-2']);
  const [compareList, setCompareList] = useState(['prop-1', 'prop-3']);
  const [chats, setChats] = useState(INITIAL_MESSAGES);
  const [bookedTours, setBookedTours] = useState([]);

  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: 0,
    maxPrice: 10000000,
    beds: 0,
  });

  const toggleWishlist = (propertyId) => {
    setWishlist((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const toggleCompare = (propertyId) => {
    setCompareList((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), propertyId];
      }
      return [...prev, propertyId];
    });
  };

  const sendMessage = (agentName, propertyTitle, avatar, text) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChats((prev) => {
      const existingIndex = prev.findIndex((c) => c.agentName === agentName);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          time: now,
          unread: 0,
          messages: [
            ...updated[existingIndex].messages,
            { id: Date.now().toString(), sender: 'user', text, time: now },
          ],
        };
        return updated;
      }
      return [
        {
          id: Date.now().toString(),
          agentName,
          propertyTitle,
          avatar,
          unread: 0,
          time: now,
          messages: [{ id: Date.now().toString(), sender: 'user', text, time: now }],
        },
        ...prev,
      ];
    });
  };

  const bookTour = (property, dateLabel, timeLabel) => {
    setBookedTours((prev) => [
      { id: Date.now().toString(), property, dateLabel, timeLabel },
      ...prev,
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        wishlist,
        toggleWishlist,
        compareList,
        toggleCompare,
        filters,
        setFilters,
        chats,
        sendMessage,
        bookedTours,
        bookTour,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);