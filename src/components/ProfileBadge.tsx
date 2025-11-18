import { Award, Target, TrendingUp, BookOpen, Star } from 'lucide-react';

type BadgeType = 'top-10' | 'hard-worker' | 'comeback' | 'consistent-learner' | 'star';

type ProfileBadgeProps = {
  type: BadgeType;
  size?: 'small' | 'large';
};

const badgeConfig: Record<BadgeType, { label: string; icon: any; color: string; bgColor: string }> = {
  'top-10': {
    label: 'Top 10%',
    icon: Award,
    color: '#164B2E',
    bgColor: '#F1F5F9',
  },
  'hard-worker': {
    label: 'Hard Worker',
    icon: Target,
    color: '#EA580C',
    bgColor: '#FEF3C7',
  },
  'comeback': {
    label: 'Comeback',
    icon: TrendingUp,
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  'consistent-learner': {
    label: 'Consistent Learner',
    icon: BookOpen,
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  'star': {
    label: 'Star Student',
    icon: Star,
    color: '#D97706',
    bgColor: '#FFFBEB',
  },
};

export default function ProfileBadge({ type, size = 'small' }: ProfileBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  if (size === 'large') {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </div>
  );
}
