# AX (Agent Experience): A Research Brief

Compiled 2026-08-12. "AX" here refers to **Agent Experience** — the dominant, currently-used meaning of the term in AI/software circles (as opposed to, e.g., Microsoft's discontinued "Dynamics AX" ERP product, which is not what recent sources use "AX" to mean).

## 1. Plain-English Summary

AX is the practice of designing websites, apps, and APIs so that AI agents — not just humans — can understand and use them reliably, the same way "user experience" (UX) is about humans and "developer experience" (DX) is about programmers. It was coined in 2025 by Netlify CEO Mathias Biilmann, who argued that products with a clear, predictable, machine-readable "front door" for agents will work better with AI tools than products that only make sense to a human clicking around. In practice, "doing AX" means things like writing clearer API documentation, publishing structured files that summarize what a site or product does, and giving AI agents narrow, well-defined permissions instead of forcing them through interfaces built only for people. [[1]](https://biilmann.blog/articles/introducing-ax/)

## 2. Key Capabilities — With Specific Examples

AX is a design discipline, not a single tool, so its "capabilities" are recurring practices. Each one below is illustrated with a concrete, named example rather than a general claim.

- **Machine-readable summaries of a product/site.** The `llms.txt` file format lets a site publish a short, curated map of its most important content for AI systems to read, instead of forcing an agent to crawl and guess. Wix auto-generates one for its Premium eCommerce customers, and it's used to expose a store's offerings, contact details, and product catalog in a compact format described as roughly 275x smaller than the equivalent web pages. [[2]](https://www.wix.com/studio/ai-search-lab/llms-txt-use-cases)
- **Agent-specific API documentation and metadata.** Rather than one instruction sheet for both humans and agents, API-tooling company Speakeasy recommends adding agent-specific context — e.g., explicitly stating "use this operation after the cart has been created but before checkout validation" and "if the cart already has a billing address, this call will overwrite it" — via OpenAPI extensions like `x-speakeasy-mcp`, so an agent doesn't have to infer sequencing or side effects. [[3]](https://www.speakeasy.com/blog/agent-experience-introduction)
- **Standardized agent-to-tool connections via MCP.** The Model Context Protocol (MCP), open-sourced and championed by Anthropic, is described by AX writers as "the USB-C for AI applications" — a common plug so an agent that "speaks MCP" can connect to many different tools without custom integration work for each one. [[4]](https://nordicapis.com/what-is-agent-experience-ax/)
- **Request tracing and scoped permissions for agents.** Concrete practice: tagging agent-originated API calls with headers such as `X-Agent-Request: true` and `X-Agent-Name: product-recommender-v1` so they're distinguishable from human traffic in logs, and restricting what an agent can do — e.g., an e-commerce support agent can search products and manage a cart, but is explicitly denied access to credit-card operations or completing checkout. [[3]](https://www.speakeasy.com/blog/agent-experience-introduction)
- **Open, agent-friendly integration flows (cited as "good AX").** Netlify's own example: connecting ChatGPT so it can deploy a web project directly to a live URL — Biilmann's article states over 1,000 sites were being deployed this way per day as of the article's writing. [[1]](https://biilmann.blog/articles/introducing-ax/)
- **Named counter-example ("bad AX").** The same source names Google Workspace and Microsoft 365 as designing "closed" experiences — bundling their own branded AI agents into the product "with no clear path for users to bring other agents" to do the same work. [[1]](https://biilmann.blog/articles/introducing-ax/)

## 3. Pricing or Access Details

AX itself is **not a purchasable product** — there is no vendor selling "AX" as a subscription. It is a design framework/vocabulary. Access is free:

- The community reference site, **agentexperience.ax**, is free and open-source, maintained by "open contributors, researchers, and volunteers," and offers free written concepts, articles, and research — no paywall, account, or fee found. [[5]](https://agentexperience.ax/)
- The originating article and most follow-up writing (Netlify, Nordic APIs, Speakeasy, Medium, etc.) are free to read. [[1]](https://biilmann.blog/articles/introducing-ax/) [[4]](https://nordicapis.com/what-is-agent-experience-ax/) [[3]](https://www.speakeasy.com/blog/agent-experience-introduction)

What **does** cost money is the tooling some teams use to implement AX practices — but that's ordinary SaaS pricing for those specific products, not a cost of "AX" as a concept:

- Speakeasy (API/SDK and MCP-server generation) lists an "Enterprise" tier marked "Tailored," requiring a sales conversation — no public self-serve price was found on its pricing page at the time of this research. [[6]](https://www.speakeasy.com/pricing) *(Flagged: could not verify whether Speakeasy also offers a free/self-serve tier from the page content retrieved — see Limitations.)*
- Auto-generated `llms.txt` is bundled into Wix's **Premium eCommerce** plan rather than sold separately; no standalone price for the feature was found. [[2]](https://www.wix.com/studio/ai-search-lab/llms-txt-use-cases)

## 4. Three Practical Use Cases for Non-Technical Users

1. **A small online store owner wants AI shopping assistants to represent their products accurately.** By using a platform that auto-generates an `llms.txt` file (e.g., Wix Premium eCommerce), a non-technical shop owner gets a structured summary of their offerings, pricing, and contact info that's positioned to be read by AI agents comparing or recommending products — without writing a single line of code. [[2]](https://www.wix.com/studio/ai-search-lab/llms-txt-use-cases)
2. **A customer-support lead wants an AI agent to correctly handle refund requests without hallucinating policy.** Applying AX thinking — e.g., writing explicit, sequence-aware policy text ("this can only be requested within 30 days of purchase; overwrites any prior refund request") instead of vague human-oriented copy — is drawn directly from the documentation approach Speakeasy recommends for agents, and doesn't require the support lead to write code, only clearer, less ambiguous policy language. [[3]](https://www.speakeasy.com/blog/agent-experience-introduction)
3. **A solo marketer or founder wants AI chatbots (ChatGPT, Perplexity, etc.) to describe their business correctly instead of guessing.** Publishing a plain-text `llms.txt` summary is pitched as a way to give AI systems "authoritative facts about your products, pricing, and policies," directly reducing the chance an AI invents inaccurate details about the business. [[2]](https://www.wix.com/studio/ai-search-lab/llms-txt-use-cases) — **Caveat carried into this use case:** see Limitations below; there is real doubt about whether major AI assistants currently read this file at all.

## 5. Limitations and Drawbacks (Honest Assessment)

- **The term was coined by a vendor with a commercial stake in the idea.** Netlify's CEO introduced AX in a company blog post that also promotes Netlify's own agent-facing products; that doesn't make the concept wrong, but it is fair to note the originating source is not neutral. [[1]](https://biilmann.blog/articles/introducing-ax/)
- **Adoption is currently low.** A survey cited by Nordic APIs found only 24% of respondents design APIs with AI agents in mind, versus 60% who design "for humans only" — meaning most of the practices AX advocates for are not yet the norm. [[4]](https://nordicapis.com/what-is-agent-experience-ax/)
- **One of AX's flagship tactics — `llms.txt` — has weak evidence of actually working.** Google's John Mueller has stated no AI system is currently known to use `llms.txt`; OpenAI and Anthropic have not confirmed their assistants read it at inference time. An independent 90-day study by OtterlyAI found that out of 62,100 AI-bot requests to monitored sites, only 84 (about 0.1%) targeted the `llms.txt` file at all — and a crawler fetching the file is not proof it affects any actual AI output. [[7]](https://www.longato.ch/llms-recommendation-2025-august/) *(Note: this is a secondary aggregation of the Mueller statement and the OtterlyAI study; the primary OtterlyAI report and Mueller's original statement were not directly accessed and could not be independently re-verified within this research pass — flagged as a claim resting on a secondary source.)*
- **Definitions of "AX" are inconsistent across sources.** At least one source (eGlobalis) explicitly distinguishes "Agent Experience" (agents as the user of your product) from "Agentic Experience" (a human being served by their own agent) — a distinction other sources blur or use interchangeably, which makes the term less precise than the UX/DX analogy it's modeled on. [[4]](https://nordicapis.com/what-is-agent-experience-ax/)
- **Silent-failure risk is structural, not just an implementation detail.** Multiple sources note that, unlike a frustrated human, an agent that hits a broken flow (a CAPTCHA, an ambiguous error, a login redirect) typically won't "complain" — it just fails or works around the intended path, which can hide integration problems until they show up as bad outcomes downstream. [[4]](https://nordicapis.com/what-is-agent-experience-ax/)
- **No formal standards body.** MCP and `llms.txt` are the closest things to shared conventions, but AX as a whole is a loosely defined practice, not a certified standard — "doing AX well" is currently a matter of following blog-post best practices from a handful of companies (Netlify, Speakeasy, Nordic APIs), not an audited specification.

## 6. Sources

| # | Source | Used for |
|---|--------|----------|
| [1] | [Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax/) — Mathias Biilmann / Netlify | Origin, definition, good/bad AX examples |
| [2] | [5 LLMs.txt Use Cases for Marketers](https://www.wix.com/studio/ai-search-lab/llms-txt-use-cases) — Wix | llms.txt capability, non-technical use cases, size-reduction claim |
| [3] | [Designing Agent Experience: A Practical Guide for the Era of AX](https://www.speakeasy.com/blog/agent-experience-introduction) — Speakeasy | Documentation/tracing/scoping practices, use case 2 |
| [4] | [What Is Agent Experience (AX)?](https://nordicapis.com/what-is-agent-experience-ax/) — Nordic APIs | MCP description, adoption survey stat, definitional inconsistency, silent-failure point |
| [5] | [agentexperience.ax](https://agentexperience.ax/) — community site | Access/cost of the AX framework itself |
| [6] | [Speakeasy Pricing](https://www.speakeasy.com/pricing) | Pricing detail for an AX-adjacent commercial tool |
| [7] | [LLMs.txt: Why AI Crawlers Ignore It (2025 Audit)](https://www.longato.ch/llms-recommendation-2025-august/) | llms.txt efficacy limitation — flagged as secondary-source claim |

**Unverified/flagged claims:** two items above are explicitly flagged inline — (a) whether Speakeasy offers any free/self-serve tier beyond the "Tailored" Enterprise plan, and (b) the John Mueller statement and OtterlyAI 90-day figures, which were only accessed via a secondary aggregating source rather than the original statement/report. Both are marked at the point they're used rather than presented as fully verified facts.
