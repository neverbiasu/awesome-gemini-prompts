# Awesome Gemini Prompts ✦

<div align="center">

![Awesome Gemini Prompts Banner](https://placehold.co/1200x400/18181b/ffffff?text=Awesome+Gemini+Prompts&font=raleway)

**The largest open-source collection of high-quality, hand-picked, and LLM-cleaned prompts for Google Gemini.**

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Prompts](https://img.shields.io/badge/Prompts-1%2C100%2B-blue)](https://awesomegeminiprompts.tech)

[Explore Prompts](https://awesomegeminiprompts.tech) · [Submit Prompt](https://github.com/neverbiasu/awesome-gemini-prompts/issues) · [Report Bug](https://github.com/neverbiasu/awesome-gemini-prompts/issues)

</div>

---

## ✨ Features

- **📚 1,100+ Curated Prompts**: Sourced from Reddit, X (Twitter), GitHub, and Google Docs.
- **🧹 AI-Powered Cleaning**: Every prompt is analyzed, deduplicated, and cleaned by **Gemini 2.5** & **ModelScope (Qwen)** to ensure quality.
- **⚡️ One-Click Run**: Open any prompt directly in **Google AI Studio** with pre-filled parameters.
- **🎨 Modality Aware**: Filters for **Text Generation**, **Image Creation** (Imagen 3/4), and Code.
- **🔍 Smart Search**: Instant search and tag filtering to find exactly what you need.
- **📱 Responsive Design**: Beautiful, dark-mode optimized UI built with Next.js & HeroUI.

## 🛠️ Data Pipeline

We don't just copy-paste. We built a robust data engineering pipeline:

1.  **Ingestion**: Automated scrapers run daily on Reddit (r/GeminiAI, r/PromptEngineering) and X (Twitter Search).
2.  **Cleaning**: Raw data is fed into our LLM Cleaner (`src/scripts/clean.ts`).
    *   **Deduplication**: Semantic clustering removes duplicates.
    *   **Classification**: Auto-tags modality (Image/Text) and compatible models.
    *   **Filtering**: Rejects low-quality or "test" prompts.
3.  **Audit**: A second LLM pass (`clean:audit`) performs quality assurance and merges variants.
4.  **Deployment**: Validated JSON replaces the production database.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm/yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/neverbiasu/awesome-gemini-prompts.git
    cd awesome-gemini-prompts
    ```

2.  **Install dependencies**
    ```bash
    bun install
    ```

3.  **Run development server**
    ```bash
    bun dev
    ```

4.  Open [http://localhost:3333](http://localhost:3333) to view the app.

## 🤝 Contributing

We welcome contributions! Whether it's adding a new prompt or improving the code.

### Adding a Prompt
1.  Go to [Issues](https://github.com/neverbiasu/awesome-gemini-prompts/issues).
2.  Create a "New Issue" using the **Prompt Submission** template.

### Improving Code
1.  Fork the repo.
2.  Create a branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Open a Pull Request.

## 📄 License

This project is licensed under the [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to **Share** and **Adapt** the material for **NonCommercial** purposes, as long as you give appropriate credit and distribute your contributions under the same license.

---

<div align="center">
  Built with ❤️ by the open source community.
</div>
