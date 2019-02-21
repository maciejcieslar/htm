import { takeTokensUntilWhitespace, parsePropsFromTokens } from './token';
import { Content } from './content';
import { Tag } from './tag';
import { trimWithOneSpace } from './helpers';

export type RenderFn = (
  type: string | Function,
  props: object | null,
  ...children: HElement[]
) => any;

export class HElement {
  public constructor(
    public type: string,
    public props: object | null = null,
    public children: (HElement | string)[] = [],
  ) {}

  public static fromContent(content: Content) {
    const results: (HElement | string)[] = [];
    const tokens = content.content;
    let buffer = [];

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];

      if (token.type === 'string') {
        buffer.push(token.value);

        continue;
      }

      if (token.type === 'value') {
        if (buffer.length) {
          results.push(buffer.join(''));

          buffer = [];
        }

        results.push(token.value);
      }
    }

    if (buffer.length) {
      results.push(buffer.join(''));

      buffer = [];
    }

    return results
      .map((c) => {
        if (typeof c !== 'string') {
          return c;
        }

        return trimWithOneSpace(c);
      })
      .filter(Boolean);
  }

  public static fromTag(tag: Tag, children: (HElement | string)[]) {
    const tokens = tag.content;

    if (tokens[0].type === 'value') {
      if (typeof tokens[0].value === 'function') {
        // component
        return new HElement(tokens[0].value, parsePropsFromTokens(tokens.slice(1)), children);
      }

      throw new Error('Only function can be a component');
    }

    const tagNameTokens = takeTokensUntilWhitespace(tokens);
    const tagName = tagNameTokens.map((t) => t.value).join('');

    return new HElement(
      tagName,
      parsePropsFromTokens(tokens.slice(tagNameTokens.length)),
      children,
    );
  }

  public render(fn: RenderFn): any {
    return fn(
      this.type,
      this.props,
      ...this.children.map((childElement) => {
        if (!(childElement instanceof HElement)) {
          return childElement;
        }

        return childElement.render(fn);
      }),
    );
  }
}
