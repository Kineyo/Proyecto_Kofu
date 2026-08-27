from markitdown import MarkItDown
import os
from openai import OpenAI

def test():
    client = OpenAI(
        base_url='http://localhost:11434/v1',
        api_key='ollama'
    )
    md = MarkItDown(llm_client=client, llm_model='qwen2.5vl:3b')
    with open("dummy.txt", "w") as f:
        f.write("Hello World")
    print(md.convert("dummy.txt").text_content)
    os.remove("dummy.txt")

test()
