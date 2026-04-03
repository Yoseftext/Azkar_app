/**
 * ====================================================================
 * MasbahaPage — صفحة المسبحة
 * ====================================================================
 * إصلاح BUG-V3-03:
 *   input كان uncontrolled (defaultValue) مما يعني أن تغيير currentTarget
 *   من مصدر خارجي لا يُحدّث ما يراه المستخدم.
 *   الآن: input controlled مع draftTarget محلي مُزامَن مع store.
 * ====================================================================
 */
import { useEffect, useMemo, useState } from 'react';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppChip } from '@/shared/ui/primitives/AppChip';
import { AppTextField } from '@/shared/ui/primitives/AppTextField';
import { StatTile } from '@/shared/ui/primitives/StatTile';
import { INPUT_CLASS } from '@/shared/ui/design/ui-classes';
import { cn } from '@/shared/lib/cn';
import {
  DEFAULT_MASBAHA_PHRASES,
  getMasbahaCurrentMonthCount,
  getMasbahaLast7DaysCount,
  getMasbahaTodayCount,
} from '@/features/masbaha/domain/masbaha-selectors';
import { buildMasbahaSessionHero, getMasbahaTargetPresets } from '@/features/masbaha/domain/masbaha-session-flow';
import { MasbahaSessionHero } from '@/features/masbaha/components/MasbahaSessionHero';
import { MasbahaTargetPresets } from '@/features/masbaha/components/MasbahaTargetPresets';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';

export function MasbahaPage() {
  const [draftPhrase, setDraftPhrase] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const isSilent = useMasbahaStore((s) => s.isSilent);
  const currentTarget = useMasbahaStore((s) => s.currentTarget);
  const currentSessionCount = useMasbahaStore((s) => s.currentSessionCount);
  const totalCount = useMasbahaStore((s) => s.totalCount);
  const selectedPhrase = useMasbahaStore((s) => s.selectedPhrase);
  const customPhrases = useMasbahaStore((s) => s.customPhrases);
  const dailyCounts = useMasbahaStore((s) => s.dailyCounts);
  const increment = useMasbahaStore((s) => s.increment);
  const resetSession = useMasbahaStore((s) => s.resetSession);
  const setTarget = useMasbahaStore((s) => s.setTarget);
  const toggleSilent = useMasbahaStore((s) => s.toggleSilent);
  const selectPhrase = useMasbahaStore((s) => s.selectPhrase);
  const addCustomPhrase = useMasbahaStore((s) => s.addCustomPhrase);
  const removeCustomPhrase = useMasbahaStore((s) => s.removeCustomPhrase);

  const [draftTarget, setDraftTarget] = useState(String(currentTarget));
  useEffect(() => {
    setDraftTarget(String(currentTarget));
  }, [currentTarget]);

  const todayCount = useMemo(() => getMasbahaTodayCount({ dailyCounts }), [dailyCounts]);
  const last7Days = useMemo(() => getMasbahaLast7DaysCount({ dailyCounts }), [dailyCounts]);
  const monthCount = useMemo(() => getMasbahaCurrentMonthCount({ dailyCounts }), [dailyCounts]);
  const phrases = [...DEFAULT_MASBAHA_PHRASES, ...customPhrases];
  const hero = useMemo(
    () => buildMasbahaSessionHero({ currentSessionCount, currentTarget, selectedPhrase, dailyCounts }),
    [currentSessionCount, currentTarget, selectedPhrase, dailyCounts],
  );
  const targetPresets = useMemo(() => getMasbahaTargetPresets(currentTarget), [currentTarget]);

  function handleTargetCommit() {
    const parsed = Number(draftTarget);
    const safe = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : currentTarget;
    setTarget(safe);
    setDraftTarget(String(safe));
  }

  function handleAddPhrase() {
    const result = addCustomPhrase(draftPhrase);
    if (result.ok) {
      setDraftPhrase('');
      setFeedback('تمت الإضافة بنجاح.');
      return;
    }
    setFeedback(result.error ?? 'تعذر إضافة الذكر.');
  }

  return (
    <div className="space-y-4">
      <MasbahaSessionHero hero={hero} canReset={currentSessionCount > 0} onIncrement={increment} onReset={resetSession} />

      <AppCard title="ملخص اليوم" subtitle="تابع التسبيح اليومي والجلسة الحالية دون تشتيت.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="جلسة العد" value={String(currentSessionCount)} hint={`الهدف ${currentTarget}`} variant="sky" />
          <StatTile label="تسبيح اليوم" value={String(todayCount)} hint="مجموع اليوم الحالي" variant="emerald" />
          <StatTile label="آخر 7 أيام" value={String(last7Days)} hint="نشاط أسبوعي" variant="amber" />
          <StatTile label="إجمالي الشهر" value={String(monthCount)} hint={`الكلي ${totalCount}`} variant="slate" />
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          عدد التسبيحات: {currentSessionCount}
        </p>
      </AppCard>

      <AppCard title="إعدادات الجلسة" subtitle="اختر هدفًا واضحًا واضبط الذكر الحالي بسرعة.">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-300">أهداف سريعة</p>
            <MasbahaTargetPresets currentTarget={currentTarget} presets={targetPresets} onSelect={setTarget} />
          </div>

          <AppTextField
            id="masbaha-target-input"
            label="هدف الدورة"
            type="number"
            min={1}
            inputMode="numeric"
            value={draftTarget}
            onChange={(event) => setDraftTarget(event.target.value)}
            onBlur={handleTargetCommit}
            onKeyDown={(event) => { if (event.key === 'Enter') handleTargetCommit(); }}
          />

          <div className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-3 dark:bg-slate-800/70">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">الذكر الحالي</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AppChip variant="active" onClick={() => selectPhrase(selectedPhrase)}>{selectedPhrase}</AppChip>
              <AppButton variant="outline" size="sm" onClick={toggleSilent}>
                {isSilent ? '🔇 صامت' : '🔊 صوت'}
              </AppButton>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
              عند اكتمال الدورة ينتقل التطبيق تلقائيًا إلى الذكر التالي في الدورة الافتراضية.
            </p>
          </div>
        </div>
      </AppCard>

      <AppCard title="اختيار الذكر" subtitle="اختر ذكرًا افتراضيًا أو أضف ذكرًا مخصصًا للجلسة.">
        <div className="flex flex-wrap gap-2">
          {phrases.map((phrase) => {
            const isSelected = phrase === selectedPhrase;
            const isCustom = customPhrases.includes(phrase);
            return (
              <div key={phrase} className="flex items-center gap-2">
                <AppChip variant={isSelected ? 'active' : 'neutral'} onClick={() => selectPhrase(phrase)}>
                  {phrase}
                </AppChip>
                {isCustom ? (
                  <AppButton size="sm" variant="outline" onClick={() => removeCustomPhrase(phrase)}>
                    حذف
                  </AppButton>
                ) : null}
              </div>
            );
          })}
        </div>
      </AppCard>

      <AppCard title="إضافة ذكر مخصص" subtitle="أضف ذكرًا تستخدمه كثيرًا لتتابعه ضمن الجلسات بسرعة.">
        <div className="flex gap-2">
          <input
            value={draftPhrase}
            onChange={(event) => setDraftPhrase(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              handleAddPhrase();
            }}
            placeholder="أدخل ذكراً جديداً"
            className={cn('min-w-0 flex-1', INPUT_CLASS)}
          />
          <AppButton onClick={handleAddPhrase} variant="secondary">
            حفظ
          </AppButton>
        </div>
        {feedback ? <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{feedback}</p> : null}
      </AppCard>
    </div>
  );
}
