---
title: "I Ran Google's Gemma 4 Locally for Free: Here's What I Built and What I Learned"
description: "A Google Cloud Customer Engineer runs Gemma 4 E4B locally on Windows using Ollama and Python. Three working demos, zero API cost, and an honest account of what broke and why."
date: 2026-06-08
tags: [AI, open-source, Gemma, Ollama, Python, Google Cloud]
readingTime: 12
---

I built this because I wanted to understand open weight models from the inside out.

I work as a Customer Engineer at Google Cloud, essentially a Solutions Architect 
role where I help businesses adopt Google technology and implement it to solve 
problems at enterprise scale. A customer of mine recently deployed an Azure-based 
open weight model fine-tuned for a specific internal use case. That conversation 
stuck with me. I had just switched teams internally to focus on Google Cloud core 
infrastructure and AI, and I realized I needed to get up to speed — not just 
conceptually, but hands-on.

There is also a broader trend I keep seeing in enterprise conversations. 
Organizations are not moving away from large frontier models yet, but they are 
actively asking about the feasibility of doing so. The question I hear most is 
whether smaller, focused models can handle specific repeatable workloads at scale 
without the token costs of a frontier model. I think there is a real gap that needs 
to be filled here. The pattern I foresee is smaller models solving specific business 
problems at scale, with frontier models reserved for broad, complex reasoning where 
their full capability is actually needed. Open weight models like Gemma 4 are a 
meaningful part of that story.

What pushed me toward Gemma 4 specifically was a licensing conversation. That same 
customer had looked at Gemma 3 and hesitated. The custom license created enough 
legal uncertainty that their team passed on it. Gemma 4's Apache 2.0 license 
removed that blocker entirely. When I heard that, I wanted to understand exactly 
what we were working with.

So I built this on my personal Windows PC, a machine I put together about two years 
ago. I learned a lot along the way, including the hard way that AMD GPUs on Windows 
have real limitations with local AI inference. I will cover what broke and how I 
worked around it. You have to start somewhere, and this is where I started.

By the end of this post you will understand what an open weight model is, why Gemma 4 
is a meaningful step forward for enterprise adoption, and how to run three working 
Python demos on your own machine with zero ongoing cost. The GitHub repo is linked 
at the bottom. Clone it and run it yourself in about 15 minutes.

## What Gemma 4 Is and Why the License Matters More Than the Benchmarks

Admittedly, with how fast the AI race moves I did not have much time to 
process a new model release. I was still diving deep on the frontier labs 
and all the news surrounding them. But my interest in Gemma did not come 
from a benchmark score. It came from years of working with organizations 
that have stringent compliance requirements, government policies, and GRC 
frameworks at scale. For those organizations, a new model announcement 
means one thing before anything else: can we actually use this?

The reality is that specialized organizations and regulated industries 
cannot just pick up a frontier model and run with it. There is real 
hesitancy right now around AI adoption for good reason, and many 
organizations are actively building or evaluating their own models rather 
than depending on a third party. A solution like Gemma was bound to 
emerge. Google was not the first to offer an open weight model but this 
is their offering, and it carries weight because of who built it.

Gemma 4 is an open weight model. That means Google releases the actual 
model weights, the numerical parameters that encode everything the model 
learned during training, for anyone to download, run, and modify. You are 
not calling an API. You are not sending data to Google. You download the 
model, you host it wherever you want, whether that is your own on premise 
environment, another cloud provider, or your personal laptop, and you 
control everything from there. That includes fine tuning it on your own 
data. A manufacturing organization could take Gemma 4 and train it on 
their SOPs, their product specifications, their line of business 
requirements, and build an internal application that gives frontline 
workers a tool grounded in their actual enterprise knowledge. The 
possibilities open up significantly when the organization controls the 
model and the data it produces.

