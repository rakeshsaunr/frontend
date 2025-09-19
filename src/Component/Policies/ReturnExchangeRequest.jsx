import React, { useState, useEffect } from "react";

const StarIcon = () => (
  <span className="text-[#b48a78] text-2xl">✦</span>
);

const ReturnExchangeRequest = () => {
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
      {/* Decorative divider */}
      <div className="text-center mb-8">
        <div className="inline-block w-[60px] h-[2px] bg-gradient-to-r from-[#b48a78] to-[#8b5a3c] mx-2"></div>
        <StarIcon />
        <div className="inline-block w-[60px] h-[2px] bg-gradient-to-r from-[#8b5a3c] to-[#b48a78] mx-2"></div>
      </div>

      <h1 className="text-center mb-6 text-4xl md:text-5xl font-semibold text-[#2c1810] tracking-widest uppercase">
        Exchange Policy
      </h1>
      <h2 className="text-center font-normal text-xl md:text-2xl text-[#b48a78] mb-8 italic">
        Ensuring product accuracy and a smooth exchange experience
      </h2>

      <section className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold mb-4 text-[#8b5a3c] tracking-wide">
          Product Accuracy and Quality Checks
        </h3>
        <p className="mb-4 text-gray-700">
          At Navdana, we strive to make our product listings as accurate and detailed as possible. Every order goes through multiple quality checks before dispatch to ensure it reaches you in perfect condition.
        </p>
      </section>

      <section className="max-w-3xl mx-auto mt-8">
        <h3 className="text-xl font-semibold mb-3 text-[#b48a78]">Exchange Eligibility</h3>
        <ul className="list-disc list-inside space-y-3 text-gray-700 ml-4">
          <li>
            <span className="font-medium">Domestic Orders Only:</span> Exchanges are available only for orders within India.
          </li>
          <li>
            <span className="font-medium">Condition:</span> Items must be unused, unwashed, and unworn. They should be returned with all original packaging and tags intact.
          </li>
          <li>
            <span className="font-medium">Exclusions:</span> We do not accept exchange requests for colour differences or fabric material variations.
          </li>
        </ul>
      </section>

      <section className="max-w-3xl mx-auto mt-10">
        <h3 className="text-xl font-semibold mb-3 text-[#b48a78]">Exchange Process</h3>
        <ul className="list-disc list-inside space-y-3 text-gray-700 ml-4">
          <li>
            <span className="font-medium">Request Submission:</span> Contact us within <span className="text-[#8b5a3c] font-semibold">24-48 hours</span> of delivery at{" "}
            <a
              href="mailto:contact@navdana.com"
              className="text-[#8b5a3c] underline hover:text-[#b48a78]"
            >
              contact@navdana.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:+919311120477"
              className="text-[#8b5a3c] underline hover:text-[#b48a78]"
            >
              +91-9311120477
            </a>
            . Alternatively, submit your exchange request on our website.
          </li>
          <li>
            <span className="font-medium">Processing Fee:</span> A processing fee of <span className="text-[#8b5a3c] font-semibold">INR 300</span> per product will be charged. Please share the payment screenshot via email.
          </li>
          <li>
            <span className="font-medium">Direct Shipping (Optional):</span> If you prefer to send the product yourself, we will provide the shipping address. After dispatch, share the AWB number, courier company name, and POD with us. Please use a reliable courier service as Navdana will not be responsible for any loss during transit.
          </li>
          <li>
            <span className="font-medium">Reverse Pickup:</span> Once payment is confirmed, our team will arrange a reverse pickup.
          </li>
          <li>
            <span className="font-medium">Quality Inspection and Dispatch:</span> After receiving and inspecting the returned product, we will dispatch the requested size within <span className="text-[#8b5a3c] font-semibold">10-15 working days</span>. Only one exchange per order is allowed. If the requested size is unavailable, a credit note will be issued for the total amount of the item(s), valid for 30 days.
          </li>
        </ul>
      </section>

      {/* Decorative divider */}
      <div className="text-center mt-12">
        <div className="inline-block w-[60px] h-[2px] bg-gradient-to-r from-[#b48a78] to-[#8b5a3c] mx-2"></div>
        <StarIcon />
        <div className="inline-block w-[60px] h-[2px] bg-gradient-to-r from-[#8b5a3c] to-[#b48a78] mx-2"></div>
      </div>
    </div>
  );
};

export default ReturnExchangeRequest;
