import type { FieldType } from './types';

export function getHtmlFieldType(abstractType: FieldType) {
  switch (abstractType) {
    case 'text':
      return 'text';
    case 'pass':
      return 'password';
    default:
      return 'text';
  }
}
