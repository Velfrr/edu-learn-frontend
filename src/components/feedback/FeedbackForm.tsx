import { useForm } from 'react-hook-form';
import { feedbackSchema } from '@/schemas/feedback';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { FeedbackType } from '@/enums/feedback-types';
import { useAuth } from '@/contexts/AuthContext';
import { submitFeedback } from '@/api/feedback';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const FeedbackForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackSchema = z.object({
    subject: z
      .string()
      .min(3, t('feedback.validation.subjectMin'))
      .max(100, t('feedback.validation.subjectMax')),
    type: z.nativeEnum(FeedbackType),
    message: z
      .string()
      .min(10, t('feedback.validation.messageMin'))
      .max(1000, t('feedback.validation.subjectMax')),
  });

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      subject: '',
      type: FeedbackType.GENERAL,
      message: '',
    },
  });

  async function onSubmit(values: FeedbackFormValues) {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await submitFeedback(
        user.id,
        values.subject,
        values.type as FeedbackType,
        values.message,
      );

      if (error) throw error;

      toast({
        title: t('feedback.success.title'),
        description: t('feedback.success.description'),
      });

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: t('feedback.error.title'),
        description: t('feedback.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t('feedback.submitFeedback')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('feedback.submitFeedback')}</DialogTitle>
          <DialogDescription>{t('feedback.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.subject')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('feedback.subjectPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.feedbackType')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('feedback.selectType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={FeedbackType.BUG}>
                        {t('feedback.types.bug')}
                      </SelectItem>
                      <SelectItem value={FeedbackType.FEATURE_REQUEST}>
                        {t('feedback.types.feature_request')}
                      </SelectItem>
                      <SelectItem value={FeedbackType.GENERAL}>
                        {t('feedback.types.general')}
                      </SelectItem>
                      <SelectItem value={FeedbackType.SUPPORT}>
                        {t('feedback.types.support')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('feedback.message')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('feedback.messagePlaceholder')}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.submitting') : t('feedback.submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
