export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string[];
  tags: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "choosing-interior-paint-sheen",
    title: "Choosing the right paint sheen (flat vs eggshell vs satin)",
    date: "2025-12-01",
    excerpt: "A simple guide to selecting sheen based on room type, durability, and lighting.",
    tags: ["painting", "materials"],
    content: [
      "Paint sheen changes how a room looks and how easy it is to clean.",
      "Flat: hides imperfections but scuffs easier — best for ceilings or low-traffic areas.",
      "Eggshell: a great balance for most living spaces — subtle glow, more washable.",
      "Satin: stronger and easier to clean — good for kitchens, baths, kids rooms.",
      "Trim usually looks best in semi-gloss for durability and contrast.",
    ],
  },
  {
    slug: "caulking-bathroom-tips",
    title: "Bathroom caulking tips that prevent mold",
    date: "2025-11-18",
    excerpt: "Clean prep, the right caulk, and a smooth bead make a huge difference.",
    tags: ["bathroom", "maintenance"],
    content: [
      "Remove old caulk fully — new caulk won't stick well on residue.",
      "Dry the area completely before applying.",
      "Use kitchen & bath silicone (or siliconized) where water hits regularly.",
      "Tape edges for crisp lines and tool the bead in one pass.",
      "Let it cure the full time before showering.",
    ],
  },
];
