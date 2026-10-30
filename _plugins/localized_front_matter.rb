# frozen_string_literal: true

# Per-language page metadata for jekyll-polyglot.
#
# Pages that share one source file between languages (home, portfolio, projects,
# blog, mvb) cannot carry a Ukrainian title/description in plain front matter, and
# jekyll-seo-tag builds canonical, og:url and og:locale from the unlocalized URL.
# This hook runs before each page renders and, for the language being built:
#   - uses `title_<lang>` / `description_<lang>` front matter over `title` / `description`
#   - sets `locale` (og:locale), `canonical_url` (the page's own URL in this language)
#   - exposes `i18n_urls` (lang => absolute URL) and `x_default_url` for the hreflang links in default.html
# Pages whose URL does not end in "/" (feed.xml, 404.html) are left alone.
# GH Pages safe: no external gem requires.

module Jekyll
  module LocalizedFrontMatter
    LOCALES = { "en" => "en_US", "uk" => "uk_UA" }.freeze

    def self.apply(doc, payload)
      site = doc.site
      lang = site.respond_to?(:active_lang) ? site.active_lang : nil
      page = payload["page"]
      return if lang.nil? || page.nil?

      %w(title description).each do |key|
        value = doc.data["#{key}_#{lang}"]
        page[key] = value unless value.to_s.empty?
      end

      url = doc.url.to_s
      return unless url.end_with?("/")

      page["locale"] = LOCALES[lang] if LOCALES.key?(lang)

      languages = site.languages
      default = site.config["default_lang"]
      path = url.sub(%r{\A/(#{languages.map { |l| Regexp.escape(l) }.join("|")})/}, "/")
      base = site.config["url"].to_s.chomp("/") + site.config["baseurl"].to_s
      urls = languages.to_h do |l|
        [l, base + (l == default ? "" : "/#{l}") + path]
      end
      page["i18n_urls"] = urls
      page["x_default_url"] = urls[default]
      page["canonical_url"] = urls[lang]
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :pre_render do |doc, payload|
  Jekyll::LocalizedFrontMatter.apply(doc, payload)
end
