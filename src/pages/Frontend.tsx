import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Circle, Loader2, Sparkles, Wand2, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { repoExamples } from '../data/repoExamples';
import {
  createRepoGenerationJob,
  fetchTemplateDefinitions,
  fetchRepoGenerationJob,
  type PreviewResponse,
} from '../lib/repoLaunch';
import type { GenerationJob, GenerationPhase } from '../types/generationJob';
import type { TemplateDefinition } from '../types/template';
import '../styles/landing-page.css';

const heroReveal = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
};

const sectionReveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

const supportPoints = [
  {
    title: 'Read like a product',
    copy: 'The repo gets reframed into a story with proof, who-it-helps context, and a sharper first impression.',
  },
  {
    title: 'Generate in public',
    copy: 'People see each phase while the page is assembled, instead of waiting on an opaque spinner.',
  },
  {
    title: 'Design as a system',
    copy: 'Template 1 is the live default, and stronger community-made frontends can plug into the same engine next.',
  },
];

const pipelineSteps = [
  {
    label: 'Interpret',
    detail: 'Read the repo, the README, the maintainer profile, and the real GitHub signals.',
  },
  {
    label: 'Shape',
    detail: 'Turn that into a product story, sharper copy, and a visual direction worth shipping.',
  },
  {
    label: 'Render',
    detail: 'Publish a page that feels clear enough to share beyond GitHub.',
  },
];

function getRepoPath(repoUrl: string) {
  try {
    const parsed = new URL(repoUrl);
    const parts = parsed.pathname.replace(/^\/+/, '').split('/').filter(Boolean);

    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : repoUrl;
  } catch {
    return repoUrl;
  }
}

function getRepoSocialImage(repoUrl: string) {
  const repoPath = getRepoPath(repoUrl);
  const [owner, repo] = repoPath.split('/');

  if (!owner || !repo) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80';
  }

  return `https://opengraph.githubassets.com/supratik-space/${owner}/${repo}`;
}

const PhaseItem: React.FC<{ phase: GenerationPhase }> = ({ phase }) => {
  const stateClass =
    phase.status === 'completed'
      ? 'landing-phase landing-phase--completed'
      : phase.status === 'running'
        ? 'landing-phase landing-phase--running'
        : phase.status === 'failed'
          ? 'landing-phase landing-phase--failed'
          : 'landing-phase';

  const icon =
    phase.status === 'completed' ? (
      <CheckCircle2 size={16} />
    ) : phase.status === 'running' ? (
      <Loader2 size={16} className="landing-phase__spinner" />
    ) : (
      <Circle size={16} />
    );

  return (
    <div className={stateClass}>
      <div className="landing-phase__icon">{icon}</div>
      <div className="landing-phase__body">
        <div className="landing-phase__label">{phase.label}</div>
        <p>{phase.message}</p>
      </div>
    </div>
  );
};

