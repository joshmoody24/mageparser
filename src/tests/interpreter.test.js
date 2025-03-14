import { describe, expect, test } from "vitest";
import interpret from "../interpreter.js";
import parse from "../parser.js";

// Helper to run source code through the parser/interpreter.
function run(source) {
  return interpret(parse(source));
}

// ----------------------------------------------------------------------
// Shared DSL Definitions (Header)
// ----------------------------------------------------------------------
const DSL_HEADER = `# The only primitives are add, mul, sign, neg, and the integer 1.
# Everything else must be defined in terms of these primitives.

bind NEG_ONE to (neg 1) in
bind ZERO to (add 1 NEG_ONE) in
bind NEXT to [x] -> (add x 1) in
bind PREV to [x] -> (add x NEG_ONE) in
bind TWO to (NEXT 1) in
bind THREE to (NEXT TWO) in
bind FOUR to (NEXT THREE) in
bind FIVE to (NEXT FOUR) in


bind SUBTRACT to [x y] -> (add x (mul y NEG_ONE)) in
bind ABS to [x] -> (mul x (sign x)) in
bind TRUTHY? to [x] -> (ABS (sign x)) in
bind ZERO? to [x] -> (SUBTRACT 1 (TRUTHY? x)) in
bind NOT to ZERO? in
bind FALSY? to NOT in
bind TRUE to 1 in
bind FALSE to ZERO in
bind IF to [cond x y] -> (add (mul (TRUTHY? cond) x) (mul (FALSY? cond) y)) in
bind AND to [x y] -> (mul (TRUTHY? x) (TRUTHY? y)) in
bind OR to [x y] -> (add (TRUTHY? x) (TRUTHY? y)) in
bind XOR to [x y] -> (SUBTRACT (add (TRUTHY? x) (TRUTHY? y)) (mul (TRUTHY? x) (TRUTHY? y))) in
bind EQUALS? to [x y] -> (ZERO? (SUBTRACT x y)) in
bind NOT_EQUALS? to [x y] -> (NOT (EQUALS? x y)) in
bind GREATER_THAN? to [x y] -> (EQUALS? (sign (SUBTRACT x y)) 1) in
bind GREATER_THAN_OR_EQUAL_TO? to [x y] -> (OR (GREATER_THAN? x y) (EQUALS? x y)) in
bind LESS_THAN? to [x y] -> (EQUALS? (sign (SUBTRACT x y)) NEG_ONE) in
bind LESS_THAN_OR_EQUAL_TO? to [x y] -> (OR (LESS_THAN? x y) (EQUALS? x y)) in
bind POWER to [x y] -> (IF (LESS_THAN_OR_EQUAL_TO? y ZERO) 1 (mul x (POWER x (SUBTRACT y 1)))) in

bind POWER to [x y] ->  (mul    (IF (LESS_THAN_OR_EQUAL_TO? y ZERO) 1 x)    [] -> (IF (LESS_THAN_OR_EQUAL_TO? y ZERO) 1 (POWER x (SUBTRACT y 1)))) in
bind DIV to [x y] -> (IF (EQUALS? y ZERO) ZERO (IF (EQUALS? y 1) x (add (DIV x (SUBTRACT y 1)) 1))) in`;

// ----------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------

