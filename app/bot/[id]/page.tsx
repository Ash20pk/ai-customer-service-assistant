'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Version {
  version: number;
  fileName: string;
  fileId: string;
  uploadedAt: string;
}

interface Bot {
  _id: string;
  name: string;
  description: string;
  versions: Version[];
  currentVersion: number;
  assistantId?: string;
}

export default function ManageBot({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [bot, setBot] = useState<Bot | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    } else {
      fetchBot();
    }
  }, [user]);

  const fetchBot = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bots/${params.id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBot(data.bot);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch bot');
      }
    } catch (error) {
      setError('An error occurred while fetching the bot');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/bots/${params.id}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        alert('Document uploaded successfully');
        setFile(null);
        fetchBot(); // Refresh bot data to show new document
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to upload document');
      }
    } catch (error) {
      alert('An error occurred while uploading the document');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!bot) return <div>Bot not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Bot: {bot.name}</h1>
      <p>{bot.description}</p>
      <p>Current Version: {bot.currentVersion}</p>
      {bot.assistantId ? (
        <p className="text-green-600">Assistant ID: {bot.assistantId}</p>
      ) : (
        <p className="text-yellow-600">No assistant created yet</p>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={handleFileChange} className="mb-4" />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={!file}>
            Upload
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Document Versions</h2>
        {bot.versions && bot.versions.length > 0 ? (
          <ul>
            {bot.versions.map((version) => (
              <li key={version.version}>
                Version {version.version}: {version.fileName} - Uploaded on: {new Date(version.uploadedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents uploaded yet.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Test Your Bot</h2>
        <Link href={`/bot/${params.id}/playground`} className="bg-green-500 text-white px-4 py-2 rounded">
          Open Playground
        </Link>
      </div>
    </div>
  );
}
