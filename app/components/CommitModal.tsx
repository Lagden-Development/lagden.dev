import React, { useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, GitCommit, ExternalLink, User, Calendar } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Card className="modal-content relative w-full max-w-2xl rounded-xl border-gray-800 bg-black">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-gray-400 hover:bg-gray-800 hover:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <CardHeader>
          <div className="flex items-start gap-3">
            <GitCommit className="mt-1 h-6 w-6 flex-shrink-0 text-gray-400" />
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                {commit.commit.message.split('\n')[0]}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 rounded-lg bg-gray-900 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Button
                variant="link"
                className="h-auto p-0 text-gray-400 hover:text-white"
                asChild
              >
                <a
                  href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <code className="font-mono">{commit.sha}</code>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User className="h-4 w-4" />
              <Button
                variant="link"
                className="h-auto p-0 text-gray-400 hover:text-white"
                asChild
              >
                <a
                  href={commit.author.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  {commit.commit.author.name}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(commit.commit.author.date).toLocaleString()}
              </span>
            </div>
          </div>

          {commit.commit.message.includes('\n') && (
            <div className="rounded-lg bg-gray-900 p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-400">
                Full Commit Message
              </h3>
              <p className="whitespace-pre-wrap text-gray-300">
                {commit.commit.message}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              className="bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <a
                href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
            <Button
              variant="secondary"
              className="bg-gray-800 text-white hover:bg-gray-700"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommitModal;
