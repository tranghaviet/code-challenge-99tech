import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./problem4.js";

const funcs = [sum_to_n_a, sum_to_n_b, sum_to_n_c];

describe("sum_to_n functions", () => {
  test("calculates sum of first n natural numbers", () => {
    funcs.forEach((func) => {
      expect(func(0)).toBe(0);
      expect(func(1)).toBe(1);
      expect(func(5)).toBe(15);
      expect(func(10)).toBe(55);
    });
  });
});
