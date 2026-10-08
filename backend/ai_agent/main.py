from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)

response = llm.invoke(
    "Explain what a semantic layer is in one simple sentence."
)

print(response.content)