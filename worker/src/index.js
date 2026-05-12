const REAL_PYTHON_URL = "https://realpython.github.io/fake-jobs/";
const REMOTIVE_URL = "https://remotive.com/api/remote-jobs";
const SOURCE_NAME = "Real Python Fake Jobs";
const REMOTIVE_SOURCE_NAME = "Remotive";
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request) {
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

  if (!["realpython_fake_jobs", "remotive"].includes(sourceType)) {
    return json({ error: "Unsupported source. Use realpython_fake_jobs or remotive." }, 400);
  }

  let rawJobs;

  try {
    rawJobs = sourceType === "remotive" ? await fetchRemotiveJobs(profile) : await fetchRealPythonJobs();
  } catch (error) {
    return json({ error: error.message || "Unable to fetch jobs from selected source." }, 502);
  }

  const ingestedAt = new Date().toISOString();
  const jobs = dedupeJobs(rawJobs)
    .map((job) => formatJob(job, profile, ingestedAt))
    .sort((a, b) => b.scoring.score - a.scoring.score || a.title.localeCompare(b.title))
    .map((job, index) => ({
      id: `job_${String(index + 1).padStart(3, "0")}`,
      ...job
    }));

  return json({
    jobs,
    count: jobs.length,
    source: {
      type: sourceType,
      name: sourceType === "remotive" ? REMOTIVE_SOURCE_NAME : SOURCE_NAME
    }
  });
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

  return value.map((item) => cleanText(String(item))).filter(Boolean);
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

  url.searchParams.set("limit", "50");

  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "job-intel-mvp/0.1"
    }
  });

  if (!response.ok) {
    throw new Error(`Remotive fetch failed with status ${response.status}`);
  }

  const data = await response.json();
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];

  return jobs
    .map((job) => ({
      title: cleanText(job.title),
      company: cleanText(job.company_name),
      location: cleanText(job.candidate_required_location || "Remote"),
      source: REMOTIVE_SOURCE_NAME,
      url: normalizeUrlFromBase(job.url, REMOTIVE_URL),
      employment_type: cleanText(job.job_type || "") || null,
      salary: normalizeCompensation(job.salary),
      description: cleanHtml(job.description || ""),
      category: cleanText(job.category || "")
    }))
    .filter((job) => job.title && job.company);
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
  if (!value) {
    return null;
  }

  try {
    return new URL(value, REAL_PYTHON_URL).toString();
  } catch {
    return null;
  }
}

function normalizeUrlFromBase(value, baseUrl) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function dedupeJobs(jobs) {
  const seen = new Set();
  const unique = [];

  for (const job of jobs) {
    const key = [job.title, job.company, job.url || ""].map(normalizeForCompare).join("|");

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(job);
    }
  }

  return unique;
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
      source_type: job.source === REMOTIVE_SOURCE_NAME ? "api" : "scraper"
    }
  };
}

