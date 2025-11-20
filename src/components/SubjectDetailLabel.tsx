type SubjectDetailLabelProps = {
  type: 'profile' | 'gradeType' | 'averageType';
  value: string;
};

export default function SubjectDetailLabel({ type, value }: SubjectDetailLabelProps) {
  const baseClasses = 'text-xs font-medium text-gray-500';

  if (type === 'profile') {
    return (
      <p className={`${baseClasses} mt-1`}>
        {value}
      </p>
    );
  }

  if (type === 'gradeType') {
    return (
      <p className={`${baseClasses}`}>
        {value}
      </p>
    );
  }

  return (
    <p className={`${baseClasses}`}>
      {value}
    </p>
  );
}