The Apache 2.0 license is what makes this practically usable for 
enterprise. A license is essentially the terms that tell an organization 
what they can and cannot do with the model. Gemma 3 had a custom 
restricted license that created enough legal ambiguity that enterprise 
legal teams, including one of my own customers, passed on it entirely. 
Apache 2.0 is one of the most well understood open source licenses in 
existence. It allows commercial use, modification, distribution, and 
places no restrictions on the outputs the model generates. Enterprise 
legal teams do not need a custom review to approve it. That is not a 
minor detail. For organizations that were sitting on the sideline waiting 
for a clear signal, Apache 2.0 was it. The benchmark improvements in 
Gemma 4 are real and meaningful, but the license is what actually unlocks 
adoption at scale.

## What Ollama Is and What Happened When I Set It Up

I had been stumbling across the word Ollama for a while. On LinkedIn, 
in AI newsletters, in passing conversations. People were using it to 
build things and I kept filing it away as something to look into. 
This project finally gave me the reason to actually dig in.

Ollama is a tool that hosts model weights locally on your machine. 
To understand why that matters you need to understand what model weights 
actually are. When a model like Gemma 4 is trained it runs through 
billions of matrix multiplications across massive datasets, and through 
that process it produces parameters. Those parameters are essentially 
numerical representations of patterns, relationships, and sequences 
learned from the training data. Gemma 4 E4B has 4 billion of them. 
They are what the model references every single time it predicts the 
next token in a response.

What most people do not realize is that these parameters are extremely 
storage and compute intensive. You cannot just load them onto any 
machine and expect things to work. Running inference on a model requires 
enough RAM to hold the weights in memory, enough compute to run the 
matrix multiplication operations that generate each token, and the right 
software to manage all of it. This is why there is such a massive push 
for optimized chips, GPU clusters, and data center capacity. At scale, 
running these models efficiently is a serious infrastructure problem.

Ollama solves the local version of that problem. It handles downloading 
the model weights, storing them on your machine in an optimized format 
called GGUF, loading them into memory, and serving them through a local 
REST API at localhost:11434. That API works exactly like a cloud API 
except the request never leaves your machine. You send a prompt in, 
you get a response back, and everything happens locally. Without Ollama 
you would need to manage the weights yourself, write your own inference 
server, handle memory management, and figure out GPU initialization 
from scratch. Ollama collapses all of that into one command.

The setup on Windows was straightforward until it was not. Installing 
Ollama and pulling Gemma 4 E4B worked fine. The first problem came when 
I tried to run the model from Git Bash and got a command not found error. 
Ollama had installed correctly but Git Bash was not looking in the right 
place for it. The fix was adding Ollama's install path to Git Bash's PATH 
variable, which took two commands and about two minutes once I understood 
what was happening.

The second problem was more interesting. My Windows PC has an AMD Radeon 
RX 6650 XT, a solid dedicated GPU with 8GB of VRAM. I expected Ollama to 
pick it up and use it. Instead every time I ran the model it just hung, 
blinking cursor, no output, no error message. After digging into the logs 
I found that Ollama was trying to initialize ROCm, AMD's GPU compute 
library, and the handshake was failing silently on Windows. It never fell 
back to CPU gracefully. It just sat there.

The workaround was forcing CPU mode entirely with one environment variable. 
Once I bypassed the GPU initialization the model still would not load 
through the interactive terminal in Git Bash due to a TTY compatibility 
issue. So I went directly to the REST API using a curl command, which is 
actually how the Python library talks to Ollama under the hood anyway. 
That worked immediately.

Gemma 4 E4B on CPU with 32GB RAM generates roughly 10 to 15 tokens per 
second on my machine. A short response takes a few seconds. A detailed 
one takes 30 to 60 seconds. For local development and personal use that 
is completely workable. For a production deployment serving real users 
you would want GPU support or a proper inference server on cloud 
infrastructure. But for understanding how the model works and building 
demos, it was more than enough.

## Demo 1: Basic Chat

The first demo is intentionally simple. Before writing any real 
application I wanted to confirm the model was working and get a feel 
for how it responded. Three questions, streamed responses, nothing fancy.

