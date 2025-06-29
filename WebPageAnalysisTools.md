---
layout: page
title: WebPageAnalyzer
permalink: /web_page_analyzer/
---

# All-in-One Web Page Analysis Tool

## Brief Overview

![Overview feature highlight](../assets/images/web_page_analyzer/overview-feature_highlight-0-0400x0300.png)

WebPageAnalyzer is a powerful Groovy-based command-line tool designed to streamline web content extraction, analysis, and transformation. It empowers developers, data analysts, and digital marketers to automate tasks like data scraping, competitor monitoring, content migration, and SEO analysis with precision and efficiency. The tool supports both static and JavaScript-rendered websites, handles international character sets flawlessly, and integrates seamlessly into workflows via CLI, Docker, or custom integrations.

### Packages

- **Basic**: Extract data from one static website, output in JSON/CSV, 4-day delivery, 1 revision.
- **Standard**: Scrape dynamic content from 3 websites, multi-format output (JSON, CSV, Markdown), 7-day delivery, 2 revisions.
- **Premium**: Full-suite analysis for 5 websites, all commands, advanced rendering, and optimizations, 10-day delivery, 3 revisions.
- **Advanced**: Tailored solutions with features like GUI, login support, proxy rotation, or API integration.
- **Optional Extras**: Add-ons like GUI interface ($80), login support ($45), proxy support ($35), or advanced SEO audits ($60).

*Note: Pricing details for premium packages and custom features are available at "[I will help you extract, analyze, and transform web content](https://www.fiverr.com/pere_val/help-you-extract-analyze-and-transform-web-content-like-a-pro)".*

---

## Detailed Overview

### Product Description

WebPageAnalyzer is a robust, cross-platform CLI tool built in Groovy, leveraging libraries like JSoup, Selenium WebDriver, and Apache HttpClient to provide comprehensive web content processing capabilities. It addresses common challenges such as JavaScript rendering, UTF-8 character handling, and complex DOM navigation, making it ideal for professionals needing reliable, scalable web analysis solutions. With six core commands—`parse`, `read`, `extract`, `stats`, `compare`, and `transform`—the tool supports a wide range of use cases, from data extraction to SEO optimization.

### Key Features

1. **Web Page Fetching (`read`)**
   - Fetches static and dynamic (JavaScript-rendered) pages.
   - Configurable headers, user agents, timeouts, and wait conditions.
   - Supports HTTP/HTTPS and automatic redirects.

2. **DOM Parsing (`parse`)**
   - Converts HTML to structured JSON with full DOM hierarchy.
   - Preserves UTF-8 characters (e.g., "Повний огляд" remains readable).
   - Handles malformed HTML gracefully.

3. **Element Extraction (`extract`)**
   - Uses CSS selectors for precise data targeting.
   - Outputs in JSON, CSV, or text formats.
   - Extracts specific attributes or text content.

4. **Content Analysis (`stats`)**
   - Generates metrics on DOM depth, tag distribution, and content/code ratio.
   - Identifies performance issues and SEO opportunities.
   - Customizable report formats.

5. **Document Comparison (`compare`)**
   - Compares HTML files in structure, content, or visual modes.
   - Reports additions, deletions, and modifications.
   - Supports selective comparison with CSS selectors.

6. **Content Transformation (`transform`)**
   - Converts HTML to Markdown, plain text, or JSON.
   - Preserves links, images, and semantic structure.
   - Configurable output formatting.

### Packages and Pricing

#### Basic Package: Starter Web Analyzer

- **Price**: $50
- **Delivery**: 4 days
- **Features**:
  - Scrape 1 static website, 1 page.
  - Output in JSON or CSV.
  - Basic error handling and documentation.
  - 1 revision included.
- **Use Case**: Ideal for small-scale data extraction, such as pulling product details from a single e-commerce page.

#### Standard Package: Dynamic Content Processing

- **Price**: $150
- **Delivery**: 7 days
- **Features**:
  - Scrape 3 websites, 1 page each, including JavaScript-rendered content.
  - Outputs in JSON, CSV, or Markdown.
  - Enhanced selectors (up to 7 CSS selectors), dynamic rendering, and detailed documentation.
  - 2 revisions included.
- **Use Case**: Perfect for analyzing dynamic sites, like news portals or blogs, with multiple output formats.

#### Premium Package: Full-Scale Web Intelligence Suite

- **Price**: $300
- **Delivery**: 10 days
- **Features**:
  - Full suite for 5 websites, 1 page each, with all commands.
  - Unlimited CSS selectors, advanced rendering, and performance optimizations.
  - Comprehensive documentation, integration support (e.g., Docker), and 3 revisions.
- **Use Case**: Comprehensive solution for large-scale projects, such as competitor monitoring or content migration.

#### Advanced Package: Custom Web Intelligence

- **Price**: Custom (starts at $400, varies by complexity)
- **Delivery**: 14+ days (based on scope)
- **Features**:
  - Fully tailored solutions with custom features (e.g., GUI, login support, proxy rotation, database export).
  - All commands, unlimited selectors, and advanced integrations (e.g., API, CI/CD).
  - Custom revisions and ongoing maintenance options.
