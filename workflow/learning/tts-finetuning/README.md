# Qwen3-TTS — Complete Guide for Myanmar Voice

> Based on the official Qwen3-TTS blog (2026-01-21): https://qwen.ai/blog?id=qwen3tts-0115  
> GitHub: https://github.com/QwenLM/Qwen3-TTS

---

## What is Qwen3-TTS?

**Qwen3-TTS is a TTS (Text-to-Speech) model**, not a text-only LLM.  
Built by Alibaba's Qwen team. Open-sourced Jan 2026.

Core capabilities:
- **Voice Clone** — clone any voice from a **3-second audio clip** (zero-shot, no training)
- **Voice Design** — describe a voice in natural language → model generates it
- **Instruction Control** — control emotion, speed, pitch, age in natural language
- **Streaming** — first audio packet after a single character, 97ms latency
- **Fine-tuning** — train the Base model with your own audio → persistent custom voice

---

## Model Family

### 1.7B Models (best quality)

| Model | Purpose | Streaming | Instruction |
|---|---|---|---|
| `Qwen3-TTS-12Hz-1.7B-Base` | Voice clone (3s clip) + **fine-tuning base** | ✅ | — |
| `Qwen3-TTS-12Hz-1.7B-CustomVoice` | 9 built-in timbres + style control | ✅ | ✅ |
| `Qwen3-TTS-12Hz-1.7B-VoiceDesign` | Voice from text description | ✅ | ✅ |

### 0.6B Models (faster, smaller)

| Model | Purpose | Streaming | Instruction |
|---|---|---|---|
| `Qwen3-TTS-12Hz-0.6B-Base` | Voice clone + fine-tuning base | ✅ | — |
| `Qwen3-TTS-12Hz-0.6B-CustomVoice` | 9 built-in timbres | ✅ | — |

**For Myanmar project → use `1.7B-Base` for fine-tuning.**

---

## Architecture (technical)

- **Qwen3-TTS-Tokenizer-12Hz** — self-developed multi-codebook speech encoder at 12Hz. Compresses audio efficiently while preserving paralinguistic info (emotion, accent, prosody, background).
- **Discrete multi-codebook LM** — end-to-end architecture, bypasses traditional LM+DiT bottlenecks and cascading errors.
- **Dual-Track hybrid streaming** — single model handles both streaming and non-streaming. Latency: 97ms end-to-end.

---

## Supported Languages (built-in)

Chinese · English · Japanese · Korean · German · French · Russian · Portuguese · Spanish · Italian + dialects (Beijing, Sichuan, etc.)

> **Burmese is NOT in the built-in list.** To use Myanmar language, you must fine-tune the Base model with your own Burmese audio data.

---

## Built-in Timbres (9 voices, CustomVoice model)

| Timbre | Language |
|---|---|
| 苏瑶 Serena | Chinese female |
| 福伯 Uncle Fu | Chinese male (older) |
| 十三 Vivian | Chinese female |
| 艾登 Aiden | English male |
| 甜茶 Ryan | English male |
| 小野杏 Ono Anna | Japanese female |
| 素熙 Sohee | Korean female |
| 晓东 Dylan | Chinese (Beijing dialect) |
| 程川 Eric | Chinese (Sichuan dialect) |

After fine-tuning with Myanmar audio, you add your own timbre to this list.

---

## Two Paths for Myanmar Voice

### Path A — Voice Cloning (no training needed)

Use the Base model with a **3-second reference clip** from your voice actor.  
No training. Works out of the box. Best for quick deployment.

```python
from transformers import AutoModel, AutoTokenizer
import torch, soundfile as sf

model = AutoModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base", trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen3-TTS-12Hz-1.7B-Base")

# ref_audio: 3+ seconds of clean Burmese voice actor WAV
output = model.synthesize(
    text="မင်္ဂလာပါ ဒီနေ့ Open Myanmar Labs မှ ကြိုဆိုပါတယ်",
    ref_audio="path/to/voice_actor_sample.wav",
    ref_text="မင်္ဂလာပါ",   # transcript of the reference clip
)
sf.write("output.wav", output, samplerate=24000)
```

