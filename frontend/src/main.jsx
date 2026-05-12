import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, ChevronUp, Loader2, MapPin, Moon, Search, Sparkles, Sun } from "lucide-react";
import "./styles.css";

const MIN_RELEVANCE_SCORE = 25;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TRACKER_STORAGE_KEY = "job-intel-application-statuses";
const LAST_SEARCH_PROFILE_KEY = "job-intel-last-search-profile";
const LAST_SEARCH_RESULTS_KEY = "job-intel-last-search-results";
const TECH_ALIASES = {
  "java script": "javascript",
  "node js": "node.js",
  nodejs: "node.js",
  "react js": "react",
  "type script": "typescript"
};
const SOURCE_LABELS = {
  realpython_fake_jobs: "Real Python Fake Jobs",
  remotive: "Remotive",
  himalayas: "Himalayas"
};
const REASON_CHIP_CLASSES = {
  positive: "max-w-full rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium leading-5 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  caution: "max-w-full rounded-full bg-amber-50 px-3 py-1 text-xs font-medium leading-5 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  negative: "max-w-full rounded-full bg-red-50 px-3 py-1 text-xs font-medium leading-5 text-red-800 dark:bg-red-950 dark:text-red-200"
};
const DECISION_BADGE_CLASSES = {
  apply: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  review: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
  restricted: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  stretch: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  low: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
};
const JOB_STATUSES = [
  { value: "new", label: "New" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "skipped", label: "Skipped" }
];
const STATUS_FILTERS = [{ value: "all", label: "All" }, ...JOB_STATUSES];

const initialForm = {
  target_roles: "",
  skills: "",
  keywords: "",
  avoid_keywords: "",
  location: "",
  work_mode: "any",
  experience_level: "any",
  source_type: "realpython_fake_jobs"
};

function splitList(value) {
  return value
    .split(",")
    .map((item) => normalizeProfileTerm(item))
    .filter(Boolean);
}

function normalizeProfileTerm(value) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  const aliasKey = cleaned.toLowerCase();

  return TECH_ALIASES[aliasKey] || cleaned;
}