const Frontend: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);

  useEffect(() => {
    let active = true;

    fetchTemplateDefinitions()
      .then((result) => {
        if (active) {
          setTemplates(result);
        }
      })
      .catch(() => {
        if (active) {
          setTemplates([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!job || !['queued', 'processing'].includes(job.status)) {
      return undefined;
    }

    let active = true;
    const timer = window.setInterval(async () => {
      try {
        const nextJob = await fetchRepoGenerationJob(job.id);

        if (!active) {
          return;
        }

        setJob(nextJob);

        if (nextJob.status === 'completed' && nextJob.slug && nextJob.previewUrl && nextJob.subdomainUrl) {
          setPreview({
            slug: nextJob.slug,
            previewUrl: nextJob.previewUrl,
            subdomainUrl: nextJob.subdomainUrl,
          });
        }

        if (nextJob.status === 'failed') {
          setError(nextJob.error || 'Generation failed.');
        }
      } catch (pollError) {
        if (active) {
          setError(pollError instanceof Error ? pollError.message : 'Could not read generation progress.');
        }
      }
    }, 1400);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [job]);

  const loading = Boolean(job && ['queued', 'processing'].includes(job.status));
  const currentPhase = job?.phases.find((phase) => phase.key === job.currentPhaseKey);
  const defaultTemplate = templates.find((template) => template.default) || templates[0] || null;

  const examplesWithMedia = useMemo(
    () =>
      repoExamples.map((example) => ({
        ...example,
        repoPath: getRepoPath(example.repoUrl),
        image: getRepoSocialImage(example.repoUrl),
      })),
    []
  );

  const featuredSample = defaultTemplate?.featuredSample || null;
  const featuredSampleImage = getRepoSocialImage(featuredSample?.repoUrl || repoExamples[1].repoUrl);
  const featuredPreviewUrl = featuredSample?.previewUrl || '';
  const promptExcerpt = defaultTemplate?.promptSuggestion
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .slice(0, 7)
    .join('\n');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setPreview(null);
    setJob(null);

    try {
      const nextJob = await createRepoGenerationJob(repoUrl, defaultTemplate?.id);
      setJob(nextJob);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to start generation.');
    }
  };

  const applyExample = (value: string) => {
    setRepoUrl(value);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      <div className="landing-page__glow landing-page__glow--one" />
      <div className="landing-page__glow landing-page__glow--two" />

      <Navbar />

      <main className="landing-main" id="top">
        <section className="landing-hero">
          <motion.div className="landing-hero__copy" {...heroReveal}>
            <div className="landing-eyebrow">
              <Sparkles size={14} />
              Supratik Space
            </div>
            <div className="landing-brandline">Repo launch pages for builders who ship in public.</div>
            <h1>Launch your repo like a real product.</h1>
            <p className="landing-hero__lede">
              Paste a public GitHub URL. We turn the repo into a page with story, proof, and a shareable first impression.
            </p>

            <form className="landing-form" onSubmit={handleSubmit}>
              <label htmlFor="repo-url" className="landing-form__label">
                Public GitHub repository
              </label>
              <div className="landing-form__row">
                <input
                  id="repo-url"
                  type="url"
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="landing-form__input"
                />
                <button type="submit" disabled={loading || !repoUrl.trim()} className="landing-button landing-button--primary">
                  {loading ? <Loader2 size={16} className="landing-button__spinner" /> : <Zap size={16} />}
                  {loading ? 'Generating' : 'Generate Page'}
                </button>
              </div>
              <p className="landing-form__note">
                Public repos only. Template 1 is the live default, and stronger community templates can plug into the same pipeline.
              </p>
            </form>

            {error && (
              <div className="landing-status landing-status--error">
                <div className="landing-status__title">Something broke.</div>
                <p>{error}</p>
              </div>
            )}

            {job && !preview && (
              <div className="landing-status">
                <div className="landing-status__title">Live generation</div>
                <p>{currentPhase?.message || 'Your repo is being shaped into a launch page.'}</p>
                <div className="landing-phase-list">
                  {job.phases.map((phase) => (
                    <PhaseItem key={phase.key} phase={phase} />
                  ))}
                </div>
              </div>
            )}

            {preview && (
              <div className="landing-status landing-status--success">
                <div className="landing-status__title">Preview ready</div>
                <p>The page is live. Open it now, or keep the subdomain for the next step.</p>
                <div className="landing-status__actions">
                  <a href={preview.previewUrl} className="landing-button landing-button--dark">
                    Open Preview
                    <ArrowUpRight size={15} />
                  </a>
                  <div className="landing-meta-chip">Expected subdomain: {preview.subdomainUrl}</div>
                  {job?.generationMode && <div className="landing-meta-chip">Mode: {job.generationMode}</div>}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div className="landing-hero__visual" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div
              className="landing-hero__frame landing-hero__frame--primary"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="landing-browser">
                <div className="landing-browser__bar">
                  <span />
                  <span />
                  <span />
                </div>
                {featuredPreviewUrl ? (
                  <iframe title="Template 1 preview" src={featuredPreviewUrl} className="landing-browser__iframe" />
                ) : (
                  <img src={featuredSampleImage} alt="Featured repo launch page preview" className="landing-browser__image" />
                )}
              </div>
            </motion.div>

            <motion.div
              className="landing-hero__frame landing-hero__frame--secondary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={featuredSampleImage} alt={featuredSample?.repoName || 'Featured GitHub repository'} className="landing-card-image" />
            </motion.div>

            <motion.div className="landing-signal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
              <div className="landing-signal__eyebrow">Live default</div>
              <div className="landing-signal__title">{defaultTemplate?.label || 'Template 1'}</div>
              <p>{featuredSample?.title || 'The current shipped direction for repo launch pages.'}</p>
              <div className="landing-signal__meta">
                <span>{featuredSample?.repoName || 'vercel/swr'}</span>
                <span>Custom CSS landing page</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <motion.section className="landing-section landing-section--support" {...sectionReveal}>
          <div className="landing-section__intro">
            <div className="landing-section__eyebrow">Why this lands better</div>
            <h2>Less README fatigue. More reason to care.</h2>
            <p>
              The homepage now behaves like a front door, not a utility panel. Product meaning, visual proof, and real repo examples do the talking faster.
            </p>
          </div>

          <div className="landing-support">
            <div className="landing-support__list">
              {supportPoints.map((point) => (
                <article key={point.title} className="landing-support__item">
                  <h3>{point.title}</h3>
                  <p>{point.copy}</p>
                </article>
              ))}
            </div>

            <div className="landing-gallery" id="examples">
              {examplesWithMedia.map((example) => (
                <button key={example.repoUrl} type="button" className="landing-gallery__item" onClick={() => applyExample(example.repoUrl)}>
                  <img src={example.image} alt={example.name} className="landing-gallery__image" />
                  <div className="landing-gallery__overlay" />
                  <div className="landing-gallery__content">
                    <div className="landing-gallery__repo">{example.repoPath}</div>
                    <div className="landing-gallery__title">
                      {example.name}
                      <ArrowUpRight size={15} />
                    </div>
                    <p>{example.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {defaultTemplate && (
          <motion.section className="landing-section landing-section--detail" {...sectionReveal}>
            <div className="landing-detail__media" id="template-1">
              <div className="landing-detail__caption">
                <span>Featured sample</span>
                <strong>{featuredSample?.repoName || 'vercel/swr'}</strong>
              </div>
              {featuredPreviewUrl ? (
                <iframe title="Template 1 featured sample" src={featuredPreviewUrl} className="landing-detail__iframe" />
              ) : (
                <img src={featuredSampleImage} alt="Template 1 sample" className="landing-detail__image" />
              )}
            </div>

            <div className="landing-detail__content" id="contribute">
              <div className="landing-section__eyebrow">Template 1 and contribution path</div>
              <h2>One live template. A cleaner runway for the next ones.</h2>
              <p>
                Template 1 is the current default, not the final visual ceiling. Contributors can bring their own design language while the shared generation engine stays intact underneath.
              </p>

              <div className="landing-detail__columns">
                <div>
                  <h3>How to add a template</h3>
                  <p>Create a new template definition, register it, render from the shared context, then open a PR.</p>
                </div>
                <div>
                  <h3>How universal updates work</h3>
                  <p>New shared repo facts ship in the platform shell first, so contributor layouts are not silently rewritten.</p>
                </div>
              </div>

              <div className="landing-detail__actions">
                <a href={defaultTemplate.repositoryUrl} target="_blank" rel="noreferrer" className="landing-button landing-button--outline">
                  Open the repository
                  <ArrowUpRight size={15} />
                </a>
                <a href={defaultTemplate.contributionsUrl} target="_blank" rel="noreferrer" className="landing-button landing-button--ghost">
                  Read contributions.md
                  <ArrowUpRight size={15} />
                </a>
              </div>

              <div className="landing-prompt">
                <div className="landing-prompt__label">Prompt starter</div>
                <pre>{promptExcerpt}</pre>
              </div>
            </div>
          </motion.section>
        )}

        <motion.section className="landing-section landing-section--final" {...sectionReveal}>
          <div className="landing-final__copy">
            <div className="landing-section__eyebrow">The product flow</div>
            <h2>Paste. Interpret. Render.</h2>
            <p>The experience should feel lightweight to the visitor, even when the pipeline is doing real work behind the scenes.</p>

            <ol className="landing-flow">
              {pipelineSteps.map((step, index) => (
                <li key={step.label} className="landing-flow__item">
                  <div className="landing-flow__index">0{index + 1}</div>
                  <div>
                    <h3>{step.label}</h3>
                    <p>{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="landing-final__aside">
            <div className="landing-final__aside-label">Use a real repo now</div>
            <div className="landing-final__repo">{repoUrl ? getRepoPath(repoUrl) : 'github.com/owner/repo'}</div>
            <p>Start from a public repo you already have, or click one of the example visuals above and generate from there.</p>
            <button type="button" className="landing-button landing-button--primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Wand2 size={16} />
              Back To Generator
            </button>
            <div className="landing-final__meta">
              <span>Open source templates</span>
              <span>Custom CSS</span>
              <span>AI-assisted repo understanding</span>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default Frontend;
