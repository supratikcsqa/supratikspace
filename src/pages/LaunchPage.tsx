import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUpRight, Copy, Github, Loader2, Sparkles } from 'lucide-react';
import { createRepoGenerationJob, fetchLaunchPage, fetchRepoGenerationJob } from '../lib/repoLaunch';
import type { LaunchPageData } from '../types/launchPage';
import type { GenerationJob } from '../types/generationJob';

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)]">
    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">{label}</div>
    <div className="mt-2 text-2xl font-display font-black text-slate-900">{value}</div>
  </div>
);

const PlatformShellModuleCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <section
    style={{
      border: '1px solid rgba(23,23,23,0.08)',
      borderRadius: '24px',
      background: 'rgba(255,255,255,0.92)',
      padding: '18px',
      boxShadow: '0 20px 60px rgba(23,23,23,0.05)',
    }}
  >
    <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b665f' }}>{title}</div>
    <p style={{ margin: '10px 0 0', fontSize: '14px', lineHeight: 1.7, color: '#6b665f' }}>{description}</p>
    <div style={{ marginTop: '16px' }}>{children}</div>
  </section>
);

const LaunchPage: React.FC<{ forcedSlug?: string }> = ({ forcedSlug }) => {
  const params = useParams<{ slug: string }>();
  const slug = forcedSlug || params.slug || '';
  const [page, setPage] = useState<LaunchPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [regenerationJob, setRegenerationJob] = useState<GenerationJob | null>(null);
  const [regenerationError, setRegenerationError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!slug) {
        setError('This launch page does not have a valid slug.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const payload = await fetchLaunchPage(slug);

        if (active) {
          setPage(payload);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load this launch page.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!regenerationJob || !['queued', 'processing'].includes(regenerationJob.status)) {
      return undefined;
    }

    let active = true;
    const timer = window.setInterval(async () => {
      try {
        const nextJob = await fetchRepoGenerationJob(regenerationJob.id);

        if (!active) {
          return;
        }

        setRegenerationJob(nextJob);

        if (nextJob.status === 'completed') {
          window.clearInterval(timer);
          window.location.assign(nextJob.previewUrl || `/launch/${nextJob.slug || slug}`);
        }

        if (nextJob.status === 'failed') {
          setRegenerationError(nextJob.error || 'AI regeneration failed.');
        }
      } catch (pollError) {
        if (active) {
          setRegenerationError(pollError instanceof Error ? pollError.message : 'Could not read regeneration progress.');
        }
      }
    }, 1400);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [regenerationJob, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700">
        <div className="mesh-bg" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white px-8 py-10 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
            <Loader2 className="mx-auto mb-4 animate-spin text-emerald-500" size={28} />
            <div className="text-sm font-medium text-slate-500">Loading launch page...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700">
        <div className="mesh-bg" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="max-w-lg rounded-[2rem] border border-rose-200 bg-white px-8 py-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
            <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.3em] text-rose-500">Launch Page Error</div>
            <h1 className="text-3xl font-display font-black text-slate-900">This page is not ready.</h1>
            <p className="mt-4 text-sm leading-7 text-slate-500">{error || 'The generated page could not be found.'}</p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white"
            >
              Back To Supratik Space
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(page.source.repoUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleRegenerate = async () => {
    setRegenerationError('');

    try {
      const job = await createRepoGenerationJob(page.source.repoUrl);
      setRegenerationJob(job);
    } catch (regenerateError) {
      setRegenerationError(regenerateError instanceof Error ? regenerateError.message : 'Could not start AI regeneration.');
    }
  };

  if (page.renderedHtml) {
    const platformShell = page.platformShell;

    return (
      <div style={{ minHeight: '100vh', background: '#f5f4ef', color: '#171717' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '18px 14px 40px' }}>
          <header
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '14px',
              padding: '16px 18px',
              border: '1px solid rgba(23,23,23,0.08)',
              borderRadius: '28px',
              background: 'rgba(255,255,255,0.88)',
              boxShadow: '0 24px 64px rgba(23,23,23,0.06)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b665f' }}>
                Generated Launch Page
              </div>
              <div style={{ marginTop: '8px', fontSize: '20px', fontWeight: 800 }}>
                {page.source.owner}/{page.source.repo}
              </div>
              {page.design && (
                <p style={{ margin: '8px 0 0', maxWidth: '760px', fontSize: '14px', lineHeight: 1.7, color: '#6b665f' }}>
                  {page.design.themeName} via {page.design.provider} | {page.design.visualDirection}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <a
                href={page.source.repoUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(23,23,23,0.08)',
                  background: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#171717',
                }}
              >
                <Github size={15} />
                View Repo
              </a>
              <button
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(23,23,23,0.08)',
                  background: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#4b5563',
                  cursor: 'pointer',
                }}
              >
                <Copy size={15} />
                {copied ? 'Copied' : 'Copy Repo URL'}
              </button>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '999px',
                  background: '#171717',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                <Sparkles size={15} />
                Generate Yours
              </Link>
            </div>
          </header>

          {platformShell && (
            <div
              style={{
                display: 'grid',
                gap: '14px',
                marginBottom: '14px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              }}
            >
              <section
                style={{
                  gridColumn: '1 / -1',
                  border: '1px solid rgba(23,23,23,0.08)',
                  borderRadius: '24px',
                  background:
                    platformShell.compatibility.status === 'supported' ? 'rgba(232,245,238,0.92)' : 'rgba(255,248,231,0.92)',
                  padding: '18px',
                  boxShadow: '0 20px 60px rgba(23,23,23,0.04)',
                }}
              >
                <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b665f' }}>
                  Platform shell v{platformShell.version} | Template contract {platformShell.compatibility.status}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '14px', lineHeight: 1.7, color: '#3f3a34' }}>
                  {platformShell.compatibility.message}
                </p>
                <p style={{ margin: '10px 0 0', fontSize: '13px', lineHeight: 1.7, color: '#6b665f' }}>
                  Additive updates roll into the platform shell first. Template-body adoption stays opt-in for maintainers.
                </p>
              </section>

              {platformShell.universalModules.map((module) => (
                <PlatformShellModuleCard key={module.id} title={module.title} description={module.description}>
                  {module.kind === 'stats' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                      {module.items.map((item) => (
                        <div
                          key={`${module.id}-${item.label}`}
                          style={{
                            borderRadius: '18px',
                            border: '1px solid rgba(23,23,23,0.08)',
                            background: '#ffffff',
                            padding: '14px',
                          }}
                        >
                          <div style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a8379' }}>
                            {item.label}
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '22px', fontWeight: 800 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {module.items.map((item) => (
                        <a
                          key={`${module.id}-${item.label}`}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 14px',
                            borderRadius: '999px',
                            border: '1px solid rgba(23,23,23,0.08)',
                            background: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                          }}
                        >
                          <span>{item.label}</span>
                          <span style={{ color: '#6b665f', fontWeight: 500 }}>{item.value}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </PlatformShellModuleCard>
              ))}
            </div>
          )}

          <div
            style={{
              overflow: 'hidden',
              borderRadius: '30px',
              border: '1px solid rgba(23,23,23,0.08)',
              background: '#ffffff',
              boxShadow: '0 28px 80px rgba(23,23,23,0.08)',
            }}
          >
            <iframe
              title={`${page.source.repo} launch page`}
              srcDoc={page.renderedHtml}
              style={{ width: '100%', height: 'calc(100vh - 9rem)', border: 0, display: 'block' }}
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            />
          </div>

          {platformShell && (
            <section
              style={{
                marginTop: '14px',
                border: '1px solid rgba(23,23,23,0.08)',
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.92)',
                padding: '18px',
                boxShadow: '0 20px 60px rgba(23,23,23,0.05)',
              }}
            >
              <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b665f' }}>
                {platformShell.attribution.title}
              </div>
              <p style={{ margin: '10px 0 0', fontSize: '14px', lineHeight: 1.7, color: '#6b665f' }}>
                {platformShell.attribution.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
                {platformShell.attribution.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '999px',
                      border: '1px solid rgba(23,23,23,0.08)',
                      background: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    {link.label}
                    <ArrowUpRight size={14} />
                  </a>
                ))}
              </div>
              {page.template?.updatePolicy?.ethics && (
                <p style={{ margin: '14px 0 0', fontSize: '13px', lineHeight: 1.8, color: '#6b665f' }}>
                  {page.template.updatePolicy.ethics}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <div className="mesh-bg" />

      <div className="relative z-10 px-6 pb-24 pt-8">
        <div className="mx-auto max-w-6xl">
          {page.legacy && (
            <div className="mb-6 rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.35)]">
              <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-amber-600">Legacy Preview</div>
              <p className="mt-3 text-sm leading-7 text-amber-900">
                This page was generated before the AI interpretation and rendered-html flow shipped. Regenerate it to see the repo meaning layer, audience framing, and the new designed output.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={Boolean(regenerationJob && ['queued', 'processing'].includes(regenerationJob.status))}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {regenerationJob && ['queued', 'processing'].includes(regenerationJob.status) ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Regenerating With AI
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Regenerate With AI
                    </>
                  )}
                </button>
                {regenerationError && <div className="text-sm leading-7 text-rose-600">{regenerationError}</div>}
              </div>
            </div>
          )}

          <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-5 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-emerald-500">Repo Launch Page</div>
              <div className="mt-2 text-lg font-display font-black text-slate-900">
                {page.source.owner}/{page.source.repo}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={page.source.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              >
                <Github size={15} />
                View Repo
              </a>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                <Copy size={15} />
                {copied ? 'Copied' : 'Copy Repo URL'}
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5"
              >
                <Sparkles size={15} />
                Generate Yours
              </Link>
            </div>
          </header>

          <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)] lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-emerald-600">
                Repo To Launch Page
              </div>
              <h1 className="mt-6 text-4xl font-display font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {page.hero.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg font-light leading-8 text-slate-500">{page.hero.tagline}</p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{page.hero.description}</p>

              <div className="mt-8 flex flex-wrap gap-2">
                {page.hero.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {page.metrics.map((metric) => (
                  <MetricCard key={metric.label} label={metric.label} value={metric.value} />
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)]">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Why This Page Exists</div>
                <div className="mt-4 space-y-4">
                  {page.highlights.map((highlight) => (
                    <div key={highlight.title} className="rounded-3xl bg-slate-50 p-4">
                      <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-800">{highlight.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-500">{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {page.languageBreakdown.length > 0 && (
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)]">
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Stack Signals</div>
                  <div className="mt-4 space-y-3">
                    {page.languageBreakdown.map((language) => (
                      <div key={language.name}>
                        <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                          <span>{language.name}</span>
                          <span>{language.share}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${language.share}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </section>

          {page.quickstart.length > 0 && (
            <section className="mt-8 rounded-[2.5rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-[0_35px_90px_-50px_rgba(15,23,42,0.55)] lg:p-10">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-300">Quickstart</div>
              <div className="mt-6 grid gap-8 lg:grid-cols-[0.65fr_1fr]">
                <div>
                  <h2 className="text-3xl font-display font-black">Get to the first run fast.</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    These commands were pulled out as the quickest credible path into the repository.
                  </p>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
                  <pre className="overflow-x-auto text-sm leading-8 text-slate-100">
                    <code>{page.quickstart.join('\n')}</code>
                  </pre>
                </div>
              </div>
            </section>
          )}

          <section className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)]">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Core Takeaways</div>
              <ul className="mt-6 space-y-4">
                {page.features.map((feature) => (
                  <li key={feature} className="rounded-3xl bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)]">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">README Grounding</div>
              <div className="mt-6 space-y-6">
                {page.readmeLead.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-slate-600">
                    {paragraph}
                  </p>
                ))}
                {page.readmeSections.map((section) => (
                  <div key={section.title} className="rounded-[2rem] bg-slate-50 p-5">
                    <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-800">{section.title}</h2>
                    {section.body && <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>}
                    {section.bullets.length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-400">Generated By Supratik Space</div>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Want a page like this for your own repo? Paste a public GitHub URL and generate one in minutes.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-500/20"
              >
                Generate Mine
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;