function App() {
  const [restoredSearch] = useState(loadStoredSearchResults);
  const [form, setForm] = useState(() => loadStoredSearchProfile() || initialForm);
  const [jobs, setJobs] = useState(() => restoredSearch?.jobs || []);
  const [status, setStatus] = useState(() => (restoredSearch ? "success" : "idle"));
  const [error, setError] = useState("");
  const [sourceInfo, setSourceInfo] = useState(() => restoredSearch?.sourceInfo || null);
  const [theme, setTheme] = useState(() => localStorage.getItem("job-intel-theme") || "light");
  const [showExploreMore, setShowExploreMore] = useState(false);
  const [jobStatuses, setJobStatuses] = useState(loadStoredJobStatuses);
  const [statusFilter, setStatusFilter] = useState("all");

  const visibleJobs = useMemo(() => jobs.filter((job) => job.scoring.score >= MIN_RELEVANCE_SCORE), [jobs]);
  const lowerMatchJobs = useMemo(() => jobs.filter((job) => job.scoring.score < MIN_RELEVANCE_SCORE), [jobs]);
  const filteredVisibleJobs = useMemo(
    () => filterJobsByStatus(visibleJobs, statusFilter, jobStatuses),
    [visibleJobs, statusFilter, jobStatuses]
  );
  const filteredLowerMatchJobs = useMemo(
    () => filterJobsByStatus(lowerMatchJobs, statusFilter, jobStatuses),
    [lowerMatchJobs, statusFilter, jobStatuses]
  );
  const sourceLabel = SOURCE_LABELS[form.source_type] || SOURCE_LABELS.realpython_fake_jobs;
  const isExploreMoreOpen = showExploreMore || filteredVisibleJobs.length === 0;
  const filteredJobCount = filteredVisibleJobs.length + filteredLowerMatchJobs.length;
  const resultSummary =
    status === "success"
      ? jobs.length === 0
        ? sourceInfo?.message || `${sourceLabel} returned no jobs for this search.`
        : `${visibleJobs.length} recommended matches${lowerMatchJobs.length ? `, ${lowerMatchJobs.length} more to explore` : ""}${
            statusFilter === "all" ? "" : `, ${filteredJobCount} shown for ${getStatusLabel(statusFilter)}`
          }`
      : "Submit a profile to fetch and score jobs.";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("job-intel-theme", theme);
  }, [theme]);

  useEffect(() => {
    saveStoredJobStatuses(jobStatuses);
  }, [jobStatuses]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function updateJobStatus(job, nextStatus) {
    const key = getJobStatusKey(job);

    if (!key || !isKnownStatus(nextStatus)) {
      return;
    }

    setJobStatuses((current) => {
      const updated = { ...current };

      if (nextStatus === "new") {
        delete updated[key];
      } else {
        updated[key] = nextStatus;
      }

      return updated;
    });
  }

  async function searchJobs(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setJobs([]);
    setSourceInfo(null);
    setShowExploreMore(false);

    const payload = {
      profile: {
        target_roles: splitList(form.target_roles),
        skills: splitList(form.skills),
        keywords: splitList(form.keywords),
        avoid_keywords: splitList(form.avoid_keywords),
        location: form.location.trim(),
        work_mode: form.work_mode,
        experience_level: form.experience_level
      },
      source: {
        type: form.source_type
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      const nextSourceInfo = data.source || null;
      setSourceInfo(nextSourceInfo);

      if (!response.ok) {
        throw new Error(data.source?.message || data.error || `Search failed with status ${response.status}.`);
      }

      const nextJobs = Array.isArray(data.jobs) ? data.jobs : [];
      setJobs(nextJobs);
      setStatus("success");
      saveStoredSearchProfile(form);
      saveStoredSearchResults({
        jobs: nextJobs,
        sourceInfo: nextSourceInfo
      });
    } catch (searchError) {
      setError(searchError.message);
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Job Intelligence MVP
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl dark:text-white">
              Rank real scraped jobs against your search profile.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              Source: {sourceLabel}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[380px_1fr]">
        <form onSubmit={searchJobs} className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-emerald-500 dark:text-slate-950">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Search Profile</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Comma-separated roles, skills, and keywords.</p>
            </div>
          </div>

          <Field
            label="Target roles"
            name="target_roles"
            value={form.target_roles}
            onChange={updateField}
            placeholder="QA Tester, Python Automation"
            helper="Examples: Python Automation, QA Tester, Frontend Developer"
          />
          <Field
            label="Skills"
            name="skills"
            value={form.skills}
            onChange={updateField}
            placeholder="java script, css, node js"
            helper="Examples: javascript, node.js, react, css"
          />
          <Field
            label="Keywords"
            name="keywords"
            value={form.keywords}
            onChange={updateField}
            placeholder="remote, entry level"
            helper="Examples: entry, junior, support, automation"
          />
          <Field
            label="Avoid keywords"
            name="avoid_keywords"
            value={form.avoid_keywords}
            onChange={updateField}
            placeholder="senior, manager"
            helper="Examples: senior, lead, architect"
          />
          <Field label="Location" name="location" value={form.location} onChange={updateField} placeholder="Philippines" />

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Experience level</span>
            <select
              name="experience_level"
              value={form.experience_level}
              onChange={updateField}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-950"
            >
              <option value="any">Any</option>
              <option value="beginner">Beginner</option>
              <option value="junior">Junior</option>
              <option value="intermediate">Intermediate</option>
              <option value="senior">Senior</option>
            </select>
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Work mode</span>
            <select
              name="work_mode"
              value={form.work_mode}
              onChange={updateField}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-950"
            >
              <option value="any">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Source</span>
            <select
              name="source_type"
              value={form.source_type}
              onChange={updateField}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-950"
            >
              <option value="realpython_fake_jobs">Real Python Fake Jobs</option>
              <option value="remotive">Remotive</option>
              <option value="himalayas">Himalayas</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Find Jobs
          </button>
        </form>

        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Ranked Results</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{resultSummary}</p>
            </div>
            {status === "success" && jobs.length > 0 && (
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-950"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          {status === "idle" && <EmptyState />}
          {status === "loading" && <LoadingState />}

          {status === "success" && (
            <>
              <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {sourceInfo?.message || "Recommended is for first-pass decisions. Explore More keeps useful leads, stretches, and low-confidence roles available."}
              </div>
              {filteredVisibleJobs.length > 0 ? (
                <>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">Recommended - apply or inspect first</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Stronger role alignment. Check red chips before applying.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {filteredVisibleJobs.map((job) => (
                      <JobCard
                        key={job.id || getJobStatusKey(job)}
                        job={job}
                        status={getJobStatus(job, jobStatuses)}
                        onStatusChange={updateJobStatus}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  title={jobs.length === 0 ? "No jobs returned" : "No recommended matches"}
                  message={
                    jobs.length === 0
                      ? sourceInfo?.message || "The selected source returned no usable jobs for this profile."
                      : statusFilter !== "all"
                        ? `No recommended matches with ${getStatusLabel(statusFilter)} status. Try another status filter or Explore More.`
                      : "Explore More is open below with adjacent, restricted, and lower-confidence leads."
                  }
                />
              )}

              {filteredLowerMatchJobs.length > 0 && (
                <section className="mt-6">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">Explore More - inspect later</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Adjacent, stretch, restricted, or weak leads. Useful for review, not the first pass.
                      </p>
                    </div>
                    {filteredVisibleJobs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowExploreMore((current) => !current)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                        aria-expanded={isExploreMoreOpen}
                      >
                        {isExploreMoreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {isExploreMoreOpen ? "Hide" : "Show"} {filteredLowerMatchJobs.length}
                      </button>
                    )}
                  </div>

                  {isExploreMoreOpen && (
                    <div className="grid gap-4">
                      {filteredLowerMatchJobs.map((job) => (
                        <JobCard
                          key={job.id || getJobStatusKey(job)}
                          job={job}
                          variant="lower"
                          status={getJobStatus(job, jobStatuses)}
                          onStatusChange={updateJobStatus}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, name, value, onChange, placeholder, helper }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-950"
      />
      {helper && <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{helper}</span>}
    </label>
  );
}

function EmptyState({ title = "No search yet", message = "Your submitted profile drives scraping, scoring, reasons, and the final ranking." }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div>
        <BriefcaseBusiness className="mx-auto mb-3 h-10 w-10 text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function JobCard({ job, variant = "recommended", status = "new", onStatusChange }) {
  const decision = getDecisionSummary(job, variant);
  const scoreColor =
    decision.tone === "restricted"
      ? "text-red-700 dark:text-red-300"
      : decision.tone === "stretch"
        ? "text-amber-700 dark:text-amber-300"
        : variant === "lower"
          ? "text-slate-600 dark:text-slate-300"
          : "text-emerald-700 dark:text-emerald-300";

  return (
    <article className={`rounded-lg border bg-white p-5 shadow-sm dark:bg-slate-900 ${getCardBorderClass(decision.tone)}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${DECISION_BADGE_CLASSES[decision.tone]}`}>
              {decision.label}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{decision.helper}</span>
          </div>
          <h3 className="text-xl font-semibold leading-7 text-slate-950 dark:text-white">{job.title}</h3>
          <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{job.company}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location || "Location unavailable"}
            </span>
            <span>{job.source}</span>
            {job.salary && <span>{job.salary}</span>}
          </div>
        </div>
        <div className={`flex min-w-24 items-center justify-center rounded-lg border px-4 py-3 ${getScorePanelClass(decision.tone)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${scoreColor}`}>{job.scoring.score}</div>
            <div className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Score</div>
            <div className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              {formatFitLabel(job.scoring.execution_likelihood)}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">{job.summary}</p>

      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Why shown</div>
        <div className="flex flex-wrap gap-2">
        {job.scoring.match_reasons.map((reason) => (
          <span key={reason} className={getReasonChipClass(reason)}>
            {reason}
          </span>
        ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            {getStatusLabel(status)}
          </span>
          {JOB_STATUSES.filter((option) => option.value !== "new").map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange?.(job, option.value)}
              className={getStatusButtonClass(status, option.value)}
            >
              {option.label}
            </button>
          ))}
          {status !== "new" && (
            <button
              type="button"
              onClick={() => onStatusChange?.(job, "new")}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-950"
            >
              Reset
            </button>
          )}
        </div>

        {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-950 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:border-emerald-400 dark:hover:bg-slate-950"
        >
          Open job
          <ArrowUpRight className="h-4 w-4" />
        </a>
        )}
      </div>
    </article>
  );
}

function loadStoredSearchProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LAST_SEARCH_PROFILE_KEY) || "null");

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return {
      ...initialForm,
      ...Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => typeof value === "string")
      ),
      work_mode: ["any", "remote", "hybrid", "onsite"].includes(parsed.work_mode) ? parsed.work_mode : initialForm.work_mode,
      experience_level: ["any", "beginner", "junior", "intermediate", "senior"].includes(parsed.experience_level)
        ? parsed.experience_level
        : initialForm.experience_level,
      source_type: SOURCE_LABELS[parsed.source_type] ? parsed.source_type : initialForm.source_type
    };
  } catch {
    return null;
  }
}

function saveStoredSearchProfile(form) {
  try {
    localStorage.setItem(LAST_SEARCH_PROFILE_KEY, JSON.stringify(form));
  } catch {
    // Cached results are helpful, but search should still work if localStorage is unavailable.
  }
}

function loadStoredSearchResults() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LAST_SEARCH_RESULTS_KEY) || "null");

    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.jobs)) {
      return null;
    }

    const jobs = parsed.jobs.filter(isRestorableJob);

    return {
      jobs,
      sourceInfo: parsed.sourceInfo && typeof parsed.sourceInfo === "object" && !Array.isArray(parsed.sourceInfo)
        ? parsed.sourceInfo
        : null
    };
  } catch {
    return null;
  }
}

