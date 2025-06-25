import { Job, JobStatus } from "@tts-xonika/shared-types";
import { randomUUID } from "crypto";

const jobStore = new Map<string, Job>();

export const createJob = (): Job => {
  const jobId = randomUUID();
  const newJob: Job = {
    id: jobId,
    status: "pending",
    createdAt: Date.now(),
  };
  jobStore.set(jobId, newJob);
  return newJob;
};

export const getJob = (id: string): Job | undefined => {
  return jobStore.get(id);
};

export const updateJob = (
  id: string,
  data: Partial<Omit<Job, "id" | "createdAt">>
): Job | undefined => {
  const job = jobStore.get(id);
  if (!job) {
    return undefined;
  }

  const updatedJob = { ...job, ...data };
  jobStore.set(id, updatedJob);
  return updatedJob;
};

// Cleanup old jobs to prevent memory leaks
const JOB_TTL_MS = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobStore.entries()) {
    if (now - job.createdAt > JOB_TTL_MS) {
      jobStore.delete(id);
    }
  }
}, 60 * 1000); // Run every minute
