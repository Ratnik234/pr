import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ─── Translations ─────────────────────────────────────────────────────────────
const resources = {
  en: {
    translation: {
      menu: {
        home: 'Home',
        calendar: 'Calendar',
        calories: 'Calories',
        statistics: 'Statistics',
        settings: 'Settings',
        quickActions: 'Quick Actions',
        logMeal: 'Log Meal',
        startWorkout: 'Start Workout',
        addWater: 'Add Water',
        logout: 'Log Out',
        healthScore: 'Health Score',
        excellentDay: 'Excellent day!'
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        save: 'Save Changes'
      },
      auth: {
        login: 'Log In',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        noAccount: "Don't have an account? Register",
        hasAccount: 'Already have an account? Log In'
      }
    }
  },
  ua: {
    translation: {
      menu: {
        home: 'Головна',
        calendar: 'Календар',
        calories: 'Калорії',
        statistics: 'Статистика',
        settings: 'Налаштування',
        quickActions: 'Швидкі дії',
        logMeal: 'Додати їжу',
        startWorkout: 'Почати тренування',
        addWater: 'Додати воду',
        logout: 'Вийти',
        healthScore: 'Оцінка здоров\'я',
        excellentDay: 'Чудовий день!'
      },
      settings: {
        title: 'Налаштування',
        language: 'Мова',
        save: 'Зберегти зміни'
      },
      auth: {
        login: 'Увійти',
        register: 'Зареєструватися',
        email: 'Електронна пошта',
        password: 'Пароль',
        noAccount: 'Немає акаунта? Зареєструватися',
        hasAccount: 'Вже є акаунт? Увійти'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('app_lang') || 'ua',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
