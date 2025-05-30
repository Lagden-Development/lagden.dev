'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const codeSnippets = [
  {
    lang: 'typescript',
    code: `interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'active' | 'archived';
}

export async function getProjects(): Promise<Project[]> {
  const response = await fetch('/api/projects');
  const data = await response.json();
  return data;
}`,
    highlights: {
      keyword: [
        'interface',
        'export',
        'async',
        'function',
        'const',
        'await',
        'return',
      ],
      type: ['string', 'Promise', 'Project'],
      string: ["'active'", "'archived'", "'/api/projects'"],
      function: ['getProjects', 'fetch', 'json'],
    },
  },
  {
    lang: 'react',
    code: `import { Project } from '@/types';

export default function ProjectCard({ project }: Props) {
  return (
    <div className="glass-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="tags">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}`,
    highlights: {
      keyword: ['import', 'from', 'export', 'default', 'function', 'return'],
      type: ['Project', 'Props', 'ProjectCard'],
      string: ["'@/types'", '"glass-card"', '"tags"', '"tag"'],
      function: ['map'],
      tag: true,
    },
  },
  {
    lang: 'typescript',
    code: `import { useState, useEffect } from 'react';
import { getProjects } from '@/lib/api';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return { projects, loading };
}`,
    highlights: {
      keyword: [
        'import',
        'from',
        'export',
        'function',
        'const',
        'async',
        'await',
        'try',
        'finally',
        'return',
      ],
      type: ['Project', 'useState', 'useEffect'],
      string: ["'react'", "'@/lib/api'"],
      function: [
        'useState',
        'useEffect',
        'useProjects',
        'getProjects',
        'setProjects',
        'setLoading',
        'fetchProjects',
      ],
    },
  },
  {
    lang: 'typescript',
    code: `// Real-time search with debouncing
export function useSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(items);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = items.filter((item) => 
        searchFn(item, query.toLowerCase())
      );
      setResults(filtered);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, items, searchFn]);
  
  return { query, setQuery, results };
}`,
    highlights: {
      keyword: [
        'export',
        'function',
        'const',
        'return',
        'setTimeout',
        'clearTimeout',
      ],
      type: ['T', 'string', 'boolean', 'useState', 'useEffect'],
      string: ["''"],
      function: [
        'useSearch',
        'useState',
        'useEffect',
        'filter',
        'toLowerCase',
        'setResults',
        'setTimeout',
        'clearTimeout',
      ],
    },
  },
  {
    lang: 'react',
    code: `// Animated counter component
export function AnimatedCounter({ value, duration = 1000 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span className="tabular-nums">{count.toLocaleString()}</span>;
}`,
    highlights: {
      keyword: ['export', 'function', 'const', 'let', 'if', 'else', 'return'],
      type: ['number', 'useState', 'useEffect'],
      string: ['"tabular-nums"'],
      function: [
        'AnimatedCounter',
        'useState',
        'useEffect',
        'parseInt',
        'setInterval',
        'clearInterval',
        'setCount',
        'Math.floor',
        'toLocaleString',
      ],
      tag: true,
    },
  },
  {
    lang: 'typescript',
    code: `// Server action for form submission
export async function submitContactForm(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  
  const { error } = await db
    .insert(contacts)
    .values({ email, message, createdAt: new Date() });
    
  if (error) {
    return { success: false, error: 'Failed to submit' };
  }
  
  await sendEmail({
    to: email,
    subject: 'Thanks for reaching out!',
    body: \`We received your message: \${message}\`
  });
  
  return { success: true };
}`,
    highlights: {
      keyword: [
        'export',
        'async',
        'function',
        'const',
        'as',
        'if',
        'return',
        'await',
        'new',
      ],
      type: ['FormData', 'string', 'Date', 'boolean'],
      string: [
        "'use server'",
        "'email'",
        "'message'",
        "'Failed to submit'",
        "'Thanks for reaching out!'",
      ],
      function: ['submitContactForm', 'get', 'insert', 'values', 'sendEmail'],
    },
  },
  {
    lang: 'react',
    code: `// Intersection observer for animations
export function FadeInSection({ children }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    });
    
    const current = domRef.current;
    if (current) observer.observe(current);
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);
  
  return (
    <div
      ref={domRef}
      className={\`fade-in-section \${isVisible ? 'is-visible' : ''}\`}
    >
      {children}
    </div>
  );
}`,
    highlights: {
      keyword: ['export', 'function', 'const', 'new', 'if', 'return'],
      type: [
        'boolean',
        'useState',
        'useRef',
        'useEffect',
        'IntersectionObserver',
      ],
      string: ["'fade-in-section '", "' is-visible'", "''"],
      function: [
        'FadeInSection',
        'useState',
        'useRef',
        'useEffect',
        'forEach',
        'setVisible',
        'observe',
        'unobserve',
      ],
      tag: true,
    },
  },
  {
    lang: 'typescript',
    code: `// Type-safe API client with Zod
import { z } from 'zod';

const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  tags: z.array(z.string()),
  status: z.enum(['active', 'archived', 'draft'])
});

export async function fetchProject(id: string) {
  const response = await fetch(\`/api/projects/\${id}\`);
  const data = await response.json();
  
  try {
    return ProjectSchema.parse(data);
  } catch (error) {
    console.error('Invalid project data:', error);
    throw new Error('Failed to validate project');
  }
}`,
    highlights: {
      keyword: [
        'import',
        'from',
        'const',
        'export',
        'async',
        'function',
        'await',
        'try',
        'catch',
        'throw',
        'new',
      ],
      type: ['string', 'z', 'ProjectSchema'],
      string: [
        "'zod'",
        "'active'",
        "'archived'",
        "'draft'",
        "'Invalid project data:'",
        "'Failed to validate project'",
      ],
      function: [
        'object',
        'string',
        'uuid',
        'min',
        'max',
        'array',
        'enum',
        'fetchProject',
        'fetch',
        'json',
        'parse',
        'console.error',
        'Error',
      ],
    },
  },
  {
    lang: 'react',
    code: `// Optimistic UI updates
export function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [optimisticTodos, setOptimisticTodos] = useState([]);
  
  const addTodo = async (text) => {
    const tempId = \`temp-\${Date.now()}\`;
    const newTodo = { id: tempId, text, completed: false };
    
    // Optimistic update
    setOptimisticTodos([...optimisticTodos, newTodo]);
    
    try {
      const saved = await api.createTodo({ text });
      setTodos([...todos, saved]);
      setOptimisticTodos(optimisticTodos.filter(t => t.id !== tempId));
    } catch (error) {
      // Revert on error
      setOptimisticTodos(optimisticTodos.filter(t => t.id !== tempId));
      toast.error('Failed to add todo');
    }
  };
  
  const displayTodos = [...todos, ...optimisticTodos];
  
  return (
    <ul>
      {displayTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}`,
    highlights: {
      keyword: [
        'export',
        'function',
        'const',
        'async',
        'try',
        'catch',
        'return',
        'await',
      ],
      type: ['boolean', 'useState'],
      string: ["'Failed to add todo'"],
      function: [
        'TodoList',
        'useState',
        'addTodo',
        'Date.now',
        'setOptimisticTodos',
        'createTodo',
        'setTodos',
        'filter',
        'toast.error',
        'map',
      ],
      tag: true,
    },
  },
];

