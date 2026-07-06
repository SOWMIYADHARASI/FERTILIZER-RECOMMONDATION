import React, { useState } from "react";
import { Mail, GraduationCap, Phone, MapPin, UserCheck, Heart, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRating = (ratingValue: number) => {
    setFormData(prev => ({ ...prev, rating: ratingValue }));
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg("All feedback fields are required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        setFormData({ name: "", email: "", message: "", rating: 5 });
      } else {
        setErrorMsg(data.error || "Failed to log feedback.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to the feedback servers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Institutional & Developer Contact</h1>
        <p className="text-slate-600 dark:text-slate-400">Reach the developers, inspect academic guides, and submit farm system feedback logs directly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Side: Developer & Institutional Profile */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-500" /> Academic Project Details
            </h3>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex gap-3">
                <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Developer Profile</div>
                  <div>S. Sowmiya</div>
                  <div className="text-slate-500">Full Stack AI Developer (B.Tech Information Technology)</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Heart className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Under the Guidance of</div>
                  <div>Dr. Ramesh Kumar, Ph.D.</div>
                  <div className="text-slate-500">Associate Professor, Department of Agronomy & Machine Learning</div>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Institution</div>
                  <div>Coimbatore Institute of Agricultural Sciences & Technology</div>
                  <div className="text-slate-500">Tamil Nadu, India</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Direct Email</div>
                  <div className="text-slate-500 hover:text-emerald-400 transition-colors">spsowmiya22@gmail.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Google Map Mockup */}
          <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-4 overflow-hidden shadow-lg space-y-3 h-[240px] flex flex-col">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" /> Ground Location Office
            </div>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative">
              <iframe
                title="Mock Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.326262947934!2d76.95750231535496!3d11.01684449215848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f973b3c%3A0x63351d8b99e9dc72!2sCoimbatore%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1656829104050!5m2!1sen!2sin"
                className="absolute inset-0 w-full h-full border-0 filter grayscale invert contrast-125 opacity-75"
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Right Side: Feedback Form */}
        <div className="bg-slate-900/40 border border-slate-200/5 dark:border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Farm Feedback Questionnaire</h3>
            <p className="text-xs text-slate-500">Provide direct feedback regarding prediction accuracy or AI agricultural responses.</p>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Meena Krishnan"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Your Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. meena@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-300 flex items-center justify-between">
                <span>Agronomy Recommendation Rating</span>
                <span className="text-amber-400 font-bold">{formData.rating} / 5 Stars</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${formData.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-300">Comments or Bug Report</label>
              <textarea
                required
                rows={4}
                placeholder="Share your farm experiences with our recommended fertilizers, crop responses, etc..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
              ></textarea>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
              </div>
            )}

            <button
              id="btn-submit-feedback"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Registering Feedback..." : "Submit Feedback Log"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
