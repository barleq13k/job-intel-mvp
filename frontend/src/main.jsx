import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, ChevronUp, Loader2, MapPin, Moon, Search, Sparkles, Sun } from "lucide-react";
import "./styles.css";

const MIN_RELEVANCE_SCORE = 25;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TRACKER_STORAGE_KEY = "job-intel-application-statuses";
const JOB_CACHE_STORAGE_KEY = "job-intel-job-cache";
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
  positive:
    "max-w-full rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1.5 text-xs font-medium leading-5 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/70 dark:text-emerald-200",
  caution:
    "max-w-full rounded-full border border-orange-300/90 bg-orange-50 px-3 py-1.5 text-xs font-medium leading-5 text-orange-900 dark:border-amber-900/80 dark:bg-amber-950/70 dark:text-amber-200",
  negative:
    "max-w-full rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium leading-5 text-red-900 dark:border-red-900/90 dark:bg-red-950/80 dark:text-red-200"
};
const DECISION_BADGE_CLASSES = {
  apply: "border-emerald-200/80 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/70 dark:text-emerald-200",
  review: "border-stone-300/80 bg-stone-100 text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200",
  restricted: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/80 dark:text-red-200",
  stretch: "border-amber-200/90 bg-amber-50 text-amber-900 dark:border-amber-900/90 dark:bg-amber-950/80 dark:text-amber-200",
  low: "border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
};
const FIELD_CLASS =
  "w-full rounded-lg border border-stone-300/80 bg-[#fffdf8] px-3 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#e45033] focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-[#e45033] dark:focus:ring-[#e45033]/20";
