import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Github, Loader2, Sparkles, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { repoExamples } from '../data/repoExamples';
import { createRepoPreview } from '../lib/repoLaunch';
import type { PreviewResponse } from '../lib/repoLaunch';

const Frontend: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = await createRepoPreview(repoUrl);
      setPreview(payload);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : 'Failed to generate the launch page.');
    } finally {
      setLoading(false);
    }
  };

  const applyExample = (value: string) => {
    setRepoUrl(value);
    setError('');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-700 selection:bg-emerald-500/20">
      <div className="mesh-bg" />

      <Navbar />

      <main className="relative z-10 px-6 pb-24 pt-28">
        <section className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="pt-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.32em] text-emerald-600 shadow-sm"
              >
                <Sparkles size={12} />
                Repo To Launch Page
              </motion.div>

              <h1 className="mt-8 text-5xl font-display font-black leading-[0.95] text-slate-900 sm:text-6xl lg:text-7xl">
                Turn any public <span className="text-gradient">GitHub repo</span> into a launch page.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-slate-500">
                Paste a repo. We pull the important story out of the code, README, and project signals, then give you a cleaner page to share.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ['Fast first impression', 'A better page than a raw repo landing.'],
                  ['Grounded in the repo', 'Reads actual GitHub metadata and README content.'],
                  ['Share-ready output', 'Open a clean preview and circulate it right away.'],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)]">
                    <div className="text-sm font-bold uppercase tracking-[0.16em] text-slate-800">{title}</div>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.75rem] border border-slate-200 bg-white p-7 shadow-[0_35px_90px_-50px_rgba(15,23,42,0.45)] lg:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">Generate Preview</div>
                  <h2 className="mt-3 text-2xl font-display font-black text-slate-900">Paste a public GitHub URL.</h2>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500">
                  <Github size={20} />
                </div>
              </div>

              <form className="mt-6" onSubmit={handleSubmit}>
                <label htmlFor="repo-url" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Repository URL
                </label>
                <input
                  id="repo-url"
                  type="url"
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Public GitHub repositories only for now. Tree paths are accepted and gracefully narrowed to the repo source.
                </p>

                <button
                  type="submit"
                  disabled={loading || !repoUrl.trim()}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-slate-900 px-5 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  {loading ? 'Generating Preview' : 'Generate Launch Page'}
                </button>
              </form>

              {error && (
                <div className="mt-6 rounded-[1.75rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-7 text-rose-600">
                  {error}
                </div>
              )}

              {preview && (
                <div className="mt-6 rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 text-emerald-600" size={18} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-600">Preview Ready</div>
                      <p className="mt-3 text-sm leading-7 text-emerald-800">
                        Your generated page is ready. Open the preview now, or use the expected wildcard subdomain URL when your DNS is pointed.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    <a
                      href={preview.previewUrl}
                      className="inline-flex items-center justify-center gap-2 rounded-[1.2rem] bg-emerald-600 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
                    >
                      Open Preview
                      <ArrowUpRight size={15} />
                    </a>
                    <div className="rounded-[1.2rem] border border-emerald-200 bg-white px-4 py-3 text-xs font-mono text-slate-500">
                      Expected subdomain: {preview.subdomainUrl}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl">
          <div className="mb-6 text-center">
            <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-slate-400">Examples</div>
            <h2 className="mt-3 text-3xl font-display font-black text-slate-900">Use your repo as the starting point.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              These examples are here so a busy builder can understand the product in one pass.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {repoExamples.map((example) => (
              <button
                key={example.repoUrl}
                onClick={() => applyExample(example.repoUrl)}
                className="rounded-[2.2rem] border border-slate-200 bg-white p-6 text-left shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-emerald-200"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold uppercase tracking-[0.16em] text-slate-800">{example.name}</div>
                  <ArrowUpRight size={16} className="text-slate-400" />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-500">{example.description}</p>
                <div className="mt-5 rounded-[1rem] bg-slate-50 px-4 py-3 text-xs font-mono text-slate-500">{example.repoUrl}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl rounded-[2.75rem] border border-slate-200 bg-white p-8 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">How It Works</div>
              <h2 className="mt-4 text-3xl font-display font-black text-slate-900">A narrow flow built for speed.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                This first slice focuses on the fastest real outcome: a better page for a public repository.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['1', 'Paste the repo', 'Drop in a public GitHub URL and let the system validate it.'],
                ['2', 'Generate the story', 'We derive the project framing from GitHub signals and README content.'],
                ['3', 'Open the launch page', 'Share the preview immediately and claim deeper controls later.'],
              ].map(([step, title, copy]) => (
                <div key={step} className="rounded-[2rem] bg-slate-50 p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">
                    {step}
                  </div>
                  <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-800">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Frontend;
