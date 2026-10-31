// The three kinds of vehicle sold on AutoDealer. Every listing has `category`
// ('car' | 'motorcycle' | 'lorry'); listings saved before categories existed count as cars.
import { Car, Motorbike, Truck } from 'lucide-react';
import { BODY_TYPES, LORRY_BODY_TYPES, MOTO_BODY_TYPES } from './catalog';

export const VEHICLE_TYPES = {
  car: {
    key: 'car',
    label: 'Car',
    plural: 'Cars',
    noun: 'car',
    nounPlural: 'cars',
    path: '/cars',
    icon: Car,
    tagline: 'Hatchbacks, sedans, SUVs and 7-seaters',
    bodies: BODY_TYPES,
    bodyLabel: 'Body type',
    fuels: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
    transmissions: ['Manual', 'Automatic'],
    priceSteps: [5000000, 10000000, 15000000, 20000000, 30000000, 40000000, 60000000, 80000000, 120000000, 200000000],
    kmSteps: [10000, 25000, 50000, 75000, 100000, 150000],
    defaultPrice: 25000000,
  },
  motorcycle: {
    key: 'motorcycle',
    label: 'Motorcycle',
    plural: 'Motorcycles',
    noun: 'motorcycle',
    nounPlural: 'motorcycles',
    path: '/motorcycles',
    icon: Motorbike,
    tagline: 'Commuters, scooters, sports and cruisers',
    bodies: MOTO_BODY_TYPES,
    bodyLabel: 'Type',
    fuels: ['Petrol', 'Electric'],
    transmissions: ['Manual', 'Automatic'],
    priceSteps: [1500000, 2000000, 3000000, 4000000, 5000000, 7000000, 10000000, 15000000],
    kmSteps: [5000, 10000, 20000, 30000, 50000, 80000],
    defaultPrice: 3000000,
  },
  lorry: {
    key: 'lorry',
    label: 'Lorry',
    plural: 'Lorries',
    noun: 'lorry',
    nounPlural: 'lorries',
    path: '/lorries',
    icon: Truck,
    tagline: 'Light trucks, tippers, tankers and prime movers',
    bodies: LORRY_BODY_TYPES,
    bodyLabel: 'Truck type',
    fuels: ['Diesel', 'CNG', 'Electric'],
    transmissions: ['Manual', 'Automatic'],
    priceSteps: [30000000, 50000000, 70000000, 90000000, 120000000, 150000000, 200000000, 300000000],
    kmSteps: [50000, 100000, 200000, 300000, 500000, 800000],
    defaultPrice: 80000000,
  },
};

export const TYPE_KEYS = ['car', 'motorcycle', 'lorry'];
export const categoryOf = (v) => (v?.category && VEHICLE_TYPES[v.category] ? v.category : 'car');
export const typeOf = (v) => VEHICLE_TYPES[categoryOf(v)];
export const typeFor = (key) => VEHICLE_TYPES[key] || VEHICLE_TYPES.car;

/** Public URL of a listing: /cars/v1001, /motorcycles/v5001 or /lorries/v6001. */
export const vehiclePath = (v) => `${typeOf(v).path}/${v.id}`;
/** "car" / "motorcycle" / "lorry" for copy about one listing. */
export const vehicleNoun = (v) => typeOf(v).noun;

/** Category from a browse URL such as /motorcycles or /lorries/v6001. */
export const categoryFromPath = (pathname = '') => TYPE_KEYS.find((k) => pathname.startsWith(VEHICLE_TYPES[k].path)) || 'car';

const BODY_TITLES = {
  Commuter: 'Commuter motorcycles',
  Scooter: 'Scooters',
  Sport: 'Sports bikes',
  Cruiser: 'Cruisers',
  Adventure: 'Adventure bikes',
  'Off-road': 'Off-road bikes',
};
/** Page title for a body type: "SUVs", "Scooters", "Tippers". */
export const bodyTitle = (body) => BODY_TITLES[body] || `${body}s`;

/** Engine-size bands for motorcycles and payload bands for lorries (extra filters). */
export const CC_BANDS = [
  { value: '0-125', label: 'Up to 125 cc' },
  { value: '126-250', label: '126 – 250 cc' },
  { value: '251-500', label: '251 – 500 cc' },
  { value: '501-9999', label: 'Over 500 cc' },
  { value: 'ev', label: 'Electric' },
];
export const PAYLOAD_STEPS = [1, 3, 5, 10, 15, 20, 25];

/** Toast text for the result of toggleCompare: 'added' | 'removed' | 'full' | 'mixed'. */
export function compareMessage(result, v) {
  const T = typeOf(v);
  if (result === 'mixed') return { text: `Compare works with one vehicle type at a time. Clear your compare list to compare ${T.nounPlural}.`, tone: 'warn' };
  if (result === 'full') return { text: 'Compare holds 3 vehicles. Remove one first.', tone: 'warn' };
  return { text: result === 'added' ? 'Added to compare' : 'Removed from compare', tone: 'info' };
}
