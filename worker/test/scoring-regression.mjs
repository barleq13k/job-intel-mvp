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
      skill_match_score: 14,
      keyword_match_score: 16,
      seniority_match_score: 18,
      execution_likelihood_score: 13,
      location_workmode_score: 13,
      penalties: 0
    },
    match_reasons: [
      "Junior/entry-level workflow detected",
      "Remote-friendly workflow",
      "Python role is central to the title",
      "Core skill matched: Python"
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
      penalties: -59
    },
    match_reasons: [
      "Seniority may be higher than requested",
      "Avoid keyword detected: senior",
      "Remote-friendly workflow",
      "Core skill matched: Python"
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
    match_reasons: ["Remote-friendly workflow"]
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
      "Seniority or architecture complexity detected",
      "Avoid keyword detected: manager",
      "Remote-friendly workflow"
    ]
  }
]);

const customerSupportFakeProfile = __test.normalizeProfile({
  target_roles: ["Customer Support"],
  keywords: ["entry level"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "junior"
});
const pythonProgrammerForSupport = __test.scoreJob(fakeJobs[0], customerSupportFakeProfile);
const entryCustomerSupportForSupport = __test.scoreJob(
  {
    title: "Customer Support Representative (Entry-Level)",
    company: "SupportCo",
    location: "Remote",
    source: "Real Python Fake Jobs",
    url: "https://example.com/customer-support"
  },
  customerSupportFakeProfile
);

assert(pythonProgrammerForSupport.score < 25);
assert.equal(pythonProgrammerForSupport.execution_likelihood, "lower_match");
assert.equal(pythonProgrammerForSupport.components.role_match_score, 0);
assert(entryCustomerSupportForSupport.score >= 70);
assert(entryCustomerSupportForSupport.match_reasons.includes("Direct target role match in title"));

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
assert(simplePythonScoring.match_reasons.includes("Automation-oriented responsibilities detected"));
assert(seniorPythonScoring.match_reasons.includes("Platform or architecture complexity detected"));

const alignedAiPlatformJob = {
  title: "Senior AI Platform Engineer",
  company: "AICo",
  location: "Remote",
  source: "Himalayas",
  url: "https://example.com/senior-ai-platform-engineer",
  description:
    "Own AI platform architecture, Python services, machine learning infrastructure, kubernetes, microservices, and scalable systems.",
  category: "Software Development"
};
const seniorAiProfile = __test.normalizeProfile({
  target_roles: ["AI"],
  skills: ["Python", "machine learning"],
  strongest_skills: ["Python"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "senior"
});
const juniorAiProfile = __test.normalizeProfile({
  ...seniorAiProfile,
  experience_level: "junior"
});
const seniorAlignedAiScoring = __test.scoreJob(alignedAiPlatformJob, seniorAiProfile);
const juniorAlignedAiScoring = __test.scoreJob(alignedAiPlatformJob, juniorAiProfile);
const seniorUnrelatedScoring = __test.scoreJob(
  {
    title: "Senior Account Executive",
    company: "SalesCo",
    location: "Remote",
    source: "Himalayas",
    url: "https://example.com/senior-account-executive",
    description: "Lead enterprise sales pipeline and manage account strategy.",
    category: "Sales"
  },
  seniorAiProfile
);
const juniorLeadAiScoring = __test.scoreJob(
  {
    title: "Lead AI Architect",
    company: "AICo",
    location: "Remote",
    source: "Himalayas",
    url: "https://example.com/lead-ai-architect",
    description: "Lead platform architecture and Python machine learning systems.",
    category: "Software Development"
  },
  juniorAiProfile
);
const seniorRestrictedAiScoring = __test.scoreJob(
  { ...alignedAiPlatformJob, location: "United States" },
  { ...seniorAiProfile, location: "Philippines" }
);

assert(seniorAlignedAiScoring.score > juniorAlignedAiScoring.score);
assert.equal(seniorAlignedAiScoring.execution_likelihood, "strong_fit");
assert.notEqual(seniorAlignedAiScoring.execution_likelihood, "stretch");
assert(seniorAlignedAiScoring.match_reasons.includes("Senior-level workflow matches your profile"));
assert(seniorAlignedAiScoring.match_reasons.includes("Platform or architecture complexity detected"));
assert(juniorAlignedAiScoring.score < 25);
assert.equal(juniorAlignedAiScoring.execution_likelihood, "lower_match");
assert(juniorAlignedAiScoring.components.penalties < seniorAlignedAiScoring.components.penalties);
assert(seniorUnrelatedScoring.score < 25);
assert.equal(seniorUnrelatedScoring.execution_likelihood, "lower_match");
assert(!seniorUnrelatedScoring.match_reasons.includes("Senior-level workflow matches your profile"));
assert(juniorLeadAiScoring.score < 25);
assert.equal(juniorLeadAiScoring.execution_likelihood, "lower_match");
assert(seniorRestrictedAiScoring.match_reasons.includes("Remote role restricted to United States applicants"));
assert(seniorRestrictedAiScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert.equal(seniorRestrictedAiScoring.components.location_workmode_score, 0);
assert(seniorRestrictedAiScoring.components.penalties < seniorAlignedAiScoring.components.penalties);

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

const philippinesLocationProfile = __test.normalizeProfile({
  target_roles: ["QA Automation"],
  skills: ["Python", "testing"],
  keywords: ["remote"],
  location: "Philippines",
  work_mode: "remote",
  experience_level: "any"
});
const baseLocationJob = {
  title: "QA Automation Specialist",
  company: "Location Test Co",
  source: "Himalayas",
  description: "Remote testing automation role using Python scripts and QA workflows.",
  category: "Quality Assurance"
};
const philippinesLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Philippines" },
  philippinesLocationProfile
);
const remoteLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Remote" },
  philippinesLocationProfile
);
const worldwideLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Worldwide" },
  philippinesLocationProfile
);
const globalLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Global" },
  philippinesLocationProfile
);
const apacLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "APAC" },
  philippinesLocationProfile
);
const unitedStatesLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "United States" },
  philippinesLocationProfile
);
const irelandLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Ireland" },
  philippinesLocationProfile
);
const canadaLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Canada" },
  philippinesLocationProfile
);
const brazilLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Brazil only" },
  philippinesLocationProfile
);
const pakistanLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Pakistan only" },
  philippinesLocationProfile
);
const spainLocationScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Spain" },
  philippinesLocationProfile
);
const bulgariaOnlyRemoteScoring = __test.scoreJob(
  {
    ...baseLocationJob,
    location: "Remote",
    description: "Remote testing automation role for Bulgaria only applicants."
  },
  philippinesLocationProfile
);
const multiCountryIncludesPhilippinesScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Brazil, Colombia, Philippines" },
  philippinesLocationProfile
);
const multiCountryExcludesPhilippinesScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Brazil, Colombia" },
  philippinesLocationProfile
);
const neutralMultiCountryScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Brazil, Colombia" },
  { ...philippinesLocationProfile, location: "" }
);
const globalSingleCountryScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Spain" },
  { ...philippinesLocationProfile, location: "Global" }
);
const anywhereMultiCountryScoring = __test.scoreJob(
  { ...baseLocationJob, location: "Brazil, Colombia" },
  { ...philippinesLocationProfile, location: "Anywhere" }
);
const usOnlyRemoteScoring = __test.scoreJob(
  {
    ...baseLocationJob,
    location: "Remote",
    description: "Remote testing automation role. United States only. Applicants must be authorized to work in the US."
  },
  philippinesLocationProfile
);
const blankLocationUsOnlyScoring = __test.scoreJob(
  {
    ...baseLocationJob,
    location: "Remote",
    description: "Remote testing automation role. United States only. Applicants must be authorized to work in the US."
  },
  { ...philippinesLocationProfile, location: "" }
);
const anywhereLocationUsOnlyScoring = __test.scoreJob(
  {
    ...baseLocationJob,
    location: "Remote",
    description: "Remote testing automation role. United States only. Applicants must be authorized to work in the US."
  },
  { ...philippinesLocationProfile, location: "Anywhere" }
);
const euOnlyRemoteScoring = __test.scoreJob(
  {
    ...baseLocationJob,
    location: "Remote",
    description: "Remote testing automation role for EU only candidates. Visa sponsorship unavailable."
  },
  philippinesLocationProfile
);
const stateRestrictedRemoteScoring = __test.scoreJob(
  {
    ...baseLocationJob,
    location: "Remote",
    description: "Remote testing automation role, hiring in these states for work authorization reasons."
  },
  philippinesLocationProfile
);

