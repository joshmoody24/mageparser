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
const DSL_HEADER = `# The only primitives are subtract, sign, and one.
# Everything else must be defined in terms of these primitives.

bind zero to (subtract one one) in
bind negative to [x] -> (subtract zero x) in
bind add to [x y] -> (subtract x (negative y)) in

bind next to [x] -> (add x one) in
bind prev to [x] -> (subtract x one) in

bind two to (next one) in
bind three to (next two) in
bind four to (next three) in
bind five to (next four) in
bind six to (next five) in
bind seven to (next six) in
bind eight to (next seven) in
bind nine to (next eight) in
bind ten to (next nine) in

bind true to one in
bind false to zero in

bind zero? to [x] -> (if x zero one) in
bind multiply to [x y] -> (if (or (zero? x) (zero? y)) zero (if (gt? y zero) (add x (multiply x (subtract y one))) (subtract (multiply x (add y one)) x))) in
bind abs to [x] -> (if (lt? x zero) (negative x) x) in
bind truthy? to [x] -> (abs (sign x)) in
bind not to zero? in
bind falsy? to not in

bind and to [x y] -> (multiply (truthy? x) (truthy? y)) in
bind or to [x y] -> (truthy? (add (truthy? x) (truthy? y))) in
bind xor to [x y] -> (subtract (or x y) (and x y)) in

bind eq? to [x y] -> (zero? (subtract x y)) in
bind gt? to [x y] -> (eq? (sign (subtract x y)) one) in
bind gte? to [x y] -> (or (gt? x y) (eq? x y)) in
bind lt? to [x y] -> (eq? (sign (subtract x y)) (negative one)) in
bind lte? to [x y] -> (or (lt? x y) (eq? x y)) in

bind power to [x y] -> (if (lte? y zero) one (multiply x (power x (subtract y one)))) in

bind div-helper to [x y] -> (if (lt? x y) zero (next (div-helper (subtract x y) y))) in
bind div to [x y] -> (if (eq? y zero) zero (multiply (div-helper (abs x) (abs y)) (if (eq? (multiply (sign x) (sign y)) one) one (negative one)))) in
`;

// ----------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Test Suite
// ----------------------------------------------------------------------
describe("DSL Primitive Numbers", () => {
  test("one equals 1", () => {
    expect(run(DSL_HEADER + "\none")).toBe(1);
  });

  test("zero equals 0", () => {
    expect(run(DSL_HEADER + "\nzero")).toBe(0);
  });

  test("two equals 2", () => {
    expect(run(DSL_HEADER + "\ntwo")).toBe(2);
  });

  test("three equals 3", () => {
    expect(run(DSL_HEADER + "\nthree")).toBe(3);
  });

  test("four equals 4", () => {
    expect(run(DSL_HEADER + "\nfour")).toBe(4);
  });

  test("five equals 5", () => {
    expect(run(DSL_HEADER + "\nfive")).toBe(5);
  });

  // Assume that the DSL defines numbers up to ten.
  test("six equals 6", () => {
    expect(run(DSL_HEADER + "\nsix")).toBe(6);
  });

  test("seven equals 7", () => {
    expect(run(DSL_HEADER + "\nseven")).toBe(7);
  });

  test("eight equals 8", () => {
    expect(run(DSL_HEADER + "\neight")).toBe(8);
  });

  test("nine equals 9", () => {
    expect(run(DSL_HEADER + "\nnine")).toBe(9);
  });

  test("ten equals 10", () => {
    expect(run(DSL_HEADER + "\nten")).toBe(10);
  });
});

describe("Built-in Functions", () => {
  // Tests for subtract, sign, and if.
  test("five minus three equals 2", () => {
    expect(run(DSL_HEADER + "\n(subtract five three)")).toBe(2);
  });

  test("three minus five equals -2", () => {
    expect(run(DSL_HEADER + "\n(subtract three five)")).toBe(-2);
  });

  test("five minus five equals 0", () => {
    expect(run(DSL_HEADER + "\n(subtract five five)")).toBe(0);
  });

  test("sign of five equals 1", () => {
    expect(run(DSL_HEADER + "\n(sign five)")).toBe(1);
  });

  test("sign of zero equals 0", () => {
    expect(run(DSL_HEADER + "\n(sign zero)")).toBe(0);
  });

  test("sign of (negative three) equals -1", () => {
    expect(run(DSL_HEADER + "\n(sign (negative three))")).toBe(-1);
  });

  test("if with true returns first branch", () => {
    expect(run(DSL_HEADER + "\n(if true three four)")).toBe(3);
  });

  test("if with false returns second branch", () => {
    expect(run(DSL_HEADER + "\n(if false three four)")).toBe(4);
  });

  test("if with nonzero condition returns first branch", () => {
    expect(run(DSL_HEADER + "\n(if five seven eight)")).toBe(7);
  });

  test("if with zero condition returns second branch", () => {
    expect(run(DSL_HEADER + "\n(if zero seven eight)")).toBe(8);
  });
});

