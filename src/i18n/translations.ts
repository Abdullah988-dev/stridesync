export type SupportedLanguage = 'en' | 'ur';

export interface Translations {
  // App
  appName: string;
  tagline: string;
  
  // Navigation
  navHome: string;
  navStats: string;
  navAchievements: string;
  navSettings: string;
  navProfile: string;

  // Onboarding
  onboardingTitle1: string;
  onboardingDesc1: string;
  onboardingTitle2: string;
  onboardingDesc2: string;
  onboardingTitle3: string;
  onboardingDesc3: string;
  getStarted: string;
  skip: string;
  next: string;
  done: string;

  // Profile Setup
  profileSetupTitle: string;
  profileSetupSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  ageLabel: string;
  agePlaceholder: string;
  genderLabel: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  heightLabel: string;
  weightLabel: string;
  dailyGoalLabel: string;
  stridePreview: string;
  continueBtn: string;

  // Dashboard / Home
  todayTitle: string;
  dailyGoal: string;
  stepsCount: string;
  ofGoal: string;
  goalCompleted: string;
  goalAlmostThere: string;
  keepGoing: string;
  distance: string;
  calories: string;
  activeTime: string;
  activeMinutes: string;
  kmUnit: string;
  milesUnit: string;
  kcalUnit: string;
  minsUnit: string;
  todayActivity: string;
  hourlyBreakdown: string;
  addSteps: string;
  motivationalQuote: string;
  syncing: string;
  pedometerUnavailable: string;
  pedometerPermissionDenied: string;
  grantPermission: string;
  simulationModeActive: string;

  // Statistics
  statsTitle: string;
  tabDay: string;
  tabWeek: string;
  tabMonth: string;
  dailyAverage: string;
  totalSteps: string;
  bestDay: string;
  weeklySummary: string;
  monthlySummary: string;
  noDataYet: string;
  noDataDesc: string;
  startWalkingToday: string;
  history: string;

  // Achievements
  achievementsTitle: string;
  currentStreak: string;
  daysStreak: string;
  bestStreak: string;
  badgesUnlocked: string;
  locked: string;
  unlocked: string;
  unlockedAt: string;
  badgeFirstStepTitle: string;
  badgeFirstStepDesc: string;
  badge5kTitle: string;
  badge5kDesc: string;
  badge10kTitle: string;
  badge10kDesc: string;
  badge15kTitle: string;
  badge15kDesc: string;
  badge20kTitle: string;
  badge20kDesc: string;
  badgeStreak3Title: string;
  badgeStreak3Desc: string;
  badgeStreak7Title: string;
  badgeStreak7Desc: string;
  badgeStreak30Title: string;
  badgeStreak30Desc: string;
  badgeHalfMarathonTitle: string;
  badgeHalfMarathonDesc: string;
  badgeMarathonTitle: string;
  badgeMarathonDesc: string;
  badgeMemberTitle: string;
  badgeMemberDesc: string;

  // Settings
  settingsTitle: string;
  generalSection: string;
  preferencesSection: string;
  hydrationSection: string;
  waterGoalLabel: string;
  testWaterReminder: string;
  glassesUnit: string;
  dataSection: string;
  aboutSection: string;
  editGoal: string;
  unitsTitle: string;
  metric: string;
  imperial: string;
  themeTitle: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  languageTitle: string;
  english: string;
  urdu: string;
  notificationsTitle: string;
  notificationsDesc: string;
  morningReminder: string;
  eveningReminder: string;
  inactivityReminder: string;
  exportCsv: string;
  exportCsvSuccess: string;
  exportCsvError: string;
  resetData: string;
  resetDataConfirmTitle: string;
  resetDataConfirmDesc: string;
  cancel: string;
  confirm: string;
  version: string;

  // Profile Edit
  editProfileTitle: string;
  saveChanges: string;
  profileSavedSuccess: string;

