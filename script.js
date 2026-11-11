"use strict";
// North Star Bakery: product favorites and accessible preorder validation.
const bakeryProducts = [
  { id: "artisan-bread", name: "Artisan Bread" },
  { id: "signature-loaf", name: "Signature Loaf" },
  { id: "sweet-pastries", name: "Sweet Pastries" },
  { id: "celebration-cakes", name: "Celebration Cakes" }
];
const storageKeys = { favorites: "northStarBakeryFavorites" };

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.favorites) || "[]");
    return Array.isArray(saved) ? saved.filter(id => bakeryProducts.some(product => product.id === id)) : [];
  } catch (error) { return []; }
}
function saveFavorites(favorites) {
  try { localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites)); }
  catch (error) { /* The feature still works if storage is unavailable. */ }
}
function renderFavorites(favorites) {
  const container = document.getElementById("favorite-options");
  if (!container) return;
  container.replaceChildren();
  bakeryProducts.forEach(product => {
    const label = document.createElement("label");
    label.className = "favorite-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = product.id;
    checkbox.checked = favorites.includes(product.id);
    checkbox.addEventListener("change", () => {
      const selected = loadFavorites();
      const updated = checkbox.checked ? [...new Set([...selected, product.id])] : selected.filter(id => id !== product.id);
      saveFavorites(updated);
      renderFavorites(updated);
    });
    label.append(checkbox, document.createTextNode(" " + product.name));
    container.append(label);
  });
  const names = bakeryProducts.filter(product => favorites.includes(product.id)).map(product => product.name);
  document.getElementById("favorites-summary").textContent = names.length ? "Saved favorites: " + names.join(", ") : "No favorites selected yet.";
}
function initFavorites() {
  if (!document.getElementById("favorite-options")) return;
  renderFavorites(loadFavorites());
  document.getElementById("clear-favorites").addEventListener("click", () => {
    saveFavorites([]);
    renderFavorites([]);
  });
}
function showFieldError(id, message) {
  const field = document.getElementById(id);
  const messageElement = document.getElementById(id + "-error");
  if (!field || !messageElement) return;
  messageElement.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) field.setAttribute("aria-describedby", id + "-error");
  else field.removeAttribute("aria-describedby");
}
function validatePreorder() {
  const name = document.getElementById("customer-name").value.trim();
  const email = document.getElementById("customer-email").value.trim();
  const type = document.getElementById("request-type").value;
  const details = document.getElementById("item-details").value.trim();
  const errors = {
    "customer-name": name.length < 2 ? "Please enter your name (at least 2 characters)." : "",
    "customer-email": /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Please enter a valid email address.",
    "request-type": type ? "" : "Please choose a request type.",
    "item-details": details.length < 5 ? "Please provide at least 5 characters of details." : ""
  };
  Object.entries(errors).forEach(([id, message]) => showFieldError(id, message));
  return Object.values(errors).every(message => !message);
}
function initPreorderForm() {
  const form = document.getElementById("preorder-form");
  if (!form) return;
  ["customer-name", "customer-email", "request-type", "item-details"].forEach(id => {
    const field = document.getElementById(id);
    field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
      if (document.getElementById(id + "-error").textContent) validatePreorder();
    });
  });
  form.addEventListener("submit", event => {
    event.preventDefault(); // This demo has no backend and must not claim to send a request.
    const result = document.getElementById("form-result");
    if (!validatePreorder()) {
      result.textContent = "Please correct the highlighted fields before reviewing your request.";
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    result.textContent = "Your request details look good! This is a demonstration form; no request was sent to the bakery.";
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initFavorites();
  initPreorderForm();
});
