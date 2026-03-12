import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
AGENT_FOLDER = "c:/Projects/Sunny/high-converting-ugc-narrative-script-engineer-saas"
PROMPT_FILE = os.path.join(AGENT_FOLDER, "agent_prompt.md")

def register():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # 1. Read Prompt
    with open(PROMPT_FILE, "r") as f:
        prompt_text = f.read()
    
    agent_slug = "ugc-script-engineer"
    agent_name = "High-Converting UGC Narrative Script Engineer"
    version_label = "v1.2.0"
    
    print(f"Registering Agent: {agent_slug}...")
    
    # 2. Insert/Get Agent
    # Upsert agent
    res = supabase.table("agents").upsert({
        "slug": agent_slug,
        "name": agent_name,
        "description": "Viral short-form video scripting for any product URL."
    }, on_conflict="slug").execute()
    
    agent_id = res.data[0]["id"]
    print(f"Agent ID: {agent_id}")
    
    # 3. Insert Prompt Version
    # Set all other versions to inactive
    supabase.table("prompt_versions").update({"active": False}).eq("agent_id", agent_id).execute()
    
    res_v = supabase.table("prompt_versions").insert({
        "agent_id": agent_id,
        "prompt_text": prompt_text,
        "version_label": version_label,
        "active": True
    }).execute()
    
    print(f"Successfully registered {version_label} as Active.")

if __name__ == "__main__":
    register()