**Pros:** zero setup, instant voice matching  
**Cons:** Burmese language phonetics not baked in — may struggle with tones/graphemes

---

### Path B — Fine-tuning (recommended for production)

Fine-tune `1.7B-Base` with Myanmar audio → creates a permanent Myanmar CustomVoice.  
Teaches the model Burmese phonetics + locks in the voice actor's timbre.

---

## Path B: Fine-tuning Step by Step

### Step 1 — How much audio do you need?

| Goal | Audio needed | Notes |
|---|---|---|
| Quick test | **30 min – 1 hr** | Enough to validate the approach |
| Shipable v1 | **5 – 10 hrs** | Covers common phonemes + sentence types |
| Production | **20 – 50 hrs** | All tones, edge cases, varied prosody |

Burmese has 4 tones (creaky, low, high, stopped) and 33 consonants × 12 vowel symbols.  
Every tone combination must appear in your training data or the model will guess wrong.

**Practical starting point: record 5 hours.**

---

### Step 2 — What to record (brief for voice actor)

```
Format: WAV, 44100 Hz, 16-bit PCM, mono
Room:   quiet, SNR > 40 dB, no echo, no AC hum
Mic:    condenser, ~20 cm constant distance
Level:  peak ≤ -3 dBFS, no clipping
Clip length: 3–15 seconds each (ideal 5–10s)
Silence: 0.3s before and after each sentence

What to record:
1. Phoneme matrix — all consonant × vowel × tone combos (~500 clips)
2. Common sentences — top 2000 Burmese words used in context
3. Question/negative/exclamation forms
4. Number reading — 0–999, dates, prices (kyat)
5. English loanwords in Burmese script
6. Long sentences (2–3 clauses)

Rules:
- One take per clip. Stop and restart instead of correcting mid-sentence.
- Same mic, room, and distance every session.
- No food or coffee before recording (mouth noise).
- Label every clip: session_001/clip_0001.wav
```

---

### Step 3 — Prepare dataset

```
data/
  wavs/
    clip_0001.wav
    clip_0002.wav
    ...
  metadata.csv       # pipe-separated: filename|transcript
```

`metadata.csv`:
```
clip_0001|မင်္ဂလာပါ ဒီနေ့ ရာသီဥတု ကောင်းပါသည်
clip_0002|ဈေးသွားမလားဟင်
clip_0003|Open Myanmar Labs မှ ကြိုဆိုပါတယ်
```

Validate before training:
```python
import soundfile as sf, pandas as pd, os

df = pd.read_csv("data/metadata.csv", sep="|", header=None, names=["file","text"])
for _, row in df.iterrows():
    path = f"data/wavs/{row.file}.wav"
    assert os.path.exists(path), f"missing: {path}"
    info = sf.info(path)
    assert info.samplerate == 44100, f"wrong rate: {path}"
    assert info.channels == 1, f"not mono: {path}"
print(f"OK — {len(df)} clips")
```

---

### Step 4 — Set up environment

```bash
git clone https://github.com/QwenLM/Qwen3-TTS.git
cd Qwen3-TTS

# Python 3.10+
conda create -n qwen3tts python=3.10
conda activate qwen3tts
pip install -r requirements.txt

# Download base model
python -c "
from huggingface_hub import snapshot_download
snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-Base', local_dir='models/qwen3-tts-base')
"
```

---

### Step 5 — Fine-tune

The fine-tuning process trains the model to:
1. Recognize Burmese phonemes and tones
2. Permanently associate the voice actor's timbre

