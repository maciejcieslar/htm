export class Token {
  public isOpeningTag: boolean = false;
  public isClosingTag: boolean = false;

  public constructor(public type: string, public value: string) {
    if (type !== 'string') {
      return this;
    }

    this.isClosingTag = value === '>';
    this.isOpeningTag = value === '<';

    return this;
  }
}

export function trimWhitespaceTokens(tokens: Token[]) {
  let startingTokens = 0;
  let endingTokens = 0;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (token.value === ' ' || token.value === '\n') {
      startingTokens += 1;
    } else {
      break;
    }
  }

  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    const token = tokens[i];

    if (token.value === ' ' || token.value === '\n') {
      endingTokens += 1;
    } else {
      break;
    }
  }

  if (!endingTokens) {
    return tokens.slice(startingTokens);
  }

  return tokens.slice(startingTokens).slice(0, -1 * endingTokens);
}

export function isWhitespaceToken(token: Token) {
  return token.value === ' ' || token.value === '\n';
}

export function takeTokensUntilWhitespace(tokens: Token[]) {
  const results: Token[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (isWhitespaceToken(token)) {
      return results;
    }

    results.push(token);
  }

  return results;
}

export function groupTokenWords(tokens: Token[]) {
  const results: Token[][] = [];

  let ts: Token[] = [];
  let isInsideString = false;

  tokens.forEach((token) => {
    if (!isInsideString && isWhitespaceToken(token)) {
      if (ts.length) {
        results.push(ts);
      }

      ts = [];

      return null;
    }

    if (token.value === '"' && isInsideString) {
      isInsideString = false;
    } else if (token.value === '"') {
      isInsideString = true;
    }

    ts.push(token);

    return null;
  });

  if (isInsideString) {
    throw new Error('String not closed');
  }

  if (ts.length) {
    results.push(ts);
  }

  return results;
}

export function parseTokenWord(tokenWord: Token[]): { key: string; value: any }[] {
  const equalSignTokenIndex = tokenWord.findIndex((t) => t.value === '=');

  if (equalSignTokenIndex === -1) {
    if (
      tokenWord
        .slice(0, 3)
        .map((t) => t.value)
        .join('') === '...' &&
      tokenWord.length === 4 &&
      typeof tokenWord[3].value === 'object'
    ) {
      const obj = tokenWord[3].value;

      return Object.keys(obj).map((key) => {
        return {
          key,
          value: obj[key],
        };
      });
    }

    return [
      {
        key: tokenWord.map((t) => t.value).join(''),
        value: true,
      },
    ];
  }

  const keyTokens = tokenWord.slice(0, equalSignTokenIndex);
  const valueTokens = tokenWord.slice(equalSignTokenIndex + 1);

  let value = null;

  if (valueTokens.length === 1 && valueTokens[0].type === 'value') {
    value = valueTokens[0].value;
  } else {
    value = valueTokens.map((t) => t.value).join('');

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1).slice(0, -1);
    }
  }

  const key = keyTokens.map((t) => t.value).join('');

  return [
    {
      value,
      key,
    },
  ];
}

export function parsePropsFromTokens(tokens: Token[]) {
  if (!tokens.length) {
    return null;
  }

  return (
    groupTokenWords(tokens)
      .map(parseTokenWord)
      .reduce((props, keysAndValues) => {
        const obj = keysAndValues.reduce((result, { key, value }) => {
          return {
            ...result,
            [key]: value,
          };
        }, {});

        return {
          ...props,
          ...obj,
        };
      }, {}) || null
  );
}
