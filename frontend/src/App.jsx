import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Settings, Sparkles, Moon, Heart, Server, Cloud, Cpu, MessageSquare } from 'lucide-react';
import NeumorphicCard from './components/NeumorphicCard';
import NeumorphicButton from './components/NeumorphicButton';
import NeumorphicInput from './components/NeumorphicInput';
import FeedbackModal from './components/FeedbackModal';
import { useTranslation } from './hooks/useTranslation';

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', icon: Cloud, needsKey: true, needsUrl: false },
  { id: 'ollama', label: 'Ollama', icon: Cpu, needsKey: false, needsUrl: true },
  { id: 'custom', label: 'Custom', icon: Server, needsKey: true, needsUrl: true },
];

const selectClass = 'w-full bg-bg-dark/90 rounded-xl px-4 py-3 text-text-main outline-none transition-all shadow-neu-purple-in border border-primary/10 focus:border-primary/35';

function App() {
  const [direction, setDirection] = useState('nl_to_lua');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const { translate, fetchModels, loading, error } = useTranslation();

  useEffect(() => {
    const s = (k) => localStorage.getItem(k) || '';
    setProvider(s('nm_provider') || 'openai');
    setApiKey(s('nm_api_key'));
    setBaseUrl(s('nm_base_url'));
    setModel(s('nm_model'));
    setTotalCost(Number(s('nm_usage_total_usd')) || 0);
  }, []);

  const persist = (key, val) => localStorage.setItem(key, val);

  const handleProvider = (val) => {
    setProvider(val);
    persist('nm_provider', val);
    setModels([]);
    setModel('');
    persist('nm_model', '');
  };

  const handleSaveKey = (val) => {
    setApiKey(val);
    persist('nm_api_key', val);
  };

  const handleSaveUrl = (val) => {
    setBaseUrl(val);
    persist('nm_base_url', val);
  };

  const handleSaveModel = useCallback((val) => {
    setModel(val);
    persist('nm_model', val);
  }, []);

  const providerCfg = PROVIDERS.find((p) => p.id === provider);

  const canLoadModels = () => {
    if (provider === 'openai') return !!apiKey;
    if (provider === 'ollama') return true;
    if (provider === 'custom') return !!apiKey && !!baseUrl;
    return false;
  };

  useEffect(() => {
    const loadModels = async () => {
      if (!canLoadModels()) {
        setModels([]);
        return;
      }
      setModelsLoading(true);
      try {
        const data = await fetchModels({ provider, apiKey, baseUrl });
        setModels(data.models);
        if (!model || !data.models.some((m) => m.id === model)) {
          handleSaveModel(data.default_model);
        }
      } catch (e) {
        setModels([]);
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, [provider, apiKey, baseUrl]);

  const selectedModel = models.find((m) => m.id === model);

  const canTranslate = input.trim() && model && canLoadModels();

  const handleTranslate = async () => {
    if (!canTranslate) return;
    try {
      const result = await translate(input, direction, { provider, apiKey, baseUrl, model });
      setOutput(result.result_text);
      setEstimatedCost(result.estimated_cost_usd || 0);
      const next = Number((totalCost + (result.estimated_cost_usd || 0)).toFixed(6));
      setTotalCost(next);
      persist('nm_usage_total_usd', String(next));
    } catch (e) {
      setEstimatedCost(0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    const response = await fetch('http://localhost:8001/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
    return await response.json();
  };

  return (
    <div className="min-h-screen bg-bg-dark p-4 md:p-8 font-sans flex flex-col items-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-24 left-8 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-6 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <header className="w-full max-w-6xl flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bg-panel rounded-full shadow-neu-purple text-primary-soft border border-primary/15">
            <Moon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-soft via-primary to-purple-400 bg-clip-text text-transparent">
              Natural Mooner
            </h1>
            <p className="text-xs text-text-muted">Lua Script Translator for Observo.ai</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-bg-panel/85 shadow-neu-purple border border-primary/10 text-xs text-text-muted min-w-[138px] text-right">
            <div className="text-[10px] uppercase tracking-[0.16em] text-primary-soft/80">Usage</div>
            <div className="text-sm font-semibold text-text-main">${totalCost.toFixed(4)}</div>
            <div className="text-[11px] text-primary-soft/80">Last: ${estimatedCost.toFixed(4)}</div>
          </div>
          <NeumorphicButton
            onClick={() => setShowSettings(!showSettings)}
            active={showSettings}
            icon={Settings}
            className="w-12 h-12 !px-0 rounded-full"
          />
        </div>
      </header>

      <div className={`w-full max-w-3xl transition-all duration-500 overflow-hidden relative z-10 ${showSettings ? 'max-h-[600px] mb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
        <NeumorphicCard title="Configuration">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-text-muted mb-2 block ml-1">Provider</label>
              <div className="flex bg-bg-panel/90 p-1.5 rounded-2xl shadow-neu-purple-in border border-primary/10 gap-1">
                {PROVIDERS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleProvider(p.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${provider === p.id ? 'bg-bg-elevated shadow-neu-purple text-primary-soft border border-primary/10' : 'text-text-muted hover:text-text-main'}`}
                    >
                      <Icon size={16} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {providerCfg?.needsUrl && (
                <div className={providerCfg?.needsKey ? '' : 'md:col-span-2'}>
                  <label className="text-sm text-text-muted mb-2 block ml-1">
                    {provider === 'ollama' ? 'Ollama Host URL' : 'Server Base URL'}
                  </label>
                  <NeumorphicInput
                    type="text"
                    placeholder={provider === 'ollama' ? 'http://localhost:11434/v1' : 'https://your-server.example.com/v1/'}
                    value={baseUrl}
                    onChange={(e) => handleSaveUrl(e.target.value)}
                  />
                </div>
              )}

              {providerCfg?.needsKey && (
                <div className={providerCfg?.needsUrl ? '' : 'md:col-span-2'}>
                  <label className="text-sm text-text-muted mb-2 block ml-1">API Key</label>
                  <NeumorphicInput
                    type="password"
                    placeholder={provider === 'openai' ? 'sk-...' : 'Your API key'}
                    value={apiKey}
                    onChange={(e) => handleSaveKey(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-text-muted mb-2 block ml-1">Model</label>
                <select
                  value={model}
                  onChange={(e) => handleSaveModel(e.target.value)}
                  className={selectClass}
                  disabled={!canLoadModels() || modelsLoading || models.length === 0}
                >
                  {!canLoadModels() && <option value="">Configure provider first</option>}
                  {canLoadModels() && modelsLoading && <option value="">Loading models...</option>}
                  {canLoadModels() && !modelsLoading && models.length === 0 && <option value="">No models found</option>}
                  {models.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-bg-elevated/70 shadow-neu-purple-in border border-primary/10 px-4 py-3 text-sm">
                <div className="text-text-muted">
                  {provider === 'ollama' ? 'Local model — no API cost' : 'Estimated pricing'}
                </div>
                <div className="mt-1 text-primary-soft font-semibold">
                  {provider === 'ollama'
                    ? 'Free (runs locally)'
                    : selectedModel
                      ? selectedModel.input_cost_per_million > 0
                        ? `$${selectedModel.input_cost_per_million}/1M in · $${selectedModel.output_cost_per_million}/1M out`
                        : 'Pricing unavailable'
                      : 'Select a model'}
                </div>
              </div>
            </div>
          </div>
        </NeumorphicCard>
      </div>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-2">
            <div className="flex bg-bg-panel/90 p-1.5 rounded-2xl shadow-neu-purple-in border border-primary/10">
              <button
                onClick={() => { setDirection('nl_to_lua'); setInput(''); setOutput(''); }}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${direction === 'nl_to_lua' ? 'bg-bg-elevated shadow-neu-purple text-primary-soft border border-primary/10' : 'text-text-muted hover:text-text-main'}`}
              >
                Natural Language
              </button>
              <button
                onClick={() => { setDirection('lua_to_nl'); setInput(''); setOutput(''); }}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${direction === 'lua_to_nl' ? 'bg-bg-elevated shadow-neu-purple text-primary-soft border border-primary/10' : 'text-text-muted hover:text-text-main'}`}
              >
                Lua Script
              </button>
            </div>
          </div>

          <NeumorphicCard title={direction === 'nl_to_lua' ? "Describe your Logic" : "Paste Lua Script"}>
            <NeumorphicInput
              multiline
              rows={12}
              placeholder={direction === 'nl_to_lua' ? "e.g., Check if the event has a 'status' field equal to 200, and if so, add a 'success' tag." : "e.g., function transform(event)..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </NeumorphicCard>

          <div className="flex justify-center">
            <NeumorphicButton
              onClick={handleTranslate}
              disabled={loading || !canTranslate}
              className="w-full max-w-xs !py-4 !text-lg !font-bold text-primary-soft"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Sparkles size={20} />
                  {direction === 'nl_to_lua' ? 'Generate Script' : 'Explain Code'}
                </>
              )}
            </NeumorphicButton>
          </div>
        </div>

        <div className="flex flex-col gap-6 h-full">
          <div className="flex justify-center mb-2 opacity-0 pointer-events-none">
            <div className="py-2"><span className="text-sm">Output</span></div>
          </div>

          <NeumorphicCard title="Result" className="h-full min-h-[400px] flex flex-col relative">
            <div className="absolute top-6 right-6 flex gap-2">
              {direction === 'nl_to_lua' && output && (
                <NeumorphicButton
                  onClick={() => setShowFeedback(true)}
                  className="!p-2 rounded-lg"
                  title="Submit corrected script"
                >
                  <MessageSquare size={18} />
                </NeumorphicButton>
              )}
              <NeumorphicButton
                onClick={copyToClipboard}
                className="!p-2 rounded-lg"
                active={copied}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </NeumorphicButton>
            </div>

            {error ? (
              <div className="flex-1 flex items-center justify-center text-red-400 p-4 text-center border border-red-900/30 rounded-xl bg-red-900/10">
                <p>{error}</p>
              </div>
            ) : (
              <div className="flex-1 bg-bg-dark/90 rounded-xl p-4 shadow-neu-purple-in font-mono text-sm overflow-auto whitespace-pre-wrap text-text-muted border border-primary/5">
                {output || <span className="text-gray-600 italic">Result will appear here...</span>}
              </div>
            )}
          </NeumorphicCard>
        </div>
      </main>

      <footer className="mt-12 text-sm relative z-10" style={{ color: '#94a3b8' }}>
        <p className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Natural Mooner.</span>
          <span>Crafted with</span>
          <Heart size={16} style={{ color: 'transparent', stroke: '#c4b5fd', strokeWidth: 2 }} />
          <span>by RoarinPenguin</span>
        </p>
      </footer>

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        originalPrompt={input}
        generatedScript={output}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}

export default App;
