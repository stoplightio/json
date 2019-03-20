import { GetJsonPathForPosition } from '@stoplight/types';
import { findNodeAtOffset, getNodePath } from 'jsonc-parser';
import { IJsonASTNode } from './types';

export const getJsonPathForPosition: GetJsonPathForPosition<IJsonASTNode, Map<number, number>> = (
  { lineMap, ast },
  position
) => {
  const startOffset = lineMap.get(position.line);
  const endOffset = lineMap.get(position.line + 1);
  if (startOffset === undefined) {
    return;
  }

  const node = findNodeAtOffset(
    ast,
    endOffset === undefined ? startOffset + position.character : Math.min(endOffset, startOffset + position.character)
  );

  if (node === undefined) {
    return;
  }

  return getNodePath(node);
};
