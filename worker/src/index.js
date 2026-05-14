const REAL_PYTHON_URL = "https://realpython.github.io/fake-jobs/";
const REMOTIVE_URL = "https://remotive.com/api/remote-jobs";
const HIMALAYAS_URL = "https://himalayas.app/jobs/api/search";
const ARBEITNOW_URL = "https://www.arbeitnow.com/api/job-board-api";
const REMOTEOK_URL = "https://remoteok.com/api";
const SOURCE_NAME = "Real Python Fake Jobs";
const REMOTIVE_SOURCE_NAME = "Remotive";
const HIMALAYAS_SOURCE_NAME = "Himalayas";
const ARBEITNOW_SOURCE_NAME = "Arbeitnow";
const REMOTEOK_SOURCE_NAME = "RemoteOK";
const MANUAL_SOURCE_NAME = "Manual Paste";
const REMOTIVE_TIMEOUT_MS = 8000;
const HIMALAYAS_MAX_PAGES = 3;
const ARBEITNOW_MAX_PAGES = 1;
const REMOTEOK_TIMEOUT_MS = 8000;
const REMOTEOK_MAX_JOBS = 100;
const MANUAL_EVALUATE_MAX_BODY_BYTES = 128 * 1024;
const MANUAL_DESCRIPTION_MAX_CHARS = 30000;
const MANUAL_DESCRIPTION_MIN_CHARS = 80;
const MANUAL_DESCRIPTION_MIN_WORDS = 12;
const MIN_STRETCH_SCORE = 25;
const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const DEFAULT_AI_EXPLAIN_TIMEOUT_MS = 8000;
const DEFAULT_AI_EXPLAIN_RATE_LIMIT_PER_MINUTE = 10;
const DEFAULT_AI_EXPLAIN_CACHE_TTL_SECONDS = 1800;
const MAX_EXPLAIN_CACHE_ENTRIES = 150;
const explainCache = new Map();
const explainRateLimits = new Map();
const GENERIC_TOKENS = new Set([
  "data",
  "job",
  "work",
  "remote",
  "entry",
  "assistant",
  "developer",
  "specialist",
  "officer",
  "manager",
  "engineer"
]);
const TECH_PROFILE_TERMS = [
  "software",
  "developer",
  "development",
  "engineer",
  "engineering",
  "frontend",
  "front end",
  "backend",
  "back end",
  "full stack",
  "javascript",
  "node.js",
  "typescript",
  "react",
  "ios",
  "mobile",
  "qa",
  "automation",
  "technical support"
];
const TECH_ROLE_TERMS = [
  "software",
  "developer",
  "development",
  "engineer",
  "engineering",
  "frontend",
  "front end",
  "backend",
  "back end",
  "full stack",
  "javascript",
  "node",
  "typescript",
  "react",
  "ios",
  "mobile",
  "qa",
  "automation",
  "technical",
  "programmer"
];
const OFF_DOMAIN_ROLE_TERMS = [
  "office assistant",
  "administrative",
  "admin",
  "sales",
  "account executive",
  "customer success",
  "operations assistant"
];
const PLATFORM_MISMATCH_TERMS = ["ios", "android", "mobile", "swift", "kotlin"];
const ENTRY_LEVEL_TERMS = ["entry level", "junior", "beginner", "intern", "internship", "graduate"];
const SENIOR_LEVEL_TERMS = ["senior", "staff", "principal", "lead", "head"];
const COMPLEXITY_TERMS = [
  "senior",
  "staff",
  "principal",
  "lead",
  "architect",
  "engineer",
  "manager",
  "backend",
  "back end",
  "5 years",
  "8 years",
  "enterprise",
  "architecture"
];
const JUNIOR_LEVEL_TERMS = ["junior", "entry level", "assistant", "intern", "trainee", "beginner", "graduate"];
const SCRIPT_INTENT_TERMS = ["script", "scripting", "automation", "simple task"];
const SCRIPT_FRIENDLY_TERMS = ["programmer", "developer", "automation", "script"];
const JOB_AUTOMATION_TERMS = [
  "automation",
  "automated",
  "automate",
  "workflow automation",
  "process automation",
  "scripting",
  "script",
  "zapier",
  "make com",
  "n8n",
  "rpa",
  "robotic process automation",
  "selenium",
  "playwright",
  "puppeteer",
  "api automation",
  "test automation",
  "qa automation",
  "ci cd automation"
];
const SIMPLE_TASK_TERMS = ["script", "automation", "cleanup", "data extraction", "scraper", "bug fixing", "testing", "assistant", "junior", "entry"];
const DESCRIPTION_COMPLEXITY_TERMS = [
  "senior",
  "staff",
  "principal",
  "architect",
  "lead",
  "enterprise",
  "infrastructure",
  "kubernetes",
  "microservices",
  "ownership",
  "scalable systems"
];
const SUPPORT_INTENT_TERMS = ["support", "software support", "technical support", "customer support", "help desk"];
const SUPPORT_ROLE_EVIDENCE_TERMS = ["support", "software support", "technical support", "customer support", "help desk"];
const SUPPORT_RELEVANCE_FLOOR_BLOCKER_TERMS = ["senior", "staff", "principal", "lead", "manager", "engineer"];
const BROAD_ROLE_RECOMMENDATION_CAP = MIN_STRETCH_SCORE - 1;
const BROAD_ROLE_UNRELATED_CAP = 19;
const BROAD_ROLE_PROTECTED_FAMILIES = [
  {
    family: "support",
    queryTerms: ["support", "customer support", "technical support", "software support", "help desk", "service desk", "customer service"],
    titleEvidenceTerms: ["support", "customer support", "technical support", "software support", "help desk", "service desk", "customer service"],
    descriptionEvidenceTerms: ["customer support", "technical support", "software support", "help desk", "service desk", "customer service"]
  },
  {
    family: "admin",
    queryTerms: ["admin", "administrative", "office assistant", "administrative assistant"],
    titleEvidenceTerms: ["admin", "administrative", "office assistant", "administrative assistant"],
    descriptionEvidenceTerms: ["administrative support", "administrative assistant", "office assistant"]
  },
  {
    family: "assistant",
    queryTerms: ["assistant", "office assistant", "administrative assistant", "virtual assistant", "va"],
    titleEvidenceTerms: ["assistant", "office assistant", "administrative assistant", "virtual assistant", "va"],
    descriptionEvidenceTerms: ["assistant", "virtual assistant", "administrative assistant", "office assistant"]
  },
  {
    family: "customer_service",
    queryTerms: ["customer service", "customer care"],
    titleEvidenceTerms: ["customer service", "customer care", "customer support"],
    descriptionEvidenceTerms: ["customer service", "customer care", "customer support"]
  }
];
const BROAD_ROLE_OCCUPATIONAL_MISMATCH_TERMS = [
  "attorney",
  "legal",
  "document review",
  "contract review",
  "data entry",
  "policy",
  "policy intern",
  "vp",
  "vice president",
  "chief",
  "director",
  "head",
  "executive",
  "product manager",
  "product director",
  "product lead",
  "product owner",
  "partnerships",
  "clinical",
  "provider",
  "population health",
  "counselor",
  "therapist",
  "nurse",
  "physician",
  "doctor",
  "itinerary",
  "travel",
  "destination",
  "hospitality",
  "scheduler",
  "booking",
  "appointment coordinator"
];
const TECH_ALIASES = {
  "java script": "javascript",
  "node js": "node.js",
  nodejs: "node.js",
  "react js": "react",
  "type script": "typescript"
};
const SCORING_WEIGHTS = Object.freeze({
  baseScore: 4,
  maxReasons: 4,
  signalMaxPoints: {
    role: 34,
    skill: 26,
    strongest_skill: 14,
    keyword: 16
  },
  signalWeights: {
    titlePhrase: 1,
    secondaryPhrase: 0.72,
    categoryPhrase: 0.62,
    roleSecondaryPhrase: 0.34,
    titleSkillToken: 0.64,
    titleToken: 0.58,
    secondaryToken: 0.28,
    nearWords: 0.5,
    weak: 0.16,
    weakCapRatio: 0.22
  },
  roleContext: {
    primaryProgrammer: 15,
    primaryDeveloper: 11,
    primary: 10,
    secondaryTechnology: { points: 2, penalty: -4 },
    complexSecondary: { points: 2, penalty: -6 },
    mainPhrase: 8,
    fallbackSecondary: { points: 3, penalty: -3 }
  },
  seniority: {
    matchedEntry: 18,
    seniorTooHighPenalty: -18,
    matchedSenior: 18,
    tooJuniorPenalty: -14
  },
  complexity: {
    highPenalty: 10,
    mediumPenalty: 7,
    fallbackPenalty: 4,
    cap: 18,
    seniorAlignedMultiplier: 0.4,
    seniorAlignedCap: 6
  },
  scriptIntent: {
    programmer: 8,
    simpleDeveloper: 5,
    complexDeveloper: 3,
    implementation: 4,
    complexPenalty: -5
  },
  avoidKeywords: {
    penaltyPerMatch: 18,
    cap: 35
  },
  locationWorkMode: {
    locationMatch: 6,
    workModeMatch: 7,
    locationMismatchPenalty: -6,
    locationRestrictedMismatchPenalty: -10,
    conflictPenalty: -12
  },
  executionLikelihood: {
    base: 50,
    juniorTitleBoost: 22,
    juniorSeniorPenalty: -28,
    juniorComplexityPenalty: -18,
    seniorTitleBoost: 22,
    seniorJuniorPenalty: -18,
    intermediateSeniorPenalty: -12,
    strongestSkillBoostCap: 14,
    complexityPenaltyCap: 18,
    scoreMultiplier: 0.35,
    strongFitThreshold: 76,
    possibleFitThreshold: 58,
    stretchThreshold: 25
  },
  taskFitTieBreaker: {
    simpleTermBoost: 2,
    simpleBoostCap: 6,
    complexityTermPenalty: 2,
    complexityPenaltyCap: 8,
    seniorAlignedComplexityPenaltyCap: 3
  },
  roleDomain: {
    technicalAlignment: 8,
    offDomainPenalty: 14
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/api/jobs/search") {
      if (request.method === "POST") {
        return handleJobSearch(request);
      }

      return json({ error: "Method not allowed. Use POST." }, 405);
    }

    if (url.pathname === "/api/jobs/evaluate") {
      if (request.method === "POST") {
        return handleJobEvaluate(request);
      }

      return json({ error: "Method not allowed. Use POST." }, 405);
    }

    if (url.pathname === "/api/jobs/explain") {
      if (request.method === "POST") {
        return handleJobExplain(request, env);
      }

      return json({ error: "Method not allowed. Use POST." }, 405);
    }

    return json({ error: "Not found" }, 404);
  }
};

async function handleJobSearch(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const profile = normalizeProfile(body.profile);
  const sourceType = body.source?.type;

  if (!["realpython_fake_jobs", "remotive", "himalayas", "arbeitnow", "remoteok"].includes(sourceType)) {
    return json({ error: "Unsupported source. Use realpython_fake_jobs, remotive, himalayas, arbeitnow, or remoteok." }, 400);
  }

  let sourceResult;
  const sourceName = getSourceName(sourceType);

  try {
    sourceResult = await fetchJobsForSource(sourceType, profile);
  } catch (error) {
    const sourceError = normalizeSourceError(error, sourceType, sourceName);
    return json({
      error: sourceError.message,
      source: sourceError.source
    }, sourceError.httpStatus);
  }

  const ingestedAt = new Date().toISOString();
  const jobs = dedupeJobs(sourceResult.jobs)
    .map((job) => formatJob(job, profile, ingestedAt))
    .sort((a, b) => b.scoring.score - a.scoring.score || a.title.localeCompare(b.title))
    .map((job) => ({
      id: makeStableJobId(job),
      ...job
    }));

  return json({
    jobs,
    count: jobs.length,
    source: {
      type: sourceType,
      name: sourceName,
      status: "ok",
      message: makeSourceSuccessMessage(sourceName, jobs.length, sourceResult),
      dropped_count: sourceResult.droppedCount
    }
  });
}

async function handleJobEvaluate(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (Number.isFinite(contentLength) && contentLength > MANUAL_EVALUATE_MAX_BODY_BYTES) {
    return json(makeValidationError("Manual job payload is too large.", "manual_payload_too_large"), 413);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  if (JSON.stringify(body).length > MANUAL_EVALUATE_MAX_BODY_BYTES) {
    return json(makeValidationError("Manual job payload is too large.", "manual_payload_too_large"), 413);
  }

  const validation = validateManualEvaluateRequest(body);

  if (!validation.ok) {
    return json(makeValidationError(validation.error, validation.code, validation.field), validation.status || 400);
  }

  const ingestedAt = new Date().toISOString();
  const formattedJob = formatJob(validation.job, validation.profile, ingestedAt);
  const job = {
    id: makeStableJobId(formattedJob),
    ...formattedJob
  };

  return json({
    jobs: [job],
    count: 1,
    source: {
      type: "manual",
      name: MANUAL_SOURCE_NAME,
      status: "ok",
      message: "Manual job evaluated with deterministic scoring.",
      dropped_count: 0
    }
  });
}

async function handleJobExplain(request, env) {
  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const validation = validateExplainRequest(body);

  if (!validation.ok) {
    return json({ error: validation.error }, 400);
  }

  const { profile, job } = validation;
  const fallbackExplanation = makeFallbackExplanation(job);
  const aiEnabled = isAiExplainEnabled(env);
  const hasGroqKey = Boolean(cleanOptionalText(env.GROQ_API_KEY));

  if (!aiEnabled) {
    return json(makeExplainResponse(fallbackExplanation));
  }

  if (!hasGroqKey) {
    return json(makeExplainResponse(fallbackExplanation));
  }

  const cacheKey = makeExplainCacheKey(profile, job);
  const cachedExplanation = getCachedExplanation(cacheKey);

  if (cachedExplanation) {
    return json(makeExplainResponse(cachedExplanation, true));
  }

  const rateLimit = checkExplainRateLimit(request, env);

  if (rateLimit.limited) {
    return json({ error: "Rate limit exceeded. Try again shortly." }, 429, {
      "Retry-After": String(rateLimit.retryAfter)
    });
  }

  try {
    const aiExplanation = await fetchGroqExplanation({ profile, job, env });
    setCachedExplanation(cacheKey, aiExplanation, env);
    return json(makeExplainResponse(aiExplanation));
  } catch {
    return json(makeExplainResponse(fallbackExplanation));
  }
}

function validateExplainRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  if (!body.profile || typeof body.profile !== "object" || Array.isArray(body.profile)) {
    return { ok: false, error: "Request body must include a profile object." };
  }

  if (!isValidExplainJob(body.job)) {
    return { ok: false, error: "Request body must include one already-scored frontend job object." };
  }

  return {
    ok: true,
    profile: normalizeProfile(body.profile),
    job: normalizeExplainJob(body.job)
  };
}

