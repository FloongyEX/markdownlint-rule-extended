import { lint } from "markdownlint/sync"
import mde001 from "../lib/mde001.mjs"
import { TestCase, lintError } from "markdownlint-rule-utils"

const files = {
  atx: "test/heading/atxheading-level.md",
  setex: "test/heading/setexheading-level.md",
}

const options = {
  levelST1: {
    config: { MDE001: { maximum: 0 } },
    files: Object.values(files),
    customRules: [mde001],
  },
  default: {
    config: { MDE001: { maximum: 4 } },
    files: Object.values(files),
    customRules: [mde001],
  },
  levelGT6: {
    config: { MDE001: { maximum: 7 } },
    files: Object.values(files),
    customRules: [mde001],
  },
  omitted: {
    config: {},
    files: Object.values(files),
    customRules: [mde001],
  },
}

const errorDetails = {
  level0: "Heading level is greater than 1",
  level4: "Heading level is greater than 4",
}

const expectedResults = {
  levelST1: {
    [files.atx]: [
      lintError({
        rule: mde001,
        lineNumber: 3,
        errorDetail: errorDetails.level0,
        errorContext: "## ATX style H2",
      }),
      lintError({
        rule: mde001,
        lineNumber: 5,
        errorDetail: errorDetails.level0,
        errorContext: "### ATX style H3",
      }),
      lintError({
        rule: mde001,
        lineNumber: 7,
        errorDetail: errorDetails.level0,
        errorContext: "#### ATX style H4",
      }),
      lintError({
        rule: mde001,
        lineNumber: 9,
        errorDetail: errorDetails.level0,
        errorContext: "##### ATX style H5",
      }),
      lintError({
        rule: mde001,
        lineNumber: 11,
        errorDetail: errorDetails.level0,
        errorContext: "###### ATX style H6",
      }),
    ],
    [files.setex]: [
      lintError({
        rule: mde001,
        lineNumber: 4,
        errorDetail: errorDetails.level0,
        errorContext: "Setext style H2",
      })
    ],
  },
  default: {
    [files.atx]: [
      lintError({
        rule: mde001,
        lineNumber: 9,
        errorDetail: errorDetails.level4,
        errorContext: "##### ATX style H5",
      }),
      lintError({
        rule: mde001,
        lineNumber: 11,
        errorDetail: errorDetails.level4,
        errorContext: "###### ATX style H6",
      }),
    ],
    [files.setex]: [],
  },
  levelGT6: {
    [files.atx]: [],
    [files.setex]: [],
  },
}

expectedResults.omitted = expectedResults.default

const ruleTestCases = [
  new TestCase(
    "MDE001 test case 1",
    "Test MDE001 rule with options that specified level smaller than 1.",
    options.levelST1,
    expectedResults.levelST1,
  ),
  new TestCase(
    "MDE001 test case 2",
    "Test MDE001 rule with default options.",
    options.default,
    expectedResults.default,
  ),
  new TestCase(
    "MDE001 test case 3",
    "Test MDE001 rule with options that specified level greater than 6.",
    options.levelGT6,
    expectedResults.levelGT6,
  ),
  new TestCase(
    "MDE001 test case 4",
    "Test MDE001 rule with options that omitted config.",
    options.omitted,
    expectedResults.omitted,
  ),
]

describe.each(ruleTestCases)(
  "$name",
  (testCase) => {
    test(`${testCase.description}`, () => {
      const result = lint(testCase.input)

      expect(result).toEqual(testCase.expectedResult)
    })
  }
)
