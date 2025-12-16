import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ProfileBadge from '../components/ProfileBadge';
import type { Achievement } from '../utils/profileHelpers';

type PublicStudentProfileProps = {
  studentId: string;
};

type PublicStudentData = {
  fullName: string;
  className: string;
  institution: string;
  academicYear: string;
  profileImage: string;
  mainBadgeType: 'top-10' | 'hard-worker' | 'comeback' | 'consistent-learner' | 'star';
};

export default function PublicStudentProfile({ studentId }: PublicStudentProfileProps) {
  const [student, setStudent] = useState<PublicStudentData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: studentRow } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (!studentRow) {
        setStudent(null);
        setAchievements([]);
        setLoading(false);
        return;
      }

      const publicData: PublicStudentData = {
        fullName: studentRow.full_name || 'Student',
        className: studentRow.class_name || 'Nesetat',
        institution: studentRow.institution || 'Nesetat',
        academicYear: studentRow.academic_year || 'Nesetat',
        profileImage:
          studentRow.profile_image ||
          studentRow.avatar_url ||
          'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        mainBadgeType: (studentRow.main_badge_type as any) || 'consistent-learner',
      };

      const { data: achievementsRows } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', studentRow.id)
        .order('earned', { ascending: false })
        .order('created_at', { ascending: false });

      const mappedAchievements: Achievement[] =
        achievementsRows?.map((a: any) => ({
          id: a.id,
          name: a.name,
          icon: a.icon,
          color: a.color,
          earned: a.earned,
          description: a.description,
          howToGet: a.how_to_get,
          earnedAt: a.earned_at,
        })) || [];

      setStudent(publicData);
      setAchievements(mappedAchievements.filter((a) => a.earned));
      setLoading(false);
    };

    loadData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#164B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Se încarcă profilul studentului...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil indisponibil</h1>
          <p className="text-gray-600 text-sm">
            Nu am găsit niciun student cu acest cod. Verifică dacă ai scanat un cod valid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-[#164B2E] to-[#0d2819] px-8 py-6 text-white">
          <p className="text-xs text-white/70 mb-1">Profil public student</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {student.fullName}
          </h1>
          <p className="text-sm text-white/80 mt-1">
            {student.className} · {student.institution}
          </p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="relative w-28 h-28">
              <div className="w-28 h-28 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full border-4 border-white shadow-xl overflow-hidden">
                <img
                  src={student.profileImage}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full shadow-lg border-2 border-[#164B2E] bg-white">
                <ProfileBadge type={student.mainBadgeType} size="large" />
              </div>
            </div>

            <div className="text-center md:text-left mt-4">
              <p className="text-sm text-gray-500">An școlar</p>
              <p className="text-sm font-semibold text-gray-900">{student.academicYear}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Instituție & Clasă</h2>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Instituție</p>
                    <p className="text-sm font-semibold text-gray-900">{student.institution}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Clasă</p>
                    <p className="text-sm font-semibold text-gray-900">{student.className}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Realizări</h2>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.slice(0, 4).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col gap-1"
                    >
                      <p className="text-xs font-semibold text-gray-900">{achievement.name}</p>
                      <p className="text-[11px] text-gray-600 line-clamp-3">
                        {achievement.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Acest student nu are încă realizări publice afișate.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


