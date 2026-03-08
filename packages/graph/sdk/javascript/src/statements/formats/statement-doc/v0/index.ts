export {
  FSD_VERSION,
  FSD_TOKENS,
  FSD_ESCAPES,
  FSD_UNESCAPES,
  FSD_PREDICATE_DEFAULTS,
  FSD_DEFAULT_SOURCE_TYPES,
} from "./grammar.js";

export type {
  FsdNodeRole,
  FsdNodeDefaults,
  FsdPredicateDefaults,
  FsdDefaults,
  FsdNodeToken,
  FsdStatementLine,
  ParsedFsdDocument,
  ParseFsdOptions,
  FormatFsdOptions,
  FsdStatementInput,
} from "./schema.js";
export { FsdParseError } from "./schema.js";

export { parseFsd, parseFsdToStatementInputs } from "./parse.js";
export { formatParsedFsd, formatStatementInputsAsFsd } from "./format.js";

// Stable statement-doc surface names for this version module.
export { parseFsd as parseStatementDoc, parseFsdToStatementInputs as parseStatementDocToStatementInputs } from "./parse.js";
export { formatParsedFsd as formatStatementDoc, formatStatementInputsAsFsd as formatStatementInputsAsStatementDoc } from "./format.js";
