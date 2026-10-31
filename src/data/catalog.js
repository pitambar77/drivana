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

// price = approximate new price in Tanzanian shillings (TSh).
// Demo figures converted from Indian ex-showroom prices at TSh 29 per ₹1, rounded to TSh 100,000.
const TZS_PER_INR = 29;
const RAW_MODELS = [
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
export const MODELS = RAW_MODELS.map((m) => ({ ...m, price: Math.round((m.price * TZS_PER_INR) / 100000) * 100000 }));

// ───────────── Motorcycles & scooters (price in ₹, converted like cars)
export const MOTO_BODY_TYPES = ['Commuter', 'Scooter', 'Sport', 'Cruiser', 'Adventure', 'Off-road'];
const RAW_MOTO_MODELS = [
  { make: 'Bajaj', model: 'Boxer 150', body: 'Commuter', fuels: ['Petrol'], price: 78000, cc: 144, bhp: 12, weightKg: 122, kmpl: 60, abs: 'None', variants: ['Standard', 'X'], vin: 'MD2' },
  { make: 'Bajaj', model: 'Pulsar N160', body: 'Sport', fuels: ['Petrol'], price: 132000, cc: 164, bhp: 16, weightKg: 152, kmpl: 45, abs: 'Dual-channel', variants: ['Single disc', 'Dual disc'], vin: 'MD2' },
  { make: 'TVS', model: 'HLX 150', body: 'Commuter', fuels: ['Petrol'], price: 74000, cc: 147, bhp: 10, weightKg: 125, kmpl: 58, abs: 'None', variants: ['Kick start', 'Electric start'], vin: 'MD6' },
  { make: 'TVS', model: 'Apache RTR 160 4V', body: 'Sport', fuels: ['Petrol'], price: 125000, cc: 160, bhp: 17, weightKg: 145, kmpl: 45, abs: 'Single-channel', variants: ['Drum', 'Disc', 'Special Edition'], vin: 'MD6' },
  { make: 'TVS', model: 'Jupiter 125', body: 'Scooter', fuels: ['Petrol'], price: 88000, cc: 124, bhp: 8, weightKg: 108, kmpl: 50, abs: 'None', variants: ['Drum', 'Disc', 'SmartXonnect'], vin: 'MD6' },
  { make: 'Honda', model: 'Activa 6G', body: 'Scooter', fuels: ['Petrol'], price: 80000, cc: 110, bhp: 8, weightKg: 106, kmpl: 50, abs: 'None', variants: ['Standard', 'DLX', 'H-Smart'], vin: 'ME4' },
  { make: 'Honda', model: 'CB Shine 125', body: 'Commuter', fuels: ['Petrol'], price: 84000, cc: 124, bhp: 11, weightKg: 113, kmpl: 55, abs: 'None', variants: ['Drum', 'Disc'], vin: 'ME4' },
  { make: 'Hero', model: 'Splendor Plus', body: 'Commuter', fuels: ['Petrol'], price: 76000, cc: 97, bhp: 8, weightKg: 112, kmpl: 65, abs: 'None', variants: ['Standard', 'Xtec'], vin: 'MBL' },
  { make: 'Yamaha', model: 'FZ-S FI', body: 'Sport', fuels: ['Petrol'], price: 125000, cc: 149, bhp: 12, weightKg: 136, kmpl: 48, abs: 'Single-channel', variants: ['Version 4.0', 'DLX'], vin: 'ME1' },
  { make: 'Royal Enfield', model: 'Classic 350', body: 'Cruiser', fuels: ['Petrol'], price: 215000, cc: 349, bhp: 20, weightKg: 195, kmpl: 35, abs: 'Dual-channel', variants: ['Redditch', 'Halcyon', 'Signals', 'Chrome'], vin: 'ME3' },
  { make: 'Royal Enfield', model: 'Himalayan 450', body: 'Adventure', fuels: ['Petrol'], price: 295000, cc: 452, bhp: 40, weightKg: 196, kmpl: 30, abs: 'Dual-channel', variants: ['Base', 'Pass', 'Summit'], vin: 'ME3' },
  { make: 'KTM', model: '390 Duke', body: 'Sport', fuels: ['Petrol'], price: 310000, cc: 399, bhp: 45, weightKg: 168, kmpl: 28, abs: 'Dual-channel', variants: ['Standard'], vin: 'MD2' },
  { make: 'Kawasaki', model: 'KLX 230', body: 'Off-road', fuels: ['Petrol'], price: 380000, cc: 233, bhp: 19, weightKg: 136, kmpl: 30, abs: 'None', variants: ['Standard', 'S'], vin: 'JKB' },
  { make: 'Ather', model: '450X', body: 'Scooter', fuels: ['Electric'], price: 150000, cc: 0, bhp: 8, weightKg: 111, kmpl: null, rangeKm: 110, abs: 'None', variants: ['2.9 kWh', '3.7 kWh'], vin: 'MF9' },
];

// ───────────── Lorries & trucks (price in ₹, converted like cars)
export const LORRY_BODY_TYPES = ['Light truck', 'Medium truck', 'Heavy truck', 'Tipper', 'Tanker', 'Prime mover'];
const RAW_LORRY_MODELS = [
  { make: 'Tata', model: 'Ultra T.7', body: 'Light truck', fuels: ['Diesel'], price: 1550000, hp: 100, payloadT: 4.9, gvwT: 7.5, axle: '4x2', cabin: 'Day cab', variants: ['14 ft', '17 ft', '19 ft'], vin: 'MAT' },
  { make: 'Tata', model: 'LPT 1618', body: 'Medium truck', fuels: ['Diesel'], price: 2700000, hp: 180, payloadT: 10.5, gvwT: 16.2, axle: '4x2', cabin: 'Day cab', variants: ['20 ft', '24 ft'], vin: 'MAT' },
  { make: 'Tata', model: 'Prima 2830.K', body: 'Tipper', fuels: ['Diesel'], price: 4600000, hp: 300, payloadT: 19, gvwT: 28, axle: '6x4', cabin: 'Day cab', variants: ['Box body 16 cum', 'Rock body 18 cum'], vin: 'MAT' },
  { make: 'Ashok Leyland', model: 'Dost+', body: 'Light truck', fuels: ['Diesel', 'CNG'], price: 900000, hp: 70, payloadT: 1.5, gvwT: 2.9, axle: '4x2', cabin: 'Day cab', variants: ['LS', 'XL'], vin: 'MB1' },
  { make: 'Ashok Leyland', model: 'Ecomet 1615', body: 'Medium truck', fuels: ['Diesel'], price: 2500000, hp: 150, payloadT: 10, gvwT: 16.2, axle: '4x2', cabin: 'Sleeper', variants: ['19 ft', '22 ft', '24 ft'], vin: 'MB1' },
  { make: 'Ashok Leyland', model: '4220 Tractor', body: 'Prime mover', fuels: ['Diesel'], price: 4200000, hp: 220, payloadT: 33, gvwT: 42, axle: '6x4', cabin: 'Sleeper', variants: ['Standard', 'H-Series'], vin: 'MB1' },
  { make: 'Eicher', model: 'Pro 2049', body: 'Light truck', fuels: ['Diesel', 'CNG'], price: 1400000, hp: 100, payloadT: 3.5, gvwT: 4.9, axle: '4x2', cabin: 'Day cab', variants: ['14 ft', '17 ft'], vin: 'MC2' },
  { make: 'Eicher', model: 'Pro 6028 Tanker', body: 'Tanker', fuels: ['Diesel'], price: 3600000, hp: 260, payloadT: 18, gvwT: 28, axle: '6x2', cabin: 'Sleeper', variants: ['18 KL', '22 KL'], vin: 'MC2' },
  { make: 'BharatBenz', model: '2823C', body: 'Tipper', fuels: ['Diesel'], price: 4800000, hp: 230, payloadT: 18, gvwT: 28, axle: '6x4', cabin: 'Day cab', variants: ['Box body', 'Rock body'], vin: 'MEC' },
  { make: 'BharatBenz', model: '3523R', body: 'Heavy truck', fuels: ['Diesel'], price: 4400000, hp: 230, payloadT: 25, gvwT: 35, axle: '8x2', cabin: 'Sleeper', variants: ['32 ft', '35 ft'], vin: 'MEC' },
  { make: 'Isuzu', model: 'FVZ 1400', body: 'Heavy truck', fuels: ['Diesel'], price: 5200000, hp: 300, payloadT: 16, gvwT: 26, axle: '6x4', cabin: 'Day cab', variants: ['Cargo body', 'Chassis cab'], vin: 'JAL' },
  { make: 'Mitsubishi Fuso', model: 'Canter FE85', body: 'Light truck', fuels: ['Diesel'], price: 2100000, hp: 150, payloadT: 4.5, gvwT: 7.5, axle: '4x2', cabin: 'Day cab', variants: ['Dropside', 'Box body'], vin: 'JLF' },
  { make: 'Sinotruk', model: 'HOWO 371 Tipper', body: 'Tipper', fuels: ['Diesel'], price: 4000000, hp: 371, payloadT: 25, gvwT: 33, axle: '6x4', cabin: 'Sleeper', variants: ['16 cum', '20 cum'], vin: 'LZZ' },
  { make: 'Scania', model: 'G410 Prime Mover', body: 'Prime mover', fuels: ['Diesel'], price: 9000000, hp: 410, payloadT: 40, gvwT: 49, axle: '6x4', cabin: 'Sleeper', variants: ['Highline', 'Normal cab'], vin: 'YS2' },
];

const toTzs = (list, category, step) => list.map((m) => ({ ...m, category, price: Math.round((m.price * TZS_PER_INR) / step) * step }));
export const MOTO_MODELS = toTzs(RAW_MOTO_MODELS, 'motorcycle', 10000);
export const LORRY_MODELS = toTzs(RAW_LORRY_MODELS, 'lorry', 500000);
export const ALL_MODELS = [...MODELS.map((m) => ({ ...m, category: 'car' })), ...MOTO_MODELS, ...LORRY_MODELS];

export const MAKES = [...new Set(MODELS.map((m) => m.make))];
/** Brands for one vehicle type (car, motorcycle or lorry). */
export const makesFor = (category = 'car') => [...new Set(ALL_MODELS.filter((m) => m.category === category).map((m) => m.make))];
export const modelsFor = (make, category) => ALL_MODELS.filter((m) => m.make === make && (!category || m.category === category)).map((m) => m.model);
export const findModel = (make, model, category) => ALL_MODELS.find((m) => m.make === make && m.model === model && (!category || m.category === category));

export const CATEGORIES = [
  { key: 'SUV', label: 'SUVs', query: { body: 'SUV' } },
  { key: 'Sedan', label: 'Sedans', query: { body: 'Sedan' } },
  { key: 'Hatchback', label: 'Hatchbacks', query: { body: 'Hatchback' } },
  { key: 'MUV', label: '7-seaters', query: { body: 'MUV' } },
  { key: 'Electric', label: 'Electric', query: { fuel: 'Electric' } },
  { key: 'Luxury', label: 'Luxury', query: { minPrice: 87000000 } },
];