  // Manual Step Modal
  manualEntryTitle: string;
  manualEntryDesc: string;
  stepsInputLabel: string;
  dateInputLabel: string;
  saveSteps: string;
  invalidStepCount: string;

  // Goal Reached Modal
  congratsGoalTitle: string;
  congratsGoalDesc: string;
  shareAchievement: string;
  close: string;

  // Notifications text
  notifMorningTitle: string;
  notifMorningBody: string;
  notifEveningTitle: string;
  notifEveningBody: string;
  notifGoalReachedTitle: string;
  notifGoalReachedBody: string;
  notifInactivityTitle: string;
  notifInactivityBody: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'StrideSync',
    tagline: 'Step Into Health',
    navHome: 'Today',
    navStats: 'Analytics',
    navAchievements: 'Badges',
    navSettings: 'Settings',
    navProfile: 'Profile',
    onboardingTitle1: 'Track Every Step',
    onboardingDesc1: 'Accurate background step tracking that monitors your daily movement, distance, and calories effortlessly.',
    onboardingTitle2: 'Reach Your Fitness Goals',
    onboardingDesc2: 'Customized daily targets designed around your height, weight, and stride length for real results.',
    onboardingTitle3: 'Earn Streaks & Badges',
    onboardingDesc3: 'Stay motivated with milestone badges, streak records, and inspiring daily health analytics.',
    getStarted: 'Get Started',
    skip: 'Skip',
    next: 'Next',
    done: 'Done',
    profileSetupTitle: 'Personalize Your Stride',
    profileSetupSubtitle: 'We use your height and weight to accurately calculate distance, calories, and stride length.',
    nameLabel: 'Your Name',
    namePlaceholder: 'e.g. Alex Johnson',
    ageLabel: 'Age',
    agePlaceholder: 'e.g. 28',
    genderLabel: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    heightLabel: 'Height (cm)',
    weightLabel: 'Weight (kg)',
    dailyGoalLabel: 'Daily Step Goal',
    stridePreview: 'Calculated Stride Length',
    continueBtn: 'Continue',
    todayTitle: 'Today',
    dailyGoal: 'Daily Goal',
    stepsCount: 'Steps',
    ofGoal: 'of {goal} steps',
    goalCompleted: 'Goal Reached! Amazing work! 🎉',
    goalAlmostThere: 'Almost there! Just {remaining} steps to go.',
    keepGoing: 'Keep moving, every step counts!',
    distance: 'Distance',
    calories: 'Calories',
    activeTime: 'Active Time',
    activeMinutes: 'Active Mins',
    kmUnit: 'km',
    milesUnit: 'mi',
    kcalUnit: 'kcal',
    minsUnit: 'min',
    todayActivity: "Today's Activity",
    hourlyBreakdown: 'Hourly Activity',
    addSteps: 'Log Steps',
    motivationalQuote: 'Daily Motivation',
    syncing: 'Syncing steps...',
    pedometerUnavailable: 'Hardware step sensor is not available on this device. Fallback mode is active.',
    pedometerPermissionDenied: 'Physical activity permission is needed to track your steps automatically.',
    grantPermission: 'Enable Sensor',
    simulationModeActive: 'Demo Mode: tap "+ Log Steps" or shake to test counting.',
    statsTitle: 'Activity Analytics',
    tabDay: 'Day',
    tabWeek: 'Week',
    tabMonth: 'Month',
    dailyAverage: 'Daily Average',
    totalSteps: 'Total Steps',
    bestDay: 'Best Day',
    weeklySummary: 'Weekly Summary',
    monthlySummary: 'Monthly Summary',
    noDataYet: 'No activity records yet',
    noDataDesc: 'Your daily step trends and historical statistics will appear here.',
    startWalkingToday: 'Start walking today to generate your stats!',
    history: 'History Logs',
    achievementsTitle: 'Milestones & Streaks',
    currentStreak: 'Current Streak',
    daysStreak: 'Days Streak',
    bestStreak: 'Personal Record',
    badgesUnlocked: 'Unlocked Badges',
    locked: 'Locked',
    unlocked: 'Unlocked',
    unlockedAt: 'Unlocked on {date}',
    badgeFirstStepTitle: 'First Step',
    badgeFirstStepDesc: 'Recorded your very first step in StrideSync.',
    badge5kTitle: '5,000 Step Walker',
    badge5kDesc: 'Reached 5,000 steps in a single day.',
    badge10kTitle: '10,000 Goal Crusher',
    badge10kDesc: 'Completed the gold standard 10,000 steps daily goal.',
    badge15kTitle: '15,000 Step Master',
    badge15kDesc: 'Pushed past limits with 15,000 steps in 24 hours.',
    badge20kTitle: '20,000 Ultra Walker',
    badge20kDesc: 'Incredible endurance! Crossed 20,000 steps.',
    badgeStreak3Title: '3-Day Momentum',
    badgeStreak3Desc: 'Hit your daily step goal 3 days in a row.',
    badgeStreak7Title: 'Week on Fire 🔥',
    badgeStreak7Desc: 'Maintained a flawless 7-day goal streak.',
    badgeStreak30Title: 'Monthly Legend',
    badgeStreak30Desc: 'Conquered 30 consecutive days of goal achievements.',
    badgeHalfMarathonTitle: 'Half Marathon',
    badgeHalfMarathonDesc: 'Walked over 21 kilometers in cumulative distance.',
    badgeMarathonTitle: 'Marathon Distance',
    badgeMarathonDesc: 'Walked over 42 kilometers in cumulative distance.',
    badgeMemberTitle: 'Club Member',
    badgeMemberDesc: 'Successfully registered your official StrideSync profile.',
    settingsTitle: 'Settings & Preferences',
    generalSection: 'General',
    preferencesSection: 'Preferences',
    hydrationSection: 'Hydration & Water Reminders',
    waterGoalLabel: 'Daily Water Target',
    testWaterReminder: 'Test Hydration Alert',
    glassesUnit: 'glasses',
    dataSection: 'Data & Backup',
    aboutSection: 'About',
    editGoal: 'Daily Target Goal',
    unitsTitle: 'Measurement Units',
    metric: 'Metric (km, kg)',
    imperial: 'Imperial (mi, lb)',
    themeTitle: 'App Theme',
    themeLight: 'Light Theme',
    themeDark: 'Dark Theme',
    themeSystem: 'System Default',
    languageTitle: 'Language / زبان',
    english: 'English',
    urdu: 'اردو (Urdu)',
    notificationsTitle: 'Smart Notifications',
    notificationsDesc: 'Get timely reminders and goal celebration alerts',
    morningReminder: 'Morning Motivation (08:00 AM)',
    eveningReminder: 'Evening Goal Check (07:00 PM)',
    inactivityReminder: 'Move Reminder (every 2h)',
    exportCsv: 'Export Activity as CSV',
    exportCsvSuccess: 'Activity data exported successfully!',
    exportCsvError: 'Failed to export data. Please try again.',
    resetData: 'Clear All App Data',
    resetDataConfirmTitle: 'Reset All Data?',
    resetDataConfirmDesc: 'This will permanently remove all your step history, streak progress, and settings. This action cannot be undone.',
    cancel: 'Cancel',
    confirm: 'Reset Everything',
    version: 'Version',
    editProfileTitle: 'Personal Profile',
    saveChanges: 'Save Profile',
    profileSavedSuccess: 'Your profile has been successfully updated!',
    manualEntryTitle: 'Log Steps Manually',
    manualEntryDesc: 'Forgot to carry your phone or did a treadmill run? Add steps directly.',
    stepsInputLabel: 'Number of Steps',
    dateInputLabel: 'Date',
    saveSteps: 'Record Steps',
    invalidStepCount: 'Please enter a valid step count between 1 and 100,000.',
    congratsGoalTitle: 'Daily Goal Achieved! 🏆',
    congratsGoalDesc: 'You reached your {goal} steps target today! Your body thanks you.',
    shareAchievement: 'Celebrate & Share',
    close: 'Awesome!',
    notifMorningTitle: 'Good morning! ☀️ Time to stride',
    notifMorningBody: 'A quick walk today will boost your energy and focus. Start strong!',
    notifEveningTitle: 'Evening Goal Check 🎯',
    notifEveningBody: 'You are so close to your daily step goal! Take an evening walk to crush it.',
    notifGoalReachedTitle: 'Goal Reached! 🌟',
    notifGoalReachedBody: 'Congratulations! You crushed your daily step target today!',
    notifInactivityTitle: 'Time to Stretch! 🚶',
    notifInactivityBody: "You've been sitting for a while. Take a 2-minute stroll!",
  },
  ur: {
    appName: 'اسٹرائیڈ سنک',
    tagline: 'صحت کی جانب ہر قدم',
    navHome: 'آج',
    navStats: 'اعدادوشمار',
    navAchievements: 'تمغے',
    navSettings: 'ترتیبات',
    navProfile: 'پروفائل',
    onboardingTitle1: 'ہر قدم کا درست حساب',
    onboardingDesc1: 'پس منظر میں قدموں کی خودکار گنتی، فاصلہ اور جلائی گئی کیلوریز کا حقیقی حساب۔',
    onboardingTitle2: 'اپنے اہداف حاصل کریں',
    onboardingDesc2: 'قد، وزن اور قدم کے فاصلے کے مطابق طے شدہ روزانہ اہداف۔',
    onboardingTitle3: 'تمغے اور ریکارڈز جیتیں',
    onboardingDesc3: 'مسلسل قدموں کی زنجیر (سٹریک) اور کامیابی کے تمغوں سے خود کو متحرک رکھیں۔',
    getStarted: 'شروع کریں',
    skip: 'چھوڑیں',
    next: 'اگلا',
    done: 'مکمل',
    profileSetupTitle: 'اپنی معلومات درج کریں',
    profileSetupSubtitle: 'ہم آپ کے قد اور وزن سے قدموں کی لمبائی اور کیلوریز کا درست اندازہ لگاتے ہیں۔',
    nameLabel: 'آپ کا نام',
    namePlaceholder: 'مثلاً: احمد خان',
    ageLabel: 'عمر',
    agePlaceholder: 'مثلاً: 25',
    genderLabel: 'جنس',
    genderMale: 'مرد',
    genderFemale: 'خاتون',
    genderOther: 'دیگر',
    heightLabel: 'قد (سینٹی میٹر)',
    weightLabel: 'وزن (کلوگرام)',
    dailyGoalLabel: 'روزانہ کا ہدف (قدم)',
    stridePreview: 'قدم کی تخمینی لمبائی',
    continueBtn: 'آگے بڑھیں',
    todayTitle: 'آج کی سرگرمی',
    dailyGoal: 'روزانہ کا ہدف',
    stepsCount: 'قدم',
    ofGoal: 'ہدف {goal} قدم',
    goalCompleted: 'مبارک ہو! آج کا ہدف مکمل ہو گیا! 🎉',
    goalAlmostThere: 'ہدف کے بالکل قریب! صرف {remaining} قدم باقی ہیں۔',
    keepGoing: 'چلتے رہیں، ہر قدم اہم ہے!',
    distance: 'فاصلہ',
    calories: 'کیلوریز',
    activeTime: 'فعال وقت',
    activeMinutes: 'فعال منٹ',
    kmUnit: 'کلومیٹر',
    milesUnit: 'میل',
    kcalUnit: 'کیلوری',
    minsUnit: 'منٹ',
    todayActivity: 'آج کی کارکردگی',
    hourlyBreakdown: 'گھنٹہ وار رفتار',
    addSteps: 'قدم درج کریں',
    motivationalQuote: 'روزانہ کا سبق',
    syncing: 'قدم ہم آہنگ ہو رہے ہیں...',
    pedometerUnavailable: 'اس ڈیوائس پر ہارڈویئر سینسر دستیاب نہیں۔ متبادل موڈ فعال ہے۔',
    pedometerPermissionDenied: 'قدم شمار کرنے کے لیے موشن سینسر کی اجازت درکار ہے۔',
    grantPermission: 'اجازت دیں',
    simulationModeActive: 'ڈیمو موڈ: قدم شامل کرنے کے لیے بٹن دبائیں۔',
    statsTitle: 'سرگرمی کا تجزیہ',
    tabDay: 'دن',
    tabWeek: 'ہفتہ',
    tabMonth: 'ماہانہ',
    dailyAverage: 'روزانہ اوسط',
    totalSteps: 'کل قدم',
    bestDay: 'بہترین دن',
    weeklySummary: 'ہفتہ وار جائزہ',
    monthlySummary: 'ماہانہ جائزہ',
    noDataYet: 'ابھی کوئی ریکارڈ موجود نہیں',
    noDataDesc: 'آپ کی سرگرمی کے گراف اور پرانے ریکارڈ یہاں نظر آئیں گے۔',
    startWalkingToday: 'آج سے چلنا شروع کریں!',
    history: 'تاریخ وار ریکارڈ',
    achievementsTitle: 'تمغے اور سٹریکس',
    currentStreak: 'موجودہ سٹریک',
    daysStreak: 'دنوں کا تسلسل',
    bestStreak: 'بہترین ریکارڈ',
    badgesUnlocked: 'حاصل کردہ تمغے',
    locked: 'مقفل',
    unlocked: 'حاصل شدہ',
    unlockedAt: 'حاصل کیا گیا: {date}',
    badgeFirstStepTitle: 'پہلا قدم',
    badgeFirstStepDesc: 'ایپ میں اپنا پہلا قدم درج کیا۔',
    badge5kTitle: '5 ہزار قدم',
    badge5kDesc: 'ایک دن میں 5,000 قدم مکمل کیے۔',
    badge10kTitle: '10 ہزار کا فاتح',
    badge10kDesc: 'سنہری ہدف 10,000 قدم کا سنگ میل عبور کیا۔',
    badge15kTitle: '15 ہزار کا ماسٹر',
    badge15kDesc: '24 گھنٹوں میں 15,000 قدموں کا غیرمعمولی سفر۔',
    badge20kTitle: '20 ہزار الٹرا واکر',
    badge20kDesc: 'حیرت انگیز استقامت! 20,000 قدم پار کیے۔',
    badgeStreak3Title: '3 روزہ تسلسل',
    badgeStreak3Desc: 'مسلسل 3 دن روزانہ ہدف مکمل کیا۔',
    badgeStreak7Title: 'ہفتہ وار شعلہ 🔥',
    badgeStreak7Desc: 'مسلسل 7 دن تک ہدف پر برقرار رہے۔',
    badgeStreak30Title: 'ماہانہ چیمپئن',
    badgeStreak30Desc: 'مسلسل 30 دن تک روزانہ کا ہدف حاصل کیا۔',
    badgeHalfMarathonTitle: 'ہاف میراتھن',
    badgeHalfMarathonDesc: 'مجموعی طور پر 21 کلومیٹر کا فاصلہ طے کیا۔',
    badgeMarathonTitle: 'میدانِ میراتھن',
    badgeMarathonDesc: 'مجموعی طور پر 42 کلومیٹر سے زیادہ فاصلہ طے کیا۔',
    badgeMemberTitle: 'رجسٹرڈ ممبر',
    badgeMemberDesc: 'سٹریڈ سنک اکاؤنٹ کامیابی سے بنا لیا۔',
    settingsTitle: 'ترتیبات',
    generalSection: 'عمومی',
    preferencesSection: 'ترجیحات',
    hydrationSection: 'پانی پینے کی ترتیبات',
    waterGoalLabel: 'روزانہ پانی کا ہدف',
    testWaterReminder: 'پانی کی یاد دہانی چیک کریں',
    glassesUnit: 'گلاس',
    dataSection: 'ڈیٹا اور بیک اپ',
    aboutSection: 'ایپ کے بارے میں',
    editGoal: 'روزانہ قدموں کا ہدف',
    unitsTitle: 'پیمائش کی اکائیاں',
    metric: 'میٹرک (کلومیٹر، کلو)',
    imperial: 'امپیریل (میل، پاؤنڈ)',
    themeTitle: 'تھیم',
    themeLight: 'روشن تھیم',
    themeDark: 'تاریک تھیم',
    themeSystem: 'سسٹم ڈیفالٹ',
    languageTitle: 'زبان / Language',
    english: 'English (انگریزی)',
    urdu: 'اردو',
    notificationsTitle: 'یاد دہانی کے نوٹیفیکیشنز',
    notificationsDesc: 'روزانہ متحرک پیغامات اور ہدف کی مبارکباد حاصل کریں',
    morningReminder: 'صبح کی یاد دہانی (8:00 بجے)',
    eveningReminder: 'شام کا جائزہ (7:00 بجے)',
    inactivityReminder: 'چلنے کی ترغیب (ہر 2 گھنٹے بعد)',
    exportCsv: 'ڈیٹا CSV فائل میں محفوظ کریں',
    exportCsvSuccess: 'فائل کامیابی کے ساتھ برآمد ہو گئی!',
    exportCsvError: 'فائل محفوظ نہ ہو سکی، دوبارہ کوشش کریں۔',
    resetData: 'تمام ڈیٹا حذف کریں',
    resetDataConfirmTitle: 'کیا تمام ڈیٹا صاف کر دیا جائے؟',
    resetDataConfirmDesc: 'اس سے آپ کے تمام پرانے قدم، سٹریکس اور ترتیبات مستقل طور پر مٹ جائیں گی۔',
    cancel: 'منسوخ',
    confirm: 'ہاں، سب مٹا دیں',
    version: 'ورژن',
    editProfileTitle: 'ذاتی پروفائل',
    saveChanges: 'محفوظ کریں',
    profileSavedSuccess: 'پروفائل کامیابی سے تبدیل ہو گئی!',
    manualEntryTitle: 'خود سے قدم درج کریں',
    manualEntryDesc: 'اگر فون ساتھ نہیں تھا یا ٹریڈ مل پر دوڑے تھے، تو قدم یہاں لکھیں۔',
    stepsInputLabel: 'قدموں کی تعداد',
    dateInputLabel: 'تاریخ',
    saveSteps: 'محفوظ کریں',
    invalidStepCount: 'برائے مہربانی 1 سے 100,000 کے درمیان صحیح تعداد درج کریں۔',
    congratsGoalTitle: 'ہدف حاصل کر لیا گیا! 🏆',
    congratsGoalDesc: 'آپ نے آج {goal} قدموں کا ہدف مکمل کر لیا ہے۔ شاندار کام!',
    shareAchievement: 'مبارکباد شیئر کریں',
    close: 'بہت خوب!',
    notifMorningTitle: 'صبح بخیر! ☀️ چلنے کا وقت ہے',
    notifMorningBody: 'صبح کی چہل قدمی آپ کو سارا دن چست رکھے گی۔ شروع کیجیے!',
    notifEveningTitle: 'شام کا جائزہ 🎯',
    notifEveningBody: 'آپ روزانہ کے ہدف کے بالکل قریب ہیں! ذرا سی چہل قدمی سے ہدف مکمل کریں۔',
    notifGoalReachedTitle: 'ہدف مکمل! 🌟',
    notifGoalReachedBody: 'مبارک ہو! آپ نے آج کا روزانہ ہدف کامیابی سے عبور کر لیا ہے!',
    notifInactivityTitle: 'تھوڑا چہل قدمی کریں! 🚶',
    notifInactivityBody: 'آپ کافی دیر سے بیٹھے ہیں۔ صحت کے لیے دو منٹ چہل قدمی کریں۔',
  },
};
