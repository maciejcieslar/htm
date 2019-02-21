import { Token } from './token';
import { createTagStructure, matchTags } from './tag';
import { RenderFn } from './element';

export function bind(fn: RenderFn) {
  return function html(contents: TemplateStringsArray, ...fragments: any[]) {
    const tokens: Token[] = [];

    contents.forEach((value, index) => {
      value.split('').forEach((content) => {
        tokens.push(new Token('string', content));
      });

      if (fragments.length === index && !fragments[index]) {
        return null;
      }

      tokens.push(new Token('value', fragments[index]));
    });

    return createTagStructure(matchTags(tokens)).render(fn);
  };
}
