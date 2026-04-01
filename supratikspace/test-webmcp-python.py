import http.client
import json
import urllib.request
import time
import sys

# Force UTF-8 for Windows console
sys.stdout.reconfigure(encoding='utf-8')

print("Starting WebMCP Static Discovery Verification Test (Python)...")

base_url = "http://localhost:8000"

def check_url(url, expected_status=200):
    print(f"Checking {url}...")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            if response.status == expected_status:
                print(f"Success: {url} returned {response.status}")
                return response.read()
            else:
                print(f"Failed: {url} returned {response.status}")
                return None
    except Exception as e:
        print(f"Failed: {url} error - {e}")
        return None

time.sleep(1)

html_bytes = check_url(f"{base_url}/index.html")
if html_bytes:
    html_text = html_bytes.decode('utf-8')
    if '<meta name="webmcp"' in html_text and '/.well-known/webmcp.json' in html_text:
        print("Success: Discovery meta tags found in index.html.")
    else:
        print("Error: WebMCP discovery meta tag is missing from index.html.")
        sys.exit(1)
else:
    print("Error: Could not read index.html")
    sys.exit(1)

manifest_bytes = check_url(f"{base_url}/.well-known/webmcp.json")
if manifest_bytes:
    try:
        manifest = json.loads(manifest_bytes.decode('utf-8'))
        tools = manifest.get('tools', [])
        if len(tools) == 14:
            print(f"Success: Discovery manifest is accessible and contains {len(tools)} tools.")
        else:
            print(f"Error: Manifest exists but contains {len(tools)} tools instead of 14.")
            sys.exit(1)
    except json.JSONDecodeError:
        print("Error: Manifest is not valid JSON.")
        sys.exit(1)
else:
    print("Error: Could not read discovery manifest.")
    sys.exit(1)

print("\nSTATIC DISCOVERY VERIFICATION COMPLETED (Production Build)")
