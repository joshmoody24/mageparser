@{%
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
%}

@lexer lexer

main -> binding:* expression
       {% ([bindings, expression]) => ({ type: "Main", bindings, expression }) %}

binding -> "bind" identifier "to" expression "in"
       {% ([, id, , expr, ]) => ({ type: "Binding", name: id.name, value: expr }) %}

expression -> function_call
            | function_literal
            | integer
            | identifier
            {% id %}

function_call -> %lparen identifier expression:* %rparen
       {% ([, callee, args]) => ({ type: "Call", callee, arguments: args }) %}

function_literal -> %lbrack identifier:* %rbrack %arrow expression
       {% ([, params, , , body]) => ({ type: "FunctionLiteral", params: params.map(p => p.name), body }) %}

identifier -> %identifier
       {% d => ({ type: "Identifier", name: d[0].value }) %}
