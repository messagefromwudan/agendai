import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, AlertCircle } from 'lucide-react';

type SignUpProps = {
  onNavigate: (page: string) => void;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthdate: string;
  phone: string;
  country: string;
  city: string;
  street: string;
};

type FormErrors = {
  [K in keyof FormData]?: string;
};

const countries = [
  'România',
  'Moldova',
  'Germania',
  'Franța',
  'Italia',
  'Spania',
  'Marea Britanie',
  'SUA',
  'Canada',
  'Australia',
];

export default function SignUp({ onNavigate }: SignUpProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    phone: '',
    country: '',
    city: '',
    street: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prenumele este obligatoriu';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Prenumele trebuie să aibă cel puțin 2 caractere';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Numele este obligatoriu';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Numele trebuie să aibă cel puțin 2 caractere';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email-ul este obligatoriu';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Introduceți o adresă de email validă';
    }

    if (!formData.password) {
      newErrors.password = 'Parola este obligatorie';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Parola trebuie să aibă cel puțin 6 caractere';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmarea parolei este obligatorie';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parolele nu coincid';
    }

    if (!formData.birthdate) {
      newErrors.birthdate = 'Data nașterii este obligatorie';
    } else {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 13) {
          newErrors.birthdate = 'Trebuie să ai cel puțin 13 ani';
        }
      } else if (age < 13) {
        newErrors.birthdate = 'Trebuie să ai cel puțin 13 ani';
      }

      if (birthDate > today) {
        newErrors.birthdate = 'Data nașterii nu poate fi în viitor';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Numărul de telefon este obligatoriu';
    } else if (!/^[0-9+\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Introduceți un număr de telefon valid (minim 10 cifre)';
    }

    if (!formData.country) {
      newErrors.country = 'Țara este obligatorie';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Orașul este obligatoriu';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'Orașul trebuie să aibă cel puțin 2 caractere';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Strada este obligatorie';
    } else if (formData.street.trim().length < 3) {
      newErrors.street = 'Strada trebuie să aibă cel puțin 3 caractere';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setGeneralError('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            birthdate: formData.birthdate,
            phone: formData.phone.trim(),
            country: formData.country,
            city: formData.city.trim(),
            street: formData.street.trim(),
          },
        },
      });

      if (signUpError) {
        setGeneralError(signUpError.message);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            birthdate: formData.birthdate,
            phone: formData.phone.trim(),
            country: formData.country,
            city: formData.city.trim(),
            street: formData.street.trim(),
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      }

      onNavigate('dashboard');
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'A apărut o eroare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-[#F1F5F9]" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Creează cont
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Alătură-te comunității AgendAI
        </p>

        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{generalError}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prenume <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
                placeholder="Ion"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
                placeholder="Popescu"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
              placeholder="ion.popescu@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parolă <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmă Parola <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data nașterii <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.birthdate}
              onChange={(e) => handleChange('birthdate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border ${
                errors.birthdate ? 'border-red-500' : 'border-gray-300'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
            />
            {errors.birthdate && (
              <p className="text-red-500 text-xs mt-1">{errors.birthdate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Număr de telefon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
              placeholder="+40 123 456 789"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Țara <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className={`w-full px-4 py-3 border ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all bg-white`}
            >
              <option value="">Selectează țara</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oraș <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
                placeholder="București"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strada <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                className={`w-full px-4 py-3 border ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all`}
                placeholder="Str. Exemplu, nr. 123"
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">{errors.street}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#164B2E] hover:bg-[#0d2819] disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:cursor-not-allowed"
          >
            {loading ? 'Se creează contul...' : 'Creează cont'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Ai deja cont?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#164B2E] font-semibold hover:underline"
          >
            Autentificare
          </button>
        </p>
      </div>
    </div>
  );
}
