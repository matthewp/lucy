const path = require('path');
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const lucyPrism = require('@lucy/prism');
const markdownIt = require('markdown-it');
const markdownItTocAndAnchor = require('markdown-it-toc-and-anchor').default;

module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats([ 'md' ]);
  eleventyConfig.addPassthroughCopy('styles');
  eleventyConfig.addPassthroughCopy('images');

  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    init({ Prism }) {
      lucyPrism.lucy(Prism);
      lucyPrism.lucyTemplate(Prism);
    }
  });

  eleventyConfig.setLibrary('md', markdownIt({
    html: true
  }).use(markdownItTocAndAnchor, {
    anchorClassName: 'heading-anchor',
    tocClassName: 'toc'
  }));

  eleventyConfig.addFilter('bareUrl', url => {
    return url.substr(1);
  });

  eleventyConfig.addFilter('baseUrl', url => {
    let rel = path.relative(path.dirname(url), '/') || '.';
    return rel + '/';
  });
};