function scoreJob(job, profile) {
  const title = normalizeSearchText(job.title);
  const company = normalizeSearchText(job.company);
  const location = normalizeSearchText(job.location);
  const summaryText = normalizeSearchText(`${job.company} ${job.location} ${job.category || ""} ${job.description || ""}`);
  const searchableText = `${title} ${summaryText}`;

  const roleSignal = evaluateSignals(profile.target_roles, title, summaryText, "role");
  const skillSignal = evaluateSignals(profile.skills, title, summaryText, "skill");
  const keywordSignal = evaluateSignals(profile.keywords, title, summaryText, "keyword");
  const strongestSkillSignal = evaluateSignals(profile.strongest_skills, title, summaryText, "strongest_skill");
  const senioritySignal = evaluateSeniority(profile, title);
  const roleContextSignal = evaluateRoleContext(profile, title, job.title);
  const complexitySignal = evaluateComplexity(profile, title);
  const scriptIntentSignal = evaluateScriptIntent(profile, title);
  const avoidSignal = evaluateAvoidKeywords(profile, title, summaryText);
  const executionSignal = evaluateExecutionLikelihood({
    profile,
    title,
    searchableText,
    strongestSkillSignal,
    complexitySignal,
    avoidSignal
  });
  const locationMatch = profile.location && location.includes(normalizeForCompare(profile.location));
  const workModeMatch = getWorkModeMatch(profile.work_mode, searchableText);

  const components = {
    role_match_score: roleSignal.points,
    skill_match_score: skillSignal.points + strongestSkillSignal.points,
    keyword_match_score: keywordSignal.points,
    seniority_match_score: senioritySignal.points,
    execution_likelihood_score: executionSignal.points,
    location_workmode_score: 0,
    penalties: senioritySignal.penalty + avoidSignal.penalty
  };

  components.role_match_score += roleContextSignal.points;
  components.skill_match_score += scriptIntentSignal.points;
  components.penalties += roleContextSignal.penalty + complexitySignal.penalty + scriptIntentSignal.penalty;

  if (locationMatch) {
    components.location_workmode_score += 6;
  }

  if (workModeMatch === "matched") {
    components.location_workmode_score += 7;
  } else if (workModeMatch === "conflict") {
    components.penalties -= 12;
  }

  const score =
    4 +
    components.role_match_score +
    components.skill_match_score +
    components.keyword_match_score +
    components.seniority_match_score +
    components.execution_likelihood_score +
    components.location_workmode_score +
    components.penalties;

  const matchReasons = buildMatchReasons({
    roleSignal,
    skillSignal,
    strongestSkillSignal,
    keywordSignal,
    senioritySignal,
    roleContextSignal,
    complexitySignal,
    scriptIntentSignal,
    avoidSignal,
    executionSignal,
    locationMatch,
    workModeMatch,
    profile
  });

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    match_reasons: matchReasons,
    execution_likelihood: executionSignal.label,
    components: roundComponents(components)
  };
}

