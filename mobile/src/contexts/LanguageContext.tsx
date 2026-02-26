import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

export type Language = 'en' | 'ur' | 'ps' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
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
    'common.approve': 'Approve',
    'common.reject': 'Reject',
    
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
    'load.pinLocation': 'Pin Location',
    'load.selectLocation': 'Select Location on Map',
    
    // Bids
    'bid.placeBid': 'Place Bid',
    'bid.yourBid': 'Your Bid',
    'bid.bidAmount': 'Bid Amount',
    'bid.message': 'Message',
    'bid.accept': 'Accept',
    'bid.reject': 'Reject',
    'bid.pendingApproval': 'Pending Admin Approval',
    
    // Payments
    'payment.bankTransfer': 'Bank Transfer',
    'payment.easypaisa': 'EasyPaisa',
    'payment.jazzcash': 'JazzCash',
    'payment.upaisa': 'UPaisa',
    'payment.sadapay': 'SadaPay',
    'payment.nayapay': 'NayaPay',
    'payment.card': 'Card Payment',
    'payment.amount': 'Amount',
    'payment.transactionId': 'Transaction ID',
    'payment.selectMethod': 'Select Payment Method',
    
    // Profile
    'profile.firstName': 'First Name',
    'profile.lastName': 'Last Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.company': 'Company',
    'profile.documents': 'Documents',
    'profile.verification': 'Verification',
    'profile.nic': 'NIC/CNIC',
    'profile.licence': 'Driving Licence',
    'profile.companyReg': 'Company Registration',
    
    // Routes
    'route.calculator': 'Route Calculator',
    'route.fuelCost': 'Fuel Cost',
    'route.tollTax': 'Toll Tax',
    'route.accommodation': 'Accommodation',
    'route.profitMargin': 'Profit Margin',
    'route.totalPrice': 'Total Price',
    
    // Currency
    'currency.pkr': 'PKR',
    'currency.usd': 'USD',
    'currency.cny': 'CNY',
    
    // Languages
    'lang.english': 'English',
    'lang.urdu': 'اردو',
    'lang.pashto': 'پښتو',
    'lang.chinese': '中文',
    'lang.select': 'Select Language',
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
    'common.approve': 'منظور کریں',
    'common.reject': 'رد کریں',
    
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
    'load.pinLocation': 'پن لوکیشن',
    'load.selectLocation': 'نقشے پر مقام منتخب کریں',
    
    // Bids
    'bid.placeBid': 'بولی لگائیں',
    'bid.yourBid': 'آپ کی بولی',
    'bid.bidAmount': 'بولی کی رقم',
    'bid.message': 'پیغام',
    'bid.accept': 'قبول کریں',
    'bid.reject': 'رد کریں',
    'bid.pendingApproval': 'ایڈمن کی منظوری کا انتظار',
    
    // Payments
    'payment.bankTransfer': 'بینک ٹرانسفر',
    'payment.easypaisa': 'ایزی پیسہ',
    'payment.jazzcash': 'جاز کیش',
    'payment.upaisa': 'یو پیسہ',
    'payment.sadapay': 'سادا پے',
    'payment.nayapay': 'نیا پے',
    'payment.card': 'کارڈ ادائیگی',
    'payment.amount': 'رقم',
    'payment.transactionId': 'ٹرانزیکشن آئی ڈی',
    'payment.selectMethod': 'ادائیگی کا طریقہ منتخب کریں',
    
    // Profile
    'profile.firstName': 'پہلا نام',
    'profile.lastName': 'آخری نام',
    'profile.email': 'ای میل',
    'profile.phone': 'فون',
    'profile.company': 'کمپنی',
    'profile.documents': 'دستاویزات',
    'profile.verification': 'تصدیق',
    'profile.nic': 'شناختی کارڈ',
    'profile.licence': 'ڈرائیونگ لائسنس',
    'profile.companyReg': 'کمپنی رجسٹریشن',
    
    // Routes
    'route.calculator': 'راستہ کیلکولیٹر',
    'route.fuelCost': 'ایندھن کی لاگت',
    'route.tollTax': 'ٹول ٹیکس',
    'route.accommodation': 'رہائش',
    'route.profitMargin': 'منافع کا مارجن',
    'route.totalPrice': 'کل قیمت',
    
    // Currency
    'currency.pkr': 'روپے',
    'currency.usd': 'ڈالر',
    'currency.cny': 'یوآن',
    
    // Languages
    'lang.english': 'English',
    'lang.urdu': 'اردو',
    'lang.pashto': 'پښتو',
    'lang.chinese': '中文',
    'lang.select': 'زبان منتخب کریں',
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
    'common.approve': 'تایید کړئ',
    'common.reject': 'رد کړئ',
    
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
    'load.pinLocation': 'پن ځای',
    'load.selectLocation': 'په نقشه کې ځای وټاکئ',
    
    // Bids
    'bid.placeBid': 'داوطلبي ورکړئ',
    'bid.yourBid': 'ستاسو داوطلبي',
    'bid.bidAmount': 'د داوطلبۍ اندازه',
    'bid.message': 'پیغام',
    'bid.accept': 'ومنئ',
    'bid.reject': 'رد کړئ',
    'bid.pendingApproval': 'د اډمین تایید ته انتظار',
    
    // Payments
    'payment.bankTransfer': 'بانک لیږد',
    'payment.easypaisa': 'ایزي پیسه',
    'payment.jazzcash': 'جاز کیش',
    'payment.upaisa': 'یو پیسه',
    'payment.sadapay': 'سادا پې',
    'payment.nayapay': 'نیا پې',
    'payment.card': 'کارډ تادیه',
    'payment.amount': 'اندازه',
    'payment.transactionId': 'معاملې ID',
    'payment.selectMethod': 'د تادیې طریقه وټاکئ',
    
    // Profile
    'profile.firstName': 'لومړی نوم',
    'profile.lastName': 'وروستی نوم',
    'profile.email': 'بریښنالیک',
    'profile.phone': 'تلیفون',
    'profile.company': 'شرکت',
    'profile.documents': 'اسناد',
    'profile.verification': 'تصدیق',
    'profile.nic': 'پیژندپاڼه',
    'profile.licence': 'چلولو جواز',
    'profile.companyReg': 'د شرکت راجسټریشن',
    
    // Routes
    'route.calculator': 'د لارې حساب کوونکی',
    'route.fuelCost': 'د تیلو لګښت',
    'route.tollTax': 'ټول ټکس',
    'route.accommodation': 'استوګنه',
    'route.profitMargin': 'د ګټې حاشیه',
    'route.totalPrice': 'ټوله قیمت',
    
    // Currency
    'currency.pkr': 'روپۍ',
    'currency.usd': 'ډالر',
    'currency.cny': 'یوان',
    
    // Languages
    'lang.english': 'English',
    'lang.urdu': 'اردو',
    'lang.pashto': 'پښتو',
    'lang.chinese': '中文',
    'lang.select': 'ژبه وټاکئ',
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
    'common.approve': '批准',
    'common.reject': '拒绝',
    
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
    'load.pinLocation': '定位',
    'load.selectLocation': '在地图上选择位置',
    
    // Bids
    'bid.placeBid': '投标',
    'bid.yourBid': '您的投标',
    'bid.bidAmount': '投标金额',
    'bid.message': '留言',
    'bid.accept': '接受',
    'bid.reject': '拒绝',
    'bid.pendingApproval': '等待管理员批准',
    
    // Payments
    'payment.bankTransfer': '银行转账',
    'payment.easypaisa': 'EasyPaisa',
    'payment.jazzcash': 'JazzCash',
    'payment.upaisa': 'UPaisa',
    'payment.sadapay': 'SadaPay',
    'payment.nayapay': 'NayaPay',
    'payment.card': '银行卡支付',
    'payment.amount': '金额',
    'payment.transactionId': '交易编号',
    'payment.selectMethod': '选择支付方式',
    
    // Profile
    'profile.firstName': '名',
    'profile.lastName': '姓',
    'profile.email': '电子邮件',
    'profile.phone': '电话',
    'profile.company': '公司',
    'profile.documents': '文件',
    'profile.verification': '验证',
    'profile.nic': '身份证',
    'profile.licence': '驾驶执照',
    'profile.companyReg': '公司注册',
    
    // Routes
    'route.calculator': '路线计算器',
    'route.fuelCost': '燃油费',
    'route.tollTax': '过路费',
    'route.accommodation': '住宿费',
    'route.profitMargin': '利润率',
    'route.totalPrice': '总价',
    
    // Currency
    'currency.pkr': '卢比',
    'currency.usd': '美元',
    'currency.cny': '人民币',
    
    // Languages
    'lang.english': 'English',
    'lang.urdu': 'اردو',
    'lang.pashto': 'پښتو',
    'lang.chinese': '中文',
    'lang.select': '选择语言',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('language');
      if (saved && (saved === 'en' || saved === 'ur' || saved === 'ps' || saved === 'zh')) {
        setLanguageState(saved as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      // Save to storage first
      await AsyncStorage.setItem('language', lang);
      
      // Update state
      setLanguageState(lang);
      
      // Handle RTL for Urdu and Pashto
      // Note: RTL changes require app restart to fully take effect
      const shouldBeRTL = lang === 'ur' || lang === 'ps';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        // Note: Full RTL change requires app restart
      }
      
      console.log('Language changed to:', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const isRTL = language === 'ur' || language === 'ps';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
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
