// Mock data for the admin panel
export const mockUsers = [
  { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'Admin', status: 'Active', joinDate: '2022-01-15', lastLogin: '2023-06-15 14:30', avatar: 'https://ui-avatars.com/api/?name=John+Smith' },
  { id: 2, name: 'Emma Johnson', email: 'emma.j@example.com', role: 'Manager', status: 'Active', joinDate: '2022-03-22', lastLogin: '2023-06-15 10:15', avatar: 'https://ui-avatars.com/api/?name=Emma+Johnson' },
  { id: 3, name: 'Michael Brown', email: 'm.brown@example.com', role: 'Staff', status: 'Active', joinDate: '2022-05-10', lastLogin: '2023-06-14 16:45', avatar: 'https://ui-avatars.com/api/?name=Michael+Brown' },
  { id: 4, name: 'Sarah Williams', email: 'sarah.w@example.com', role: 'Customer', status: 'Active', joinDate: '2022-07-18', lastLogin: '2023-06-14 09:20', avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams' },
  { id: 5, name: 'Robert Davis', email: 'robert.d@example.com', role: 'Customer', status: 'Inactive', joinDate: '2022-09-05', lastLogin: '2023-06-10 11:30', avatar: 'https://ui-avatars.com/api/?name=Robert+Davis' },
  { id: 6, name: 'Jennifer Miller', email: 'j.miller@example.com', role: 'Manager', status: 'Active', joinDate: '2022-11-30', lastLogin: '2023-06-15 08:45', avatar: 'https://ui-avatars.com/api/?name=Jennifer+Miller' },
  { id: 7, name: 'David Wilson', email: 'david.w@example.com', role: 'Staff', status: 'Active', joinDate: '2023-01-12', lastLogin: '2023-06-15 13:20', avatar: 'https://ui-avatars.com/api/?name=David+Wilson' },
  { id: 8, name: 'Lisa Anderson', email: 'lisa.a@example.com', role: 'Customer', status: 'Active', joinDate: '2023-02-28', lastLogin: '2023-06-13 15:10', avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson' },
];

export const mockServices = [
  { id: 1, name: 'Premium Executive Lounge Access', category: 'Lounge Access', price: 49.99, stock: 150, status: 'In Stock', description: 'Full day access to our premium executive lounges with complimentary refreshments.' },
  { id: 2, name: 'Business Meeting Room', category: 'Meeting Space', price: 149.99, stock: 8, status: 'Limited', description: 'Private meeting room with high-speed WiFi, projector, and catering options.' },
  { id: 3, name: 'Deluxe Spa Treatment', category: 'Wellness', price: 89.99, stock: 25, status: 'In Stock', description: 'Relaxing spa treatment including massage and aromatherapy.' },
  { id: 4, name: 'Gourmet Meal Voucher', category: 'Food & Beverage', price: 34.99, stock: 200, status: 'In Stock', description: 'Redeemable for a gourmet meal at our premium dining area.' },
  { id: 5, name: 'Premium Shower Suite', category: 'Amenities', price: 29.99, stock: 12, status: 'Limited', description: 'Access to private shower suite with luxury toiletries.' },
  { id: 6, name: 'Priority Boarding Pass', category: 'Convenience', price: 19.99, stock: 500, status: 'In Stock', description: 'Skip lines with priority boarding access.' },
  { id: 7, name: 'VIP Concierge Service', category: 'Service', price: 129.99, stock: 5, status: 'Limited', description: 'Personalized concierge service for travel arrangements and reservations.' },
  { id: 8, name: 'Premium Sleep Pod', category: 'Rest', price: 59.99, stock: 10, status: 'Limited', description: 'Private sleep pod with blackout features and charging stations.' },
];

export const mockOrders = [
  { id: 1001, customer: 'John Smith', date: '2023-06-15', amount: 149.99, status: 'Completed', paymentMethod: 'Credit Card', items: [{name: 'Business Meeting Room', quantity: 1}], totalItems: 1 },
  { id: 1002, customer: 'Emma Johnson', date: '2023-06-15', amount: 89.99, status: 'Processing', paymentMethod: 'PayPal', items: [{name: 'Deluxe Spa Treatment', quantity: 1}], totalItems: 1 },
  { id: 1003, customer: 'Michael Brown', date: '2023-06-14', amount: 114.98, status: 'Shipped', paymentMethod: 'Credit Card', items: [{name: 'Premium Executive Lounge Access', quantity: 1}, {name: 'Gourmet Meal Voucher', quantity: 1}], totalItems: 2 },
  { id: 1004, customer: 'Sarah Williams', date: '2023-06-14', amount: 29.99, status: 'Completed', paymentMethod: 'Bank Transfer', items: [{name: 'Premium Shower Suite', quantity: 1}], totalItems: 1 },
  { id: 1005, customer: 'Robert Davis', date: '2023-06-13', amount: 19.99, status: 'Cancelled', paymentMethod: 'Credit Card', items: [{name: 'Priority Boarding Pass', quantity: 1}], totalItems: 1 },
  { id: 1006, customer: 'Jennifer Miller', date: '2023-06-13', amount: 209.97, status: 'Completed', paymentMethod: 'Credit Card', items: [{name: 'VIP Concierge Service', quantity: 1}, {name: 'Premium Sleep Pod', quantity: 1}, {name: 'Gourmet Meal Voucher', quantity: 1}], totalItems: 3 },
  { id: 1007, customer: 'David Wilson', date: '2023-06-12', amount: 179.97, status: 'Pending', paymentMethod: 'PayPal', items: [{name: 'Premium Executive Lounge Access', quantity: 2}, {name: 'Deluxe Spa Treatment', quantity: 1}], totalItems: 3 },
  { id: 1008, customer: 'Lisa Anderson', date: '2023-06-12', amount: 59.99, status: 'Processing', paymentMethod: 'Credit Card', items: [{name: 'Premium Sleep Pod', quantity: 1}], totalItems: 1 },
];

export const mockBookings = [
  { id: 2001, customer: 'John Smith', customerEmail: 'john.smith@example.com', lounge: 'Premium Lounge A', date: '2023-07-15', startTime: '09:00', endTime: '13:00', duration: '4 hours', status: 'Confirmed', notes: 'Early morning access requested', totalAmount: 49.99 },
  { id: 2002, customer: 'Emma Johnson', customerEmail: 'emma.j@example.com', lounge: 'Business Lounge', date: '2023-07-18', startTime: '14:00', endTime: '16:00', duration: '2 hours', status: 'Confirmed', notes: 'Meeting room required', totalAmount: 149.99 },
  { id: 2003, customer: 'Michael Brown', customerEmail: 'm.brown@example.com', lounge: 'VIP Lounge', date: '2023-07-20', startTime: '10:00', endTime: '16:00', duration: '6 hours', status: 'Confirmed', notes: 'Special dietary requirements', totalAmount: 299.94 },
  { id: 2004, customer: 'Sarah Williams', customerEmail: 'sarah.w@example.com', lounge: 'Premium Lounge B', date: '2023-07-22', startTime: '12:00', endTime: '15:00', duration: '3 hours', status: 'Pending', notes: 'Family access for 2 adults and 1 child', totalAmount: 89.99 },
  { id: 2005, customer: 'Robert Davis', customerEmail: 'robert.d@example.com', lounge: 'Executive Suite', date: '2023-07-25', startTime: '08:00', endTime: '14:00', duration: '6 hours', status: 'Confirmed', notes: 'Quiet area preferred', totalAmount: 299.94 },
  { id: 2006, customer: 'Jennifer Miller', customerEmail: 'j.miller@example.com', lounge: 'Presidential Suite', date: '2023-07-28', startTime: '11:00', endTime: '17:00', duration: '6 hours', status: 'Confirmed', notes: 'Special welcome package', totalAmount: 599.94 },
  { id: 2007, customer: 'David Wilson', customerEmail: 'david.w@example.com', lounge: 'Premium Lounge A', date: '2023-07-30', startTime: '15:00', endTime: '18:00', duration: '3 hours', status: 'Cancelled', notes: 'Late arrival expected', totalAmount: 49.99 },
  { id: 2008, customer: 'Lisa Anderson', customerEmail: 'lisa.a@example.com', lounge: 'Wellness Zone', date: '2023-08-02', startTime: '13:00', endTime: '17:00', duration: '4 hours', status: 'Confirmed', notes: 'Spa treatments included', totalAmount: 229.96 },
];

export const mockInvoices = [
  { id: 3001, customer: 'Corporate Client A', date: '2023-06-01', dueDate: '2023-06-15', amount: 2499.92, status: 'Paid', service: 'Annual Lounge Access', reference: 'INV-2023-001' },
  { id: 3002, customer: 'Travel Agency B', date: '2023-06-05', dueDate: '2023-06-19', amount: 899.97, status: 'Paid', service: 'Group Booking Package', reference: 'INV-2023-002' },
  { id: 3003, customer: 'VIP Services Ltd', date: '2023-06-10', dueDate: '2023-06-24', amount: 1499.95, status: 'Pending', service: 'Concierge Service Plan', reference: 'INV-2023-003' },
  { id: 3004, customer: 'Airline Partner C', date: '2023-06-12', dueDate: '2023-06-26', amount: 3299.88, status: 'Pending', service: 'Lounge Partnership', reference: 'INV-2023-004' },
  { id: 3005, customer: 'Hotel Chain D', date: '2023-06-15', dueDate: '2023-06-29', amount: 1899.94, status: 'Overdue', service: 'Premium Amenities', reference: 'INV-2023-005' },
  { id: 3006, customer: 'Event Planner E', date: '2023-06-18', dueDate: '2023-07-02', amount: 549.97, status: 'Paid', service: 'Conference Room Rental', reference: 'INV-2023-006' },
  { id: 3007, customer: 'Cruise Line F', date: '2023-06-20', dueDate: '2023-07-04', amount: 2799.90, status: 'Pending', service: 'VIP Guest Package', reference: 'INV-2023-007' },
  { id: 3008, customer: 'Car Rental G', date: '2023-06-22', dueDate: '2023-07-06', amount: 999.96, status: 'Paid', service: 'Airport Pickup Service', reference: 'INV-2023-008' },
];

export const mockStats = {
  totalUsers: 1242,
  totalBookings: 3241,
  totalRevenue: 24376.50,
  occupancyRate: 78,
  avgBookingValue: 89.42,
  monthlyGrowth: 15,
  newUsers: 124,
  activeBookings: 42
};