function saveStoredSearchResults(results) {
  try {
    localStorage.setItem(LAST_SEARCH_RESULTS_KEY, JSON.stringify(results));
  } catch {
    // Cached results are helpful, but search should still work if localStorage is unavailable.
  }
}

function isRestorableJob(job) {
  return Boolean(
    job &&
    typeof job === "object" &&
    typeof job.title === "string" &&
    typeof job.company === "string" &&
    job.scoring &&
    typeof job.scoring === "object" &&
    Number.isFinite(job.scoring.score) &&
    Array.isArray(job.scoring.match_reasons)
  );
}

function loadStoredJobStatuses() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TRACKER_STORAGE_KEY) || "{}");

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isKnownStatus(value) && value !== "new")
    );
  } catch {
    return {};
  }
}

function saveStoredJobStatuses(statuses) {
  try {
    localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(statuses));
  } catch {
    // Tracking is a convenience layer; failed local persistence should not block search.
  }
}

function filterJobsByStatus(jobs, statusFilter, jobStatuses) {
  if (statusFilter === "all") {
    return jobs;
  }

  return jobs.filter((job) => getJobStatus(job, jobStatuses) === statusFilter);
}

function getJobStatus(job, jobStatuses) {
  return jobStatuses[getJobStatusKey(job)] || "new";
}