```python
import ollama

def chat(prompt):
    print(f"\nYou: {prompt}")
    print("Gemma 4: ", end="", flush=True)
    
    response = ollama.generate(
        model="gemma4:e4b",
        prompt=prompt,
        stream=True
    )
    
    for chunk in response:
        print(chunk["response"], end="", flush=True)
    
    print("\n")

chat("What is a large language model? Explain it in 3 sentences.")
chat("What is the difference between a CPU and a GPU for AI inference?")
chat("Why would a company want to run an AI model locally instead of using a cloud API?")
```

The stream=True parameter is worth understanding. Instead of waiting 
for the full response and getting it all at once, the model streams 
tokens back one at a time as they are generated. That is why you see 
text appearing word by word rather than all at once. Each chunk in the 
loop is one small piece of the response coming back in real time.

The three questions were not random. They are the questions anyone new 
to local AI would actually ask. What is an LLM. Why does the hardware 
matter. Why run it locally. Gemma 4 answered all three accurately and 
in detail. The CPU versus GPU response was particularly thorough, 
producing a full breakdown with tables comparing core count, design 
goals, and performance characteristics. On CPU only it took about 30 
seconds for that response. Slow compared to a cloud API but completely 
functional for development and learning.

## Demo 2: Document Summarization

The second demo moves from general questions to working with your own 
content. I fed the model a document about local AI models in 
manufacturing and asked for a structured response: a three sentence 
summary, the three most important takeaways as bullet points, and one 
question the document leaves unanswered.

```python
import ollama
import os

def summarize(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    word_count = len(content.split())
    print(f"\nDocument: {filepath}")
    print(f"Word count: {word_count}")
    print(f"Summarizing...\n")

    prompt = f"""You are a helpful assistant. Read the following document and provide:
1. A 3-sentence summary
2. The 3 most important takeaways as bullet points
3. One question this document leaves unanswered

Document:
{content}"""

    print("Gemma 4: ", end="", flush=True)

    response = ollama.generate(
        model="gemma4:e4b",
        prompt=prompt,
        stream=True
    )

    for chunk in response:
        print(chunk["response"], end="", flush=True)

    print("\n")

summarize("sample.txt")
```

The document was 304 words. Gemma 4 read it and produced a clean 
structured analysis without any issues. The summary was accurate. 
The takeaways were well chosen. The unanswered question it identified 
was genuinely sharp: what MLOps solutions exist for manufacturers 
without dedicated ML engineering teams? That is a real gap in the 
market and an actual question I hear from customers.

The key pattern here is context stuffing. The entire document gets 
injected into the prompt along with the instructions. The model reads 
both and responds based on what you gave it, not just its training data. 
This is the foundation of every document intelligence use case in 
enterprise AI, whether it is contract analysis, maintenance manual Q&A, 
or supplier document processing. The complexity scales but the pattern 
stays the same.

## Demo 3: Personal Notes Q&A

The third demo is the most practical one. I created a folder of plain 
text notes covering three topics: financial independence, AI build ideas, 
and books I am thinking about. The demo loads all of them, combines them 
into one context block, and answers questions that span across all three 
files.

```python
import ollama
import os

def load_notes(folder):
    notes = []
    for filename in os.listdir(folder):
        if filename.endswith(".txt"):
            filepath = os.path.join(folder, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            notes.append(f"[{filename}]\n{content}")
            print(f"  Loaded: {filename}")
    return "\n\n---\n\n".join(notes)

def ask(question, context):
    print(f"\nQuestion: {question}")
    print("Gemma 4: ", end="", flush=True)

    prompt = f"""You are a helpful assistant with access to a set of personal notes.
Answer the question using ONLY the information in the notes below.
If the answer is not in the notes, say "I don't have that in my notes."
Be concise and direct.

Notes:
{context}

Question: {question}"""

    response = ollama.generate(
        model="gemma4:e4b",
        prompt=prompt,
        stream=True
    )

    for chunk in response:
        print(chunk["response"], end="", flush=True)

    print("\n")

print("Loading notes...")
context = load_notes("notes")

ask("What are the key ideas about financial independence?", context)
ask("What did I learn about AI and manufacturing?", context)
ask("What books am I thinking about and why?", context)
ask("What is something I want to build this year?", context)
```

