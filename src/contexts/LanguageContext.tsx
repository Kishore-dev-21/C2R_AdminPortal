import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navbar & System
  "system.title": { en: "Click2Ration", ta: "க்ளிக்2ரேஷன்" },
  "system.subtitle": { en: "National PDS Control Center", ta: "தேசிய PDS கட்டுப்பாட்டு மையம்" },
  "system.online": { en: "SYSTEM ONLINE", ta: "அமைப்பு இயங்குகிறது" },

  // Navigation
  "nav.navigation": { en: "Navigation", ta: "வழிசெலுத்தல்" },
  "nav.dashboard": { en: "Dashboard", ta: "டாஷ்போர்டு" },
  "nav.district_monitoring": { en: "District Monitoring", ta: "மாவட்ட கண்காணிப்பு" },
  "nav.warehouse_monitoring": { en: "Warehouse Monitoring", ta: "கிடங்கு கண்காணிப்பு" },
  "nav.shop_monitoring": { en: "Shop Monitoring", ta: "கடை கண்காணிப்பு" },
  "nav.orders": { en: "Orders", ta: "ஆர்டர்கள்" },
  "nav.inventory": { en: "Inventory", ta: "சரக்கு" },
  "nav.fraud_detection": { en: "Fraud Detection", ta: "மோசடி கண்டறிதல்" },
  "nav.fraud_chains": { en: "Fraud Chains", ta: "மோசடி சங்கிலி நுண்ணறிவு" },
  "nav.analytics": { en: "Analytics", ta: "பகுப்பாய்வு" },
  "nav.admin_management": { en: "Admin Management", ta: "நிர்வாக மேலாண்மை" },
  "nav.activity_logs": { en: "Activity Logs", ta: "செயல்பாட்டு பதிவுகள்" },
  "nav.settings": { en: "Settings", ta: "அமைப்புகள்" },
  "nav.delivery_tracking": { en: "Delivery Tracking", ta: "டெலிவரி கண்காணிப்பு" },
  "nav.delivery_management": { en: "Delivery Management", ta: "டெலிவரி மேலாண்மை" },
  "nav.blockchain_audit": { en: "Blockchain Audit", ta: "பிளாக்செயின் தணிக்கை" },
  "nav.blockchain_explorer": { en: "Chain Explorer", ta: "சங்கிலி ஆய்வி" },
  "nav.logout": { en: "Logout", ta: "வெளியேறு" },

  // Login Page
  "login.title": { en: "Click2Ration", ta: "க்ளிக்2ரேஷன்" },
  "login.subtitle": { en: "Public Distribution System", ta: "பொது விநியோக அமைப்பு" },
  "login.platform_title": { en: "National PDS Monitoring Platform", ta: "தேசிய PDS கண்காணிப்பு தளம்" },
  "login.platform_desc": { en: "A centralized government control center for monitoring food distribution, stock management, warehouse operations, and fraud detection across all districts in real time.", ta: "அனைத்து மாவட்டங்களிலும் உணவு விநியோகம், கையிருப்பு மேலாண்மை, கிடங்கு செயல்பாடுகள் மற்றும் மோசடி கண்டறிதலை நிகழ்நேரத்தில் கண்காணிக்கும் மையப்படுத்தப்பட்ட அரசு கட்டுப்பாட்டு மையம்." },
  "login.food_dist": { en: "Food Distribution", ta: "உணவு விநியோகம்" },
  "login.food_dist_desc": { en: "Track rations nationwide", ta: "நாடு முழுவதும் ரேஷன் கண்காணிப்பு" },
  "login.supply_chain": { en: "Supply Chain", ta: "வழங்கல் சங்கிலி" },
  "login.supply_chain_desc": { en: "Monitor warehouse stock", ta: "கிடங்கு கையிருப்பு கண்காணிப்பு" },
  "login.beneficiaries": { en: "Beneficiaries", ta: "பயனாளிகள்" },
  "login.beneficiaries_desc": { en: "1.24L+ ration cards", ta: "1.24L+ ரேஷன் அட்டைகள்" },
  "login.welcome": { en: "Welcome Back", ta: "மீண்டும் வருக" },
  "login.sign_in_desc": { en: "Sign in to access the PDS Control Center", ta: "PDS கட்டுப்பாட்டு மையத்தை அணுக உள்நுழையுங்கள்" },
  "login.email": { en: "Email Address", ta: "மின்னஞ்சல் முகவரி" },
  "login.email_placeholder": { en: "admin@click2ration.gov", ta: "admin@click2ration.gov" },
  "login.password": { en: "Password", ta: "கடவுச்சொல்" },
  "login.password_placeholder": { en: "Enter your password", ta: "கடவுச்சொல்லை உள்ளிடவும்" },
  "login.select_role": { en: "Select Role", ta: "பங்கைத் தேர்ந்தெடுக்கவும்" },
  "login.choose_role": { en: "Choose your role", ta: "உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்" },
  "login.super_admin": { en: "Super Admin", ta: "சூப்பர் நிர்வாகி" },
  "login.district_admin": { en: "District Admin", ta: "மாவட்ட நிர்வாகி" },
  "login.shop_admin": { en: "Shop Admin", ta: "கடை நிர்வாகி" },
  "login.button": { en: "Login to Dashboard", ta: "டாஷ்போர்டில் உள்நுழையவும்" },
  "login.demo_credentials": { en: "Demo Credentials", ta: "டெமோ சான்றுகள்" },
  "login.fill_all": { en: "Please fill in all fields", ta: "அனைத்து புலங்களையும் நிரப்பவும்" },
  "login.failed": { en: "Login failed", ta: "உள்நுழைவு தோல்வி" },

  // Metrics
  "metric.total_districts": { en: "Total Districts", ta: "மொத்த மாவட்டங்கள்" },
  "metric.total_warehouses": { en: "Total Warehouses", ta: "மொத்த கிடங்குகள்" },
  "metric.fair_price_shops": { en: "Fair Price Shops", ta: "நியாய விலை கடைகள்" },
  "metric.family_ration_cards": { en: "Family Ration Cards", ta: "குடும்ப ரேஷன் அட்டைகள்" },
  "metric.total_food_stock": { en: "Total Food Stock (tons)", ta: "மொத்த உணவு கையிருப்பு (டன்)" },
  "metric.orders_today": { en: "Orders Today", ta: "இன்றைய ஆர்டர்கள்" },
  "metric.fraud_alerts": { en: "Fraud Alerts", ta: "மோசடி எச்சரிக்கைகள்" },
  "metric.todays_orders": { en: "Today's Orders", ta: "இன்றைய ஆர்டர்கள்" },
  "metric.products_in_stock": { en: "Products in Stock", ta: "கையிருப்பில் உள்ள பொருட்கள்" },
  "metric.low_stock_alerts": { en: "Low Stock Alerts", ta: "குறைந்த கையிருப்பு எச்சரிக்கைகள்" },
  "metric.monthly_distribution": { en: "Monthly Distribution", ta: "மாதாந்திர விநியோகம்" },

  // Delivery
  "delivery.title": { en: "Delivery Tracking", ta: "டெலிவரி கண்காணிப்பு" },
  "delivery.total_today": { en: "Total Deliveries Today", ta: "இன்றைய மொத்த டெலிவரிகள்" },
  "delivery.pending": { en: "Pending Deliveries", ta: "நிலுவை டெலிவரிகள்" },
  "delivery.completed": { en: "Completed Deliveries", ta: "முடிக்கப்பட்ட டெலிவரிகள்" },
  "delivery.delayed": { en: "Delayed Deliveries", ta: "தாமதமான டெலிவரிகள்" },
  "delivery.order_id": { en: "Order ID", ta: "ஆர்டர் எண்" },
  "delivery.product": { en: "Product", ta: "பொருள்" },
  "delivery.quantity": { en: "Quantity", ta: "அளவு" },
  "delivery.person": { en: "Delivery Person", ta: "டெலிவரி நபர்" },
  "delivery.phone": { en: "Phone", ta: "தொலைபேசி" },
  "delivery.vehicle": { en: "Vehicle", ta: "வாகனம்" },
  "delivery.warehouse": { en: "Dispatch Warehouse", ta: "அனுப்புகிற கிடங்கு" },
  "delivery.status": { en: "Status", ta: "நிலை" },
  "delivery.dispatch_time": { en: "Dispatch Time", ta: "அனுப்பிய நேரம்" },
  "delivery.delivery_time": { en: "Delivery Time", ta: "டெலிவரி நேரம்" },
  "delivery.delivered": { en: "Delivered", ta: "டெலிவரி செய்யப்பட்டது" },
  "delivery.on_the_way": { en: "On the way", ta: "வழியில்" },
  "delivery.delayed_status": { en: "Delayed", ta: "தாமதம்" },
  "delivery.signature_verified": { en: "Signature Verified", ta: "கையொப்பம் சரிபார்க்கப்பட்டது" },
  "delivery.timeline": { en: "Delivery Timeline", ta: "டெலிவரி காலவரிசை" },

  // Delivery Management
  "delivery_mgmt.title": { en: "Delivery Management", ta: "டெலிவரி மேலாண்மை" },
  "delivery_mgmt.assign": { en: "Assign Delivery", ta: "டெலிவரி ஒதுக்கீடு" },
  "delivery_mgmt.select_order": { en: "Select Order", ta: "ஆர்டரைத் தேர்ந்தெடுக்கவும்" },
  "delivery_mgmt.select_agent": { en: "Select Delivery Agent", ta: "டெலிவரி நபரை தேர்ந்தெடுக்கவும்" },
  "delivery_mgmt.vehicle_number": { en: "Vehicle Number", ta: "வாகன எண்" },
  "delivery_mgmt.expected_time": { en: "Expected Delivery Time", ta: "எதிர்பார்க்கப்படும் டெலிவரி நேரம்" },
  "delivery_mgmt.assign_button": { en: "Assign Delivery", ta: "டெலிவரி ஒதுக்கு" },
  "delivery_mgmt.assignments": { en: "Delivery Assignments", ta: "டெலிவரி ஒதுக்கீடுகள்" },
  "delivery_mgmt.assigned_time": { en: "Assigned Time", ta: "ஒதுக்கிய நேரம்" },
  "delivery_mgmt.assigned": { en: "Assigned", ta: "ஒதுக்கப்பட்டது" },
  "delivery_mgmt.total_assignments": { en: "Total Assignments", ta: "மொத்த ஒதுக்கீடுகள்" },
  "delivery_mgmt.pending_assignments": { en: "Pending Assignments", ta: "நிலுவை ஒதுக்கீடுகள்" },
  "delivery_mgmt.completed_assignments": { en: "Completed Assignments", ta: "முடிக்கப்பட்ட ஒதுக்கீடுகள்" },
  "delivery_mgmt.delayed_assignments": { en: "Delayed Assignments", ta: "தாமதமான ஒதுக்கீடுகள்" },
  "delivery_mgmt.contact_driver": { en: "Contact Driver", ta: "ஓட்டுநரைத் தொடர்பு கொள்ளுங்கள்" },

  // Common
  "common.status": { en: "Status", ta: "நிலை" },
  "common.name": { en: "Name", ta: "பெயர்" },
  "common.district": { en: "District", ta: "மாவட்டம்" },
  "common.shop": { en: "Shop", ta: "கடை" },
  "common.stock": { en: "Stock", ta: "கையிருப்பு" },
  "common.unit": { en: "Unit", ta: "அலகு" },
  "common.normal": { en: "Normal", ta: "சாதாரண" },
  "common.low_stock": { en: "Low Stock", ta: "குறைந்த கையிருப்பு" },
  "common.restock_needed": { en: "RESTOCK NEEDED", ta: "மீண்டும் நிரப்ப வேண்டும்" },
  "common.search": { en: "Search", ta: "தேடு" },
  "common.all": { en: "All", ta: "அனைத்தும்" },
  "common.active": { en: "Active", ta: "செயலில்" },
  "common.inactive": { en: "Inactive", ta: "செயலற்றது" },
  "common.no_data": { en: "No data found", ta: "தரவு இல்லை" },

  // Roles
  "role.national": { en: "National Level", ta: "தேசிய நிலை" },
  "role.district": { en: "District Level", ta: "மாவட்ட நிலை" },
  "role.shop": { en: "Shop Level", ta: "கடை நிலை" },

  // Super Admin Dashboard
  "super.title": { en: "National Overview — Super Admin", ta: "தேசிய கண்ணோட்டம் — சூப்பர் நிர்வாகி" },
  "super.subtitle": { en: "Full system access · Last updated:", ta: "முழு அமைப்பு அணுகல் · கடைசியாக புதுப்பிக்கப்பட்டது:" },
  "super.national_stock": { en: "National Stock Distribution", ta: "தேசிய கையிருப்பு விநியோகம்" },
  "super.district_stock": { en: "District Stock Levels (tons)", ta: "மாவட்ட கையிருப்பு நிலைகள் (டன்)" },
  "super.stock_trend": { en: "Stock Trend (6 Months)", ta: "கையிருப்பு போக்கு (6 மாதங்கள்)" },
  "super.district_status": { en: "District Status", ta: "மாவட்ட நிலை" },
  "super.fraud_alerts": { en: "Fraud Alerts", ta: "மோசடி எச்சரிக்கைகள்" },
  "super.recent_activity": { en: "Recent System Activity", ta: "சமீபத்திய அமைப்பு செயல்பாடு" },

  // District Admin Dashboard
  "district.dashboard_title": { en: "District Dashboard", ta: "மாவட்ட டாஷ்போர்டு" },
  "district.access_label": { en: "District-level access", ta: "மாவட்ட நிலை அணுகல்" },
  "district.shops_in_district": { en: "Shops in District", ta: "மாவட்டத்தில் கடைகள்" },
  "district.district_stock": { en: "District Stock (T)", ta: "மாவட்ட கையிருப்பு (T)" },
  "district.orders_today": { en: "Orders Today", ta: "இன்றைய ஆர்டர்கள்" },
  "district.fraud_alerts": { en: "Fraud Alerts", ta: "மோசடி எச்சரிக்கைகள்" },
  "district.product_stock": { en: "District Product Stock (tons)", ta: "மாவட்ட பொருள் கையிருப்பு (டன்)" },
  "district.monthly_trends": { en: "Monthly Order Trends", ta: "மாதாந்திர ஆர்டர் போக்குகள்" },
  "district.shop_performance": { en: "Shop Performance Ranking", ta: "கடை செயல்திறன் தரவரிசை" },
  "district.recent_orders": { en: "Recent District Orders", ta: "சமீபத்திய மாவட்ட ஆர்டர்கள்" },
  "district.warehouse": { en: "District Warehouse", ta: "மாவட்ட கிடங்கு" },

  // Shop Admin Dashboard
  "shop.dashboard_title": { en: "Shop Dashboard", ta: "கடை டாஷ்போர்டு" },
  "shop.access_label": { en: "Shop-level access", ta: "கடை நிலை அணுகல்" },
  "shop.inventory_levels": { en: "Current Inventory Levels", ta: "தற்போதைய சரக்கு நிலைகள்" },
  "shop.product_stock": { en: "Product Stock Levels", ta: "பொருள் கையிருப்பு நிலைகள்" },
  "shop.recent_orders": { en: "Recent Orders", ta: "சமீபத்திய ஆர்டர்கள்" },
  "shop.low_stock_alerts": { en: "Low Stock Alerts", ta: "குறைந்த கையிருப்பு எச்சரிக்கைகள்" },

  // Orders Page
  "orders.title": { en: "Order Management", ta: "ஆர்டர் மேலாண்மை" },
  "orders.subtitle": { en: "Track and manage all PDS orders", ta: "அனைத்து PDS ஆர்டர்களையும் கண்காணிக்கவும் நிர்வகிக்கவும்" },
  "orders.search": { en: "Search orders...", ta: "ஆர்டர்களைத் தேடு..." },
  "orders.order_id": { en: "Order ID", ta: "ஆர்டர் எண்" },
  "orders.items": { en: "Items", ta: "பொருட்கள்" },
  "orders.qty": { en: "Qty", ta: "அளவு" },
  "orders.timestamp": { en: "Timestamp", ta: "நேரமுத்திரை" },
  "orders.pending": { en: "Pending", ta: "நிலுவையில்" },
  "orders.approved": { en: "Approved", ta: "ஒப்புதல்" },
  "orders.dispatched": { en: "Dispatched", ta: "அனுப்பப்பட்டது" },
  "orders.delivered": { en: "Delivered", ta: "டெலிவரி செய்யப்பட்டது" },

  // Inventory Page
  "inventory.title": { en: "Inventory Management", ta: "சரக்கு மேலாண்மை" },
  "inventory.subtitle": { en: "National product stock overview", ta: "தேசிய பொருள் கையிருப்பு கண்ணோட்டம்" },
  "inventory.composition": { en: "Stock Composition", ta: "கையிருப்பு கலவை" },
  "inventory.trend": { en: "Stock Trend", ta: "கையிருப்பு போக்கு" },

  // Fraud Page
  "fraud.title": { en: "Fraud Detection", ta: "மோசடி கண்டறிதல்" },
  "fraud.subtitle": { en: "AI-powered fraud monitoring and investigation", ta: "AI-இயங்கும் மோசடி கண்காணிப்பு மற்றும் விசாரணை" },
  "fraud.total_cases": { en: "Total Cases", ta: "மொத்த வழக்குகள்" },
  "fraud.critical": { en: "Critical", ta: "மிக முக்கியம்" },
  "fraud.under_investigation": { en: "Under Investigation", ta: "விசாரணையில்" },
  "fraud.resolved": { en: "Resolved", ta: "தீர்வு செய்யப்பட்டது" },
  "fraud.cases": { en: "Fraud Cases", ta: "மோசடி வழக்குகள்" },
  "fraud.type": { en: "Type", ta: "வகை" },
  "fraud.severity": { en: "Severity", ta: "தீவிரம்" },
  "fraud.progress": { en: "Progress", ta: "முன்னேற்றம்" },

  // Districts Page
  "districts.title": { en: "District Monitoring", ta: "மாவட்ட கண்காணிப்பு" },
  "districts.subtitle": { en: "Real-time status of all districts", ta: "அனைத்து மாவட்டங்களின் நிகழ்நேர நிலை" },
  "districts.shops": { en: "Shops", ta: "கடைகள்" },
  "districts.warehouses": { en: "Warehouses", ta: "கிடங்குகள்" },
  "districts.ration_cards": { en: "Ration Cards", ta: "ரேஷன் அட்டைகள்" },
  "districts.stock_comparison": { en: "Stock Comparison by District", ta: "மாவட்ட வாரியான கையிருப்பு ஒப்பீடு" },

  // Warehouses Page
  "warehouses.title": { en: "Warehouse Monitoring", ta: "கிடங்கு கண்காணிப்பு" },
  "warehouses.subtitle": { en: "Live warehouse capacity and stock utilization", ta: "நேரடி கிடங்கு திறன் மற்றும் கையிருப்பு பயன்பாடு" },
  "warehouses.utilization": { en: "Utilization", ta: "பயன்பாடு" },
  "warehouses.capacity": { en: "Capacity", ta: "திறன்" },
  "warehouses.current_stock": { en: "Current Stock", ta: "தற்போதைய கையிருப்பு" },
  "warehouses.details": { en: "Warehouse Details", ta: "கிடங்கு விவரங்கள்" },
  "warehouses.last_updated": { en: "Last Updated", ta: "கடைசியாக புதுப்பிக்கப்பட்டது" },

  // Admin Page
  "admin.title": { en: "Admin Management", ta: "நிர்வாக மேலாண்மை" },
  "admin.subtitle": { en: "Manage system administrators and access", ta: "அமைப்பு நிர்வாகிகள் மற்றும் அணுகலை நிர்வகிக்கவும்" },
  "admin.add": { en: "Add Admin", ta: "நிர்வாகி சேர்" },
  "admin.email": { en: "Email", ta: "மின்னஞ்சல்" },
  "admin.role": { en: "Role", ta: "பங்கு" },

  // Logs Page
  "logs.title": { en: "Activity Logs", ta: "செயல்பாட்டு பதிவுகள்" },
  "logs.subtitle": { en: "Chronological system activity and audit trail", ta: "காலவரிசை அமைப்பு செயல்பாடு மற்றும் தணிக்கை தடம்" },
  "logs.action": { en: "Action", ta: "செயல்" },
  "logs.user": { en: "User", ta: "பயனர்" },
  "logs.details": { en: "Details", ta: "விவரங்கள்" },
  "logs.timestamp": { en: "Timestamp", ta: "நேரமுத்திரை" },

  // Settings Page
  "settings.title": { en: "Settings", ta: "அமைப்புகள்" },
  "settings.subtitle": { en: "System configuration and preferences", ta: "அமைப்பு உள்ளமைவு மற்றும் விருப்பங்கள்" },
  "settings.security": { en: "Security", ta: "பாதுகாப்பு" },
  "settings.security_desc": { en: "JWT authentication, rate limiting, input validation enabled", ta: "JWT அங்கீகாரம், வீத வரம்பு, உள்ளீட்டு சரிபார்ப்பு இயக்கப்பட்டது" },
  "settings.notifications": { en: "Notifications", ta: "அறிவிப்புகள்" },
  "settings.notifications_desc": { en: "Real-time alerts for stock, fraud, and system events", ta: "கையிருப்பு, மோசடி மற்றும் அமைப்பு நிகழ்வுகளுக்கான நிகழ்நேர எச்சரிக்கைகள்" },
  "settings.access_control": { en: "Access Control", ta: "அணுகல் கட்டுப்பாடு" },
  "settings.access_control_desc": { en: "RBAC with Super Admin, District Admin, Shop Admin roles", ta: "சூப்பர் நிர்வாகி, மாவட்ட நிர்வாகி, கடை நிர்வாகி பங்குகளுடன் RBAC" },
  "settings.database": { en: "Database", ta: "தரவுத்தளம்" },
  "settings.database_desc": { en: "PostgreSQL with optimized queries and API caching", ta: "உகந்த வினவல்கள் மற்றும் API தற்காலிக சேமிப்புடன் PostgreSQL" },

  // Analytics Page
  "analytics.title": { en: "Analytics", ta: "பகுப்பாய்வு" },
  "analytics.subtitle": { en: "Comprehensive PDS performance analytics", ta: "விரிவான PDS செயல்திறன் பகுப்பாய்வு" },
  "analytics.monthly_stock": { en: "Monthly Stock Trends", ta: "மாதாந்திர கையிருப்பு போக்குகள்" },
  "analytics.district_comparison": { en: "District Comparison", ta: "மாவட்ட ஒப்பீடு" },
  "analytics.shop_radar": { en: "Shop Performance Radar", ta: "கடை செயல்திறன் ரேடார்" },

  // Table headers
  "table.daily_orders": { en: "Daily Orders", ta: "தினசரி ஆர்டர்கள்" },
  "table.monthly_dist": { en: "Monthly Dist.", ta: "மாதாந்திர விநி." },
  "table.inventory_health": { en: "Inventory Health", ta: "சரக்கு நலம்" },
  "table.fraud_risk": { en: "Fraud Risk", ta: "மோசடி ஆபத்து" },
  "table.min_threshold": { en: "Min Threshold", ta: "குறைந்தபட்ச வரம்பு" },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("pds_lang") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("pds_lang", language);
  }, [language]);

  const toggleLanguage = () => setLanguage((l) => (l === "en" ? "ta" : "en"));

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
