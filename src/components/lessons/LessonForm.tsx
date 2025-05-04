import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTranslation } from 'react-i18next';

const imageHandler = (quillRef: React.RefObject<ReactQuill>) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const quill = quillRef.current?.getEditor();
          if (!quill) return;

          const range = quill.getSelection() || {
            index: quill.getLength(),
            length: 0,
          };

          quill.insertEmbed(range.index, 'image', e.target?.result);

          quill.setSelection(range.index + 1, 0);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };
};

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['image'],
      ['clean'],
    ],
  },
};

interface LessonFormProps {
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    id?: string;
    title: string;
    content: string;
  };
  isEdit?: boolean;
}

const LessonForm: React.FC<LessonFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [submitting, setSubmitting] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');

      toolbar.addHandler('image', () => {
        imageHandler(quillRef);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ title, content });
    } catch (error) {
      console.error('Error submitting lesson:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          {isEdit
            ? t('courses.content.editLesson')
            : t('courses.content.createNewLesson')}
        </h2>
        <p className="text-muted-foreground">
          {isEdit
            ? t('courses.content.updateYourLessonContent')
            : t('courses.content.addNewLesson')}
        </p>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          {t('courses.content.lessonTitle')}
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('courses.content.enterLessonTitle')}
          required
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">
          {t('courses.content.lessonContent')}
        </label>
        <div className="rounded-md border">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder={t('courses.content.lessonPlaceholder')}
            style={{ height: '300px', background: 'white' }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          <ImageIcon className="mr-1 inline-block h-3 w-3" />
          {t('courses.content.tip')}
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('courses.content.cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          <Save size={16} className="mr-1" />
          {isEdit
            ? t('courses.content.updateLesson')
            : t('courses.content.createLesson')}
        </Button>
      </div>
    </form>
  );
};

export default LessonForm;
