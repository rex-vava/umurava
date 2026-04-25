'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { createJob } from '@/store/slices/jobsSlice';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function NewJobPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    department: '',
    location: '',
    type: 'full-time' as const,
    description: '',
    experienceLevel: 'mid' as const,
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'RWF',
    status: 'active' as const,
  });
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['']);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleListChange = (
    list: string[],
    setList: (l: string[]) => void,
    index: number,
    value: string
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = (list: string[], setList: (l: string[]) => void) => {
    setList([...list, '']);
  };

  const removeListItem = (list: string[], setList: (l: string[]) => void, index: number) => {
    if (list.length <= 1) return;
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData: any = {
        ...formData,
        requirements: requirements.filter((r) => r.trim()),
        responsibilities: responsibilities.filter((r) => r.trim()),
        preferredSkills: preferredSkills.filter((s) => s.trim()),
      };

      if (formData.salaryMin && formData.salaryMax) {
        jobData.salaryRange = {
          min: parseInt(formData.salaryMin),
          max: parseInt(formData.salaryMax),
          currency: formData.salaryCurrency,
        };
      }

      delete jobData.salaryMin;
      delete jobData.salaryMax;
      delete jobData.salaryCurrency;

      await dispatch(createJob(jobData)).unwrap();
      toast.success('Job created successfully!');
      router.push('/dashboard/jobs');
    } catch (err: any) {
      toast.error(err || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const renderListInputs = (
    label: string,
    placeholder: string,
    list: string[],
    setList: (l: string[]) => void
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleListChange(list, setList, index, e.target.value)}
              className="input-field"
              placeholder={placeholder}
            />
            {list.length > 1 && (
              <button
                type="button"
                onClick={() => removeListItem(list, setList, index)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addListItem(list, setList)}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Add more
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post New Job</h1>
        <p className="text-gray-500 mt-1">Create a job posting to start receiving and screening candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Engineering"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Kigali, Rwanda"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience Level</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field min-h-[150px] resize-y"
                placeholder="Describe the role, team, and what the ideal candidate looks like..."
                required
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Salary Range (Optional)</label>
              <div className="flex gap-3 items-center">
                <select
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleChange}
                  className="input-field w-24"
                >
                  <option value="RWF">RWF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Min"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Skills</h2>
          <div className="space-y-6">
            {renderListInputs(
              'Requirements *',
              'e.g., 3+ years of experience with React',
              requirements,
              setRequirements
            )}
            {renderListInputs(
              'Responsibilities',
              'e.g., Build and maintain frontend components',
              responsibilities,
              setResponsibilities
            )}
            {renderListInputs(
              'Preferred Skills',
              'e.g., TypeScript, Next.js, Tailwind CSS',
              preferredSkills,
              setPreferredSkills
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Job'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