function evaluateSignals(queries, title, secondaryText, category) {
  if (!queries.length) {
    return { points: 0, bestStrength: "none", weakMatches: 0, matchedQueries: [] };
  }

  const maxPoints = category === "role" ? 34 : category === "skill" ? 26 : category === "strongest_skill" ? 14 : 16;
  let totalWeight = 0;
  let bestStrength = "none";
  let weakMatches = 0;
  const matchedQueries = [];

  for (const query of queries) {
    const signal = evaluateQuerySignal(query, title, secondaryText, category);
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
  const weakCap = bestStrength === "weak" ? maxPoints * 0.22 : maxPoints;

  return {
    points: Math.min(weakCap, averageWeight * maxPoints),
    bestStrength,
    weakMatches,
    matchedQueries
  };
}

function evaluateQuerySignal(query, title, secondaryText, category) {
  const phrase = normalizeSearchText(query);

  if (!phrase) {
    return { strength: "none", weight: 0 };
  }

  if (containsPhrase(title, phrase)) {
    return { strength: "title_phrase", weight: 1 };
  }

  if (containsPhrase(secondaryText, phrase)) {
    return { strength: "secondary_phrase", weight: 0.72 };
  }

  const words = phrase.split(" ").filter(Boolean);
  const importantWords = words.filter((word) => !GENERIC_TOKENS.has(word) && word.length > 2);

  if (words.length === 1 && importantWords.length === 1 && containsWholeWord(title, importantWords[0])) {
    return { strength: "title_token", weight: category === "skill" ? 0.64 : 0.58 };
  }

  if (words.length === 1 && importantWords.length === 1 && containsWholeWord(secondaryText, importantWords[0])) {
    return { strength: "secondary_token", weight: 0.28 };
  }

  if (importantWords.length >= 2 && wordsNearEachOther(importantWords, `${title} ${secondaryText}`)) {
    return { strength: "near_words", weight: 0.5 };
  }

  if (importantWords.length === 1 && containsWholeWord(`${title} ${secondaryText}`, importantWords[0])) {
    return { strength: "weak", weight: 0.16 };
  }

  return { strength: "none", weight: 0 };
}

function evaluateSeniority(profile, title) {
  const profileText = normalizeSearchText(
    [...profile.target_roles, ...profile.skills, ...profile.keywords, profile.experience_level].join(" ")
  );
  const wantsEntry = ENTRY_LEVEL_TERMS.some((term) => containsPhrase(profileText, term));
  const wantsSenior = SENIOR_LEVEL_TERMS.some((term) => containsPhrase(profileText, term));
  const titleHasEntry = ENTRY_LEVEL_TERMS.some((term) => containsPhrase(title, term));
  const titleHasSenior = SENIOR_LEVEL_TERMS.some((term) => containsPhrase(title, term));

  if (wantsEntry && !wantsSenior) {
    if (titleHasEntry) {
      return { preference: "entry", points: 18, penalty: 0, status: "matched_entry" };
    }

    if (titleHasSenior) {
      return { preference: "entry", points: 0, penalty: -18, status: "senior_too_high" };
    }

    return { preference: "entry", points: 0, penalty: 0, status: "neutral" };
  }

  if (wantsSenior) {
    if (titleHasSenior) {
      return { preference: "senior", points: 18, penalty: 0, status: "matched_senior" };
    }

    if (titleHasEntry) {
      return { preference: "senior", points: 0, penalty: -14, status: "too_junior" };
    }

    return { preference: "senior", points: 0, penalty: 0, status: "neutral" };
  }

  return { preference: "none", points: 0, penalty: 0, status: "neutral" };
}

function evaluateRoleContext(profile, title, rawTitle) {
  const broadRole = profile.target_roles
    .map(normalizeSearchText)
    .find((role) => role && role.split(" ").length === 1 && !GENERIC_TOKENS.has(role));

  if (!broadRole || !containsWholeWord(title, broadRole)) {
    return { status: "none", points: 0, penalty: 0, term: null };
  }

  const tokens = title.split(" ").filter(Boolean);
  const index = tokens.indexOf(broadRole);
  const inParentheses = titleContainsParentheticalTerm(rawTitle, broadRole);
  const hasComplexPrefix = tokens.slice(0, index).some((token) => ["senior", "staff", "principal", "lead"].includes(token));

  if (index === 0 && tokens.includes("programmer")) {
    return { status: "primary", points: 15, penalty: 0, term: broadRole };
  }

  if (index === 0 && tokens.includes("developer")) {
    return { status: "primary", points: 11, penalty: 0, term: broadRole };
  }

  if (index === 0) {
    return { status: "primary", points: 10, penalty: 0, term: broadRole };
  }

  if (inParentheses) {
    return { status: "secondary_technology", points: 2, penalty: -4, term: broadRole };
  }

  if (hasComplexPrefix) {
    return { status: "complex_secondary", points: 2, penalty: -6, term: broadRole };
  }

  if (index > 0 && index <= 2 && tokens.some((token) => SCRIPT_FRIENDLY_TERMS.includes(token))) {
    return { status: "main_phrase", points: 8, penalty: 0, term: broadRole };
  }

  return { status: "secondary_technology", points: 3, penalty: -3, term: broadRole };
}

function titleContainsParentheticalTerm(rawTitle, term) {
  const matches = String(rawTitle).match(/\(([^)]+)\)/g) || [];
  return matches.some((match) => containsWholeWord(normalizeSearchText(match), term));
}

function evaluateComplexity(profile, title) {
  const profileText = normalizeSearchText([...profile.target_roles, ...profile.skills, ...profile.keywords, profile.experience_level].join(" "));
  const requestedTerms = COMPLEXITY_TERMS.filter((term) => containsPhrase(profileText, term));
  const titleTerms = COMPLEXITY_TERMS.filter((term) => containsPhrase(title, term));
  const unrequestedTerms = titleTerms.filter((term) => !requestedTerms.includes(term));

  if (!unrequestedTerms.length) {
    return { status: "neutral", penalty: 0, terms: [] };
  }

  const penalty = unrequestedTerms.reduce((total, term) => {
    if (["senior", "staff", "principal", "lead", "manager"].includes(term)) {
      return total + 10;
    }

    if (["architect", "engineer", "backend", "back end", "5 years", "8 years", "enterprise", "architecture"].includes(term)) {
      return total + 7;
    }

    return total + 4;
  }, 0);
  return { status: "more_complex", penalty: -Math.min(18, penalty), terms: unrequestedTerms };
}