assert(philippinesLocationScoring.match_reasons.includes("Location aligns with Philippines"));
assert(!philippinesLocationScoring.match_reasons.some((reason) => reason.startsWith("Remote role restricted to ")));
assert.equal(philippinesLocationScoring.components.location_workmode_score, 13);
assert.equal(philippinesLocationScoring.components.penalties, 0);
assert(
  __test
    .scoreJob({ ...baseLocationJob, location: "Philippines" }, { ...philippinesLocationProfile, location: "PH" })
    .match_reasons.includes("Location aligns with PH")
);

for (const compatibleScoring of [remoteLocationScoring, worldwideLocationScoring, globalLocationScoring, apacLocationScoring]) {
  assert(compatibleScoring.match_reasons.includes("Worldwide/remote location compatible"));
  assert(!compatibleScoring.match_reasons.some((reason) => reason.startsWith("Remote role restricted to ")));
  assert(compatibleScoring.match_reasons.includes("Remote-friendly workflow"));
  assert.equal(compatibleScoring.components.location_workmode_score, 13);
  assert.equal(compatibleScoring.components.penalties, 0);
}

for (const restrictedScoring of [unitedStatesLocationScoring, irelandLocationScoring, canadaLocationScoring]) {
  assert(restrictedScoring.match_reasons.some((reason) => reason.startsWith("Remote role restricted to ")));
  assert(restrictedScoring.match_reasons.includes("Outside preferred location: Philippines"));
  assert(!restrictedScoring.match_reasons.includes("Remote-friendly workflow"));
  assert.equal(restrictedScoring.components.location_workmode_score, 0);
  assert.equal(restrictedScoring.components.penalties, -10);
  assert(restrictedScoring.score > 0);
  assert(restrictedScoring.score < philippinesLocationScoring.score);
}

