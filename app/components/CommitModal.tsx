import React, { useEffect } from "react";

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
  const handleClickOutside = (event: MouseEvent) => {
    const modalContent = document.querySelector(".modal-content");
    if (modalContent && !modalContent.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="modal-content bg-gray-900 text-white p-8 rounded-lg max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold mb-4">
          {commit.commit.message.length > 50
            ? `${commit.commit.message.substring(0, 50)}...`
            : commit.commit.message}
        </h2>
        <p className="text-gray-400 mb-4">
          <a
            href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
            target="_blank"
            className="underline"
          >
            {commit.sha}
          </a>
          {" - "}
          <a
            href={commit.author.html_url}
            target="_blank"
            className="underline"
          >
            {commit.commit.author.name}
          </a>
          {" - "}
          {new Date(commit.commit.author.date).toLocaleString()}
        </p>
        <p>{commit.commit.message}</p>
      </div>
    </div>
  );
};

export default CommitModal;