function evaluateAvoidKeywords(profile, title, secondaryText) {
  const text = `${title} ${secondaryText}`;
  const matches = profile.avoid_keywords.filter((keyword) => {
    const normalized = normalizeSearchText(keyword);
    return normalized && containsPhrase(text, normalized);
  });

  return {
    matches,
    penalty: -Math.min(35, matches.length * 18)
  };
}

function evaluateExecutionLikelihood({ profile, title, searchableText, strongestSkillSignal, complexitySignal, avoidSignal }) {
  let value = 50;
  const wantsJunior = ["beginner", "junior"].includes(profile.experience_level);
  const wantsSenior = profile.experience_level === "senior";
  const titleHasJunior = JUNIOR_LEVEL_TERMS.some((term) => containsPhrase(title, term));
  const titleHasSenior = SENIOR_LEVEL_TERMS.some((term) => containsPhrase(title, term));
  const titleHasComplexity = COMPLEXITY_TERMS.some((term) => containsPhrase(searchableText, term));

  if (wantsJunior) {
    if (titleHasJunior) {
      value += 22;
    }

    if (titleHasSenior) {
      value -= 28;
    }

    if (titleHasComplexity) {
      value -= 18;
    }
  } else if (wantsSenior) {
    if (titleHasSenior) {
      value += 22;
    }

    if (titleHasJunior) {
      value -= 18;
    }
  } else if (profile.experience_level === "intermediate") {
    if (titleHasSenior) {
      value -= 12;
    }
  }

  if (strongestSkillSignal.points > 0) {
    value += Math.min(14, strongestSkillSignal.points);
  }

  if (!wantsSenior && complexitySignal.status === "more_complex") {
    value -= Math.min(18, Math.abs(complexitySignal.penalty));
  }

  value += avoidSignal.penalty;
  value = Math.max(0, Math.min(100, Math.round(value)));

  return {
    value,
    points: Math.round((value - 50) * 0.35),
    label: executionLabel(value)
  };
}

function executionLabel(value) {
  if (value >= 76) {
    return "strong_fit";
  }

  if (value >= 58) {
    return "possible_fit";
  }

  if (value >= 25) {
    return "stretch";
  }

  return "poor_fit";
}

function evaluateScriptIntent(profile, title) {
  const profileText = normalizeSearchText([...profile.skills, ...profile.keywords].join(" "));
  const hasScriptIntent = SCRIPT_INTENT_TERMS.some((term) => containsPhrase(profileText, term));

  if (!hasScriptIntent) {
    return { status: "none", points: 0, penalty: 0 };
  }

  const isProgrammer = containsPhrase(title, "programmer");
  const isDeveloper = containsPhrase(title, "developer");
  const isImplementationRole = SCRIPT_FRIENDLY_TERMS.some((term) => containsPhrase(title, term));
  const isComplexRole = ["senior", "staff", "principal", "lead", "architect", "engineer", "backend", "back end"].some((term) =>
    containsPhrase(title, term)
  );
  const implementationPoints = isProgrammer ? 8 : isDeveloper ? (isComplexRole ? 3 : 5) : isImplementationRole && !isComplexRole ? 4 : 0;

  return {
    status: isImplementationRole ? "implementation_favored" : "neutral",
    points: implementationPoints,
    penalty: isComplexRole ? -5 : 0
  };
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
    title_phrase: 6
  }[strength] || 0;
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

