import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, ChevronUp, Loader2, MapPin, Moon, Search, Sparkles, Sun } from "lucide-react";
import "./styles.css";

const MIN_RELEVANCE_SCORE = 25;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TECH_ALIASES = {
  "java script": "javascript",
  "node js": "node.js",
  nodejs: "node.js",
  "react js": "react",
  "type script": "typescript"
};

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
  const [form, setForm] = useState(initialForm);
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("job-intel-theme") || "light");
  const [showExploreMore, setShowExploreMore] = useState(false);

  const visibleJobs = useMemo(() => jobs.filter((job) => job.scoring.score >= MIN_RELEVANCE_SCORE), [jobs]);
  const lowerMatchJobs = useMemo(() => jobs.filter((job) => job.scoring.score < MIN_RELEVANCE_SCORE), [jobs]);
  const sourceLabel = form.source_type === "remotive" ? "Remotive" : "Real Python Fake Jobs";
  const isExploreMoreOpen = showExploreMore || visibleJobs.length === 0;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("job-intel-theme", theme);
  }, [theme]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  async function searchJobs(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setJobs([]);
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

      if (!response.ok) {
        throw new Error(data.error || `Search failed with status ${response.status}.`);
      }

      setJobs(data.jobs || []);
      setStatus("success");
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
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {status === "success"
                  ? `${visibleJobs.length} recommended matches${lowerMatchJobs.length ? `, ${lowerMatchJobs.length} more to explore` : ""}`
                  : "Submit a profile to fetch and score jobs."}
              </p>
            </div>
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
                These are the clearest matches from the current profile. Explore More keeps adjacent and lower-confidence roles available for review.
              </div>
              {visibleJobs.length > 0 ? (
                <>
                  <h3 className="mb-3 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">Recommended Matches</h3>
                  <div className="grid gap-4">
                    {visibleJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No recommended matches"
                  message="Explore More is open below. Try broadening target roles, trimming avoid keywords, or using simpler skill terms if the list feels too narrow."
                />
              )}

              {lowerMatchJobs.length > 0 && (
                <section className="mt-6">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">Explore More</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Adjacent, stretch, and lower-confidence roles that may still be useful to inspect.
                      </p>
                    </div>
                    {visibleJobs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowExploreMore((current) => !current)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                        aria-expanded={isExploreMoreOpen}
                      >
                        {isExploreMoreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {isExploreMoreOpen ? "Hide" : "Show"} {lowerMatchJobs.length}
                      </button>
                    )}
                  </div>

                  {isExploreMoreOpen && (
                    <div className="grid gap-4">
                      {lowerMatchJobs.map((job) => (
                        <JobCard key={job.id} job={job} variant="lower" />
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

function JobCard({ job, variant = "recommended" }) {
  const scoreColor =
    variant === "lower" ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{job.title}</h3>
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
        <div className="flex min-w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
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

      {job.details?.length > 0 && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          {job.details.slice(0, 4).map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {job.scoring.match_reasons.map((reason) => (
          <span key={reason} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {reason}
          </span>
        ))}
      </div>

      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-950 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:border-emerald-400 dark:hover:bg-slate-950"
        >
          Open job
          <ArrowUpRight className="h-4 w-4" />
        </a>
      )}
    </article>
  );
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
