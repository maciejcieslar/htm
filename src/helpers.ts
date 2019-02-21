export function trimWithOneSpace(input: string) {
  let leftTrim = 0;
  let rightTrim = 0;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (char !== ' ' && char !== '\n') {
      break;
    }

    leftTrim += 1;
  }

  for (let i = input.length - 1; i >= 0; i -= 1) {
    const char = input[i];

    if (char !== ' ' && char !== '\n') {
      break;
    }

    rightTrim += 1;
  }

  let output = input;

  if (leftTrim) {
    if (input[leftTrim - 1] === ' ') {
      leftTrim -= 1;
    }
  }

  if (rightTrim) {
    if (input[input.length - rightTrim] === ' ') {
      rightTrim -= 1;
    }
  }

  output = output.slice(leftTrim);

  if (rightTrim) {
    return output.slice(0, -1 * rightTrim);
  }

  return output;
}
