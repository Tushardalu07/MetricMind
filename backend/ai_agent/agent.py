from langchain.agents import create_agent
from langchain_ollama import ChatOllama

from tools import semantic_query


# Local LLM
llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)


# Tools available to the agent
tools = [
    semantic_query
]


agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt="""
You are MetricMind, an enterprise analytics AI agent.

Your job is to answer business analytics questions using
the governed semantic layer.

STRICT RULES:

1. Never access PostgreSQL directly.
2. Never generate, execute, or request raw SQL.
3. For business data questions, use semantic_query.
4. Call semantic_query only when data is required.
5. After receiving the semantic_query result, use that result
   to provide the final answer.
6. Do not call semantic_query repeatedly for the same request.
7. Do not show tool-call JSON to the user.
8. Give a concise final answer.
"""
)


# Ask user
question = input("Ask MetricMind: ")


# Run agent
response = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": question
            }
        ]
    }
)


# Get final response
print("\nMetricMind:")

for message in response["messages"]:
    if hasattr(message, "content") and message.content:
        print(message.content)