function getJobStatusKey(job) {
  return job?.id || [job?.source, job?.title, job?.company, job?.url].filter(Boolean).join("|");
}

function isKnownStatus(status) {
  return JOB_STATUSES.some((option) => option.value === status);
}

function getStatusLabel(status) {
  return STATUS_FILTERS.find((option) => option.value === status)?.label || "New";
}

function getStatusButtonClass(currentStatus, buttonStatus) {
  const isActive = currentStatus === buttonStatus;
  const baseClass = "rounded-md border px-2.5 py-1 text-xs font-semibold transition";

  if (isActive) {
    return `${baseClass} border-slate-950 bg-slate-950 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-slate-950`;
  }

  return `${baseClass} border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-950`;
}

function getDecisionSummary(job, variant) {
  const hasNegative = job.scoring.match_reasons.some((reason) => getReasonTone(reason) === "negative");
  const hasCaution = job.scoring.match_reasons.some((reason) => getReasonTone(reason) === "caution");
  const fit = job.scoring.execution_likelihood;

  if (hasNegative) {
    return {
      tone: "restricted",
      label: "Check eligibility",
      helper: "Relevant signals may be blocked"
    };
  }

  if (fit === "strong_fit" || fit === "possible_fit") {
    return {
      tone: "apply",
      label: "Apply first",
      helper: hasCaution ? "Good fit with caveats" : "Best aligned"
    };
  }

  if (fit === "adjacent") {
    return {
      tone: "review",
      label: "Inspect later",
      helper: "Related but not exact"
    };
  }

  if (fit === "stretch") {
    return {
      tone: "stretch",
      label: "Stretch",
      helper: "Potential gap to review"
    };
  }

  return {
    tone: variant === "lower" ? "low" : "review",
    label: variant === "lower" ? "Low priority" : "Manual review",
    helper: "Weak or noisy match"
  };
}

function getCardBorderClass(tone) {
  return {
    apply: "border-slate-200 dark:border-slate-800",
    review: "border-slate-200 dark:border-slate-800",
    restricted: "border-red-200 dark:border-red-900",
    stretch: "border-amber-200 dark:border-amber-900",
    low: "border-slate-200 opacity-95 dark:border-slate-800"
  }[tone] || "border-slate-200 dark:border-slate-800";
}

function getScorePanelClass(tone) {
  return {
    apply: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950",
    review: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950",
    restricted: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950",
    stretch: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950",
    low: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
  }[tone] || "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950";
}

function getReasonChipClass(reason) {
  return REASON_CHIP_CLASSES[getReasonTone(reason)];
}

function getReasonTone(reason) {
  const normalized = reason.toLowerCase();

  if (
    normalized.includes("restricted") ||
    normalized.includes("outside preferred location") ||
    normalized.includes("avoid keyword") ||
    normalized.includes("region-restricted")
  ) {
    return "negative";
  }

  if (normalized.includes("lower-complexity") || normalized.includes("lower complexity")) {
    return "positive";
  }

  if (
    normalized.includes("complexity") ||
    normalized.includes("seniority may") ||
    (normalized.includes("senior") && !normalized.includes("senior-level workflow matches")) ||
    normalized.includes("additional skills") ||
    normalized.includes("adjacent") ||
    normalized.includes("platform") ||
    normalized.includes("architecture")
  ) {
    return "caution";
  }

  return "positive";
}

function formatFitLabel(value) {
  return {
    strong_fit: "Strong fit",
    possible_fit: "Possible fit",
    adjacent: "Adjacent",
    stretch: "Stretch",
    lower_match: "Lower match",
    poor_fit: "Lower match",
    unclear: "Unclear"
  }[value] || "Unclear";
}

createRoot(document.getElementById("root")).render(<App />);
