// interpreter.js

// A set of built-in function names.
const BUILTINS = new Set(["add", "mul", "sign", "neg"]);

// Evaluate an AST node in a given environment.
function evaluate(node, env) {
  // If node is an array, try to evaluate its first meaningful element.
  if (Array.isArray(node)) {
    return evaluate(node[0], env);
  }

  // If node is not an object, return it directly.
  if (typeof node !== "object" || node === null) {
    return node;
  }

  // Dispatch based on node type.
  switch (node.type) {
    case "Main": {
      // The Main node holds an array of binding (or comment) groups and a final expression.
      for (let item of node.bindings) {
        let bindingCandidate = Array.isArray(item) ? item[0] : item;
        if (bindingCandidate && bindingCandidate.type === "Binding") {
          // Prevent rebinding of built-in names.
          if (BUILTINS.has(bindingCandidate.name)) {
            throw new Error(
              "Cannot rebind built-in function: " + bindingCandidate.name,
            );
          }
          // Evaluate the binding's value and store it in the environment.
          env[bindingCandidate.name] = evaluate(bindingCandidate.value, env);
        }
      }
      // Evaluate the main expression in the updated environment.
      return evaluate(node.expression, env);
    }

    case "Binding": {
      // Should not be evaluated directly (handled by Main) but we provide a fallback.
      return evaluate(node.value, env);
    }

    case "Identifier": {
      // Look up the identifier in the current environment.
      if (node.name in env) {
        return env[node.name];
      } else {
        throw new Error(
          "Undefined identifier: " +
            node.name +
            ". Environment: " +
            JSON.stringify(env, null, 4),
        );
      }
    }

    case "Integer": {
      return node.value;
    }

    case "FunctionLiteral": {
      // Extract the parameter names.
      const params = node.params;
      const body = node.body;
      const closure = function (...args) {
        if (args.length !== params.length) {
          throw new Error(
            "Expected " + params.length + " arguments, but got " + args.length,
          );
        }
        // Create a new environment that inherits from the closure's environment.
        const localEnv = {
          ...env,
        };
        // Bind each parameter to its corresponding argument.
        for (let i = 0; i < params.length; i++) {
          // Prevent using built-in names as parameter names.
          if (BUILTINS.has(params[i])) {
            throw new Error(
              "Cannot bind parameter with built-in name: " + params[i],
            );
          }
          localEnv[params[i]] = args[i];
        }
        // Evaluate the function body in the new environment.
        return evaluate(body, localEnv);
      };
      // Mark the closure so that we know it is a function.
      closure.__isFunction = true;
      return closure;
    }

    // We ignore whitespace nodes.
    case "Whitespace":
      return null;

    case "Call": {
      // Evaluate the callee. According to the grammar, it is an Identifier.
      const func = evaluate(node.callee, env);
      if (typeof func !== "function") {
        throw new Error(
          "Attempted to call a non-function: " +
            (node.callee.name || "unknown"),
        );
      }
      // Evaluate each argument.
      const argValues = node.arguments.map((arg) => evaluate(arg, env));
      // Call the function with the evaluated arguments.
      return func(...argValues);
    }

    default:
      throw new Error("Unknown node type: " + node.type);
  }
}

// The exported interpret function initializes an empty environment,
// adds built-in functions (non-rebindable), evaluates the AST, and returns the result.
export default function interpret(ast) {
  // Create an empty environment.
  const env = Object.create(null);

  // Add built-in functions as non-rebindable properties.
  Object.defineProperty(env, "add", {
    value: (a, b) => a + b,
    writable: false,
    configurable: false,
    enumerable: true,
  });
  Object.defineProperty(env, "mul", {
    value: (a, b) => a * b,
    writable: false,
    configurable: false,
    enumerable: true,
  });
  Object.defineProperty(env, "sign", {
    value: (a) => (a > 0 ? 1 : a < 0 ? -1 : 0),
    writable: false,
    configurable: false,
    enumerable: true,
  });
  Object.defineProperty(env, "neg", {
    value: (a) => a * -1,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  return evaluate(ast, env);
}