const SELECT_CLASS = FIELD_CLASS;
const SECONDARY_BUTTON_CLASS =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-stone-300/80 bg-[#fffdf8] px-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-100 dark:hover:border-stone-600 dark:hover:bg-stone-900";
const JOB_STATUSES = [
  { value: "new", label: "New" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "skipped", label: "Skipped" }
];
const TRACKED_STATUS_SHORTCUTS = JOB_STATUSES.filter((status) => status.value !== "new");
const STATUS_FILTERS = [{ value: "all", label: "All" }, ...TRACKED_STATUS_SHORTCUTS];

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

function buildSearchProfile(form) {
  return {
    target_roles: splitList(form.target_roles),
    skills: splitList(form.skills),
    keywords: splitList(form.keywords),
    avoid_keywords: splitList(form.avoid_keywords),
    location: form.location.trim(),
    work_mode: form.work_mode,
    experience_level: form.experience_level
  };
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
  const [jobCache, setJobCache] = useState(loadStoredJobCache);
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
  const cachedTrackedJobs = useMemo(
    () => getCachedTrackedJobs(jobCache, jobs, statusFilter),
    [jobCache, jobs, statusFilter]
  );
  const cachedVisibleJobs = useMemo(
    () => cachedTrackedJobs.filter((job) => job.scoring.score >= MIN_RELEVANCE_SCORE),
    [cachedTrackedJobs]
  );
  const cachedLowerMatchJobs = useMemo(
    () => cachedTrackedJobs.filter((job) => job.scoring.score < MIN_RELEVANCE_SCORE),
    [cachedTrackedJobs]
  );
  const visibleJobsToShow = useMemo(
    () => [...filteredVisibleJobs, ...cachedVisibleJobs],
    [filteredVisibleJobs, cachedVisibleJobs]
  );
  const lowerMatchJobsToShow = useMemo(
    () => [...filteredLowerMatchJobs, ...cachedLowerMatchJobs],
    [filteredLowerMatchJobs, cachedLowerMatchJobs]
  );
  const trackedStatusCounts = useMemo(
    () => getTrackedStatusCounts(jobs, jobStatuses, jobCache),
    [jobs, jobStatuses, jobCache]
  );
  const trackedStatusTotal = useMemo(
    () => TRACKED_STATUS_SHORTCUTS.reduce((total, shortcut) => total + (trackedStatusCounts[shortcut.value] || 0), 0),
    [trackedStatusCounts]
  );
  const sourceLabel = SOURCE_LABELS[form.source_type] || SOURCE_LABELS.realpython_fake_jobs;
  const isExploreMoreOpen = showExploreMore || visibleJobsToShow.length === 0;
  const filteredJobCount = visibleJobsToShow.length + lowerMatchJobsToShow.length;
  const selectedTrackedStatus = TRACKED_STATUS_SHORTCUTS.find((shortcut) => shortcut.value === statusFilter);
  const hasNoSelectedTrackedJobs = Boolean(selectedTrackedStatus) && filteredJobCount === 0;
  const resultSummary =
    status === "success"
      ? statusFilter !== "all"
        ? `${filteredJobCount} shown for ${getStatusLabel(statusFilter)} from local tracking.`
        : jobs.length === 0
          ? sourceInfo?.message || `${sourceLabel} returned no jobs for this search.`
          : `${visibleJobs.length} recommended matches${lowerMatchJobs.length ? `, ${lowerMatchJobs.length} more to explore` : ""}`
      : "Submit a profile to fetch and score jobs.";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("job-intel-theme", theme);
  }, [theme]);

  useEffect(() => {
    saveStoredJobStatuses(jobStatuses);
  }, [jobStatuses]);

  useEffect(() => {
    saveStoredJobCache(jobCache);
  }, [jobCache]);

  useEffect(() => {
    setJobCache((current) => cacheTrackedCurrentJobs(current, jobs, jobStatuses));
  }, [jobs, jobStatuses]);

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

    setJobCache((current) => updateStoredJobCache(current, job, nextStatus));
  }

  async function searchJobs(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setJobs([]);
    setSourceInfo(null);
    setShowExploreMore(false);
    setStatusFilter("all");

    const payload = {
      profile: buildSearchProfile(form),
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
    <main className="min-h-screen bg-[#eceae7] text-[#131311] transition-colors dark:bg-[#131311] dark:text-stone-100">
      <section className="border-b border-stone-200/80 bg-[#f7f5f1]/95 transition-colors dark:border-stone-800 dark:bg-[#181714]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e45033]/25 bg-[#e45033]/10 px-3 py-1 text-sm font-medium text-[#9f2f1f] dark:border-[#e45033]/35 dark:bg-[#e45033]/15 dark:text-[#ffb29f]">
              <Sparkles className="h-4 w-4" />
              Job Intelligence MVP
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-[#131311] sm:text-5xl dark:text-stone-50">
              Rank real scraped jobs against your search profile.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={SECONDARY_BUTTON_CLASS}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <div className="rounded-xl border border-stone-200/80 bg-[#fffdf8] px-4 py-3 text-sm text-stone-700 shadow-sm shadow-stone-200/50 dark:border-stone-800 dark:bg-[#181714] dark:text-stone-300 dark:shadow-none">
              Source: {sourceLabel}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[380px_1fr]">
        <form onSubmit={searchJobs} className="h-fit rounded-2xl border border-stone-200/80 bg-[#fbfaf7] p-5 shadow-sm shadow-stone-300/30 dark:border-stone-800 dark:bg-[#181714] dark:shadow-none">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#131311] text-white dark:bg-[#e45033] dark:text-white">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">Search Profile</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">Comma-separated roles, skills, and keywords.</p>
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
            <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Experience level</span>
            <select
              name="experience_level"
              value={form.experience_level}
              onChange={updateField}
              className={SELECT_CLASS}
            >
              <option value="any">Any</option>
              <option value="beginner">Beginner</option>
              <option value="junior">Junior</option>
              <option value="intermediate">Intermediate</option>
              <option value="senior">Senior</option>
            </select>
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Work mode</span>
            <select
              name="work_mode"
              value={form.work_mode}
              onChange={updateField}
              className={SELECT_CLASS}
            >
              <option value="any">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Source</span>
            <select
              name="source_type"
              value={form.source_type}
              onChange={updateField}
              className={SELECT_CLASS}
            >
              <option value="realpython_fake_jobs">Real Python Fake Jobs</option>
              <option value="remotive">Remotive</option>
              <option value="himalayas">Himalayas</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#131311] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-stone-300/50 transition hover:bg-[#2a2925] focus:outline-none focus:ring-2 focus:ring-[#e45033]/25 disabled:cursor-not-allowed disabled:bg-stone-400 disabled:shadow-none dark:bg-[#e45033] dark:text-white dark:shadow-none dark:hover:bg-[#f06447] dark:disabled:bg-stone-700 dark:disabled:text-stone-300"
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Find Jobs
          </button>
        </form>

        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">Ranked Results</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">{resultSummary}</p>
            </div>
          </div>
          {status === "success" && (jobs.length > 0 || trackedStatusTotal > 0) && (
            <StatusFilterChips
              counts={trackedStatusCounts}
              selectedStatus={statusFilter}
              onSelectStatus={setStatusFilter}
            />
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/80 dark:text-red-200">
              {error}
            </div>
          )}

          {status === "idle" && <EmptyState />}
          {status === "loading" && <LoadingState />}

          {status === "success" && (
            <>
              <div className="mb-4 rounded-xl border border-stone-200/80 bg-[#fbfaf7] px-4 py-3 text-sm text-stone-600 shadow-sm shadow-stone-300/20 dark:border-stone-800 dark:bg-[#181714] dark:text-stone-300 dark:shadow-none">
                {sourceInfo?.message || "Recommended is for first-pass decisions. Explore More keeps useful leads, stretches, and low-confidence roles available."}
              </div>
              {hasNoSelectedTrackedJobs ? (
                <TrackedEmptyState status={selectedTrackedStatus} />
              ) : visibleJobsToShow.length > 0 ? (
                <>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold uppercase text-stone-500 dark:text-stone-400">Recommended - apply or inspect first</h3>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      Stronger role alignment. Check red chips before applying.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {visibleJobsToShow.map((job) => (
                      <JobCard
                        key={job.id || getJobStatusKey(job)}
                        job={job}
                        profile={buildSearchProfile(form)}
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

              {!hasNoSelectedTrackedJobs && lowerMatchJobsToShow.length > 0 && (
                <section className="mt-6">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-stone-500 dark:text-stone-400">Explore More - inspect later</h3>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        Adjacent, stretch, restricted, or weak leads. Useful for review, not the first pass.
                      </p>
                    </div>
                    {visibleJobsToShow.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowExploreMore((current) => !current)}
                        className={SECONDARY_BUTTON_CLASS}
                        aria-expanded={isExploreMoreOpen}
                      >
                        {isExploreMoreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {isExploreMoreOpen ? "Hide" : "Show"} {lowerMatchJobsToShow.length}
                      </button>
                    )}
                  </div>

                  {isExploreMoreOpen && (
                    <div className="grid gap-4">
                      {lowerMatchJobsToShow.map((job) => (
                        <JobCard
                          key={job.id || getJobStatusKey(job)}
                          job={job}
                          profile={buildSearchProfile(form)}
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
      <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={FIELD_CLASS}
      />
      {helper && <span className="mt-1.5 block text-xs text-stone-500 dark:text-stone-400">{helper}</span>}
    </label>
  );
}

function StatusFilterChips({ counts, selectedStatus, onSelectStatus }) {
  return (
    <div className="mb-4 rounded-xl border border-stone-200/80 bg-[#fbfaf7] px-4 py-3 shadow-sm shadow-stone-300/20 dark:border-stone-800 dark:bg-[#181714] dark:shadow-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">Result view</div>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            All shows the current search. Tracked views include local saved jobs from previous searches.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((shortcut) => (
            <button
              key={shortcut.value}
              type="button"
              onClick={() => onSelectStatus(shortcut.value)}
              className={getTrackedShortcutClass(selectedStatus === shortcut.value)}
              aria-pressed={selectedStatus === shortcut.value}
            >
              {shortcut.label}
              {shortcut.value !== "all" && (
                <span className="ml-1.5 rounded-full bg-current/10 px-2 py-0.5 text-[11px] font-bold">
                  {counts[shortcut.value] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackedEmptyState({ status }) {
  const label = status?.label?.toLowerCase() || "tracked";

  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-[#fbfaf7] p-6 text-center shadow-sm shadow-stone-300/20 dark:border-stone-700 dark:bg-[#181714] dark:shadow-none">
      <BriefcaseBusiness className="mx-auto mb-3 h-9 w-9 text-stone-400 dark:text-stone-500" />
      <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
        No {label} jobs tracked locally.
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-stone-500 dark:text-stone-400">
        Track a job from any search and it will appear here until you reset it.
      </p>
    </div>
  );
}

function EmptyState({ title = "No search yet", message = "Your submitted profile drives scraping, scoring, reasons, and the final ranking." }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-[#fbfaf7] p-8 text-center shadow-sm shadow-stone-300/20 dark:border-stone-700 dark:bg-[#181714] dark:shadow-none">
      <div>
        <BriefcaseBusiness className="mx-auto mb-3 h-10 w-10 text-stone-400 dark:text-stone-500" />
        <h3 className="text-lg font-semibold text-stone-950 dark:text-stone-50">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-stone-500 dark:text-stone-400">{message}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-2xl border border-stone-200/80 bg-[#fbfaf7] p-5 shadow-sm shadow-stone-300/20 dark:border-stone-800 dark:bg-[#181714] dark:shadow-none">
          <div className="mb-4 h-5 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
          <div className="h-16 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        </div>
      ))}
    </div>
  );
}

function JobCard({ job, profile, variant = "recommended", status = "new", onStatusChange }) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [explanationStatus, setExplanationStatus] = useState("idle");
  const [explanationError, setExplanationError] = useState("");
  const [explanation, setExplanation] = useState(null);
  const [isExplanationCached, setIsExplanationCached] = useState(false);
  const decision = getDecisionSummary(job, variant);
  let scoreColor = "text-emerald-700 dark:text-emerald-300";

  if (decision.tone === "restricted") {
    scoreColor = "text-red-700 dark:text-red-300";
  } else if (decision.tone === "stretch") {
    scoreColor = "text-amber-700 dark:text-amber-300";
  } else if (variant === "lower") {
    scoreColor = "text-stone-600 dark:text-stone-300";
  }

  async function explainMatch() {
    if (explanation && explanationStatus === "success") {
      setIsExplanationOpen((current) => !current);
      return;
    }

    setIsExplanationOpen(true);
    setExplanationStatus("loading");
    setExplanationError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          job
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Explanation failed with status ${response.status}.`);
      }

      if (!isExplainResponse(data)) {
        throw new Error("Explanation response was not in the expected shape.");
      }

      setExplanation(data.explanation);
      setIsExplanationCached(Boolean(data.cached));
      setExplanationStatus("success");
    } catch (error) {
      setExplanationError(error.message);
      setExplanationStatus("error");
    }
  }

  return (
    <article className={`rounded-2xl border bg-[#fffdf8] p-5 shadow-sm shadow-stone-300/30 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-300/40 dark:bg-[#181714] dark:shadow-none dark:hover:border-stone-700 ${getCardBorderClass(decision.tone)}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {job.cached_tracking_only && (
              <span className="rounded-full border border-stone-300/80 bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                Previously tracked
              </span>
            )}
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${DECISION_BADGE_CLASSES[decision.tone]}`}>
              {decision.label}
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{decision.helper}</span>
          </div>
          <h3 className="text-xl font-semibold leading-7 text-stone-950 dark:text-stone-50">{job.title}</h3>
          <p className="mt-1 text-sm font-medium text-stone-700 dark:text-stone-300">{job.company}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {formatDisplayLocation(job.location) || "Location unavailable"}
            </span>
            <span>{job.source}</span>
            {job.salary && <span>{job.salary}</span>}
            {job.cached_tracking_only && <span>Not in current search results.</span>}
          </div>
        </div>
        <div className={`flex min-w-24 shrink-0 items-center justify-center rounded-xl border px-4 py-3 ${getScorePanelClass(decision.tone)}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${scoreColor}`}>{job.scoring.score}</div>
            <div className="text-xs font-medium uppercase text-stone-500 dark:text-stone-400">Score</div>
            <div className="mt-1 text-xs font-medium text-stone-600 dark:text-stone-300">
              {formatFitLabel(job.scoring.execution_likelihood)}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-700 dark:text-stone-300">{job.summary}</p>

      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">Why shown</div>
        <div className="flex flex-wrap gap-2.5">
          {getOrderedMatchReasons(job.scoring.match_reasons).map((reason) => (
            <span key={reason} className={getReasonChipClass(reason)}>
              {reason}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
            Current: {getStatusLabel(status)}
          </span>
          {JOB_STATUSES.filter((option) => option.value !== "new").map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange?.(job, option.value)}
              className={getStatusButtonClass(status, option.value)}
              aria-pressed={status === option.value}
            >
              {getStatusButtonLabel(status, option.value)}
            </button>
          ))}
          {status !== "new" && (
            <button
              type="button"
              onClick={() => onStatusChange?.(job, "new")}
              className="rounded-lg border border-stone-300/80 px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={explainMatch}
            disabled={explanationStatus === "loading"}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300/80 bg-[#fffdf8] px-3 py-2 text-sm font-semibold text-stone-900 transition hover:border-[#e45033]/50 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 disabled:cursor-not-allowed disabled:text-stone-400 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-100 dark:hover:border-[#e45033]/70 dark:hover:bg-stone-900 dark:disabled:text-stone-500"
            aria-expanded={isExplanationOpen}
          >
            {explanationStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Explain Match
          </button>

          {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300/80 bg-[#fffdf8] px-3 py-2 text-sm font-semibold text-stone-900 transition hover:border-[#e45033]/50 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-100 dark:hover:border-[#e45033]/70 dark:hover:bg-stone-900"
          >
            Open job
            <ArrowUpRight className="h-4 w-4" />
          </a>
          )}
        </div>
      </div>

      {isExplanationOpen && (
        <ExplanationPanel
          status={explanationStatus}
          error={explanationError}
          explanation={explanation}
          cached={isExplanationCached}
        />
      )}
    </article>
  );
}

function ExplanationPanel({ status, error, explanation, cached }) {
  return (
    <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-300">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-semibold text-stone-950 dark:text-stone-50">Match explanation</div>
        {cached && <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">Cached</div>}
      </div>
      <p className="mb-3 text-xs leading-5 text-stone-500 dark:text-stone-400">
        AI explains the visible scoring signals. It does not change the score or decide eligibility.
      </p>

      {status === "loading" && (
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing explanation...
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800 dark:border-red-900 dark:bg-red-950/70 dark:text-red-200">
          {error || "Unable to load explanation."}
        </div>
      )}

      {status === "success" && explanation && (
        <div className="space-y-4">
          <p className="leading-6">{explanation.summary}</p>
          <ExplanationList title="Strengths" items={explanation.strengths} />
          <ExplanationList title="Concerns" items={explanation.concerns} />
          <ExplanationList title="Verify before applying" items={explanation.verify_before_applying} />
          <div>
            <div className="mb-1 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">Decision support</div>
            <p className="leading-6">{explanation.decision_support}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ExplanationList({ title, items }) {
  if (!items.length) {
    return null;
  }

  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">{title}</div>
      <ul className="list-disc space-y-1 pl-5 leading-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function isExplainResponse(data) {
  const explanation = data?.explanation;

  return Boolean(
    explanation &&
    typeof explanation.summary === "string" &&
    Array.isArray(explanation.strengths) &&
    Array.isArray(explanation.concerns) &&
    Array.isArray(explanation.verify_before_applying) &&
    typeof explanation.decision_support === "string" &&
    typeof data.cached === "boolean"
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

function loadStoredJobCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(JOB_CACHE_STORAGE_KEY) || "{}");

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(([, job]) => isValidCachedJob(job))
    );
  } catch {
    return {};
  }
}

function saveStoredJobCache(jobCache) {
  try {
    localStorage.setItem(JOB_CACHE_STORAGE_KEY, JSON.stringify(jobCache));
  } catch {
    // Cached tracked jobs are a convenience layer; status storage remains the source of truth.
  }
}

function updateStoredJobCache(current, job, nextStatus) {
  const key = getJobStatusKey(job);

  if (!job?.id || key !== job.id) {
    return current;
  }

  const updated = { ...current };

  if (nextStatus === "new") {
    delete updated[key];
    return updated;
  }

  updated[key] = makeCachedJobRecord(job, nextStatus, new Date().toISOString());
  return updated;
}

function cacheTrackedCurrentJobs(current, jobs, jobStatuses) {
  let updated = current;

  for (const job of jobs) {
    const status = getJobStatus(job, jobStatuses);

    if (!job?.id || status === "new") {
      continue;
    }

    const nextRecord = makeCachedJobRecord(job, status, current[job.id]?.updated_at || new Date().toISOString());

    if (!cachedJobRecordsEqual(current[job.id], nextRecord)) {
      updated = updated === current ? { ...current } : updated;
      updated[job.id] = {
        ...nextRecord,
        updated_at: current[job.id]?.updated_at || nextRecord.updated_at
      };
    }
  }

  return updated;
}

function makeCachedJobRecord(job, status, updatedAt) {
  return {
    id: job.id,
    title: cleanDisplayText(job.title),
    company: cleanDisplayText(job.company),
    location: formatDisplayLocation(job.location),
    source: cleanDisplayText(job.source),
    score: Number.isFinite(job.scoring?.score) ? Math.round(job.scoring.score) : 0,
    status,
    updated_at: updatedAt
  };
}

function cachedJobRecordsEqual(current, next) {
  return Boolean(
    current &&
    current.id === next.id &&
    current.title === next.title &&
    current.company === next.company &&
    current.location === next.location &&
    current.source === next.source &&
    current.score === next.score &&
    current.status === next.status
  );
}

function isValidCachedJob(job) {
  return Boolean(
    job &&
    typeof job === "object" &&
    !Array.isArray(job) &&
    typeof job.id === "string" &&
    typeof job.title === "string" &&
    typeof job.company === "string" &&
    typeof job.source === "string" &&
    Number.isFinite(job.score) &&
    isKnownStatus(job.status) &&
    job.status !== "new"
  );
}

function getCachedTrackedJobs(jobCache, jobs, statusFilter) {
  if (!TRACKED_STATUS_SHORTCUTS.some((shortcut) => shortcut.value === statusFilter)) {
    return [];
  }

  const currentJobIds = new Set(jobs.map((job) => job.id).filter(Boolean));

  return Object.values(jobCache)
    .filter((job) => job.status === statusFilter && !currentJobIds.has(job.id))
    .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")))
    .map(makeCachedTrackedJob);
}

function makeCachedTrackedJob(cachedJob) {
  return {
    id: cachedJob.id,
    title: cachedJob.title,
    company: cachedJob.company,
    location: formatDisplayLocation(cachedJob.location),
    source: cachedJob.source,
    salary: null,
    url: null,
    summary: "This job was tracked locally and is not part of the current search results.",
    details: [],
    cached_tracking_only: true,
    cached_status: cachedJob.status,
    scoring: {
      score: cachedJob.score,
      match_reasons: ["Not in current search results"],
      execution_likelihood: "unclear",
      components: {
        role_match_score: 0,
        skill_match_score: 0,
        keyword_match_score: 0,
        seniority_match_score: 0,
        execution_likelihood_score: 0,
        location_workmode_score: 0,
        penalties: 0
      }
    }
  };
}

function filterJobsByStatus(jobs, statusFilter, jobStatuses) {
  if (statusFilter === "all") {
    return jobs;
  }

  return jobs.filter((job) => getJobStatus(job, jobStatuses) === statusFilter);
}

function getTrackedStatusCounts(jobs, jobStatuses, jobCache) {
  const currentJobIds = new Set(jobs.map((job) => job.id).filter(Boolean));

  return TRACKED_STATUS_SHORTCUTS.reduce((counts, shortcut) => {
    const currentCount = jobs.filter((job) => getJobStatus(job, jobStatuses) === shortcut.value).length;
    const cachedCount = Object.values(jobCache).filter(
      (job) => job.status === shortcut.value && !currentJobIds.has(job.id)
    ).length;

    counts[shortcut.value] = currentCount + cachedCount;
    return counts;
  }, {});
}

function getJobStatus(job, jobStatuses) {
  return jobStatuses[getJobStatusKey(job)] || job?.cached_status || "new";
}

function getJobStatusKey(job) {
  return job?.id || [job?.source, job?.title, job?.company, job?.location, job?.url].filter(Boolean).join("|");
}

function formatDisplayLocation(location) {
  const text = cleanDisplayText(location);
  const remoteTimezoneMatch = text.match(/^remote\s*\(([^)]*)\)$/i);

  if (!remoteTimezoneMatch) {
    return text;
  }

  const timezoneParts = remoteTimezoneMatch[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (timezoneParts.length && timezoneParts.every(isTimezoneOffsetDisplayPart)) {
    return "Remote";
  }

  return text;
}

function isTimezoneOffsetDisplayPart(part) {
  return /^[-+]?\d+(?:\.\d+)?$/.test(part) || part === "..." || part === "…";
}

function cleanDisplayText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isKnownStatus(status) {
  return JOB_STATUSES.some((option) => option.value === status);
}

function getStatusLabel(status) {
  return STATUS_FILTERS.find((option) => option.value === status)?.label || "Untracked";
}

function getStatusButtonClass(currentStatus, buttonStatus) {
  const isActive = currentStatus === buttonStatus;
  const baseClass = "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#e45033]/15";

  if (isActive) {
    return `${baseClass} border-[#131311] bg-[#131311] text-white dark:border-[#e45033] dark:bg-[#e45033] dark:text-white`;
  }

  return `${baseClass} border-stone-300/80 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900`;
}

function getTrackedShortcutClass(isActive) {
  const baseClass =
    "inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#e45033]/15";

  if (isActive) {
    return `${baseClass} border-[#131311] bg-[#131311] text-white dark:border-[#e45033] dark:bg-[#e45033] dark:text-white`;
  }

  return `${baseClass} border-stone-300/80 bg-[#fffdf8] text-stone-700 hover:border-[#e45033]/40 hover:bg-stone-100 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-300 dark:hover:border-[#e45033]/60 dark:hover:bg-stone-900`;
}

function getStatusButtonLabel(currentStatus, buttonStatus) {
  if (currentStatus === buttonStatus) {
    return getStatusLabel(buttonStatus);
  }

  return {
    saved: "Save",
    applied: "Mark applied",
    skipped: "Skip"
  }[buttonStatus] || getStatusLabel(buttonStatus);
}

function getDecisionSummary(job, variant) {
  const hasNegative = job.scoring.match_reasons.some((reason) => getReasonTone(reason) === "negative");
  const hasCaution = job.scoring.match_reasons.some((reason) => getReasonTone(reason) === "caution");
  const hasStrongRoleEvidence = hasDirectRoleEvidence(job);
  const fit = job.scoring.execution_likelihood;
  const isActionableFit = ["strong_fit", "possible_fit"].includes(fit) || job.scoring.score >= 60;
  const isRelevantBlocked = hasNegative && (hasStrongRoleEvidence || isActionableFit);

  if (isRelevantBlocked) {
    return {
      tone: "restricted",
      label: "Check eligibility",
      helper: "Relevant signals may be blocked"
    };
  }

  if (hasNegative && variant === "lower") {
    return {
      tone: "low",
      label: "Low priority",
      helper: "Restricted and weak match"
    };
  }

  if (hasNegative) {
    return {
      tone: "review",
      label: "Inspect later",
      helper: "Restriction may matter"
    };
  }

  if (fit === "strong_fit" || fit === "possible_fit") {
    return {
      tone: "apply",
      label: "Apply first",
      helper: hasCaution ? "Good fit with caveats" : "Best aligned"
    };
  }

  if (hasStrongRoleEvidence && job.scoring.score >= MIN_RELEVANCE_SCORE) {
    const isApplyFirst = job.scoring.score >= 45;

    return {
      tone: isApplyFirst ? "apply" : "review",
      label: isApplyFirst ? "Apply first" : "Inspect first",
      helper: "Direct role match"
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

function hasDirectRoleEvidence(job) {
  return job.scoring.match_reasons.some((reason) => {
    const normalized = reason.toLowerCase();
    return (
      normalized.includes("direct target role match") ||
      normalized.includes("role is central to the title") ||
      normalized.includes("support is visible in the role title") ||
      normalized.includes("role title overlaps with your target") ||
      normalized.includes("job category overlaps with your target role")
    );
  });
}

function getCardBorderClass(tone) {
  return {
    apply: "border-stone-200/80 dark:border-stone-800",
    review: "border-stone-200/80 dark:border-stone-800",
    restricted: "border-red-200/90 dark:border-red-900/90",
    stretch: "border-amber-200/90 dark:border-amber-900/90",
    low: "border-stone-200/80 opacity-95 dark:border-stone-800"
  }[tone] || "border-stone-200/80 dark:border-stone-800";
}

function getScorePanelClass(tone) {
  return {
    apply: "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/80 dark:bg-emerald-950/60",
    review: "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900",
    restricted: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/70",
    stretch: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/70",
    low: "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-950"
  }[tone] || "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-950";
}

function getReasonChipClass(reason) {
  return REASON_CHIP_CLASSES[getReasonTone(reason)];
}

function getOrderedMatchReasons(reasons) {
  const toneOrder = {
    positive: 0,
    caution: 1,
    negative: 2
  };

  return [...reasons]
    .map((reason, index) => ({ reason, index, tone: getReasonTone(reason) }))
    .sort((a, b) => toneOrder[a.tone] - toneOrder[b.tone] || a.index - b.index)
    .map(({ reason }) => reason);
}

function getReasonTone(reason) {
  const normalized = reason.toLowerCase();

  if (
    normalized.includes("restricted") ||
    normalized.includes("outside preferred location") ||
    normalized.includes("avoid keyword") ||
    normalized.includes("avoided keyword") ||
    normalized.includes("penalty") ||
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
