

"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { FunnelIcon, ChevronDownIcon, MapPinIcon, CalendarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Puja type definition
interface Puja {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  badge?: string;
  shortTitle?: string;
  buttonText: string;
  location?: string;
  date?: string;
  slug?: string;
}

const fallbackPujas: Puja[] = [];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function PujaPage() {
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    Deity: "Deity",
    Tithis: "Tithis",
    Dosha: "Dosha",
    Benefits: "Benefits",
    Location: "Location",
  });

  useEffect(() => {
    const loadPujas = async () => {
      try {
        const response = await fetch("/api/puja");
        if (!response.ok) throw new Error("Failed to fetch pujas");

        const data: Puja[] = await response.json();
        setPujas(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadPujas();
  }, []);

  useEffect(() => {
    if (pujas.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev === pujas.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(intervalId);
  }, [pujas.length]);

  const activeIndex = pujas.length === 0 ? 0 : Math.min(currentIndex, pujas.length - 1);

  const goToPrevious = () => {
    if (pujas.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? pujas.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (pujas.length === 0) return;
    setCurrentIndex((prev) => (prev === pujas.length - 1 ? 0 : prev + 1));
  };

  const filterGroups = [
    {
      label: "Deity",
      options: ["All Deities", "Ganapathi", "Lakshmi", "Shiva", "Vishnu"],
    },
    {
      label: "Tithis",
      options: ["All Tithis", "Ekadashi", "Purnima", "Amavasya", "Pratipada"],
    },
    {
      label: "Dosha",
      options: ["All Doshas", "Mangal Dosha", "Kala Sarpa Dosha", "Pitru Dosha"],
    },
    {
      label: "Benefits",
      options: ["All Benefits", "Prosperity", "Protection", "Peace", "Health"],
    },
    {
      label: "Location",
      options: ["All Locations", "Tamil Nadu", "Karnataka", "Kerala", "Andhra Pradesh"],
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fffdf9] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="mb-8 text-center text-3xl font-bold leading-tight text-[#2c1c4e] md:text-4xl">
            Perform Puja as Per Vedic Rituals at Famous Hindu Temples in India 
          </h1>

          {isLoading ? (
            <p className="text-center text-base text-[#6e5f8f]">Loading pujas...</p>
          ) : pujas.length > 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-[#e3d9f8] shadow-[0_18px_48px_rgba(80,44,150,0.12)]">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {pujas.map((puja) => (
                    <div key={puja._id} className="relative h-105 w-full shrink-0 md:h-125">
                      <img
                        src={puja.imageUrl}
                        alt={puja.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/25 to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-start justify-end gap-4 p-6 md:p-10">
                        <h2 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-4xl">
                          {puja.title}
                        </h2>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-transparent p-3 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition hover:bg-black/30"
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
                  <path d="m12.5 4.5-5 5 5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                onClick={goToNext}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-transparent p-3 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition hover:bg-black/30"
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
                  <path d="m7.5 4.5 5 5-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : null}

          {!isLoading && pujas.length > 0 && (
            <div className="mt-4 flex justify-center gap-2">
              {pujas.map((puja, index) => (
                <button
                  key={puja._id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to puja ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex ? "w-8 bg-[#6d28d9]" : "w-2.5 bg-[#d7cbef]"
                  }`}
                />
              ))}
            </div>
          )}

          <section className="mt-12 text-left">
            <h2 className="text-left text-3xl font-bold leading-tight text-[#2c1c4e] md:text-4xl">
              upcoming pujas-globally
            </h2>
            <p className="mt-3 max-w-4xl text-left text-base leading-7 text-[#6e5f8f] md:text-lg">
              Explore sacred rituals, discover temple offerings, and find the right puja for your spiritual needs.
            </p>
            <p className="mt-2 max-w-4xl text-left text-base leading-7 text-[#6e5f8f] md:text-lg">
              Use the filters below to narrow pujas by deity, tithi, dosha, benefits, and location.
            </p>

            <div className="mt-8 px-0 py-0">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
                <div className="flex items-center gap-3 text-[#1d4ed8] lg:min-w-42.5">
                  <FunnelIcon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Filter</span>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2 xl:grid-cols-5">
                  {filterGroups.map((filter) => {
                    const isOpen = openFilter === filter.label;

                    return (
                      <div key={filter.label} className="relative min-w-0">
                        <button
                          type="button"
                          onClick={() => setOpenFilter(isOpen ? null : filter.label)}
                          className="flex w-full items-center gap-1 text-left text-sm font-medium text-[#1d4ed8]"
                        >
                          <span className="truncate">{selectedFilters[filter.label] ?? filter.label}</span>
                          <ChevronDownIcon className="h-4 w-4 shrink-0 text-[#1d4ed8]" />
                        </button>

                        {isOpen && (
                          <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl bg-white py-2 shadow-[0_16px_30px_rgba(29,78,216,0.12)] ring-1 ring-[#dbe7ff]">
                            {filter.options.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setSelectedFilters((current) => ({
                                    ...current,
                                    [filter.label]: option,
                                  }));
                                  setOpenFilter(null);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-[#1d4ed8] transition hover:bg-[#eff6ff]"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Puja Cards Grid */}
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {pujas.map((puja) => (
                <div key={puja._id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  {/* Image Section */}
                  <div className="relative h-55 w-full overflow-hidden">
                    <img
                      src={puja.imageUrl}
                      alt={puja.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    
                    {/* Badge */}
                    {puja.badge && (
                      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#fcd34d]/90 px-3 py-1 backdrop-blur-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-950">
                          {puja.badge}
                        </span>
                      </div>
                    )}

                    {/* Short Title on Image */}
                    <div className="absolute inset-x-4 bottom-4">
                      <h4 className="mb-2 text-base font-bold leading-tight text-white drop-shadow-md lg:text-lg">
                        {puja.shortTitle || puja.title}
                      </h4>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#d946ef]">
                      {puja.subtitle || "UPCOMING SACRED RITUAL"}
                    </div>
                    
                    <h3 className="mb-3 line-clamp-3 text-lg font-bold leading-snug text-[#2c1c4e] min-h-14">
                      {puja.title}
                    </h3>
                    
                    <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-[#6e5f8f]">
                      {puja.description || "Join us for this sacred ritual to seek divine blessings and spiritual growth."}
                    </p>

                    <div className="mt-auto space-y-3 border-t border-gray-50 pt-4">
                      <div className="flex items-start gap-3">
                        <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <span className="text-xs font-medium text-[#6e5f8f]">
                          {puja.location || "Vedic Ritual Center"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-orange-500" />
                        <span className="text-xs font-medium text-[#6e5f8f]">
                          {puja.date || "Announced Soon"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/puja/${puja.slug || slugify(puja.title)}`}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)] transition-all hover:bg-[#047857] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)] active:scale-[0.98]"
                    >
                      {puja.buttonText || "Participate"}
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
