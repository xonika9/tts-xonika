import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Grid,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type {
  ApiTtsRequest,
  ApiTtsResponse,
  Job,
  JobStatus,
  VoiceConfig,
} from "../packages/shared-types";

const availableVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

function App() {
  const [model, setModel] =
    useState<ApiTtsRequest["model"]>("Gemini 2.5 Flash");
  const [mode, setMode] = useState<ApiTtsRequest["mode"]>("single");
  const [voiceConfigs, setVoiceConfigs] = useState<VoiceConfig[]>([
    { voice: "alloy" },
  ]);
  const [text, setText] = useState("");

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading =
    jobStatus === "pending" ||
    jobStatus === "generating" ||
    jobStatus === "uploading";

  // Polling logic
  useEffect(() => {
    if (!jobId || jobStatus === "completed" || jobStatus === "failed") {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const { data: job } = await axios.get<Job>(`/api/status/${jobId}`);
        setJobStatus(job.status);
        if (job.status === "completed") {
          setAudioUrl(job.audioUrl || null);
          setJobId(null); // Stop polling
        }
        if (job.status === "failed") {
          setError(job.error || "An unknown error occurred.");
          setJobId(null); // Stop polling
        }
      } catch (err) {
        setError("Failed to get job status.");
        setJobId(null); // Stop polling
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [jobId, jobStatus]);

  const handleGenerateSpeech = async () => {
    setError(null);
    setAudioUrl(null);
    setJobStatus("pending");

    const payload: ApiTtsRequest = {
      model,
      mode,
      text,
      voiceConfig: voiceConfigs,
    };

    try {
      const { data } = await axios.post<ApiTtsResponse>("/api/tts", payload);
      setJobId(data.jobId);
    } catch (err) {
      setError("Failed to start speech generation job.");
      setJobStatus("failed");
    }
  };

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "single" | "multi" | null
  ) => {
    if (newMode) {
      setMode(newMode);
      if (newMode === "single") {
        setVoiceConfigs([{ voice: "alloy" }]);
      } else {
        setVoiceConfigs([
          { speakerName: "Speaker1", voice: "alloy" },
          { speakerName: "Speaker2", voice: "nova" },
        ]);
      }
    }
  };

  const handleVoiceConfigChange = (
    index: number,
    field: keyof VoiceConfig,
    value: string
  ) => {
    const newConfigs = [...voiceConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setVoiceConfigs(newConfigs);
  };

  const addSpeaker = () => {
    setVoiceConfigs([
      ...voiceConfigs,
      { speakerName: `Speaker${voiceConfigs.length + 1}`, voice: "fable" },
    ]);
  };

  const removeSpeaker = (index: number) => {
    setVoiceConfigs(voiceConfigs.filter((_, i) => i !== index));
  };

  const getHelperText = () => {
    if (isLoading) {
      return `Status: ${jobStatus}...`;
    }
    if (jobStatus === "failed") {
      return `Error: ${error}`;
    }
    if (jobStatus === "completed" && audioUrl) {
      return "Your text has been converted to speech.";
    }
    return "";
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Text-to-Speech
      </Typography>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Model Selection
        </Typography>
        <ToggleButtonGroup
          value={model}
          exclusive
          onChange={(_e, v) => v && setModel(v)}
          fullWidth
          disabled={isLoading}
        >
          <ToggleButton value="Gemini 2.5 Flash">Gemini 2.5 Flash</ToggleButton>
          <ToggleButton value="Gemini 2.5 Pro">Gemini 2.5 Pro</ToggleButton>
        </ToggleButtonGroup>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Speech Mode
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          fullWidth
          disabled={isLoading}
        >
          <ToggleButton value="single">Single Speaker</ToggleButton>
          <ToggleButton value="multi">Multi Speaker</ToggleButton>
        </ToggleButtonGroup>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Voice Configuration
        </Typography>
        {mode === "single" ? (
          <FormControl fullWidth disabled={isLoading}>
            <InputLabel>Voice</InputLabel>
            <Select
              value={voiceConfigs[0].voice}
              label="Voice"
              onChange={(e) =>
                handleVoiceConfigChange(0, "voice", e.target.value)
              }
            >
              {availableVoices.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box>
            {voiceConfigs.map((config, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Speaker Name"
                    value={config.speakerName}
                    onChange={(e) =>
                      handleVoiceConfigChange(
                        index,
                        "speakerName",
                        e.target.value
                      )
                    }
                    fullWidth
                    disabled={isLoading}
                  />
                </Grid>
                <Grid item xs={5}>
                  <FormControl fullWidth disabled={isLoading}>
                    <InputLabel>Voice</InputLabel>
                    <Select
                      value={config.voice}
                      label="Voice"
                      onChange={(e) =>
                        handleVoiceConfigChange(index, "voice", e.target.value)
                      }
                    >
                      {availableVoices.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removeSpeaker(index)}
                    disabled={isLoading || voiceConfigs.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button onClick={addSpeaker} disabled={isLoading}>
              Add Speaker
            </Button>
          </Box>
        )}
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Text to Convert
        </Typography>
        <TextField
          multiline
          rows={6}
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            mode === "single"
              ? "Enter text..."
              : "Speaker1: Hello!\nSpeaker2: Hi there!"
          }
          disabled={isLoading}
        />
      </Card>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleGenerateSpeech}
        disabled={isLoading || !text}
        startIcon={isLoading && <CircularProgress size={24} color="inherit" />}
      >
        {isLoading ? `Generating... (${jobStatus})` : "Generate Speech"}
      </Button>

      {jobStatus === "completed" && audioUrl && (
        <Card sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generated Audio
          </Typography>
          <Paper elevation={2} sx={{ p: 2 }}>
            <audio controls src={audioUrl} style={{ width: "100%" }}>
              Your browser does not support the audio element.
            </audio>
            <Button
              href={audioUrl}
              download="generated_speech.wav"
              sx={{ mt: 2 }}
            >
              Download
            </Button>
          </Paper>
        </Card>
      )}

      {jobStatus === "failed" && (
        <Card
          sx={{ p: 3, mt: 3, backgroundColor: "error.dark", color: "white" }}
        >
          <Typography variant="h6" gutterBottom>
            Error
          </Typography>
          <Typography>{error}</Typography>
        </Card>
      )}
    </Container>
  );
}

export default App;
