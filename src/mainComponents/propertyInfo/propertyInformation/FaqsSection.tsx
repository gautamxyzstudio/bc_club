import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    question: "Why should I buy a home instead of renting?",
    answer:
      "Buying a home helps you build equity over time, while rent payments do not create ownership. Homeownership can also provide long-term financial stability and freedom to personalize your space.",
  },
  {
    question: "What are the financial benefits of owning a home?",
    answer:
      "Homeowners can benefit from fixed mortgage payments, potential tax advantages, property appreciation, and the ability to build equity instead of paying rent.",
  },
  {
    question: "How much money do I need to buy a home?",
    answer:
      "The amount depends on the home's price, down payment requirements, closing costs, and lender qualifications. Many programs offer options with lower down payments.",
  },
  {
    question: "Can buying a home improve my quality of life?",
    answer:
      "Yes, owning a home provides greater privacy, stability, and control over your living environment. You can renovate, decorate, and customize it to fit your needs.",
  },
  {
    question: "When is the right time to buy a home?",
    answer:
      "The best time to buy is when you are financially prepared, have a stable income, and plan to stay in the area for several years to maximize the benefits of homeownership.",
  },
];

const FaqsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <section className="max-w-screen-2xl mx-auto py-12 xl:px-16 md:px-13 px-6 lg:px-8">
      <div className="w-full flex flex-col space-y-8 lg:space-y-13 items-center text-center">
        <Heading
          content="Everything You Need to Know About BC Real Estate Market"
          tagType="h2"
          type={IHeadingTypes.heading48}
          customClasses="md:w-[70%] capitalize"
        />
        <div className="flex flex-col gap-6 max-w-235">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={faq.question}
                className={`bg-white rounded-2xl border border-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] md:p-6 p-4 overflow-hidden transition-all duration-300`}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(isOpen ? -1 : index)}
                  className="w-full flex items-center justify-between gap-5 text-left"
                  aria-expanded={isOpen}
                >
                  <h3
                    className={`lg:font-bold lg:text-xl font-medium text-base leading-snug transition-colors ${isOpen ? "text-secondary" : "text-foreground"
                      }`}
                  >
                    {faq.question}
                  </h3>

                  <span
                    className={`shrink-0 lg:w-8.5 lg:h-8.5 md:w-7.5 md:h-7.5 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${isOpen
                        ? "bg-secondary text-white rotate-180"
                        : "bg-secondary/10 text-secondary -rotate-90"
                      }`}
                  >
                    <FiChevronDown className=" text-2xl" />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-6"
                      : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-black70 md:text-base text-sm text-start">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqsSection;
