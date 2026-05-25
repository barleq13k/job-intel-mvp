import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertTriangle, ArrowUpRight, BriefcaseBusiness, CheckCircle2, ChevronDown, ChevronUp, Loader2, MapPin, Moon, Search, SlidersHorizontal, Sparkles, Sun, X } from "lucide-react";
import "./styles.css";
import onboardingSupportImageSrc from "../../images/job-intel-hero-img.webp";

const MIN_RELEVANCE_SCORE = 25;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TRACKER_STORAGE_KEY = "job-intel-application-statuses";
const JOB_CACHE_STORAGE_KEY = "job-intel-job-cache";
const LAST_SEARCH_PROFILE_KEY = "job-intel-last-search-profile";
const LAST_SEARCH_RESULTS_KEY = "job-intel-last-search-results";
const FILTER_PANEL_COLLAPSED_KEY = "job-intel-filter-panel-collapsed";
const ONBOARDING_HIDDEN_KEY = "job-intel-onboarding-hidden";
const FIRST_RUN_ONBOARDING_COMPLETE_KEY = "job-intel-first-run-onboarding-complete";
const MANUAL_LISTING_MIN_CHARS = 80;
const MANUAL_LISTING_MIN_WORDS = 12;
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
  himalayas: "Himalayas",
  remoteok: "RemoteOK",
  weworkremotely: "We Work Remotely",
  arbeitnow: "Arbeitnow"
};
const SOURCE_DESCRIPTIONS = {
  himalayas: "Best for real remote job listings.",
  remotive: "Smaller public remote-job source.",
  remoteok: "Broader remote listings; quality may vary.",
  weworkremotely: "Experimental Customer Support RSS feed.",
  realpython_fake_jobs: "Demo/testing source, not real jobs."
};
const VISIBLE_SOURCE_OPTIONS = [
  { value: "realpython_fake_jobs", label: SOURCE_LABELS.realpython_fake_jobs },
  { value: "remotive", label: SOURCE_LABELS.remotive },
  { value: "himalayas", label: SOURCE_LABELS.himalayas },
  { value: "remoteok", label: SOURCE_LABELS.remoteok },
  { value: "weworkremotely", label: SOURCE_LABELS.weworkremotely }
];
const STARTER_PATHS = [
  {
    label: "Beginner VA / Admin Support",
    helper: "Admin, data entry, documentation, and assistant work.",
    form: {
      target_roles: "virtual assistant, admin assistant, operations assistant",
      skills: "data entry, email support, spreadsheets, documentation",
      keywords: "remote, assistant, admin, entry level",
      avoid_keywords: "senior, manager, executive, onsite",
      location: "Philippines",
      work_mode: "remote",
      experience_level: "beginner",
      source_type: "himalayas"
    }
  },
  {
    label: "Customer Support",
    helper: "Email, chat, and customer service support roles.",
    form: {
      target_roles: "customer support, customer service, support specialist",
      skills: "customer support, email support, chat support, documentation",
      keywords: "remote, support, entry level, customer",
      avoid_keywords: "senior, manager, onsite",
      location: "Philippines",
      work_mode: "remote",
      experience_level: "beginner",
      source_type: "himalayas"
    }
  },
  {
    label: "Technical Support",
    helper: "Troubleshooting, product support, and software support.",
    form: {
      target_roles: "technical support, support engineer, product support",
      skills: "troubleshooting, customer support, documentation, software support",
      keywords: "remote, support, technical support, junior",
      avoid_keywords: "senior, lead, architect, onsite",
      location: "Philippines",
      work_mode: "remote",
      experience_level: "junior",
      source_type: "himalayas"
    }
  },
  {
    label: "QA / Testing",
    helper: "Manual QA, test cases, bug reports, and junior testing.",
    form: {
      target_roles: "QA tester, manual QA tester, software tester",
      skills: "QA testing, test cases, bug reports, documentation",
      keywords: "remote, QA, tester, junior",
      avoid_keywords: "senior, lead, architect, onsite",
      location: "Philippines",
      work_mode: "remote",
      experience_level: "junior",
      source_type: "himalayas"
    }
  },
  {
    label: "Remote Operations Support",
    helper: "Process support, documentation, and operations coordination.",
    form: {
      target_roles: "operations assistant, operations support, remote operations",
      skills: "spreadsheets, documentation, process support, customer support",
      keywords: "remote, operations, assistant, support",
      avoid_keywords: "senior, manager, director, onsite",
      location: "Philippines",
      work_mode: "remote",
      experience_level: "junior",
      source_type: "himalayas"
    }
  }
];
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
const ELIGIBILITY_SIGNAL_CLASSES = {
  eligible:
    "border-emerald-200/90 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/50 dark:text-emerald-200",
  caution:
    "border-amber-200/90 bg-amber-50/70 text-amber-900 dark:border-amber-900/80 dark:bg-amber-950/50 dark:text-amber-200",
  blocked:
    "border-red-200/90 bg-red-50/70 text-red-900 dark:border-red-900/80 dark:bg-red-950/55 dark:text-red-200"
};
const DECISION_HELPERS = {
  apply: "Strong enough to prioritize.",
  inspect: "Potentially relevant, but check eligibility, requirements, or red flags before applying.",
  low: "Probably not worth prioritizing right now."
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
const CUSTOM_STARTER_PATH_VALUE = "custom";
const SETUP_GUIDE_AVOID_OPTIONS = [
  {
    value: "senior",
    label: "Senior or management-heavy roles",
    terms: ["senior", "manager", "lead"]
  },
  {
    value: "onsite",
    label: "Onsite or location-mismatched roles",
    terms: ["onsite"]
  },
  {
    value: "payment",
    label: "Payment-required listings",
    terms: ["paid training", "top up", "recharge"]
  },
  {
    value: "unpaid",
    label: "Commission-only or unpaid work",
    terms: ["commission only", "unpaid"]
  }
];

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

const initialManualJob = {
  title: "",
  company: "",
  location: "",
  url: "",
  description: ""
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

function validateManualJobInput(job) {
  const title = cleanDisplayText(job.title);
  const description = cleanDisplayText(job.description);
  const errors = {};

  if (!title) {
    errors.title = "Add a job title before evaluating.";
  }

  if (!description) {
    errors.description = "Paste the job listing before evaluating.";
  } else if (description.length < MANUAL_LISTING_MIN_CHARS || getUsefulWordCount(description) < MANUAL_LISTING_MIN_WORDS) {
    errors.description = "Paste more of the job description so the score has enough signal.";
  }

  const normalizedUrl = normalizeOptionalManualUrl(job.url);
  const hasInvalidUrl = cleanDisplayText(job.url) && !normalizedUrl;
  const note = hasInvalidUrl ? "That URL was not used. You can still evaluate the listing." : "";

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    note,
    url: normalizedUrl || "",
    message: errors.title || errors.description || ""
  };
}

function getUsefulWordCount(value) {
  return cleanDisplayText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length >= 2).length;
}

