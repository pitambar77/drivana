// Reference catalogue used by forms, filters and the seed generator.

export const BODY_TYPES = ['Hatchback', 'Sedan', 'SUV', 'MUV'];
export const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
export const TRANSMISSIONS = ['Manual', 'Automatic'];
export const CONDITIONS = ['New', 'Used', 'Certified pre-owned'];
export const OWNERSHIP = ['1st owner', '2nd owner', '3rd owner', '4th owner or more'];

export const CITIES = [
  { name: 'Bhubaneswar', state: 'OD', rto: '02' },
  { name: 'Cuttack', state: 'OD', rto: '05' },
  { name: 'Kolkata', state: 'WB', rto: '02' },
  { name: 'Mumbai', state: 'MH', rto: '02' },
  { name: 'Pune', state: 'MH', rto: '12' },
  { name: 'Delhi', state: 'DL', rto: '03' },
  { name: 'Bengaluru', state: 'KA', rto: '03' },
  { name: 'Hyderabad', state: 'TS', rto: '09' },
  { name: 'Chennai', state: 'TN', rto: '09' },
  { name: 'Ahmedabad', state: 'GJ', rto: '01' },
  { name: 'Jaipur', state: 'RJ', rto: '14' },
];

export const COLORS = [
  { name: 'Polar White', hex: '#EEF0F3' },
  { name: 'Midnight Black', hex: '#1E2228' },
  { name: 'Lava Red', hex: '#A8262E' },
  { name: 'Ocean Blue', hex: '#2C5AA3' },
  { name: 'Silky Silver', hex: '#B7BCC4' },
  { name: 'Titan Grey', hex: '#5C626B' },
  { name: 'Forest Green', hex: '#2E5744' },
  { name: 'Copper Orange', hex: '#BF6A2F' },
  { name: 'Pearl Beige', hex: '#D6CAB4' },
];

