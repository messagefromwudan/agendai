import { useState, useRef, useEffect } from 'react';
import { Award, Clock, BookOpen, Trophy, Zap, Target, Camera, QrCode } from 'lucide-react';
import SimpleTooltip from '../components/SimpleTooltip';
import ProfileBadge from '../components/ProfileBadge';
import BadgeDetailsModal from '../components/BadgeDetailsModal';
import {
  fetchProfileData,
  fetchProfileStats,
  fetchAchievements,
  fetchSubjectProgress,
  updateProfileImage as updateProfileImageInDB,
  type ProfileData,
  type ProfileStats,
  type Achievement,
  type SubjectProgress,
} from '../utils/profileHelpers';

type AchievementBadge = {
  id: string;
  name: string;
  icon: any;
  color: string;
  earned: boolean;
  description: string;
  howToGet: string;
};

type ProfileProps = {
  onNavigate?: (page: string) => void;
};

const iconMap: Record<string, any> = {
  Target,
  Trophy,
  Award,
  Zap,
  Clock,
  BookOpen,
};

export default function Profile({ onNavigate }: ProfileProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [profileImage, setProfileImage] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdditionalBadges, setShowAdditionalBadges] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalBadgesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        additionalBadgesRef.current &&
        !additionalBadgesRef.current.contains(event.target as Node)
      ) {
        setShowAdditionalBadges(false);
      }
    };

    if (showAdditionalBadges) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdditionalBadges]);

  const loadProfileData = async () => {
    setLoading(true);
    const [profile, stats, achievementsList, progress] = await Promise.all([
      fetchProfileData(),
      fetchProfileStats(),
      fetchAchievements(),
      fetchSubjectProgress(),
    ]);

    if (profile) {
      setProfileData(profile);
      setProfileImage(profile.profileImage);
    }
    setProfileStats(stats);
    setAchievements(achievementsList);
    setSubjectProgress(progress);
    setLoading(false);
  };

  const badges: AchievementBadge[] = achievements.map((a) => ({
    id: a.id,
    name: a.name,
    icon: iconMap[a.icon] || Target,
    color: a.color,
    earned: a.earned,
    description: a.description,
    howToGet: a.howToGet,
  }));

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setProfileImage(result);
        await updateProfileImageInDB(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePracticeForBadge = (badge: AchievementBadge) => {
    try {
      const focusPayload = {
        badgeId: badge.id,
        badgeName: badge.name,
        focusInstructions: badge.howToGet,
      };
      window.localStorage.setItem('aiTutorFocus', JSON.stringify(focusPayload));
    } catch (error) {
      console.error('Failed to set AI Tutor focus from profile badge:', error);
    }

    if (onNavigate) {
      onNavigate('ai-tutor');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#164B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nu s-au putut încărca datele profilului.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Profilul Studentului
      </h1>

      <BadgeDetailsModal
        isOpen={selectedBadge !== null}
        badgeName={selectedBadge?.name || ''}
        description={selectedBadge?.description || ''}
        howToGet={selectedBadge?.howToGet || ''}
        earned={!!selectedBadge?.earned}
        onPractice={
          selectedBadge ? () => handlePracticeForBadge(selectedBadge) : undefined
        }
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
                      <span className="text-xs text-white font-medium">Schimbă poza</span>
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
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full shadow-lg border-2 border-[#164B2E] bg-white">
                <ProfileBadge type={profileData.mainBadgeType} size="large" />
              </div>
            </div>

            {profileData.additionalBadges.length > 0 && (
              <div className="mb-6 flex justify-center">
                <div className="relative" ref={additionalBadgesRef}>
                  <button
                    onClick={() => setShowAdditionalBadges(!showAdditionalBadges)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 px-2 py-1 rounded-full"
                  >
                    +{profileData.additionalBadges.length} mai mult
                  </button>
                  {showAdditionalBadges && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-10 whitespace-nowrap">
                      {profileData.additionalBadges.map((badgeType) => (
                        <div key={badgeType} className="py-1">
                          <ProfileBadge type={badgeType} size="small" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-1 -mt-4">{profileData.fullName}</h2>
            <p className="text-gray-500 mb-4">{profileData.className}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">ID Student</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-gray-900">{profileData.studentId}</span>
                <button
                  type="button"
                  onClick={() => setShowQrCode(true)}
                  className="w-8 h-8 bg-[#164B2E] rounded flex items-center justify-center text-white hover:bg-[#0d2819] transition-colors"
                  title="Vezi codul QR al studentului"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Instituție</span>
                <span className="text-sm font-semibold text-gray-900">{profileData.institution}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Anul Academic</span>
                <span className="text-sm font-semibold text-gray-900">{profileData.academicYear}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900">Statistici de Învățare</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center relative group">
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SimpleTooltip text="O materie este considerată stăpânită atunci când performanța ta rămâne peste pragul stabilit în timp." />
                </div>
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{profileStats?.subjectsMastered || 0}</p>
                <p className="text-xs text-blue-700">Materii Stăpânite</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center relative group">
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SimpleTooltip text="Timp total de studiu concentrat urmărit în AgendAI." />
                </div>
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{profileStats?.studyHoursThisWeek || 0}h</p>
                <p className="text-xs text-green-700">Timp de Studiu (Săptămână)</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center relative group">
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SimpleTooltip text="Puncte câștigate pentru completarea lecțiilor, temelor și sesiunilor de practică AI." />
                </div>
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{profileStats?.knowledgePoints.toLocaleString() || 0}</p>
                <p className="text-xs text-purple-700">Puncte de Cunoaștere</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Realizări și Insigne</h3>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  const colors = {
                    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
                    yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-200' },
                    green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
                    purple: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200' },
                  };
                  const color = colors[badge.color as keyof typeof colors] || colors.blue;

                  return (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className={`border ${color.border} ${color.bg} rounded-xl p-4 text-center ${
                        badge.earned ? 'opacity-100 hover:shadow-lg' : 'opacity-40'
                      } cursor-pointer transition-all hover:scale-105`}
                    >
                      <div className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-3 ${
                        badge.earned ? 'ring-4 ring-white shadow-lg' : ''
                      }`}>
                        <Icon className={`w-8 h-8 ${color.icon}`} />
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{badge.name}</p>
                      {badge.earned && (
                        <p className="text-xs text-gray-500 mt-1">Obținută</p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Nu ai câștigat încă nicio realizare. Continuă să înveți!</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Puncte Forte la Materii</h3>
            {subjectProgress.length > 0 ? (
              <div className="space-y-3">
                {subjectProgress.map((subject) => {
                  const isStrong = subject.score >= 80;
                  const color = isStrong ? 'bg-green-500' : 'bg-orange-500';

                  return (
                    <div key={subject.id}>
                      <div className="flex justify-between mb-1 items-center">
                        <span className="text-sm font-medium text-gray-700">{subject.subjectName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{subject.score}%</span>
                          {!isStrong && (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                              Necesită atenție
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
            ) : (
              <p className="text-center text-gray-500 py-8">Datele despre progres vor apărea pe măsură ce lucrezi la materiile tale.</p>
            )}
          </div>
        </div>
      </div>

      {showQrCode && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQrCode(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Cod QR Student</h2>
              <button
                type="button"
                onClick={() => setShowQrCode(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Scanează acest cod pentru a identifica rapid studentul cu ID-ul{' '}
              <span className="font-mono font-semibold text-gray-900">{profileData.studentId}</span>.
            </p>
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                  `${window.location.origin}?publicStudentId=${profileData.studentId}`
                )}`}
                alt="Cod QR Student"
                className="rounded-lg border border-gray-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