// Syntax highlighting helper
function highlightCode(code: string, highlights: any) {
  // Escape HTML first
  let highlightedCode = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply highlighting for different token types

  // Strings (handle quotes properly)
  if (highlights.string) {
    highlights.string.forEach((str: string) => {
      const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      highlightedCode = highlightedCode.replace(
        new RegExp(escaped, 'g'),
        `<span class="text-amber-400">${str}</span>`
      );
    });
  }

  // Tags (JSX/HTML)
  if (highlights.tag) {
    // Handle opening tags
    highlightedCode = highlightedCode.replace(
      /(&lt;\/?)(\w+)/g,
      '$1<span class="text-pink-400">$2</span>'
    );
    // Handle self-closing tags
    highlightedCode = highlightedCode.replace(
      /(\s*\/&gt;)/g,
      '<span class="text-pink-400">$1</span>'
    );
    // Handle closing brackets
    highlightedCode = highlightedCode.replace(
      /(&gt;)/g,
      '<span class="text-pink-400">$1</span>'
    );
  }

  // Keywords
  if (highlights.keyword) {
    highlights.keyword.forEach((keyword: string) => {
      highlightedCode = highlightedCode.replace(
        new RegExp(`\\b${keyword}\\b`, 'g'),
        `<span class="text-blue-400">${keyword}</span>`
      );
    });
  }

  // Types
  if (highlights.type) {
    highlights.type.forEach((type: string) => {
      highlightedCode = highlightedCode.replace(
        new RegExp(`\\b${type}\\b`, 'g'),
        `<span class="text-emerald-400">${type}</span>`
      );
    });
  }

  // Functions
  if (highlights.function) {
    highlights.function.forEach((func: string) => {
      highlightedCode = highlightedCode.replace(
        new RegExp(`\\b${func}\\b(?=\\()`, 'g'),
        `<span class="text-violet-400">${func}</span>`
      );
    });
  }

  // CSS selectors
  if (highlights.selector) {
    highlights.selector.forEach((sel: string) => {
      const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      highlightedCode = highlightedCode.replace(
        new RegExp(`^${escaped}`, 'gm'),
        `<span class="text-cyan-400">${sel}</span>`
      );
    });
  }

  // CSS properties
  if (highlights.property) {
    highlights.property.forEach((prop: string) => {
      highlightedCode = highlightedCode.replace(
        new RegExp(`\\s+${prop}`, 'g'),
        ` <span class="text-purple-400">${prop}</span>`
      );
    });
  }

  return highlightedCode;
}

