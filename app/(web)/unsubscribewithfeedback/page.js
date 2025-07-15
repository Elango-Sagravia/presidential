"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const reasons = [
  "The topics are not relevant to me",
  "The emails are too frequent",
  "The emails are too long or time‑consuming",
  "I find the layout or design hard to read",
  "I did not sign up for this",
  "I joined by mistake",
  "Other",
];

const UnsubscribeContent = () => {
  const params = useSearchParams();
  const uniqueId = params.get("unique_id");
  const campaignId = params.get("campaign_id");

  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isOtherSelected = selectedReason === "Other";
  const isValid =
    (selectedReason && selectedReason !== "Other") ||
    (isOtherSelected && customReason.trim().length > 0);

  const handleSubmit = async () => {
    if (!uniqueId || !campaignId) {
      setError("Missing unique ID or campaign ID");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      uniqueid: uniqueId,
      campaign_id: Number(campaignId),
      reason: isOtherSelected ? "Other" : selectedReason,
      notes: isOtherSelected ? customReason.trim() : null,
    };

    try {
      const feedbackRes = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (feedbackRes.status === 201) {
        const unsubUrl = `/api/emails/unsubscribebyid?unique_id=${uniqueId}&campaign_id=${campaignId}`;
        const unsubRes = await fetch(unsubUrl, { method: "POST" });

        if (unsubRes.ok) {
          setSubmitted(true);
        } else {
          setError("Unsubscribe failed. Please try again.");
        }
      } else {
        const errData = await feedbackRes.json();
        setError(errData.error || "Failed to submit feedback");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <h1 className="text-3xl text-nl_background w-full md:w-1/2 text-center">
        Your email has been successfully removed from our subscriber list.
      </h1>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Why are you unsubscribing?
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="space-y-2 mb-4">
          {reasons.map((reason, idx) => (
            <label key={idx} className="flex items-center space-x-2">
              <input
                type="radio"
                name="reason"
                value={reason}
                onChange={() => {
                  setSelectedReason(reason);
                  if (reason !== "Other") {
                    setCustomReason("");
                  }
                }}
                checked={selectedReason === reason}
              />
              <span className="text-gray-700">{reason}</span>
            </label>
          ))}
        </div>

        {isOtherSelected && (
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800 mb-4"
            placeholder="Please share your reason..."
            rows={4}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        )}

        {error && <div className="text-red-500 text-sm mb-2">⚠️ {error}</div>}

        {isValid && (
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full"
          >
            {isSubmitting ? "Submitting..." : "Unsubscribe"}
          </button>
        )}
      </form>
    </div>
  );
};

const UnsubscribeWithFeedback = () => {
  return (
    <div className="bg-nl_sec_background min-h-svh md:min-h-[1050px] flex justify-center items-center px-4 md:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
};

export default UnsubscribeWithFeedback;
