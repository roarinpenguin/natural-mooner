import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import NeumorphicButton from './NeumorphicButton';

const FeedbackModal = ({ isOpen, onClose, originalPrompt, generatedScript, onSubmit }) => {
  const [correctedScript, setCorrectedScript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!correctedScript.trim()) {
      alert('Please provide a corrected script');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        original_prompt: originalPrompt,
        generated_script: generatedScript,
        corrected_script: correctedScript,
        error_message: errorMessage || null,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setCorrectedScript('');
        setErrorMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      alert('Failed to submit feedback: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-panel rounded-3xl shadow-2xl border border-primary/20 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <AlertCircle size={24} className="text-primary-soft" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main">Submit Corrected Script</h2>
              <p className="text-sm text-text-muted">Help improve future translations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-dark/50 rounded-xl transition-colors"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-sm text-text-muted mb-2 block ml-1">Original Prompt</label>
            <div className="bg-bg-dark/50 rounded-xl p-4 text-sm text-text-main border border-primary/10">
              {originalPrompt}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-muted mb-2 block ml-1">Generated Script (Failed)</label>
            <textarea
              readOnly
              value={generatedScript}
              className="w-full bg-bg-dark/50 rounded-xl p-4 text-sm text-text-main font-mono border border-primary/10 resize-none"
              rows={6}
            />
          </div>

          <div>
            <label className="text-sm text-text-muted mb-2 block ml-1">
              Error Message (Optional)
            </label>
            <input
              type="text"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="e.g., attempt to call a nil value"
              className="w-full bg-bg-dark/90 rounded-xl px-4 py-3 text-text-main outline-none transition-all shadow-neu-purple-in border border-primary/10 focus:border-primary/35"
            />
          </div>

          <div>
            <label className="text-sm text-text-muted mb-2 block ml-1">
              Corrected Script (Working) *
            </label>
            <textarea
              value={correctedScript}
              onChange={(e) => setCorrectedScript(e.target.value)}
              placeholder="Paste your working Lua script here..."
              className="w-full bg-bg-dark/90 rounded-xl p-4 text-sm text-text-main font-mono outline-none transition-all shadow-neu-purple-in border border-primary/10 focus:border-primary/35 resize-none"
              rows={10}
            />
          </div>
        </div>

        <div className="p-6 border-t border-primary/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-bg-dark/50 text-text-muted hover:text-text-main transition-all border border-primary/10"
          >
            Cancel
          </button>
          <NeumorphicButton
            onClick={handleSubmit}
            disabled={submitting || !correctedScript.trim()}
            className="flex-1"
          >
            {submitSuccess ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                Submitted!
              </div>
            ) : submitting ? (
              'Submitting...'
            ) : (
              'Submit Feedback'
            )}
          </NeumorphicButton>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
