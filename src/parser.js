import nearley from "nearley";
import grammar from "./dsl.cjs";

export default function parse(input) {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
  parser.feed(input);
  return parser.results;
}