The responses were accurate across all four questions. The model read 
three separate files and pulled the right information for each question. 
The last question is the most interesting one. What is something I want 
to build this year was never stated as a direct answer anywhere in the 
notes. The model read the AI ideas file, understood the intent, and 
answered: you want to build a RAG system over your own documents. One 
clean sentence. That is reasoning over your own content, not just 
retrieval.

This demo is lightweight RAG. There is no vector database, no embeddings, 
no similarity search. The entire contents of every note file get injected 
into every prompt. This works well for a small collection of personal 
notes. When you scale to hundreds of documents you exceed the context 
window and need proper retrieval with vector embeddings. That is the next 
build, and I will cover it in a future post.

## Taking This to Google Cloud

Running Gemma 4 locally on a laptop is a great way to understand the 
model. But when a customer asks how to take this into production the 
conversation gets more interesting. I actually support an organization 
right now that uses a Microsoft open weight model for an internal AI 
assistant, essentially a knowledge catalog grounded in their internal 
content. That real world use case was part of the inspiration for this 
build, and it is exactly the kind of scenario I think about when 
considering how Gemma 4 would land in an enterprise environment.

The first option I gravitate toward for most enterprise customers is GKE. 
Google Distributed Cloud is a great option for air-gapped deployments but 
in practice that pattern tends to be reserved for public sector 
organizations or businesses with extremely stringent compliance 
requirements like PCI data flowing through the environment. For most 
enterprise organizations GKE is the more practical path. You containerize 
the model, deploy it on a GPU node pool, and the cluster handles 
resilience, scaling, and availability. If the internal knowledge assistant 
use case I mentioned needed to serve thousands of employees concurrently, 
GKE gives you the architecture to handle that while keeping the model 
within a private network.

Where GEAP comes in is for teams that want to move faster without managing 
infrastructure. Instead of hosting the model yourself you make API calls 
to Gemma hosted on the Gemini Enterprise Agent Platform. The data travels 
across the network but there are solid options to keep those calls private 
and secure, VPN, Dedicated Interconnect, or Cross Cloud Interconnect 
depending on the organization's existing architecture and bandwidth 
requirements. This gives enterprises a path to a base Gemma model without 
the operational overhead of running a cluster.

The tradeoff is real and worth being honest about. GKE gives you full 
control, the ability to fine tune on proprietary data, and no dependency 
on a public API. But it comes with infrastructure costs, cluster 
management overhead, and a team capable of running it at scale. GEAP is 
faster to stand up and removes the hosting burden, but your calls are tied 
to a cloud provider's API availability and fine tuning options are more 
constrained. There is no universally correct answer. The right architecture 
depends on the use case, the compliance requirements, the team's 
capabilities, and how much control the organization actually needs over 
the model and its outputs. That conversation is where a Customer Engineer 
earns their keep.

## More to Come

What I built here is a starting point, not a finish line. The next step 
is moving from context stuffing to proper RAG with vector embeddings, so 
the notes Q&A scales to hundreds of documents instead of a handful of 
text files. After that I want to deploy this in a more production 
comparable environment, closer to what I would actually recommend for a 
customer. There is a lot more to come.

Getting this published feels good. Honestly it has been a long time coming 
and building this end to end, understanding every piece of it, and writing 
about it in my own words was exactly the process I needed. It motivated me 
to keep going and there is a lot more I want to build and share. This is 
just the beginning.

If you want to run it yourself the repo is here:
[github.com/Bornism/gemma4-local-starter](https://github.com/Bornism/gemma4-local-starter)

Clone it, follow the README, and let me know what you build with it.
