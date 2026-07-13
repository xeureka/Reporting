import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';

import { api } from '../../api';
import { Panel } from '../ui/Panel';
import { StatusMessage } from '../ui/StatusMessage';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const changePassword = useMutation({
    mutationFn: () => api.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setMessage('Password changed successfully.');
      setIsError(false);
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : 'Password change failed.');
      setIsError(true);
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    changePassword.mutate();
  };

  return (
    <Panel title="Change Password">
      {message && <StatusMessage variant={isError ? 'error' : 'success'}>{message}</StatusMessage>}
      <form className="inline-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Current password</span>
          <input
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            type="password"
            placeholder="Current password"
            required
          />
        </label>
        <label className="form-field">
          <span>New password</span>
          <input
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
            placeholder="New password"
            required
          />
        </label>
        <button type="submit" className="btn-primary" disabled={changePassword.isPending}>
          {changePassword.isPending ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </Panel>
  );
}