function isValidExplainJob(job) {
  return Boolean(
    job &&
    typeof job === "object" &&
    !Array.isArray(job) &&
    typeof job.title === "string" &&
    typeof job.company === "string" &&
    job.scoring &&
    typeof job.scoring === "object" &&
    !Array.isArray(job.scoring) &&
    Number.isFinite(job.scoring.score) &&
    Array.isArray(job.scoring.match_reasons) &&
    typeof job.scoring.execution_likelihood === "string" &&
    job.scoring.components &&
    typeof job.scoring.components === "object" &&
    !Array.isArray(job.scoring.components)
  );
}

function normalizeExplainJob(job) {
  return {
    id: cleanOptionalText(job.id),
    title: limitText(job.title, 140),
    company: limitText(job.company, 120),
    location: limitText(job.location || "", 160),
    source: limitText(job.source || "", 80),
    url: normalizeUrl(job.url),
    salary: limitText(job.salary || "", 120),
    summary: limitText(job.summary || "", 700),
    details: Array.isArray(job.details)
      ? job.details.map((detail) => limitText(detail, 220)).filter(Boolean).slice(0, 4)
      : [],
    scoring: {
      score: Math.max(0, Math.min(100, Math.round(job.scoring.score))),
      match_reasons: job.scoring.match_reasons.map((reason) => limitText(reason, 180)).filter(Boolean).slice(0, 8),
      execution_likelihood: limitText(job.scoring.execution_likelihood, 80),
      components: normalizeExplainComponents(job.scoring.components)
    }
  };
}

function normalizeExplainComponents(components) {
  const allowedKeys = [
    "role_match_score",
    "skill_match_score",
    "keyword_match_score",
    "seniority_match_score",
    "execution_likelihood_score",
    "location_workmode_score",
    "penalties"
  ];
  const normalized = {};

  for (const key of allowedKeys) {
    const value = Number(components[key]);
    normalized[key] = Number.isFinite(value) ? Math.round(value) : 0;
  }

  return normalized;
}

function isAiExplainEnabled(env) {
  return String(env.AI_EXPLAIN_ENABLED || "false").toLowerCase() === "true";
}

function makeExplainResponse(explanation, cached = false) {
  return {
    explanation,
    cached
  };
}

function makeFallbackExplanation(job) {
  const score = job.scoring.score;
  const reasons = job.scoring.match_reasons;
  const strengths = makeFallbackStrengths(reasons);
  const concerns = makeFallbackConcerns(job);

  return ensureExplainShape({
    summary: makeFallbackSummary(score, strengths, concerns),
    strengths,
    concerns,
    verify_before_applying: makeVerificationItems(job),
    decision_support: "Use this as context for the existing deterministic score. It does not change the rank, override restrictions, or decide eligibility."
  });
}

function makeFallbackSummary(score, strengths, concerns) {
  const mainStrength = strengths[0] || "the visible job data has limited positive scoring evidence";
  const mainConcern = concerns[0] || "there is not enough extra evidence to lift it into a stronger range";

  return `This job has a deterministic match score of ${score}. ${makeScoreSummary(score)} Main helpful signal: ${makeSentenceClause(mainStrength)}. Main limiting factor: ${makeSentenceClause(mainConcern)}.`;
}

function makeScoreSummary(score) {
  if (score >= 60) {
    return "The deterministic signals suggest a stronger first-pass match.";
  }

  if (score >= 25) {
    return "The deterministic signals suggest a moderate, inspectable match rather than a clear top match.";
  }

  return "The deterministic signals suggest this is a lower-priority lead.";
}

function makeFallbackStrengths(reasons) {
  const strengths = uniqueList(reasons.filter((reason) => !isConcernReason(reason))).slice(0, 4);

  return strengths.length ? strengths : ["The visible scoring signals do not show a strong positive match reason."];
}

function makeFallbackConcerns(job) {
  const concerns = uniqueList([
    ...job.scoring.match_reasons.filter(isConcernReason),
    ...makeComponentLimitations(job)
  ]).slice(0, 4);

  return concerns.length ? concerns : ["No explicit restriction or penalty is visible, but the positive evidence is limited."];
}

function makeComponentLimitations(job) {
  const components = job.scoring.components;
  const limitations = [];

  if (components.penalties < 0) {
    limitations.push(`Penalties reduced the score by ${Math.abs(components.penalties)} points.`);
  }

  if (["adjacent", "stretch", "lower_match", "poor_fit", "unclear"].includes(job.scoring.execution_likelihood)) {
    limitations.push(`Execution likelihood is ${formatExecutionLikelihood(job.scoring.execution_likelihood)}, which limits confidence in the match.`);
  }

  if (job.scoring.score < 60 && components.role_match_score <= 0) {
    limitations.push("Role alignment evidence is limited in the visible scoring signals.");
  }

  if (job.scoring.score < 60 && components.skill_match_score <= 0) {
    limitations.push("Skill evidence is limited in the visible scoring signals.");
  }

  if (job.scoring.score < 60 && components.keyword_match_score <= 0 && components.location_workmode_score <= 0) {
    limitations.push("Supporting keyword or location evidence is not strong enough to raise the score further.");
  }

  return limitations;
}

function isConcernReason(reason) {
  const normalized = normalizeSearchText(reason);

  return (
    normalized.includes("restricted") ||
    normalized.includes("outside preferred location") ||
    normalized.includes("avoid keyword") ||
    normalized.includes("avoided keyword") ||
    normalized.includes("penalty") ||
    normalized.includes("seniority") ||
    normalized.includes("complexity") ||
    normalized.includes("architecture") ||
    normalized.includes("platform") ||
    normalized.includes("additional skills") ||
    normalized.includes("stretch")
  );
}

function formatExecutionLikelihood(value) {
  return {
    strong_fit: "strong fit",
    possible_fit: "possible fit",
    adjacent: "adjacent",
    stretch: "stretch",
    lower_match: "lower match",
    poor_fit: "lower match",
    unclear: "unclear"
  }[value] || "unclear";
}

function uniqueList(items) {
  const seen = new Set();
  const uniqueItems = [];

  for (const item of items) {
    const text = cleanOptionalText(item);
    const key = normalizeSearchText(text);

    if (!text || seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueItems.push(text);
  }

  return uniqueItems;
}

function makeSentenceClause(text) {
  const trimmed = cleanOptionalText(text).replace(/[.!?]+$/, "");

  return trimmed || "not enough visible evidence";
}

function makeVerificationItems(job) {
  const items = [];
  const reasonText = normalizeSearchText(job.scoring.match_reasons.join(" "));

  if (reasonText.includes("restricted") || reasonText.includes("outside preferred location")) {
    items.push("Verify hiring location, work authorization, and remote eligibility before applying.");
  }

  if (reasonText.includes("seniority") || reasonText.includes("complexity") || reasonText.includes("architecture")) {
    items.push("Check whether the seniority and complexity expectations match your current experience.");
  }

  if (job.salary) {
    items.push("Confirm compensation details on the original posting.");
  }

  items.push("Open the source posting and confirm the responsibilities, required skills, and application requirements.");

  return items.slice(0, 4);
}

function makeExplainCacheKey(profile, job) {
  return stableHash(JSON.stringify({
    profile,
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
      summary: job.summary,
      details: job.details,
      scoring: job.scoring
    }
  }));
}

function getCachedExplanation(cacheKey) {
  const cached = explainCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    explainCache.delete(cacheKey);
    return null;
  }

  return cached.explanation;
}

function setCachedExplanation(cacheKey, explanation, env) {
  if (explainCache.size >= MAX_EXPLAIN_CACHE_ENTRIES) {
    const oldestKey = explainCache.keys().next().value;
    explainCache.delete(oldestKey);
  }

  explainCache.set(cacheKey, {
    explanation,
    expiresAt: Date.now() + getPositiveEnvInt(env.AI_EXPLAIN_CACHE_TTL_SECONDS, DEFAULT_AI_EXPLAIN_CACHE_TTL_SECONDS) * 1000
  });
}

function checkExplainRateLimit(request, env) {
  const limit = getPositiveEnvInt(env.AI_EXPLAIN_RATE_LIMIT_PER_MINUTE, DEFAULT_AI_EXPLAIN_RATE_LIMIT_PER_MINUTE);
  const now = Date.now();
  const windowMs = 60_000;
  const key = `${request.headers.get("CF-Connecting-IP") || "local"}:/api/jobs/explain`;
  const current = explainRateLimits.get(key);

  if (!current || current.resetAt <= now) {
    explainRateLimits.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    pruneExplainRateLimits(now);
    return { limited: false, retryAfter: 0 };
  }

  if (current.count >= limit) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    };
  }

  current.count += 1;
  return { limited: false, retryAfter: 0 };
}

function pruneExplainRateLimits(now) {
  if (explainRateLimits.size < 500) {
    return;
  }

  for (const [key, value] of explainRateLimits.entries()) {
    if (value.resetAt <= now) {
      explainRateLimits.delete(key);
    }
  }
}

async function fetchGroqExplanation({ profile, job, env }) {
  const response = await fetchWithTimeout(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: cleanOptionalText(env.GROQ_MODEL) || DEFAULT_GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You explain deterministic remote-job scoring in plain language.",
            "The deterministic score, components, reasons, restrictions, and ranking are the source of truth.",
            "Explain score tradeoffs: what helped the score, what limited it, why it landed in this range, and what to verify before applying.",
            "Use an analytical, calm, non-persuasive, non-authoritative tone.",
            "Do not use motivational career-coach language, tell the user they are eligible, say they should apply, invent requirements, invent confidence, hide penalties, or suggest the score should change.",
            "Do not rerank, rescore, decide eligibility, or override deterministic restrictions or penalties.",
            "Use strengths for what helped the score and concerns for what limited the score.",
            "Complexity, architecture, platform, seniority mismatch, restrictions, penalties, and avoid-keyword signals belong in concerns, not strengths.",
            "Return only valid JSON with this exact shape: {\"explanation\":{\"summary\":\"string\",\"strengths\":[\"string\"],\"concerns\":[\"string\"],\"verify_before_applying\":[\"string\"],\"decision_support\":\"string\"}}."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            profile,
            job,
            instruction: "Explain only the visible deterministic scoring signals for this one job. Focus on tradeoffs rather than repeating the match reason chips."
          })
        }
      ]
    })
  }, getPositiveEnvInt(env.AI_EXPLAIN_TIMEOUT_MS, DEFAULT_AI_EXPLAIN_TIMEOUT_MS));

  if (!response.ok) {
    throw new Error(`Groq explanation failed with status ${response.status}.`);
  }

  const data = await response.json();
  const content = cleanOptionalText(data?.choices?.[0]?.message?.content);

  if (!content) {
    throw new Error("Groq explanation response did not include content.");
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Groq explanation response was not valid JSON.");
  }

  return validateAiExplanation(parsed);
}

function validateAiExplanation(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI explanation must be a JSON object.");
  }

  const explanation = parsed.explanation;

  if (!explanation || typeof explanation !== "object" || Array.isArray(explanation)) {
    throw new Error("AI explanation must include an explanation object.");
  }

  return ensureExplainShape(explanation);
}

function ensureExplainShape(explanation) {
  const normalizedLists = rebucketExplanationSignals(
    normalizeExplainList(explanation.strengths),
    normalizeExplainList(explanation.concerns)
  );
  const normalized = {
    summary: limitText(explanation.summary, 700),
    strengths: normalizedLists.strengths,
    concerns: normalizedLists.concerns,
    verify_before_applying: normalizeExplainList(explanation.verify_before_applying),
    decision_support: limitText(explanation.decision_support, 500)
  };

  if (!normalized.summary || !normalized.decision_support) {
    throw new Error("AI explanation is missing required text fields.");
  }

  return normalized;
}

function normalizeExplainList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => limitText(item, 240)).filter(Boolean).slice(0, 4);
}

function rebucketExplanationSignals(strengths, concerns) {
  const correctedStrengths = [];
  const correctedConcerns = [...concerns];

  for (const strength of strengths) {
    if (isConcernReason(strength)) {
      correctedConcerns.push(strength);
    } else {
      correctedStrengths.push(strength);
    }
  }

  return {
    strengths: uniqueList(correctedStrengths).slice(0, 4),
    concerns: uniqueList(correctedConcerns).slice(0, 4)
  };
}

function getPositiveEnvInt(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}

