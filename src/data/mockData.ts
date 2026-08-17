// ── National Metrics ──
export const nationalMetrics = [
  { label: "Total Districts", value: "4", change: "+0%", trend: [4,4,4,4,4,4,4] },
  { label: "Total Warehouses", value: "4", change: "+33%", trend: [1,2,2,3,3,4,4] },
  { label: "Fair Price Shops", value: "6", change: "+50%", trend: [2,3,3,4,5,6,6] },
  { label: "Family Ration Cards", value: "1,24,580", change: "+2.4%", trend: [118000,119200,120500,121800,122900,123700,124580] },
  { label: "Total Food Stock (tons)", value: "48,250", change: "-1.2%", trend: [51200,50800,50100,49600,49200,48700,48250] },
  { label: "Orders Today", value: "3,842", change: "+12%", trend: [3100,3250,3400,3500,3600,3750,3842] },
  { label: "Fraud Alerts", value: "17", change: "+6%", trend: [12,14,11,15,13,16,17] },
];

// ── Districts ──
export const districts = [
  { id: "d1", name: "Chennai", state: "Tamil Nadu", shops: 3, warehouses: 1, rationCards: 42500, stockTons: 16800, status: "normal" as const },
  { id: "d2", name: "Madurai", state: "Tamil Nadu", shops: 1, warehouses: 1, rationCards: 31200, stockTons: 12400, status: "low" as const },
  { id: "d3", name: "Coimbatore", state: "Tamil Nadu", shops: 1, warehouses: 1, rationCards: 28900, stockTons: 11200, status: "normal" as const },
  { id: "d4", name: "Salem", state: "Tamil Nadu", shops: 1, warehouses: 1, rationCards: 21980, stockTons: 7850, status: "alert" as const },
];

// ── Warehouses ──
export const warehouses = [
  { id: "w1", name: "Central Chennai Warehouse", district: "Chennai", capacity: 25000, currentStock: 16800, utilization: 67, lastUpdated: "2026-03-09 14:32" },
  { id: "w2", name: "Madurai Storage Hub", district: "Madurai", capacity: 18000, currentStock: 12400, utilization: 69, lastUpdated: "2026-03-09 14:28" },
  { id: "w3", name: "Coimbatore Food Depot", district: "Coimbatore", capacity: 20000, currentStock: 11200, utilization: 56, lastUpdated: "2026-03-09 14:35" },
  { id: "w4", name: "Salem Grain Storage", district: "Salem", capacity: 15000, currentStock: 7850, utilization: 52, lastUpdated: "2026-03-09 14:40" },
];

// ── Shops ──
export const shops = [
  { id: "s1", name: "Anna Nagar FPS", district: "Chennai", dailyOrders: 142, monthlyDist: 4250, inventoryHealth: 88, fraudRisk: 12 },
  { id: "s2", name: "KK Nagar FPS", district: "Chennai", dailyOrders: 118, monthlyDist: 3540, inventoryHealth: 72, fraudRisk: 8 },
  { id: "s3", name: "T Nagar FPS", district: "Chennai", dailyOrders: 105, monthlyDist: 3150, inventoryHealth: 80, fraudRisk: 6 },
  { id: "s4", name: "Madurai Main FPS", district: "Madurai", dailyOrders: 96, monthlyDist: 2880, inventoryHealth: 45, fraudRisk: 35 },
  { id: "s5", name: "Coimbatore Central FPS", district: "Coimbatore", dailyOrders: 134, monthlyDist: 4020, inventoryHealth: 91, fraudRisk: 5 },
  { id: "s6", name: "Salem Market FPS", district: "Salem", dailyOrders: 78, monthlyDist: 2340, inventoryHealth: 55, fraudRisk: 22 },
];

// ── Products / Stock ──
export const products = [
  { name: "Rice", nationalStock: 18500, unit: "tons", price: 3 },
  { name: "Wheat", nationalStock: 12800, unit: "tons", price: 2 },
  { name: "Sugar", nationalStock: 6200, unit: "tons", price: 13.5 },
  { name: "Kerosene", nationalStock: 4800, unit: "kl", price: 15 },
  { name: "Cooking Oil", nationalStock: 3500, unit: "kl", price: 25 },
  { name: "Salt", nationalStock: 2450, unit: "tons", price: 1 },
];

