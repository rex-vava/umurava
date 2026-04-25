'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJob, updateJob } from '@/store/slices/jobsSlice';
import { PageLoader } from '@/components/LoadingStates';
import toast from 'react-hot-toast';

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentJob, loading } = useAppSelector((state) => state.jobs);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    department: '',
    type: 'full-time',
    experienceLevel: 'mid',
    status: 'active',
    description: '',
    requirements: '',
    responsibilities: '',
    preferredSkills: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchJob(id as string));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentJob) {
      setFormData({
        title: currentJob.title,
        location: currentJob.location,
        department: currentJob.department || '',
        type: currentJob.type,
        experienceLevel: currentJob.experienceLevel,
        status: currentJob.status,
        description: currentJob.description,
        requirements: currentJob.requirements.join('\n'),
        responsibilities: currentJob.responsibilities.join('\n'),
        preferredSkills: currentJob.preferredSkills.join('\n'),
      });
    }
  }, [currentJob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    try {
      const payload: any = {
        title: formData.title,
        location: formData.location,
        department: formData.department,
        type: formData.type,
        experienceLevel: formData.experienceLevel,
        status: formData.status,
        description: formData.description,
        requirements: formData.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
        preferredSkills: formData.preferredSkills.split('\n').map((s) => s.trim()).filter(Boolean),
      };

      await dispatch(updateJob({ id: id as string, data: payload })).unwrap();
      toast.success('Job updated successfully');
      router.push(`/dashboard/jobs/${id}`);
    } catch (error: any) {
      toast.error(error || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentJob) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
        <p className="text-gray-500 mt-1">Update the job posting and screening criteria.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input name="title" value={formData.title} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input name="department" value={formData.department} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="input-field">
                <option value="entry">Entry</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field min-h-[140px]"
              required
            />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
            <textarea name="requirements" value={formData.requirements} onChange={handleChange} className="input-field min-h-[120px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities (one per line)</label>
            <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} className="input-field min-h-[120px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Skills (one per line)</label>
            <textarea name="preferredSkills" value={formData.preferredSkills} onChange={handleChange} className="input-field min-h-[120px]" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
