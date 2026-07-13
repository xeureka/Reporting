import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api';
import { CourseList } from '../components/lists/CourseList';
import { Page } from '../components/ui/Page';
import { QueryFeedback } from '../components/ui/QueryFeedback';
import { LEVELS } from '../lib/constants';

export function CoursesPage() {
  const queryClient = useQueryClient();
  const courses = useQuery({ queryKey: ['courses'], queryFn: api.courses, retry: false });
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [units, setUnits] = useState('8');
  const [lessons, setLessons] = useState('32');

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.createCourse(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowForm(false);
      setName('');
    },
  });

  return (
    <Page title="Courses" subtitle="Manage courses, levels, and lesson counts.">
      <div className="toolbar">
        <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showForm && (
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate({
              courseName: name,
              level,
              totalUnits: Number(units),
              totalLessons: Number(lessons),
            });
          }}
        >
          <label className="form-field">
            <span>Course name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Course name"
              required
            />
          </label>
          <label className="form-field">
            <span>Level</span>
            <select value={level} onChange={(event) => setLevel(event.target.value)}>
              {LEVELS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Units</span>
            <input
              value={units}
              onChange={(event) => setUnits(event.target.value)}
              placeholder="Units"
              type="number"
              min={1}
              required
            />
          </label>
          <label className="form-field">
            <span>Lessons</span>
            <input
              value={lessons}
              onChange={(event) => setLessons(event.target.value)}
              placeholder="Lessons"
              type="number"
              min={1}
              required
            />
          </label>
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending ? 'Saving...' : 'Save Course'}
          </button>
        </form>
      )}

      <QueryFeedback
        isLoading={courses.isLoading}
        isError={courses.isError}
        error={courses.error}
        isEmpty={(courses.data?.length ?? 0) === 0}
        emptyMessage="No courses created yet."
      >
        <CourseList rows={courses.data ?? []} />
      </QueryFeedback>
    </Page>
  );
}
