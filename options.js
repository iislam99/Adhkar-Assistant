import { renderSettingsView, handleCustomDhikrFormSubmit } from './shared.js';

document.addEventListener('DOMContentLoaded', () => {
  renderSettingsView()
});

handleCustomDhikrFormSubmit(() => {
  renderSettingsView()
  document.getElementById('custom-arabic').value = '';
  document.getElementById('custom-transliteration').value = '';
  document.getElementById('custom-translation').value = '';
});