```bash
# Convert metadata to the format Qwen3-TTS expects
python tools/prepare_data.py \
  --metadata   data/metadata.csv \
  --wavs_dir   data/wavs \
  --output     data/train.jsonl \
  --speaker    "myanmar-v1"

# Fine-tune (single GPU: A100 80G recommended)
python finetune.py \
  --model_dir  models/qwen3-tts-base \
  --train_data data/train.jsonl \
  --output_dir checkpoints/myanmar-v1 \
  --speaker    "myanmar-v1" \
  --batch_size 8 \
  --epochs     200 \
  --lr         1e-4 \
  --freeze_encoder true     # freeze tokenizer, train voice head only
```

Key config options:
```yaml
batch_size:      8           # reduce to 4 if OOM
learning_rate:   1e-4
num_epochs:      200         # increase to 500 for more data
freeze_encoder:  true        # always true for voice FT, saves VRAM
fp16:            true
save_every:      50          # checkpoint every N epochs
eval_every:      25
```

---

### Step 6 — Evaluate checkpoints

Listen to intermediate checkpoints to judge quality progress:

```python
from qwen3tts import Qwen3TTS

model = Qwen3TTS("checkpoints/myanmar-v1/epoch_200")

test_texts = [
    "မင်္ဂလာပါ",
    "ဒီနေ့ ရာသီဥတု ကောင်းပါသည်",
    "ကျွန်တော် Open Myanmar Labs မှ ကြိုဆိုပါတယ်",
    "ဈေးနှုန်း ငါးထောင်ကျပ် ဖြစ်ပါသည်",   # price reading
]

import soundfile as sf
for i, text in enumerate(test_texts):
    audio = model.synthesize(text=text, speaker="myanmar-v1")
    sf.write(f"eval_{i}.wav", audio, samplerate=24000)
    print(f"eval_{i}.wav — {text}")
```

Listen for: correct tones, no mispronunciations, natural prosody.

---

### Step 7 — Instruction control (after fine-tuning)

Once fine-tuned, you can control voice style with natural language:

```python
# Slow and formal
audio = model.synthesize(
    text="မင်္ဂလာပါ",
    speaker="myanmar-v1",
    instruction="ဖြည်းဖြည်းချင်းနှင့် တရားဝင်ဖြစ်သောအသံဖြင့် ပြောပါ"  # Burmese instruction
    # or in English: "Speak slowly and formally"
)

# Energetic and happy
audio = model.synthesize(
    text="မင်္ဂလာပါ",
    speaker="myanmar-v1",
    instruction="Speak with an energetic, happy tone"
)
```

---

### Step 8 — Export for the app

```bash
# Copy checkpoint to resources
cp -r checkpoints/myanmar-v1/final \
  apps/open-myanmar-speech/resources/qwen3-tts/model/

# The worker.py loads locally — no HF download at runtime
```

Wire into the existing engine architecture via a new `qwen3-tts-engine.ts` implementing `TtsEngine` at `src/bun/tts/engine.ts`.

---

## Cloud GPU Guide

### Recommended: RunPod A100 80G

| Provider | GPU | $/hr | Use for |
|---|---|---|---|
| **RunPod** | A100 80G | ~$1.20 | 1.7B fine-tune (fits 1 GPU) |
| **RunPod** | H100 SXM | ~$2.50 | Faster, larger batch |
| **Lambda Labs** | A100 80G | ~$1.50 | Stable, less setup |
| **Vast.ai** | A100 40G | ~$0.70 | Cheapest — check host uptime |

### Estimated cost

| Audio | Epochs | GPU | Time | Cost |
|---|---|---|---|---|
| 1 hr (test) | 200 | 1× A100 80G | ~4 hr | ~$5 |
| 5 hrs | 200 | 1× A100 80G | ~15 hr | ~$18 |
| 20 hrs | 500 | 1× A100 80G | ~60 hr | ~$72 |
| 50 hrs | 500 | 4× A100 80G | ~40 hr | ~$190 |

### RunPod workflow

