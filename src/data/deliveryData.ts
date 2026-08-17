export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicleNumber: string;
  assignedDistrict: string;
  status: "Active" | "Inactive";
}

export type DeliveryStatus = "Delivered" | "On the way" | "Delayed";

export interface Delivery {
  id: string;
  orderId: string;
  shopId: string;
  shopName: string;
  product: string;
  quantity: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  phone: string;
  vehicleNumber: string;
  dispatchWarehouse: string;
  deliveryStatus: DeliveryStatus;
  dispatchTime: string;
  deliveryTime: string | null;
  signatureVerified: boolean;
}

export const deliveryPersonnel: DeliveryPerson[] = [
  { id: "dp1", name: "Ramesh Kumar", phone: "9876543210", vehicleNumber: "TN10AB1234", assignedDistrict: "Chennai", status: "Active" },
  { id: "dp2", name: "Suresh Babu", phone: "9876543222", vehicleNumber: "TN09CD5678", assignedDistrict: "Chennai", status: "Active" },
  { id: "dp3", name: "Arun Prakash", phone: "9876543233", vehicleNumber: "TN20EF9012", assignedDistrict: "Madurai", status: "Active" },
  { id: "dp4", name: "Karthik Raj", phone: "9876543244", vehicleNumber: "TN11GH3456", assignedDistrict: "Coimbatore", status: "Active" },
  { id: "dp5", name: "Vijay Anand", phone: "9876543255", vehicleNumber: "TN30IJ7890", assignedDistrict: "Salem", status: "Inactive" },
];

export const deliveries: Delivery[] = [
  {
    id: "DEL-001", orderId: "ORD-1001", shopId: "s1", shopName: "Anna Nagar FPS",
    product: "Rice", quantity: "200 kg", deliveryPersonId: "dp1", deliveryPersonName: "Ramesh Kumar",
    phone: "9876543210", vehicleNumber: "TN10AB1234", dispatchWarehouse: "Central Chennai Warehouse",
    deliveryStatus: "Delivered", dispatchTime: "2026-03-09 06:00", deliveryTime: "2026-03-09 08:12", signatureVerified: true,
  },
  {
    id: "DEL-002", orderId: "ORD-1002", shopId: "s2", shopName: "KK Nagar FPS",
    product: "Sugar", quantity: "50 kg", deliveryPersonId: "dp2", deliveryPersonName: "Suresh Babu",
    phone: "9876543222", vehicleNumber: "TN09CD5678", dispatchWarehouse: "Central Chennai Warehouse",
    deliveryStatus: "On the way", dispatchTime: "2026-03-09 09:00", deliveryTime: null, signatureVerified: false,
  },
  {
    id: "DEL-003", orderId: "ORD-1003", shopId: "s4", shopName: "Madurai Main FPS",
    product: "Cooking Oil", quantity: "80 L", deliveryPersonId: "dp3", deliveryPersonName: "Arun Prakash",
    phone: "9876543233", vehicleNumber: "TN20EF9012", dispatchWarehouse: "Madurai Storage Hub",
    deliveryStatus: "Delivered", dispatchTime: "2026-03-09 07:30", deliveryTime: "2026-03-09 10:30", signatureVerified: true,
  },
  {
    id: "DEL-004", orderId: "ORD-1005", shopId: "s1", shopName: "Anna Nagar FPS",
    product: "Wheat", quantity: "300 kg", deliveryPersonId: "dp1", deliveryPersonName: "Ramesh Kumar",
    phone: "9876543210", vehicleNumber: "TN10AB1234", dispatchWarehouse: "Central Chennai Warehouse",
    deliveryStatus: "On the way", dispatchTime: "2026-03-09 11:00", deliveryTime: null, signatureVerified: false,
  },
  {
    id: "DEL-005", orderId: "ORD-1007", shopId: "s3", shopName: "T Nagar FPS",
    product: "Rice, Sugar", quantity: "250 kg", deliveryPersonId: "dp2", deliveryPersonName: "Suresh Babu",
    phone: "9876543222", vehicleNumber: "TN09CD5678", dispatchWarehouse: "Central Chennai Warehouse",
    deliveryStatus: "Delayed", dispatchTime: "2026-03-09 05:30", deliveryTime: null, signatureVerified: false,
  },
  {
    id: "DEL-006", orderId: "ORD-1008", shopId: "s5", shopName: "Coimbatore Central FPS",
    product: "Wheat, Cooking Oil", quantity: "180 kg", deliveryPersonId: "dp4", deliveryPersonName: "Karthik Raj",
    phone: "9876543244", vehicleNumber: "TN11GH3456", dispatchWarehouse: "Coimbatore Food Depot",
    deliveryStatus: "Delivered", dispatchTime: "2026-03-09 06:45", deliveryTime: "2026-03-09 09:15", signatureVerified: true,
  },
];
