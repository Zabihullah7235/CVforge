import React, { useState } from 'react';
import { Camera, Sparkles, Loader2, RefreshCw, Check, Info } from 'lucide-react';

interface AIHeadshotGeneratorProps {
  currentPhotoUrl: string;
  onPhotoSelected: (url: string) => void;
}

export const AIHeadshotGenerator: React.FC<AIHeadshotGeneratorProps> = ({
  currentPhotoUrl,
  onPhotoSelected,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a prompt describing your desired headshot or avatar style.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          size: size,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate headshot');
      }

      setGeneratedUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during image generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyPhoto = () => {
    if (generatedUrl) {
      onPhotoSelected(generatedUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const samplePrompts = [
    'Corporate executive headshot, male, smart suit, professional workspace background, warm smile',
    'Tech startup founder portrait, female, business casual outfit, modern minimalist office, bright studio lighting',
    'Creative director avatar, artistic styling, soft colorful studio background, sharp focus',
    'Minimalist technical expert illustration, sleek lines, clean corporate headshot portrait'
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-inner">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
        <h3 className="font-bold text-slate-800 text-sm">AI Profile Photo & Headshot Generator</h3>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Don't have a professional photo? Generate a realistic studio-lit business headshot or custom professional avatar using the elite Gemini Pro Image model.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Describe your professional look:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Executive headshot of a software engineer, confident expression, light grey background, crisp business attire..."
              className="w-full text-xs p-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>

          {/* Prompt Suggestions */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Quick Presets:
            </span>
            <div className="flex flex-wrap gap-1">
              {samplePrompts.map((p, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="text-[10px] bg-slate-200/60 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded border border-slate-300/40 text-left line-clamp-1 max-w-full"
                >
                  {p.slice(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {/* Affordance for specification of image size */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Resolution Quality:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSize(sz)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center justify-center ${
                    size === sz
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <span>{sz} Resolution</span>
                  <span className="text-[9px] opacity-75">
                    {sz === '1K' ? '1024 x 1024' : sz === '2K' ? '2048 x 2048' : '4096 x 4096'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Professional Portrait...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Generate High Quality Headshot</span>
              </>
            )}
          </button>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-100/50 p-4 min-h-[220px]">
          {isGenerating ? (
            <div className="text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Gemini Image Engine is cooking...</p>
              <p className="text-[10px] text-slate-400">Rendering high-resolution details in {size}</p>
            </div>
          ) : generatedUrl ? (
            <div className="w-full text-center space-y-3">
              <img
                src={generatedUrl}
                alt="AI Generated Headshot"
                className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-white shadow-md bg-slate-200"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Ready in {size}
                </span>
                <p className="text-[10px] text-slate-400">Generated using gemini-3-pro-image-preview</p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyPhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                >
                  {success ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  <span>{success ? 'Applied Successfully!' : 'Set as Resume Photo'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-1 p-3">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400">
                {currentPhotoUrl ? (
                  <img
                    src={currentPhotoUrl}
                    alt="Current Resume Photo"
                    className="w-16 h-16 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-600">No AI headshot generated yet</p>
              <p className="text-[10px] text-slate-400 max-w-[180px] mx-auto">
                Fill the prompt details on the left and select your quality to witness AI portrait creation.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-start gap-1.5 mt-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-blue-800 text-[10px] leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <div>
          <strong>Pricing notice:</strong> Image generation models are professional premium features. Under your active plan subscription, you have priority access to generating these beautiful portraits seamlessly.
        </div>
      </div>
    </div>
  );
};
