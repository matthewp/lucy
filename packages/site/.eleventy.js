const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const addLucy = require('./prism-lucy.js');
const addLucyTemplate = require('./prism-lucy-template.js');
const markdownIt = require('markdown-it');
const markdownItTocAndAnchor = require('markdown-it-toc-and-anchor').default;

module.exports = function(eleventyConfig) {
  eleventyConfig.setTemplateFormats([ "md" ]);
  eleventyConfig.addPassthroughCopy("styles");
  eleventyConfig.addPassthroughCopy("images");

  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    init({ Prism }) {
      addLucy(Prism);
      addLucyTemplate(Prism);
    }
  });

  eleventyConfig.setLibrary('md', markdownIt({
    html: true
  }).use(markdownItTocAndAnchor, {
    anchorClassName: 'heading-anchor',
    tocClassName: 'toc'
  }));
};