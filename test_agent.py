import os
import json
import requests
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Config
AGENT_FOLDER = "c:/Projects/Sunny/high-converting-ugc-narrative-script-engineer-saas"
PROMPT_FILE = os.path.join(AGENT_FOLDER, "agent_prompt.md")
EVAL_CRITERIA = """
1. Pattern-Interrupt Hook (0-10): Starts immediately with a hook?
2. Visual Pacing (0-10): Visual cues every 4s?
3. Looping (0-10): Does end flow to start?
4. Authenticity (0-10): Scripted breaths/filler?
"""

def evaluate_output(output: str, prompt: str) -> float:
    print("--- Evaluating Agent Output ---")
    client = OpenAI() # Uses OPENAI_API_KEY from .env
    eval_prompt = f"""
    You are a Strategic Content Analyst. Rate the following UGC Script based on the criteria.
    Provide a score out of 10.
    
    CRITERIA:
    {EVAL_CRITERIA}
    
    SYSTEM PROMPT USED:
    {prompt}
    
    AGENT OUTPUT:
    {output}
    
    Return ONLY a JSON with "score" (average out of 10) and "feedback".
    """
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": eval_prompt}],
        response_format={ "type": "json_object" }
    )
    res = json.loads(response.choices[0].message.content)
    return res["score"], res["feedback"]

def run_trial():
    # 1. Setup
    with open(PROMPT_FILE, "r") as f:
        prompt_text = f.read()
    
    mock_input = "Website for a new AI tool called 'SlaySub' that automatically generates viral subtitles for long-form podcasts to turn them into TikToks."
    
    # 2. Execute
    client = OpenAI()
    print(f"Running Trial for: {mock_input}")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": prompt_text},
            {"role": "user", "content": mock_input}
        ]
    )
    result = response.choices[0].message.content
    
    # 3. Eval
    score, feedback = evaluate_output(result, prompt_text)
    print(f"Trial Score: {score}/10")
    print(f"Feedback: {feedback}")
    
    return score, feedback, result

def main():
    score, feedback, result = run_trial()
    
    if score >= 9.2:
        print("SCORING CRITERIA MET. PROCEEDING TO DEPLOY.")
        # Here we would run supabase logic and railway logic
    else:
        print("SCORING CRITERIA NOT MET. ATTEMPTING VERSION 1.1 REWRITE...")
        # Logic to rewrite prompt and retry once.
        
if __name__ == "__main__":
    main()