export default function SplitHero() {
  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [displayedCode, setDisplayedCode] = useState('');
  const [highlightedDisplayedCode, setHighlightedDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [codeProgress, setCodeProgress] = useState(0);
  const typewriterRef = useRef<NodeJS.Timeout>();

  // Typewriter effect for code
  useEffect(() => {
    const snippet = codeSnippets[currentSnippet];
    if (!snippet) return; // Guard against undefined

    let charIndex = 0;
    setDisplayedCode('');
    setHighlightedDisplayedCode('');
    setIsTyping(true);
    setCodeProgress(0);

    const typeChar = () => {
      if (charIndex < snippet.code.length) {
        const newDisplayedCode = snippet.code.slice(0, charIndex + 1);
        setDisplayedCode(newDisplayedCode);

        // Apply syntax highlighting to the displayed portion
        const highlighted = highlightCode(newDisplayedCode, snippet.highlights);
        setHighlightedDisplayedCode(highlighted);

        // Update progress
        setCodeProgress((charIndex / snippet.code.length) * 100);

        charIndex++;
        typewriterRef.current = setTimeout(typeChar, 20);
      } else {
        setIsTyping(false);
        setCodeProgress(100);
        setTimeout(() => {
          setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length);
        }, 3000);
      }
    };

    typeChar();

    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [currentSnippet]);

  // Remove canvas animation effect

  return (
    <section className="relative mb-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid min-h-[600px] grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Code Side */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-xs text-gray-500">
                    {codeSnippets[currentSnippet]?.lang || 'typescript'}
                  </span>
                </div>

                <div className="min-h-[280px]">
                  <pre className="whitespace-pre-wrap break-words">
                    <code
                      className="block font-mono text-sm leading-relaxed text-gray-300"
                      dangerouslySetInnerHTML={{
                        __html:
                          highlightedDisplayedCode +
                          (isTyping
                            ? '<span class="inline-block h-4 w-[2px] animate-pulse bg-violet-400" style="margin-left: -2px;" />'
                            : ''),
                      }}
                    />
                  </pre>
                </div>
              </div>
            </div>

            {/* Floating code symbols */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="animate-float absolute opacity-20"
                style={{
                  left: '10%',
                  top: '20%',
                  animationDelay: '0s',
                  animationDuration: '20s',
                }}
              >
                <span className="font-mono text-2xl text-violet-400">
                  {'<'}
                </span>
              </div>
              <div
                className="animate-float absolute opacity-20"
                style={{
                  left: '80%',
                  top: '10%',
                  animationDelay: '3s',
                  animationDuration: '25s',
                }}
              >
                <span className="font-mono text-2xl text-violet-400">
                  {'/>'}
                </span>
              </div>
              <div
                className="animate-float absolute opacity-20"
                style={{
                  left: '60%',
                  top: '70%',
                  animationDelay: '6s',
                  animationDuration: '22s',
                }}
              >
                <span className="font-mono text-2xl text-violet-400">
                  {'{ }'}
                </span>
              </div>
              <div
                className="animate-float absolute opacity-20"
                style={{
                  left: '20%',
                  top: '80%',
                  animationDelay: '9s',
                  animationDuration: '28s',
                }}
              >
                <span className="font-mono text-2xl text-violet-400">
                  {'( )'}
                </span>
              </div>
              <div
                className="animate-float absolute opacity-20"
                style={{
                  left: '40%',
                  top: '40%',
                  animationDelay: '12s',
                  animationDuration: '24s',
                }}
              >
                <span className="font-mono text-2xl text-violet-400">
                  {';'}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-[400px] w-full max-w-lg overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
              <div className="flex h-full flex-col items-center justify-center p-8">
                {/* Animated UI Preview */}
                <div className="relative w-full">
                  {/* Browser window frame */}
                  <div className="rounded-t-lg bg-gray-900/80 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/80" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                      <div className="h-3 w-3 rounded-full bg-green-500/80" />
                      <div className="ml-4 flex-1 rounded bg-gray-800/50 py-1 text-center text-xs text-gray-500">
                        lagden.dev
                      </div>
                    </div>
                  </div>

                  {/* Dynamic preview based on current code */}
                  <div className="relative overflow-hidden rounded-b-lg bg-black/50 p-4">
                    {currentSnippet === 0 && (
                      // Interface/API visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          API Response Preview
                        </div>
                        <div className="rounded border border-gray-700 bg-gray-900/50 p-3">
                          <div className="font-mono text-xs">
                            <div
                              style={{ opacity: codeProgress > 20 ? 1 : 0.2 }}
                              className="transition-opacity duration-500"
                            >
                              <span className="text-purple-400">{'{'}</span>
                            </div>
                            <div
                              style={{ opacity: codeProgress > 30 ? 1 : 0.2 }}
                              className="ml-4 transition-opacity duration-500"
                            >
                              <span className="text-cyan-400">{'"id"'}</span>:{' '}
                              <span className="text-amber-400">
                                {'"proj-123"'}
                              </span>
                              ,
                            </div>
                            <div
                              style={{ opacity: codeProgress > 40 ? 1 : 0.2 }}
                              className="ml-4 transition-opacity duration-500"
                            >
                              <span className="text-cyan-400">{'"title"'}</span>
                              :{' '}
                              <span className="text-amber-400">
                                {'"Lagden Website"'}
                              </span>
                              ,
                            </div>
                            <div
                              style={{ opacity: codeProgress > 50 ? 1 : 0.2 }}
                              className="ml-4 transition-opacity duration-500"
                            >
                              <span className="text-cyan-400">
                                {'"status"'}
                              </span>
                              :{' '}
                              <span className="text-emerald-400">
                                {'"active"'}
                              </span>
                            </div>
                            <div
                              style={{ opacity: codeProgress > 60 ? 1 : 0.2 }}
                              className="transition-opacity duration-500"
                            >
                              <span className="text-purple-400">{'}'}</span>
                            </div>
                          </div>
                        </div>
                        <div
                          style={{ opacity: codeProgress > 80 ? 1 : 0 }}
                          className="translate-y-2 transform transition-all duration-500"
                        >
                          <div className="text-xs text-emerald-400">
                            ✓ Data fetched successfully
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSnippet === 1 && (
                      // Component visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          Component Preview
                        </div>
                        <div
                          className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-4 transition-all duration-500"
                          style={{
                            transform: `scale(${0.8 + codeProgress / 500})`,
                            opacity: codeProgress > 10 ? 1 : 0.3,
                          }}
                        >
                          <h3
                            className="mb-2 font-semibold text-white"
                            style={{ opacity: codeProgress > 30 ? 1 : 0 }}
                          >
                            Lagden Website
                          </h3>
                          <p
                            className="mb-3 text-sm text-gray-400"
                            style={{ opacity: codeProgress > 40 ? 1 : 0 }}
                          >
                            A modern portfolio website built with Next.js
                          </p>
                          <div
                            className="flex gap-2"
                            style={{ opacity: codeProgress > 60 ? 1 : 0 }}
                          >
                            <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs text-violet-300">
                              React
                            </span>
                            <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs text-violet-300">
                              Next.js
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSnippet === 2 && (
                      // Hook visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          Hook State Preview
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${codeProgress < 70 ? 'animate-pulse bg-yellow-500' : 'bg-emerald-500'}`}
                            />
                            <span className="text-xs text-gray-400">
                              {codeProgress < 70 ? 'Loading...' : 'Data loaded'}
                            </span>
                          </div>
                          <div
                            className="space-y-1"
                            style={{ opacity: codeProgress > 80 ? 1 : 0.3 }}
                          >
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="animate-fade-in h-8 rounded bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {codeProgress < 50
                              ? 'Fetching projects...'
                              : `${3} projects loaded`}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSnippet === 3 && (
                      // Search visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          Real-time Search
                        </div>
                        <input
                          type="text"
                          placeholder="Search..."
                          className="w-full rounded border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                          style={{ opacity: codeProgress > 30 ? 1 : 0.3 }}
                        />
                        <div className="space-y-2">
                          {codeProgress > 50 && (
                            <>
                              <div className="animate-fade-in h-8 rounded bg-violet-500/10" />
                              {codeProgress > 60 && (
                                <div
                                  className="animate-fade-in h-8 rounded bg-violet-500/10"
                                  style={{ animationDelay: '0.1s' }}
                                />
                              )}
                              {codeProgress > 70 && (
                                <div
                                  className="animate-fade-in h-8 rounded bg-violet-500/10"
                                  style={{ animationDelay: '0.2s' }}
                                />
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {codeProgress < 40
                            ? 'Waiting for input...'
                            : codeProgress < 80
                              ? 'Debouncing...'
                              : '3 results found'}
                        </div>
                      </div>
                    )}

                    {currentSnippet === 4 && (
                      // Counter animation visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          Animated Counter
                        </div>
                        <div className="text-center">
                          <div className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-6xl font-bold tabular-nums text-transparent">
                            {Math.floor(codeProgress * 12.34)}
                          </div>
                          <div className="mt-2 text-sm text-gray-400">
                            {codeProgress < 100
                              ? 'Counting...'
                              : 'Animation complete'}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSnippet === 5 && (
                      // Form submission visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          Server Action
                        </div>
                        <div className="space-y-2">
                          <input
                            type="email"
                            placeholder="Email"
                            className="w-full rounded border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm"
                            style={{ opacity: codeProgress > 20 ? 1 : 0.3 }}
                          />
                          <textarea
                            placeholder="Message"
                            className="h-16 w-full rounded border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm"
                            style={{ opacity: codeProgress > 30 ? 1 : 0.3 }}
                          />
                          <button
                            className={`w-full rounded px-3 py-2 text-sm font-medium transition-all ${
                              codeProgress > 70
                                ? 'bg-violet-500 text-white'
                                : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {codeProgress < 50
                              ? 'Submit'
                              : codeProgress < 80
                                ? 'Sending...'
                                : '✓ Sent!'}
                          </button>
                        </div>
                      </div>
                    )}

                    {currentSnippet === 6 && (
                      // Intersection observer visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          Scroll Animation
                        </div>
                        <div className="relative h-32 overflow-hidden rounded border border-gray-700">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className={`rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-4 transition-all duration-1000 ${
                                codeProgress > 60
                                  ? 'translate-y-0 opacity-100'
                                  : 'translate-y-8 opacity-0'
                              }`}
                            >
                              <div className="text-sm font-medium text-white">
                                Element in view!
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                            {codeProgress < 60
                              ? 'Scroll to reveal...'
                              : 'Animation triggered'}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSnippet === 7 && (
                      // Zod validation visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          Type Validation
                        </div>
                        <div className="space-y-2">
                          <div className="rounded border border-gray-700 bg-gray-900/50 p-2">
                            <div className="font-mono text-xs">
                              <div
                                className={
                                  codeProgress > 30
                                    ? 'text-emerald-400'
                                    : 'text-gray-500'
                                }
                              >
                                ✓ id: valid UUID
                              </div>
                              <div
                                className={
                                  codeProgress > 40
                                    ? 'text-emerald-400'
                                    : 'text-gray-500'
                                }
                              >
                                ✓ title: 1-100 chars
                              </div>
                              <div
                                className={
                                  codeProgress > 50
                                    ? 'text-emerald-400'
                                    : 'text-gray-500'
                                }
                              >
                                ✓ tags: string[]
                              </div>
                              <div
                                className={
                                  codeProgress > 60
                                    ? 'text-emerald-400'
                                    : 'text-gray-500'
                                }
                              >
                                ✓ status: enum match
                              </div>
                            </div>
                          </div>
                          <div className="text-center text-xs">
                            {codeProgress < 80 ? (
                              'Validating schema...'
                            ) : (
                              <span className="text-emerald-400">
                                All checks passed!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSnippet === 8 && (
                      // Optimistic updates visualization
                      <div className="space-y-3">
                        <div className="mb-2 text-xs text-gray-500">
                          Optimistic Updates
                        </div>
                        <div className="space-y-2">
                          <div className="rounded bg-violet-500/10 p-2 text-sm">
                            ✓ Buy groceries
                          </div>
                          <div className="rounded bg-violet-500/10 p-2 text-sm">
                            ✓ Walk the dog
                          </div>
                          {codeProgress > 40 && (
                            <div
                              className={`rounded p-2 text-sm transition-all duration-500 ${
                                codeProgress > 70
                                  ? 'bg-violet-500/10'
                                  : 'bg-gray-700/50 opacity-60'
                              }`}
                            >
                              {codeProgress > 70 ? '✓' : '⏳'} New todo item
                            </div>
                          )}
                        </div>
                        <div className="text-center text-xs text-gray-500">
                          {codeProgress < 40
                            ? 'Ready'
                            : codeProgress < 70
                              ? 'Adding optimistically...'
                              : 'Saved to database'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <h2 className="mb-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent">
                    From Code to Creation
                  </h2>
                  <p className="text-sm text-gray-400">
                    Building beautiful, functional experiences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
