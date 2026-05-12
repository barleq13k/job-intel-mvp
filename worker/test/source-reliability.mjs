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

const normalized = __test.normalizeRemotiveJob(validRemotiveJob);

assert.equal(normalized.title, "Python Developer");
assert.equal(normalized.company, "Example Co");
assert.equal(normalized.source_job_id, "42");
assert.equal(normalized.salary, null);
assert.equal(normalized.description, "Build Python automation scripts for a remote product team.");
assert.equal(__test.normalizeRemotiveJob(null), null);
assert.equal(__test.normalizeRemotiveJob({ ...validRemotiveJob, title: undefined }), null);
assert.equal(__test.normalizeRemotiveJob({ ...validRemotiveJob, company_name: null }), null);
assert.equal(__test.normalizeRemotiveJob({ ...validRemotiveJob, url: "mailto:jobs@example.com" }).url, null);

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

const formatted = __test.formatJob(normalized, profile, "2026-05-12T12:00:00.000Z");
assert.equal(__test.makeStableJobId(formatted), "remotive_42");

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
