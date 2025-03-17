// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
  WS:      { match: /[ \t\n\r]+/, lineBreaks: true },
  comment: { match: /#[^\n]*/, lineBreaks: true },
  bind:    "bind",
  to:      "to",
  in:      "in",
  lparen:  "(",
  rparen:  ")",
  lbrack:  "[",
  rbrack:  "]",
  arrow:   "->",
  identifier: /[a-zA-Z_?][a-zA-Z0-9_?\-]*/,
});

lexer.next = (next => () => {
  let tok;
  while ((tok = next.call(lexer)) && (tok.type === "WS" || tok.type === "comment")) {}
  return tok;
})(lexer.next);
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "binding"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "main", "symbols": ["main$ebnf$1", "expression"], "postprocess": ([bindings, expression]) => ({ type: "Main", bindings, expression })},
    {"name": "binding", "symbols": [{"literal":"bind"}, "identifier", {"literal":"to"}, "expression", {"literal":"in"}], "postprocess": ([, id, , expr, ]) => ({ type: "Binding", name: id.name, value: expr })},
    {"name": "expression", "symbols": ["function_call"]},
    {"name": "expression", "symbols": ["function_literal"]},
    {"name": "expression", "symbols": ["integer"]},
    {"name": "expression", "symbols": ["identifier"], "postprocess": id},
    {"name": "function_call$ebnf$1", "symbols": []},
    {"name": "function_call$ebnf$1", "symbols": ["function_call$ebnf$1", "expression"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "function_call", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "identifier", "function_call$ebnf$1", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": ([, callee, args]) => ({ type: "Call", callee, arguments: args })},
    {"name": "function_literal$ebnf$1", "symbols": []},
    {"name": "function_literal$ebnf$1", "symbols": ["function_literal$ebnf$1", "identifier"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "function_literal", "symbols": [(lexer.has("lbrack") ? {type: "lbrack"} : lbrack), "function_literal$ebnf$1", (lexer.has("rbrack") ? {type: "rbrack"} : rbrack), (lexer.has("arrow") ? {type: "arrow"} : arrow), "expression"], "postprocess": ([, params, , , body]) => ({ type: "FunctionLiteral", params: params.map(p => p.name), body })},
    {"name": "identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": d => ({ type: "Identifier", name: d[0].value })}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
