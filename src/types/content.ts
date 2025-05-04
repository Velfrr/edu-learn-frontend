import { Lesson } from './lesson';
import { Test } from './test';

export type ContentType = 'LESSON' | 'TEST';

export interface ContentItem {
  id: string;
  type: ContentType;
  order: number;
  data: Lesson | Test;
}