describe("Built-in Functions", () => {
  describe("add", () => {
    test("2 + 3 = 5", () => {
      expect(run(DSL_HEADER + "\n(add (NEXT 1) (NEXT (NEXT 1)))")).toBe(5);
    });
    test("(-2) + (-3) = -5", () => {
      expect(
        run(
          DSL_HEADER +
            "\n(add (PREV (PREV (PREV 1))) (PREV (PREV (PREV (PREV 1)))))",
        ),
      ).toBe(-5);
    });
    test("3 + (-1) = 2", () => {
      expect(run(DSL_HEADER + "\n(add (NEXT (NEXT 1)) (PREV (PREV 1)))")).toBe(
        2,
      );
    });
  });

  describe("mul", () => {
    test("2 * 3 = 6", () => {
      expect(run(DSL_HEADER + "\n(mul (NEXT 1) (NEXT (NEXT 1)))")).toBe(6);
    });
    test("(-1) * 3 = -3", () => {
      expect(run(DSL_HEADER + "\n(mul (PREV (PREV 1)) (NEXT (NEXT 1)))")).toBe(
        -3,
      );
    });
    test("2 * (-2) = -4", () => {
      expect(run(DSL_HEADER + "\n(mul (NEXT 1) (PREV (PREV (PREV 1))))")).toBe(
        -4,
      );
    });
  });

  describe("sign", () => {
    test("sign(3) = 1", () => {
      expect(run(DSL_HEADER + "\n(sign (NEXT (NEXT 1)))")).toBe(1);
    });
    test("sign(0) = 0", () => {
      expect(run(DSL_HEADER + "\n(sign (PREV 1))")).toBe(0);
    });
    test("sign(-2) = -1", () => {
      expect(run(DSL_HEADER + "\n(sign (PREV (PREV (PREV 1))))")).toBe(-1);
    });
  });

  describe("PREV", () => {
    test("PREV 1 = 0", () => {
      expect(run(DSL_HEADER + "\n(PREV 1)")).toBe(0);
    });
  });

  describe("next", () => {
    test("NEXT 1 = 2", () => {
      expect(run(DSL_HEADER + "\n(NEXT 1)")).toBe(2);
    });
  });
});

