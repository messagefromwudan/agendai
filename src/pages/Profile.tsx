import { useState, useRef } from 'react';
import { Award, Clock, BookOpen, Trophy, Zap, Target, Camera } from 'lucide-react';
import SimpleTooltip from '../components/SimpleTooltip';
import ProfileBadge from '../components/ProfileBadge';
import BadgeDetailsModal from '../components/BadgeDetailsModal';

type StudentProfile = {
  name: string;
  class: string;
  studentId: string;
  institution: string;
  academicYear: string;
  profileImage: string;
  mainBadgeType: 'top-10' | 'hard-worker' | 'comeback' | 'consistent-learner' | 'star';
  additionalBadges: ('top-10' | 'hard-worker' | 'comeback' | 'consistent-learner' | 'star')[];
};

type AchievementBadge = {
  id: number;
  name: string;
  icon: any;
  color: string;
  earned: boolean;
  description: string;
  howToGet: string;
};

const mockStudentProfile: StudentProfile = {
  name: 'Bianca Popescu',
  class: 'Class 11-A',
  studentId: 'ST-2024-1337',
  institution: 'Colegiul National',
  academicYear: '2024-2025',
  profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
  mainBadgeType: 'top-10',
  additionalBadges: ['hard-worker', 'consistent-learner'],
};

export default function Profile() {
  const [profileImage, setProfileImage] = useState(mockStudentProfile.profileImage);
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const badges: AchievementBadge[] = [
    {
      id: 1,
      name: 'Focus Hero',
      icon: Target,
      color: 'blue',
      earned: true,
      description: 'You earned this badge by maintaining focus during 50+ study sessions.',
      howToGet: 'Continue dedicating focused time to your studies without distractions.',
    },
    {
      id: 2,
      name: 'Math Whiz',
      icon: Trophy,
      color: 'yellow',
      earned: true,
      description: 'You earned this badge for consistently high performance in Mathematics.',
      howToGet: 'Keep your Math average above 9.0 to maintain this achievement.',
    },
    {
      id: 3,
      name: 'Perfect Week',
      icon: Award,
      color: 'green',
      earned: true,
      description: 'You completed all homework and attended all classes this week.',
      howToGet: 'Maintain perfect attendance and complete all assignments each week.',
    },
    {
      id: 4,
      name: 'Quick Learner',
      icon: Zap,
      color: 'purple',
      earned: false,
      description: 'Master a new topic in less than 3 study sessions.',
      howToGet: 'Efficiently learn new concepts in a short timeframe.',
    },
  ];

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [showAdditionalBadges, setShowAdditionalBadges] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Student Profile
      </h1>

      <BadgeDetailsModal
        isOpen={selectedBadge !== null}
        badgeName={selectedBadge?.name || ''}
        description={selectedBadge?.description || ''}
        howToGet={selectedBadge?.howToGet || ''}
        onClose={() => setSelectedBadge(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <div className="relative inline-block mb-6">
              <button
                onClick={handlePhotoClick}
                className="relative group w-32 h-32 mx-auto"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full border-4 border-white shadow-xl mx-auto relative overflow-hidden">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                      <Camera className="w-5 h-5 text-white" />
                      <span className="text-xs text-white font-medium">Change photo</span>
                    </div>
                  </div>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#164B2E] text-[#F1F5F9] px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                <ProfileBadge type={mockStudentProfile.mainBadgeType} size="small" />
              </div>
            </div>

            {mockStudentProfile.additionalBadges.length > 0 && (
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <button
                    onClick={() => setShowAdditionalBadges(!showAdditionalBadges)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 px-2 py-1 rounded-full"
                  >
                    +{mockStudentProfile.additionalBadges.length} more
                  </button>
                  {showAdditionalBadges && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-10 whitespace-nowrap">
                      {mockStudentProfile.additionalBadges.map((badgeType) => (
                        <div key={badgeType} className="py-1">
                          <ProfileBadge type={badgeType} size="small" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-1">{mockStudentProfile.name}</h2>
            <p className="text-gray-500 mb-4">{mockStudentProfile.class}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Student ID</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-gray-900">{mockStudentProfile.studentId}</span>
                <div className="w-8 h-8 bg-[#164B2E] rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Institution</span>
                <span className="text-sm font-semibold text-gray-900">{mockStudentProfile.institution}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Academic Year</span>
                <span className="text-sm font-semibold text-gray-900">{mockStudentProfile.academicYear}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900">Learning Statistics</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center relative group">
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SimpleTooltip text="A subject is considered mastered when your performance stays above the set threshold over time." />
                </div>
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">8</p>
                <p className="text-xs text-blue-700">Subjects Mastered</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center relative group">
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SimpleTooltip text="Total focused study time tracked in AgendAI." />
                </div>
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">42h</p>
                <p className="text-xs text-green-700">Study Time (Week)</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center relative group">
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SimpleTooltip text="Points earned for completing lessons, homework and AI practice sessions." />
                </div>
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">1,247</p>
                <p className="text-xs text-purple-700">Knowledge Points</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Achievements & Badges</h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon;
                const colors = {
                  blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
                  yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-200' },
                  green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
                  purple: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200' },
                };
                const color = colors[badge.color as keyof typeof colors];

                return (
                  <button
                    key={badge.id}
                    onClick={() => badge.earned && setSelectedBadge(badge)}
                    disabled={!badge.earned}
                    className={`border ${color.border} ${color.bg} rounded-xl p-4 text-center ${
                      badge.earned ? 'opacity-100 cursor-pointer hover:shadow-lg' : 'opacity-40 cursor-default'
                    } transition-all hover:scale-105 disabled:hover:scale-100`}
                  >
                    <div className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-3 ${
                      badge.earned ? 'ring-4 ring-white shadow-lg' : ''
                    }`}>
                      <Icon className={`w-8 h-8 ${color.icon}`} />
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{badge.name}</p>
                    {badge.earned && (
                      <p className="text-xs text-gray-500 mt-1">Earned</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Subject Strengths</h3>
            <div className="space-y-3">
              {[
                { name: 'Mathematics', score: 95 },
                { name: 'Physics', score: 92 },
                { name: 'Literature', score: 88 },
                { name: 'Chemistry', score: 75 },
                { name: 'Biology', score: 72 },
              ].map((subject) => {
                const isStrong = subject.score >= 80;
                const color = isStrong ? 'bg-green-500' : 'bg-orange-500';

                return (
                  <div key={subject.name}>
                    <div className="flex justify-between mb-1 items-center">
                      <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{subject.score}%</span>
                        {!isStrong && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                            Needs focus
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${subject.score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