describe("Derived Functions", () => {
  // negative
  test("negative three equals -3", () => {
    expect(run(DSL_HEADER + "\n(negative three)")).toBe(-3);
  });

  // add
  test("two plus three equals 5", () => {
    expect(run(DSL_HEADER + "\n(add two three)")).toBe(5);
  });

  // next and prev
  test("next of one equals 2", () => {
    expect(run(DSL_HEADER + "\n(next one)")).toBe(2);
  });

  test("prev of one equals 0", () => {
    expect(run(DSL_HEADER + "\n(prev one)")).toBe(0);
  });

  // zero?
  test("zero? of zero is true", () => {
    expect(run(DSL_HEADER + "\n(zero? zero)")).toBe(1);
  });

  test("zero? of two is false", () => {
    expect(run(DSL_HEADER + "\n(zero? two)")).toBe(0);
  });

  // multiply
  test("two multiplied by three equals six", () => {
    expect(run(DSL_HEADER + "\n(multiply two three)")).toBe(6);
  });

  test("negative one multiplied by three equals -3", () => {
    expect(run(DSL_HEADER + "\n(multiply (negative one) three)")).toBe(-3);
  });

  test("two multiplied by negative two equals -4", () => {
    expect(run(DSL_HEADER + "\n(multiply two (negative two))")).toBe(-4);
  });

  // abs
  test("absolute value of three is three", () => {
    expect(run(DSL_HEADER + "\n(abs three)")).toBe(3);
  });

  test("absolute value of negative two is two", () => {
    expect(run(DSL_HEADER + "\n(abs (negative two))")).toBe(2);
  });

  test("absolute value of zero is zero", () => {
    expect(run(DSL_HEADER + "\n(abs zero)")).toBe(0);
  });

  // truthy? and falsy?
  test("truthy? of three is true", () => {
    expect(run(DSL_HEADER + "\n(truthy? three)")).toBe(1);
  });

  test("truthy? of zero is false", () => {
    expect(run(DSL_HEADER + "\n(truthy? zero)")).toBe(0);
  });

  test("not of true equals false", () => {
    expect(run(DSL_HEADER + "\n(not true)")).toBe(0);
  });

  test("not of false equals true", () => {
    expect(run(DSL_HEADER + "\n(not false)")).toBe(1);
  });

  test("falsy? of zero equals true", () => {
    expect(run(DSL_HEADER + "\n(falsy? zero)")).toBe(1);
  });

  test("falsy? of three equals false", () => {
    expect(run(DSL_HEADER + "\n(falsy? three)")).toBe(0);
  });

  // Logical operations: and, or, xor
  test("and of true and true equals true", () => {
    expect(run(DSL_HEADER + "\n(and true true)")).toBe(1);
  });

  test("and of true and false equals false", () => {
    expect(run(DSL_HEADER + "\n(and true false)")).toBe(0);
  });

  test("or of false and true equals true", () => {
    expect(run(DSL_HEADER + "\n(or false true)")).toBe(1);
  });

  test("or of false and false equals false", () => {
    expect(run(DSL_HEADER + "\n(or false false)")).toBe(0);
  });

  test("xor of true and false equals true", () => {
    expect(run(DSL_HEADER + "\n(xor true false)")).toBe(1);
  });

  test("xor of true and true equals false", () => {
    expect(run(DSL_HEADER + "\n(xor true true)")).toBe(0);
  });

  test("xor of false and false equals false", () => {
    expect(run(DSL_HEADER + "\n(xor false false)")).toBe(0);
  });

  // Comparison operations
  test("2 equals 2 is true", () => {
    expect(run(DSL_HEADER + "\n(eq? two two)")).toBe(1);
  });

  test("2 equals 3 is false", () => {
    expect(run(DSL_HEADER + "\n(eq? two three)")).toBe(0);
  });

  test("3 is greater than 2", () => {
    expect(run(DSL_HEADER + "\n(gt? three two)")).toBe(1);
  });

  test("2 is not greater than 3", () => {
    expect(run(DSL_HEADER + "\n(gt? two three)")).toBe(0);
  });

  test("3 is greater than or equal to 3", () => {
    expect(run(DSL_HEADER + "\n(gte? three three)")).toBe(1);
  });

  test("3 is greater than or equal to 2", () => {
    expect(run(DSL_HEADER + "\n(gte? three two)")).toBe(1);
  });

  test("2 is not greater than or equal to 3", () => {
    expect(run(DSL_HEADER + "\n(gte? two three)")).toBe(0);
  });

  test("2 is less than 3", () => {
    expect(run(DSL_HEADER + "\n(lt? two three)")).toBe(1);
  });

  test("3 is not less than 2", () => {
    expect(run(DSL_HEADER + "\n(lt? three two)")).toBe(0);
  });

  test("3 is less than or equal to 3", () => {
    expect(run(DSL_HEADER + "\n(lte? three three)")).toBe(1);
  });

  test("2 is less than or equal to 3", () => {
    expect(run(DSL_HEADER + "\n(lte? two three)")).toBe(1);
  });

  test("3 is not less than or equal to 2", () => {
    expect(run(DSL_HEADER + "\n(lte? three two)")).toBe(0);
  });

  // Exponentiation
  test("3 raised to the power of 2 equals 9", () => {
    expect(run(DSL_HEADER + "\n(power three two)")).toBe(9);
  });

  test("3 raised to the power of 0 equals 1", () => {
    expect(run(DSL_HEADER + "\n(power three zero)")).toBe(1);
  });

  test("2 raised to the power of 3 equals 8", () => {
    expect(run(DSL_HEADER + "\n(power two three)")).toBe(8);
  });

  // Integer Division (expected to perform truncating division)
  test("5 divided by 2 equals 2", () => {
    expect(run(DSL_HEADER + "\n(div five two)")).toBe(2);
  });

  test("10 divided by 2 equals 5", () => {
    expect(run(DSL_HEADER + "\n(div ten two)")).toBe(5);
  });

  test("7 divided by 3 equals 2", () => {
    expect(run(DSL_HEADER + "\n(div seven three)")).toBe(2);
  });

  test("5 divided by 1 equals 5", () => {
    expect(run(DSL_HEADER + "\n(div five one)")).toBe(5);
  });

  test("negative 5 divided by 2 equals -2", () => {
    expect(run(DSL_HEADER + "\n(div (negative five) two)")).toBe(-2);
  });

  test("5 divided by negative 2 equals -2", () => {
    expect(run(DSL_HEADER + "\n(div five (negative two))")).toBe(-2);
  });
});
