# Agent.js

Backend server for providing LLM Responses to the frontend AgentFlow UI.

We suggest copying the `.env.template` to a local `.env` file and using the link provided to generate a free Groq API key.

This way you can use AI agents completely free.


## Starting

Optimal way is to open the project in VSCode as a [Dev Container](https://code.visualstudio.com/docs/devcontainers/tutorial).

The boot process of the container will configure everything and start the server automatically.

You could also simply click the green button above and start CodeSpace which is an online DevContainer, but you will need to find and correct the Socket.io url in the frontend code, so it will connect to the right url.
