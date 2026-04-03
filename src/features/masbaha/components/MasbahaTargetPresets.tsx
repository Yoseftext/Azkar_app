import { AppChip } from '@/shared/ui/primitives/AppChip';

interface MasbahaTargetPresetsProps {
  currentTarget: number;
  presets: number[];
  onSelect: (target: number) => void;
}

export function MasbahaTargetPresets({ currentTarget, presets, onSelect }: MasbahaTargetPresetsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <AppChip
          key={preset}
          variant={preset === currentTarget ? 'active' : 'neutral'}
          onClick={() => onSelect(preset)}
        >
          هدف {preset}
        </AppChip>
      ))}
    </div>
  );
}