function normalizeOptionalManualUrl(value) {
  const text = cleanDisplayText(value);

  if (!text) {
    return "";
  }

  try {
    const url = new URL(text);

    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function getEvaluationErrorMessage(data, statusCode) {
  const codeMessages = {
    manual_title_required: "Add a job title before evaluating.",
    manual_description_required: "Paste the job listing before evaluating.",
    manual_description_too_short: "Paste more of the job description so the score has enough signal.",
    manual_payload_too_large: "This listing is too large to evaluate. Try pasting the main responsibilities and requirements."
  };

  if (data?.code && codeMessages[data.code]) {
    return codeMessages[data.code];
  }

  if (statusCode === 413) {
    return codeMessages.manual_payload_too_large;
  }

  const backendMessage = cleanDisplayText(data?.error || data?.source?.message);

  if (backendMessage) {
    return backendMessage;
  }

  return `Evaluation failed with status ${statusCode}.`;
}

function getNetworkAwareErrorMessage(error, action) {
  const message = cleanDisplayText(error?.message);

  if (message === "Failed to fetch" || message === "NetworkError when attempting to fetch resource.") {
    return action === "evaluation"
      ? "Could not reach the evaluation service. Check that the Worker is running, then try again."
      : "Could not reach the job search service. Check that the Worker is running, then try again.";
  }

  return message || "Something went wrong. Please try again.";
}

function App() {
  const [restoredSearch] = useState(loadStoredSearchResults);
  const [form, setForm] = useState(() => loadStoredSearchProfile() || initialForm);
  const [workflowMode, setWorkflowMode] = useState(() => (restoredSearch?.sourceInfo?.type === "manual" ? "evaluate" : "search"));
  const [manualJob, setManualJob] = useState(initialManualJob);
  const [manualValidation, setManualValidation] = useState({ errors: {}, note: "" });
  const [jobs, setJobs] = useState(() => restoredSearch?.jobs || []);
  const [status, setStatus] = useState(() => (restoredSearch ? "success" : "idle"));
  const [error, setError] = useState("");
  const [sourceInfo, setSourceInfo] = useState(() => restoredSearch?.sourceInfo || null);
  const [theme, setTheme] = useState(() => localStorage.getItem("job-intel-theme") || "light");
  const [isOnboardingHidden, setIsOnboardingHidden] = useState(loadStoredOnboardingHidden);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(() => !loadStoredFirstRunOnboardingComplete());
  const [showExploreMore, setShowExploreMore] = useState(false);
  const [jobStatuses, setJobStatuses] = useState(loadStoredJobStatuses);
  const [jobCache, setJobCache] = useState(loadStoredJobCache);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(loadStoredFilterPanelCollapsed);
  const [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);
  const floatingFilterButtonRef = useRef(null);
  const firstFilterFieldRef = useRef(null);

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
  const activeSourceLabel = workflowMode === "evaluate" ? "Manual Paste" : sourceLabel;
  const isExploreMoreOpen = showExploreMore || visibleJobsToShow.length === 0;
  const filteredJobCount = visibleJobsToShow.length + lowerMatchJobsToShow.length;
  const selectedTrackedStatus = TRACKED_STATUS_SHORTCUTS.find((shortcut) => shortcut.value === statusFilter);
  const hasNoSelectedTrackedJobs = Boolean(selectedTrackedStatus) && filteredJobCount === 0;
  const resultBucketSummary = status === "success" && statusFilter === "all" && jobs.length > 0
    ? {
        total: `${jobs.length} jobs found`,
        buckets: `${visibleJobs.length} Start Here · ${lowerMatchJobs.length} Explore More`
      }
    : null;
  const resultSummary =
    status === "success"
      ? statusFilter !== "all"
        ? `${filteredJobCount} shown for ${getStatusLabel(statusFilter)} from local tracking.`
        : jobs.length === 0
          ? sourceInfo?.message || `${sourceLabel} returned no jobs for this search.`
          : resultBucketSummary.total
      : "Fill the search form to fetch and score jobs.";

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

  useEffect(() => {
    saveStoredFilterPanelCollapsed(isFilterPanelCollapsed);
  }, [isFilterPanelCollapsed]);

  useEffect(() => {
    if (!isFilterPanelCollapsed) {
      setIsFilterOverlayOpen(false);
    }
  }, [isFilterPanelCollapsed]);

  useEffect(() => {
    if (!isFilterOverlayOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeFilterOverlay();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterOverlayOpen]);

  useEffect(() => {
    if (isFilterOverlayOpen) {
      window.requestAnimationFrame(() => firstFilterFieldRef.current?.focus());
    }
  }, [isFilterOverlayOpen]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateManualJobField(event) {
    const { name, value } = event.target;
    setManualJob((current) => ({ ...current, [name]: value }));
    setManualValidation((current) => ({
      errors: Object.fromEntries(Object.entries(current.errors || {}).filter(([field]) => field !== name)),
      note: name === "url" ? "" : current.note
    }));
  }

  function applyStarterPath(starterPath) {
    setForm((current) => ({ ...current, ...starterPath.form }));
  }

  function openSetupGuide() {
    setIsSetupGuideOpen(true);
  }

  function skipSetupGuide() {
    saveStoredFirstRunOnboardingComplete("skipped");
    setIsSetupGuideOpen(false);
  }

  function completeSetupGuide(formPatch) {
    setForm((current) => ({ ...current, ...formPatch }));
    saveStoredFirstRunOnboardingComplete("true");
    setIsSetupGuideOpen(false);
  }

  function hideOnboarding() {
    setIsOnboardingHidden(true);
    saveStoredOnboardingHidden(true);
  }

  function showOnboarding() {
    setIsOnboardingHidden(false);
    saveStoredOnboardingHidden(false);
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  function collapseFilterPanel() {
    setIsFilterPanelCollapsed(true);
    setIsFilterOverlayOpen(false);
  }

  function openFilterOverlay() {
    setIsFilterOverlayOpen(true);
  }

  function closeFilterOverlay() {
    setIsFilterOverlayOpen(false);
    window.requestAnimationFrame(() => floatingFilterButtonRef.current?.focus());
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

  async function evaluateManualJob(event) {
    event.preventDefault();
    const validation = validateManualJobInput(manualJob);
    setManualValidation(validation);

    if (!validation.ok) {
      setError(validation.message);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");
    setJobs([]);
    setSourceInfo(null);
    setShowExploreMore(false);
    setStatusFilter("all");

    const payload = {
      profile: buildSearchProfile(form),
      job: {
        ...manualJob,
        url: validation.url
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      const nextSourceInfo = data.source || null;
      setSourceInfo(nextSourceInfo);

      if (!response.ok) {
        throw new Error(getEvaluationErrorMessage(data, response.status));
      }

      const nextJobs = Array.isArray(data.jobs) ? data.jobs : [];
      setJobs(nextJobs);
      setStatus("success");
      saveStoredSearchProfile(form);
      saveStoredSearchResults({
        jobs: nextJobs,
        sourceInfo: nextSourceInfo
      });
    } catch (evaluationError) {
      setError(getNetworkAwareErrorMessage(evaluationError, "evaluation"));
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
              Job Intel
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-[#131311] sm:text-5xl dark:text-stone-50">
              Compare remote jobs against your search setup.
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openSetupGuide}
              className={SECONDARY_BUTTON_CLASS}
            >
              <Sparkles className="h-4 w-4" />
              Setup guide
            </button>
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
              Source: {activeSourceLabel}
            </div>
          </div>
        </div>
      </section>

      {isOnboardingHidden ? (
        <IntroReopenPanel onShow={showOnboarding} />
      ) : (
        <OnboardingPanel onDismiss={hideOnboarding} onOpenSetupGuide={openSetupGuide} />
      )}

      {isSetupGuideOpen && (
        <SetupGuideModal
          onComplete={completeSetupGuide}
          onSkip={skipSetupGuide}
        />
      )}

      <div className={`mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 ${isFilterPanelCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-[380px_1fr]"}`}>
        {!isFilterPanelCollapsed && (
          <SearchProfileForm
            id="search-profile-panel"
            titleId="search-profile-panel-title"
            form={form}
            mode={workflowMode}
            manualJob={manualJob}
            manualValidation={manualValidation}
            status={status}
            onFieldChange={updateField}
            onManualJobChange={updateManualJobField}
            onModeChange={setWorkflowMode}
            onSelectStarterPath={applyStarterPath}
            onSubmit={workflowMode === "evaluate" ? evaluateManualJob : searchJobs}
            onCollapse={collapseFilterPanel}
            firstFieldRef={firstFilterFieldRef}
          />
        )}

        <section className="min-w-0">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">Ranked Results</h2>
              {resultBucketSummary ? (
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  <p>{resultBucketSummary.total}</p>
                  <p className="mt-0.5 text-xs">{resultBucketSummary.buckets}</p>
                </div>
              ) : (
                <p className="text-sm text-stone-500 dark:text-stone-400">{resultSummary}</p>
              )}
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Score guide: use the score to decide whether a job is worth your effort before applying.
                70+ is strong, 50-69 is possible, and below 50 needs careful review.
              </p>
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
                {sourceInfo?.message || "These are the strongest matches from this search. Use the decision label and reason chips before spending application effort. Explore More keeps adjacent, restricted, and lower-confidence leads available."}
              </div>
              {hasNoSelectedTrackedJobs ? (
                <TrackedEmptyState status={selectedTrackedStatus} />
              ) : visibleJobsToShow.length > 0 ? (
                <>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold uppercase text-stone-500 dark:text-stone-400">Recommended - start here</h3>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      Best available matches from this search. Scores in this section can still be possible fits, so check the decision label and reason chips before applying.
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
                  title={jobs.length === 0 ? "No jobs returned" : "No Start Here matches"}
                  message={
                    jobs.length === 0
                      ? sourceInfo?.message || "The selected source returned no usable jobs for this profile."
                      : statusFilter !== "all"
                        ? `No Start Here matches with ${getStatusLabel(statusFilter)} status. Try another status filter or Explore More.`
                      : "Explore More is open below with adjacent, restricted, and lower-confidence leads."
                  }
                />
              )}

              {!hasNoSelectedTrackedJobs && lowerMatchJobsToShow.length > 0 && (
                <section className="mt-6">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-stone-500 dark:text-stone-400">Explore More - lower priority</h3>
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                        Adjacent, stretch, restricted, or weak leads. Useful after reviewing the Start Here list.
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

      {isFilterPanelCollapsed && (
        <button
          ref={floatingFilterButtonRef}
          type="button"
          onClick={openFilterOverlay}
          className="fixed bottom-5 right-5 z-20 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300/80 bg-[#fffdf8] px-4 text-sm font-semibold text-stone-900 shadow-lg shadow-stone-500/20 transition hover:border-[#e45033]/50 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/20 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-100 dark:shadow-black/30 dark:hover:border-[#e45033]/70 dark:hover:bg-stone-900"
          aria-expanded={isFilterOverlayOpen}
          aria-controls="search-profile-overlay"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      )}

      {isFilterPanelCollapsed && isFilterOverlayOpen && (
        <div
          id="search-profile-overlay"
          role="dialog"
          aria-modal="false"
          aria-labelledby="search-profile-overlay-title"
          className="fixed inset-x-0 bottom-0 z-30 p-3 lg:inset-y-0 lg:left-0 lg:right-auto lg:flex lg:w-[420px] lg:items-stretch lg:p-4"
        >
          <SearchProfileForm
            id="search-profile-overlay-form"
            titleId="search-profile-overlay-title"
            form={form}
            mode={workflowMode}
            manualJob={manualJob}
            manualValidation={manualValidation}
            status={status}
            onFieldChange={updateField}
            onManualJobChange={updateManualJobField}
            onModeChange={setWorkflowMode}
            onSelectStarterPath={applyStarterPath}
            onSubmit={workflowMode === "evaluate" ? evaluateManualJob : searchJobs}
            onClose={closeFilterOverlay}
            variant="overlay"
            firstFieldRef={firstFilterFieldRef}
          />
        </div>
      )}
    </main>
  );
}

function SetupGuideModal({ onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [selectedPathValue, setSelectedPathValue] = useState(STARTER_PATHS[0].label);
  const [customRole, setCustomRole] = useState("");
  const [skills, setSkills] = useState(STARTER_PATHS[0].form.skills);
  const [keywords, setKeywords] = useState(STARTER_PATHS[0].form.keywords);
  const [experienceLevel, setExperienceLevel] = useState(STARTER_PATHS[0].form.experience_level);
  const [location, setLocation] = useState(STARTER_PATHS[0].form.location);
  const [avoidChoices, setAvoidChoices] = useState(["senior", "onsite"]);
  const selectedPath = STARTER_PATHS.find((starterPath) => starterPath.label === selectedPathValue);
  const isCustomPath = selectedPathValue === CUSTOM_STARTER_PATH_VALUE;
  const canContinueFromStepOne = !isCustomPath || Boolean(cleanDisplayText(customRole));

  function selectPath(value) {
    setSelectedPathValue(value);

    const nextPath = STARTER_PATHS.find((starterPath) => starterPath.label === value);

    if (nextPath) {
      setSkills(nextPath.form.skills);
      setKeywords(nextPath.form.keywords);
      setExperienceLevel(nextPath.form.experience_level);
      setLocation(nextPath.form.location);
    } else {
      setSkills("");
      setKeywords("");
    }
  }

  function toggleAvoidChoice(value) {
    setAvoidChoices((current) =>
      current.includes(value)
        ? current.filter((choice) => choice !== value)
        : [...current, value]
    );
  }

  function finishSetupGuide() {
    const avoidKeywords = SETUP_GUIDE_AVOID_OPTIONS
      .filter((option) => avoidChoices.includes(option.value))
      .flatMap((option) => option.terms)
      .join(", ");
    const baseForm = selectedPath
      ? {
          ...selectedPath.form,
          skills: cleanDisplayText(skills),
          keywords: cleanDisplayText(keywords)
        }
      : {
          target_roles: cleanDisplayText(customRole),
          skills: cleanDisplayText(skills),
          keywords: cleanDisplayText(keywords),
          source_type: "himalayas"
        };

    onComplete({
      ...baseForm,
      avoid_keywords: avoidKeywords,
      location: cleanDisplayText(location),
      work_mode: "remote",
      experience_level: experienceLevel
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/55 px-4 py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-guide-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-stone-200 bg-[#fbfaf7] shadow-2xl shadow-stone-900/30 dark:border-stone-800 dark:bg-[#181714]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200/80 p-5 dark:border-stone-800">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#e45033]/25 bg-[#e45033]/10 px-3 py-1 text-xs font-semibold text-[#9f2f1f] dark:border-[#e45033]/35 dark:bg-[#e45033]/15 dark:text-[#ffb29f]">
              <Sparkles className="h-3.5 w-3.5" />
              Setup guide
            </div>
            <h2 id="setup-guide-title" className="text-xl font-semibold text-stone-950 dark:text-stone-50">
              Set up your first remote-job search
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
              This only fills the search form. You can edit everything before searching.
            </p>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-300/80 bg-[#fffdf8] text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-200 dark:hover:border-stone-600 dark:hover:bg-stone-900"
            aria-label="Close setup guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-5">
          <div className="mb-5 flex items-center gap-2" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`h-2 flex-1 rounded-full ${stepNumber <= step ? "bg-[#e45033]" : "bg-stone-200 dark:bg-stone-800"}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-stone-950 dark:text-stone-50">What kind of remote role are you looking for?</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Pick a starting lane. This fills role, skill, and keyword fields you can edit before searching.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {STARTER_PATHS.map((starterPath) => (
                  <button
                    key={starterPath.label}
                    type="button"
                    onClick={() => selectPath(starterPath.label)}
                    className={`rounded-xl border p-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 ${
                      selectedPathValue === starterPath.label
                        ? "border-[#e45033]/70 bg-[#e45033]/10 text-stone-950 dark:border-[#e45033] dark:bg-[#e45033]/15 dark:text-stone-50"
                        : "border-stone-200/80 bg-[#fffdf8] text-stone-700 hover:border-[#e45033]/40 dark:border-stone-800 dark:bg-stone-950/20 dark:text-stone-200 dark:hover:border-[#e45033]/60"
                    }`}
                    aria-pressed={selectedPathValue === starterPath.label}
                  >
                    <span className="block font-semibold">{starterPath.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-stone-500 dark:text-stone-400">{starterPath.helper}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => selectPath(CUSTOM_STARTER_PATH_VALUE)}
                className={`mt-3 w-full rounded-xl border p-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 ${
                  isCustomPath
                    ? "border-[#e45033]/70 bg-[#e45033]/10 text-stone-950 dark:border-[#e45033] dark:bg-[#e45033]/15 dark:text-stone-50"
                    : "border-stone-200/80 bg-[#fffdf8] text-stone-700 hover:border-[#e45033]/40 dark:border-stone-800 dark:bg-stone-950/20 dark:text-stone-200 dark:hover:border-[#e45033]/60"
                }`}
                aria-pressed={isCustomPath}
              >
                <span className="block font-semibold">I'll type my own</span>
                <span className="mt-1 block text-xs leading-5 text-stone-500 dark:text-stone-400">Use your own role words in the search form.</span>
              </button>
              {isCustomPath && (
                <label className="mt-3 block">
                  <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Role words</span>
                  <input
                    value={customRole}
                    onChange={(event) => setCustomRole(event.target.value)}
                    placeholder="data entry, appointment setter, junior designer"
                    className={FIELD_CLASS}
                  />
                </label>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold text-stone-950 dark:text-stone-50">What should Job Intel match against?</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Add the tools, skills, and search terms you want reflected in the search setup.
              </p>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Skills and tools</span>
                <input
                  value={skills}
                  onChange={(event) => setSkills(event.target.value)}
                  placeholder="spreadsheets, email support, Zendesk, Python"
                  className={FIELD_CLASS}
                />
                <span className="mt-1.5 block text-xs text-stone-500 dark:text-stone-400">
                  Fills the Skills field. Use comma-separated items.
                </span>
              </label>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Keywords / search terms</span>
                <input
                  value={keywords}
                  onChange={(event) => setKeywords(event.target.value)}
                  placeholder="remote, entry level, chat support"
                  className={FIELD_CLASS}
                />
                <span className="mt-1.5 block text-xs text-stone-500 dark:text-stone-400">
                  Fills the Keywords field. Use terms you would search for.
                </span>
              </label>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Experience level</span>
                <select
                  value={experienceLevel}
                  onChange={(event) => setExperienceLevel(event.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="beginner">Beginner</option>
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="senior">Senior</option>
                  <option value="any">Any</option>
                </select>
              </label>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Location to check against</span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Philippines, Worldwide, US, Europe, No preference"
                  className={FIELD_CLASS}
                />
                <span className="mt-1.5 block text-xs text-stone-500 dark:text-stone-400">
                  Remote jobs can still be limited by country, region, or work authorization.
                </span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-stone-950 dark:text-stone-50">What should Job Intel avoid or flag?</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Selected items fill the Avoid keywords field. You can edit them before searching.
              </p>
              <div className="mt-4 grid gap-2">
                {SETUP_GUIDE_AVOID_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-[#fffdf8] p-3 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-950/20 dark:text-stone-200"
                  >
                    <input
                      type="checkbox"
                      checked={avoidChoices.includes(option.value)}
                      onChange={() => toggleAvoidChoice(option.value)}
                      className="mt-1 h-4 w-4 accent-[#e45033]"
                    />
                    <span>
                      <span className="block font-semibold text-stone-950 dark:text-stone-50">{option.label}</span>
                      <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
                        Adds: {option.terms.join(", ")}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-stone-200/80 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800">
          <div className={`order-1 grid w-full gap-2 ${step > 1 ? "grid-cols-2" : "grid-cols-1"} sm:order-2 sm:w-auto sm:grid-cols-none sm:flex sm:justify-end`}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className={`${SECONDARY_BUTTON_CLASS} w-full sm:w-auto`}
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                disabled={!canContinueFromStepOne}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#131311] px-4 text-sm font-semibold text-white transition hover:bg-[#2a2925] focus:outline-none focus:ring-2 focus:ring-[#e45033]/25 disabled:cursor-not-allowed disabled:bg-stone-400 dark:bg-[#e45033] dark:hover:bg-[#f06447] dark:disabled:bg-stone-700 dark:disabled:text-stone-300 sm:w-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={finishSetupGuide}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#131311] px-4 text-sm font-semibold text-white transition hover:bg-[#2a2925] focus:outline-none focus:ring-2 focus:ring-[#e45033]/25 dark:bg-[#e45033] dark:hover:bg-[#f06447] sm:w-auto"
              >
                Fill search form
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="order-2 inline-flex h-10 w-full items-center justify-center rounded-lg px-3 text-sm font-semibold text-stone-600 transition hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:text-stone-300 dark:hover:text-stone-50 sm:order-1 sm:w-auto sm:justify-start"
          >
            Skip for now
          </button>
        </div>
      </section>
    </div>
  );
}

function IntroReopenPanel({ onShow }) {
  return (
    <section className="border-b border-stone-200/80 bg-[#f7f5f1]/80 transition-colors dark:border-stone-800 dark:bg-[#181714]/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm text-stone-600 dark:text-stone-300">Intro hidden. Setup guide is still available separately.</p>
        <button
          type="button"
          onClick={onShow}
          className={`${SECONDARY_BUTTON_CLASS} w-full sm:w-auto`}
        >
          <ChevronDown className="h-4 w-4" />
          Show intro
        </button>
      </div>
    </section>
  );
}

function OnboardingPanel({ onDismiss, onOpenSetupGuide }) {
  return (
    <section className="border-b border-stone-200/80 bg-[#f7f5f1]/80 transition-colors dark:border-stone-800 dark:bg-[#181714]/80">
      <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-[#fbfaf7] shadow-sm shadow-stone-300/20 dark:border-stone-800 dark:bg-[#181714] dark:shadow-none">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
            <div className="min-w-0 p-4 lg:p-5">
              <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">Calm remote-job decision support.</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                Start with one real job post. Check if the role is worth your effort before you apply.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenSetupGuide}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#e45033]/25 bg-[#e45033]/10 px-3 text-xs font-semibold text-[#9f2f1f] transition hover:border-[#e45033]/40 hover:bg-[#e45033]/15 focus:outline-none focus:ring-2 focus:ring-[#e45033]/20 dark:border-[#e45033]/30 dark:bg-[#e45033]/10 dark:text-[#ffb29f] dark:hover:bg-[#e45033]/15"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Setup guide
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-stone-300/80 bg-[#fffdf8] px-3 text-xs font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700/80 dark:bg-[#181714] dark:text-stone-200 dark:hover:border-stone-600 dark:hover:bg-stone-900"
                >
                  Hide intro
                </button>
              </div>
            </div>
            <div className="hidden border-t border-stone-200/70 bg-[#eee9df] md:block lg:border-l lg:border-t-0 dark:border-stone-800/80 dark:bg-[#201d18]">
              <div className="relative h-32 overflow-hidden sm:h-36 lg:h-full lg:min-h-[164px]">
                <img
                  src={onboardingSupportImageSrc}
                  alt=""
                  aria-hidden="true"
                  width="1536"
                  height="1024"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-90 saturate-[0.88] dark:opacity-70 dark:saturate-[0.72] dark:contrast-[0.88]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[#fbfaf7]/10 dark:bg-[#181714]/28" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 px-4 pb-4 pt-3 md:grid-cols-3 lg:px-5">
            <OnboardingItem
              title="Find jobs"
              text="Search Himalayas, Remotive, RemoteOK, We Work Remotely, or the demo source and get deterministic match scores."
            />
            <OnboardingItem
              title="Evaluate a job"
              text="Paste a listing from Upwork, LinkedIn, OnlineJobs.ph, a recruiter message, or a company page."
            />
            <OnboardingItem
              title="Review tradeoffs"
              text="See score reasons, restrictions, and optional explanations. No auto-apply, pasted-URL scraping, or eligibility decisions."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function OnboardingItem({ title, text }) {
  return (
    <div className="rounded-xl border border-stone-200/70 bg-[#fffdf8]/70 p-3 dark:border-stone-800 dark:bg-stone-950/20">
      <div className="text-sm font-semibold text-stone-950 dark:text-stone-50">{title}</div>
      <p className="mt-1 text-sm leading-5 text-stone-600 dark:text-stone-300">{text}</p>
    </div>
  );
}

function SearchProfileForm({
  id,
  titleId,
  form,
  mode,
  manualJob,
  manualValidation,
  status,
  onFieldChange,
  onManualJobChange,
  onModeChange,
  onSelectStarterPath,
  onSubmit,
  onCollapse,
  onClose,
  variant = "inline",
  firstFieldRef
}) {
  const isOverlay = variant === "overlay";
  const isEvaluateMode = mode === "evaluate";
  const manualErrors = manualValidation?.errors || {};
  const manualNote = manualValidation?.note || "";
  const formClass = isOverlay
    ? "flex max-h-[85vh] w-full flex-col rounded-2xl rounded-b-none border border-stone-200/80 bg-[#fbfaf7] p-5 shadow-2xl shadow-stone-500/25 dark:border-stone-800 dark:bg-[#181714] dark:shadow-black/40 lg:h-full lg:max-h-none lg:rounded-b-2xl"
    : "h-fit rounded-2xl border border-stone-200/80 bg-[#fbfaf7] p-5 shadow-sm shadow-stone-300/30 dark:border-stone-800 dark:bg-[#181714] dark:shadow-none";
  const bodyClass = isOverlay ? "min-h-0 overflow-y-auto pr-1" : "";

  return (
    <form id={id} onSubmit={onSubmit} className={formClass}>
      <div className="mb-5 flex shrink-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#131311] text-white dark:bg-[#e45033] dark:text-white">
            <Search className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-stone-950 dark:text-stone-50">Search Setup</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Role paths, skills, and filters.</p>
          </div>
        </div>
        {isOverlay ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-300/80 bg-[#fffdf8] text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-200 dark:hover:border-stone-600 dark:hover:bg-stone-900"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCollapse}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-stone-300/80 bg-[#fffdf8] px-3 text-xs font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-200 dark:hover:border-stone-600 dark:hover:bg-stone-900"
            aria-expanded="true"
            aria-controls={id}
          >
            Collapse
          </button>
        )}
      </div>

      <div className={bodyClass}>
        <div className="mb-5 rounded-xl border border-[#e45033]/20 bg-[#fffdf8]/75 p-3 dark:border-[#e45033]/30 dark:bg-stone-950/20">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#e45033]" />
            <div>
              <div className="text-sm font-semibold text-stone-950 dark:text-stone-50">Start with a role path</div>
              <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">
                Presets only fill the form. Edit anything before searching.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {STARTER_PATHS.map((starterPath) => (
              <button
                key={starterPath.label}
                type="button"
                onClick={() => onSelectStarterPath(starterPath)}
                title={starterPath.helper}
                className="inline-flex min-h-9 items-center rounded-full border border-stone-300/80 bg-[#fffdf8] px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-[#e45033]/45 hover:bg-[#e45033]/10 focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 dark:border-stone-700 dark:bg-[#181714] dark:text-stone-200 dark:hover:border-[#e45033]/60 dark:hover:bg-[#e45033]/15"
              >
                {starterPath.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl border border-stone-300/80 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-900">
          {[
            { value: "search", label: "Find Jobs" },
            { value: "evaluate", label: "Evaluate Job" }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onModeChange(option.value)}
              className={`h-9 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#e45033]/15 ${
                mode === option.value
                  ? "bg-[#fffdf8] text-stone-950 shadow-sm dark:bg-[#181714] dark:text-stone-50"
                  : "text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
              }`}
              aria-pressed={mode === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={isEvaluateMode ? "rounded-xl border border-stone-200/80 bg-[#fffdf8]/60 p-4 dark:border-stone-800 dark:bg-stone-950/20" : ""}>
          {isEvaluateMode && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">Search inputs</h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Used as the deterministic scoring context.</p>
            </div>
          )}

          <Field
            label="Target roles"
            name="target_roles"
            value={form.target_roles}
            onChange={onFieldChange}
            placeholder="QA Tester, Python Automation"
            helper="Examples: Python Automation, QA Tester, Frontend Developer"
            inputRef={firstFieldRef}
          />
          <Field
            label="Skills"
            name="skills"
            value={form.skills}
            onChange={onFieldChange}
            placeholder="java script, css, node js"
            helper="Examples: javascript, node.js, react, css"
          />
          <Field
            label="Keywords"
            name="keywords"
            value={form.keywords}
            onChange={onFieldChange}
            placeholder="remote, entry level"
            helper="Examples: entry, junior, support, automation"
          />
          <Field
            label="Avoid keywords"
            name="avoid_keywords"
            value={form.avoid_keywords}
            onChange={onFieldChange}
            placeholder="senior, manager"
            helper="Examples: senior, lead, architect"
          />
          <Field label="Location" name="location" value={form.location} onChange={onFieldChange} placeholder="Philippines" />

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Experience level</span>
            <select
              name="experience_level"
              value={form.experience_level}
              onChange={onFieldChange}
              className={SELECT_CLASS}
            >
              <option value="any">Any</option>
              <option value="beginner">Beginner</option>
              <option value="junior">Junior</option>
              <option value="intermediate">Intermediate</option>
              <option value="senior">Senior</option>
            </select>
          </label>

          <label className={isEvaluateMode ? "block" : "mb-4 block"}>
            <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Work mode</span>
            <select
              name="work_mode"
              value={form.work_mode}
              onChange={onFieldChange}
              className={SELECT_CLASS}
            >
              <option value="any">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </label>
        </div>

        {isEvaluateMode ? (
          <div className="my-5 rounded-xl border border-stone-200/80 bg-[#fffdf8]/60 p-4 dark:border-stone-800 dark:bg-stone-950/20">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">Job to evaluate</h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Job title and full listing are required. Company, location, and URL are optional.
              </p>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                The URL is only saved as a link. The app does not fetch or scrape it.
              </p>
            </div>
            <Field
              label="Job title"
              name="title"
              value={manualJob.title}
              onChange={onManualJobChange}
              placeholder="Junior QA Automation Tester"
              error={manualErrors.title}
            />
            <Field
              label="Company (optional)"
              name="company"
              value={manualJob.company}
              onChange={onManualJobChange}
              placeholder="Optional"
            />
            <Field
              label="Job location (optional)"
              name="location"
              value={manualJob.location}
              onChange={onManualJobChange}
              placeholder="Remote, Philippines, Worldwide"
            />
            <Field
              label="Job URL (optional)"
              name="url"
              value={manualJob.url}
              onChange={onManualJobChange}
              placeholder="https://example.com/job"
              helper={manualNote || undefined}
            />
            <TextAreaField
              label="Full listing"
              name="description"
              value={manualJob.description}
              onChange={onManualJobChange}
              placeholder={`Job description: Paste the responsibilities, requirements, tools, and application notes.

Location: Remote, Philippines, Worldwide, US only
Employment Type: Full-time, Part-time, Contract
Compensation: $800/month, $15/hr, Not listed`}
              helper="Minimum useful detail is required for deterministic scoring."
              error={manualErrors.description}
            />
          </div>
        ) : (
          <div className="mb-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">Source</span>
              <select
                name="source_type"
                value={form.source_type}
                onChange={onFieldChange}
                className={SELECT_CLASS}
              >
                {VISIBLE_SOURCE_OPTIONS.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-2 rounded-xl border border-stone-200/80 bg-[#fffdf8]/60 p-3 text-xs leading-5 text-stone-600 dark:border-stone-800 dark:bg-stone-950/20 dark:text-stone-300">
              {VISIBLE_SOURCE_OPTIONS.map((source) => (
                <div key={source.value}>
                  <span className="font-semibold text-stone-700 dark:text-stone-200">{source.label}:</span>{" "}
                  {SOURCE_DESCRIPTIONS[source.value]}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#131311] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-stone-300/50 transition hover:bg-[#2a2925] focus:outline-none focus:ring-2 focus:ring-[#e45033]/25 disabled:cursor-not-allowed disabled:bg-stone-400 disabled:shadow-none dark:bg-[#e45033] dark:text-white dark:shadow-none dark:hover:bg-[#f06447] dark:disabled:bg-stone-700 dark:disabled:text-stone-300"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {isEvaluateMode ? "Evaluate Job" : "Find Jobs"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, value, onChange, placeholder, helper, error, inputRef }) {
  const helperId = helper ? `${name}-helper` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">{label}</span>
      <input
        ref={inputRef}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={FIELD_CLASS}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined}
      />
      {helper && <span id={helperId} className="mt-1.5 block text-xs text-stone-500 dark:text-stone-400">{helper}</span>}
      {error && <span id={errorId} className="mt-1.5 block text-xs font-medium text-red-700 dark:text-red-300">{error}</span>}
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, helper, error }) {
  const helperId = helper ? `${name}-helper` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={8}
        className={`${FIELD_CLASS} min-h-40 resize-y`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined}
      />
      {helper && <span id={helperId} className="mt-1.5 block text-xs text-stone-500 dark:text-stone-400">{helper}</span>}
      {error && <span id={errorId} className="mt-1.5 block text-xs font-medium text-red-700 dark:text-red-300">{error}</span>}
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

function EmptyState({ title = "No search yet", message = "Your search setup drives deterministic job matching." }) {
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
  const eligibilitySignal = getEligibilitySignal(job);
  const beforeApplyingChecks = getBeforeApplyingChecks(job.scoring.match_reasons);
  const isManualJob = job.metadata?.source_type === "manual" || job.source === "Manual Paste";
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
    <article className={`w-full max-w-full min-w-0 rounded-2xl border bg-[#fffdf8] p-5 shadow-sm shadow-stone-300/30 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-stone-300/40 dark:bg-[#181714] dark:shadow-none dark:hover:border-stone-700 ${getCardBorderClass(decision.tone)}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {job.cached_tracking_only && (
              <span className="rounded-full border border-stone-300/80 bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                Previously tracked
              </span>
            )}
            {isManualJob && (
              <span className="rounded-full border border-stone-300/80 bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                Evaluated manually
              </span>
            )}
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${DECISION_BADGE_CLASSES[decision.tone]}`}>
              {decision.label}
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{decision.helper}</span>
          </div>
          <h3 className="text-xl font-semibold leading-7 text-stone-950 break-words [overflow-wrap:anywhere] dark:text-stone-50">{job.title}</h3>
          <p className="mt-1 text-sm font-medium text-stone-700 break-words [overflow-wrap:anywhere] dark:text-stone-300">{job.company}</p>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-stone-500 dark:text-stone-400">
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">{formatDisplayLocation(job.location) || "Location unavailable"}</span>
            </span>
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">{job.source}</span>
            {job.salary && <span className="min-w-0 break-words [overflow-wrap:anywhere]">{job.salary}</span>}
            {job.cached_tracking_only && <span>Not in current search results.</span>}
          </div>
          {eligibilitySignal && <EligibilitySignal signal={eligibilitySignal} />}
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

      <p className="mt-4 text-sm leading-6 text-stone-700 break-words [overflow-wrap:anywhere] dark:text-stone-300">{job.summary}</p>

      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">Why shown</div>
        <div className="flex flex-wrap gap-2.5">
          {getOrderedMatchReasons(job.scoring.match_reasons).map((reason) => (
            <span key={reason} className={`${getReasonChipClass(reason)} break-words [overflow-wrap:anywhere]`}>
              {reason}
            </span>
          ))}
        </div>
      </div>

      {beforeApplyingChecks.length > 0 && <BeforeApplyingChecks checks={beforeApplyingChecks} />}

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
          <p className="basis-full text-xs leading-5 text-stone-500 dark:text-stone-400">
            Saved, Applied, and Skipped are stored in this browser only.
          </p>
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

function BeforeApplyingChecks({ checks }) {
  return (
    <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-sm text-amber-950 dark:border-amber-900/80 dark:bg-amber-950/25 dark:text-amber-100">
      <div className="mb-2 text-xs font-semibold uppercase text-amber-800 dark:text-amber-200">Before applying, check</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={`${check.label}-${check.reason}`} className="rounded-lg border border-amber-200/70 bg-[#fffdf8]/70 px-3 py-2 dark:border-amber-900/70 dark:bg-stone-950/20">
            <div className="font-semibold">{check.label}</div>
            <div className="mt-0.5 text-xs leading-5 opacity-80 break-words [overflow-wrap:anywhere]">{check.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EligibilitySignal({ signal }) {
  const Icon = signal.state === "eligible" ? CheckCircle2 : AlertTriangle;

  return (
    <div className={`mt-3 inline-flex max-w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-xs leading-5 ${ELIGIBILITY_SIGNAL_CLASSES[signal.state]}`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div className="min-w-0">
        <div className="font-semibold">{signal.label}</div>
        <div>{signal.helper}</div>
        {signal.reasons.length > 0 && (
          <div className="mt-0.5 truncate text-[11px] opacity-80">{signal.reasons[0]}</div>
        )}
      </div>
    </div>
  );
}

function ExplanationPanel({ status, error, explanation, cached }) {
  return (
    <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-300">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-semibold text-stone-950 dark:text-stone-50">Scoring-based explanation</div>
        {cached && <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">Cached</div>}
      </div>
      <p className="mb-3 text-xs leading-5 text-stone-500 dark:text-stone-400">
        This summary is generated from visible scoring signals. It does not change score, order, restrictions, or eligibility.
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
      source_type: isVisibleSourceType(parsed.source_type) ? parsed.source_type : initialForm.source_type
    };
  } catch {
    return null;
  }
}

function isVisibleSourceType(sourceType) {
  return VISIBLE_SOURCE_OPTIONS.some((source) => source.value === sourceType);
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

function loadStoredFilterPanelCollapsed() {
  try {
    return localStorage.getItem(FILTER_PANEL_COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

function saveStoredFilterPanelCollapsed(isCollapsed) {
  try {
    localStorage.setItem(FILTER_PANEL_COLLAPSED_KEY, isCollapsed ? "true" : "false");
  } catch {
    // Filter visibility is a convenience preference; search should still work if localStorage is unavailable.
  }
}

function loadStoredOnboardingHidden() {
  try {
    return localStorage.getItem(ONBOARDING_HIDDEN_KEY) === "true";
  } catch {
    return false;
  }
}

function saveStoredOnboardingHidden(isHidden) {
  try {
    localStorage.setItem(ONBOARDING_HIDDEN_KEY, isHidden ? "true" : "false");
  } catch {
    // Onboarding is a convenience hint; storage failures should not block the app.
  }
}

function loadStoredFirstRunOnboardingComplete() {
  try {
    return Boolean(localStorage.getItem(FIRST_RUN_ONBOARDING_COMPLETE_KEY));
  } catch {
    return false;
  }
}

function saveStoredFirstRunOnboardingComplete(value) {
  try {
    localStorage.setItem(FIRST_RUN_ONBOARDING_COMPLETE_KEY, value);
  } catch {
    // The setup guide is optional; storage failures should not block the app.
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
  const hasStrongRoleEvidence = hasDirectRoleEvidence(job);
  const fit = job.scoring.execution_likelihood;
  const isActionableFit = ["strong_fit", "possible_fit"].includes(fit) || job.scoring.score >= 60;
  const isRelevantBlocked = hasNegative && (hasStrongRoleEvidence || isActionableFit);

  if (isRelevantBlocked) {
    return {
      tone: "restricted",
      label: "Inspect First",
      helper: DECISION_HELPERS.inspect
    };
  }

  if (hasNegative && variant === "lower") {
    return {
      tone: "low",
      label: "Low Priority",
      helper: DECISION_HELPERS.low
    };
  }

  if (hasNegative) {
    return {
      tone: "review",
      label: "Inspect First",
      helper: DECISION_HELPERS.inspect
    };
  }

  if (fit === "strong_fit" || fit === "possible_fit") {
    return {
      tone: "apply",
      label: "Apply First",
      helper: DECISION_HELPERS.apply
    };
  }

  if (hasStrongRoleEvidence && job.scoring.score >= MIN_RELEVANCE_SCORE) {
    const isApplyFirst = job.scoring.score >= 45;

    return {
      tone: isApplyFirst ? "apply" : "review",
      label: isApplyFirst ? "Apply First" : "Inspect First",
      helper: isApplyFirst ? DECISION_HELPERS.apply : DECISION_HELPERS.inspect
    };
  }

  if (fit === "adjacent") {
    return {
      tone: "review",
      label: "Inspect First",
      helper: DECISION_HELPERS.inspect
    };
  }

  if (fit === "stretch") {
    return {
      tone: "stretch",
      label: "Inspect First",
      helper: DECISION_HELPERS.inspect
    };
  }

  return {
    tone: variant === "lower" ? "low" : "review",
    label: variant === "lower" ? "Low Priority" : "Inspect First",
    helper: variant === "lower" ? DECISION_HELPERS.low : DECISION_HELPERS.inspect
  };
}

function getBeforeApplyingChecks(reasons) {
  const seenLabels = new Set();

  return getOrderedMatchReasons(reasons)
    .filter((reason) => ["caution", "negative"].includes(getReasonTone(reason)))
    .map((reason) => ({
      label: getBeforeApplyingCheckLabel(reason),
      reason
    }))
    .filter((check) => {
      if (seenLabels.has(check.label)) {
        return false;
      }

      seenLabels.add(check.label);
      return true;
    })
    .slice(0, 4);
}

function getBeforeApplyingCheckLabel(reason) {
  const normalized = reason.toLowerCase();

  if (
    isEligibilityLikeReason(reason) ||
    normalized.includes("location") ||
    normalized.includes("region") ||
    normalized.includes("country") ||
    normalized.includes("remote role") ||
    normalized.includes("work authorization") ||
    normalized.includes("visa")
  ) {
    return "Location or eligibility unclear";
  }

  if (
    normalized.includes("seniority") ||
    normalized.includes("senior") ||
    normalized.includes("staff") ||
    normalized.includes("principal") ||
    normalized.includes("lead")
  ) {
    return "Seniority may be high";
  }

  if (
    normalized.includes("skill") ||
    normalized.includes("requirement") ||
    normalized.includes("category") ||
    normalized.includes("occupation") ||
    normalized.includes("workflow") ||
    normalized.includes("adjacent") ||
    normalized.includes("complexity") ||
    normalized.includes("platform") ||
    normalized.includes("architecture")
  ) {
    return "Requirements may need review";
  }

  return "Posting details need manual checking";
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

function getEligibilitySignal(job) {
  const reasons = getOrderedMatchReasons(job.scoring.match_reasons).filter(isEligibilityLikeReason);

  if (reasons.length === 0) {
    return null;
  }

  const blockedReasons = reasons.filter(isBlockedEligibilityReason);
  const eligibleReasons = reasons.filter(isPositiveEligibilityReason);
  const cautionReasons = reasons.filter((reason) => !isBlockedEligibilityReason(reason) && !isPositiveEligibilityReason(reason));

  if (blockedReasons.length > 0) {
    return {
      state: "blocked",
      label: "Likely location mismatch",
      helper: "Review this requirement before applying.",
      reasons: blockedReasons
    };
  }

  if (eligibleReasons.length > 0) {
    return {
      state: "eligible",
      label: "Eligible region signal",
      helper: "The visible reasons suggest your location is included.",
      reasons: eligibleReasons
    };
  }

  if (cautionReasons.length > 0) {
    return {
      state: "caution",
      label: "Verify eligibility",
      helper: "Region or authorization details may need checking.",
      reasons: cautionReasons
    };
  }

  return null;
}

function isEligibilityLikeReason(reason) {
  const normalized = reason.toLowerCase();

  return (
    normalized.includes("remote role restricted") ||
    normalized.includes("outside preferred location") ||
    normalized.includes("region-restricted") ||
    normalized.includes("specific hiring regions") ||
    normalized.includes("listed countries") ||
    normalized.includes("eligible to work") ||
    normalized.includes("work authorization") ||
    normalized.includes("visa sponsorship") ||
    normalized.includes("no visa sponsorship") ||
    normalized.includes("worldwide") ||
    normalized.includes("anywhere") ||
    normalized.includes("global") ||
    normalized.includes("apac") ||
    normalized.includes("asia") ||
    normalized.includes("southeast asia") ||
    normalized.includes("remote-friendly") ||
    normalized.includes("matches preferred location") ||
    normalized.includes("compatible with preferred location")
  );
}

function isPositiveEligibilityReason(reason) {
  const normalized = reason.toLowerCase();

  return (
    normalized.includes("listed countries include") ||
    normalized.includes("matches preferred location") ||
    normalized.includes("compatible with preferred location") ||
    normalized.includes("worldwide") ||
    normalized.includes("anywhere") ||
    normalized.includes("global") ||
    normalized.includes("apac") ||
    normalized.includes("asia") ||
    normalized.includes("southeast asia") ||
    normalized.includes("remote-friendly")
  );
}

function isBlockedEligibilityReason(reason) {
  const normalized = reason.toLowerCase();

  if (isPositiveEligibilityReason(reason)) {
    return false;
  }

  return (
    normalized.includes("outside preferred location") ||
    normalized.includes("region-restricted") ||
    normalized.includes("no visa sponsorship") ||
    normalized.includes("not eligible") ||
    normalized.includes("excluded") ||
    normalized.includes("must reside") ||
    normalized.includes("restricted to") ||
    normalized.includes("authorized to work in") ||
    normalized.includes("hiring in these states") ||
    normalized.includes("us only") ||
    normalized.includes("u.s. only") ||
    normalized.includes("united states only") ||
    normalized.includes("europe only") ||
    normalized.includes("eu only") ||
    normalized.includes("canada only") ||
    normalized.includes("uk only") ||
    normalized.includes("australia only")
  );
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
    normalized.includes("category/tag overlap") ||
    normalized.includes("category overlap") ||
    normalized.includes("unrelated occupation") ||
    normalized.includes("workflow similarity") ||
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
