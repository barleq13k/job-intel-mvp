import { strict as assert } from "node:assert";
import { __test } from "../src/index.js";

const profile = __test.normalizeProfile({
  target_roles: ["Python Developer"],
  skills: ["Python"],
  keywords: ["remote"],
  work_mode: "remote",
  experience_level: "junior"
});

const validRemotiveJob = {
  id: 42,
  title: "Python Developer",
  company_name: "Example Co",
  candidate_required_location: "Remote",
  url: "https://remotive.com/remote-jobs/software-dev/python-developer-42?utm_source=newsletter#apply",
  job_type: "full_time",
  salary: "not specified",
  description: "<p>Build Python automation scripts for a remote product team.</p>",
  category: "Software Development"
};
const validHimalayasJob = {
  guid: "himalayas-python-42",
  title: "Junior Python Automation Engineer",
  companyName: "Remote Tools Co",
  employmentType: "Full Time",
  minSalary: 70000,
  maxSalary: 90000,
  currency: "USD",
  locationRestrictions: [{ name: "Philippines", alpha2: "PH", slug: "philippines" }],
  timezoneRestrictions: [],
  categories: ["Engineering", "Quality Assurance"],
  excerpt: "Build test automation for remote software teams.",
  description: "<p>Write Python scripts, QA checks, and workflow automation.</p>",
  applicationLink: "https://himalayas.app/companies/remote-tools/jobs/junior-python-automation-engineer?utm_campaign=feed#apply"
};

const normalized = __test.normalizeRemotiveJob(validRemotiveJob);
const normalizedHimalayas = __test.normalizeHimalayasJob(validHimalayasJob);
const duplicateTextHimalayas = __test.normalizeHimalayasJob({
  ...validHimalayasJob,
  excerpt: "Build workflow automation for customer teams.",
  description: "<p>Build workflow automation for customer teams.</p><p>Help users debug Zapier workflows.</p>"
});

assert.equal(normalized.title, "Python Developer");
assert.equal(normalized.company, "Example Co");
assert.equal(normalized.source_job_id, "42");
assert.equal(normalized.salary, null);
assert.equal(normalized.description, "Build Python automation scripts for a remote product team.");
assert.equal(__test.normalizeRemotiveJob(null), null);
assert.equal(__test.normalizeRemotiveJob({ ...validRemotiveJob, title: undefined }), null);
assert.equal(__test.normalizeRemotiveJob({ ...validRemotiveJob, company_name: null }), null);
assert.equal(__test.normalizeRemotiveJob({ ...validRemotiveJob, url: "mailto:jobs@example.com" }).url, null);
assert.equal(normalizedHimalayas.title, "Junior Python Automation Engineer");
assert.equal(normalizedHimalayas.company, "Remote Tools Co");
assert.equal(normalizedHimalayas.source_job_id, "himalayas-python-42");
assert.equal(normalizedHimalayas.location, "Philippines");
assert.equal(normalizedHimalayas.employment_type, "Full Time");
assert.equal(normalizedHimalayas.salary, "USD 70,000 - 90,000");
assert.equal(normalizedHimalayas.category, "Engineering, Quality Assurance");
assert.equal(normalizedHimalayas.description, "Build test automation for remote software teams. Write Python scripts, QA checks, and workflow automation.");
assert.equal(duplicateTextHimalayas.description, "Build workflow automation for customer teams. Help users debug Zapier workflows.");
assert.equal(__test.normalizeHimalayasJob(null), null);
assert.equal(__test.normalizeHimalayasJob({ ...validHimalayasJob, title: undefined }), null);
assert.equal(__test.normalizeHimalayasJob({ ...validHimalayasJob, companyName: null }), null);
assert.equal(__test.normalizeHimalayasJob({ ...validHimalayasJob, applicationLink: "mailto:jobs@example.com" }).url, null);

assert.equal(
  __test.dedupeJobs([
    normalized,
    { ...normalized, title: "Different title from duplicate source id" }
  ]).length,
  1
);

assert.equal(
  __test.dedupeJobs([
    { ...normalized, source_job_id: null, url: "https://remotive.com/jobs/42?utm_source=a#apply" },
    { ...normalized, source_job_id: null, url: "https://remotive.com/jobs/42" }
  ]).length,
  1
);
assert.equal(
  __test.dedupeJobs([
    normalizedHimalayas,
    { ...normalizedHimalayas, title: "Different title from duplicate Himalayas guid" }
  ]).length,
  1
);
assert.equal(
  __test.dedupeJobs([
    { ...normalizedHimalayas, source_job_id: null, url: "https://himalayas.app/jobs/42?utm_source=a#apply" },
    { ...normalizedHimalayas, source_job_id: null, url: "https://himalayas.app/jobs/42" }
  ]).length,
  1
);

