"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface LanguageContextType {
  language: "en" | "ar"
  toggleLanguage: () => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Login
    welcome: "Welcome to Driver App",
    email: "Email",
    password: "Password",
    login: "Login",
    signingIn: "Signing In...",
    signIn: "Sign In",
    secureAuth: "Secure driver authentication for fleet operations",

    // Navigation & Header
    notifications: "Notifications",
    jobs: "Jobs",
    logout: "Logout",
    jobDetails: "Job Details",

    // Dashboard
    myTrips: "My Trips",
    refresh: "Refresh",

    // Notifications
    newDelivery: "New Delivery Request",
    customer: "Customer",
    product: "Product",
    deliveryLocation: "Delivery Location",
    location: "Location",
    truck: "Truck",
    date: "Date",
    accept: "Accept",
    reject: "Reject",
    processing: "Processing...",
    notificationProcessed: "✓ Notification processed",
    deliveryNotifications: "Delivery notifications",
    noNotificationsYet: "No notifications yet",
    noNotificationsDesc: "You'll see new delivery requests here when they arrive",

    // Jobs & Trips
    allTrips: "All Trips",
    assignmentPending: "Assignment Pending",
    assigned: "Assigned",
    loaded: "Loaded",
    reachedDestination: "Reached Destination",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
    filterByStatus: "Filter by status",
    showing: "Showing",
    of: "of",
    trips: "trips",
    noTripsFound: "No trips found",
    noTripsYet: "You don't have any trips yet",
    noTripsWithStatus: "No trips with status",
    showAllTrips: "Show All Trips",
    tripId: "Trip ID",
    scheduled: "Scheduled",
    rate: "Rate",

    // Job Details
    status: "Status",
    unload: "Unload",
    uploadImages: "Upload Images",
    uploadInvoice: "Upload Invoice",
    waitingCustomer: "Waiting for customer to accept",
    loadButton: "Load",
    selectImages: "Select Images",
    uploadSuccess: "Images uploaded successfully!",
    invoiceUpload: "Upload Invoice Images",
    deliveryComplete: "Delivery Complete",
    loadingComplete: "Loading Complete",
    tripMarkedAsLoaded: "Trip marked as loaded",
    tripMarkedAsReached: "Trip marked as reached destination",
    tripCompleted: "Trip completed",
    imagesSaved: "image(s) saved",
    invoiceImagesSaved: "invoice image(s) saved",

    // Image Upload
    selectLoadingImages: "Select Loading Images",
    selectInvoiceImages: "Select Invoice Images",
    addMoreImages: "Add more images",
    chooseMultipleImages: "Choose Multiple Images",
    addMoreImagesBtn: "Add More Images",
    supportedFormats: "Supported formats: JPG, PNG, GIF (Max 10MB each)",
    selectMultipleFiles: "Select multiple files at once in the file dialog",
    selectedImages: "Selected Images",
    clearAll: "Clear All",
    totalSize: "Total size",
    uploadingImages: "Uploading images...",
    complete: "complete",
    uploadResults: "Upload Results:",
    uploadSuccessful: "Upload successful",
    uploadFailed: "Upload failed",
    cancel: "Cancel",
    upload: "Upload",
    image: "Image",
    images: "Images",
    uploading: "Uploading...",

    // Error Messages
    invalidFileType: "Invalid file type",
    notImageFile: "is not an image file",
    fileTooLarge: "File too large",
    largerThan10MB: "is larger than 10MB",
    authRequired: "Authentication required",
    tripIdRequired: "Trip ID and Driver ID are required for upload",
    uploadError: "An error occurred while uploading images",
    failedToFetch: "Failed to fetch",
    failedToUpdate: "Failed to update trip status",
    failedToRefresh: "Failed to refresh",
    someUploadsFailed: "Some uploads failed",
    failedToUpload: "failed to upload",

    // Success Messages
    success: "Success",
    refreshed: "refreshed successfully",
    notificationsRefreshed: "Notifications refreshed",
    tripsRefreshed: "Trips refreshed successfully",
    tripAccepted: "Trip accepted successfully",
    tripRejected: "Trip rejected successfully",

    // Loading States
    loading: "Loading...",
    loadingNotifications: "Loading notifications...",
    loadingTrips: "Loading trips...",
    loadingTripDetails: "Loading trip details...",

    // General
    error: "Error",
    tryAgain: "Try Again",
    notFound: "not found",
    tripNotFound: "Trip not found",
    driverInfoNotAvailable: "Driver information not available",

    // Permission Denied
    accessDenied: "Access Denied",
    permissionRequired: "Permission Required",
    noPermission: "You don't have permission to access this app.",
    loginAsDriver: "Please login as a driver to continue.",
    currentRole: "Current role",
    logoutTryAgain: "Logout & Try Again",
    contactAdmin: "Contact your administrator if you believe this is an error",
  },
  ar: {
    // Login
    welcome: "مرحباً بك في تطبيق السائق",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    signingIn: "جاري تسجيل الدخول...",
    signIn: "تسجيل الدخول",
    secureAuth: "مصادقة آمنة للسائق لعمليات إدارة الأسطول",

    // Navigation & Header
    notifications: "الإشعارات",
    jobs: "المهام",
    logout: "تسجيل الخروج",
    jobDetails: "تفاصيل المهمة",

    // Dashboard
    myTrips: "رحلاتي",
    refresh: "تحديث",

    // Notifications
    newDelivery: "طلب توصيل جديد",
    customer: "العميل",
    product: "المنتج",
    deliveryLocation: "موقع التسليم",
    location: "الموقع",
    truck: "الشاحنة",
    date: "التاريخ",
    accept: "قبول",
    reject: "رفض",
    processing: "جاري المعالجة...",
    notificationProcessed: "✓ تم معالجة الإشعار",
    deliveryNotifications: "إشعارات التوصيل",
    noNotificationsYet: "لا توجد إشعارات بعد",
    noNotificationsDesc: "ستظهر طلبات التوصيل الجديدة هنا عند وصولها",

    // Jobs & Trips
    allTrips: "جميع الرحلات",
    assignmentPending: "في انتظار التعيين",
    assigned: "مُعين",
    loaded: "محمل",
    reachedDestination: "وصل للوجهة",
    completed: "مكتملة",
    cancelled: "ملغية",
    rejected: "مرفوضة",
    filterByStatus: "تصفية حسب الحالة",
    showing: "عرض",
    of: "من",
    trips: "رحلات",
    noTripsFound: "لم يتم العثور على رحلات",
    noTripsYet: "ليس لديك أي رحلات بعد",
    noTripsWithStatus: "لا توجد رحلات بحالة",
    showAllTrips: "عرض جميع الرحلات",
    tripId: "رقم الرحلة",
    scheduled: "مجدولة",
    rate: "السعر",

    // Job Details
    status: "الحالة",
    unload: "تفريغ",
    uploadImages: "رفع الصور",
    uploadInvoice: "رفع الفاتورة",
    waitingCustomer: "في انتظار موافقة العميل",
    loadButton: "تحميل",
    selectImages: "اختر الصور",
    uploadSuccess: "تم رفع الصور بنجاح!",
    invoiceUpload: "رفع صور الفاتورة",
    deliveryComplete: "اكتمل التسليم",
    loadingComplete: "اكتمل التحميل",
    tripMarkedAsLoaded: "تم تحديد الرحلة كمحملة",
    tripMarkedAsReached: "تم تحديد الرحلة كواصلة للوجهة",
    tripCompleted: "تم إكمال الرحلة",
    imagesSaved: "صورة محفوظة",
    invoiceImagesSaved: "صورة فاتورة محفوظة",

    // Image Upload
    selectLoadingImages: "اختر صور التحميل",
    selectInvoiceImages: "اختر صور الفاتورة",
    addMoreImages: "إضافة المزيد من الصور",
    chooseMultipleImages: "اختر عدة صور",
    addMoreImagesBtn: "إضافة المزيد من الصور",
    supportedFormats: "الصيغ المدعومة: JPG, PNG, GIF (حد أقصى 10 ميجابايت لكل صورة)",
    selectMultipleFiles: "اختر عدة ملفات في مرة واحدة في مربع حوار الملف",
    selectedImages: "الصور المختارة",
    clearAll: "مسح الكل",
    totalSize: "الحجم الإجمالي",
    uploadingImages: "جاري رفع الصور...",
    complete: "مكتمل",
    uploadResults: "نتائج الرفع:",
    uploadSuccessful: "تم الرفع بنجاح",
    uploadFailed: "فشل الرفع",
    cancel: "إلغاء",
    upload: "رفع",
    image: "صورة",
    images: "صور",
    uploading: "جاري الرفع...",

    // Error Messages
    invalidFileType: "نوع ملف غير صالح",
    notImageFile: "ليس ملف صورة",
    fileTooLarge: "الملف كبير جداً",
    largerThan10MB: "أكبر من 10 ميجابايت",
    authRequired: "المصادقة مطلوبة",
    tripIdRequired: "رقم الرحلة ورقم السائق مطلوبان للرفع",
    uploadError: "حدث خطأ أثناء رفع الصور",
    failedToFetch: "فشل في جلب",
    failedToUpdate: "فشل في تحديث حالة الرحلة",
    failedToRefresh: "فشل في التحديث",
    someUploadsFailed: "فشل بعض عمليات الرفع",
    failedToUpload: "فشل في الرفع",

    // Success Messages
    success: "نجح",
    refreshed: "تم التحديث بنجاح",
    notificationsRefreshed: "تم تحديث الإشعارات",
    tripsRefreshed: "تم تحديث الرحلات بنجاح",
    tripAccepted: "تم قبول الرحلة بنجاح",
    tripRejected: "تم رفض الرحلة بنجاح",

    // Loading States
    loading: "جاري التحميل...",
    loadingNotifications: "جاري تحميل الإشعارات...",
    loadingTrips: "جاري تحميل الرحلات...",
    loadingTripDetails: "جاري تحميل تفاصيل الرحلة...",

    // General
    error: "خطأ",
    tryAgain: "حاول مرة أخرى",
    notFound: "غير موجود",
    tripNotFound: "الرحلة غير موجودة",
    driverInfoNotAvailable: "معلومات السائق غير متوفرة",

    // Permission Denied
    accessDenied: "تم رفض الوصول",
    permissionRequired: "إذن مطلوب",
    noPermission: "ليس لديك إذن للوصول إلى هذا التطبيق.",
    loginAsDriver: "يرجى تسجيل الدخول كسائق للمتابعة.",
    currentRole: "الدور الحالي",
    logoutTryAgain: "تسجيل الخروج والمحاولة مرة أخرى",
    contactAdmin: "اتصل بالمسؤول إذا كنت تعتقد أن هذا خطأ",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<"en" | "ar">("en")

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"))
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div className={language === "ar" ? "rtl" : "ltr"} dir={language === "ar" ? "rtl" : "ltr"}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