describe("Derived Functions", () => {
  describe("ZERO", () => {
    test("ZERO = 0", () => {
      expect(run(DSL_HEADER + "\nZERO")).toBe(0);
    });
  });

  describe("TWO", () => {
    test("TWO = 2", () => {
      expect(run(DSL_HEADER + "\nTWO")).toBe(2);
    });
  });

  describe("THREE", () => {
    test("THREE = 3", () => {
      expect(run(DSL_HEADER + "\nTHREE")).toBe(3);
    });
  });

  describe("FOUR", () => {
    test("FOUR = 4", () => {
      expect(run(DSL_HEADER + "\nFOUR")).toBe(4);
    });
  });

  describe("FIVE", () => {
    test("FIVE = 5", () => {
      expect(run(DSL_HEADER + "\nFIVE")).toBe(5);
    });
  });

  describe("NEG_ONE", () => {
    test("NEG_ONE = -1", () => {
      expect(run(DSL_HEADER + "\nNEG_ONE")).toBe(-1);
    });
  });

  describe("SUBTRACT", () => {
    test("3 - 2 = 1", () => {
      // (NEXT (NEXT 1)) → 3; (NEXT 1) → 2.
      expect(run(DSL_HEADER + "\n(SUBTRACT (NEXT (NEXT 1)) (NEXT 1))")).toBe(1);
    });
    test("-1 - 3 = -4", () => {
      expect(
        run(DSL_HEADER + "\n(SUBTRACT (PREV (PREV 1)) (NEXT (NEXT 1)))"),
      ).toBe(-4);
    });
  });

  describe("ABS", () => {
    test("ABS(3) = 3", () => {
      expect(run(DSL_HEADER + "\n(ABS (NEXT (NEXT 1)))")).toBe(3);
    });
    test("ABS(-2) = 2", () => {
      expect(run(DSL_HEADER + "\n(ABS (PREV (PREV (PREV 1))))")).toBe(2);
    });
    test("ABS(0) = 0", () => {
      expect(run(DSL_HEADER + "\n(ABS (PREV 1))")).toBe(0);
    });
  });

  describe("TRUTHY?", () => {
    test("TRUTHY?(3) = 1", () => {
      expect(run(DSL_HEADER + "\n(TRUTHY? (NEXT (NEXT 1)))")).toBe(1);
    });
    test("TRUTHY?(-1) = 1", () => {
      expect(run(DSL_HEADER + "\n(TRUTHY? (PREV (PREV 1)))")).toBe(1);
    });
    test("TRUTHY?(0) = 0", () => {
      expect(run(DSL_HEADER + "\n(TRUTHY? (PREV 1))")).toBe(0);
    });
  });

  describe("ZERO?", () => {
    test("ZERO?(2) = 0", () => {
      expect(run(DSL_HEADER + "\n(ZERO? (NEXT 1))")).toBe(0);
    });
    test("ZERO?(0) = 1", () => {
      expect(run(DSL_HEADER + "\n(ZERO? (PREV 1))")).toBe(1);
    });
  });

  describe("NOT", () => {
    test("NOT(2) = 0", () => {
      expect(run(DSL_HEADER + "\n(NOT (NEXT 1))")).toBe(0);
    });
    test("NOT(0) = 1", () => {
      expect(run(DSL_HEADER + "\n(NOT (PREV 1))")).toBe(1);
    });
  });

  describe("FALSY?", () => {
    test("FALSY?(2) = 0", () => {
      expect(run(DSL_HEADER + "\n(FALSY? (NEXT 1))")).toBe(0);
    });
    test("FALSY?(0) = 1", () => {
      expect(run(DSL_HEADER + "\n(FALSY? (PREV 1))")).toBe(1);
    });
  });

  describe("TRUE", () => {
    test("TRUE = 1", () => {
      expect(run(DSL_HEADER + "\nTRUE")).toBe(1);
    });
  });

  describe("FALSE", () => {
    test("FALSE = 0", () => {
      expect(run(DSL_HEADER + "\nFALSE")).toBe(0);
    });
  });

  describe("IF", () => {
    test("IF(true, THREE, FOUR) = THREE", () => {
      expect(run(DSL_HEADER + "\n(IF (NEXT 1) THREE FOUR)")).toBe(3);
    });
    test("IF(false, THREE, FOUR) = FOUR", () => {
      expect(run(DSL_HEADER + "\n(IF (PREV 1) THREE FOUR)")).toBe(4);
    });
  });

  describe("AND", () => {
    test("AND(true, true) = 1", () => {
      expect(run(DSL_HEADER + "\n(AND (NEXT 1) (NEXT 1))")).toBe(1);
    });
    test("AND(false, true) = 0", () => {
      expect(run(DSL_HEADER + "\n(AND (PREV 1) (NEXT 1))")).toBe(0);
    });
  });

  describe("OR", () => {
    test("OR(false, true) = 1", () => {
      expect(run(DSL_HEADER + "\n(OR (PREV 1) (NEXT 1))")).toBe(1);
    });
    test("OR(true, true) = 2", () => {
      expect(run(DSL_HEADER + "\n(OR (NEXT 1) (NEXT 1))")).toBe(2);
    });
    test("OR(false, false) = 0", () => {
      expect(run(DSL_HEADER + "\n(OR (PREV 1) (PREV 1))")).toBe(0);
    });
  });

  describe("XOR", () => {
    test("XOR(true, false) = 1", () => {
      expect(run(DSL_HEADER + "\n(XOR (NEXT 1) (PREV 1))")).toBe(1);
    });
    test("XOR(true, true) = 1", () => {
      expect(run(DSL_HEADER + "\n(XOR (NEXT 1) (NEXT 1))")).toBe(1);
    });
    test("XOR(false, false) = 0", () => {
      expect(run(DSL_HEADER + "\n(XOR (PREV 1) (PREV 1))")).toBe(0);
    });
  });

  describe("EQUALS?", () => {
    test("EQUALS?(2, 2) = 1", () => {
      expect(run(DSL_HEADER + "\n(EQUALS? (NEXT 1) (NEXT 1))")).toBe(1);
    });
    test("EQUALS?(2, 3) = 0", () => {
      expect(run(DSL_HEADER + "\n(EQUALS? (NEXT 1) (NEXT (NEXT 1)))")).toBe(0);
    });
  });

  describe("NOT_EQUALS?", () => {
    test("NOT_EQUALS?(2, 2) = 0", () => {
      expect(run(DSL_HEADER + "\n(NOT_EQUALS? (NEXT 1) (NEXT 1))")).toBe(0);
    });
    test("NOT_EQUALS?(2, 3) = 1", () => {
      expect(run(DSL_HEADER + "\n(NOT_EQUALS? (NEXT 1) (NEXT (NEXT 1)))")).toBe(
        1,
      );
    });
  });

  describe("GREATER_THAN?", () => {
    test("GREATER_THAN?(3, 2) = 1", () => {
      expect(
        run(DSL_HEADER + "\n(GREATER_THAN? (NEXT (NEXT 1)) (NEXT 1))"),
      ).toBe(1);
    });
    test("GREATER_THAN?(2, 3) = 0", () => {
      expect(
        run(DSL_HEADER + "\n(GREATER_THAN? (NEXT 1) (NEXT (NEXT 1)))"),
      ).toBe(0);
    });
    test("GREATER_THAN?(2, 2) = 0", () => {
      expect(run(DSL_HEADER + "\n(GREATER_THAN? (NEXT 1) (NEXT 1))")).toBe(0);
    });
  });

  describe("GREATER_THAN_OR_EQUAL_TO?", () => {
    test("GREATER_THAN_OR_EQUAL_TO?(3, 2) is truthy", () => {
      expect(
        run(
          DSL_HEADER + "\n(GREATER_THAN_OR_EQUAL_TO? (NEXT (NEXT 1)) (NEXT 1))",
        ) > 0,
      ).toBe(true);
    });
  });

  describe("LESS_THAN?", () => {
    test("LESS_THAN?(2, 3) = 1", () => {
      expect(run(DSL_HEADER + "\n(LESS_THAN? (NEXT 1) (NEXT (NEXT 1)))")).toBe(
        1,
      );
    });
    test("LESS_THAN?(3, 2) = 0", () => {
      expect(run(DSL_HEADER + "\n(LESS_THAN? (NEXT (NEXT 1)) (NEXT 1))")).toBe(
        0,
      );
    });
    test("LESS_THAN?(2, 2) = 0", () => {
      expect(run(DSL_HEADER + "\n(LESS_THAN? (NEXT 1) (NEXT 1))")).toBe(0);
    });
  });

  describe("LESS_THAN_OR_EQUAL_TO?", () => {
    test("LESS_THAN_OR_EQUAL_TO?(2, 3) is truthy", () => {
      expect(
        run(
          DSL_HEADER + "\n(LESS_THAN_OR_EQUAL_TO? (NEXT 1) (NEXT (NEXT 1)))",
        ) > 0,
      ).toBe(true);
    });
  });

  describe("POWER", () => {
    test("3^2 = 9", () => {
      expect(run(DSL_HEADER + "\n(POWER (NEXT (NEXT 1)) (NEXT 1))")).toBe(9);
    });
    test("3^0 = 1", () => {
      expect(run(DSL_HEADER + "\n(POWER (NEXT (NEXT 1)) (PREV 1))")).toBe(1);
    });
  });

  describe("DIV", () => {
    test("5 % 0 = 0", () => {
      expect(
        run(DSL_HEADER + "\n(DIV (NEXT (NEXT (NEXT (NEXT 1)))) ZERO)"),
      ).toBe(0);
    });
    test("5 % 1 = 1", () => {
      expect(
        run(DSL_HEADER + "\n(DIV (NEXT (NEXT (NEXT (NEXT 1)))) (NEXT 1))"),
      ).toBe(5);
    });
    test("5 % 2 = 2", () => {
      // Note: Here FIVE evaluates to 5 and TWO to 2.
      expect(run(DSL_HEADER + "\n(DIV FIVE TWO)")).toBe(6);
    });
  });
});
