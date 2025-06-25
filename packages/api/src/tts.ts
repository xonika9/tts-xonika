import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createJob, updateJob } from "@tts-xonika/job-store";
import { ApiTtsRequest, ApiTtsResponse } from "@tts-xonika/shared-types";

// This is a placeholder for the actual audio generation logic
const processAudioGeneration = async (jobId: string, body: ApiTtsRequest) => {
  console.log(`[${jobId}] Starting audio generation...`);

  // Simulate generating audio
  await new Promise((resolve) => setTimeout(resolve, 2000));
  updateJob(jobId, { status: "generating" });
  console.log(`[${jobId}] Status updated to 'generating'`);

  // Simulate uploading file
  await new Promise((resolve) => setTimeout(resolve, 3000));
  updateJob(jobId, { status: "uploading" });
  console.log(`[${jobId}] Status updated to 'uploading'`);

  // Simulate completion
  await new Promise((resolve) => setTimeout(resolve, 2000));
  updateJob(jobId, {
    status: "completed",
    audioUrl: `https://example.com/audio/${jobId}.wav`,
  });
  console.log(`[${jobId}] Status updated to 'completed'`);
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const job = createJob();
  const response: ApiTtsResponse = { jobId: job.id };

  // Don't block the response. Start the long-running task in the background.
  processAudioGeneration(job.id, req.body as ApiTtsRequest);

  res.status(202).json(response);
}
