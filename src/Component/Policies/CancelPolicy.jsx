import React, { useState, useEffect } from "react";

const CancelPolicy = () => {
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
        CANCELLATION POLICY
      </h1>
      <div className="text-center text-sm text-gray-500 mb-8">
        <em>Last updated: August 29, 2025</em>
      </div>

      <div className="max-w-3xl mx-auto text-[#2c1810]">
        <ol className="list-decimal ml-7 space-y-7 text-base md:text-lg">
          <li>
            <span className="font-bold text-[#8b5a3c]">Customer Cancellations</span>
            <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-2">
              <li>
                <span className="font-semibold">Prepaid and COD Orders:</span> Orders can be cancelled within 24 hours of placement. For prepaid orders, a payment gateway deduction of 2-3% will apply. Customers may choose to receive a credit note or replace the item with another product of equal value.
              </li>
              <li>
                <span className="font-semibold">Request Method:</span> Email us at{" "}
                <a
                  href="mailto:contact@navdana.com"
                  className="text-[#b48a78] underline hover:text-[#8b5a3c]"
                >
                  contact@navdana.com
                </a>{" "}
                or call{" "}
                <a
                  href="tel:+919311120477"
                  className="text-[#b48a78] underline hover:text-[#8b5a3c]"
                >
                  +91-9311120477
                </a>
                .
              </li>
            </ul>
          </li>
          <li>
            <span className="font-bold text-[#8b5a3c]">Navdana Cancellations</span>
            <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-2">
              <li>
                <span className="font-semibold">Reasons:</span> Orders may be cancelled due to unavailability of materials, incorrect listings, or suspected fraudulent activities.
              </li>
              <li>
                <span className="font-semibold">Refunds:</span> For prepaid orders cancelled by us, the full amount will be refunded to the registered bank account. Customers will be notified via email.
              </li>
            </ul>
          </li>
          <li>
            <span className="font-bold text-[#8b5a3c]">Cancellation Charges</span>
            <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-2">
              <li>
                Cancellations after placing prepaid orders will incur a 2-3% deduction (payment gateway fees).
              </li>
            </ul>
          </li>
          <li>
            <span className="font-bold text-[#8b5a3c]">Credit Note Validity</span>
            <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-2">
              <li>
                Credit notes issued for cancellations or exchanges are valid for 30 days.
              </li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Decorative elements */}
      <div className="text-center mt-12">
        <div className="inline-block w-[60px] h-[2px] bg-gradient-to-r from-[#b48a78] to-[#8b5a3c] mx-2"></div>
        <span className="text-[#b48a78] text-2xl">✦</span>
        <div className="inline-block w-[60px] h-[2px] bg-gradient-to-r from-[#8b5a3c] to-[#b48a78] mx-2"></div>
      </div>
    </div>
  );
};

export default CancelPolicy;
