import { useMemo, useState } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { DEFAULT_MASBAHA_PHRASES, getMasbahaBatchCount, getMasbahaCurrentMonthCount, getMasbahaLast7DaysCount, getMasbahaProgressRatio, getMasbahaTodayCount } from '@/features/masbaha/domain/masbaha-selectors';
import { useMasbahaStore } from '@/features/masbaha/state/masbaha-store';

export function MasbahaPage() {
  const [draftPhrase, setDraftPhrase] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const isSilent = useMasbahaStore((state) => state.isSilent);
  const currentTarget = useMasbahaStore((state) => state.currentTarget);
  const currentSessionCount = useMasbahaStore((state) => state.currentSessionCount);
  const totalCount = useMasbahaStore((state) => state.totalCount);
  const selectedPhrase = useMasbahaStore((state) => state.selectedPhrase);
  const customPhrases = useMasbahaStore((state) => state.customPhrases);
  const dailyCounts = useMasbahaStore((state) => state.dailyCounts);
  const increment = useMasbahaStore((state) => state.increment);
  const resetSession = useMasbahaStore((state) => state.resetSession);
  const setTarget = useMasbahaStore((state) => state.setTarget);
  const toggleSilent = useMasbahaStore((state) => state.toggleSilent);
  const selectPhrase = useMasbahaStore((state) => state.selectPhrase);
  const addCustomPhrase = useMasbahaStore((state) => state.addCustomPhrase);
  const removeCustomPhrase = useMasbahaStore((state) => state.removeCustomPhrase);

  const batchCount = useMemo(() => getMasbahaBatchCount({ currentSessionCount, currentTarget }), [currentSessionCount, currentTarget]);
  const progressRatio = useMemo(() => getMasbahaProgressRatio({ currentSessionCount, currentTarget }), [currentSessionCount, currentTarget]);
  const todayCount = useMemo(() => getMasbahaTodayCount({ dailyCounts }), [dailyCounts]);
  const last7DaysCount = useMemo(() => getMasbahaLast7DaysCount({ dailyCounts }), [dailyCounts]);
  const monthCount = useMemo(() => getMasbahaCurrentMonthCount({ dailyCounts }), [dailyCounts]);
  const phrases = [...DEFAULT_MASBAHA_PHRASES, ...customPhrases];

  return (
    <div className="space-y-4">
      <AppCard title="المسبحة" subtitle="module مستقلة: state منفصلة، persistence منفصلة، وإحصائيات قابلة للتجميع بدون لمس app shell.">
        <div className="grid grid-cols-2 gap-3">
          <MetricTile label="جلسة العد" value={String(currentSessionCount)} helper={`الدورة الحالية ${batchCount} / ${currentTarget}`} />
          <MetricTile label="تسبيح اليوم" value={String(todayCount)} helper="يتجمع تلقائيًا داخل الإحصائيات" />
          <MetricTile label="آخر 7 أيام" value={String(last7DaysCount)} helper="rolling window" />
          <MetricTile label="إجمالي الشهر" value={String(monthCount)} helper={`الإجمالي الكلي ${totalCount}`} />
        </div>

        <div className="mt-4 rounded-3xl bg-slate-50 p-4 dark:bg-slate-800/80">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">الذكر الحالي</p>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-50">{selectedPhrase}</p>
            </div>
            <button
              type="button"
              onClick={toggleSilent}
              className={[
                'rounded-2xl px-3 py-2 text-xs font-semibold transition',
                isSilent
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
              ].join(' ')}
            >
              {isSilent ? 'الوضع الصامت مفعّل' : 'الوضع الصامت متوقف'}
            </button>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${Math.min(progressRatio * 100, 100)}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={increment}
              className="rounded-[28px] bg-sky-600 px-4 py-4 text-base font-bold text-white shadow-sm transition hover:bg-sky-700"
            >
              سبح الآن
            </button>
            <button
              type="button"
              onClick={resetSession}
              className="rounded-[28px] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              تصفير الجلسة
            </button>
          </div>
        </div>
      </AppCard>

      <AppCard title="إعدادات الدورة">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100" htmlFor="masbaha-target-input">
          هدف الدورة
        </label>
        <input
          id="masbaha-target-input"
          type="number"
          min={1}
          inputMode="numeric"
          defaultValue={currentTarget}
          onBlur={(event) => setTarget(Number(event.target.value))}
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800"
        />
        <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
          عند اكتمال الدورة ينتقل التطبيق تلقائيًا إلى الذكر الأساسي التالي، مع بقاء الأذكار المخصصة ثابتة إذا اخترتها يدويًا.
        </p>
      </AppCard>

      <AppCard title="اختيار الذكر">
        <div className="flex flex-wrap gap-2">
          {phrases.map((phrase) => {
            const isSelected = phrase === selectedPhrase;
            const isCustom = customPhrases.includes(phrase);

            return (
              <div key={phrase} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectPhrase(phrase)}
                  className={[
                    'rounded-2xl px-4 py-2 text-sm font-semibold transition',
                    isSelected
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
                  ].join(' ')}
                >
                  {phrase}
                </button>
                {isCustom ? (
                  <button
                    type="button"
                    onClick={() => removeCustomPhrase(phrase)}
                    className="rounded-xl px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    حذف
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </AppCard>

      <AppCard title="إضافة ذكر مخصص" subtitle="الأذكار المخصصة تبقى معزولة داخل masbaha store ولا تحتاج أي orchestrator خارجي.">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const result = addCustomPhrase(draftPhrase);
            if (result.ok) {
              setDraftPhrase('');
              setFeedback('تمت إضافة الذكر وتحديده مباشرة.');
            } else {
              setFeedback(result.error ?? 'تعذر إضافة الذكر.');
            }
          }}
        >
          <input
            value={draftPhrase}
            onChange={(event) => setDraftPhrase(event.target.value)}
            placeholder="أدخل ذكراً جديداً"
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800"
          />
          <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-sky-600">
            حفظ
          </button>
        </form>
        {feedback ? <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{feedback}</p> : null}
      </AppCard>
    </div>
  );
}

interface MetricTileProps {
  label: string;
  value: string;
  helper: string;
}

function MetricTile({ label, value, helper }: MetricTileProps) {
  return (
    <div className="rounded-3xl bg-slate-50 p-3 dark:bg-slate-800/70">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}
