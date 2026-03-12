import os
import json
from typing import Optional
from fastapi import FastAPI, Header, HTTPException, Request
from pydantic import BaseModel
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="High-Converting UGC Narrative Script Engineer SaaS")

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

class GenerateRequest(BaseModel):
    product_url_summary: str

class UserKeyResponse(BaseModel):
    api_key: Optional[str]

async def get_user_byok(user_id: str) -> Optional[str]:
    # In a real app, you'd use pgsodium decryption here. 
    # For this scaffold, we fetch from a 'user_api_keys' table.
    res = supabase.table("user_api_keys").select("encrypted_key").eq("user_id", user_id).execute()
    if res.data:
        # Mocking decryption for scaffold
        return "sk-user-decrypted-key" 
    return None

async def check_usage_limits(user_id: str) -> bool:
    # Check if user has < 3 runs
    res = supabase.table("runs").select("id", count="exact").eq("user_id", user_id).execute()
    return (res.count or 0) < 3

@app.get("/manifest")
async def get_manifest():
    return {
        "id": "ugc-script-engineer",
        "name": "High-Converting UGC Narrative Script Engineer",
        "description": "Converts product webpage summaries into viral 60s UGC scripts.",
        "pricing": "3 Runs Free -> BYOK",
        "endpoints": {"generate": "/generate"}
    }

@app.post("/generate")
async def generate_script(
    req: GenerateRequest,
    x_user_id: str = Header(...)
):
    # 1. Check BYOK
    user_key = await get_user_byok(x_user_id)
    
    # 2. Check Limits if no BYOK
    if not user_key:
        can_run = await check_usage_limits(x_user_id)
        if not can_run:
            raise HTTPException(status_code=402, detail="Limit reached. Provide your own OpenAI Key.")
        api_key = os.getenv("SYSTEM_OPENAI_API_KEY")
    else:
        api_key = user_key

    # 3. Get Prompt Version
    # We'll hardcode the prompt for the demo, but in production this pulls from 'prompt_versions'
    with open("agent_prompt.md", "r") as f:
        system_prompt = f.read()

    # 4. Execute LLM
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": req.product_url_summary}
        ]
    )
    result = response.choices[0].message.content

    # 5. Log Run & (Self-Eval Mock)
    supabase.table("runs").insert({
        "user_id": x_user_id,
        "input_payload": {"url_summary": req.product_url_summary},
        "output_payload": {"script": result}
    }).execute()

    return {"script": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