assert(usOnlyRemoteScoring.match_reasons.includes("Remote role restricted to United States applicants"));
assert(usOnlyRemoteScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert(!usOnlyRemoteScoring.match_reasons.includes("Remote-friendly workflow"));
assert.equal(usOnlyRemoteScoring.components.location_workmode_score, 0);
assert.equal(usOnlyRemoteScoring.components.penalties, -10);
assert(usOnlyRemoteScoring.score < remoteLocationScoring.score);

assert(euOnlyRemoteScoring.match_reasons.includes("Remote role restricted to EU applicants"));
assert(euOnlyRemoteScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert(!euOnlyRemoteScoring.match_reasons.includes("Remote-friendly workflow"));
assert.equal(euOnlyRemoteScoring.components.location_workmode_score, 0);
assert.equal(euOnlyRemoteScoring.components.penalties, -10);
assert(euOnlyRemoteScoring.score < remoteLocationScoring.score);

assert(stateRestrictedRemoteScoring.match_reasons.includes("Remote role restricted to specific hiring regions"));
assert(stateRestrictedRemoteScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert(!stateRestrictedRemoteScoring.match_reasons.includes("Remote-friendly workflow"));
assert.equal(stateRestrictedRemoteScoring.components.location_workmode_score, 0);
assert.equal(stateRestrictedRemoteScoring.components.penalties, -10);

assert(blankLocationUsOnlyScoring.match_reasons.includes("Remote role restricted to United States applicants"));
assert(!blankLocationUsOnlyScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert(!blankLocationUsOnlyScoring.match_reasons.includes("Remote-friendly workflow"));
assert.equal(blankLocationUsOnlyScoring.components.location_workmode_score, 0);
assert.equal(blankLocationUsOnlyScoring.components.penalties, 0);

assert(anywhereLocationUsOnlyScoring.match_reasons.includes("Remote role restricted to United States applicants"));
assert(!anywhereLocationUsOnlyScoring.match_reasons.includes("Outside preferred location: Anywhere"));
assert(!anywhereLocationUsOnlyScoring.match_reasons.includes("Remote-friendly workflow"));
assert.equal(anywhereLocationUsOnlyScoring.components.location_workmode_score, 0);
assert.equal(anywhereLocationUsOnlyScoring.components.penalties, 0);

for (const restrictedCountryScoring of [brazilLocationScoring, pakistanLocationScoring]) {
  assert(restrictedCountryScoring.match_reasons.some((reason) => reason.startsWith("Remote role restricted to ")));
  assert(restrictedCountryScoring.match_reasons.includes("Outside preferred location: Philippines"));
  assert(!restrictedCountryScoring.match_reasons.includes("Remote-friendly workflow"));
  assert.equal(restrictedCountryScoring.components.location_workmode_score, 0);
  assert.equal(restrictedCountryScoring.components.penalties, -10);
  assert(restrictedCountryScoring.score > 0);
  assert(restrictedCountryScoring.score < philippinesLocationScoring.score);
}

assert(spainLocationScoring.match_reasons.includes("Remote role restricted to Spain applicants"));
assert(spainLocationScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert(!spainLocationScoring.match_reasons.includes("Remote-friendly workflow"));
assert.equal(spainLocationScoring.components.location_workmode_score, 0);
assert.equal(spainLocationScoring.components.penalties, -10);

assert(bulgariaOnlyRemoteScoring.match_reasons.includes("Remote role restricted to Bulgaria applicants"));
assert(bulgariaOnlyRemoteScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert(!bulgariaOnlyRemoteScoring.match_reasons.includes("Remote-friendly workflow"));
assert.equal(bulgariaOnlyRemoteScoring.components.location_workmode_score, 0);
assert.equal(bulgariaOnlyRemoteScoring.components.penalties, -10);

assert(multiCountryIncludesPhilippinesScoring.match_reasons.includes("Listed countries include Philippines"));
assert(!multiCountryIncludesPhilippinesScoring.match_reasons.some((reason) => reason.startsWith("Remote role restricted to ")));
assert.equal(multiCountryIncludesPhilippinesScoring.components.location_workmode_score, 13);
assert.equal(multiCountryIncludesPhilippinesScoring.components.penalties, 0);

assert(multiCountryExcludesPhilippinesScoring.match_reasons.includes("Remote role restricted to listed countries"));
assert(multiCountryExcludesPhilippinesScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert(!multiCountryExcludesPhilippinesScoring.match_reasons.includes("Remote role restricted to Brazil applicants"));
assert(!multiCountryExcludesPhilippinesScoring.match_reasons.includes("Remote-friendly workflow"));
assert.equal(multiCountryExcludesPhilippinesScoring.components.location_workmode_score, 0);
assert.equal(multiCountryExcludesPhilippinesScoring.components.penalties, -10);

assert(!neutralMultiCountryScoring.match_reasons.some((reason) => reason.startsWith("Remote role restricted to ")));
assert(!neutralMultiCountryScoring.match_reasons.some((reason) => reason.includes("Outside preferred location")));
assert.equal(neutralMultiCountryScoring.components.penalties, 0);

assert(!globalSingleCountryScoring.match_reasons.some((reason) => reason.startsWith("Remote role restricted to ")));
assert(!globalSingleCountryScoring.match_reasons.some((reason) => reason.includes("Outside preferred location")));
assert.equal(globalSingleCountryScoring.components.penalties, 0);

assert(!anywhereMultiCountryScoring.match_reasons.some((reason) => reason.startsWith("Remote role restricted to ")));
assert(!anywhereMultiCountryScoring.match_reasons.some((reason) => reason.includes("Outside preferred location")));
assert.equal(anywhereMultiCountryScoring.components.penalties, 0);

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

const supportProfile = __test.normalizeProfile({
  target_roles: ["Software Support"],
  skills: ["workflow", "software", "support"],
  keywords: ["remote", "junior"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "junior"
});
const softwareSupportNoAutomation = {
  title: "Software Support Specialist",
  company: "SupportCo",
  location: "Remote",
  source: "Himalayas",
  description: "Troubleshoot customer issues, triage product questions, update tickets, and help users resolve software problems.",
  category: "Customer Support"
};
const automationSupport = {
  title: "Automation Support Specialist",
  company: "AutomationCo",
  location: "Remote",
  source: "Himalayas",
  description: "Support Zapier workflow automation, debug API automation issues, and help users improve automated processes.",
  category: "Customer Support"
};
const productSpecialistNoAutomation = {
  title: "Software Solutions Technical Specialist",
  company: "ProductCo",
  location: "USA Remote, US",
  source: "Himalayas",
  description:
    "Support product installs, troubleshoot customer issues, coordinate implementation steps, manage deployment questions, and guide technical support workflows.",
  category: "Customer Support"
};
const workflowSupportOnly = {
  title: "Workflow Support Specialist",
  company: "WorkflowCo",
  location: "Remote",
  source: "Himalayas",
  description: "Support customer workflows, triage operations requests, troubleshoot software issues, and document product specialist handoffs.",
  category: "Customer Support"
};
const qaAutomationRole = {
  title: "QA Automation Specialist",
  company: "QACo",
  location: "Remote",
  source: "Himalayas",
  description: "Build test automation with Playwright, Selenium, and CI/CD automation for release workflows.",
  category: "Quality Assurance"
};
const supportNoAutomationScoring = __test.scoreJob(softwareSupportNoAutomation, supportProfile);
const automationSupportScoring = __test.scoreJob(automationSupport, supportProfile);
const productSpecialistNoAutomationScoring = __test.scoreJob(productSpecialistNoAutomation, supportProfile);
const workflowSupportOnlyScoring = __test.scoreJob(workflowSupportOnly, supportProfile);
const qaAutomationScoring = __test.scoreJob(qaAutomationRole, supportProfile);

assert(!supportNoAutomationScoring.match_reasons.includes("Automation-oriented responsibilities detected"));
assert(supportNoAutomationScoring.match_reasons.includes("Technical support/operations overlap detected"));
assert(automationSupportScoring.match_reasons.includes("Automation-oriented responsibilities detected"));
assert(!productSpecialistNoAutomationScoring.match_reasons.includes("Automation-oriented responsibilities detected"));
assert(productSpecialistNoAutomationScoring.match_reasons.includes("Technical support/operations overlap detected"));
assert(!workflowSupportOnlyScoring.match_reasons.includes("Automation-oriented responsibilities detected"));
assert(qaAutomationScoring.match_reasons.includes("Automation-oriented responsibilities detected"));

const supportRelevanceFloorProfile = __test.normalizeProfile({
  target_roles: ["Software Support"],
  skills: ["java script", "node js", "type script", "react js"],
  keywords: ["entry", "remote", "mid", "junior", "support"],
  avoid_keywords: ["senior", "manager", "lead", "engineer"],
  location: "Philippines",
  experience_level: "junior",
  work_mode: "remote"
});
const restrictedUsTechnicalSupport = {
  title: "Technical Customer Support",
  company: "HelpCo",
  location: "United States",
  source: "Himalayas",
  description: "Remote support role helping customers troubleshoot software issues.",
  category: "Customer Support"
};
const restrictedCanadaTechnicalSupport = {
  ...restrictedUsTechnicalSupport,
  location: "Canada"
};
const helpDeskSupport = {
  title: "POS Help Desk Customer Support Representative",
  company: "POSCo",
  location: "Remote",
  source: "Himalayas",
  description: "Help desk customer support for POS software and product troubleshooting.",
  category: "Customer Support"
};
const genericSupportSpecialist = {
  title: "Support Specialist",
  company: "GenericCo",
  location: "Remote",
  source: "Himalayas",
  description: "Support customers, triage product issues, and troubleshoot software workflows.",
  category: "Customer Support"
};
const seniorSupportEngineer = {
  title: "Senior Lead Software Support Engineer",
  company: "SeniorCo",
  location: "United States",
  source: "Himalayas",
  description: "Lead complex engineering escalations, manage support architecture, and mentor engineers.",
  category: "Customer Support"
};
const restrictedUsTechnicalSupportScoring = __test.scoreJob(restrictedUsTechnicalSupport, supportRelevanceFloorProfile);
const restrictedCanadaTechnicalSupportScoring = __test.scoreJob(restrictedCanadaTechnicalSupport, supportRelevanceFloorProfile);
const helpDeskSupportScoring = __test.scoreJob(helpDeskSupport, supportRelevanceFloorProfile);
const genericSupportSpecialistScoring = __test.scoreJob(genericSupportSpecialist, supportRelevanceFloorProfile);
const seniorSupportEngineerScoring = __test.scoreJob(seniorSupportEngineer, supportRelevanceFloorProfile);

assert(restrictedUsTechnicalSupportScoring.score >= 25);
assert(restrictedUsTechnicalSupportScoring.match_reasons.includes("Remote role restricted to United States applicants"));
assert(restrictedUsTechnicalSupportScoring.match_reasons.includes("Outside preferred location: Philippines"));
assert(restrictedCanadaTechnicalSupportScoring.score >= 25);
assert(restrictedCanadaTechnicalSupportScoring.match_reasons.includes("Remote role restricted to Canada applicants"));
assert(helpDeskSupportScoring.score >= 25);
assert.notEqual(helpDeskSupportScoring.execution_likelihood, "lower_match");
assert(genericSupportSpecialistScoring.score >= 25);
assert.notEqual(genericSupportSpecialistScoring.execution_likelihood, "lower_match");
assert(seniorSupportEngineerScoring.score < 25);
assert.equal(seniorSupportEngineerScoring.execution_likelihood, "lower_match");
assert(seniorSupportEngineerScoring.components.penalties <= -35);

const broadSupportCategoryOnlyProfile = __test.normalizeProfile({
  target_roles: ["support"],
  keywords: ["remote"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "any"
});
const remoteOkVpProduct = {
  title: "VP of Product and Partnerships",
  company: "RemoteOK Product Co",
  location: "Remote",
  source: "RemoteOK",
  description: "Lead product partnerships, executive roadmap, customer-facing strategy, and commercial operations.",
  category: "support, product, partnerships, operations, executive"
};
const remoteOkClinicalProvider = {
  title: "Clinical Provider",
  company: "RemoteOK Health Co",
  location: "Remote",
  source: "RemoteOK",
  description: "Provide clinical care, patient counseling, and population health support.",
  category: "support, health, clinical"
};
const remoteOkPopulationHealth = {
  title: "Population Health Director",
  company: "RemoteOK Care Co",
  location: "Remote",
  source: "RemoteOK",
  description: "Own population health programs and clinical partnerships.",
  category: "support, health, management"
};
const remoteOkSupportSpecialist = {
  title: "Support Specialist",
  company: "RemoteOK Support Co",
  location: "Remote",
  source: "RemoteOK",
  description: "Support customers, triage issues, and troubleshoot product workflows.",
  category: "customer support"
};
const remoteOkCustomerSupportRepresentative = {
  ...remoteOkSupportSpecialist,
  title: "Customer Support Representative"
};
const remoteOkOperationsSupportAssociate = {
  ...remoteOkSupportSpecialist,
  title: "Operations and Support Associate",
  description: "Support operations, triage customer issues, and coordinate product support workflows."
};
const remoteOkTechnicalSupportSpecialist = {
  ...remoteOkSupportSpecialist,
  title: "Technical Support Specialist",
  description: "Troubleshoot software issues and support customers through technical product questions."
};
const remoteOkVpProductScoring = __test.scoreJob(remoteOkVpProduct, broadSupportCategoryOnlyProfile);
const remoteOkClinicalProviderScoring = __test.scoreJob(remoteOkClinicalProvider, broadSupportCategoryOnlyProfile);
const remoteOkPopulationHealthScoring = __test.scoreJob(remoteOkPopulationHealth, broadSupportCategoryOnlyProfile);
const remoteOkSupportSpecialistScoring = __test.scoreJob(remoteOkSupportSpecialist, broadSupportCategoryOnlyProfile);
const remoteOkCustomerSupportRepresentativeScoring = __test.scoreJob(remoteOkCustomerSupportRepresentative, broadSupportCategoryOnlyProfile);
const remoteOkOperationsSupportAssociateScoring = __test.scoreJob(remoteOkOperationsSupportAssociate, broadSupportCategoryOnlyProfile);
const remoteOkTechnicalSupportSpecialistScoring = __test.scoreJob(remoteOkTechnicalSupportSpecialist, broadSupportCategoryOnlyProfile);

for (const categoryOnlyMismatchScoring of [
  remoteOkVpProductScoring,
  remoteOkClinicalProviderScoring,
  remoteOkPopulationHealthScoring
]) {
  assert(categoryOnlyMismatchScoring.score <= 19);
  assert.equal(categoryOnlyMismatchScoring.execution_likelihood, "lower_match");
  assert(categoryOnlyMismatchScoring.match_reasons.includes("Unrelated occupation for category/tag-only match"));
}

assert(remoteOkSupportSpecialistScoring.score >= 25);
assert.notEqual(remoteOkSupportSpecialistScoring.execution_likelihood, "lower_match");
assert(!remoteOkSupportSpecialistScoring.match_reasons.includes("Unrelated occupation for category/tag-only match"));
assert(remoteOkCustomerSupportRepresentativeScoring.score >= 25);
assert.notEqual(remoteOkCustomerSupportRepresentativeScoring.execution_likelihood, "lower_match");
assert(remoteOkOperationsSupportAssociateScoring.score >= 25);
assert.notEqual(remoteOkOperationsSupportAssociateScoring.execution_likelihood, "lower_match");
assert(remoteOkTechnicalSupportSpecialistScoring.score >= 25);
assert.notEqual(remoteOkTechnicalSupportSpecialistScoring.execution_likelihood, "lower_match");

const remoteOkSupportLeakCases = [
  ["Contract Mandarin Document Review Attorney", 19],
  ["Data Entry Coordinator", 19],
  ["Policy Intern", 19],
  ["Travel Appointment Coordinator", 19],
  ["Destination Coordinator", 19],
  ["Online Hospitality Services Coordinator", 19]
].map(([title, maxScore]) => ({
  title,
  maxScore,
  scoring: __test.scoreJob(
    {
      title,
      company: "RemoteOK Broad Feed Co",
      location: "Remote",
      source: "RemoteOK",
      description: "Remote role from a broad source feed.",
      category: "support, operations"
    },
    broadSupportCategoryOnlyProfile
  )
}));

for (const { title, maxScore, scoring } of remoteOkSupportLeakCases) {
  assert(scoring.score <= maxScore, `${title} scored ${scoring.score}`);
  assert.equal(scoring.execution_likelihood, "lower_match");
  assert(scoring.match_reasons.includes("Unrelated occupation for category/tag-only match"));
}

const genericCategoryOnlyCoordinatorScoring = __test.scoreJob(
  {
    title: "Project Coordinator",
    company: "RemoteOK Coordinator Co",
    location: "Remote",
    source: "RemoteOK",
    description: "Coordinate tasks for a remote operations team.",
    category: "support, operations"
  },
  broadSupportCategoryOnlyProfile
);

assert(genericCategoryOnlyCoordinatorScoring.score <= 24);
assert.equal(genericCategoryOnlyCoordinatorScoring.execution_likelihood, "lower_match");
assert(genericCategoryOnlyCoordinatorScoring.match_reasons.includes("Category/tag overlap only"));

const adminCategoryOnlyProfile = __test.normalizeProfile({
  target_roles: ["admin"],
  keywords: ["remote"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "any"
});
const assistantCategoryOnlyProfile = __test.normalizeProfile({
  target_roles: ["assistant"],
  keywords: ["remote"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "any"
});
const adminTaggedDirectorScoring = __test.scoreJob(
  {
    title: "Director of Population Health",
    company: "HealthOps",
    location: "Remote",
    source: "RemoteOK",
    description: "Lead population health operations and clinical partnerships.",
    category: "admin, operations, health"
  },
  adminCategoryOnlyProfile
);
const assistantTaggedProviderScoring = __test.scoreJob(
  {
    title: "Clinical Provider",
    company: "CareOps",
    location: "Remote",
    source: "RemoteOK",
    description: "Provide patient care and clinical counseling.",
    category: "assistant, health, clinical"
  },
  assistantCategoryOnlyProfile
);

assert(adminTaggedDirectorScoring.score < 25);
assert.equal(adminTaggedDirectorScoring.execution_likelihood, "lower_match");
assert(adminTaggedDirectorScoring.match_reasons.includes("Unrelated occupation for category/tag-only match"));
assert(assistantTaggedProviderScoring.score < 25);
assert.equal(assistantTaggedProviderScoring.execution_likelihood, "lower_match");
assert(assistantTaggedProviderScoring.match_reasons.includes("Unrelated occupation for category/tag-only match"));

const virtualAssistantCategoryOnlyProfile = __test.normalizeProfile({
  target_roles: ["virtual assistant"],
  keywords: ["remote"],
  location: "Remote",
  work_mode: "remote",
  experience_level: "any"
});
const virtualAssistantDataEntryScoring = __test.scoreJob(
  {
    title: "Data Entry Coordinator",
    company: "VA Test Co",
    location: "Remote",
    source: "RemoteOK",
    description: "Coordinate records and perform data cleanup for a remote team.",
    category: "virtual assistant, operations"
  },
  virtualAssistantCategoryOnlyProfile
);

assert(virtualAssistantDataEntryScoring.score <= 19);
assert.equal(virtualAssistantDataEntryScoring.execution_likelihood, "lower_match");
assert(virtualAssistantDataEntryScoring.match_reasons.includes("Unrelated occupation for category/tag-only match"));

console.log("Scoring regression checks passed.");
