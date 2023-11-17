/**
 * @since 20180830 16:08
 * @author ___xy
 */

const binaryOperatorPrecedences = {
  '**': 15,
  '*': 14,
  '/': 14,
  '%': 14,
  '+': 13,
  '-': 13,
  '<<': 12,
  '>>': 12,
  '>>>': 12,
  '<': 11,
  '<=': 11,
  '>': 11,
  '>=': 11,
  in: 11,
  instanceof: 11,
  '==': 10,
  '!=': 10,
  '===': 10,
  '!==': 10,
  '&': 9,
  '^': 8,
  '|': 7,
  '&&': 6,
  '||': 5,
};

module.exports = binaryOperatorPrecedences;
