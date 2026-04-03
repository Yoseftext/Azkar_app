/**
 * ====================================================================
 * RouteErrorBoundary — حاجز الأخطاء على مستوى كل Route
 * ====================================================================
 * MISSING-01:
 *   AppErrorBoundary كانت تُنهي التطبيق كاملاً عند أي خطأ.
 *   هذا المكوّن يعزل الخطأ في القسم المعطوب فقط —
 *   باقي التطبيق يبقى يعمل وزر الرجوع يعمل.
 * ====================================================================
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';

interface Props   { children: ReactNode; sectionTitle?: string; }
interface State   { hasError: boolean; message: string; }

export class RouteErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[RouteErrorBoundary] ${this.props.sectionTitle ?? 'unknown'}:`, error, info);
  }

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <AppCard title="تعذّر تحميل هذا القسم">
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            حدث خطأ غير متوقع في {this.props.sectionTitle ?? 'هذا القسم'}.
            يمكنك العودة للرئيسية أو تحديث الصفحة.
          </p>
          {this.state.message ? (
            <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-mono text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {this.state.message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
          >
            حاول مجدداً
          </button>
        </div>
      </AppCard>
    );
  }
}