// price = approximate new ex-showroom price in INR
export const MODELS = [
  { make: 'Maruti Suzuki', model: 'Swift', body: 'Hatchback', fuels: ['Petrol', 'CNG'], price: 690000, cc: 1197, bhp: 82, seats: 5, variants: ['LXi', 'VXi', 'ZXi', 'ZXi+'], vin: 'MA3' },
  { make: 'Maruti Suzuki', model: 'Baleno', body: 'Hatchback', fuels: ['Petrol', 'CNG'], price: 760000, cc: 1197, bhp: 89, seats: 5, variants: ['Delta', 'Zeta', 'Alpha'], vin: 'MA3' },
  { make: 'Maruti Suzuki', model: 'Brezza', body: 'SUV', fuels: ['Petrol', 'CNG'], price: 1050000, cc: 1462, bhp: 102, seats: 5, variants: ['LXi', 'VXi', 'ZXi', 'ZXi+'], vin: 'MA3' },
  { make: 'Maruti Suzuki', model: 'Ertiga', body: 'MUV', fuels: ['Petrol', 'CNG'], price: 1080000, cc: 1462, bhp: 102, seats: 7, variants: ['VXi', 'ZXi', 'ZXi+'], vin: 'MA3' },
  { make: 'Hyundai', model: 'i20', body: 'Hatchback', fuels: ['Petrol'], price: 830000, cc: 1197, bhp: 82, seats: 5, variants: ['Magna', 'Sportz', 'Asta (O)'], vin: 'MAL' },
  { make: 'Hyundai', model: 'Creta', body: 'SUV', fuels: ['Petrol', 'Diesel'], price: 1450000, cc: 1497, bhp: 113, seats: 5, variants: ['E', 'S', 'SX', 'SX (O)'], vin: 'MAL' },
  { make: 'Hyundai', model: 'Verna', body: 'Sedan', fuels: ['Petrol'], price: 1350000, cc: 1497, bhp: 113, seats: 5, variants: ['S', 'SX', 'SX (O) Turbo'], vin: 'MAL' },
  { make: 'Tata', model: 'Nexon', body: 'SUV', fuels: ['Petrol', 'Diesel', 'Electric'], price: 1100000, cc: 1199, bhp: 118, seats: 5, variants: ['Smart', 'Pure', 'Creative', 'Fearless'], vin: 'MAT' },
  { make: 'Tata', model: 'Punch', body: 'SUV', fuels: ['Petrol', 'CNG', 'Electric'], price: 720000, cc: 1199, bhp: 86, seats: 5, variants: ['Pure', 'Adventure', 'Accomplished', 'Creative'], vin: 'MAT' },
  { make: 'Tata', model: 'Harrier', body: 'SUV', fuels: ['Diesel'], price: 1900000, cc: 1956, bhp: 168, seats: 5, variants: ['Smart', 'Pure', 'Adventure', 'Fearless'], vin: 'MAT' },
  { make: 'Mahindra', model: 'XUV700', body: 'SUV', fuels: ['Petrol', 'Diesel'], price: 1950000, cc: 2184, bhp: 182, seats: 7, variants: ['MX', 'AX3', 'AX5', 'AX7'], vin: 'MA1' },
  { make: 'Mahindra', model: 'Scorpio-N', body: 'SUV', fuels: ['Petrol', 'Diesel'], price: 1750000, cc: 2184, bhp: 172, seats: 7, variants: ['Z2', 'Z4', 'Z6', 'Z8'], vin: 'MA1' },
  { make: 'Mahindra', model: 'Thar', body: 'SUV', fuels: ['Petrol', 'Diesel'], price: 1500000, cc: 2184, bhp: 130, seats: 4, variants: ['AX (O)', 'LX'], vin: 'MA1' },
  { make: 'Honda', model: 'City', body: 'Sedan', fuels: ['Petrol', 'Hybrid'], price: 1400000, cc: 1498, bhp: 119, seats: 5, variants: ['SV', 'V', 'VX', 'ZX'], vin: 'MAK' },
  { make: 'Honda', model: 'Amaze', body: 'Sedan', fuels: ['Petrol'], price: 850000, cc: 1199, bhp: 89, seats: 5, variants: ['E', 'S', 'VX'], vin: 'MAK' },
  { make: 'Toyota', model: 'Innova Crysta', body: 'MUV', fuels: ['Diesel'], price: 2300000, cc: 2393, bhp: 148, seats: 7, variants: ['GX', 'VX', 'ZX'], vin: 'MBJ' },
  { make: 'Toyota', model: 'Fortuner', body: 'SUV', fuels: ['Diesel', 'Petrol'], price: 4000000, cc: 2755, bhp: 201, seats: 7, variants: ['4x2', '4x4', 'Legender'], vin: 'MBJ' },
  { make: 'Toyota', model: 'Glanza', body: 'Hatchback', fuels: ['Petrol', 'CNG'], price: 780000, cc: 1197, bhp: 89, seats: 5, variants: ['E', 'S', 'G', 'V'], vin: 'MBJ' },
  { make: 'Kia', model: 'Seltos', body: 'SUV', fuels: ['Petrol', 'Diesel'], price: 1500000, cc: 1497, bhp: 113, seats: 5, variants: ['HTE', 'HTK+', 'HTX', 'GTX+'], vin: 'MZB' },
  { make: 'Kia', model: 'Sonet', body: 'SUV', fuels: ['Petrol', 'Diesel'], price: 1000000, cc: 1197, bhp: 82, seats: 5, variants: ['HTE', 'HTK', 'HTX', 'GTX+'], vin: 'MZB' },
  { make: 'MG', model: 'Hector', body: 'SUV', fuels: ['Petrol', 'Diesel'], price: 1800000, cc: 1451, bhp: 141, seats: 5, variants: ['Style', 'Shine', 'Smart', 'Sharp Pro'], vin: 'MZ7' },
  { make: 'MG', model: 'ZS EV', body: 'SUV', fuels: ['Electric'], price: 2100000, cc: 0, bhp: 174, seats: 5, variants: ['Executive', 'Excite', 'Exclusive'], vin: 'MZ7' },
  { make: 'Skoda', model: 'Slavia', body: 'Sedan', fuels: ['Petrol'], price: 1400000, cc: 1498, bhp: 148, seats: 5, variants: ['Active', 'Ambition', 'Style'], vin: 'TMB' },
  { make: 'Volkswagen', model: 'Virtus', body: 'Sedan', fuels: ['Petrol'], price: 1450000, cc: 1498, bhp: 148, seats: 5, variants: ['Comfortline', 'Highline', 'Topline', 'GT'], vin: 'WVW' },
  { make: 'BMW', model: '3 Series Gran Limousine', body: 'Sedan', fuels: ['Petrol', 'Diesel'], price: 6200000, cc: 1998, bhp: 255, seats: 5, variants: ['330Li M Sport', '320Ld Luxury'], vin: 'WBA' },
  { make: 'Mercedes-Benz', model: 'C-Class', body: 'Sedan', fuels: ['Petrol', 'Diesel'], price: 6100000, cc: 1496, bhp: 201, seats: 5, variants: ['C 200', 'C 220d', 'C 300'], vin: 'W1K' },
];

export const MAKES = [...new Set(MODELS.map((m) => m.make))];
export const modelsFor = (make) => MODELS.filter((m) => m.make === make).map((m) => m.model);
export const findModel = (make, model) => MODELS.find((m) => m.make === make && m.model === model);

export const CATEGORIES = [
  { key: 'SUV', label: 'SUVs', query: { body: 'SUV' } },
  { key: 'Sedan', label: 'Sedans', query: { body: 'Sedan' } },
  { key: 'Hatchback', label: 'Hatchbacks', query: { body: 'Hatchback' } },
  { key: 'MUV', label: '7-seaters', query: { body: 'MUV' } },
  { key: 'Electric', label: 'Electric', query: { fuel: 'Electric' } },
  { key: 'Luxury', label: 'Luxury', query: { minPrice: 3000000 } },
];