export const stockByDistrict = [
  { district: "Chennai", Rice: 6500, Wheat: 4200, Sugar: 2100, Kerosene: 1800, CookingOil: 1200, Salt: 1000 },
  { district: "Madurai", Rice: 4800, Wheat: 3400, Sugar: 1600, Kerosene: 1200, CookingOil: 900, Salt: 500 },
  { district: "Coimbatore", Rice: 4200, Wheat: 3100, Sugar: 1500, Kerosene: 1000, CookingOil: 800, Salt: 600 },
  { district: "Salem", Rice: 3000, Wheat: 2100, Sugar: 1000, Kerosene: 800, CookingOil: 600, Salt: 350 },
];

export const stockTrend = [
  { month: "Oct", Rice: 19200, Wheat: 13500, Sugar: 6800 },
  { month: "Nov", Rice: 18800, Wheat: 13200, Sugar: 6600 },
  { month: "Dec", Rice: 19500, Wheat: 13800, Sugar: 6900 },
  { month: "Jan", Rice: 19100, Wheat: 13400, Sugar: 6500 },
  { month: "Feb", Rice: 18700, Wheat: 13000, Sugar: 6300 },
  { month: "Mar", Rice: 18500, Wheat: 12800, Sugar: 6200 },
];

// ── Shop Inventory (per shop, per product) ──
export interface ShopInventory {
  shopId: string;
  shopName: string;
  product: string;
  stockQty: number;
  unit: string;
  minThreshold: number;
}

export const shopInventory: ShopInventory[] = [
  { shopId: "s1", shopName: "Anna Nagar FPS", product: "Rice", stockQty: 3000, unit: "kg", minThreshold: 500 },
  { shopId: "s1", shopName: "Anna Nagar FPS", product: "Sugar", stockQty: 500, unit: "kg", minThreshold: 100 },
  { shopId: "s1", shopName: "Anna Nagar FPS", product: "Cooking Oil", stockQty: 200, unit: "L", minThreshold: 50 },
  { shopId: "s1", shopName: "Anna Nagar FPS", product: "Wheat", stockQty: 1800, unit: "kg", minThreshold: 300 },
  { shopId: "s1", shopName: "Anna Nagar FPS", product: "Kerosene", stockQty: 150, unit: "L", minThreshold: 30 },
  { shopId: "s1", shopName: "Anna Nagar FPS", product: "Salt", stockQty: 400, unit: "kg", minThreshold: 80 },

  { shopId: "s2", shopName: "KK Nagar FPS", product: "Rice", stockQty: 2500, unit: "kg", minThreshold: 500 },
  { shopId: "s2", shopName: "KK Nagar FPS", product: "Sugar", stockQty: 450, unit: "kg", minThreshold: 100 },
  { shopId: "s2", shopName: "KK Nagar FPS", product: "Wheat", stockQty: 1500, unit: "kg", minThreshold: 300 },
  { shopId: "s2", shopName: "KK Nagar FPS", product: "Cooking Oil", stockQty: 180, unit: "L", minThreshold: 50 },

  { shopId: "s3", shopName: "T Nagar FPS", product: "Rice", stockQty: 2800, unit: "kg", minThreshold: 500 },
  { shopId: "s3", shopName: "T Nagar FPS", product: "Sugar", stockQty: 420, unit: "kg", minThreshold: 100 },
  { shopId: "s3", shopName: "T Nagar FPS", product: "Wheat", stockQty: 1600, unit: "kg", minThreshold: 300 },

  { shopId: "s4", shopName: "Madurai Main FPS", product: "Rice", stockQty: 3500, unit: "kg", minThreshold: 500 },
  { shopId: "s4", shopName: "Madurai Main FPS", product: "Sugar", stockQty: 600, unit: "kg", minThreshold: 100 },
  { shopId: "s4", shopName: "Madurai Main FPS", product: "Cooking Oil", stockQty: 250, unit: "L", minThreshold: 50 },
  { shopId: "s4", shopName: "Madurai Main FPS", product: "Wheat", stockQty: 2000, unit: "kg", minThreshold: 300 },

  { shopId: "s5", shopName: "Coimbatore Central FPS", product: "Rice", stockQty: 3200, unit: "kg", minThreshold: 500 },
  { shopId: "s5", shopName: "Coimbatore Central FPS", product: "Sugar", stockQty: 550, unit: "kg", minThreshold: 100 },
  { shopId: "s5", shopName: "Coimbatore Central FPS", product: "Wheat", stockQty: 1900, unit: "kg", minThreshold: 300 },

  { shopId: "s6", shopName: "Salem Market FPS", product: "Rice", stockQty: 1200, unit: "kg", minThreshold: 500 },
  { shopId: "s6", shopName: "Salem Market FPS", product: "Sugar", stockQty: 80, unit: "kg", minThreshold: 100 },
  { shopId: "s6", shopName: "Salem Market FPS", product: "Wheat", stockQty: 400, unit: "kg", minThreshold: 300 },
];

