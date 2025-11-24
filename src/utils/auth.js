// src/utils/auth.js
export const getToken = () => {
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) return null;
  try {
    const { token } = JSON.parse(storedUser);
    return token || null;
  } catch (err) {
    console.error("Error parsing currentUser:", err);
    return null;
  }
};

export const setToken = (token, userData = {}) => {
  if (!token) return;
  localStorage.setItem("currentUser", JSON.stringify({ token, ...userData }));
};

export const removeToken = () => {
  localStorage.removeItem("currentUser");
};
