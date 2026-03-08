/**
 * @chris-test/fide-vocabulary
 *
 * Typed access to the Fide Vocabulary.
 */

export {
  FIDE_VOCABULARY,
  FIDE_ENTITY_TYPES,
  getFideEntityTypeSpecByName,
  getFideEntityTypeSpecByCode,
  listFideEntityTypes,
} from "./spec/index.js";

export type {
  FideEntityTypeName,
  FideEntityTypeCode,
  FideEntityTypeSpec,
  FideStandardFit,
} from "./spec/index.js";
