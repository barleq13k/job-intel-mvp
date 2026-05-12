import { strict as assert } from "node:assert";
import { __test } from "../src/index.js";

const profile = __test.normalizeProfile({
  target_roles: ["Python"],
  skills: ["script"],
  keywords: ["entry level"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "junior",
  avoid_keywords: ["senior", "manager"],
  strongest_skills: ["Python"]
});

assert.deepEqual(
  __test.normalizeProfile({
    skills: ["java script", "node js", "nodejs", "react js", "type script", "css"]
  }).skills,
  ["javascript", "node.js", "node.js", "react", "typescript", "css"]
);

const fakeJobs = [
  {
    title: "Python Programmer (Entry-Level)",
    company: "Payne, Roberts and Davis",
    location: "Remote",
    source: "Real Python Fake Jobs",
    url: "https://example.com/python-programmer"
  },
  {
    title: "Senior Python Engineer",
    company: "Hernandez Inc",
    location: "Remote",
    source: "Real Python Fake Jobs",
    url: "https://example.com/senior-python-engineer"
  },
  {
    title: "Data Entry Clerk",
    company: "Smith LLC",
    location: "Remote",
    source: "Real Python Fake Jobs",
    url: "https://example.com/data-entry-clerk"
  },
  {
    title: "Regional Manager",
    company: "Jones Group",
    location: "Remote",
    source: "Real Python Fake Jobs",
    url: "https://example.com/regional-manager"
  }
];

const results = fakeJobs.map((job) => {
  const scoring = __test.scoreJob(job, profile);

  return {
    title: job.title,
    score: scoring.score,
    execution_likelihood: scoring.execution_likelihood,
    components: scoring.components,
    match_reasons: scoring.match_reasons
  };
});

assert.deepEqual(results, [
  {
    title: "Python Programmer (Entry-Level)",
    score: 100,
    execution_likelihood: "strong_fit",
    components: {
      role_match_score: 49,
      skill_match_score: 22,
      keyword_match_score: 16,
      seniority_match_score: 18,
      execution_likelihood_score: 13,
      location_workmode_score: 13,
      penalties: 0
    },
    match_reasons: [
      "Python is the primary title focus",
      "Strongest skill matched: Python",
      "Entry-level role matches your preference",
      "Script-oriented profile favors implementation roles"
    ]
  },
  {
    title: "Senior Python Engineer",
    score: 0,
    execution_likelihood: "lower_match",
    components: {
      role_match_score: 36,
      skill_match_score: 14,
      keyword_match_score: 0,
      seniority_match_score: 0,
      execution_likelihood_score: -17,
      location_workmode_score: 13,
      penalties: -64
    },
    match_reasons: [
      "Python appears in a more complex role title",
      "Strongest skill matched: Python",
      "Seniority may be higher than requested",
      "Role appears more senior/complex than requested"
    ]
  },
  {
    title: "Data Entry Clerk",
    score: 17,
    execution_likelihood: "lower_match",
    components: {
      role_match_score: 0,
      skill_match_score: 0,
      keyword_match_score: 0,
      seniority_match_score: 0,
      execution_likelihood_score: 0,
      location_workmode_score: 13,
      penalties: 0
    },
    match_reasons: ["Location mentions Remote", "Remote work mode aligned"]
  },
  {
    title: "Regional Manager",
    score: 0,
    execution_likelihood: "lower_match",
    components: {
      role_match_score: 0,
      skill_match_score: 0,
      keyword_match_score: 0,
      seniority_match_score: 0,
      execution_likelihood_score: -16,
      location_workmode_score: 13,
      penalties: -28
    },
    match_reasons: [
      "Role appears more senior/complex than requested",
      "Contains avoided keyword: manager",
      "Location mentions Remote",
      "Remote work mode aligned"
    ]
  }
]);

const pythonTieBreakerProfile = __test.normalizeProfile({
  target_roles: ["Python"],
  skills: ["Python"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "junior"
});
const simplePythonAutomation = {
  title: "Python Developer",
  company: "Simple Apps",
  location: "Remote",
  source: "Remotive",
  url: "https://example.com/simple-python",
  description: "Build Python scripts for automation, cleanup, testing, and data extraction tasks.",
  category: "Software Development"
};
const seniorPythonArchitecture = {
  title: "Python Developer",
  company: "Platform Systems",
  location: "Remote",
  source: "Remotive",
  url: "https://example.com/senior-python",
  description: "Senior platform role owning enterprise architecture, infrastructure, kubernetes, microservices, and scalable systems.",
  category: "Software Development"
};
const simplePythonScoring = __test.scoreJob(simplePythonAutomation, pythonTieBreakerProfile);
const seniorPythonScoring = __test.scoreJob(seniorPythonArchitecture, pythonTieBreakerProfile);

assert.notEqual(simplePythonScoring.score, seniorPythonScoring.score);
assert(simplePythonScoring.score > seniorPythonScoring.score);
assert.equal(simplePythonScoring.components.execution_likelihood_score, 6);
assert.equal(seniorPythonScoring.components.penalties, -8);
assert(simplePythonScoring.match_reasons.includes("Description suggests simpler execution tasks"));
assert(seniorPythonScoring.match_reasons.includes("Description suggests senior/platform complexity"));

const softwareRemotiveProfile = __test.normalizeProfile({
  target_roles: ["software"],
  skills: ["javascript", "node.js", "typescript", "react"],
  keywords: ["entry", "junior", "support"],
  avoid_keywords: ["senior", "lead"],
  location: "Philippines",
  experience_level: "beginner",
  work_mode: "remote"
});
const remotiveOfficeAssistant = {
  title: "Office Assistant",
  company: "AdminCo",
  location: "Remote",
  source: "Remotive",
  description:
    "Entry level support role helping teams use office software, documents, calendars, and internal tools. Remote role open to candidates in the Philippines.",
  category: "Administrative"
};
const remotiveOperationsSoftwareAssistant = {
  title: "Operations software assistant",
  company: "OpsTech",
  location: "Remote",
  source: "Remotive",
  description:
    "Junior support role helping maintain internal software workflows, triage bugs, test React dashboards, and coordinate Node.js automation tasks. Remote Philippines friendly.",
  category: "Software Development"
};
const remotiveIosDeveloper = {
  title: "iOS Developer",
  company: "MobileCo",
  location: "Remote",
  source: "Remotive",
  description: "Build and test mobile app features, collaborate with software engineers, and support API integrations. Remote team.",
  category: "Software Development"
};
const weakRelatedTechnicalSupport = {
  title: "Technical Support Assistant",
  company: "HelpTech",
  location: "Remote",
  source: "Remotive",
  description: "Entry support role helping users troubleshoot internal tools and triage issues for the product team. Remote team.",
  category: "Customer Support"
};
const seniorIosDeveloper = {
  ...remotiveIosDeveloper,
  title: "Senior Lead iOS Developer",
  description:
    "Lead mobile architecture, mentor engineers, own platform decisions, and guide scalable systems for a remote product team."
};

const officeScoring = __test.scoreJob(remotiveOfficeAssistant, softwareRemotiveProfile);
const operationsScoring = __test.scoreJob(remotiveOperationsSoftwareAssistant, softwareRemotiveProfile);
const iosScoring = __test.scoreJob(remotiveIosDeveloper, softwareRemotiveProfile);
const weakRelatedScoring = __test.scoreJob(weakRelatedTechnicalSupport, softwareRemotiveProfile);
const seniorIosScoring = __test.scoreJob(seniorIosDeveloper, softwareRemotiveProfile);

assert(operationsScoring.score > officeScoring.score);
assert(iosScoring.score > officeScoring.score);
assert(officeScoring.components.role_match_score <= 12);
assert.equal(officeScoring.execution_likelihood, "lower_match");
assert.equal(weakRelatedScoring.execution_likelihood, "adjacent");
assert.equal(iosScoring.execution_likelihood, "stretch");
assert.equal(seniorIosScoring.execution_likelihood, "lower_match");
assert(seniorIosScoring.score < iosScoring.score);

const adminProfile = __test.normalizeProfile({
  target_roles: ["office assistant"],
  skills: ["support"],
  keywords: ["entry"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "beginner"
});
const adminOfficeScoring = __test.scoreJob(remotiveOfficeAssistant, adminProfile);

assert(adminOfficeScoring.score >= 70);
assert(adminOfficeScoring.components.penalties >= 0);
assert.notEqual(adminOfficeScoring.execution_likelihood, "lower_match");

console.log("Scoring regression checks passed.");
