const cheerio = require('cheerio');

const webToolSchema = {
  type: 'function',
  function: {
    name: 'web_search_and_scrape',
    description: 'Search DuckDuckGo for live web information or scrape readable text from a specific URL.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "latest Node.js LTS version") OR direct URL starting with https://'
        }
      },
      required: ['query']
    }
  }
};

async function executeWebTool({ query }) {
  try {
    const isDirectUrl = /^https?:\/\//i.test(query.trim());

    if (isDirectUrl) {
      const response = await fetch(query.trim(), {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style, nav, footer, noscript, iframe').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000);
      return {
        status: 'success',
        mode: 'scrape',
        url: query.trim(),
        excerpt: text
      };
    }

    // DuckDuckGo HTML Search
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.result').each((i, el) => {
      if (i >= 5) return false;
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__url').text().trim();
      if (title && snippet) {
        results.push({ title, snippet, link });
      }
    });

    return {
      status: 'success',
      mode: 'search',
      query,
      results: results.length ? results : 'No search results found.'
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

module.exports = {
  webToolSchema,
  executeWebTool
};
