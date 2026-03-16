import {
    Utensils, ShoppingBag, Zap, Droplets, Stethoscope, Dumbbell,
    Coffee, Leaf, Apple, Smartphone, Scissors, Pocket, Book, Shirt, Footprints,
    Hammer, Cookie, Wind, Wrench, Gift, Flower2
} from 'lucide-react';

import RESTAURANT_IMG from '../assets/restaurant.png';
import RETAIL_IMG from '../assets/retail.png';
import DOCTOR_IMG from '../assets/doctor.png';
import GYM_IMG from '../assets/gym.png';
import ELECTRICIAN_IMG from '../assets/electrician.png';
import GROCERY_IMG from '../assets/grocery.png';
import BAKERY_IMG from '../assets/bakery.png';
import PHARMACY_IMG from '../assets/pharmacy.png';
import SALON_IMG from '../assets/salon.png';
import MOBILE_IMG from '../assets/mobile_repair.png';
import DAIRY_IMG from '../assets/dairy.png';
import SWEET_IMG from '../assets/sweet_shop.png';
import AUTO_IMG from '../assets/auto_repair.png';
import FLOWER_IMG from '../assets/flower_shop.png';

export const CATEGORY_META = {
    'Kirana / Grocery Store': { icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', emoji: '🛒', image: GROCERY_IMG },
    'Tea Stall (Chai Shop)': { icon: Coffee, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100', emoji: '☕' },
    'Bakery Shop': { icon: Utensils, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100', emoji: '🍰', image: BAKERY_IMG },
    'Medical Store / Pharmacy': { icon: Stethoscope, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', emoji: '💊', image: PHARMACY_IMG },
    'Vegetable Shop': { icon: Leaf, color: 'bg-green-50 text-green-600', border: 'border-green-100', emoji: '🥦' },
    'Fruit Shop': { icon: Apple, color: 'bg-red-50 text-red-600', border: 'border-red-100', emoji: '🍎' },
    'Mobile Repair Shop': { icon: Smartphone, color: 'bg-slate-50 text-slate-600', border: 'border-slate-100', emoji: '📱', image: MOBILE_IMG },
    'Barber Shop / Hair Salon': { icon: Scissors, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', emoji: '✂️', image: SALON_IMG },
    'Tailor Shop': { icon: Pocket, color: 'bg-rose-50 text-rose-600', border: 'border-rose-100', emoji: '🧵' },
    'Stationery Shop': { icon: Book, color: 'bg-sky-50 text-sky-600', border: 'border-sky-100', emoji: '✏️' },
    'Clothing Shop': { icon: Shirt, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100', emoji: '👕' },
    'Footwear Shop': { icon: Footprints, color: 'bg-stone-50 text-stone-600', border: 'border-stone-100', emoji: '👞' },
    'Hardware Shop': { icon: Hammer, color: 'bg-zinc-50 text-zinc-600', border: 'border-zinc-100', emoji: '🔨' },
    'Electronics Repair Shop': { icon: Zap, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100', emoji: '🔌' },
    'Dairy / Milk Shop': { icon: Droplets, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', emoji: '🥛', image: DAIRY_IMG },
    'Sweet Shop (Mithai Shop)': { icon: Cookie, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100', emoji: '🍬', image: SWEET_IMG },
    'Pan Shop': { icon: Wind, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', emoji: '🍃' },
    'Auto Repair / Bike Garage': { icon: Wrench, color: 'bg-slate-50 text-slate-600', border: 'border-slate-100', emoji: '🔧', image: AUTO_IMG },
    'Gift Shop': { icon: Gift, color: 'bg-pink-50 text-pink-600', border: 'border-pink-100', emoji: '🎁' },
    'Flower Shop': { icon: Flower2, color: 'bg-rose-50 text-rose-600', border: 'border-rose-100', emoji: '🌻', image: FLOWER_IMG },
    'Restaurants': { icon: Utensils, color: 'bg-red-50 text-red-600', border: 'border-red-100', emoji: '🍽️', image: RESTAURANT_IMG },
    'Retail': { icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', emoji: '🛍️', image: RETAIL_IMG },
    'Electrician': { icon: Zap, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100', emoji: '⚡', image: ELECTRICIAN_IMG },
    'Doctor': { icon: Stethoscope, color: 'bg-green-50 text-green-600', border: 'border-green-100', emoji: '🏥', image: DOCTOR_IMG },
    'Gym': { icon: Dumbbell, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100', emoji: '💪', image: GYM_IMG }
};
