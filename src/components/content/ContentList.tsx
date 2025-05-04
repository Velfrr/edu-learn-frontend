import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Trash2, Edit } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { useTranslation } from 'react-i18next';

interface ContentListProps {
  items: ContentItem[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
}

const ContentList: React.FC<ContentListProps> = ({
  items,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={item.id} className="relative">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {item.type === 'LESSON' ? t('lesson') : t('test')}
                </span>
                <h3 className="text-lg font-semibold">
                  {item.type === 'LESSON' ? item.data.title : item.data.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMoveDown(index)}
                disabled={index === items.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContentList;