function limitText(value, maxLength) {
  const text = cleanOptionalText(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

async function fetchJobsForSource(sourceType, profile) {
  if (sourceType === "remotive") {
    return fetchRemotiveJobs(profile);
  }

  if (sourceType === "himalayas") {
    return fetchHimalayasJobs(profile);
  }

  if (sourceType === "arbeitnow") {
    return fetchArbeitnowJobs(profile);
  }

  if (sourceType === "remoteok") {
    return fetchRemoteOkJobs();
  }

  return makeSourceResult(await fetchRealPythonJobs());
}

function getSourceName(sourceType) {
  return {
    remotive: REMOTIVE_SOURCE_NAME,
    himalayas: HIMALAYAS_SOURCE_NAME,
    arbeitnow: ARBEITNOW_SOURCE_NAME,
    remoteok: REMOTEOK_SOURCE_NAME,
    realpython_fake_jobs: SOURCE_NAME
  }[sourceType] || SOURCE_NAME;
}

function makeSourceResult(jobs, droppedCount = 0, diagnostics = {}) {
  return {
    jobs: Array.isArray(jobs) ? jobs : [],
    droppedCount,
    ...diagnostics
  };
}

function makeSourceSuccessMessage(sourceName, jobCount, sourceResult = {}) {
  const droppedCount = sourceResult.droppedCount || 0;
  const pageText = sourceResult.pagesFetched > 1 ? ` from ${sourceResult.pagesFetched} pages` : "";
  const remotiveBatchText = sourceName === REMOTIVE_SOURCE_NAME ? " from its public API batch" : "";
  const remoteOkFeedText = sourceName === REMOTEOK_SOURCE_NAME ? " from its capped public API feed" : "";
  const suffix = sourceResult.warning ? ` ${sourceResult.warning}` : "";

  if (jobCount === 0) {
    const emptyMessage = droppedCount > 0
      ? `${sourceName} returned jobs${pageText || remotiveBatchText || remoteOkFeedText}, but none were usable after normalization.`
      : `${sourceName} returned no jobs${pageText || remotiveBatchText || remoteOkFeedText} for this search.`;
    return `${emptyMessage}${suffix}`;
  }

  const successMessage = droppedCount > 0
    ? `${sourceName} returned ${jobCount} usable jobs${pageText || remotiveBatchText || remoteOkFeedText}; ${droppedCount} malformed rows were skipped.`
    : `${sourceName} returned ${jobCount} jobs${pageText || remotiveBatchText || remoteOkFeedText}.`;

  return `${successMessage}${suffix}`;
}

function makeSourceError(message, code = "source_error", httpStatus = 502) {
  const error = new Error(message);
  error.code = code;
  error.httpStatus = httpStatus;
  return error;
}

function normalizeSourceError(error, sourceType, sourceName) {
  const message = error?.message || `Unable to fetch jobs from ${sourceName}.`;

  return {
    message,
    httpStatus: error?.httpStatus || 502,
    source: {
      type: sourceType,
      name: sourceName,
      status: "error",
      message,
      dropped_count: 0
    }
  };
}

function normalizeProfile(profile = {}) {
  return {
    target_roles: normalizeList(profile.target_roles),
    skills: normalizeList(profile.skills),
    keywords: normalizeList(profile.keywords),
    avoid_keywords: normalizeList(profile.avoid_keywords),
    strongest_skills: normalizeList(profile.strongest_skills),
    location: cleanText(profile.location || ""),
    work_mode: ["any", "remote", "hybrid", "onsite"].includes(profile.work_mode) ? profile.work_mode : "any",
    experience_level: ["beginner", "junior", "intermediate", "senior", "any"].includes(profile.experience_level)
      ? profile.experience_level
      : "any"
  };
}

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeProfileTerm(item)).filter(Boolean);
}

function normalizeProfileTerm(value) {
  const cleaned = cleanText(String(value));
  const aliasKey = cleaned.toLowerCase();

  return TECH_ALIASES[aliasKey] || cleaned;
}

function validateManualEvaluateRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object.", code: "invalid_request" };
  }

  if (!body.profile || typeof body.profile !== "object" || Array.isArray(body.profile)) {
    return { ok: false, error: "Request body must include a profile object.", code: "profile_required", field: "profile" };
  }

  if (!body.job || typeof body.job !== "object" || Array.isArray(body.job)) {
    return { ok: false, error: "Request body must include a job object.", code: "manual_job_required", field: "job" };
  }

  const normalizedJob = normalizeManualJob(body.job);

  if (!normalizedJob.ok) {
    return normalizedJob;
  }

  return {
    ok: true,
    profile: normalizeProfile(body.profile),
    job: normalizedJob.job
  };
}

function normalizeManualJob(job) {
  const title = limitText(job.title, 140);

  if (!title) {
    return { ok: false, error: "Manual job title is required.", code: "manual_title_required", field: "title" };
  }

  const description = limitText(cleanHtml(job.description || ""), MANUAL_DESCRIPTION_MAX_CHARS);
  const searchableDescription = normalizeSearchText(description);
  const meaningfulWords = searchableDescription.split(" ").filter((word) => word.length >= 2);

  if (!description) {
    return { ok: false, error: "Manual job description is required.", code: "manual_description_required", field: "description" };
  }

  if (description.length < MANUAL_DESCRIPTION_MIN_CHARS || meaningfulWords.length < MANUAL_DESCRIPTION_MIN_WORDS) {
    return { ok: false, error: "Manual job description is too short to evaluate reliably.", code: "manual_description_too_short", field: "description" };
  }

  const company = limitText(job.company, 120) || "Unknown company";
  const location = limitText(job.location, 160);
  const url = normalizeManualUrl(job.url);
  const sourceJobId = stableHash([
    normalizeSearchText(title),
    normalizeSearchText(company),
    canonicalizeUrlForCompare(url),
    normalizeSearchText(description)
  ].join("|"));

  return {
    ok: true,
    job: {
      title,
      company,
      location,
      source: MANUAL_SOURCE_NAME,
      source_job_id: sourceJobId,
      url,
      employment_type: null,
      salary: null,
      description,
      category: ""
    }
  };
}

function normalizeManualUrl(value) {
  const cleaned = cleanOptionalText(value);

  if (!cleaned) {
    return null;
  }

  try {
    const url = new URL(cleaned);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function makeValidationError(error, code, field) {
  return {
    error,
    ...(code ? { code } : {}),
    ...(field ? { field } : {})
  };
}

async function fetchRealPythonJobs() {
  const response = await fetch(REAL_PYTHON_URL, {
    headers: {
      "User-Agent": "job-intel-mvp/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`Real Python fetch failed with status ${response.status}`);
  }

  const parser = new RealPythonJobParser();
  await new HTMLRewriter()
    .on(".card-content", parser.cardHandler())
    .on(".card-content h2.title", parser.textHandler("title"))
    .on(".card-content h3.company", parser.textHandler("company"))
    .on(".card-content p.location", parser.textHandler("location"))
    .on(".card-footer a.card-footer-item", parser.linkHandler())
    .transform(response)
    .arrayBuffer();

  return parser.jobs
    .map((job) => ({
      title: cleanText(job.title),
      company: cleanText(job.company),
      location: cleanText(job.location),
      source: SOURCE_NAME,
      url: normalizeUrl(job.url)
    }))
    .filter((job) => job.title && job.company);
}

async function fetchRemotiveJobs(profile) {
  const url = new URL(REMOTIVE_URL);
  const search = buildRemotiveSearch(profile);

  // Remotive's public API may return a limited batch for a search; keep it as a reliable secondary source for MVP.
  url.searchParams.set("limit", "50");

  if (search) {
    url.searchParams.set("search", search);
  }

  let response;

  try {
    response = await fetchWithTimeout(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "job-intel-mvp/0.1"
      }
    }, REMOTIVE_TIMEOUT_MS);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw makeSourceError(`Remotive request timed out after ${REMOTIVE_TIMEOUT_MS}ms.`, "timeout");
    }

    throw makeSourceError("Remotive request failed before a response was received.", "network_error");
  }

  if (!response.ok) {
    throw makeSourceError(`Remotive fetch failed with status ${response.status}.`, "http_error");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw makeSourceError("Remotive returned invalid JSON.", "invalid_json");
  }

  if (!data || typeof data !== "object" || !Array.isArray(data.jobs)) {
    throw makeSourceError("Remotive returned an unexpected response shape.", "invalid_shape");
  }

  let droppedCount = 0;
  const jobs = [];

  for (const job of data.jobs) {
    const normalizedJob = normalizeRemotiveJob(job);

    if (normalizedJob) {
      jobs.push(normalizedJob);
    } else {
      droppedCount += 1;
    }
  }

  return makeSourceResult(jobs, droppedCount);
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeRemotiveJob(job) {
  if (!job || typeof job !== "object") {
    return null;
  }

  const title = cleanOptionalText(job.title);
  const company = cleanOptionalText(job.company_name);

  if (!title || !company) {
    return null;
  }

  return {
    title,
    company,
    location: cleanOptionalText(job.candidate_required_location) || "Remote",
    source: REMOTIVE_SOURCE_NAME,
    source_job_id: cleanSourceId(job.id),
    url: normalizeUrlFromBase(job.url, REMOTIVE_URL),
    employment_type: cleanOptionalText(job.job_type) || null,
    salary: normalizeCompensation(job.salary),
    description: cleanHtml(job.description || ""),
    category: cleanOptionalText(job.category)
  };
}

async function fetchHimalayasJobs(profile) {
  const search = buildHimalayasSearch(profile);
  let droppedCount = 0;
  const jobs = [];
  let pagesFetched = 0;
  let warning = "";

  for (let page = 1; page <= HIMALAYAS_MAX_PAGES; page += 1) {
    let data;

    try {
      data = await fetchHimalayasJobsPage(search, page);
    } catch (error) {
      if (jobs.length === 0) {
        throw error;
      }

      warning = `Stopped after ${pagesFetched} successful page${pagesFetched === 1 ? "" : "s"} because page ${page} could not be fetched.`;
      break;
    }

    pagesFetched += 1;

    if (data.jobs.length === 0) {
      break;
    }

    for (const job of data.jobs) {
      const normalizedJob = normalizeHimalayasJob(job);

      if (normalizedJob) {
        jobs.push(normalizedJob);
      } else {
        droppedCount += 1;
      }
    }
  }

  return makeSourceResult(jobs, droppedCount, {
    pagesFetched,
    warning
  });
}

async function fetchHimalayasJobsPage(search, page) {
  const url = new URL(HIMALAYAS_URL);

  url.searchParams.set("sort", "recent");
  url.searchParams.set("page", String(page));

  if (search) {
    url.searchParams.set("q", search);
  }

  let response;

  try {
    response = await fetchWithTimeout(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "job-intel-mvp/0.1"
      }
    }, REMOTIVE_TIMEOUT_MS);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw makeSourceError(`Himalayas request timed out after ${REMOTIVE_TIMEOUT_MS}ms.`, "timeout");
    }

    throw makeSourceError("Himalayas request failed before a response was received.", "network_error");
  }

  if (!response.ok) {
    throw makeSourceError(`Himalayas fetch failed with status ${response.status}.`, "http_error");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw makeSourceError("Himalayas returned invalid JSON.", "invalid_json");
  }

  if (!data || typeof data !== "object" || !Array.isArray(data.jobs)) {
    throw makeSourceError("Himalayas returned an unexpected response shape.", "invalid_shape");
  }

  return data;
}

function normalizeHimalayasJob(job) {
  if (!job || typeof job !== "object") {
    return null;
  }

  const title = cleanOptionalText(job.title);
  const company = cleanOptionalText(job.companyName);

  if (!title || !company) {
    return null;
  }

  const location = formatHimalayasLocation(job.locationRestrictions, job.timezoneRestrictions || job.timezoneRestriction);

  return {
    title,
    company,
    location: location || "Remote",
    source: HIMALAYAS_SOURCE_NAME,
    source_job_id: cleanSourceId(job.guid),
    url: normalizeUrlFromBase(job.applicationLink, HIMALAYAS_URL),
    employment_type: cleanOptionalText(job.employmentType) || null,
    salary: normalizeHimalayasCompensation(job),
    description: cleanSourceDescription(job.excerpt, job.description),
    category: normalizeHimalayasCategory(job)
  };
}

function buildHimalayasSearch(profile) {
  return buildRemotiveSearch(profile);
}

function formatHimalayasLocation(locationRestrictions, timezoneRestrictions) {
  if (Array.isArray(locationRestrictions) && locationRestrictions.length) {
    return locationRestrictions
      .map((location) => cleanOptionalText(location?.name || location?.slug || location?.alpha2 || location))
      .filter(Boolean)
      .join(", ");
  }

  if (Array.isArray(timezoneRestrictions) && timezoneRestrictions.length) {
    const timezones = timezoneRestrictions.map(cleanOptionalText).filter(Boolean);

    if (timezones.length) {
      return `Remote (${timezones.join(", ")})`;
    }
  }

  return "Remote";
}

async function fetchArbeitnowJobs(profile) {
  const search = buildArbeitnowSearch(profile);
  let droppedCount = 0;
  const jobs = [];
  let pagesFetched = 0;

  for (let page = 1; page <= ARBEITNOW_MAX_PAGES; page += 1) {
    const data = await fetchArbeitnowJobsPage(search, page);
    pagesFetched += 1;

    if (data.jobs.length === 0) {
      break;
    }

    for (const job of data.jobs) {
      const normalizedJob = normalizeArbeitnowJob(job);

      if (normalizedJob) {
        jobs.push(normalizedJob);
      } else {
        droppedCount += 1;
      }
    }
  }

  return makeSourceResult(jobs, droppedCount, {
    pagesFetched
  });
}