- **Use Case**: Bespoke solutions for complex needs, like automated data pipelines or enterprise-grade SEO auditing.

#### Optional Extras

- **GUI Interface ($80)**: Simple interface for non-technical users.
- **Login Support ($45)**: Handles authentication for protected sites.
- **Proxy Support ($35)**: Enables geo-based or stealth scraping.
- **Advanced SEO Audit ($60)**: Analyzes DOM depth, headings, and links.
- **Database Export ($80)**: Integrates with SQL/NoSQL databases.
- **Extra Fast Delivery**: $25–$60 (reduces delivery by 1–3 days).
- **Additional Pages**: $10 per 10 pages.
- **Data Mining ($35–$80)**: Advanced extraction techniques.

### Real-World Use Cases and Examples

![Real wworld use cases](../assets/images/web_page_analyzer/real_world-use_cases-portrait-0256x0384.png)

#### 1. Content Migration

**Scenario**: A company migrating blog content from WordPress to a new CMS.

```bash
# Fetch blog posts
web-page-analyzer read https://example.com/blog/post1 post1.html --dynamic
# Extract article content
web-page-analyzer extract post1.html "article" post1.json --selector="h1,p" --attributes="text,text"
# Transform to Markdown
web-page-analyzer transform post1.html post1.md --format=markdown
```

**Outcome**: Structured content ready for import, with preserved formatting and links.

#### 2. Competitive Analysis

**Scenario**: Monitor a competitor’s e-commerce site for price changes.

```bash
# Fetch daily snapshots
web-page-analyzer read https://competitor.com/products products-$(date +%Y%m%d).html --dynamic
# Compare with previous day
web-page-analyzer compare products-$(date -d yesterday +%Y%m%d).html products-$(date +%Y%m%d).html changes.json
# Extract pricing data
web-page-analyzer extract products-$(date +%Y%m%d).html "div.product" prices.csv --format=csv --selector=".price" --attributes="text"
```

**Outcome**: Detailed change reports and structured pricing data for analysis.

#### 3. SEO Analysis

**Scenario**: Optimize a corporate website for search engines.

```bash
# Fetch page
web-page-analyzer read https://website.com page.html --dynamic
# Generate stats
web-page-analyzer stats page.html seo-stats.json --include=content,links,structure
# Extract metadata
web-page-analyzer extract page.html "head meta" metadata zwraca:0
metadata.json --attributes="name,content"
```

**Outcome**: Comprehensive SEO metrics and metadata for optimization.

#### 4. Data Extraction for Market Research

**Scenario**: Extract product data from multiple e-commerce pages.

```bash
# Fetch multiple pages
for i in {1..5}; do
  web-page-analyzer read "https://store.com/products?page=$i" page$i.html --dynamic
  web-page-analyzer extract page$i.html "div.product" products$i.csv --format=csv --selector=".name,.price" --attributes="text,text"
done
# Combine results
cat products*.csv > all_products.csv
```

**Outcome**: Consolidated product data for market analysis.

#### 5. Content Quality Assurance

**Scenario**: Validate content consistency across staging and production.

```bash
# Compare versions
web-page-analyzer compare staging.html production.html diff.json --mode=content
# Check for broken links
web-page-analyzer extract production.html "a" links.csv --format=csv --attributes="href"
```

**Outcome**: Detailed difference reports and link validation.

### Technical Foundation

![Before after output formats](../assets/images/web_page_analyzer/before-after-output_formats-0384x0256.png)

- **Language**: Groovy, ensuring cross-platform compatibility.
- **Libraries**:
  - JSoup for HTML parsing.
  - Selenium WebDriver for dynamic rendering.
  - Apache HttpClient for static fetching.
  - PicoCLI for intuitive CLI.
- **Build System**: Gradle.
- **Testing**: Spock Framework, >80% unit test coverage.
- **Deployment**: Executable JAR or Docker container.
- **Error Handling**: Robust with detailed logging and recovery.

### Benefits

- **Efficiency**: Automates repetitive web content tasks.
- **Flexibility**: Supports multiple formats and integration options.
- **Reliability**: Handles complex sites and encoding issues.
- **Scalability**: Suitable for single pages or large-scale operations.
- **Customizability**: Extensible via add-ons and custom features.

### Getting Started

```bash
# Install via Docker
docker pull web-page-analyzer
# Run a command
web-page-analyzer read https://example.com example.html --dynamic
# View help
web-page-analyzer --help
```

### Future Enhancements

- Web security scanning.
- Advanced SEO and accessibility audits.
- API for programmatic access.
- Visual comparison with screenshots.
- Plugin system for custom extensions.

### Conclusion

WebPageAnalyzer is a versatile, professional-grade tool that simplifies web content processing. Whether you need to extract data, analyze websites, or automate workflows, its comprehensive feature set, robust architecture, and flexible packaging options make it an essential asset for businesses and individuals alike.
