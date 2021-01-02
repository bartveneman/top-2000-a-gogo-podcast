module.exports = function (eleventyConfig) {
  eleventyConfig.setTemplateFormats([
    "html",
    "css",
    "md",
    "liquid"
  ])

  eleventyConfig.addLayoutAlias('default', 'layouts/default.html')
  eleventyConfig.addLayoutAlias('episode', 'layouts/episode.html')
}
