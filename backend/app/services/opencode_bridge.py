import subprocess
import json
import os
import shutil
import re


def get_opencode_path() -> str:
    """Find opencode binary in PATH or known locations."""
    path = shutil.which("opencode")
    if path:
        return path
    home = os.path.expanduser("~")
    candidates = [
        f"{home}/.opencode/bin/opencode",
        f"{home}/.local/bin/opencode",
        "/usr/local/bin/opencode",
        "/opt/homebrew/bin/opencode",
    ]
    for c in candidates:
        if os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    raise FileNotFoundError(
        "opencode not found. Install it from https://opencode.ai"
    )


def is_available() -> bool:
    try:
        get_opencode_path()
        return True
    except FileNotFoundError:
        return False


def call_opencode(prompt: str, system_prompt: str = "", max_tokens: int = 4096) -> str:
    """
    Call opencode CLI with a prompt and return the text response.
    Uses opencode run with --format json to get structured output.
    """
    opencode_path = get_opencode_path()
    
    full_message = f"{system_prompt}\n\n---\n\n{prompt}" if system_prompt else prompt
    
    try:
        result = subprocess.run(
            [opencode_path, "run", full_message, "--format", "json"],
            capture_output=True,
            text=True,
            timeout=300,
        )
        
        output = result.stdout or result.stderr
        if not output:
            return "No response from opencode."
        
        # Parse JSON lines and extract text
        texts = []
        for line in output.strip().split("\n"):
            if not line.strip():
                continue
            try:
                event = json.loads(line)
                if event.get("type") == "text":
                    part = event.get("part", {})
                    text = part.get("text", "")
                    if text:
                        texts.append(text)
            except json.JSONDecodeError:
                continue
        
        response = " ".join(texts).strip()
        if response:
            return response
        
        # Fallback: return raw output if no text events found
        return output[:5000]
        
    except subprocess.TimeoutExpired:
        return "Error: opencode timed out after 300 seconds."
    except FileNotFoundError:
        return "Error: opencode not found."
    except Exception as e:
        return f"Error calling opencode: {e}"


def call_opencode_json(prompt: str, system_prompt: str = "") -> dict:
    """
    Call opencode and parse the response as JSON.
    Falls back gracefully if parsing fails.
    """
    result = call_opencode(prompt, system_prompt)
    
    # Try to extract JSON from the response
    try:
        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except (json.JSONDecodeError, AttributeError):
        pass
    
    return {"error": "Failed to parse JSON", "raw": result[:500]}
