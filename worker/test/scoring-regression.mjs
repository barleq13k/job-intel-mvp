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
    execution_likelihood: "poor_fit",
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
    execution_likelihood: "stretch",
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
    execution_likelihood: "poor_fit",
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

console.log("Scoring regression checks passed.");
