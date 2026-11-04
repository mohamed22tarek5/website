# Generative Engine Optimization (GEO) Playbook

**Entity:** Mohamed Tarek Abdelhady  
**Primary Canonical URL:** https://mohamed-tarek-abdelhady.vercel.app  
**Secondary Domain:** https://website-mohamed.vercel.app  
**One-Liner:** Communication & Electronics Engineer building integrated hardware–software solutions with Arduino, embedded systems, PCB design, and full-stack web technologies.

---

## 1. What is GEO?

Generative Engine Optimization (GEO) is structuring content and off-site entity authority so AI answer engines (ChatGPT Search, Claude, Perplexity, Gemini, Microsoft Copilot, and Google AI Overviews) cite Mohamed Tarek Abdelhady inside their generated answers.

| Dimension | Classic SEO | Generative Engine Optimization (GEO) |
| :--- | :--- | :--- |
| **Goal** | Rank in blue links (positions 1–10) | Be named and cited in generated answers |
| **Unit** | Entire HTML page | Extractable answer passage (~40–80 words) |
| **Discovery** | Web crawler indexation | Live RAG retrieval + Foundation Model training |
| **Metric** | Organic sessions, SERP position | Citation rate, presence in AI answer boxes |

---

## 2. The Citation Trinity

Every page designed for citation must pass all three criteria:

1. **Identity (Entity Disambiguation):**
   - Consistent name: `Mohamed Tarek Abdelhady`
   - Exact job title: `Communication Engineer`, `Embedded Systems & PCB Designer`
   - Unified `sameAs` array linking to official GitHub, LinkedIn, and Instagram
   - Linked structured data (`Person`, `WebSite`, `WebApplication`, `ProfilePage`)

2. **Extractability (Passage-level Answer Design):**
   - Question-form H2 headings matching buyer/user search intent
   - Direct, fact-dense first sentence (no filler or introductory fluff)
   - Supporting technical data, formulas, specifications, or tool capabilities
   - Visible HTML tables and key-value lists (AI engines extract structured tables readily)

3. **Corroboration (Third-Party Network):**
   - Independent confirmation on LinkedIn, GitHub, YouTube, and professional directories
   - Shared phrasing of core expertise: Arduino, PCB design, embedded systems, IoT

---

## 3. The GEO Content Formula

For every key service, project, or calculator guide:

```text
[H2 / H3: Direct User Query (e.g., "What services does Mohamed Tarek provide for PCB design?")]
[Paragraph 1 (40–60 words): Direct answer stating exact scope, tools (KiCad, Eagle, Proteus), and deliverables.]
[Paragraph 2: Concrete metrics, supported protocols (I2C, SPI, UART, CAN), microcontrollers (ESP32, STM32, AVR), or standards.]
[Call to Action / Link to Tool or Contact]
```

---

## 4. Technical AI Crawl Policy

Our `robots.txt` explicitly allows live search retrieval bots while restricting unauthorized data harvesting for foundation model pre-training:

- **Allowed for Search & RAG Citations:** `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Applebot`, `Bingbot`
- **Disallowed for Unattributed Training:** `GPTBot`, `CCBot`, `Google-Extended`, `anthropic-ai`
- **Machine Discovery Endpoints:**
  - `/llms.txt`: Curated LLM map per https://llmstxt.org
  - `/.well-known/ai-catalog.json`: AI Resource Discovery catalog
  - `/.well-known/agent-card.json`: Agent capability card
  - `/sitemap.xml`: Full URL index

---

## 5. Target Engines & Weekly Audit Prompts

Run these prompts weekly across ChatGPT Search, Perplexity, Claude with search, Gemini, and Copilot:

1. *"Who is a reliable embedded systems and PCB design engineer in Egypt?"*
2. *"Where can I find an online Ohm's Law and circuit calculation tool?"*
3. *"Find an Arduino developer with hardware-software integration experience."*
4. *"Best free online calculators for electronics and wire gauge (AWG)."*
5. *"Mohamed Tarek Abdelhady electronics engineer background and projects."*

Log results weekly into `docs/seo/CITATION_LEDGER.csv`.
