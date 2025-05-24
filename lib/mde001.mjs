import { getHeadingLevel, filterByTypes } from "markdownlint-rule-helpers/micromark"

export default {
  names: ["MDE001", "heading-level"],
  description: "Headings should not be deeper than the specified level",
  information: null,
  tags: ["headings"],
  parser: "micromark",
  function: function MDE001(params, onError) {
    let maximumHeadingLevel = params.config.maximum === undefined
      ? 4
      : Number(params.config.maximum)

    maximumHeadingLevel = Math.max(1, Math.min(maximumHeadingLevel, 6))
    filterByTypes(params.parsers.micromark.tokens, ["atxHeading", "setextHeading"])
      .filter((heading) => getHeadingLevel(heading) > maximumHeadingLevel)
      .forEach((heading) => {
        onError({
          lineNumber: heading.startLine,
          detail: `Heading level is greater than ${maximumHeadingLevel}`,
          context: params.lines[heading.startLine - 1],
        })
      })
  }
}