// ── Orders ──
export type OrderStatus = "Pending" | "Approved" | "Dispatched" | "Delivered";
export const orders = [
  { id: "ORD-1001", district: "Chennai", shop: "Anna Nagar FPS", items: "Rice", qty: 200, unit: "kg", status: "Delivered" as OrderStatus, timestamp: "2026-03-09 08:12" },
  { id: "ORD-1002", district: "Chennai", shop: "KK Nagar FPS", items: "Sugar", qty: 50, unit: "kg", status: "Pending" as OrderStatus, timestamp: "2026-03-09 09:45" },
  { id: "ORD-1003", district: "Madurai", shop: "Madurai Main FPS", items: "Cooking Oil", qty: 80, unit: "L", status: "Approved" as OrderStatus, timestamp: "2026-03-09 10:30" },
  { id: "ORD-1004", district: "Salem", shop: "Salem Market FPS", items: "Rice", qty: 150, unit: "kg", status: "Pending" as OrderStatus, timestamp: "2026-03-09 11:15" },
  { id: "ORD-1005", district: "Chennai", shop: "Anna Nagar FPS", items: "Wheat", qty: 300, unit: "kg", status: "Dispatched" as OrderStatus, timestamp: "2026-03-09 07:00" },
  { id: "ORD-1006", district: "Madurai", shop: "Madurai Main FPS", items: "Sugar, Salt", qty: 150, unit: "kg", status: "Delivered" as OrderStatus, timestamp: "2026-03-09 12:00" },
  { id: "ORD-1007", district: "Chennai", shop: "T Nagar FPS", items: "Rice, Sugar", qty: 250, unit: "kg", status: "Approved" as OrderStatus, timestamp: "2026-03-09 13:30" },
  { id: "ORD-1008", district: "Coimbatore", shop: "Coimbatore Central FPS", items: "Wheat, Cooking Oil", qty: 180, unit: "kg", status: "Dispatched" as OrderStatus, timestamp: "2026-03-09 14:00" },
];

// ── Fraud Cases ──
export type FraudSeverity = "Critical" | "High" | "Medium" | "Low";
export const fraudCases = [
  { id: "FRD-001", type: "Duplicate Ration Card Usage", district: "Salem", shop: "Salem Market FPS", severity: "Critical" as FraudSeverity, status: "Under Investigation", progress: 65 },
  { id: "FRD-002", type: "Unusual Stock Orders", district: "Madurai", shop: "Madurai Main FPS", severity: "High" as FraudSeverity, status: "Flagged", progress: 30 },
  { id: "FRD-003", type: "Inventory Mismatch", district: "Chennai", shop: "KK Nagar FPS", severity: "Medium" as FraudSeverity, status: "Reviewing", progress: 50 },
  { id: "FRD-004", type: "Suspicious Order Spike", district: "Coimbatore", shop: "Coimbatore Central FPS", severity: "Low" as FraudSeverity, status: "Resolved", progress: 100 },
  { id: "FRD-005", type: "Inventory Mismatch", district: "Salem", shop: "Salem Market FPS", severity: "High" as FraudSeverity, status: "Under Investigation", progress: 40 },
];

