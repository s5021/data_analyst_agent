from openai import AsyncAzureOpenAI
import os, json

client = AsyncAzureOpenAI(
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-01"
)

DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

async def ask_ai_analyst(question: str, data_summary: dict) -> str:
    system_prompt = """You are an expert data analyst. 
    You receive a dataset summary and answer business questions about it. 
    Be concise, insightful, and highlight risks or trends when relevant."""

    user_message = f"""
Dataset summary:
{json.dumps(data_summary, indent=2, default=str)}

Question: {question}
"""
    response = await client.chat.completions.create(
        model=DEPLOYMENT,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        max_tokens=1000
    )
    return response.choices[0].message.content