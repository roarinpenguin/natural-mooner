import React, { useState, useEffect } from 'react';
import { Copy, Check, Settings, Sparkles, Moon, Heart } from 'lucide-react';
import NeumorphicCard from './components/NeumorphicCard';
import NeumorphicButton from './components/NeumorphicButton';
import NeumorphicInput from './components/NeumorphicInput';
import { useTranslation } from './hooks/useTranslation';

function App() {
  const [direction, setDirection] = useState('nl_to_lua');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  const { translate, fetchModels, loading, error } = useTranslation();

  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key');
    const storedModel = localStorage.getItem('openai_model');
    const storedTotalCost = localStorage.getItem('openai_usage_total_usd');
    if (storedKey) setApiKey(storedKey);
    if (storedModel) setModel(storedModel);
    if (storedTotalCost) setTotalCost(Number(storedTotalCost) || 0);
  }, []);

  const handleSaveKey = (val) => {
    setApiKey(val);
    localStorage.setItem('openai_api_key', val);
  };

  const handleSaveModel = (val) => {
    setModel(val);
    localStorage.setItem('openai_model', val);
  };

  useEffect(() => {
    const loadModels = async () => {
      if (!apiKey) {
        setModels([]);
        return;
      }
      setModelsLoading(true);
      try {
        const data = await fetchModels(apiKey);
        setModels(data.models);
        if (!model || !data.models.some((item) => item.id === model)) {
          handleSaveModel(data.default_model);
        }
      } catch (e) {
        setModels([]);
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, [apiKey]);

  const selectedModel = models.find((item) => item.id === model);

  const handleTranslate = async () => {
    if (!input.trim() || !apiKey || !model) return;
    try {
      const result = await translate(input, direction, apiKey, model);
      setOutput(result.result_text);
      setEstimatedCost(result.estimated_cost_usd || 0);
      const nextTotalCost = Number((totalCost + (result.estimated_cost_usd || 0)).toFixed(6));
      setTotalCost(nextTotalCost);
      localStorage.setItem('openai_usage_total_usd', String(nextTotalCost));
    } catch (e) {
      setEstimatedCost(0);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      <div className={`w-full max-w-3xl transition-all duration-300 overflow-hidden relative z-10 ${showSettings ? 'max-h-[420px] mb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
        <NeumorphicCard title="Configuration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-sm text-text-muted mb-2 block ml-1">OpenAI API Key</label>
              <NeumorphicInput
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-text-muted mb-2 block ml-1">Supported Model</label>
              <select
                value={model}
                onChange={(e) => handleSaveModel(e.target.value)}
                className="w-full bg-bg-dark/90 rounded-xl px-4 py-3 text-text-main outline-none transition-all shadow-neu-purple-in border border-primary/10 focus:border-primary/35"
                disabled={!apiKey || modelsLoading || models.length === 0}
              >
                {!apiKey && <option value="">Enter your API key first</option>}
                {apiKey && modelsLoading && <option value="">Loading models...</option>}
                {apiKey && !modelsLoading && models.length === 0 && <option value="">No supported models found</option>}
                {models.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl bg-bg-elevated/70 shadow-neu-purple-in border border-primary/10 px-4 py-3 text-sm">
              <div className="text-text-muted">Estimated pricing for selected model</div>
              <div className="mt-1 text-primary-soft font-semibold">
                {selectedModel
                  ? `$${selectedModel.input_cost_per_million}/1M in · $${selectedModel.output_cost_per_million}/1M out`
                  : 'Unavailable'}
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
                onClick={() => setDirection('nl_to_lua')}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${direction === 'nl_to_lua' ? 'bg-bg-elevated shadow-neu-purple text-primary-soft border border-primary/10' : 'text-text-muted hover:text-text-main'}`}
              >
                Natural Language
              </button>
              <button
                onClick={() => setDirection('lua_to_nl')}
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
              disabled={loading || !input || !apiKey || !model}
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
            <div className="absolute top-6 right-6">
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
    </div>
  );
}

export default App;
