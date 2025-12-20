export type WorkSample = {
  id: string;
  title: string;
  location?: string;
  notes?: string;
  beforeUrl: string;
  afterUrl: string;
  tags: string[];
};

export const workSamples: WorkSample[] = [
  {
    id: "drywall-001",
    title: "Drywall hole repair + paint blend",
    location: "Living Room",
    notes: "Patched, sanded, primed, color-matched paint for seamless finish.",
    beforeUrl: "https://images.unsplash.com/photo-1582582429410-19d2c07b21a3?auto=format&fit=crop&w=1400&q=70",
    afterUrl: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1400&q=70",
    tags: ["drywall", "painting"],
  },
  {
    id: "paint-002",
    title: "Interior repaint (walls + trim)",
    location: "Bedroom",
    notes: "Repaired nail holes, caulked trim, two coats on walls, semi-gloss on trim.",
    beforeUrl: "https://images.unsplash.com/photo-1560448071-5a2a2a0c4b74?auto=format&fit=crop&w=1400&q=70",
    afterUrl: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70",
    tags: ["painting", "trim"],
  },
  {
    id: "floor-003",
    title: "Vinyl plank flooring install",
    location: "Hallway",
    notes: "Removed old carpet, leveled low spots, installed LVP + transitions.",
    beforeUrl: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1400&q=70",
    afterUrl: "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?auto=format&fit=crop&w=1400&q=70",
    tags: ["flooring", "baseboards"],
  },
];
