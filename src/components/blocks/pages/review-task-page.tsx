import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

export function ReviewTaskPage({ onBack }: { onBack?: () => void }) {
  const { t } = useI18n()
  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-6 animate-app-rise">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('reviewTask.title')}</h1>
        {onBack && <Button variant="ghost" size="sm" onClick={onBack}>{t('common.back')}</Button>}
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('reviewTask.identity')}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div><strong>{t('reviewTask.titleLabel')}</strong> {t('reviewTask.placeholderTitle')}</div>
            <div><strong>{t('reviewTask.statusLabel')}</strong> pending</div>
            <div><strong>{t('reviewTask.ownerLabel')}</strong> {t('reviewTask.placeholderOwner')}</div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('reviewTask.briefing')}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t('reviewTask.placeholderBriefing')}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('reviewTask.team')}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t('reviewTask.placeholderAssignees')}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">{t('reviewTask.reviewers')}</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t('reviewTask.placeholderReviewers')}</CardContent>
        </Card>
      </div>
    </div>
  )
}
