import React, { useState, useEffect } from "react";

const RefundPolicy = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div
      className={`min-h-screen w-full py-12 px-4 transition-all duration-700 ease-in-out ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        fontFamily: "Georgia, serif",
        background: "linear-gradient(135deg, #faf7f4 0%, #f5f1eb 100%)",
      }}
    >
      <h1 className="text-center mb-6 text-4xl md:text-5xl font-semibold text-[#2c1810] tracking-widest">
        REFUND POLICY
      </h1>
      <div className="text-center text-sm text-gray-500 mb-8">
        <em>Last updated: August 29, 2025</em>
      </div>
      <div className="max-w-3xl mx-auto text-[#2c1810]">
        <ol className="list-decimal ml-7 space-y-7 text-base md:text-lg">
          <li>
            <span className="font-bold text-[#8b5a3c]">No Returns or Refunds</span>
            <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-2">
              <li>
                We do not offer returns or refunds once products are sold and delivered.
              </li>
            </ul>
          </li>
          <li>
            <span className="font-bold text-[#8b5a3c]">Sale Items</span>
            <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-2">
              <li>
                Products marked as &lsquo;Sale&rsquo; are non-returnable.
              </li>
            </ul>
          </li>
        </ol>
        <div className="mt-10 text-center text-lg text-[#8b5a3c] font-medium">
          Thank you for shopping with Navdana. We value your trust in our brand.
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
