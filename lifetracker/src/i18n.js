import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ─── Translations ─────────────────────────────────────────────────────────────
const resources = {
  en: {
    translation: {
      settings: {
        backupImported: "lifetracker-backup.json imported successfully!",
        exportError: "Export failed.",
        confirmReset: "Delete ALL LifeTracker data? This action cannot be undone.",
        dataCleared: "All data has been deleted."
      },
      language: {
        ukrainian: "Ukrainian"
      },
      calories: {
        enterMealName: "Enter meal name",
        addFood: "Add Food",
        cancel: "Cancel",
        noFoods: "No foods logged yet",
        total: "Total",
        remaining: "Remaining",
        protein: "Protein",
        fat: "Fat",
        carbs: "Carbs",
        calories: "Calories",
        kcal: "kcal",
        grams: "grams"
      },
      home: {
        autoDataUnavailable: "Auto-retrieval of data is unavailable"
      },
      profile: {
        title: "Profile",
        description: "Your personal information and account details.",
        profileData: "Profile Information",
        edit: "Edit"
      },
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
      nav: {
        home: "Home",
        calendar: "Calendar",
        calories: "Calories",
        stats: "Statistics",
        settings: "Settings"
      },
      home: {
        goodMorning: "Good Morning",
        goodAfternoon: "Good Afternoon",
        goodEvening: "Good Evening",
        todayOverview: "Today's Overview",
        quickActions: "Quick Actions",
        logWorkout: "Log Workout",
        addWater: "Add Water",
        addNote: "Add Note",
        addCalories: "Add Calories",
        warnings: "Warnings",
        highLoadWarning: "High Workout Load",
        highLoadDesc: "Consider resting tomorrow. Your workout load was extremely high today based on your profile.",
        lowWaterWarning: "Hydration Needed",
        lowWaterDesc: "You haven't logged enough water for today.",
        overCaloriesWarning: "High Calories",
        overCaloriesDesc: "You exceeded your daily calorie goal significantly."
      },
      settings: {
        profile: "Profile",
        height: "Height (cm)",
        weight: "Weight (kg)",
        age: "Age",
        gender: "Gender (optional)",
        activityLevel: "Activity Level (optional)",
        male: "Male",
        female: "Female",
        low: "Low",
        medium: "Medium",
        high: "High",
        goals: "Goals",
        theme: "Theme"
      },
      stats: {
        title: "Statistics",
        recommendations: "Recommendations",
        increaseWeight: "Increase Weight",
        increaseWeightDesc: "You have been lifting {{weight}}kg for a while. Consider increasing by 2.5-5kg.",
        noProgress: "Plateau Detected",
        noProgressDesc: "Your lifting weight hasn't changed in a month. Consider a new training program."
      },
      sidebar: {
        wellnessDashboard: "Wellness Dashboard",
        menu: "Menu",
        addTask: "Add Task",
        logMeal: "Log Meal",
        addWater: "Add Water",
        viewCalendar: "View Calendar",
        ptsFromYesterday: "+{{pts}} pts from yesterday",
        myAccount: "My Account",
        active: "Active",
        logout: "Logout"
      }
    }
  },

  ua: {
    translation: {
      settings: {
        backupImported: "Файл lifetracker-backup.json завантажено!",
        exportError: "Помилка при експорті.",
        confirmReset: "Видалити ВСІ дані LifeTracker? Цю дію неможливо скасувати.",
        dataCleared: "Дані повністю очищено."
      },
      language: {
        ukrainian: "Українська"
      },
      calories: {
        enterMealName: "Вкажіть назву страви",
        addFood: "Додати їжу",
        cancel: "Скасувати",
        noFoods: "Їжа ще не додана",
        total: "Всього",
        remaining: "Залишилось",
        protein: "Білки",
        fat: "Жири",
        carbs: "Вуглеводи",
        calories: "Калорії",
        kcal: "ккал",
        grams: "грам"
      },
      home: {
        autoDataUnavailable: "Автоматичне отримання даних недоступне"
      },
      profile: {
        title: "Профіль",
        description: "Твоя особиста інформація та дані акаунта.",
        profileData: "Дані профілю",
        edit: "Редагувати"
      },
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
      nav: {
        home: "Головна",
        calendar: "Календар",
        calories: "Калорії",
        stats: "Статистика",
        settings: "Налаштування"
      },
      home: {
        goodMorning: "Доброго ранку",
        goodAfternoon: "Доброго дня",
        goodEvening: "Доброго вечора",
        todayOverview: "Огляд на сьогодні",
        quickActions: "Швидкі дії",
        logWorkout: "Додати тренування",
        addWater: "Додати воду",
        addNote: "Додати нотатку",
        addCalories: "Додати калорії",
        warnings: "Попередження",
        highLoadWarning: "Високе навантаження",
        highLoadDesc: "Подумайте про відпочинок завтра. Ваше навантаження сьогодні було надто високим з урахуванням профілю.",
        lowWaterWarning: "Потрібна гідратація",
        lowWaterDesc: "Ви випили недостатньо води на сьогодні.",
        overCaloriesWarning: "Багато калорій",
        overCaloriesDesc: "Ви значно перевищили свою денну норму калорій."
      },
      settings: {
        title: 'Налаштування',
        language: 'Мова',
        save: 'Зберегти зміни',
        profile: "Профіль",
        height: "Зріст (см)",
        weight: "Вага (кг)",
        age: "Вік",
        gender: "Стать (необов'язково)",
        activityLevel: "Рівень активності",
        male: "Чоловіча",
        female: "Жіноча",
        low: "Низький",
        medium: "Середній",
        high: "Високий",
        goals: "Цілі",
        theme: "Тема"
      },
      auth: {
        login: 'Увійти',
        register: 'Зареєструватися',
        email: 'Електронна пошта',
        password: 'Пароль',
        noAccount: 'Немає акаунта? Зареєструватися',
        hasAccount: 'Вже є акаунт? Увійти'
      },
      stats: {
        title: "Статистика",
        recommendations: "Рекомендації",
        increaseWeight: "Збільште вагу",
        increaseWeightDesc: "Ви піднімаєте {{weight}}кг вже деякий час. Спробуйте додати 2.5-5кг.",
        noProgress: "Застій у прогресі",
        noProgressDesc: "Ваша робоча вага не змінювалась вже місяць. Спробуйте змінити програму тренувань."
      },
      sidebar: {
        wellnessDashboard: "Панель здоров'я",
        menu: "Меню",
        addTask: "Додати задачу",
        logMeal: "Додати їжу",
        addWater: "Додати воду",
        viewCalendar: "Переглянути календар",
        ptsFromYesterday: "+{{pts}} балів з учора",
        myAccount: "Мій акаунт",
        active: "Активний",
        logout: "Вийти"
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
