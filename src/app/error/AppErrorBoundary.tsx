import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[AppErrorBoundary]', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-10 max-w-md rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm dark:border-rose-950 dark:bg-rose-950/40 dark:text-rose-100">
          <h2 className="text-lg font-bold">حدث خطأ غير متوقع</h2>
          <p className="mt-2 text-sm leading-6">{this.state.message || 'تعذر تحميل التطبيق.'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
