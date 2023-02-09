import { traverse } from './traverse';

export function remapRefs(document: unknown, from: string, to: string): void {
  traverse(document, {
    onProperty({ property, propertyValue, parent }) {
      if (property !== '$ref') return;
      if (typeof propertyValue !== 'string') return;
      if (propertyValue.startsWith(from)) {
        (parent as { $ref: string }).$ref = `${to}${propertyValue.slice(from.length)}`;
      }
    },
  });
}
