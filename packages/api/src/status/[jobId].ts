import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getJob } from "@tts-xonika/job-store";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { jobId } = req.query;

  if (typeof jobId !== "string") {
    return res.status(400).json({ error: "jobId must be a string." });
  }

  const job = getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found." });
  }

  return res.status(200).json(job);
}