// ── Alerts ──
export const alerts = [
  { id: 1, type: "warning" as const, message: "Low stock alert: Salem district wheat reserves below 20%", time: "2 min ago" },
  { id: 2, type: "danger" as const, message: "Fraud detected: Duplicate ration card usage in Salem FPS", time: "8 min ago" },
  { id: 3, type: "info" as const, message: "Warehouse capacity update: Coimbatore Food Depot at 56%", time: "15 min ago" },
  { id: 4, type: "warning" as const, message: "Order spike detected at Madurai Main FPS", time: "22 min ago" },
  { id: 5, type: "success" as const, message: "Distribution completed: 450 tons delivered to Chennai", time: "35 min ago" },
  { id: 6, type: "danger" as const, message: "System alert: Inventory mismatch at KK Nagar FPS", time: "1 hr ago" },
  { id: 7, type: "info" as const, message: "New admin added: District Admin for Coimbatore", time: "2 hr ago" },
];

// ── Activity Logs ──
export const activityLogs = [
  { id: 1, action: "Login", user: "Super Admin", details: "Logged in from 192.168.1.1", timestamp: "2026-03-09 14:30" },
  { id: 2, action: "Order Approved", user: "District Admin (Chennai)", details: "Approved ORD-1007", timestamp: "2026-03-09 14:15" },
  { id: 3, action: "Stock Update", user: "Shop Admin (Anna Nagar)", details: "Updated Rice inventory: 3200 → 3000 kg", timestamp: "2026-03-09 13:50" },
  { id: 4, action: "Admin Created", user: "Super Admin", details: "Created new District Admin for Salem", timestamp: "2026-03-09 13:30" },
  { id: 5, action: "Fraud Flagged", user: "System", details: "Auto-detected duplicate ration card in Salem", timestamp: "2026-03-09 13:12" },
  { id: 6, action: "Login Failed", user: "Unknown", details: "Failed login attempt from 10.0.0.5", timestamp: "2026-03-09 12:45" },
];

// ── Admin accounts for admin management page ──
export const adminAccounts = [
  { id: "a1", name: "Super Admin", email: "superadmin@click2ration.gov", role: "SUPER_ADMIN", district: "All", shop: "-", status: "Active" },
  { id: "a2", name: "Chennai District Admin", email: "chennai.admin@click2ration.gov", role: "DISTRICT_ADMIN", district: "Chennai", shop: "-", status: "Active" },
  { id: "a3", name: "Madurai District Admin", email: "madurai.admin@click2ration.gov", role: "DISTRICT_ADMIN", district: "Madurai", shop: "-", status: "Active" },
  { id: "a4", name: "Anna Nagar FPS Admin", email: "annanagar.fps@click2ration.gov", role: "SHOP_ADMIN", district: "Chennai", shop: "Anna Nagar FPS", status: "Active" },
  { id: "a5", name: "KK Nagar FPS Admin", email: "kknagar.fps@click2ration.gov", role: "SHOP_ADMIN", district: "Chennai", shop: "KK Nagar FPS", status: "Active" },
  { id: "a6", name: "Madurai Main FPS Admin", email: "madurai.fps@click2ration.gov", role: "SHOP_ADMIN", district: "Madurai", shop: "Madurai Main FPS", status: "Active" },
];

// ── Monthly order trends for district charts ──
export const monthlyOrderTrends = [
  { month: "Oct", Chennai: 3200, Madurai: 2100, Coimbatore: 2800, Salem: 1500 },
  { month: "Nov", Chennai: 3400, Madurai: 2250, Coimbatore: 2900, Salem: 1600 },
  { month: "Dec", Chennai: 3600, Madurai: 2400, Coimbatore: 3100, Salem: 1700 },
  { month: "Jan", Chennai: 3500, Madurai: 2350, Coimbatore: 3000, Salem: 1650 },
  { month: "Feb", Chennai: 3700, Madurai: 2500, Coimbatore: 3200, Salem: 1800 },
  { month: "Mar", Chennai: 3842, Madurai: 2600, Coimbatore: 3300, Salem: 1900 },
];
