import React, { createContext, useState, useContext, useMemo } from 'react';
import { CITIES, INITIAL_MESSAGES } from '../data/mockData';
import { COLORS as LIGHT_PALETTE } from '../theme/theme';

const DARK_PALETTE = {
  background: '#0D1210',
  surface: '#151C19',       // Obsidian warm-charcoal surface
  surfaceAlt: '#1C2521',    // Elevated dark neutral
  card: '#151C19',
  primary: '#22A06B',       // Luminous emerald accent for dark surfaces
  primaryLight: '#132A20',  // Deep emerald tint
  accent: '#2AC784',
  textPrimary: '#F3F6F4',
  textSecondary: '#A8B3AE',
  textMuted: '#6F7B75',
  border: '#242E2A',
  gold: '#D4A838',
  danger: '#E04F5F',
  white: '#FFFFFF',
  black: '#000000',
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const colors = useMemo(
    () => (isDarkMode ? DARK_PALETTE : LIGHT_PALETTE),
    [isDarkMode]
  );

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

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
    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

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
          messages: [
            { id: Date.now().toString(), sender: 'user', text, time: now },
          ],
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
        isDarkMode,
        toggleTheme,
        colors,
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