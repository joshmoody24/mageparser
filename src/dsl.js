// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
  function id(x) {
    return x[0];
  }
  var grammar = {
    Lexer: undefined,
    ParserRules: [
      { name: "main$ebnf$1", symbols: [] },
      {
        name: "main$ebnf$1$subexpression$1$subexpression$1",
        symbols: ["binding"],
      },
      {
        name: "main$ebnf$1$subexpression$1$subexpression$1",
        symbols: ["comment"],
      },
      {
        name: "main$ebnf$1$subexpression$1",
        symbols: [
          "main$ebnf$1$subexpression$1$subexpression$1",
          "_",
          "newline",
        ],
      },
      {
        name: "main$ebnf$1",
        symbols: ["main$ebnf$1", "main$ebnf$1$subexpression$1"],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      { name: "main$ebnf$2", symbols: ["newline"], postprocess: id },
      {
        name: "main$ebnf$2",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "main",
        symbols: ["_", "main$ebnf$1", "expression", "main$ebnf$2"],
        postprocess: ([_, bindings, expression]) => ({
          type: "Main",
          bindings: bindings
            .map((b) => b.flat()[0])
            .filter((b) => b.type !== "Whitespace"),
          expression,
        }),
      },
      {
        name: "binding$string$1",
        symbols: [
          { literal: "b" },
          { literal: "i" },
          { literal: "n" },
          { literal: "d" },
        ],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "binding$string$2",
        symbols: [{ literal: "t" }, { literal: "o" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "binding$string$3",
        symbols: [{ literal: "i" }, { literal: "n" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "binding",
        symbols: [
          "binding$string$1",
          "__",
          "identifier",
          "__",
          "binding$string$2",
          "__",
          "expression",
          "__",
          "binding$string$3",
        ],
        postprocess: ([_bind, _sp1, name, _sp2, _to, _sp3, expr, _in]) => {
          // Note: 'name' is an Identifier object.
          return {
            type: "Binding",
            name: name.name,
            value: expr,
          };
        },
      },
      { name: "function_literal$subexpression$1$ebnf$1", symbols: [] },
      {
        name: "function_literal$subexpression$1$ebnf$1$subexpression$1",
        symbols: ["__", "parameter"],
      },
      {
        name: "function_literal$subexpression$1$ebnf$1",
        symbols: [
          "function_literal$subexpression$1$ebnf$1",
          "function_literal$subexpression$1$ebnf$1$subexpression$1",
        ],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "function_literal$subexpression$1",
        symbols: ["parameter", "function_literal$subexpression$1$ebnf$1"],
      },
      {
        name: "function_literal$string$1",
        symbols: [{ literal: "-" }, { literal: ">" }],
        postprocess: function joiner(d) {
          return d.join("");
        },
      },
      {
        name: "function_literal",
        symbols: [
          { literal: "[" },
          "_",
          "function_literal$subexpression$1",
          "_",
          { literal: "]" },
          "_",
          "function_literal$string$1",
          "_",
          "expression",
        ],
        postprocess: ([
          _b1,
          _sp1,
          params,
          _sp2,
          _b2,
          _s3,
          _arrow,
          _s2,
          body,
        ]) => {
          // 'params' is of the form [first, [__, second], [__, third], ...].
          // Flatten it so that we end up with an array of Parameter objects.
          let paramList = [];
          if (Array.isArray(params)) {
            paramList.push(params[0]);
            for (let i = 1; i < params.length; i++) {
              // Each subsequent element is an array like [whitespace, parameter]
              if (Array.isArray(params[i]) && params[i].length >= 2) {
                paramList.push(params[i][1]);
              }
            }
          } else {
            paramList = [params];
          }
          return {
            type: "FunctionLiteral",
            params: paramList,
            body: body,
          };
        },
      },
      { name: "parameter$ebnf$1", symbols: [/[a-z_]/] },
      {
        name: "parameter$ebnf$1",
        symbols: ["parameter$ebnf$1", /[a-z_]/],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "parameter",
        symbols: ["parameter$ebnf$1"],
        postprocess: ([chars]) => ({ type: "Parameter", name: chars.join("") }),
      },
      { name: "expression", symbols: ["function_call"] },
      { name: "expression", symbols: ["function_literal"] },
      { name: "expression", symbols: ["integer"] },
      {
        name: "expression",
        symbols: ["identifier"],
        postprocess: ([exp]) => exp,
      },
      { name: "function_call$ebnf$1", symbols: [] },
      {
        name: "function_call$ebnf$1$subexpression$1",
        symbols: ["__", "expression"],
      },
      {
        name: "function_call$ebnf$1",
        symbols: [
          "function_call$ebnf$1",
          "function_call$ebnf$1$subexpression$1",
        ],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "function_call",
        symbols: [
          { literal: "(" },
          "_",
          "identifier",
          "function_call$ebnf$1",
          "_",
          { literal: ")" },
        ],
        postprocess: ([, , callee, rest]) => {
          const args = rest.map((r) => r[1]);
          return {
            type: "Call",
            callee: callee,
            arguments: args,
          };
        },
      },
      { name: "identifier$ebnf$1", symbols: [/[a-zA-Z_?]/] },
      {
        name: "identifier$ebnf$1",
        symbols: ["identifier$ebnf$1", /[a-zA-Z_?]/],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "identifier",
        symbols: ["identifier$ebnf$1"],
        postprocess: ([chars]) => ({
          type: "Identifier",
          name: chars.join(""),
        }),
      },
      {
        name: "integer",
        symbols: [{ literal: "1" }],
        postprocess: ([d]) => ({ type: "Integer", value: parseInt(d, 10) }),
      },
      { name: "comment$ebnf$1", symbols: [] },
      {
        name: "comment$ebnf$1",
        symbols: ["comment$ebnf$1", /[^\n]/],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "comment",
        symbols: [{ literal: "#" }, "comment$ebnf$1"],
        postprocess: () => ({ type: "Whitespace" }),
      },
      { name: "whitespace", symbols: [/[ \t]/] },
      { name: "whitespace", symbols: ["comment"] },
      { name: "_$ebnf$1", symbols: [] },
      {
        name: "_$ebnf$1",
        symbols: ["_$ebnf$1", "whitespace"],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "_",
        symbols: ["_$ebnf$1"],
        postprocess: () => ({ type: "Whitespace" }),
      },
      { name: "__$ebnf$1", symbols: ["whitespace"] },
      {
        name: "__$ebnf$1",
        symbols: ["__$ebnf$1", "whitespace"],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "__",
        symbols: ["__$ebnf$1"],
        postprocess: () => ({ type: "Whitespace" }),
      },
      { name: "newline$ebnf$1", symbols: [{ literal: "\n" }] },
      {
        name: "newline$ebnf$1",
        symbols: ["newline$ebnf$1", { literal: "\n" }],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "newline",
        symbols: ["_", "newline$ebnf$1", "_"],
        postprocess: () => ({ type: "Whitespace" }),
      },
    ],
    ParserStart: "main",
  };
  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();