async function fetchArbeitnowJobsPage(search, page) {
  const url = new URL(ARBEITNOW_URL);

  url.searchParams.set("page", String(page));

  if (search) {
    url.searchParams.set("q", search);
  }

  let response;

  try {
    response = await fetchWithTimeout(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "job-intel-mvp/0.1"
      }
    }, REMOTIVE_TIMEOUT_MS);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw makeSourceError(`Arbeitnow request timed out after ${REMOTIVE_TIMEOUT_MS}ms.`, "timeout");
    }

    throw makeSourceError("Arbeitnow request failed before a response was received.", "network_error");
  }

  if (!response.ok) {
    throw makeSourceError(`Arbeitnow fetch failed with status ${response.status}.`, "http_error");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw makeSourceError("Arbeitnow returned invalid JSON.", "invalid_json");
  }

  if (!data || typeof data !== "object" || !Array.isArray(data.data)) {
    throw makeSourceError("Arbeitnow returned an unexpected response shape.", "invalid_shape");
  }

  return {
    jobs: data.data
  };
}

function normalizeArbeitnowJob(job) {
  if (!job || typeof job !== "object") {
    return null;
  }

  const title = cleanOptionalText(job.title);
  const company = cleanOptionalText(job.company_name);

  if (!title || !company) {
    return null;
  }

  return {
    title,
    company,
    location: formatArbeitnowLocation(job.remote, job.location),
    source: ARBEITNOW_SOURCE_NAME,
    source_job_id: cleanSourceId(job.slug),
    url: normalizeUrlFromBase(job.url, ARBEITNOW_URL),
    employment_type: Array.isArray(job.job_types) ? job.job_types.map(cleanOptionalText).filter(Boolean).join(", ") || null : null,
    salary: null,
    description: cleanHtml(job.description || ""),
    category: Array.isArray(job.tags) ? job.tags.map(cleanOptionalText).filter(Boolean).join(", ") : ""
  };
}

function buildArbeitnowSearch(profile) {
  return buildRemotiveSearch(profile);
}

function formatArbeitnowLocation(remote, location) {
  const locationText = cleanOptionalText(location);

  if (remote === true) {
    return "Remote";
  }

  return locationText;
}

async function fetchRemoteOkJobs() {
  let response;

  try {
    response = await fetchWithTimeout(REMOTEOK_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "job-intel-mvp/0.1"
      }
    }, REMOTEOK_TIMEOUT_MS);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw makeSourceError(`RemoteOK request timed out after ${REMOTEOK_TIMEOUT_MS}ms.`, "timeout");
    }

    throw makeSourceError("RemoteOK request failed before a response was received.", "network_error");
  }

  if (!response.ok) {
    throw makeSourceError(`RemoteOK fetch failed with status ${response.status}.`, "http_error");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw makeSourceError("RemoteOK returned invalid JSON.", "invalid_json");
  }

  if (!Array.isArray(data)) {
    throw makeSourceError("RemoteOK returned an unexpected response shape.", "invalid_shape");
  }

  let droppedCount = 0;
  let consideredCount = 0;
  const jobs = [];

  for (const item of data) {
    if (isRemoteOkMetadataRow(item)) {
      continue;
    }

    if (consideredCount >= REMOTEOK_MAX_JOBS) {
      break;
    }

    consideredCount += 1;
    const normalizedJob = normalizeRemoteOkJob(item);

    if (normalizedJob) {
      jobs.push(normalizedJob);
    } else {
      droppedCount += 1;
    }
  }

  return makeSourceResult(jobs, droppedCount, {
    maxJobs: REMOTEOK_MAX_JOBS
  });
}

function isRemoteOkMetadataRow(item) {
  return Boolean(
    item &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    (Object.prototype.hasOwnProperty.call(item, "legal") || Object.prototype.hasOwnProperty.call(item, "last_updated")) &&
    !Object.prototype.hasOwnProperty.call(item, "position")
  );
}

function normalizeRemoteOkJob(job) {
  if (!job || typeof job !== "object") {
    return null;
  }

  const title = cleanOptionalText(job.position);
  const company = cleanOptionalText(job.company);
  const url = normalizeRemoteOkJobUrl(job.url, job.apply_url);

  if (!title || !company || !url) {
    return null;
  }

  return {
    title,
    company,
    location: cleanOptionalText(job.location) || "Remote",
    source: REMOTEOK_SOURCE_NAME,
    source_job_id: cleanSourceId(job.id),
    url,
    employment_type: null,
    salary: normalizeRemoteOkSalary(job.salary_min, job.salary_max),
    description: cleanRemoteOkDescription(job.description || ""),
    category: Array.isArray(job.tags) ? job.tags.map(cleanOptionalText).filter(Boolean).join(", ") : ""
  };
}

function normalizeRemoteOkJobUrl(...values) {
  for (const value of values) {
    const normalized = normalizeUrlFromBase(value, REMOTEOK_URL);

    if (!normalized) {
      continue;
    }

    const url = new URL(normalized);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname === "remoteok.com") {
      return url.toString();
    }
  }

  return null;
}

function normalizeRemoteOkSalary(minSalary, maxSalary) {
  const min = normalizePositiveNumber(minSalary);
  const max = normalizePositiveNumber(maxSalary);

  if (min && max) {
    return `${formatSalaryAmount(min)} - ${formatSalaryAmount(max)}`;
  }

  if (min) {
    return `${formatSalaryAmount(min)}+`;
  }

  return null;
}

function normalizePositiveNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : null;
}

