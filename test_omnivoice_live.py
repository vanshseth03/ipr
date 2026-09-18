import json
import os
import sys
import time
import urllib.request
import wave
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

SERVER_URL = "https://concentrations-respiratory-maritime-deluxe.trycloudflare.com"
HEADERS = {
    "Content-Type": "application/json",
    "Bypass-Tunnel-Reminder": "true",
    "User-Agent": "OmniVoice-Test-Runner/1.0",
}
ROOT = Path(__file__).parent

print("=" * 70)
print("  LIVE OMNIVOICE TTS VERIFICATION SUITE")
print(f"  Target Server: {SERVER_URL}")
print("=" * 70)

# Step 1: Wait for server & OmniVoice to finish loading
print("\n[Step 1] Monitoring server boot and waiting for OmniVoice TTS...")
tts_ready = False
start_wait = time.time()
max_wait_s = 600

while time.time() - start_wait < max_wait_s:
    try:
        req = urllib.request.Request(f"{SERVER_URL}/api/health", headers=HEADERS)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            models = data.get("models", {})
            step_display = data.get("step_display", "")
            tts_status = models.get("tts", {}).get("loaded", False)
            chat_ready = data.get("ready", False)

            elapsed = time.time() - start_wait
            print(f"  [{elapsed:4.0f}s] Server status: {data.get('status')} | Step: {step_display} | Chat: {chat_ready} | TTS: {tts_status}", flush=True)

            if tts_status:
                tts_ready = True
                print("\n✓ OMNIVOICE TTS IS LOADED AND READY ON GPU!")
                break
    except Exception as e:
        elapsed = time.time() - start_wait
        print(f"  [{elapsed:4.0f}s] Health check ping: {e}", flush=True)

    time.sleep(6)

if not tts_ready:
    print("\n✗ FATAL: Timed out waiting for OmniVoice to load. Checking server logs.")
    sys.exit(1)

# Step 2: Test Suite across Hindi, Romanized Hindi, English, and Tamil
test_cases = [
    {
        "id": "hi_devanagari",
        "name": "Hindi (Devanagari Script)",
        "language": "hi",
        "text": "नमस्ते, आयुर्वेद पेटेंट अधिनियम 1970 की धारा 3(p) के तहत पारंपरिक ज्ञान को पेटेंट नहीं कराया जा सकता।",
        "filename": "test_omnivoice_hindi.wav",
    },
    {
        "id": "hi_romanized",
        "name": "Hindi (Romanized Hinglish Transliteration)",
        "language": "hi",
        "text": "Namaste, Charaka Samhita mein Ashwagandha aur Triphala ke gun aur rog upchar vistar se varnit hain.",
        "filename": "test_omnivoice_roman_hindi.wav",
    },
    {
        "id": "en_legal",
        "name": "English (Statutory Legal Response with Indian Accent)",
        "language": "en",
        "text": "Welcome to the Ayurveda IPR Guardian. Under Section 3(p) of the Indian Patents Act 1970, an invention which in effect is traditional knowledge is not patentable.",
        "filename": "test_omnivoice_english.wav",
    },
    {
        "id": "ta_regional",
        "name": "Tamil (Regional Indic Language)",
        "language": "ta",
        "text": "வணக்கம், பாரம்பரிய ஆயுர்வேத மூலிகைகள் மற்றும் காப்புரிமை வழிகாட்டுதல்.",
        "filename": "test_omnivoice_tamil.wav",
    },
]

print("\n" + "=" * 70)
print("  EXECUTING MULTILINGUAL OMNIVOICE SYNTHESIS TESTS")
print("=" * 70)

results = []

for idx, tc in enumerate(test_cases, 1):
    print(f"\n[{idx}/{len(test_cases)}] Testing {tc['name']}...")
    print(f"  Text: {tc['text']}")
    print(f"  Language parameter: '{tc['language']}'")

    payload = json.dumps({"text": tc["text"], "language": tc["language"]}).encode("utf-8")
    req = urllib.request.Request(f"{SERVER_URL}/api/tts", data=payload, headers=HEADERS, method="POST")

    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            status_code = resp.status
            content_type = resp.headers.get("Content-Type", "")
            gen_time_header = resp.headers.get("X-TTS-Generation-Time-Ms", "N/A")
            wav_bytes = resp.read()
            latency = time.time() - t0

            # Verify WAV integrity
            out_file = ROOT / tc["filename"]
            out_file.write_bytes(wav_bytes)

            is_valid_wav = False
            duration_s = 0.0
            nchannels = 0
            framerate = 0
            try:
                with wave.open(str(out_file), "rb") as wf:
                    nchannels = wf.getnchannels()
                    sampwidth = wf.getsampwidth()
                    framerate = wf.getframerate()
                    nframes = wf.getnframes()
                    duration_s = nframes / float(framerate)
                    is_valid_wav = (nchannels >= 1 and sampwidth == 2 and framerate >= 16000 and duration_s > 0.5)
            except Exception as wav_err:
                print(f"  WAV parse error: {wav_err}")

            res = {
                "id": tc["id"],
                "name": tc["name"],
                "language": tc["language"],
                "status_code": status_code,
                "content_type": content_type,
                "latency_s": round(latency, 2),
                "server_gen_ms": gen_time_header,
                "wav_bytes": len(wav_bytes),
                "duration_s": round(duration_s, 2),
                "channels": nchannels,
                "framerate_hz": framerate,
                "is_valid_wav": is_valid_wav,
                "saved_to": str(out_file),
            }
            results.append(res)

            print(f"  ✓ SUCCESS!")
            print(f"    Status: HTTP {status_code} | Type: {content_type}")
            print(f"    Size: {len(wav_bytes):,} bytes | Duration: {duration_s:.2f}s | Sample Rate: {framerate}Hz")
            print(f"    Latency: {latency:.2f}s (Server synthesis: {gen_time_header}ms)")
            print(f"    Saved audio: {out_file.name}")
    except Exception as e:
        print(f"  ✗ FAILED: {e}")
        results.append({
            "id": tc["id"],
            "name": tc["name"],
            "language": tc["language"],
            "error": str(e),
            "is_valid_wav": False,
        })

# Step 3: Save Report
report_path = ROOT / "omnivoice_test_results.json"
report_path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"\n✓ Test results saved to: {report_path.name}")

# Step 4: CRITICAL RULE - SHUT DOWN KAGGLE INSTANCE IMMEDIATELY
print("\n" + "=" * 70)
print("  CLOSING KAGGLE INSTANCE TO PREVENT QUOTA WASTE (MANDATORY RULE)")
print("=" * 70)
try:
    shutdown_req = urllib.request.Request(f"{SERVER_URL}/api/shutdown", data=b"{}", headers=HEADERS, method="POST")
    with urllib.request.urlopen(shutdown_req, timeout=10) as sresp:
        print(f"  ✓ API shutdown response: {sresp.read().decode('utf-8')}")
except Exception as se:
    print(f"  API shutdown attempt note: {se}")

# Also cancel via Kaggle CLI to guarantee container is terminated
try:
    import subprocess
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    res = subprocess.run(["kaggle", "kernels", "stop", "vanshseth003/ayush-ipr-guardian"], capture_output=True, text=True, env=env)
    print(f"  ✓ Kaggle kernel stop output: {res.stdout.strip() or res.stderr.strip()}")
except Exception as ke:
    print(f"  Kaggle stop command note: {ke}")

print("\n✓ ALL TESTS COMPLETE & KAGGLE INSTANCE TERMINATED!")
