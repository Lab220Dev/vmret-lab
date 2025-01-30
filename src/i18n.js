import { createI18n } from 'vue-i18n';
import pt from './locales/pt';
import en from './locales/en';
import es from './locales/es';


const i18n = createI18n({
  locale: "pt", // Define o idioma padrão
  fallbackLocale: "pt", // Caso a tradução não exista, cai para o inglês
  messages: { pt, en, es },
  legacy: false // Necessário para Vue 3 + Composition API
});

export default i18n;
