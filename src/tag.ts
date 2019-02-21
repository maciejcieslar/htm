import { Token, trimWhitespaceTokens } from './token';
import { Content } from './content';
import { Stream } from './stream';
import { HElement } from './element';

export class Tag {
  public isOpeningTag: boolean = false;
  public isClosingTag: boolean = false;
  public isSelfClosingTag: boolean = false;
  public isComponentClosingTag: boolean = false;
  public isComponentOpeningTag: boolean = false;

  public constructor(public content: Token[]) {
    const tokens = trimWhitespaceTokens(content);

    if (tokens.length === 2 && tokens[0].value === '/' && tokens[1].value === '/') {
      this.isComponentClosingTag = true;

      return this;
    }

    if (tokens[tokens.length - 1].value === '/') {
      this.content = this.content.slice(0, -1);
      this.isSelfClosingTag = true;

      return this;
    }

    if (tokens[0].value === '/') {
      this.isClosingTag = true;

      return this;
    }

    if (typeof tokens[0].value === 'function') {
      this.isComponentOpeningTag = true;

      return this;
    }

    this.isOpeningTag = true;

    return this;
  }
}

export function findMatchForTag(element: Tag, stream: Stream<Tag | Content>) {
  const children: (HElement | string)[] = [];

  if (element.isSelfClosingTag) {
    return HElement.fromTag(element, children);
  }

  while (!stream.isFinished()) {
    const nextElement = stream.next();

    if (nextElement instanceof Content) {
      children.push(...HElement.fromContent(nextElement));

      continue;
    }

    if (element.isComponentOpeningTag && nextElement.isComponentClosingTag) {
      break;
    }

    if (element.isOpeningTag && nextElement.isClosingTag) {
      break;
    }

    children.push(findMatchForTag(nextElement, stream));
  }

  return HElement.fromTag(element, children);
}

export function createTagStructure(elements: (Tag | Content)[]): HElement {
  const stream = new Stream(elements);

  while (!stream.isFinished()) {
    const element = stream.next();

    if (element instanceof Content) {
      continue;
    }

    return findMatchForTag(element, stream);
  }

  throw new Error('No tags found');
}

export function matchTags(tokens: Token[]) {
  const c = [...tokens];

  let buffer: Token[] = [];
  const results: (Tag | Content)[] = [];

  while (c.length) {
    const token = c.shift() as Token;

    if (token.isClosingTag) {
      results.push(new Tag(buffer));
      buffer = [];

      continue;
    }

    if (token.isOpeningTag) {
      if (buffer.length) {
        results.push(new Content(buffer));
      }

      buffer = [];

      continue;
    }

    buffer.push(token);
  }

  return results;
}