const formatted = __test.formatJob(normalized, profile, "2026-05-12T12:00:00.000Z");
const formattedHimalayas = __test.formatJob(normalizedHimalayas, profile, "2026-05-12T12:00:00.000Z");
const formattedDuplicateText = __test.formatJob(duplicateTextHimalayas, profile, "2026-05-12T12:00:00.000Z");
assert.equal(__test.makeStableJobId(formatted), "remotive_42");
assert.equal(__test.makeStableJobId(formattedHimalayas), "himalayas_himalayas_python_42");
assert(!formattedDuplicateText.summary.includes("Build workflow automation for customer teams. Build workflow automation for customer teams."));

const originalFetch = globalThis.fetch;

try {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({
      jobs: [
        validRemotiveJob,
        null,
        { ...validRemotiveJob, id: 43, title: "" },
        { ...validRemotiveJob, id: 44, company_name: undefined }
      ]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  const sourceResult = await __test.fetchRemotiveJobs(profile);
  assert.equal(sourceResult.jobs.length, 1);
  assert.equal(sourceResult.droppedCount, 3);

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ jobs: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  const emptyResult = await __test.fetchRemotiveJobs(profile);
  assert.deepEqual(emptyResult, { jobs: [], droppedCount: 0 });

  globalThis.fetch = async () => new Response("temporary outage", { status: 503 });
  await assert.rejects(() => __test.fetchRemotiveJobs(profile), /status 503/);

  globalThis.fetch = async () => new Response("not json", { status: 200 });
  await assert.rejects(() => __test.fetchRemotiveJobs(profile), /invalid JSON/);

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  await assert.rejects(() => __test.fetchRemotiveJobs(profile), /unexpected response shape/);

  globalThis.fetch = async (url) => {
    const page = new URL(url).searchParams.get("page");

    return new Response(JSON.stringify({
      jobs: page === "1"
        ? [
            validHimalayasJob,
            null,
            { ...validHimalayasJob, guid: "himalayas-python-43", title: "" },
            { ...validHimalayasJob, guid: "himalayas-python-44", companyName: undefined }
          ]
        : []
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  const himalayasResult = await __test.fetchHimalayasJobs(profile);
  assert.equal(himalayasResult.jobs.length, 1);
  assert.equal(himalayasResult.droppedCount, 3);
  assert.equal(himalayasResult.pagesFetched, 2);

  globalThis.fetch = async (url) => {
    const page = new URL(url).searchParams.get("page");
    const pageJobs = {
      1: [validHimalayasJob],
      2: [{ ...validHimalayasJob, guid: "himalayas-python-43", title: "Python Support Engineer" }],
      3: []
    };

    return new Response(JSON.stringify({ jobs: pageJobs[page] || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  const pagedHimalayasResult = await __test.fetchHimalayasJobs(profile);
  assert.equal(pagedHimalayasResult.jobs.length, 2);
  assert.equal(pagedHimalayasResult.droppedCount, 0);
  assert.equal(pagedHimalayasResult.pagesFetched, 3);

  globalThis.fetch = async (url) => {
    const page = new URL(url).searchParams.get("page");

    if (page === "2") {
      return new Response("temporary outage", { status: 503 });
    }

    return new Response(JSON.stringify({ jobs: [validHimalayasJob] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  };

  const partialHimalayasResult = await __test.fetchHimalayasJobs(profile);
  assert.equal(partialHimalayasResult.jobs.length, 1);
  assert.equal(partialHimalayasResult.droppedCount, 0);
  assert.equal(partialHimalayasResult.pagesFetched, 1);
  assert.match(partialHimalayasResult.warning, /page 2/);

  globalThis.fetch = async () =>
    new Response(JSON.stringify({ jobs: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  const emptyHimalayasResult = await __test.fetchHimalayasJobs(profile);
  assert.equal(emptyHimalayasResult.jobs.length, 0);
  assert.equal(emptyHimalayasResult.droppedCount, 0);
  assert.equal(emptyHimalayasResult.pagesFetched, 1);

  globalThis.fetch = async (_url, options = {}) =>
    new Promise((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    });

  await assert.rejects(() => __test.fetchWithTimeout("https://example.test", {}, 1), /aborted/);
} finally {
  globalThis.fetch = originalFetch;
}

console.log("Source reliability checks passed.");
