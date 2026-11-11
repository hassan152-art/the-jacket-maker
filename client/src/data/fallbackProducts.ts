export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  _id?: string;
  name: string;
  slug: string;
  category: string;
  subCategory: string;
  description: string;
  pricePKR: number;
  originalPricePKR?: number;
  priceUSD: number;
  discountPercent?: number;
  leatherType: string;
  hardware: string;
  lining: string;
  rating: number;
  numReviews: number;
  inStock: number;
  featured: boolean;
  bestSeller: boolean;
  isNewArrival: boolean;
  colors: ProductColor[];
  sizes: string[];
  madeToMeasureAvailable: boolean;
  images: string[];
  specs?: Record<string, string>;
}

export const FALLBACK_PRODUCTS: Product[] = [
  {
    name: "Ionic Black Cafe Racer Leather Jacket",
    slug: "ionic-black-cafe-racer-leather-jacket",
    category: "Men",
    subCategory: "Cafe Racer",
    description: "Handcrafted from full-grain sheepskin with a semi-aniline finish. Features a snap-button band collar, zippered cuffs, and precision quilt detailing across the shoulders.",
    pricePKR: 54900,
    originalPricePKR: 68000,
    priceUSD: 195,
    discountPercent: 19,
    leatherType: "Full Grain Sheepskin",
    hardware: "Antiqued Gunmetal YKK Zippers",
    lining: "Quilted Thermal Silk-Satin Blend",
    rating: 4.9,
    numReviews: 142,
    inStock: 25,
    featured: true,
    bestSeller: true,
    isNewArrival: false,
    colors: [
      { name: "Obsidian Black", hex: "#111111" },
      { name: "Vintage Cognac", hex: "#7E4822" },
      { name: "Midnight Navy", hex: "#1A2530" }
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    madeToMeasureAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Inferno Distressed Brown Biker Leather Jacket",
    slug: "inferno-distressed-brown-biker-leather-jacket",
    category: "Men",
    subCategory: "Biker",
    description: "Rugged double rider motorcycle jacket in hand-distressed cowhide. Built for adventure, with asymmetrical zip closure, notch lapels, and adjustable waist buckle belt.",
    pricePKR: 59900,
    originalPricePKR: 74900,
    priceUSD: 215,
    discountPercent: 20,
    leatherType: "Hand-Rubbed Pull-Up Cowhide",
    hardware: "Heavy Antiqued Brass YKK Zips",
    lining: "100% Breathable Tartan Twill Cotton",
    rating: 4.8,
    numReviews: 98,
    inStock: 18,
    featured: true,
    bestSeller: true,
    isNewArrival: false,
    colors: [
      { name: "Distressed Whiskey", hex: "#8A4B25" },
      { name: "Charcoal Smoke", hex: "#2B2B2B" }
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    madeToMeasureAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Aviator B3 Real Merino Shearling Bomber",
    slug: "aviator-b3-real-merino-shearling-bomber",
    category: "Men",
    subCategory: "Shearling",
    description: "The pinnacle of cold-weather luxury. Authentic 22mm thick Spanish Merino shearling wool interior wrapped in a rugged weather-treated sheepskin nappa exterior.",
    pricePKR: 89900,
    originalPricePKR: 110000,
    priceUSD: 320,
    discountPercent: 18,
    leatherType: "100% Genuine Spanish Merino Shearling",
    hardware: "Reinforced Brass Buckles & Heavy Zippers",
    lining: "Natural Un-dyed 22mm Plush Sheep Fur",
    rating: 5.0,
    numReviews: 64,
    inStock: 12,
    featured: true,
    bestSeller: false,
    isNewArrival: true,
    colors: [
      { name: "Dark Walnut / Cream Fur", hex: "#3A241A" },
      { name: "Raw Russet / Ginger Fur", hex: "#6E3E1C" }
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    madeToMeasureAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Lavish Black Women's Quilted Biker Jacket",
    slug: "lavish-black-womens-quilted-biker-jacket",
    category: "Women",
    subCategory: "Biker",
    description: "Tailored to accentuate the silhouette with diamond quilting along the side panels and shoulder yoke. Crafted from supple featherweight lambskin leather.",
    pricePKR: 52900,
    originalPricePKR: 64000,
    priceUSD: 189,
    discountPercent: 17,
    leatherType: "Ultra-Supple Lambskin Nappa",
    hardware: "Polished Silver Chrome YKK Hardware",
    lining: "Silky Crimson Satin Interior",
    rating: 4.9,
    numReviews: 112,
    inStock: 30,
    featured: true,
    bestSeller: true,
    isNewArrival: false,
    colors: [
      { name: "Pitch Black", hex: "#0E0E0E" },
      { name: "Burgundy Wine", hex: "#581825" },
      { name: "Ivory Cream", hex: "#ECE7DE" }
    ],
    sizes: ["2XS", "XS", "S", "M", "L", "XL"],
    madeToMeasureAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Siren Emerald Green Suede Bomber Jacket",
    slug: "siren-emerald-green-suede-bomber-jacket",
    category: "Women",
    subCategory: "Bomber",
    description: "Velvety goat suede with a rich emerald depth. Complete with ribbed elasticated cotton hem and cuffs, brass hardware, and minimalist modern lines.",
    pricePKR: 49900,
    originalPricePKR: 59000,
    priceUSD: 179,
    discountPercent: 15,
    leatherType: "Velvet Nap Goat Suede",
    hardware: "Brushed Antique Brass",
    lining: "Breathable Viscose Satin",
    rating: 4.7,
    numReviews: 45,
    inStock: 15,
    featured: true,
    bestSeller: false,
    isNewArrival: true,
    colors: [
      { name: "Emerald Forest", hex: "#1A382B" },
      { name: "Dusty Rose Suede", hex: "#B88686" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    madeToMeasureAvailable: true,
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Karakoram Rugged Overland Leather Duffel 48L",
    slug: "karakoram-rugged-overland-leather-duffel-48l",
    category: "Bags",
    subCategory: "Duffel",
    description: "A heritage travel bag engineered from thick 2.2mm pull-up harness leather. Features reinforced hand-riveted handles, waterproof base feet, and a heavy brass two-way zipper.",
    pricePKR: 44900,
    originalPricePKR: 55000,
    priceUSD: 160,
    discountPercent: 18,
    leatherType: "Full-Grain Saddle Leather",
    hardware: "Solid Forged Brass Rivets & YKK #10 Zip",
    lining: "Heavyweight 16oz Waxed Canvas",
    rating: 4.9,
    numReviews: 76,
    inStock: 20,
    featured: true,
    bestSeller: true,
    isNewArrival: false,
    colors: [
      { name: "Saddle Tan", hex: "#9B5523" },
      { name: "Espresso Brown", hex: "#2E1A11" }
    ],
    sizes: ["48 Litres (Weekend Carry-On)"],
    madeToMeasureAvailable: false,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Legacy Executive Leather Briefcase & Laptop Messenger",
    slug: "legacy-executive-leather-briefcase-laptop-messenger",
    category: "Bags",
    subCategory: "Briefcase",
    description: "Classic English bridle design with structured gusset compartments. Houses up to a 16-inch laptop with dedicated tablet pocket and card organizer.",
    pricePKR: 38900,
    originalPricePKR: 48000,
    priceUSD: 139,
    discountPercent: 19,
    leatherType: "Vegetable-Tanned Cowhide",
    hardware: "English Tuck-Lock Clasp in Brushed Brass",
    lining: "Pigskin Suede & Cotton Twill",
    rating: 4.8,
    numReviews: 53,
    inStock: 14,
    featured: false,
    bestSeller: false,
    isNewArrival: true,
    colors: [
      { name: "Havana Brown", hex: "#4A2912" },
      { name: "Onyx Black", hex: "#141414" }
    ],
    sizes: ["Fits up to 16-inch Laptop"],
    madeToMeasureAvailable: false,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
    ]
  },
  {
    name: "Artisan Bifold Leather Wallet with RFID Shielding",
    slug: "artisan-bifold-leather-wallet-rfid-shielding",
    category: "Accessories",
    subCategory: "Wallets",
    description: "Slim profile hand-stitched wallet in premium vegetable-tanned leather. Holds 8-10 cards plus full-length cash compartment with aerospace RFID protection.",
    pricePKR: 7900,
    originalPricePKR: 9500,
    priceUSD: 28,
    discountPercent: 16,
    leatherType: "Italian Buttero Veg-Tan Leather",
    hardware: "Hand-burnished Tokonole Edges",
    lining: "Military-grade RFID blocking mesh",
    rating: 4.9,
    numReviews: 210,
    inStock: 80,
    featured: false,
    bestSeller: true,
    isNewArrival: false,
    colors: [
      { name: "Cognac Tan", hex: "#A75D28" },
      { name: "Midnight Black", hex: "#111111" }
    ],
    sizes: ["Standard Bifold"],
    madeToMeasureAvailable: false,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=900&q=80"
    ]
  }
];
