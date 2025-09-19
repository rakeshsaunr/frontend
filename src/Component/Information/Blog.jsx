import { useState } from "react";
import { Link } from "react-router-dom";

// Utility to create a slug from the blog title
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function App() {
  const blogPosts = [
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "WHERE TO BUY KURTAS AND CO-ORD SETS ONLINE?",
      description: "Our kurtas are a go-to option for any occasion, be it a party, casual meet, festive occasion, or a wedding. We have our collection of Kurtas which is curated according to the latest trends in the fashion industry and is available for sale online as well as offline.",
      link: " https://navdana-backend-2.onrender.com/blog/where-to-buy-kurtas-and-co-ord-sets-online"
    },
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "WHY ETHNIC DRESSES FOR LADIES ARE A MUST-HAVE FOR YOUR WARDROBE?",
      description: "Ethnic wear for women has always been a wardrobe staple. From formal events to casual gatherings, you'll find an ethnic wear dress for every occasion. This blog talks about the various ethnic dresses available for women, where to buy them, and how to style them.",
      link: " https://navdana-backend-2.onrender.com/blog/why-ethnic-dresses-for-ladies-are-a-must-have"
    },
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "TOP TRENDING CO-ORD SETS FOR WOMEN YOU SHOULD OWN IN 2023",
      description: "Co-ord sets are the new trend that is catching up among women. These are the latest trending outfits that can be worn for any occasion, from casual to formal. The sets are available in a variety of styles, colors, and fabrics. We will tell you about the trending co-ord sets.",
      link: " https://navdana-backend-2.onrender.com/blog/top-trending-co-ord-sets-for-women-2023"
    },
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "BEST ANARKALI COTTON SUITS TO ADD TO YOUR WARDROBE",
      description: "Anarkali cotton suits are a timeless classic that can be styled for any occasion. From weddings to parties, these suits can be worn to almost every occasion. Anarkali suits have a long, flowing silhouette that flatters every body type. They come in a variety of designs and patterns, so you're sure to find a suit that you love.",
      link: " https://navdana-backend-2.onrender.com/blog/best-anarkali-cotton-suits"
    },
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "CELEBRATE ONAM IN ELEGANCE WITH OUR LATEST KURTA SETS FOR WOMEN",
      description: "Are you looking for the latest kurta sets for women for Onam? We have curated a list of the latest kurta sets for women for Onam. These sets are available in various designs, colors, and fabrics, so you can easily find a set that you love.",
      link: " https://navdana-backend-2.onrender.com/blog/celebrate-onam-in-elegance-with-kurta-sets"
    },
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "WHY ETHNIC DRESSES ARE A PERFECT GIFT FOR ANY DAY PRESENT?",
      description: "A thoughtful gift can make anyone happy. If you're looking for a gift that is both stylish and meaningful, ethnic dresses for women are a great option. Ethnic dresses are a great way to show your loved ones that you care. They are available in a variety of styles, colors, and fabrics.",
      link: " https://navdana-backend-2.onrender.com/blog/why-ethnic-dresses-are-perfect-gift"
    },
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "WHY CO-ORD SETS ARE THE PERFECT GIFT FOR ANY OCCASION?",
      description: "When it comes to gifting, there are many options to choose from. But if you're looking for a gift that is both stylish and versatile, co-ord sets are a great option. Co-ord sets are a great way to show your loved ones that you care. They are available in a variety of styles, colors, and fabrics.",
      link: " https://navdana-backend-2.onrender.com/blog/why-co-ord-sets-are-perfect-gift"
    },
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "UNIQUE RAKHI GIFTS IDEAS TO SURPRISE YOUR SISTER IN 2023",
      description: "Rakhi is a special occasion that celebrates the bond between a brother and sister. This year, surprise your sister with a unique Rakhi gift. We have curated a list of unique Rakhi gifts for your sister. These gifts are available in various designs, colors, and fabrics, so you can easily find a gift that you love.",
      link: " https://navdana-backend-2.onrender.com/blog/unique-rakhi-gift-ideas-2023"
    },
    {
      image: "https://placehold.co/400x500/f0f0f0/666666?text=Image",
      title: "HOW TO CHOOSE THE PERFECT ETHNIC DRESS FOR YOUR BODY SHAPE?",
      description: "Choosing the perfect ethnic dress for your body shape can be a challenge. But with the right tips, you can easily find a dress that flatters your body shape. We have curated a list of tips that will help you choose the perfect ethnic dress for your body shape. These tips are easy to follow and will help you find a dress that you love.",
      link: " https://navdana-backend-2.onrender.com/blog/how-to-choose-perfect-ethnic-dress-for-body-shape"
    },
  ];

  return (
    <div className="bg-gray-50 font-sans antialiased">
      {/* Main Content */}
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">BLOGS</h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Find the latest trends in women's ethnic wear. Get to know about the new styles and how to style them.
          </p>

          {/* Blog Post Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => {
              const slug = slugify(post.title);
              const blogLink = `/blog/${slug}`;
              return (
                <div
                  key={post.title}
                  className="bg-white rounded-lg shadow-md overflow-hidden group block hover:shadow-lg transition-shadow duration-200"
                  style={{ textDecoration: "none" }}
                >
                  <Link
                    to={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Read More button at bottom on hover */}
                      <span
                        className="absolute left-1/2 -translate-x-1/2 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <span className="px-6 py-2 bg-pink-500 text-white rounded-full text-base font-semibold shadow-lg hover:bg-pink-600 transition-colors duration-200">
                          Read More
                        </span>
                      </span>
                    </div>
                  </Link>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      <Link
                        to={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ textDecoration: "none" }}
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">{post.description}</p>
                    <Link
                      to={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:underline text-sm"
                    >
                      Read Full Blog &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12 space-x-2">
            <button className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-colors duration-200">
              &lt;
            </button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-md">1</button>
            <button className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-colors duration-200">2</button>
            <button className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-colors duration-200">3</button>
            <button className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-colors duration-200">
              &gt;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