function buildMatchReasons({
  roleSignal,
  skillSignal,
  strongestSkillSignal,
  keywordSignal,
  senioritySignal,
  roleContextSignal,
  complexitySignal,
  scriptIntentSignal,
  avoidSignal,
  executionSignal,
  locationMatch,
  workModeMatch,
  profile
}) {
  const reasons = [];
  const roleTerm = displayTerm(roleContextSignal.term || roleSignal.matchedQueries[0]?.query || "Role");

  if (roleContextSignal.status === "primary") {
    reasons.push(`${roleTerm} is the primary title focus`);
  } else if (roleContextSignal.status === "main_phrase") {
    reasons.push(`${roleTerm} is central to the role title`);
  } else if (roleContextSignal.status === "complex_secondary") {
    reasons.push(`${roleTerm} appears in a more complex role title`);
  } else if (roleContextSignal.status === "secondary_technology") {
    reasons.push(`${roleTerm} appears as a secondary technology`);
  } else if (roleSignal.bestStrength === "title_phrase") {
    reasons.push(makeTitleMatchReason(roleSignal, "target role"));
  } else if (roleSignal.bestStrength === "title_token") {
    reasons.push(`${displayTerm(roleSignal.matchedQueries[0]?.query || "Role")} appears in the job title`);
  } else if (roleSignal.bestStrength === "secondary_phrase") {
    reasons.push("Target role phrase appears in job details");
  } else if (roleSignal.bestStrength === "near_words") {
    reasons.push("Target role words appear close together");
  }

  if (skillSignal.bestStrength === "title_phrase" || skillSignal.bestStrength === "secondary_phrase") {
    reasons.push(makePhraseReason(skillSignal, "skill"));
  } else if (skillSignal.bestStrength === "title_token") {
    reasons.push(`${displayTerm(skillSignal.matchedQueries[0]?.query || "Skill")} appears in the job title`);
  } else if (skillSignal.bestStrength === "near_words") {
    reasons.push("Relevant skill words appear close together");
  }

  if (strongestSkillSignal.bestStrength !== "none") {
    reasons.push(`Strongest skill matched: ${displayTerm(strongestSkillSignal.matchedQueries[0]?.query || "skill")}`);
  }

  if (senioritySignal.status === "matched_entry") {
    reasons.push("Entry-level role matches your preference");
  } else if (senioritySignal.status === "senior_too_high") {
    reasons.push("Seniority may be higher than requested");
  } else if (senioritySignal.status === "matched_senior") {
    reasons.push("Senior role matches your preference");
  } else if (senioritySignal.status === "too_junior") {
    reasons.push("Seniority may be lower than requested");
  }

  if (complexitySignal.status === "more_complex") {
    reasons.push("Role appears more senior/complex than requested");
  }

  for (const keyword of avoidSignal.matches) {
    reasons.push(`Contains avoided keyword: ${keyword}`);
  }

  if (scriptIntentSignal.status === "implementation_favored") {
    reasons.push("Script-oriented profile favors implementation roles");
  }

  if (locationMatch) {
    reasons.push(`Location mentions ${profile.location}`);
  }

  if (workModeMatch === "matched") {
    reasons.push(`${capitalize(profile.work_mode)} work mode aligned`);
  }

  if (keywordSignal.bestStrength === "title_phrase" || keywordSignal.bestStrength === "secondary_phrase") {
    reasons.push(makePhraseReason(keywordSignal, "keyword"));
  } else if (keywordSignal.bestStrength === "title_token") {
    reasons.push(`${displayTerm(keywordSignal.matchedQueries[0]?.query || "Keyword")} appears in the job title`);
  } else if (keywordSignal.bestStrength === "near_words") {
    reasons.push("Keyword words appear close together");
  }

  if (reasons.length === 0) {
    if (roleSignal.weakMatches || skillSignal.weakMatches || keywordSignal.weakMatches) {
      reasons.push("Weak keyword overlap", "Included for manual review");
    } else {
      reasons.push("Included for manual review");
    }
  }

  return uniqueReasons(reasons).slice(0, 4);
}

function makeTitleMatchReason(signal, label) {
  const query = signal.matchedQueries[0]?.query || label;

  if (normalizeSearchText(query).split(" ").length === 1) {
    return `${displayTerm(query)} appears in the job title`;
  }

  return `Exact ${label} phrase in title`;
}

function makePhraseReason(signal, label) {
  const match = signal.matchedQueries[0];
  const query = match?.query || label;
  const place = match?.strength === "secondary_phrase" ? "job details" : "job title";

  if (normalizeSearchText(query).split(" ").length === 1) {
    return `${displayTerm(query)} appears in the ${place}`;
  }

  return `Exact ${label} phrase match`;
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
