import React, { useState, useEffect, useCallback } from 'react';
import { RPMInput, PedagogicalPractice, GraduateDimension } from '../types';
import { PEDAGOGICAL_PRACTICES, GRADUATE_DIMENSIONS } from '../constants';

interface RPMFormProps {
  onSubmit: (data: RPMInput) => void;
  isLoading: boolean;
}

const InputField: React.FC<{ id: string, label: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean }> = ({ id, label, type = "text", value, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
    />
  </div>
);

const TextareaField: React.FC<{ id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number }> = ({ id, label, value, onChange, rows = 3 }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
    />
  </div>
);


export const RPMForm: React.FC<RPMFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<RPMInput>({
    teacherName: '',
    teacherNip: '',
    className: 'VII',
    subject: '',
    learningObjectives: '',
    subjectMatter: '',
    language: 'Bahasa Arab',
    meetings: 1,
    pedagogicalPractices: [PEDAGOGICAL_PRACTICES[0]],
    graduateDimensions: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof RPMInput, string>>>({});

  useEffect(() => {
    const numMeetings = formData.meetings > 0 ? formData.meetings : 1;
    setFormData(prev => ({
      ...prev,
      pedagogicalPractices: Array.from({ length: numMeetings }, (_, i) => prev.pedagogicalPractices[i] || PEDAGOGICAL_PRACTICES[0])
    }));
  }, [formData.meetings]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'meetings' ? parseInt(value, 10) || 1 : value }));
  }, []);

  const handlePracticeChange = useCallback((index: number, value: PedagogicalPractice) => {
    setFormData(prev => {
      const newPractices = [...prev.pedagogicalPractices];
      newPractices[index] = value;
      return { ...prev, pedagogicalPractices: newPractices };
    });
  }, []);

  const handleDimensionChange = useCallback((dimension: GraduateDimension) => {
    setFormData(prev => {
      const newDimensions = prev.graduateDimensions.includes(dimension)
        ? prev.graduateDimensions.filter(d => d !== dimension)
        : [...prev.graduateDimensions, dimension];
      return { ...prev, graduateDimensions: newDimensions };
    });
  }, []);
  
  const handleFillExample = useCallback(() => {
    setFormData({
        teacherName: 'Ahmad Fauzi, S.Pd.',
        teacherNip: '198503152010011001',
        className: 'VIII',
        subject: 'Ilmu Pengetahuan Alam (IPA)',
        learningObjectives: 'Siswa mampu mengidentifikasi organ-organ sistem pencernaan manusia dan menjelaskan fungsi masing-masing organ dengan benar.',
        subjectMatter: 'Sistem Pencernaan Manusia',
        language: 'Bahasa Arab',
        meetings: 2,
        pedagogicalPractices: [PedagogicalPractice.INQUIRY_DISCOVERY, PedagogicalPractice.PJBL],
        graduateDimensions: [GraduateDimension.CRITICAL_REASONING, GraduateDimension.COLLABORATION, GraduateDimension.CREATIVITY],
    });
  }, []);

  const validateForm = () => {
      const newErrors: Partial<Record<keyof RPMInput, string>> = {};
      if (!formData.teacherName.trim()) newErrors.teacherName = "Nama Guru wajib diisi.";
      if (!formData.teacherNip.trim()) newErrors.teacherNip = "NIP Guru wajib diisi.";
      if (!formData.subject.trim()) newErrors.subject = "Mata Pelajaran wajib diisi.";
      if (!formData.learningObjectives.trim()) newErrors.learningObjectives = "Tujuan Pembelajaran wajib diisi.";
      if (!formData.subjectMatter.trim()) newErrors.subjectMatter = "Materi Pelajaran wajib diisi.";
      if (formData.meetings < 1) newErrors.meetings = "Jumlah Pertemuan minimal 1.";
      if (formData.graduateDimensions.length === 0) newErrors.graduateDimensions = "Pilih minimal satu Dimensi Lulusan.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
        onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField id="teacherName" label="Nama Guru" value={formData.teacherName} onChange={handleChange} />
      {errors.teacherName && <p className="text-red-500 text-sm -mt-4">{errors.teacherName}</p>}
      <InputField id="teacherNip" label="NIP Guru" type="text" value={formData.teacherNip} onChange={handleChange} />
      {errors.teacherNip && <p className="text-red-500 text-sm -mt-4">{errors.teacherNip}</p>}
      
      <div>
        <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
        <select id="className" name="className" value={formData.className} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900">
          <option>VII</option>
          <option>VIII</option>
          <option>IX</option>
        </select>
      </div>

      <InputField id="subject" label="Mata Pelajaran" value={formData.subject} onChange={handleChange} />
      {errors.subject && <p className="text-red-500 text-sm -mt-4">{errors.subject}</p>}
      <TextareaField id="learningObjectives" label="Tujuan Pembelajaran" value={formData.learningObjectives} onChange={handleChange} />
      {errors.learningObjectives && <p className="text-red-500 text-sm -mt-4">{errors.learningObjectives}</p>}
      <TextareaField id="subjectMatter" label="Materi Pelajaran" value={formData.subjectMatter} onChange={handleChange} />
      {errors.subjectMatter && <p className="text-red-500 text-sm -mt-4">{errors.subjectMatter}</p>}

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Bahasa Pembuka/Penutup</label>
        <select id="language" name="language" value={formData.language} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900">
          <option>Bahasa Arab</option>
          <option>Bahasa Inggris</option>
        </select>
      </div>
      
      <InputField id="meetings" label="Jumlah Pertemuan" type="number" value={formData.meetings.toString()} onChange={handleChange} />
       {errors.meetings && <p className="text-red-500 text-sm -mt-4">{errors.meetings}</p>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Praktik Pedagogis per Pertemuan</label>
        <div className="space-y-2">
        {Array.from({ length: formData.meetings > 0 ? formData.meetings : 1 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 w-24">Pertemuan {index + 1}:</span>
                <select 
                    value={formData.pedagogicalPractices[index] || ''}
                    onChange={(e) => handlePracticeChange(index, e.target.value as PedagogicalPractice)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900"
                >
                    {PEDAGOGICAL_PRACTICES.map(practice => <option key={practice} value={practice}>{practice}</option>)}
                </select>
            </div>
        ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dimensi Lulusan (Pilih beberapa)</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {GRADUATE_DIMENSIONS.map(dim => (
            <label key={dim} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={formData.graduateDimensions.includes(dim)}
                onChange={() => handleDimensionChange(dim)}
                className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600">{dim}</span>
            </label>
          ))}
        </div>
         {errors.graduateDimensions && <p className="text-red-500 text-sm mt-2">{errors.graduateDimensions}</p>}
      </div>

      <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? 'Memproses...' : 'Generate RPM'}
        </button>
        <button
          type="button"
          onClick={handleFillExample}
          disabled={isLoading}
          className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
          Isi Contoh
        </button>
      </div>
    </form>
  );
};