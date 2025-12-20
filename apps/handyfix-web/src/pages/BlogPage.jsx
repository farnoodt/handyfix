// src/pages/BlogPage.jsx
import React from "react";

const posts = [
  {
    slug: "paint-colors-small-rooms",
    title: "Choosing the Right Paint Colors for Small Rooms",
    date: "2025-01-05",
    readingTime: "4 min",
    excerpt:
      "Light, neutral colors and the right sheen can make a small room feel larger and more inviting.",
    body: [
      "When you are working with a small bedroom, hallway or bathroom, color choice matters a lot.",
      "Lighter tones like soft whites, pale grays and warm beiges reflect more light and can visually open up the space.",
      "Avoid very dark colors on all four walls—if you like bold shades, use them as an accent wall or in decor instead.",
      "Sheen also matters: eggshell or satin is usually a good balance between washability and hiding wall imperfections.",
    ],
  },
  {
    slug: "materials-for-high-traffic-floors",
    title: "Best Materials for High-Traffic Floors",
    date: "2025-01-10",
    readingTime: "5 min",
    excerpt:
      "Hallways, kitchens and entryways need durable flooring. Here are pros and cons of popular options.",
    body: [
      "High-traffic areas need materials that resist scratches, moisture and daily wear.",
      "Luxury vinyl plank is one of the most popular options today: it's durable, relatively affordable and good with moisture.",
      "Tile is still the king of durability, especially in entryways and mudrooms.",
      "Engineered wood can be a good compromise if you want a real-wood look with more stability than solid hardwood.",
    ],
  },
  {
    slug: "seasonal-home-maintenance-checklist",
    title: "Simple Home Maintenance Checklist for Every Season",
    date: "2025-01-20",
    readingTime: "6 min",
    excerpt:
      "A few small tasks each season can prevent leaks, drafts and expensive repairs.",
    body: [
      "Every season is a good time to check a few basic maintenance tasks.",
      "In fall, clean gutters, check exterior caulking and make sure outdoor faucets are protected.",
      "In winter, test smoke and CO detectors, and look for drafty windows or doors.",
      "In spring, inspect caulking around tubs, sinks and showers, and check for any water stains on ceilings.",
    ],
  },
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          Handy Home Blog
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Articles about colors, materials and small construction projects to
          help you make better decisions and keep your home in great shape.
        </p>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white border border-slate-100 rounded-lg p-5"
            >
              <div className="text-xs text-slate-500 mb-1">
                {post.date} • {post.readingTime} read
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-700 mb-3">{post.excerpt}</p>
              <div className="space-y-2 text-sm text-slate-700">
                {post.body.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
