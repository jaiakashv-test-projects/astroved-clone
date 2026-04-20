"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { CalendarIcon, ClockIcon, MapPinIcon, StarIcon, XMarkIcon, CheckIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

type PujaPackage = {
  id: string;
  name: string;
  price: number;
  description: string;
};

type PujaOffering = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
};

type PujaStat = {
  label: string;
  value: string;
  detail?: string;
};

type PujaSection = {
  title: string;
  description: string;
};

type PujaFaq = {
  question: string;
  answer: string;
};

type PujaDetails = {
  heroTitle: string;
  heroSubtitle: string;
  strengthFor: string;
  ritualSummary: string;
  templeName: string;
  templeLocation: string;
  templeNote?: string;
  about: string;
  stats: PujaStat[];
  benefits: PujaSection[];
  process: PujaSection[];
  inclusions: string[];
  faq: PujaFaq[];
};

type Puja = {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  badge?: string;
  shortTitle?: string;
  location?: string;
  date?: string;
  eventDateTime?: string;
  slug: string;
  details: PujaDetails;
  packages: PujaPackage[];
  offerings: PujaOffering[];
};

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

const defaultCountdown: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: false,
};

const parseEventDate = (value?: string) => {
  if (!value) return null;
  
  // Try DD-MM-YYYY format
  const ddmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value.trim());
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const normalized = value.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildCountdown = (target: Date): Countdown => {
  const now = Date.now();
  const diff = target.getTime() - now;

  if (diff <= 0) {
    return { ...defaultCountdown, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
};

export default function PujaDetailPage() {
  const params = useParams<{ slug: string }>();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const [puja, setPuja] = useState<Puja | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", whatsapp: "" });
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<Countdown>(defaultCountdown);

  const toggleExtra = (id: string) => {
    setSelectedExtraIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const extrasTotal = (puja?.offerings || [])
    .filter(o => selectedExtraIds.includes(o.id))
    .reduce((sum, o) => sum + o.price, 0);

  const selectedPackage = puja?.packages?.find((pkg) => pkg.id === selectedPackageId) ?? puja?.packages?.[0] ?? null;
  const highPrice = selectedPackage ? Math.round(selectedPackage.price * 1.2) : null;
  const totalAmount = (selectedPackage?.price || 0) + extrasTotal;

  const sectionTabs = [
    { id: "about", label: "About Puja" },
    { id: "benefits", label: "Benefits" },
    { id: "process", label: "Process" },
    { id: "temple", label: "Temple Details" },
    { id: "packages", label: "Packages" },
    { id: "reviews", label: "Reviews" },
    { id: "faqs", label: "FAQs" },
  ];

  const reviews = [
    {
      name: "Achutan Nair",
      place: "Bangalore",
      text: "Puja was conducted with proper rites and clear updates. This platform felt very genuine.",
    },
    {
      name: "Saura",
      place: "London, United Kingdom",
      text: "Great service. Easy booking and timely reminders. Felt connected throughout the ritual.",
    },
    {
      name: "Amitra",
      place: "Texas, United States",
      text: "Clear communication and authentic process. Strongly recommend for temple puja booking.",
    },
    {
      name: "Alisha",
      place: "Ontario, Canada",
      text: "Booked with trust, received puja completion updates and video as promised.",
    },
  ];

  const userReviews = [
    {
      name: "Macnish Vinay Vijay Narayan",
      date: "21 November, 2024",
      comment:
        "A blessing to connect with our mother land and temples. Safe to use and very trustworthy.",
    },
    {
      name: "Tejinder Dhillon",
      date: "19 November, 2024",
      comment:
        "Very authentic and transparent process. I feel present there while the puja is being performed.",
    },
    {
      name: "Sambit Tarafdar",
      date: "17 November, 2024",
      comment:
        "Very well conducted and satisfactory. Would like to offer prayer again in future.",
    },
  ];

  const aboutParagraphs = [
    "Become part of this sacred anushthan and invoke divine prosperity, abundance, and lasting wellbeing for your family.",
    "This rare puja includes mantra chanting, havan, and purnahuti done in your name by experienced temple priests.",
    "When performed with devotion and sankalp, this ritual helps remove financial blocks and opens the path for growth.",
  ];

  useEffect(() => {
    const loadPuja = async () => {
      try {
        if (!slug) {
          setPuja(null);
          return;
        }

        const res = await fetch(`/api/puja?slug=${slug}`);
        if (!res.ok) {
          setPuja(null);
          return;
        }

        const data: Puja = await res.json();
        setPuja(data);
        setSelectedPackageId(data.packages?.[0]?.id ?? null);
      } catch {
        setPuja(null);
      } finally {
        setLoading(false);
      }
    };

    loadPuja();
  }, [slug]);

  useEffect(() => {
    if (!puja) {
      setCountdown(defaultCountdown);
      return;
    }

    const target = parseEventDate(puja.eventDateTime) || parseEventDate(puja.date);
    if (!target) {
      setCountdown(defaultCountdown);
      return;
    }

    setCountdown(buildCountdown(target));
    const timer = setInterval(() => {
      setCountdown(buildCountdown(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [puja]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8f7f4] pb-12">
        {loading ? (
          <div className="mx-auto max-w-6xl px-6 py-20 text-center text-[#6e5f8f]">Loading puja details...</div>
        ) : !puja ? (
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h1 className="text-3xl font-bold text-[#2c1c4e]">Puja not found</h1>
            <Link href="/puja" className="mt-6 inline-block rounded-xl bg-[#059669] px-6 py-3 text-sm font-semibold text-white">
              Back to Pujas
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#8c7b5a]">
              <Link href="/" className="hover:text-[#e47f1d]">Home</Link>
              <span>&gt;</span>
              <Link href="/puja" className="hover:text-[#e47f1d]">Sri Mandir Puja Seva</Link>
              <span>&gt;</span>
              <span className="font-medium text-[#3f3524]">{puja.title}</span>
            </div>

            <section className="overflow-hidden rounded-xl border border-[#e7dfd2] bg-white">
              <div className="grid gap-5 p-4 md:grid-cols-[1.15fr_0.85fr] md:p-5">
                <div className="relative overflow-hidden rounded-xl">
                  <img src={puja.imageUrl} alt={puja.title} className="h-82.5 w-full object-cover md:h-90" />
                  <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/10" />
                  <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[#f6c232] px-3 py-1 text-xs font-bold text-[#533813]">
                    {puja.shortTitle || puja.badge || "Akshay Tritiya Special"}
                  </div>
                  <div className="absolute left-4 bottom-5 max-w-xs text-white">
                    <p className="text-sm font-semibold uppercase tracking-wide">{puja.subtitle || "Special Puja"}</p>
                    <h1 className="mt-1 text-3xl font-extrabold leading-tight">{puja.details.heroTitle || puja.title}</h1>
                    <p className="mt-2 text-sm text-white/90">{puja.details.strengthFor}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#efe6d8] p-4 md:p-5">
                  <h2 className="text-xl font-extrabold leading-snug text-[#2f2415]">{puja.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#69573e]">{puja.details.ritualSummary}</p>

                  <div className="mt-4 space-y-2 text-sm text-[#745f3f]">
                    <p className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-[#f59e0b]" /> {puja.location || puja.details.templeLocation}</p>
                    <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-[#f59e0b]" /> {puja.date || "Announced soon"}</p>
                    <p className="flex items-center gap-2"><StarIcon className="h-4 w-4 text-[#f59e0b]" /> 4.9/5 rating</p>
                  </div>

                  {selectedPackage ? (
                    <div className="mt-4 rounded-lg bg-[#fff8ec] p-3">
                      <p className="text-xs uppercase tracking-wide text-[#987341]">Starts from</p>
                      <div className="mt-1 flex items-end gap-2">
                        <p className="text-2xl font-extrabold text-[#146c43]">₹{selectedPackage.price}</p>
                        {highPrice ? <p className="text-sm text-[#927e61] line-through">₹{highPrice}</p> : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    {[
                      { key: "D", value: countdown.days },
                      { key: "H", value: countdown.hours },
                      { key: "M", value: countdown.minutes },
                      { key: "S", value: countdown.seconds },
                    ].map((item) => (
                      <div key={item.key} className="rounded-md border border-[#efd8b8] bg-[#fffaf2] py-2">
                        <p className="text-sm font-bold text-[#513a1d]">{String(item.value).padStart(2, "0")}</p>
                        <p className="text-[10px] uppercase tracking-wide text-[#8f7a58]">{item.key}</p>
                      </div>
                    ))}
                  </div>
                  {countdown.expired ? (
                    <p className="mt-2 text-xs font-semibold text-[#b45309]">This puja has started or completed.</p>
                  ) : null}

                  <button 
                    onClick={() => setShowPackageModal(true)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0e915f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b7c50]"
                  >
                    Select your package
                    <ClockIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-4 overflow-x-auto rounded-md border border-[#ebe3d8] bg-white px-2 py-2">
              <div className="flex min-w-max items-center gap-4 px-1">
                {sectionTabs.map((tab) => (
                  <a key={tab.id} href={`#${tab.id}`} className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#655338] hover:bg-[#fff4df] hover:text-[#c56f14]">
                    {tab.label}
                  </a>
                ))}
              </div>
            </section>

            <section id="about" className="mt-8 rounded-xl border border-[#ebe3d8] bg-white p-5">
              <h3 className="text-2xl font-bold text-[#2f2415]">{puja.details.heroTitle} where chanting ensures lasting prosperity</h3>
              <p className="mt-3 text-sm leading-7 text-[#655338]">{puja.details.about}</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#655338]">
                {aboutParagraphs.map((paragraph, index) => (
                  <p key={index}>🔸 {paragraph}</p>
                ))}
              </div>
              <div className="mt-5 grid gap-3 border-t border-[#f0e9df] pt-5 sm:grid-cols-2 lg:grid-cols-4">
                {puja.details.stats.map((stat, index) => (
                  <div key={index} className="rounded-lg bg-[#fff8ec] p-3">
                    <p className="text-xs uppercase tracking-wide text-[#8a6b3c]">{stat.label}</p>
                    <p className="mt-1 text-xl font-bold text-[#2f2415]">{stat.value}</p>
                    {stat.detail ? <p className="text-xs text-[#7b6750]">{stat.detail}</p> : null}
                  </div>
                ))}
              </div>
            </section>

            <section id="benefits" className="mt-8 rounded-xl border border-[#ebe3d8] bg-white p-5">
              <h3 className="text-2xl font-bold text-[#2f2415]">Puja Benefits</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {puja.details.benefits.map((benefit, index) => (
                  <div key={index} className="rounded-lg border border-[#f1e8db] p-3">
                    <p className="text-sm font-bold text-[#2f2415]">{benefit.title}</p>
                    <p className="mt-2 text-xs leading-6 text-[#6e5a40]">{benefit.description}</p>
                    <button className="mt-2 text-xs font-semibold text-[#c67119]">Read more</button>
                  </div>
                ))}
              </div>
            </section>

            <section id="process" className="mt-8 rounded-xl border border-[#ebe3d8] bg-white p-5">
              <h3 className="text-2xl font-bold text-[#2f2415]">Puja Process</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {puja.details.process.map((step, index) => (
                  <div key={index} className="rounded-lg border border-[#f0e7da] p-3">
                    <p className="inline-block rounded bg-[#ef7d00] px-2 py-0.5 text-[10px] font-bold text-white">{index + 1}</p>
                    <p className="mt-2 text-sm font-bold text-[#2f2415]">{step.title}</p>
                    <p className="mt-1 text-xs leading-6 text-[#6e5a40]">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="temple" className="mt-8 rounded-xl border border-[#ebe3d8] bg-white p-5">
              <h3 className="text-2xl font-bold text-[#2f2415]">{puja.details.templeName}, {puja.details.templeLocation}</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1.2fr]">
                <img src={puja.imageUrl} alt={puja.details.templeName} className="h-65 w-full rounded-lg object-cover" />
                <div className="space-y-3 text-sm leading-7 text-[#655338]">
                  <p>{puja.details.templeNote || "This temple is known for powerful prosperity rituals and ancient Lakshmi worship traditions."}</p>
                  <p>{puja.details.about}</p>
                  <p>Devotees believe prayers offered here remove obstacles, invite abundance, and support career, finance, and family harmony.</p>
                </div>
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-[#dcead3] bg-[#f7fcf4] p-4">
              <h4 className="text-lg font-bold text-[#2f2415]">All Puja Packages includes</h4>
              <div className="mt-3 grid gap-2 text-sm text-[#4f6a3d] md:grid-cols-2">
                {puja.details.inclusions.map((item) => (
                  <p key={item}>✓ {item}</p>
                ))}
              </div>
            </section>

            <section id="packages" className="mt-8 rounded-xl border border-[#ebe3d8] bg-white p-5">
              <h3 className="text-2xl font-bold text-[#2f2415]">Select your puja package</h3>
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {puja.packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`rounded-lg border p-3 text-left transition ${selectedPackage?.id === pkg.id ? "border-[#8cbf3f] bg-[#f6fbef]" : "border-[#ecdcca] hover:border-[#dbbe98]"}`}
                  >
                    <img src={puja.imageUrl} alt={pkg.name} className="h-20 w-full rounded object-cover" />
                    <p className="mt-2 text-sm font-semibold text-[#2f2415]">{pkg.name}</p>
                    <p className="mt-1 text-lg font-bold text-[#0f8d55]">₹{pkg.price}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[#68573f]">{pkg.description}</p>
                  </button>
                ))}
              </div>

              {selectedPackage ? (
                <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[#cbe1be] bg-[#f2fbeb] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#2f2415]">{selectedPackage.name}</p>
                    <p className="text-xs text-[#5f6f4c]">{selectedPackage.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-[#0f8d55]">₹{selectedPackage.price}</p>
                    <button className="rounded-md bg-[#0e915f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0b7c50]">Proceed</button>
                  </div>
                </div>
              ) : null}
            </section>

            <section id="reviews" className="mt-8 rounded-xl border border-[#ebe3d8] bg-white p-5">
              <h3 className="text-center text-3xl font-bold text-[#2f2415]">Reviews & Ratings</h3>
              <p className="mt-2 text-center text-sm text-[#6a5a46]">Read what our beloved devotees have to say about Sri Mandir.</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {reviews.map((review) => (
                  <div key={review.name} className="rounded-lg border border-[#f1e8db] p-3">
                    <p className="text-xs leading-6 text-[#6a5943]">{review.text}</p>
                    <p className="mt-3 text-sm font-bold text-[#2f2415]">{review.name}</p>
                    <p className="text-xs text-[#8c7b66]">{review.place}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-[#ebe3d8] bg-white p-5">
              <h3 className="text-3xl font-bold text-[#2f2415]">User Reviews</h3>
              <p className="mt-2 text-sm text-[#6a5a46]">Reviews from our devotees who booked Puja with us</p>
              <div className="mt-5 divide-y divide-[#f1e8dd]">
                {userReviews.map((review) => (
                  <div key={review.name} className="py-4">
                    <p className="text-sm font-semibold text-[#2f2415]">{review.name}</p>
                    <p className="text-xs text-[#8d7d66]">{review.date}</p>
                    <p className="mt-2 text-[#f59e0b]">★★★★★</p>
                    <p className="mt-1 text-sm text-[#655338]">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="faqs" className="mt-8 rounded-xl border border-[#ebe3d8] bg-white p-5">
              <h3 className="text-3xl font-bold text-[#2f2415]">Frequently asked Questions</h3>
              <div className="mt-4 divide-y divide-[#f2ebe0]">
                {puja.details.faq.map((item, index) => (
                  <details key={index} className="py-3">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-[#3a2f1e]">{item.question}</summary>
                    <p className="mt-2 text-sm leading-7 text-[#67553d]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>

        
          </div>
        )}
      </main>

      {/* Package Selection Modal */}
      {showPackageModal && puja && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
           <div className="relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                 <h2 className="text-xl font-bold text-[#1f1f1f]">All Puja Packages includes</h2>
                 <button onClick={() => setShowPackageModal(false)} className="rounded-full p-2 hover:bg-gray-100">
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                 </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                 {/* Inclusions List */}
                 <div className="space-y-4">
                    {[
                       "The participant's name and gotra will be recited by an experienced Panditji during the puja.",
                       "Participants will receive guided mantras and step-by-step instructions to join the puja from home.",
                       "A complete video of the puja and offerings will be shared on your WhatsApp.",
                       "A free Aashirwad Box with Tirth Prasad will be delivered to your home if you opt in to receive it."
                    ].map((item, idx) => (
                       <div key={idx} className="flex items-start gap-4">
                          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-[#0e915f]" />
                          <p className="text-[14px] leading-relaxed text-[#4b5563]">{item}</p>
                       </div>
                    ))}
                 </div>

                 {/* Additional Offerings Note */}
                 <div className="mt-8 flex items-center gap-4 rounded-2xl bg-[#f0f9f4] p-4 text-[#0e8356]">
                    <div className="h-10 w-10 shrink-0 bg-[#0e915f]/10 rounded-lg flex items-center justify-center">
                       <i className="fa-solid fa-hand-holding-dollar text-lg"></i>
                    </div>
                    <p className="text-[13px] font-medium leading-relaxed">
                       Opt for additional offerings like Vastra Daan, Anna Daan, Deep Daan, or Gau Seva in your name, available on the payments page.
                    </p>
                 </div>

                 {/* Package Selection Grid */}
                 <div className="mt-10">
                    <h3 className="text-lg font-bold text-[#1f1f1f] mb-6">Select your puja package</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                       {puja.packages.map((pkg, idx) => (
                          <button
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`relative flex flex-col p-5 rounded-3xl border-2 transition-all text-left ${
                              selectedPackageId === pkg.id 
                                ? "border-[#0e915f] bg-[#0e915f]/5 shadow-lg" 
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                             {idx === 2 && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#516300] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                   Recommended
                                </div>
                             )}
                             
                             <div className="mb-4 flex items-center justify-between">
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase ${
                                   idx === 0 ? "bg-orange-50 text-orange-600" : 
                                   idx === 1 ? "bg-pink-50 text-pink-600" :
                                   idx === 2 ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                                }`}>
                                   <i className="fa-solid fa-user text-[10px]"></i>
                                   {idx === 0 ? "1 Person" : idx === 1 ? "2 Person" : idx === 2 ? "4 Person" : "6 Person"}
                                </div>
                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                   selectedPackageId === pkg.id ? "border-[#0e915f] bg-[#0e915f]" : "border-gray-200"
                                }`}>
                                   {selectedPackageId === pkg.id && <CheckIcon className="h-4 w-4 text-white" />}
                                </div>
                             </div>

                             <h4 className="text-base font-bold text-[#1f1f1f] mb-2">{pkg.name}</h4>
                             <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{pkg.description}</p>
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Trust Bar */}
                 <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-gray-50 pt-8 pb-4">
                    {[
                       { icon: "fa-shield-halved", label: "Hidden Cost" },
                       { icon: "fa-certificate", label: "ISO 27001 Certified Company" },
                       { icon: "fa-place-of-worship", label: "Official Temple Partner" },
                       { icon: "fa-headset", label: "Customer Support" }
                    ].map((trust) => (
                       <div key={trust.label} className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                          <i className={`fa-solid ${trust.icon} text-gray-600 text-sm`}></i>
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter whitespace-nowrap">{trust.label}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="border-t border-gray-100 p-6 bg-white">
                 <button 
                   onClick={() => {
                      if (selectedPackageId) {
                         setShowPackageModal(false);
                         setShowDetailsModal(true);
                      }
                   }}
                   className="flex w-full items-center justify-between rounded-2xl bg-[#0e915f] p-4 text-white shadow-xl shadow-[#0e915f]/20 hover:scale-[1.01] transition-transform"
                 >
                    <div className="text-left">
                       <p className="text-xl font-bold">₹{selectedPackage?.price || '0'}</p>
                       <p className="text-[10px] font-medium uppercase opacity-80">{selectedPackage?.name}</p>
                    </div>
                    <div className="flex items-center gap-4 font-bold uppercase tracking-widest text-sm">
                       Proceed <i className="fa-solid fa-arrow-right"></i>
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Details Collection Modal */}
      {showDetailsModal && puja && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="relative w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                 <button 
                   onClick={() => {
                      setShowDetailsModal(false);
                      setShowPackageModal(true);
                   }}
                   className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                 >
                    <ArrowLeftIcon className="h-5 w-5 text-gray-900" />
                 </button>
                 <h3 className="text-xl font-bold text-gray-900">Fill your details for Puja</h3>
              </div>
              
              <div className="space-y-8">
                 {/* WhatsApp Number Field */}
                 <div>
                    <label className="block text-gray-900 font-bold text-sm mb-2">Enter Your Whatsapp Mobile Number</label>
                    <p className="text-[11px] text-gray-400 mb-4 leading-relaxed font-medium">Your Puja booking updates like Puja Photos, Videos and other details will be sent on WhatsApp on below number.</p>
                    <div className="relative group">
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#0e915f] font-bold">
                          <i className="fa-brands fa-whatsapp text-lg"></i>
                          <span className="text-sm">+91</span>
                       </div>
                       <input 
                         type="tel" 
                         maxLength={10}
                         value={userDetails.whatsapp}
                         onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setUserDetails(prev => ({ ...prev, whatsapp: val }));
                         }}
                         className="w-full bg-white border-2 border-blue-500 rounded-2xl py-4 pl-24 pr-12 font-bold text-gray-900 outline-none shadow-[0_0_0_1px_rgba(59,130,246,0.1)]"
                         placeholder="8192812323"
                       />
                       {userDetails.whatsapp && (
                          <button 
                            onClick={() => setUserDetails(prev => ({ ...prev, whatsapp: "" }))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500"
                          >
                             <i className="fa-solid fa-circle-xmark opacity-50"></i>
                          </button>
                       )}
                       <div className="absolute -top-2.5 left-6 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Your mobile Number</div>
                    </div>
                 </div>

                 {/* Name Field */}
                 <div>
                    <label className="block text-gray-900 font-bold text-sm mb-4">Enter Your Name</label>
                    <div className="relative group">
                       <input 
                         type="text" 
                         value={userDetails.name}
                         onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                         className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-900 outline-none shadow-sm focus:border-blue-500 transition-all"
                         placeholder="ajay"
                       />
                       {userDetails.name && (
                          <button 
                            onClick={() => setUserDetails(prev => ({ ...prev, name: "" }))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500"
                          >
                             <i className="fa-solid fa-circle-xmark opacity-50"></i>
                          </button>
                       )}
                       <div className="absolute -top-2 left-6 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Your full Name</div>
                    </div>
                 </div>

                 {/* Next Button */}
                 <button 
                   disabled={!userDetails.name || userDetails.whatsapp.length < 10}
                   onClick={() => {
                      setShowDetailsModal(false);
                      setShowReviewModal(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className="w-full bg-[#0e915f] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#0b7c50] transition-all disabled:opacity-50 disabled:grayscale mt-4"
                 >
                    Next
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && puja && (
        <div className="fixed inset-0 z-[120] bg-[#f8f9fa] overflow-y-auto">
           <Navbar />
           {/* Review Breadcrumbs */}
           <div className="bg-white border-b border-gray-100 py-3 px-6 sticky top-0 z-10">
              <div className="mx-auto max-w-7xl flex items-center justify-between">
                 <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-[#0e915f]">
                    <div className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-[#0e915f] text-white flex items-center justify-center text-[8px]">1</div> Add Details</div>
                    <div className="flex items-center gap-2"><div className="h-5 w-5 rounded-full bg-[#0e915f] text-white flex items-center justify-center text-[8px]">2</div> Review Booking</div>
                    <div className="flex items-center gap-2 opacity-30"><div className="h-5 w-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-[8px]">3</div> Make Payment</div>
                 </div>
                 <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-red-500">
                    <XMarkIcon className="h-6 w-6" />
                 </button>
              </div>
           </div>

           <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column: Selected Items */}
              <div className="lg:col-span-2 space-y-6">
                 <button 
                   onClick={() => {
                      setShowReviewModal(false);
                      setShowDetailsModal(true);
                   }}
                   className="flex items-center gap-2 text-sm font-bold text-[#1f1f1f] hover:text-[#0e915f] transition-colors mb-6"
                 >
                    <ArrowLeftIcon className="h-4 w-4" /> Review Booking
                 </button>

                 <div className="space-y-4">
                    {/* Primary Package */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h3 className="font-bold text-[#1f1f1f] text-lg mb-1">{selectedPackage?.name}</h3>
                             <p className="text-[#0e915f] font-extrabold text-xl">₹ {selectedPackage?.price}</p>
                          </div>
                          <div className="bg-[#0e915f]/10 text-[#0e915f] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                             Primary Package
                          </div>
                       </div>
                       <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold">
                             <i className="fa-brands fa-whatsapp text-[#0e915f] text-lg"></i>
                             <span>+91 {userDetails.whatsapp}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold">
                             <i className="fa-solid fa-user text-gray-400"></i>
                             <span>{userDetails.name}</span>
                          </div>
                       </div>
                    </div>

                    {/* Extra Selected Offerings */}
                    {(puja?.offerings || []).filter(o => selectedExtraIds.includes(o.id)).map(extra => (
                       <div key={extra.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex justify-between items-center group">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 bg-gray-50 rounded-xl overflow-hidden">
                                <img src={extra.imageUrl} alt={extra.name} className="w-full h-full object-cover" />
                             </div>
                             <div>
                                <h4 className="font-bold text-sm text-[#1f1f1f]">{extra.name}</h4>
                                <p className="text-[#0e915f] font-bold text-sm">₹ {extra.price}</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => toggleExtra(extra.id)}
                            className="text-red-500 hover:bg-red-50 h-8 w-8 rounded-full flex items-center justify-center transition-all"
                          >
                             <XMarkIcon className="h-5 w-5" />
                          </button>
                       </div>
                    ))}
                    
                    <div className="bg-orange-50/50 rounded-2xl p-6 flex justify-between items-center cursor-pointer hover:bg-orange-50 transition-colors border border-orange-100/50">
                       <div className="flex items-center gap-3">
                          <span className="text-xl">🏷️</span>
                          <span className="font-bold text-sm text-[#1f1f1f]">Apply Coupon Code</span>
                       </div>
                       <i className="fa-solid fa-chevron-right text-gray-400 text-xs"></i>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                       <h3 className="font-bold text-[#1f1f1f] mb-6 border-b border-gray-50 pb-4">Bill details</h3>
                       <div className="space-y-4 text-sm font-medium text-gray-500">
                          <div className="flex justify-between">
                             <span>{selectedPackage?.name}</span>
                             <span className="text-gray-900">₹ {selectedPackage?.price}.0</span>
                          </div>
                          {(puja?.offerings || []).filter(o => selectedExtraIds.includes(o.id)).map(extra => (
                             <div key={extra.id} className="flex justify-between">
                                <span>{extra.name}</span>
                                <span className="text-gray-900">₹ {extra.price}.0</span>
                             </div>
                          ))}
                          <div className="pt-6 mt-2 border-t border-gray-100 flex justify-between text-xl font-black text-[#1f1f1f]">
                             <span>Total Amount</span>
                             <span className="text-[#0e915f]">₹ {totalAmount}.0</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Column: Upsell */}
              <div>
                 <h3 className="font-bold text-[#1f1f1f] mb-6 flex items-center gap-2">
                    <span className="h-1.5 w-6 bg-[#0e915f] rounded-full"></span>
                    Add more Divine offerings
                 </h3>
                 <div className="space-y-4">
                    {(puja?.offerings || []).filter(o => !selectedExtraIds.includes(o.id)).map(extra => (
                       <div key={extra.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-[#0e915f]/30 transition-all">
                          <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                             <img src={extra.imageUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-bold text-[13px] text-[#1f1f1f] truncate">{extra.name}</h4>
                             <p className="text-[#0e915f] font-bold text-[13px] mt-0.5">₹ {extra.price}</p>
                          </div>
                          <button 
                            onClick={() => toggleExtra(extra.id)}
                            className="bg-white text-[#0e915f] border border-[#0e915f] h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#0e915f] hover:text-white transition-all active:scale-95"
                          >
                             + Add
                          </button>
                       </div>
                    ))}
                 </div>

                 <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-start gap-4">
                       <i className="fa-solid fa-circle-info text-blue-500 mt-1"></i>
                       <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                          By proceeding, you agree to our Terms of Service. Your Puja will be conducted with full vedic rites as per the selected package and offerings.
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Floating Bottom Bar */}
           <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:p-6 z-50">
              <div className="mx-auto max-w-7xl flex items-center justify-between bg-[#0e915f] text-white p-4 lg:p-5 rounded-2xl shadow-xl shadow-[#0e915f]/20">
                 <div className="flex items-center gap-4 text-sm font-bold pl-4">
                    <span>{1 + selectedExtraIds.length} Sevas selected</span>
                    <span className="opacity-50">•</span>
                    <span className="text-lg">₹ {totalAmount}</span>
                 </div>
                 <button 
                   onClick={() => {
                      const extras = selectedExtraIds.join(',');
                      window.location.href = `/payment?amount=${totalAmount}&type=puja&pkg=${selectedPackageId}&name=${encodeURIComponent(userDetails.name)}&wa=${userDetails.whatsapp}&extras=${extras}`;
                   }}
                   className="flex items-center gap-2 font-bold hover:gap-4 transition-all uppercase tracking-widest text-sm"
                 >
                    Proceed to Payment <i className="fa-solid fa-arrow-right"></i>
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