function cleanRemoteOkDescription(value) {
  const cleaned = cleanHtml(value)
    .replace(/\bPlease mention the word\b[\s\S]*?\bwhen applying to show you read the job post completely\.?/gi, " ")
    .replace(/\(#[A-Za-z0-9:_-]{20,}\)/g, " ")
    .replace(/\bThis is a beta feature to avoid spam applicants\.[\s\S]*?\bsee they're human\.?/gi, " ");

  return limitText(cleaned, 1800);
}

function normalizeHimalayasCategory(job) {
  const categories = Array.isArray(job.categories) ? job.categories : job.category;
  const categoryList = Array.isArray(categories) ? categories : [];
  return categoryList.map(cleanOptionalText).filter(Boolean).join(", ");
}

function cleanSourceDescription(...parts) {
  const cleanedParts = parts
    .map((part) => cleanHtml(part || ""))
    .filter(Boolean);

  return dedupeAdjacentSentences(cleanedParts.join(" "));
}

function dedupeAdjacentSentences(text) {
  const cleaned = cleanText(text);

  if (!cleaned) {
    return "";
  }

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
  const result = [];

  for (const sentence of sentences) {
    const normalizedSentence = normalizeSearchText(sentence);

    if (!normalizedSentence) {
      continue;
    }

    const previous = result[result.length - 1];
    const normalizedPrevious = previous ? normalizeSearchText(previous) : "";

    if (previous && (
      normalizedSentence === normalizedPrevious ||
      normalizedSentence.includes(normalizedPrevious) ||
      normalizedPrevious.includes(normalizedSentence)
    )) {
      result[result.length - 1] = sentence.trim().length > previous.length ? sentence.trim() : previous;
    } else {
      result.push(sentence.trim());
    }
  }

  return cleanText(result.join(" "));
}

function normalizeHimalayasCompensation(job) {
  const minSalary = Number(job.minSalary);
  const maxSalary = Number(job.maxSalary);
  const currency = cleanOptionalText(job.currency);
  const hasMin = Number.isFinite(minSalary) && minSalary > 0;
  const hasMax = Number.isFinite(maxSalary) && maxSalary > 0;

  if (!hasMin && !hasMax) {
    return null;
  }

  const prefix = currency ? `${currency} ` : "";

  if (hasMin && hasMax) {
    return `${prefix}${formatSalaryAmount(minSalary)} - ${formatSalaryAmount(maxSalary)}`;
  }

  return hasMin ? `${prefix}${formatSalaryAmount(minSalary)}+` : `Up to ${prefix}${formatSalaryAmount(maxSalary)}`;
}

function formatSalaryAmount(value) {
  return Math.round(value).toLocaleString("en-US");
}

function buildRemotiveSearch(profile) {
  const terms = [...profile.target_roles, ...profile.strongest_skills, ...profile.skills, ...profile.keywords]
    .map(cleanText)
    .filter(Boolean)
    .filter((term) => normalizeSearchText(term) !== "remote");

  return terms[0] || "";
}

class RealPythonJobParser {
  constructor() {
    this.jobs = [];
    this.currentJob = null;
    this.currentLink = null;
  }

  cardHandler() {
    return {
      element: () => {
        this.currentJob = {
          title: "",
          company: "",
          location: "",
          url: null
        };
        this.jobs.push(this.currentJob);
      }
    };
  }

  textHandler(field) {
    return {
      text: (text) => {
        if (this.currentJob) {
          this.currentJob[field] += text.text;
        }
      }
    };
  }

  linkHandler() {
    return {
      element: (element) => {
        const href = element.getAttribute("href");
        this.currentLink = {
          href,
          label: ""
        };

        element.onEndTag(() => {
          if (this.currentJob && !this.currentJob.url && this.currentLink?.label.toLowerCase().includes("apply")) {
            this.currentJob.url = this.currentLink.href;
          }
          this.currentLink = null;
        });
      },
      text: (text) => {
        if (this.currentLink) {
          this.currentLink.label += text.text;
        }
      }
    };
  }
}

function normalizeUrl(value) {
  return normalizeHttpUrl(value, REAL_PYTHON_URL);
}

function normalizeUrlFromBase(value, baseUrl) {
  return normalizeHttpUrl(value, baseUrl);
}

function normalizeHttpUrl(value, baseUrl) {
  const cleaned = cleanOptionalText(value);

  if (!cleaned) {
    return null;
  }

  try {
    const url = new URL(cleaned, baseUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function dedupeJobs(jobs) {
  const seen = new Set();
  const unique = [];

  for (const job of jobs) {
    const key = makeDedupeKey(job);

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }

  return unique;
}

function makeDedupeKey(job) {
  const source = normalizeForCompare(job.source || SOURCE_NAME);
  const sourceId = cleanSourceId(job.source_job_id);

  if (sourceId) {
    return `${source}|source_id|${normalizeForCompare(sourceId)}`;
  }

  return [
    source,
    normalizeForCompare(job.title),
    normalizeForCompare(job.company),
    canonicalizeUrlForCompare(job.url)
  ].join("|");
}

function formatJob(job, profile, ingestedAt) {
  const scoring = scoreJob(job, profile);

  return {
    title: job.title,
    company: job.company,
    location: job.location || null,
    employment_type: job.employment_type || null,
    salary: job.salary || null,
    source: job.source || SOURCE_NAME,
    url: job.url,
    normalized: {
      title: normalizeForCompare(job.title),
      company: normalizeForCompare(job.company)
    },
    scoring,
    summary: makeSummary(job, scoring),
    details: makeDetails(job),
    metadata: {
      ingested_at: ingestedAt,
      source_type: getMetadataSourceType(job.source),
      source_job_id: cleanSourceId(job.source_job_id) || null
    }
  };
}

function getMetadataSourceType(sourceName) {
  if ([REMOTIVE_SOURCE_NAME, HIMALAYAS_SOURCE_NAME, ARBEITNOW_SOURCE_NAME, REMOTEOK_SOURCE_NAME].includes(sourceName)) {
    return "api";
  }

  if (sourceName === MANUAL_SOURCE_NAME) {
    return "manual";
  }

  return "scraper";
}

function makeStableJobId(job) {
  const sourceType = getStableSourceKey(job);
  const sourceJobId = cleanSourceId(job.metadata.source_job_id);

  if (sourceJobId) {
    return `${sourceType}_${slugForId(sourceJobId)}`;
  }

  return `${sourceType}_${stableHash([
    job.normalized.title,
    job.normalized.company,
    canonicalizeUrlForCompare(job.url)
  ].join("|"))}`;
}

function getStableSourceKey(job) {
  if (job.source === REMOTIVE_SOURCE_NAME) {
    return "remotive";
  }

  if (job.source === HIMALAYAS_SOURCE_NAME) {
    return "himalayas";
  }

  if (job.source === ARBEITNOW_SOURCE_NAME) {
    return "arbeitnow";
  }

  if (job.source === REMOTEOK_SOURCE_NAME) {
    return "remoteok";
  }

  if (job.source === MANUAL_SOURCE_NAME) {
    return "manual";
  }

  return "realpython_fake_jobs";
}

function slugForId(value) {
  return normalizeSearchText(value).replace(/\s+/g, "_") || stableHash(value);
}

function stableHash(value) {
  let hash = 5381;
  const text = String(value);

  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(index);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function canonicalizeUrlForCompare(value) {
  const normalized = normalizeHttpUrl(value, REMOTIVE_URL);

  if (!normalized) {
    return "";
  }

  const url = new URL(normalized);
  const removableParams = ["fbclid", "gclid", "msclkid"];

  url.hash = "";

  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || removableParams.includes(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }

  url.searchParams.sort();
  return url.toString();
}

function buildScoringContext(job, profile) {
  const title = normalizeSearchText(job.title);
  const company = normalizeSearchText(job.company);
  const location = normalizeSearchText(job.location);
  const categoryText = normalizeSearchText(job.category || "");
  const descriptionText = normalizeSearchText(job.description || "");
  const summaryText = normalizeSearchText(`${job.company} ${job.location} ${job.category || ""} ${job.description || ""}`);
  const searchableText = `${title} ${summaryText}`;
  const profileText = normalizeSearchText(
    [...profile.target_roles, ...profile.skills, ...profile.keywords, profile.experience_level].join(" ")
  );

  return {
    job,
    profile,
    title,
    company,
    location,
    categoryText,
    descriptionText,
    summaryText,
    searchableText,
    profileText
  };
}

function scoreJob(job, profile) {
  const context = buildScoringContext(job, profile);
  const roleSignal = evaluateSignals(profile.target_roles, context.title, context.descriptionText, "role", context.categoryText);
  const skillSignal = evaluateSignals(profile.skills, context.title, context.summaryText, "skill");
  const keywordSignal = evaluateSignals(profile.keywords, context.title, context.summaryText, "keyword");
  const strongestSkillSignal = evaluateSignals(profile.strongest_skills, context.title, context.summaryText, "strongest_skill");
  const roleDomainSignal = evaluateRoleDomain(context);
  const hasAlignedRoleOrSkill = hasAlignedRoleOrSkillEvidence({ roleSignal, skillSignal, strongestSkillSignal, roleDomainSignal });
  const seniorComplexityAligned = profile.experience_level === "senior" && hasAlignedRoleOrSkill;
  const senioritySignal = evaluateSeniority(context, { hasAlignedRoleOrSkill });
  const roleContextSignal = evaluateRoleContext(context);
  const complexitySignal = evaluateComplexity(context, { seniorComplexityAligned });
  const scriptIntentSignal = evaluateScriptIntent(context);
  const avoidSignal = evaluateAvoidKeywords(context);
  const taskFitTieBreakerSignal = evaluateTaskFitTieBreaker(context, { seniorComplexityAligned });
  const executionSignal = evaluateExecutionLikelihood({
    profile,
    title: context.title,
    searchableText: context.searchableText,
    strongestSkillSignal,
    complexitySignal,
    avoidSignal
  });
  const locationWorkModeSignal = evaluateLocationWorkMode(context);
  const broadRoleProtectionSignal = evaluateBroadRoleIdentityProtection(context, roleSignal);

  const components = {
    role_match_score: roleSignal.points,
    skill_match_score: skillSignal.points + strongestSkillSignal.points,
    keyword_match_score: keywordSignal.points,
    seniority_match_score: senioritySignal.points,
    execution_likelihood_score: executionSignal.points + taskFitTieBreakerSignal.points,
    location_workmode_score: locationWorkModeSignal.points,
    penalties: senioritySignal.penalty + avoidSignal.penalty
  };

  components.role_match_score += roleContextSignal.points;
  components.role_match_score += roleDomainSignal.points;
  components.skill_match_score += scriptIntentSignal.points;
  components.penalties += roleContextSignal.penalty + roleDomainSignal.penalty + complexitySignal.penalty + scriptIntentSignal.penalty;
  components.penalties += taskFitTieBreakerSignal.penalty;
  components.penalties += locationWorkModeSignal.penalty;

  const rawScore =
    SCORING_WEIGHTS.baseScore +
    components.role_match_score +
    components.skill_match_score +
    components.keyword_match_score +
    components.seniority_match_score +
    components.execution_likelihood_score +
    components.location_workmode_score +
    components.penalties;
  const baseScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const supportRelevanceFloor = getSupportRoleRelevanceFloor({
    score: baseScore,
    context,
    senioritySignal,
    complexitySignal,
    avoidSignal
  });
  const score = Math.min(Math.max(baseScore, supportRelevanceFloor), broadRoleProtectionSignal.scoreCap);
  executionSignal.label = executionLabel({
    score,
    value: executionSignal.value,
    roleSignal,
    skillSignal,
    senioritySignal,
    roleDomainSignal,
    complexitySignal,
    avoidSignal,
    seniorComplexityAligned,
    supportRelevanceFloorApplied: supportRelevanceFloor > baseScore,
    broadRoleProtectionApplied: broadRoleProtectionSignal.scoreCap < 100
  });

  const matchReasons = buildMatchReasons({
    roleSignal,
    skillSignal,
    strongestSkillSignal,
    keywordSignal,
    senioritySignal,
    roleContextSignal,
    roleDomainSignal,
    broadRoleProtectionSignal,
    complexitySignal,
    scriptIntentSignal,
    avoidSignal,
    executionSignal,
    taskFitTieBreakerSignal,
    locationWorkModeSignal
  });

  return {
    score,
    match_reasons: matchReasons,
    execution_likelihood: executionSignal.label,
    components: roundComponents(components)
  };
}

function hasImplementationRoleTitle(title) {
  return ["programmer", "developer", "engineer", "software engineer", "software developer"].some((term) =>
    containsPhrase(title, normalizeSearchText(term))
  );
}

function evaluateBroadRoleIdentityProtection(context, roleSignal) {
  const protectedFamily = getProtectedBroadRoleFamily(context.profile);

  if (!protectedFamily) {
    return makeScoringSignal({ status: "none", scoreCap: 100, family: null, mismatches: [] });
  }

  if (hasBroadRoleTitleEvidence(context.title, protectedFamily)) {
    return makeScoringSignal({ status: "title_aligned", scoreCap: 100, family: protectedFamily.family, mismatches: [] });
  }

  const mismatchTerms = getOccupationalMismatchTerms(context.title);
  const hasCategoryOnlyRoleEvidence = roleSignal.bestStrength === "category_phrase";
  const hasStrongDescriptionEvidence = hasBroadRoleDescriptionEvidence(context.descriptionText, protectedFamily);

  if (hasCategoryOnlyRoleEvidence && mismatchTerms.length && !hasStrongDescriptionEvidence) {
    return makeScoringSignal({
      status: "category_only_occupational_mismatch",
      scoreCap: BROAD_ROLE_UNRELATED_CAP,
      family: protectedFamily.family,
      mismatches: mismatchTerms,
      reasons: ["Unrelated occupation for category/tag-only match"]
    });
  }

  if (hasCategoryOnlyRoleEvidence && !hasStrongDescriptionEvidence) {
    return makeScoringSignal({
      status: "category_only_broad_role_match",
      scoreCap: BROAD_ROLE_RECOMMENDATION_CAP,
      family: protectedFamily.family,
      mismatches: [],
      reasons: ["Category/tag overlap only"]
    });
  }

  if (hasImplementationRoleTitle(context.title)) {
    return makeScoringSignal({
      status: "implementation_role_mismatch",
      scoreCap: BROAD_ROLE_RECOMMENDATION_CAP,
      family: protectedFamily.family,
      mismatches: ["implementation"],
      reasons: ["Role-title mismatch penalty for broad role search"]
    });
  }

  return makeScoringSignal({ status: "none", scoreCap: 100, family: protectedFamily.family, mismatches: [] });
}

function getProtectedBroadRoleFamily(profile) {
  const targetRoleText = normalizeSearchText(profile.target_roles.join(" "));

  if (!targetRoleText) {
    return null;
  }

  return BROAD_ROLE_PROTECTED_FAMILIES.find((family) =>
    family.queryTerms.some((term) => containsPhrase(targetRoleText, normalizeSearchText(term)))
  ) || null;
}

function hasBroadRoleTitleEvidence(title, protectedFamily) {
  return protectedFamily.titleEvidenceTerms.some((term) => containsPhrase(title, normalizeSearchText(term)));
}

function hasBroadRoleDescriptionEvidence(descriptionText, protectedFamily) {
  return protectedFamily.descriptionEvidenceTerms.some((term) => containsPhrase(descriptionText, normalizeSearchText(term)));
}

function getOccupationalMismatchTerms(title) {
  return BROAD_ROLE_OCCUPATIONAL_MISMATCH_TERMS.filter((term) => containsPhrase(title, normalizeSearchText(term)));
}

function evaluateSignals(queries, title, secondaryText, category, categoryText = "") {
  if (!queries.length) {
    return makeScoringSignal({ bestStrength: "none", weakMatches: 0, matchedQueries: [] });
  }

  const maxPoints = SCORING_WEIGHTS.signalMaxPoints[category] || SCORING_WEIGHTS.signalMaxPoints.keyword;
  let totalWeight = 0;
  let bestStrength = "none";
  let weakMatches = 0;
  const matchedQueries = [];

  for (const query of queries) {
    const signal = evaluateQuerySignal(query, title, secondaryText, category, categoryText);
    totalWeight += signal.weight;

    if (signal.strength === "weak" || signal.strength === "partial_token") {
      weakMatches += 1;
    }

    if (signal.strength !== "none") {
      matchedQueries.push({ query, strength: signal.strength });
    }

    if (strengthRank(signal.strength) > strengthRank(bestStrength)) {
      bestStrength = signal.strength;
    }
  }

  const averageWeight = Math.min(1, totalWeight / queries.length);
  const weakCap = bestStrength === "weak" ? maxPoints * SCORING_WEIGHTS.signalWeights.weakCapRatio : maxPoints;
  const signal = makeScoringSignal({
    points: Math.min(weakCap, averageWeight * maxPoints),
    bestStrength,
    weakMatches,
    matchedQueries
  });

  signal.reasons = makeSignalReasons(signal, category);
  return signal;
}

function getSupportRoleRelevanceFloor({ score, context, senioritySignal, complexitySignal, avoidSignal }) {
  if (score >= MIN_STRETCH_SCORE) {
    return 0;
  }

  if (!hasSupportIntent(context.profile) || !hasSupportRoleEvidence(context)) {
    return 0;
  }

  if (hasSupportRelevanceFloorBlocker(context, senioritySignal, complexitySignal, avoidSignal)) {
    return 0;
  }

  return MIN_STRETCH_SCORE;
}

function hasSupportIntent(profile) {
  const profileText = normalizeSearchText([...profile.target_roles, ...profile.keywords].join(" "));
  return SUPPORT_INTENT_TERMS.some((term) => containsPhrase(profileText, normalizeSearchText(term)));
}

function hasSupportRoleEvidence({ title, categoryText }) {
  const roleText = `${title} ${categoryText}`;
  return SUPPORT_ROLE_EVIDENCE_TERMS.some((term) => containsPhrase(roleText, normalizeSearchText(term)));
}

function hasSupportRelevanceFloorBlocker({ title, categoryText }, senioritySignal, complexitySignal, avoidSignal) {
  const roleText = `${title} ${categoryText}`;
  const hasBlockedRoleTerm = SUPPORT_RELEVANCE_FLOOR_BLOCKER_TERMS.some((term) => containsPhrase(roleText, term));
  const hasSeniorityGap = senioritySignal.status === "senior_too_high";
  const hasRoleComplexityGap =
    complexitySignal.status === "more_complex" &&
    complexitySignal.terms.some((term) => SUPPORT_RELEVANCE_FLOOR_BLOCKER_TERMS.includes(term));
  const avoidMatchesInRole = avoidSignal.matches.filter((keyword) => containsPhrase(roleText, normalizeSearchText(keyword)));
  const avoidHeavy = avoidSignal.matches.length >= 2 || avoidMatchesInRole.length > 0;

  return hasBlockedRoleTerm || hasSeniorityGap || hasRoleComplexityGap || avoidHeavy;
}

function evaluateQuerySignal(query, title, secondaryText, category, categoryText = "") {
  const phrase = normalizeSearchText(query);

  if (!phrase) {
    return { strength: "none", weight: 0 };
  }

  if (containsPhrase(title, phrase)) {
    return { strength: "title_phrase", weight: SCORING_WEIGHTS.signalWeights.titlePhrase };
  }

  if (category === "role" && containsPhrase(categoryText, phrase)) {
    return { strength: "category_phrase", weight: SCORING_WEIGHTS.signalWeights.categoryPhrase };
  }

  if (containsPhrase(secondaryText, phrase)) {
    return {
      strength: "secondary_phrase",
      weight:
        category === "role"
          ? SCORING_WEIGHTS.signalWeights.roleSecondaryPhrase
          : SCORING_WEIGHTS.signalWeights.secondaryPhrase
    };
  }

  const words = phrase.split(" ").filter(Boolean);
  const importantWords = words.filter((word) => !GENERIC_TOKENS.has(word) && word.length > 2);

  if (words.length === 1 && importantWords.length === 1 && containsWholeWord(title, importantWords[0])) {
    return {
      strength: "title_token",
      weight: category === "skill" ? SCORING_WEIGHTS.signalWeights.titleSkillToken : SCORING_WEIGHTS.signalWeights.titleToken
    };
  }

  if (words.length === 1 && importantWords.length === 1 && containsWholeWord(secondaryText, importantWords[0])) {
    return { strength: "secondary_token", weight: SCORING_WEIGHTS.signalWeights.secondaryToken };
  }

  if (importantWords.length >= 2 && wordsNearEachOther(importantWords, `${title} ${secondaryText}`)) {
    return { strength: "near_words", weight: SCORING_WEIGHTS.signalWeights.nearWords };
  }

  if (importantWords.length === 1 && containsWholeWord(`${title} ${secondaryText}`, importantWords[0])) {
    return { strength: "weak", weight: SCORING_WEIGHTS.signalWeights.weak };
  }

  return { strength: "none", weight: 0 };
}

function hasAlignedRoleOrSkillEvidence({ roleSignal, skillSignal, strongestSkillSignal, roleDomainSignal }) {
  const roleStrengths = new Set(["title_phrase", "title_token", "category_phrase"]);
  const skillStrengths = new Set(["title_phrase", "title_token", "secondary_phrase", "secondary_token", "near_words"]);
  const hasRoleAlignment = roleStrengths.has(roleSignal.bestStrength);
  const hasSkillAlignment =
    skillStrengths.has(skillSignal.bestStrength) ||
    strongestSkillSignal.bestStrength !== "none";

  return hasRoleAlignment || (hasSkillAlignment && roleDomainSignal.related);
}

function evaluateSeniority({ profileText, title }, { hasAlignedRoleOrSkill = true } = {}) {
  const wantsEntry = ENTRY_LEVEL_TERMS.some((term) => containsPhrase(profileText, term));
  const wantsSenior = SENIOR_LEVEL_TERMS.some((term) => containsPhrase(profileText, term));
  const titleHasEntry = ENTRY_LEVEL_TERMS.some((term) => containsPhrase(title, term));
  const titleHasSenior = SENIOR_LEVEL_TERMS.some((term) => containsPhrase(title, term));

  if (wantsEntry && !wantsSenior) {
    if (titleHasEntry) {
      return makeScoringSignal({
        points: SCORING_WEIGHTS.seniority.matchedEntry,
        preference: "entry",
        status: "matched_entry",
        reasons: ["Junior/entry-level workflow detected"]
      });
    }

    if (titleHasSenior) {
      return makeScoringSignal({
        penalty: SCORING_WEIGHTS.seniority.seniorTooHighPenalty,
        preference: "entry",
        status: "senior_too_high",
        reasons: ["Seniority may be higher than requested"]
      });
    }

    return makeScoringSignal({ preference: "entry", status: "neutral" });
  }

  if (wantsSenior) {
    if (titleHasSenior && hasAlignedRoleOrSkill) {
      return makeScoringSignal({
        points: SCORING_WEIGHTS.seniority.matchedSenior,
        preference: "senior",
        status: "matched_senior",
        reasons: ["Senior-level workflow matches your profile"]
      });
    }

    if (titleHasEntry && hasAlignedRoleOrSkill) {
      return makeScoringSignal({
        penalty: SCORING_WEIGHTS.seniority.tooJuniorPenalty,
        preference: "senior",
        status: "too_junior",
        reasons: ["Seniority may be lower than requested"]
      });
    }

    return makeScoringSignal({ preference: "senior", status: "neutral" });
  }

  return makeScoringSignal({ preference: "none", status: "neutral" });
}

function evaluateRoleContext({ profile, title, job }) {
  const broadRole = profile.target_roles
    .map(normalizeSearchText)
    .find((role) => role && role.split(" ").length === 1 && !GENERIC_TOKENS.has(role));

  if (!broadRole || !containsWholeWord(title, broadRole)) {
    return makeScoringSignal({ status: "none", term: null });
  }

  const tokens = title.split(" ").filter(Boolean);
  const index = tokens.indexOf(broadRole);
  const inParentheses = titleContainsParentheticalTerm(job.title, broadRole);
  const hasComplexPrefix = tokens.slice(0, index).some((token) => ["senior", "staff", "principal", "lead"].includes(token));
  const roleTerm = displayTerm(broadRole);

  if (index === 0 && tokens.includes("programmer")) {
    return makeScoringSignal({
      points: SCORING_WEIGHTS.roleContext.primaryProgrammer,
      status: "primary",
      term: broadRole,
      reasons: [`${roleTerm} role is central to the title`]
    });
  }

  if (index === 0 && tokens.includes("developer")) {
    return makeScoringSignal({
      points: SCORING_WEIGHTS.roleContext.primaryDeveloper,
      status: "primary",
      term: broadRole,
      reasons: [`${roleTerm} role is central to the title`]
    });
  }

  if (index === 0) {
    return makeScoringSignal({
      points: SCORING_WEIGHTS.roleContext.primary,
      status: "primary",
      term: broadRole,
      reasons: [`${roleTerm} role is central to the title`]
    });
  }

  if (inParentheses) {
    return makeScoringSignal({
      ...SCORING_WEIGHTS.roleContext.secondaryTechnology,
      status: "secondary_technology",
      term: broadRole,
      reasons: [`${roleTerm} is a secondary technical specialization`]
    });
  }

  if (hasComplexPrefix) {
    return makeScoringSignal({
      ...SCORING_WEIGHTS.roleContext.complexSecondary,
      status: "complex_secondary",
      term: broadRole,
      reasons: [`${roleTerm} appears in a higher-complexity title`]
    });
  }

  if (index > 0 && index <= 2 && tokens.some((token) => SCRIPT_FRIENDLY_TERMS.includes(token))) {
    return makeScoringSignal({
      points: SCORING_WEIGHTS.roleContext.mainPhrase,
      status: "main_phrase",
      term: broadRole,
      reasons: [`${roleTerm} role is central to the title`]
    });
  }

  return makeScoringSignal({
    ...SCORING_WEIGHTS.roleContext.fallbackSecondary,
    status: "secondary_technology",
    term: broadRole,
    reasons: [`${roleTerm} is a secondary technical specialization`]
  });
}

function evaluateRoleDomain({ profile, profileText, title, categoryText }) {
  const text = `${title} ${categoryText}`;
  const isTechnicalProfile = TECH_PROFILE_TERMS.some((term) => containsPhrase(profileText, normalizeSearchText(term)));
  const requestedOffDomain = OFF_DOMAIN_ROLE_TERMS.some((term) => containsPhrase(profileText, term));

  if (!isTechnicalProfile) {
    return makeScoringSignal({ status: "neutral", related: false, offDomain: false, platformMismatch: false });
  }

  const technicalMatch = TECH_ROLE_TERMS.some((term) => containsPhrase(text, normalizeSearchText(term)));
  const offDomainMatch = OFF_DOMAIN_ROLE_TERMS.some((term) => containsPhrase(text, term));
  const requestedPlatform = PLATFORM_MISMATCH_TERMS.some((term) => containsPhrase(profileText, term));
  const platformMismatch =
    !requestedPlatform && PLATFORM_MISMATCH_TERMS.some((term) => containsPhrase(text, term));
  const reasons = [];

  if (technicalMatch) {
    reasons.push(makeRoleDomainReason(text));
  }

  if (offDomainMatch && !requestedOffDomain) {
    reasons.push("Office/admin/sales focus may be outside this software search");
  }

  return makeScoringSignal({
    status: technicalMatch ? "technical_alignment" : offDomainMatch && !requestedOffDomain ? "off_domain" : "neutral",
    related: technicalMatch,
    offDomain: offDomainMatch && !requestedOffDomain,
    platformMismatch,
    points: technicalMatch ? SCORING_WEIGHTS.roleDomain.technicalAlignment : 0,
    penalty: offDomainMatch && !requestedOffDomain ? -SCORING_WEIGHTS.roleDomain.offDomainPenalty : 0,
    reasons
  });
}

function makeRoleDomainReason(text) {
  if (["ios", "android", "mobile", "swift", "kotlin"].some((term) => containsPhrase(text, term))) {
    return "Mobile platform specialization may require additional skills";
  }

  if (["support", "operations", "assistant"].some((term) => containsPhrase(text, term))) {
    return "Technical support/operations overlap detected";
  }

  if (["frontend", "front end", "react", "javascript", "typescript"].some((term) => containsPhrase(text, term))) {
    return "Frontend-oriented technical role";
  }

  return "Software/technical role alignment";
}

function titleContainsParentheticalTerm(rawTitle, term) {
  const matches = String(rawTitle).match(/\(([^)]+)\)/g) || [];
  return matches.some((match) => containsWholeWord(normalizeSearchText(match), term));
}

function evaluateComplexity({ profileText, title }, { seniorComplexityAligned = false } = {}) {
  const requestedTerms = COMPLEXITY_TERMS.filter((term) => containsPhrase(profileText, term));
  const titleTerms = COMPLEXITY_TERMS.filter((term) => containsPhrase(title, term));
  const unrequestedTerms = titleTerms.filter((term) => !requestedTerms.includes(term));

  if (!unrequestedTerms.length) {
    return makeScoringSignal({ status: "neutral", terms: [] });
  }

  const penalty = unrequestedTerms.reduce((total, term) => {
    if (["senior", "staff", "principal", "lead", "manager"].includes(term)) {
      return total + SCORING_WEIGHTS.complexity.highPenalty;
    }

    if (["architect", "engineer", "backend", "back end", "5 years", "8 years", "enterprise", "architecture"].includes(term)) {
      return total + SCORING_WEIGHTS.complexity.mediumPenalty;
    }

    return total + SCORING_WEIGHTS.complexity.fallbackPenalty;
  }, 0);
  const penaltyCap = seniorComplexityAligned ? SCORING_WEIGHTS.complexity.seniorAlignedCap : SCORING_WEIGHTS.complexity.cap;
  const adjustedPenalty = seniorComplexityAligned
    ? Math.ceil(penalty * SCORING_WEIGHTS.complexity.seniorAlignedMultiplier)
    : penalty;

  return makeScoringSignal({
    status: "more_complex",
    penalty: -Math.min(penaltyCap, adjustedPenalty),
    terms: unrequestedTerms,
    reasons: ["Seniority or architecture complexity detected"]
  });
}

function evaluateAvoidKeywords({ profile, title, summaryText }) {
  const text = `${title} ${summaryText}`;
  const matches = profile.avoid_keywords.filter((keyword) => {
    const normalized = normalizeSearchText(keyword);
    return normalized && containsPhrase(text, normalized);
  });

  return makeScoringSignal({
    matches,
    penalty: -Math.min(SCORING_WEIGHTS.avoidKeywords.cap, matches.length * SCORING_WEIGHTS.avoidKeywords.penaltyPerMatch),
    reasons: matches.map((keyword) => `Avoid keyword detected: ${keyword}`)
  });
}

function evaluateTaskFitTieBreaker({ summaryText }, { seniorComplexityAligned = false } = {}) {
  const simpleMatches = SIMPLE_TASK_TERMS.filter((term) => containsPhrase(summaryText, term));
  const complexityMatches = DESCRIPTION_COMPLEXITY_TERMS.filter((term) => containsPhrase(summaryText, term));
  const automationMatches = getJobAutomationMatches(summaryText);
  const points = Math.min(
    SCORING_WEIGHTS.taskFitTieBreaker.simpleBoostCap,
    simpleMatches.length * SCORING_WEIGHTS.taskFitTieBreaker.simpleTermBoost
  );
  const complexityPenaltyCap = seniorComplexityAligned
    ? SCORING_WEIGHTS.taskFitTieBreaker.seniorAlignedComplexityPenaltyCap
    : SCORING_WEIGHTS.taskFitTieBreaker.complexityPenaltyCap;
  const penalty = -Math.min(
    complexityPenaltyCap,
    complexityMatches.length * SCORING_WEIGHTS.taskFitTieBreaker.complexityTermPenalty
  );
  const reasons = [];

  if (points > 0) {
    reasons.push(makeTaskFitReason(simpleMatches, automationMatches));
  }

  if (penalty < 0) {
    reasons.push("Platform or architecture complexity detected");
  }

  return makeScoringSignal({
    points,
    penalty,
    simpleMatches,
    automationMatches,
    complexityMatches,
    reasons
  });
}

function getJobAutomationMatches(text) {
  return JOB_AUTOMATION_TERMS.filter((term) => containsPhrase(text, normalizeSearchText(term)));
}

function makeTaskFitReason(simpleMatches, automationMatches = []) {
  if (automationMatches.length > 0) {
    return "Automation-oriented responsibilities detected";
  }

  return "Lower-complexity implementation work";
}

function evaluateExecutionLikelihood({ profile, title, searchableText, strongestSkillSignal, complexitySignal, avoidSignal }) {
  let value = SCORING_WEIGHTS.executionLikelihood.base;
  const wantsJunior = ["beginner", "junior"].includes(profile.experience_level);
  const wantsSenior = profile.experience_level === "senior";
  const titleHasJunior = JUNIOR_LEVEL_TERMS.some((term) => containsPhrase(title, term));
  const titleHasSenior = SENIOR_LEVEL_TERMS.some((term) => containsPhrase(title, term));
  const titleHasComplexity = COMPLEXITY_TERMS.some((term) => containsPhrase(searchableText, term));

  if (wantsJunior) {
    if (titleHasJunior) {
      value += SCORING_WEIGHTS.executionLikelihood.juniorTitleBoost;
    }

    if (titleHasSenior) {
      value += SCORING_WEIGHTS.executionLikelihood.juniorSeniorPenalty;
    }

    if (titleHasComplexity) {
      value += SCORING_WEIGHTS.executionLikelihood.juniorComplexityPenalty;
    }
  } else if (wantsSenior) {
    if (titleHasSenior) {
      value += SCORING_WEIGHTS.executionLikelihood.seniorTitleBoost;
    }

    if (titleHasJunior) {
      value += SCORING_WEIGHTS.executionLikelihood.seniorJuniorPenalty;
    }
  } else if (profile.experience_level === "intermediate") {
    if (titleHasSenior) {
      value += SCORING_WEIGHTS.executionLikelihood.intermediateSeniorPenalty;
    }
  }

  if (strongestSkillSignal.points > 0) {
    value += Math.min(SCORING_WEIGHTS.executionLikelihood.strongestSkillBoostCap, strongestSkillSignal.points);
  }

  if (!wantsSenior && complexitySignal.status === "more_complex") {
    value -= Math.min(SCORING_WEIGHTS.executionLikelihood.complexityPenaltyCap, Math.abs(complexitySignal.penalty));
  }

  value += avoidSignal.penalty;
  value = Math.max(0, Math.min(100, Math.round(value)));

  return makeScoringSignal({
    value,
    points: Math.round((value - SCORING_WEIGHTS.executionLikelihood.base) * SCORING_WEIGHTS.executionLikelihood.scoreMultiplier),
    label: "lower_match",
    reasons: makeExecutionLikelihoodReasons(value)
  });
}

function executionLabel({
  score,
  value,
  roleSignal,
  skillSignal,
  senioritySignal,
  roleDomainSignal,
  complexitySignal,
  avoidSignal,
  seniorComplexityAligned = false,
  supportRelevanceFloorApplied = false,
  broadRoleProtectionApplied = false
}) {
  const hasRealGap =
    ["senior_too_high", "too_junior"].includes(senioritySignal.status) ||
    (complexitySignal.status === "more_complex" && !seniorComplexityAligned) ||
    roleDomainSignal.platformMismatch ||
    avoidSignal.penalty < 0;
  const hasRelatedDomain =
    roleDomainSignal.related ||
    ["title_phrase", "title_token", "category_phrase"].includes(roleSignal.bestStrength) ||
    skillSignal.bestStrength !== "none";
  const hasWeakAlignment =
    roleDomainSignal.offDomain ||
    (!hasRelatedDomain && ["secondary_phrase", "secondary_token", "weak", "none"].includes(roleSignal.bestStrength));

  if (broadRoleProtectionApplied) {
    return "lower_match";
  }

  if (hasRealGap && score >= MIN_STRETCH_SCORE) {
    return "stretch";
  }

  if (score >= 76 && value >= SCORING_WEIGHTS.executionLikelihood.strongFitThreshold && !hasWeakAlignment) {
    return "strong_fit";
  }

  if (score >= 50 && value >= SCORING_WEIGHTS.executionLikelihood.possibleFitThreshold && !hasWeakAlignment) {
    return "possible_fit";
  }

  if (score >= 25 && hasRelatedDomain && !hasRealGap) {
    return "adjacent";
  }

  if (supportRelevanceFloorApplied && !hasRealGap) {
    return "adjacent";
  }

  return "lower_match";
}

function evaluateScriptIntent({ profile, title, summaryText, categoryText }) {
  const profileText = normalizeSearchText([...profile.skills, ...profile.keywords].join(" "));
  const hasScriptIntent = SCRIPT_INTENT_TERMS.some((term) => containsPhrase(profileText, term));
  const jobText = `${title} ${summaryText} ${categoryText}`;
  const hasJobAutomationEvidence = getJobAutomationMatches(jobText).length > 0;

  if (!hasScriptIntent || !hasJobAutomationEvidence) {
    return makeScoringSignal({ status: "none" });
  }

  const isProgrammer = containsPhrase(title, "programmer");
  const isDeveloper = containsPhrase(title, "developer");
  const isImplementationRole = SCRIPT_FRIENDLY_TERMS.some((term) => containsPhrase(title, term));
  const isComplexRole = ["senior", "staff", "principal", "lead", "architect", "engineer", "backend", "back end"].some((term) =>
    containsPhrase(title, term)
  );
  const implementationPoints = isProgrammer
    ? SCORING_WEIGHTS.scriptIntent.programmer
    : isDeveloper
      ? (isComplexRole ? SCORING_WEIGHTS.scriptIntent.complexDeveloper : SCORING_WEIGHTS.scriptIntent.simpleDeveloper)
      : isImplementationRole && !isComplexRole
        ? SCORING_WEIGHTS.scriptIntent.implementation
        : 0;

  return makeScoringSignal({
    status: isImplementationRole ? "implementation_favored" : "neutral",
    points: implementationPoints,
    penalty: isComplexRole ? SCORING_WEIGHTS.scriptIntent.complexPenalty : 0,
    reasons: isImplementationRole ? ["Implementation-oriented role signal"] : []
  });
}

function containsPhrase(text, phrase) {
  return new RegExp(`(^| )${escapeRegExp(phrase)}( |$)`).test(text);
}

function containsWholeWord(text, word) {
  return new RegExp(`(^| )${escapeRegExp(word)}( |$)`).test(text);
}

function wordsNearEachOther(words, text) {
  const tokens = text.split(" ").filter(Boolean);
  const positions = words.map((word) => tokens.findIndex((token) => token === word));

  if (positions.some((position) => position === -1)) {
    return false;
  }

  return Math.max(...positions) - Math.min(...positions) <= Math.max(4, words.length + 1);
}

function strengthRank(strength) {
  return {
    none: 0,
    weak: 1,
    partial_token: 1,
    secondary_token: 2,
    title_token: 3,
    near_words: 4,
    secondary_phrase: 5,
    category_phrase: 5,
    title_phrase: 6
  }[strength] || 0;
}

function evaluateLocationWorkMode({ profile, location, searchableText }) {
  const locationPreference = evaluateLocationPreference(profile.location, location, searchableText);
  const workModeMatch = getWorkModeMatch(profile.work_mode, searchableText);
  const remoteFriendly = workModeMatch === "matched" && isRemoteEligibleForProfile(locationPreference);
  const points =
    (locationPreference.status === "matched" || locationPreference.status === "compatible"
      ? SCORING_WEIGHTS.locationWorkMode.locationMatch
      : 0) +
    (remoteFriendly ? SCORING_WEIGHTS.locationWorkMode.workModeMatch : 0);
  const penalty =
    (locationPreference.status === "restricted_mismatch" ? locationPreference.penalty : 0) +
    (locationPreference.status === "mismatch" ? SCORING_WEIGHTS.locationWorkMode.locationMismatchPenalty : 0) +
    (workModeMatch === "conflict" ? SCORING_WEIGHTS.locationWorkMode.conflictPenalty : 0);
  const reasons = [];

  if (locationPreference.status === "matched" && locationPreference.shouldExplain !== false) {
    reasons.push(locationPreference.reason || `Location aligns with ${locationPreference.label}`);
  } else if (locationPreference.status === "compatible" && locationPreference.shouldExplain !== false) {
    reasons.push("Worldwide/remote location compatible");
  } else if (locationPreference.status === "restricted" || locationPreference.status === "restricted_mismatch") {
    reasons.push(makeLocationRestrictionReason(locationPreference));
    if (locationPreference.status === "restricted_mismatch") {
      reasons.push(`Outside preferred location: ${locationPreference.label}`);
    }
  } else if (locationPreference.status === "mismatch") {
    reasons.push("Remote role, but outside preferred location");
  }

  if (remoteFriendly) {
    reasons.push(makeWorkModeReason(profile.work_mode));
  }

  return makeScoringSignal({
    points,
    penalty,
    locationMatch: locationPreference.status === "matched" || locationPreference.status === "compatible",
    locationPreference,
    workModeMatch,
    remoteFriendly,
    reasons
  });
}

function evaluateLocationPreference(preferredLocation, jobLocation, searchableText = "") {
  const preferred = normalizeSearchText(preferredLocation);
  const job = normalizeSearchText(jobLocation);
  const strictPreference = hasStrictLocationPreference(preferred);

  if (!preferred || (!job && !searchableText)) {
    const restrictionOnly = detectLocationRestriction(job, normalizeSearchText(`${jobLocation || ""} ${searchableText || ""}`), []);

    if (restrictionOnly) {
      return makeRestrictedLocationPreference(restrictionOnly, preferredLocation, jobLocation, false);
    }

    return { status: "neutral", label: cleanText(preferredLocation || ""), jobLocation: cleanText(jobLocation || "") };
  }

  const preferredTerms = expandLocationTerms(preferred);
  const evidence = normalizeSearchText(`${jobLocation || ""} ${searchableText || ""}`);

  if (isNeutralLocationPreference(preferred)) {
    const neutralRestriction = detectLocationRestriction(job, evidence, preferredTerms);

    if (neutralRestriction) {
      return makeRestrictedLocationPreference(neutralRestriction, preferredLocation, jobLocation, false);
    }

    if (LOCATION_COMPATIBLE_TERMS.some((term) => containsPhrase(job, term))) {
      return { status: "compatible", label: cleanText(preferredLocation), jobLocation: cleanText(jobLocation), shouldExplain: false };
    }

    return { status: "neutral", label: cleanText(preferredLocation), jobLocation: cleanText(jobLocation) };
  }

  const restriction = detectLocationRestriction(job, evidence, preferredTerms);

  if (restriction?.matchesPreferred && restriction.kind === "listed_countries") {
    return {
      status: isBroadLocationPreference(preferred) ? "compatible" : "matched",
      label: cleanText(preferredLocation),
      jobLocation: cleanText(jobLocation),
      reason: `Listed countries include ${cleanText(preferredLocation)}`,
      shouldExplain: !isBroadLocationPreference(preferred)
    };
  }

  if (restriction && !restriction.matchesPreferred) {
    return makeRestrictedLocationPreference(restriction, preferredLocation, jobLocation, strictPreference);
  }

  if (preferredTerms.some((term) => containsPhrase(job, term))) {
    return {
      status: isBroadLocationPreference(preferred) ? "compatible" : "matched",
      label: cleanText(preferredLocation),
      jobLocation: cleanText(jobLocation),
      shouldExplain: !isBroadLocationPreference(preferred)
    };
  }

  if (preferredTerms.some((term) => containsPhrase(evidence, term))) {
    return {
      status: isBroadLocationPreference(preferred) ? "compatible" : "matched",
      label: cleanText(preferredLocation),
      jobLocation: cleanText(jobLocation),
      shouldExplain: !isBroadLocationPreference(preferred)
    };
  }

  if (LOCATION_COMPATIBLE_TERMS.some((term) => containsPhrase(job, term))) {
    return { status: "compatible", label: cleanText(preferredLocation), jobLocation: cleanText(jobLocation) };
  }

  return { status: "mismatch", label: cleanText(preferredLocation), jobLocation: cleanText(jobLocation) };
}

function makeRestrictedLocationPreference(restriction, preferredLocation, jobLocation, strictPreference) {
  return {
    status: strictPreference ? "restricted_mismatch" : "restricted",
    label: cleanText(preferredLocation || ""),
    jobLocation: cleanText(jobLocation || ""),
    restrictedRegion: restriction.region,
    restrictionKind: restriction.kind || "region",
    penalty: strictPreference ? SCORING_WEIGHTS.locationWorkMode.locationRestrictedMismatchPenalty : 0
  };
}

function isRemoteEligibleForProfile(locationPreference) {
  return ["matched", "compatible"].includes(locationPreference.status);
}

function hasStrictLocationPreference(preferred) {
  return Boolean(preferred) && !isNeutralLocationPreference(preferred);
}

function detectLocationRestriction(jobLocationText, evidenceText, preferredTerms) {
  const normalizedJobLocation = normalizeSearchText(jobLocationText);
  const hasStrictPreferredTerms = preferredTerms.length > 0 && !preferredTerms.some(isNeutralLocationPreference);

  if (LOCATION_COMPATIBLE_TERMS.includes(normalizedJobLocation)) {
    const phraseRestriction = detectPhraseLocationRestriction(evidenceText, preferredTerms);

    return phraseRestriction;
  }

  const listedLocationRestriction = detectListedLocationRestriction(normalizedJobLocation, preferredTerms);

  if (listedLocationRestriction !== undefined) {
    return listedLocationRestriction;
  }

  for (const region of LOCATION_RESTRICTED_REGIONS) {
    const regionInLocation = hasStrictPreferredTerms && region.terms.some((term) => containsPhrase(jobLocationText, term));
    const regionInRestrictedPhrase =
      region.restrictionPhrases.some((phrase) => containsPhrase(evidenceText, phrase)) ||
      (region.terms.some((term) => containsPhrase(evidenceText, term)) &&
        LOCATION_RESTRICTION_PHRASES.some((phrase) => containsPhrase(evidenceText, phrase)));

    if (regionInLocation || regionInRestrictedPhrase) {
      return {
        region: region.label,
        matchesPreferred: region.terms.some((term) => preferredTerms.includes(term))
      };
    }
  }

  return detectPhraseLocationRestriction(evidenceText, preferredTerms);
}

function detectListedLocationRestriction(jobLocationText, preferredTerms) {
  if (!jobLocationText) {
    return undefined;
  }

  const matchedRegions = getLocationRegionMatches(jobLocationText);

  if (matchedRegions.length <= 1) {
    return undefined;
  }

  if (!preferredTerms.length || preferredTerms.some(isNeutralLocationPreference)) {
    return null;
  }

  const matchesPreferred = matchedRegions.some((region) =>
    region.terms.some((term) => preferredTerms.includes(term))
  );

  return matchesPreferred
    ? { region: null, matchesPreferred: true, kind: "listed_countries" }
    : { region: null, matchesPreferred: false, kind: "listed_countries" };
}

function getLocationRegionMatches(jobLocationText) {
  const matches = [];
  const seenLabels = new Set();

  for (const region of LOCATION_RESTRICTED_REGIONS) {
    const matchesRegion = region.terms.some((term) => containsPhrase(jobLocationText, term));

    if (matchesRegion && !seenLabels.has(region.label)) {
      seenLabels.add(region.label);
      matches.push(region);
    }
  }

  return matches;
}

function detectPhraseLocationRestriction(evidenceText, preferredTerms) {
  for (const region of LOCATION_RESTRICTED_REGIONS) {
    const regionInRestrictedPhrase =
      region.restrictionPhrases.some((phrase) => containsPhrase(evidenceText, phrase)) ||
      (region.terms.some((term) => containsPhrase(evidenceText, term)) &&
        LOCATION_RESTRICTION_PHRASES.some((phrase) => containsPhrase(evidenceText, phrase)));

    if (regionInRestrictedPhrase) {
      return {
        region: region.label,
        matchesPreferred: region.terms.some((term) => preferredTerms.includes(term))
      };
    }
  }

  if (LOCATION_RESTRICTION_PHRASES.some((phrase) => containsPhrase(evidenceText, phrase))) {
    const matchesPreferred = preferredTerms.some((term) => containsPhrase(evidenceText, term));

    return matchesPreferred ? null : { region: null, matchesPreferred: false };
  }

  return null;
}

function makeLocationRestrictionReason(locationPreference) {
  if (locationPreference.restrictionKind === "listed_countries") {
    return "Remote role restricted to listed countries";
  }

  if (locationPreference.restrictedRegion) {
    return `Remote role restricted to ${locationPreference.restrictedRegion} applicants`;
  }

  return "Remote role restricted to specific hiring regions";
}

function isNeutralLocationPreference(preferred) {
  return NEUTRAL_LOCATION_TERMS.includes(preferred);
}

const LOCATION_COMPATIBLE_TERMS = [
  "worldwide",
  "anywhere",
  "remote",
  "global",
  "asia",
  "apac",
  "southeast asia",
  "sea"
];

const NEUTRAL_LOCATION_TERMS = [
  "any",
  "anywhere",
  "global",
  "worldwide",
  "remote",
  "no preference"
];

const COUNTRY_RESTRICTION_LABELS = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saudi Arabia",
  "Serbia",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];

const LOCATION_RESTRICTED_REGIONS = [
  {
    label: "United States",
    terms: ["united states", "us", "u s", "usa"],
    restrictionPhrases: [
      "united states only",
      "us only",
      "u s only",
      "usa only",
      "authorized to work in the united states",
      "authorized to work in the us",
      "authorized to work in the u s",
      "must reside in the united states",
      "must reside in the us",
      "must reside in the u s",
      "hiring in listed us states",
      "us states only",
      "u s states only",
      "u s hours",
      "us hours",
      "u s business hours",
      "us business hours"
    ]
  },
  {
    label: "Canada",
    terms: ["canada"],
    restrictionPhrases: [
      "canada only",
      "authorized to work in canada",
      "must reside in canada"
    ]
  },
  {
    label: "Ireland",
    terms: ["ireland"],
    restrictionPhrases: [
      "ireland only",
      "authorized to work in ireland",
      "must reside in ireland"
    ]
  },
  {
    label: "Pakistan",
    terms: ["pakistan"],
    restrictionPhrases: [
      "pakistan only",
      "authorized to work in pakistan",
      "must reside in pakistan"
    ]
  },
  {
    label: "Brazil",
    terms: ["brazil"],
    restrictionPhrases: [
      "brazil only",
      "authorized to work in brazil",
      "must reside in brazil"
    ]
  },
  {
    label: "Kenya",
    terms: ["kenya"],
    restrictionPhrases: [
      "kenya only",
      "authorized to work in kenya",
      "must reside in kenya"
    ]
  },
  {
    label: "EU",
    terms: ["eu", "e u", "europe", "european union"],
    restrictionPhrases: [
      "eu only",
      "e u only",
      "europe only",
      "european union only",
      "authorized to work in the eu",
      "authorized to work in europe",
      "must reside in the eu",
      "must reside in europe"
    ]
  },
  ...COUNTRY_RESTRICTION_LABELS.map(makeCountryRestrictionRegion)
];

const LOCATION_RESTRICTION_PHRASES = [
  "must reside in",
  "authorized to work in",
  "eligible to work in",
  "right to work in",
  "work authorization",
  "visa sponsorship unavailable",
  "visa sponsorship is unavailable",
  "no visa sponsorship",
  "hiring in these states",
  "hiring in listed states",
  "hiring in the following states"
];

const LOCATION_ALIASES = {
  philippines: ["philippines", "ph"],
  ph: ["ph", "philippines"]
};

function makeCountryRestrictionRegion(label) {
  const term = normalizeSearchText(label);

  return {
    label,
    terms: [term],
    restrictionPhrases: [
      `${term} only`,
      `authorized to work in ${term}`,
      `eligible to work in ${term}`,
      `right to work in ${term}`,
      `must reside in ${term}`
    ]
  };
}

function expandLocationTerms(preferred) {
  return uniqueReasons([preferred, ...(LOCATION_ALIASES[preferred] || [])])
    .map(normalizeSearchText)
    .filter(Boolean);
}

function isBroadLocationPreference(preferred) {
  return LOCATION_COMPATIBLE_TERMS.includes(preferred);
}

function getWorkModeMatch(workMode, haystack) {
  if (workMode === "any") {
    return "any";
  }

  const mentionsRemote = haystack.includes("remote");
  const mentionsHybrid = haystack.includes("hybrid");
  const mentionsOnsite = haystack.includes("onsite") || haystack.includes("on site") || haystack.includes("office");

  if (workMode === "remote") {
    return mentionsRemote ? "matched" : "unknown";
  }

  if (workMode === "hybrid") {
    return mentionsHybrid ? "matched" : mentionsRemote || mentionsOnsite ? "conflict" : "unknown";
  }

  if (workMode === "onsite") {
    return mentionsOnsite ? "matched" : mentionsRemote ? "conflict" : "unknown";
  }

  return "unknown";
}

function makeWorkModeReason(workMode) {
  if (workMode === "remote") {
    return "Remote-friendly workflow";
  }

  if (workMode === "hybrid") {
    return "Hybrid work mode aligned";
  }

  if (workMode === "onsite") {
    return "Onsite work mode aligned";
  }

  return "Work mode aligned";
}

function buildMatchReasons({
  roleSignal,
  skillSignal,
  strongestSkillSignal,
  keywordSignal,
  senioritySignal,
  roleContextSignal,
  roleDomainSignal,
  broadRoleProtectionSignal,
  complexitySignal,
  scriptIntentSignal,
  avoidSignal,
  executionSignal,
  taskFitTieBreakerSignal,
  locationWorkModeSignal
}) {
  const highPriorityReasons = [];
  const supportingReasons = [];
  const roleReasons = roleContextSignal.reasons.length ? roleContextSignal.reasons : roleSignal.reasons;
  const hasRestrictedLocation = ["restricted", "restricted_mismatch"].includes(locationWorkModeSignal.locationPreference?.status);

  highPriorityReasons.push(
    ...(hasRestrictedLocation ? locationWorkModeSignal.reasons : []),
    ...taskFitTieBreakerSignal.reasons,
    ...scriptIntentSignal.reasons,
    ...roleDomainSignal.reasons,
    ...broadRoleProtectionSignal.reasons,
    ...senioritySignal.reasons,
    ...complexitySignal.reasons,
    ...avoidSignal.reasons,
    ...(hasRestrictedLocation ? [] : locationWorkModeSignal.reasons)
  );

  supportingReasons.push(
    ...roleReasons,
    ...skillSignal.reasons,
    ...strongestSkillSignal.reasons,
    ...keywordSignal.reasons
  );

  const reasons = [...highPriorityReasons, ...supportingReasons];

  if (reasons.length === 0) {
    if (roleSignal.weakMatches || skillSignal.weakMatches || keywordSignal.weakMatches) {
      reasons.push("Weak keyword overlap", "Included for manual review");
    } else {
      reasons.push("Included for manual review");
    }
  }

  return uniqueReasonsByMeaning(reasons).slice(0, SCORING_WEIGHTS.maxReasons);
}

function makeScoringSignal({ points = 0, penalty = 0, reasons = [], ...details } = {}) {
  return {
    points,
    penalty,
    reasons,
    ...details
  };
}

function makeSignalReasons(signal, category) {
  if (category === "role") {
    if (signal.bestStrength === "title_phrase") {
      return [makeTitleMatchReason(signal, "target role")];
    }

    if (signal.bestStrength === "title_token") {
      return ["Role title overlaps with your target"];
    }

    if (signal.bestStrength === "category_phrase") {
      return ["Category/tag overlap only"];
    }

    if (signal.bestStrength === "secondary_phrase") {
      return ["Role appears as a supporting detail"];
    }

    if (signal.bestStrength === "near_words") {
      return ["Related role terms appear together"];
    }

    return [];
  }

  if (category === "skill") {
    if (signal.bestStrength === "title_phrase" || signal.bestStrength === "secondary_phrase") {
      return [makePhraseReason(signal, "skill")];
    }

    if (signal.bestStrength === "title_token") {
      return ["Skill is visible in the role title"];
    }

    if (signal.bestStrength === "near_words") {
      return ["Related skill terms appear together"];
    }

    return [];
  }

  if (category === "strongest_skill") {
    return signal.bestStrength !== "none"
      ? [`Core skill matched: ${displayTerm(signal.matchedQueries[0]?.query || "skill")}`]
      : [];
  }

  if (signal.bestStrength === "title_phrase" || signal.bestStrength === "secondary_phrase") {
    return [makePhraseReason(signal, "keyword")];
  }

  if (signal.bestStrength === "title_token") {
    return ["Keyword is visible in the role title"];
  }

  if (signal.bestStrength === "near_words") {
    return ["Related keyword terms appear together"];
  }

  return [];
}

function makeExecutionLikelihoodReasons(value) {
  if (value >= SCORING_WEIGHTS.executionLikelihood.strongFitThreshold) {
    return ["Execution likelihood is strong"];
  }

  if (value >= SCORING_WEIGHTS.executionLikelihood.possibleFitThreshold) {
    return ["Execution likelihood is possible"];
  }

  return ["Execution likelihood needs review"];
}

function makeTitleMatchReason(signal, label) {
  const query = signal.matchedQueries[0]?.query || label;

  if (normalizeSearchText(query).split(" ").length === 1) {
    return `${displayTerm(query)} role is central to the title`;
  }

  return `Direct ${label} match in title`;
}

function makePhraseReason(signal, label) {
  const match = signal.matchedQueries[0];
  const query = match?.query || label;
  const place = match?.strength === "secondary_phrase" ? "job details" : "job title";

  if (normalizeSearchText(query).split(" ").length === 1) {
    return place === "job details"
      ? `${displayTerm(query)} appears in supporting details`
      : `${displayTerm(query)} is visible in the role title`;
  }

  return `Direct ${label} phrase match`;
}

function makeSummary(job, scoring) {
  if (job.description) {
    const shortDescription = job.description.slice(0, 170).trim();
    return `${shortDescription}${job.description.length > 170 ? "..." : ""}`;
  }

  const topReason = scoring.match_reasons[0]?.toLowerCase() || "available from the selected source";
  return `${job.title} at ${job.company}${job.location ? ` in ${job.location}` : ""}, ranked because it ${topReason}.`;
}

function makeDetails(job) {
  const text = cleanText(job.description || "");

  if (!text) {
    return [
      job.employment_type ? `${job.employment_type} role` : null,
      job.location ? `Location: ${job.location}` : null,
      job.salary ? `Compensation: ${job.salary}` : null
    ].filter(Boolean);
  }

  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => cleanText(sentence).replace(/[.!?]+$/, ""))
    .filter((sentence) => sentence.length >= 24)
    .slice(0, 4)
    .map((sentence) => (sentence.length > 120 ? `${sentence.slice(0, 117).trim()}...` : sentence));
}

function cleanText(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function cleanOptionalText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return cleanText(value);
}

function cleanSourceId(value) {
  return cleanOptionalText(value);
}

function normalizeForCompare(value) {
  return cleanText(value).toLowerCase();
}

function normalizeSearchText(value) {
  return normalizeForCompare(value)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHtml(value) {
  return cleanText(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
  );
}

function normalizeCompensation(value) {
  const cleaned = cleanText(value || "");

  if (!cleaned || ["-", "n/a", "not specified"].includes(cleaned.toLowerCase())) {
    return null;
  }

  return cleaned;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function roundComponents(components) {
  return Object.fromEntries(
    Object.entries(components).map(([key, value]) => [key, Math.round(value)])
  );
}

function uniqueReasons(reasons) {
  return [...new Set(reasons)];
}

function uniqueReasonsByMeaning(reasons) {
  const seen = new Set();
  const result = [];

  for (const reason of reasons) {
    const key = reasonMeaningKey(reason);

    if (!seen.has(key)) {
      seen.add(key);
      result.push(reason);
    }
  }

  return result;
}

function reasonMeaningKey(reason) {
  const normalized = normalizeSearchText(reason);

  if (normalized.includes("remote role restricted")) {
    return "location_restriction";
  }

  if (normalized.includes("outside preferred location")) {
    return "location_mismatch";
  }

  if (normalized.includes("location aligns") || normalized.includes("location compatible")) {
    return "location_preference";
  }

  if (normalized.includes("remote friendly") || normalized.includes("work mode") || normalized.includes("hybrid") || normalized.includes("onsite")) {
    return "work_mode";
  }

  if (normalized.includes("automation") || normalized.includes("implementation") || normalized.includes("lower complexity")) {
    return "execution_fit";
  }

  if (normalized.includes("technical") || normalized.includes("software") || normalized.includes("frontend") || normalized.includes("mobile")) {
    return "technical_alignment";
  }

  if (normalized.includes("seniority") || normalized.includes("architecture") || normalized.includes("complexity")) {
    return "complexity_gap";
  }

  if (normalized.includes("avoid keyword")) {
    return "avoid_keyword";
  }

  if (normalized.includes("keyword")) {
    return "keyword";
  }

  return normalized;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function displayTerm(value) {
  const text = cleanText(value);

  if (text.toLowerCase() === "ai") {
    return "AI";
  }

  return capitalize(text);
}

export const __test = Object.freeze({
  SCORING_WEIGHTS,
  buildScoringContext,
  dedupeJobs,
  fetchArbeitnowJobs,
  fetchHimalayasJobs,
  fetchRemoteOkJobs,
  fetchRemotiveJobs,
  fetchWithTimeout,
  formatJob,
  normalizeArbeitnowJob,
  makeStableJobId,
  normalizeHimalayasJob,
  normalizeManualJob,
  normalizeRemoteOkJob,
  normalizeRemotiveJob,
  normalizeProfile,
  scoreJob
});

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...headers
    }
  });
}
