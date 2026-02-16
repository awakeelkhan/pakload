import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ur' | 'ps' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.findLoads': 'Find Loads',
    'nav.postLoad': 'Post Load',
    'nav.myLoads': 'My Loads',
    'nav.myBids': 'My Bids',
    'nav.bookings': 'Bookings',
    'nav.routes': 'Routes',
    'nav.payments': 'Payments',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.signOut': 'Sign Out',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.all': 'All',
    'common.pending': 'Pending',
    'common.confirmed': 'Confirmed',
    'common.completed': 'Completed',
    'common.cancelled': 'Cancelled',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Load posting
    'load.origin': 'Origin',
    'load.destination': 'Destination',
    'load.cargoType': 'Cargo Type',
    'load.weight': 'Weight',
    'load.price': 'Price',
    'load.pickupDate': 'Pickup Date',
    'load.deliveryDate': 'Delivery Date',
    'load.description': 'Description',
    'load.postLoad': 'Post Load',
    'load.urgent': 'Urgent',
    'load.distance': 'Distance',
    'load.vehicle': 'Vehicle Type',
    
    // Bids
    'bid.placeBid': 'Place Bid',
    'bid.yourBid': 'Your Bid',
    'bid.bidAmount': 'Bid Amount',
    'bid.message': 'Message',
    'bid.accept': 'Accept',
    'bid.reject': 'Reject',
    
    // Payments
    'payment.bankTransfer': 'Bank Transfer',
    'payment.easypaisa': 'EasyPaisa',
    'payment.jazzcash': 'JazzCash',
    'payment.card': 'Card Payment',
    'payment.amount': 'Amount',
    'payment.transactionId': 'Transaction ID',
    
    // Profile
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.company': 'Company',
    'profile.documents': 'Documents',
    'profile.verification': 'Verification',
    
    // Languages
    'lang.english': 'English',
    'lang.urdu': 'اردو',
    'lang.pashto': 'پښتو',
    'lang.chinese': '中文',
  },
  ur: {
    // Navigation
    'nav.home': 'ہوم',
    'nav.findLoads': 'لوڈ تلاش کریں',
    'nav.postLoad': 'لوڈ پوسٹ کریں',
    'nav.myLoads': 'میرے لوڈز',
    'nav.myBids': 'میری بولیاں',
    'nav.bookings': 'بکنگز',
    'nav.routes': 'راستے',
    'nav.payments': 'ادائیگیاں',
    'nav.profile': 'پروفائل',
    'nav.settings': 'ترتیبات',
    'nav.signIn': 'سائن ان',
    'nav.signUp': 'سائن اپ',
    'nav.signOut': 'سائن آؤٹ',
    
    // Common
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.save': 'محفوظ کریں',
    'common.cancel': 'منسوخ',
    'common.delete': 'حذف کریں',
    'common.edit': 'ترمیم',
    'common.submit': 'جمع کرائیں',
    'common.search': 'تلاش',
    'common.filter': 'فلٹر',
    'common.sort': 'ترتیب',
    'common.all': 'سب',
    'common.pending': 'زیر التواء',
    'common.confirmed': 'تصدیق شدہ',
    'common.completed': 'مکمل',
    'common.cancelled': 'منسوخ',
    'common.yes': 'ہاں',
    'common.no': 'نہیں',
    
    // Load posting
    'load.origin': 'مقام آغاز',
    'load.destination': 'منزل',
    'load.cargoType': 'کارگو کی قسم',
    'load.weight': 'وزن',
    'load.price': 'قیمت',
    'load.pickupDate': 'پک اپ کی تاریخ',
    'load.deliveryDate': 'ڈیلیوری کی تاریخ',
    'load.description': 'تفصیل',
    'load.postLoad': 'لوڈ پوسٹ کریں',
    'load.urgent': 'فوری',
    'load.distance': 'فاصلہ',
    'load.vehicle': 'گاڑی کی قسم',
    
    // Bids
    'bid.placeBid': 'بولی لگائیں',
    'bid.yourBid': 'آپ کی بولی',
    'bid.bidAmount': 'بولی کی رقم',
    'bid.message': 'پیغام',
    'bid.accept': 'قبول کریں',
    'bid.reject': 'رد کریں',
    
    // Payments
    'payment.bankTransfer': 'بینک ٹرانسفر',
    'payment.easypaisa': 'ایزی پیسہ',
    'payment.jazzcash': 'جاز کیش',
    'payment.card': 'کارڈ ادائیگی',
    'payment.amount': 'رقم',
    'payment.transactionId': 'ٹرانزیکشن آئی ڈی',
    
    // Profile
    'profile.firstName': 'پہلا نام',
    'profile.lastName': 'آخری نام',
    'profile.email': 'ای میل',
    'profile.phone': 'فون',
    'profile.company': 'کمپنی',
    'profile.documents': 'دستاویزات',
    'profile.verification': 'تصدیق',
    
    // Languages
    'lang.english': 'English',
    'lang.urdu': 'اردو',
    'lang.pashto': 'پښتو',
    'lang.chinese': '中文',
  },
  ps: {
    // Navigation
    'nav.home': 'کور',
    'nav.findLoads': 'بار ومومئ',
    'nav.postLoad': 'بار پوسټ کړئ',
    'nav.myLoads': 'زما بارونه',
    'nav.myBids': 'زما داوطلبۍ',
    'nav.bookings': 'بکینګونه',
    'nav.routes': 'لارې',
    'nav.payments': 'تادیات',
    'nav.profile': 'پروفایل',
    'nav.settings': 'ترتیبات',
    'nav.signIn': 'ننوتل',
    'nav.signUp': 'نوم لیکنه',
    'nav.signOut': 'وتل',
    
    // Common
    'common.loading': 'لوډ کیږي...',
    'common.save': 'خوندي کړئ',
    'common.cancel': 'لغوه کړئ',
    'common.delete': 'ړنګ کړئ',
    'common.edit': 'سمون',
    'common.submit': 'وسپارئ',
    'common.search': 'لټون',
    'common.filter': 'فلټر',
    'common.sort': 'ترتیب',
    'common.all': 'ټول',
    'common.pending': 'پاتې',
    'common.confirmed': 'تایید شوی',
    'common.completed': 'بشپړ',
    'common.cancelled': 'لغوه شوی',
    'common.yes': 'هو',
    'common.no': 'نه',
    
    // Load posting
    'load.origin': 'اصل ځای',
    'load.destination': 'منزل',
    'load.cargoType': 'د بار ډول',
    'load.weight': 'وزن',
    'load.price': 'قیمت',
    'load.pickupDate': 'د اخیستلو نیټه',
    'load.deliveryDate': 'د سپارلو نیټه',
    'load.description': 'تفصیل',
    'load.postLoad': 'بار پوسټ کړئ',
    'load.urgent': 'عاجل',
    'load.distance': 'واټن',
    'load.vehicle': 'د موټر ډول',
    
    // Bids
    'bid.placeBid': 'داوطلبي ورکړئ',
    'bid.yourBid': 'ستاسو داوطلبي',
    'bid.bidAmount': 'د داوطلبۍ اندازه',
    'bid.message': 'پیغام',
    'bid.accept': 'ومنئ',
    'bid.reject': 'رد کړئ',
    
    // Payments
    'payment.bankTransfer': 'بانک لیږد',
    'payment.easypaisa': 'ایزي پیسه',
    'payment.jazzcash': 'جاز کیش',
    'payment.card': 'کارډ تادیه',
    'payment.amount': 'اندازه',
    'payment.transactionId': 'معاملې ID',
    
    // Profile
    'profile.firstName': 'لومړی نوم',
    'profile.lastName': 'وروستی نوم',
    'profile.email': 'بریښنالیک',
    'profile.phone': 'تلیفون',
    'profile.company': 'شرکت',
    'profile.documents': 'اسناد',
    'profile.verification': 'تصدیق',
    
    // Languages
    'lang.english': 'English',
    'lang.urdu': 'اردو',
    'lang.pashto': 'پښتو',
    'lang.chinese': '中文',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.findLoads': '查找货物',
    'nav.postLoad': '发布货物',
    'nav.myLoads': '我的货物',
    'nav.myBids': '我的投标',
    'nav.bookings': '预订',
    'nav.routes': '路线',
    'nav.payments': '付款',
    'nav.profile': '个人资料',
    'nav.settings': '设置',
    'nav.signIn': '登录',
    'nav.signUp': '注册',
    'nav.signOut': '退出',
    
    // Common
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.submit': '提交',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
    'common.all': '全部',
    'common.pending': '待处理',
    'common.confirmed': '已确认',
    'common.completed': '已完成',
    'common.cancelled': '已取消',
    'common.yes': '是',
    'common.no': '否',
    
    // Load posting
    'load.origin': '起点',
    'load.destination': '终点',
    'load.cargoType': '货物类型',
    'load.weight': '重量',
    'load.price': '价格',
    'load.pickupDate': '取货日期',
    'load.deliveryDate': '送货日期',
    'load.description': '描述',
    'load.postLoad': '发布货物',
    'load.urgent': '紧急',
    'load.distance': '距离',
    'load.vehicle': '车辆类型',
    
    // Bids
    'bid.placeBid': '投标',
    'bid.yourBid': '您的投标',
    'bid.bidAmount': '投标金额',
    'bid.message': '留言',
    'bid.accept': '接受',
    'bid.reject': '拒绝',
    
    // Payments
    'payment.bankTransfer': '银行转账',
    'payment.easypaisa': 'EasyPaisa',
    'payment.jazzcash': 'JazzCash',
    'payment.card': '银行卡支付',
    'payment.amount': '金额',
    'payment.transactionId': '交易编号',
    
    // Profile
    'profile.firstName': '名',
    'profile.lastName': '姓',
    'profile.email': '电子邮件',
    'profile.phone': '电话',
    'profile.company': '公司',
    'profile.documents': '文件',
    'profile.verification': '验证',
    
    // Languages
    'lang.english': 'English',
    'lang.urdu': 'اردو',
    'lang.pashto': 'پښتو',
    'lang.chinese': '中文',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ur' || lang === 'ps' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ur' || language === 'ps' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const dir = language === 'ur' || language === 'ps' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