```bash
# 1. Create pod: A100 80G, PyTorch 2.2 template, 200GB disk
# 2. Upload data (use tmux to survive disconnect)
tmux new -s upload
rsync -avz --progress data/ root@<pod>:/workspace/data/

# 3. Fine-tune inside tmux
tmux new -s train
python finetune.py --config myanmar_v1.yaml

# 4. Download checkpoint when done
rsync -avz root@<pod>:/workspace/checkpoints/ ./checkpoints/
```

---

## Burmese-specific notes

**Challenge:** Qwen3-TTS was not trained on Burmese data. The tokenizer handles script intelligently but tone modeling is learned from data.

**What you get with fine-tuning:**
- Correct Burmese tone production (creaky, low, high, stopped)
- Voice actor's timbre locked in
- Instruction control in Burmese (`"ဖြည်းဖြည်းပြောပါ"` = "speak slowly")
- Cross-lingual: same voice can speak English/Chinese too (inherited from base)

**What you don't get:**
- Magic phoneme coverage from zero data — you must record all tones
- Perfect output from 30 min of audio — budget at least 5 hrs for v1

---

## Free Open-Source Burmese Audio Datasets

Don't start from zero — use existing datasets to bootstrap Burmese language knowledge before adding your voice actor's recordings.

### Best for TTS fine-tuning

| Dataset | Size | Voice | License | Link |
|---|---|---|---|---|
| **OpenSLR 80** | ~1.2 GB, quality-checked | Female, single speaker | CC-BY-SA 4.0 | [openslr.org/80](https://www.openslr.org/80/) · [HuggingFace](https://huggingface.co/datasets/chuuhtetnaing/myanmar-speech-dataset-openslr-80) |
| **hpbyte/myanmar-tts** | 5,000+ pairs | Single speaker | See repo | [github.com/hpbyte/myanmar-tts](https://github.com/hpbyte/myanmar-tts) |

### Supplemental (multi-speaker / ASR quality)

| Dataset | Size | Notes | Link |
|---|---|---|---|
| **VOA Myanmar ASR** | ~3,267 hrs | Broadcast radio, many speakers, good for phoneme coverage | [HuggingFace](https://huggingface.co/datasets/freococo/voa_myanmar_asr_audio_1) |
| **212-Hours Burmese** | 212 hrs | Spontaneous speech, annotated | [GitHub](https://github.com/Nexdata-AI/212-Hours-Burmese-Spontaneous-Speech-Data) |
| **Myanmar Dataset Collection** | Mixed | Aggregates BloomSpeech + others | [GitHub](https://github.com/chuuhtetnaing/myanmar-language-dataset-collection) |

### Two-stage fine-tuning strategy (reduces voice actor cost)

```
Stage 1 — Language pre-training
  Data:  OpenSLR 80 + hpbyte/myanmar-tts (free, existing)
  Goal:  Teach Qwen3-TTS Burmese phonetics and all 4 tones
  Time:  ~100 epochs, ~$10 on RunPod

Stage 2 — Voice identity fine-tuning
  Data:  Your voice actor's recordings (2–3 hrs now sufficient)
  Goal:  Lock in the specific timbre on top of Burmese knowledge
  Time:  ~200 epochs, ~$10 on RunPod
```

Without Stage 1, you need 5–10 hrs from the voice actor.  
With Stage 1, **2–3 hrs** of voice actor recording is enough for v1.

---

## Summary — recommended action plan

| Step | What | Cost |
|---|---|---|
| 1 | Record 5 hrs with voice actor (phoneme matrix + sentences) | ~$300–500 recording fee |
| 2 | Validate audio (SNR check, mono, 44100 Hz) | free |
| 3 | Spin up RunPod A100, run 200-epoch fine-tune | ~$18 |
| 4 | Listen to eval WAVs — judge quality | free |
| 5 | If good → wire into app as new engine | dev time |
| 6 | If not good → record more data, increase epochs | more recording |

**Fastest path to test the approach:** record 1 hour, run 200 epochs, evaluate → $5 cloud cost.
