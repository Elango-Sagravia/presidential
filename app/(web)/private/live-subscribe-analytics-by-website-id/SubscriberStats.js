"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SubscriberStats = () => {
  const searchParams = useSearchParams();
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");
  const website_id = searchParams.get("website_id") || "1,2,3,4"; // Default value for website_id

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    email: "",
    browser: "",
    device: "",
    platform: "",
    country: "",
    referrer: "",
  });

  // Helper function to check if start_date <= end_date
  const isDateRangeValid = () => {
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    return startDateObj <= endDateObj;
  };

  useEffect(() => {
    if (!start_date || !end_date || !isDateRangeValid()) return;

    const fetchData = async () => {
      try {
        const apiUrl = `/api/stats/live-subscribers-stats-by-website-id?start_date=${start_date}&end_date=${end_date}&website_id=${website_id}`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch data");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [start_date, end_date]);

  if (!start_date || !end_date)
    return (
      <div className="min-h-screen">
        Please provide start_date and end_date in the URL
      </div>
    );

  if (!isDateRangeValid()) {
    return (
      <div className="min-h-screen">
        Error: start_date must be less than or equal to end_date
      </div>
    );
  }
  if (isLoading) return <div className="min-h-screen">Loading...</div>;
  if (error) return <div className="min-h-screen">Error: {error}</div>;

  // Get unique values for dropdown filters
  const getUniqueValues = (field) => {
    return Array.from(
      new Set(
        data.subscribersList.subscribers.map(
          (subscriber) => subscriber[field] || "None"
        )
      )
    );
  };

  const filteredSubscribers = data.subscribersList.subscribers.filter(
    (subscriber) => {
      return (
        subscriber.email.toLowerCase().includes(filters.email.toLowerCase()) &&
        (filters.browser === "" || subscriber.browser === filters.browser) &&
        (filters.device === "" || subscriber.device === filters.device) &&
        (filters.platform === "" || subscriber.platform === filters.platform) &&
        (filters.country === "" || subscriber.country === filters.country) &&
        (filters.referrer === "" ||
          subscriber.referrer === filters.referrer ||
          (filters.referrer === "None" && !subscriber.referrer))
      );
    }
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleResetFilters = () => {
    setFilters({
      email: "",
      browser: "",
      device: "",
      platform: "",
      country: "",
      referrer: "",
    });
  };

  const renderSubscribersTable = () => (
    <div className="mt-8 min-h-screen">
      <h3 className="text-xl font-bold mb-4">
        Subscribers List (Total: {filteredSubscribers.length})
      </h3>
      {/* Filters */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Filter by Email"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <select
          name="browser"
          value={filters.browser}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Browsers</option>
          {getUniqueValues("browser").map((browser) => (
            <option key={browser} value={browser}>
              {browser}
            </option>
          ))}
        </select>
        <select
          name="device"
          value={filters.device}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Devices</option>
          {getUniqueValues("device").map((device) => (
            <option key={device} value={device}>
              {device}
            </option>
          ))}
        </select>
        <select
          name="platform"
          value={filters.platform}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Platforms</option>
          {getUniqueValues("platform").map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
        <select
          name="country"
          value={filters.country}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Countries</option>
          {getUniqueValues("country").map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <select
          name="referrer"
          value={filters.referrer}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Referrers</option>
          {getUniqueValues("referrer").map((referrer) => (
            <option key={referrer} value={referrer}>
              {referrer}
            </option>
          ))}
        </select>
      </div>
      {/* Reset Button */}
      <button
        onClick={handleResetFilters}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Reset Filters
      </button>
      {/* Table */}
      <Table className="mt-4">
        <TableCaption>A list of filtered subscribers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Serial No</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Browser</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Referrer</TableHead>
            <TableHead>Subscription Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubscribers.map((subscriber, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{subscriber.email}</TableCell>
              <TableCell>{subscriber.browser}</TableCell>
              <TableCell>{subscriber.device}</TableCell>
              <TableCell>{subscriber.platform}</TableCell>
              <TableCell>{subscriber.country}</TableCell>
              <TableCell>{subscriber.referrer || "None"}</TableCell>
              <TableCell>
                {new Date(subscriber.subscription_date).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-6 pt-40 lg:pt-40">
      <h1 className="text-2xl font-bold text-center mb-4">
        Daily Subscriber Stats from {start_date} to {end_date}
      </h1>
      <h2>Total subscribers acquired: {data.countries.total_subscribers}</h2>
      <h2>Total unsubscribers: {data.email_unsubscribes.count}</h2>
      <h2>Total email sent: {data.email_sent.count}</h2>
      <h2>Total email opens: {data.email_opens.count}</h2>

      {/* Country Stats */}
      <h3 className="text-xl font-bold mt-8 mb-4">Country Stats</h3>
      <Table>
        <TableCaption>Subscribers by country</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Country</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.countries.list.map((country, index) => (
            <TableRow key={index}>
              <TableCell>{country.country}</TableCell>
              <TableCell>{country.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Referrer Stats */}
      <h3 className="text-xl font-bold mt-8 mb-4">Referrer Stats</h3>
      <Table>
        <TableCaption>Subscribers by referrer</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Referrer</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.referrers.list.map((referrer, index) => (
            <TableRow key={index}>
              <TableCell>{referrer.referrer || "None"}</TableCell>
              <TableCell>{referrer.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Desktop Stats */}
      <h3 className="text-xl font-bold mt-8 mb-4">
        Desktop Stats (Total: {data.desktop.count})
      </h3>
      <Table>
        <TableCaption>Desktop browsers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Browser</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.desktop.browsers.map((browser, index) => (
            <TableRow key={index}>
              <TableCell>{browser.browser}</TableCell>
              <TableCell>{browser.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Table>
        <TableCaption>Desktop platforms</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.desktop.platforms.map((platform, index) => (
            <TableRow key={index}>
              <TableCell>{platform.platform}</TableCell>
              <TableCell>{platform.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Mobile Stats */}
      <h3 className="text-xl font-bold mt-8 mb-4">
        Mobile Stats (Total: {data.mobile.count})
      </h3>
      <Table>
        <TableCaption>Mobile browsers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Browser</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.mobile.browsers.map((browser, index) => (
            <TableRow key={index}>
              <TableCell>{browser.browser}</TableCell>
              <TableCell>{browser.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Table>
        <TableCaption>Mobile platforms</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.mobile.platforms.map((platform, index) => (
            <TableRow key={index}>
              <TableCell>{platform.platform}</TableCell>
              <TableCell>{platform.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Tablet Stats */}
      <h3 className="text-xl font-bold mt-8 mb-4">
        Tablet Stats (Total: {data.tablet.count})
      </h3>
      <Table>
        <TableCaption>Tablet browsers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Browser</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.tablet.browsers.map((browser, index) => (
            <TableRow key={index}>
              <TableCell>{browser.browser}</TableCell>
              <TableCell>{browser.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Table>
        <TableCaption>Tablet platforms</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Platform</TableHead>
            <TableHead>Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.tablet.platforms.map((platform, index) => (
            <TableRow key={index}>
              <TableCell>{platform.platform}</TableCell>
              <TableCell>{platform.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Subscribers List */}
      {renderSubscribersTable()}
    </div>
  );
};

export default SubscriberStats;
