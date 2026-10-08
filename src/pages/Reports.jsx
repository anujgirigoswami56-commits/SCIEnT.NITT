import React from "react";
import { ArrowUpRight, FileText } from "lucide-react";
import Footer from "../components/footer";
import Navbar from "../components/Navbar";
import "./Reports.css";

const reportYears = [
  "2025–26",
  "2024–25",
  "2023–24",
  "2022–23",
  "2021–22",
  "2020–21",
  "2019–20",
  "2018–19",
  "2017–18",
  "2016–17",
];
const placeholderReportUrl = "https://example.com";

const Reports = () => {
  return (
    <div className="reports-page">
      <Navbar />

      <main className="reports-content">
        <div className="reports-ambient-glow reports-ambient-glow-top" />
        <div className="reports-ambient-glow reports-ambient-glow-bottom" />

        <header className="reports-hero">
          <FileText className="reports-hero-icon" aria-hidden="true" />
          <h1>REPORTS</h1>
          <p>Updates and reports from SCIEnT</p>
          <span>Student Centre for Innovation in Engineering and Technology</span>
        </header>

        <section className="reports-years" aria-label="Annual reports">
          {reportYears.map((year) => (
            <a
              className="reports-year-card"
              href={placeholderReportUrl}
              key={year}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${year} annual report (placeholder link)`}
            >
              <FileText className="reports-card-icon" aria-hidden="true" />
              <span className="reports-year-label">Annual Report</span>
              <h2>{year}</h2>
              <span className="reports-view-link">
                View report <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </a>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reports;
