export type JobStatus =
  | "pending"
  | "generating"
  | "uploading"
  | "completed"
  | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  audioUrl?: string;
  error?: string;
  createdAt: number;
}

export interface VoiceConfig {
  speakerName?: string;
  voice: string;
}

export interface ApiTtsRequest {
  model: "Gemini 2.5 Flash" | "Gemini 2.5 Pro";
  mode: "single" | "multi";
  text: string;
  voiceConfig: VoiceConfig[];
}

export interface ApiTtsResponse {
  jobId: string;
}
