---
layout: page
title: Tags
permalink: /blog/tags/
description: "All blog post tags"
---

<div class="tag-cloud" style="display:flex;flex-wrap:wrap;gap:var(--sp-2);margin-top:var(--sp-4);">
{% assign sorted_tags = site.tags | sort %}
{% for tag in sorted_tags %}
  {% assign tag_name = tag | first %}
  {% assign tag_posts = tag | last %}
  <a href="#{{ tag_name | slugify }}" class="tag" style="font-size:{{ tag_posts.size | times: 2 | plus: 12 }}px;">
    {{ tag_name }} ({{ tag_posts.size }})
  </a>
{% endfor %}
</div>

{% assign sorted_tags = site.tags | sort %}
{% for tag in sorted_tags %}
  {% assign tag_name = tag | first %}
  {% assign tag_posts = tag | last %}
  <h2 id="{{ tag_name | slugify }}" style="margin-top:var(--sp-7);">{{ tag_name }}</h2>
  <ul>
    {% for post in tag_posts %}
    <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> — <time>{{ post.date | date: "%B %-d, %Y" }}</time></li>
    {% endfor %}
  </ul>
{% endfor %}
