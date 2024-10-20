import React, { useEffect, useCallback } from 'react';

type Commit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    html_url: string;
  };
};

type CommitModalProps = {
  commit: Commit;
  owner: string;
  repo: string;
  onClose: () => void;
};

const CommitModal: React.FC<CommitModalProps> = ({
  commit,
  owner,
  repo,
  onClose,
}) => {
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent && !modalContent.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="modal-content relative w-full max-w-2xl rounded-lg bg-gray-900 p-8 text-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="mb-4 text-3xl font-bold">
          {commit.commit.message.length > 50
            ? `${commit.commit.message.substring(0, 50)}...`
            : commit.commit.message}
        </h2>
        <p className="mb-4 text-gray-400">
          <a
            href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
            target="_blank"
            className="underline"
          >
            {commit.sha}
          </a>
          {' - '}
          <a
            href={commit.author.html_url}
            target="_blank"
            className="underline"
          >
            {commit.commit.author.name}
          </a>
          {' - '}
          {new Date(commit.commit.author.date).toLocaleString()}
        </p>
        <p>{commit.commit.message}</p>
      </div>
    </div>
  );
};

export default CommitModal;
