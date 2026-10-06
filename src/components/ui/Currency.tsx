import { CURRENCY_ART } from '@/game/art';
import { t } from '@/game/i18n';

export type CurrencyKind = keyof typeof CURRENCY_ART;

const CURRENCY_KEY: Record<CurrencyKind, string> = {
  gold: 'currency.gold',
  gems: 'currency.gems',
  redGems: 'currency.redGems',
  stones: 'currency.stones',
  material: 'currency.material',
};

export function currencyName(kind: CurrencyKind): string {
  return t(CURRENCY_KEY[kind]);
}

export function Currency({ kind, value, size = 16, className = '' }: { kind: CurrencyKind; value: number | string; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums font-semibold ${className}`}>
      <img src={CURRENCY_ART[kind]} alt={currencyName(kind)} style={{ width: size, height: size }} className="object-contain shrink-0" />
      {value}
    </span>
  );
}

export function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 10_000) return `${Math.floor(n / 1000)}K`;
  return String(n);
}
