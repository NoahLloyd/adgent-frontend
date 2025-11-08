import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ProcessingSteps } from "@/components/ProcessingSteps";
import { AdIdeasGrid } from "@/components/AdIdeasGrid";
import {
  StoryboardPanel,
  type StoryboardScene,
} from "@/components/StoryboardPanel";
import {
  CharAssetsUploader,
  type UploadedAsset,
} from "@/components/CharAssetsUploader";
import { ScenesGenerationPanel } from "@/components/ScenesGenerationPanel";
import { ScenesGallery } from "@/components/ScenesGallery";
import { TopProgressBar } from "@/components/TopProgressBar";
import { AppSidebar } from "@/components/AppSidebar";
import { SourcesInput } from "@/components/SourcesInput";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Maximize2 } from "lucide-react";
import { generateAdIdeas, extractUrl, generateStoryboard } from "@/utils/api";
import { AdIdea, ProcessingStep } from "@/types/ad";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
  typing?: boolean;
  ephemeral?: boolean;
  fade?: boolean;
}

const TYPING_MS_PER_CHAR = 18;

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [adIdeas, setAdIdeas] = useState<AdIdea[]>([]);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(
    null
  );
  const [companyUrl, setCompanyUrl] = useState<string>("");
  const [prefillMessage, setPrefillMessage] = useState<string>("");
  const [routeNextToStoryboard, setRouteNextToStoryboard] =
    useState<boolean>(false);
  const [storyboardResult, setStoryboardResult] = useState<{
    prompt: string;
    generated_text: string;
    model?: string;
  } | null>(null);
  const [storyboardScenes, setStoryboardScenes] = useState<
    StoryboardScene[] | null
  >(null);
  const [lastStoryboardText, setLastStoryboardText] = useState<string>("");
  const [charAssets, setCharAssets] = useState<UploadedAsset[]>([]);
  const [isGeneratingScenes, setIsGeneratingScenes] = useState<boolean>(false);
  const [generatedSceneUrls, setGeneratedSceneUrls] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [showSources, setShowSources] = useState<boolean>(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();
  const handleRegenerateImage = async (sceneIndex: number, prompt: string) => {
    const { regenerateScene, API_BASE_URL } = await import("@/utils/api");
    await regenerateScene(sceneIndex, prompt);
    // Bust cache for updated image
    setGeneratedSceneUrls((prev) =>
      prev.map((u, idx) =>
        idx + 1 === sceneIndex
          ? `${API_BASE_URL}/generated_scenes/scene${sceneIndex}.png?t=${Date.now()}`
          : u
      )
    );
  };

  const handleCreateVideo = () => {
    setIsVideoReady(false);
    setIsGeneratingVideo(true);
    // Simulate 10s generation
    setTimeout(() => {
      setIsGeneratingVideo(false);
      setIsVideoReady(true);
      toast.success("Video generated");
    }, 10000);
  };

  const handleEnterFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else {
      // Fallback: open controls-only fullscreen via webkit if available
      // @ts-expect-error vendor api
      if (el.webkitEnterFullscreen) {
        // @ts-expect-error vendor api
        el.webkitEnterFullscreen();
      }
    }
  };

  const updateStepStatus = (
    stepId: string,
    status: ProcessingStep["status"]
  ) => {
    setProcessingSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    );
  };

  const handleSendMessage = async (message: string) => {
    // If we flagged the next submit to create a storyboard, route to that endpoint
    if (routeNextToStoryboard) {
      try {
        // Clear any existing ad ideas view
        setAdIdeas([]);
        setSelectedIdeaIndex(null);
        setStoryboardResult(null);
        setStoryboardScenes(null);

        // Initialize storyboard steps
        const steps: ProcessingStep[] = [
          {
            id: "prepare",
            label: "Preparing storyboard prompt",
            status: "processing",
          },
          { id: "generate", label: "Generating storyboard", status: "pending" },
          { id: "finalize", label: "Finalizing", status: "pending" },
        ];
        setProcessingSteps(steps);
        setIsProcessing(true);

        setMessages((prev) => [
          ...prev,
          { role: "user", content: message },
          {
            role: "assistant",
            content: "Sure, I’ll generate a storyboard from that.",
            typing: true,
            ephemeral: true,
          },
        ]);
        // Initialize storyboard steps (all pending – first pill appears after typing)
        setProcessingSteps([
          {
            id: "prepare",
            label: "Preparing storyboard prompt",
            status: "pending",
          },
          { id: "generate", label: "Generating storyboard", status: "pending" },
          { id: "finalize", label: "Finalizing", status: "pending" },
        ]);
        setIsProcessing(true);
        // Wait for typing animation to finish before showing first pill
        const storyboardPreface = "Sure, I’ll generate a storyboard from that.";
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            storyboardPreface.length * TYPING_MS_PER_CHAR + 120
          )
        );
        // Now show first pill briefly, then proceed
        updateStepStatus("prepare", "processing");
        await new Promise((resolve) => setTimeout(resolve, 900));
        updateStepStatus("prepare", "complete");
        updateStepStatus("generate", "processing");

        // Track exact user text for regenerate (no template)
        setLastStoryboardText(message);
        const res = await generateStoryboard(message);

        updateStepStatus("generate", "complete");
        updateStepStatus("finalize", "processing");

        setStoryboardResult({
          prompt: res.prompt,
          generated_text: res.generated_text,
          model: res.model,
        });
        // Parse scenes from generated_text
        try {
          const parsed = JSON.parse(res.generated_text);
          if (Array.isArray(parsed)) {
            const normalized: StoryboardScene[] = parsed
              .filter(
                (s: any) =>
                  s &&
                  typeof s.scene_description === "string" &&
                  typeof s.voice_over_text === "string"
              )
              .map((s: any) => ({
                scene_description: s.scene_description,
                voice_over_text: s.voice_over_text,
              }));
            setStoryboardScenes(normalized);
          } else {
            setStoryboardScenes(null);
          }
        } catch {
          setStoryboardScenes(null);
        }

        // Fade out ephemeral preface + steps, then append final message
        setMessages((prev) =>
          prev.map((m) => (m.ephemeral ? { ...m, fade: true } : m))
        );
        setTimeout(() => {
          setMessages((prev) => [
            ...prev.filter((m) => !m.ephemeral),
            {
              role: "assistant",
              content:
                "Storyboard generated. Review it below or click Regenerate to refine.",
            },
          ]);
        }, 500);
        toast.success("Storyboard generated!");
        // Reset routing flag and prefill
        setRouteNextToStoryboard(false);
        setPrefillMessage("");
        updateStepStatus("finalize", "complete");
      } catch (error) {
        console.error("Error generating storyboard:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to generate storyboard"
        );
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Extract URL from message
    const url = extractUrl(message);

    if (!url) {
      toast.error("Please include a company website URL in your message");
      return;
    }

    setCompanyUrl(url);

    // Add user message
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return url.replace(/^https?:\/\//, "");
      }
    })();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
      {
        role: "assistant",
        content: `Sure, I will generate ad concepts for ${host}`,
        typing: true,
        ephemeral: true,
      },
    ]);

    // Extract additional context (everything except the URL)
    const additionalContext = message.replace(url, "").trim();
    const combinedContext = [
      additionalContext,
      sources.length > 0 ? `Additional sources: ${sources.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Initialize processing steps (all pending – first pill appears after typing)
    const steps: ProcessingStep[] = [
      { id: "scrape", label: "Scraping company website", status: "pending" },
      {
        id: "analyze",
        label: "Analyzing company information",
        status: "pending",
      },
      { id: "generate", label: "Generating ad concepts", status: "pending" },
      { id: "images", label: "Creating visual designs", status: "pending" },
    ];

    setProcessingSteps(steps);
    setIsProcessing(true);
    setAdIdeas([]);
    setSelectedIdeaIndex(null);
    setStoryboardResult(null);
    setStoryboardScenes(null);

    try {
      // Wait for the typing animation before showing first pill
      const preface = `Sure, I will generate ad concepts for ${host}`;
      await new Promise((resolve) =>
        setTimeout(resolve, preface.length * TYPING_MS_PER_CHAR + 120)
      );
      // Simulate step-by-step processing (sequential, pills appear one-by-one)
      updateStepStatus("scrape", "processing");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateStepStatus("scrape", "complete");

      updateStepStatus("analyze", "processing");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      updateStepStatus("analyze", "complete");

      updateStepStatus("generate", "processing");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      updateStepStatus("generate", "complete");

      updateStepStatus("images", "processing");

      // Make actual API call
      const ideas = await generateAdIdeas({
        company_url: url,
        additional_context: combinedContext || undefined,
      });

      updateStepStatus("images", "complete");

      setAdIdeas(ideas);
      // Fade out ephemeral preface + steps, then append final message
      setMessages((prev) =>
        prev.map((m) => (m.ephemeral ? { ...m, fade: true } : m))
      );
      setTimeout(() => {
        setMessages((prev) => [
          ...prev.filter((m) => !m.ephemeral),
          {
            role: "assistant",
            content: `I've generated 3 ad concepts for ${url}. Select one to continue.`,
          },
        ]);
      }, 500);

      toast.success("Ad ideas generated successfully!");
    } catch (error) {
      console.error("Error generating ad ideas:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate ad ideas"
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error generating ad ideas. Please try again.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectIdea = (index: number) => {
    setSelectedIdeaIndex(index);
    const idea = adIdeas[index];
    // Autofill input with "Make this:" + title and description, and route next submit to storyboard
    const combined = `Make this: ${idea.title}. ${idea.description}`;
    setPrefillMessage(combined);
    setRouteNextToStoryboard(true);
    toast.success(`Selected: ${idea.title}`);
    // Remove after 2 secs
    setTimeout(() => {
      toast.dismiss();
    }, 2000);
  };

  const handleGenerateScenes = () => {
    if (!storyboardScenes) return;
    // For now, just call the backend with storyboard only (assets are stored server-side)
    import("@/utils/api").then(({ generateScenes, API_BASE_URL }) => {
      setIsGeneratingScenes(true);
      setGeneratedSceneUrls([]);
      generateScenes(storyboardScenes)
        .then((res) => {
          // Build default URLs by scene index
          const count: number =
            (res && (res.scenes_generated as number)) ||
            storyboardScenes.length;
          const urls = Array.from(
            { length: count },
            (_, i) => `${API_BASE_URL}/generated_scenes/scene${i + 1}.png`
          );
          setGeneratedSceneUrls(urls);
          toast.success("Scenes generated");
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err);
          toast.error(
            err instanceof Error ? err.message : "Failed to generate scenes"
          );
        })
        .finally(() => {
          setIsGeneratingScenes(false);
        });
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopProgressBar
          steps={["Idea", "Storyboard", "Scenes", "Video", "Publish"]}
          activeIndex={
            isGeneratingVideo || isVideoReady
              ? 3
              : storyboardScenes
              ? 1
              : isGeneratingScenes || generatedSceneUrls.length > 0
              ? 2
              : messages.length > 0 ||
                adIdeas.length > 0 ||
                selectedIdeaIndex !== null
              ? 0
              : 0
          }
        />
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {isGeneratingVideo ? (
            <div className="w-full h-full min-h-[70vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-foreground" />
                <div className="text-sm text-muted-foreground">
                  Generating your video… this can take a moment.
                </div>
              </div>
            </div>
          ) : isVideoReady ? (
            <div className="w-full">
              <div className="w-full">
                <div className="w-full">
                  <video
                    ref={videoRef}
                    src="/demo.mp4"
                    controls
                    className="w-full h-[calc(100vh-110px)] object-contain bg-black"
                  />
                </div>
              </div>
              <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEnterFullscreen}
                >
                  <span className="mr-2 inline-flex">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                  Fullscreen
                </Button>
                <Button type="button" onClick={() => navigate("/publish")}>
                  Continue to Publish
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-6">
              {isGeneratingScenes ? (
                <ScenesGenerationPanel isGenerating={true} sceneUrls={[]} />
              ) : generatedSceneUrls.length > 0 ? (
                <ScenesGallery
                  imageUrls={generatedSceneUrls}
                  scenes={storyboardScenes || []}
                  onRegenerate={handleRegenerateImage}
                  onCreateVideo={handleCreateVideo}
                />
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                  <h2 className="text-4xl font-semibold text-foreground">
                    Generate AI-powered ads
                  </h2>
                  <p className="text-muted-foreground text-lg text-center max-w-2xl">
                    Share your company website and any context. We'll analyze
                    your brand and generate creative ad concepts with visuals.
                  </p>
                  <div className="w-full max-w-3xl">
                    <ChatInput
                      onSend={handleSendMessage}
                      disabled={isProcessing}
                      placeholder="Tell us your website and what kind of ad you want to create..."
                      leftAccessory={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSources((v) => !v)}
                          className="px-0"
                        >
                          {showSources ? "Hide sources" : "+ Sources"}
                        </Button>
                      }
                    />
                  </div>
                  {showSources && (
                    <div className="w-full max-w-3xl">
                      <SourcesInput sources={sources} onChange={setSources} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 space-y-6">
                  {messages.map((msg, idx) => (
                    <ChatMessage
                      key={idx}
                      role={msg.role}
                      content={msg.content}
                      typing={msg.typing}
                      fade={msg.fade}
                      steps={msg.ephemeral ? processingSteps : undefined}
                    />
                  ))}

                  {adIdeas.length > 0 && (
                    <AdIdeasGrid
                      ideas={adIdeas}
                      selectedIndex={selectedIdeaIndex}
                      onSelectIdea={handleSelectIdea}
                    />
                  )}

                  {storyboardScenes && !isGeneratingScenes && (
                    <StoryboardPanel
                      scenes={storyboardScenes}
                      onScenesChange={setStoryboardScenes}
                      onGenerateScenes={handleGenerateScenes}
                      model={storyboardResult?.model}
                      assetsUploader={
                        <div className="mt-2">
                          <CharAssetsUploader
                            assets={charAssets}
                            onAssetsChange={setCharAssets}
                          />
                        </div>
                      }
                    />
                  )}

                  {!isGeneratingScenes && generatedSceneUrls.length > 0 && (
                    <ScenesGenerationPanel
                      isGenerating={false}
                      sceneUrls={generatedSceneUrls}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Input Area - hidden when storyboard is present or scenes view is active */}
        {messages.length > 0 &&
          !storyboardScenes &&
          generatedSceneUrls.length === 0 &&
          !isGeneratingScenes &&
          !isGeneratingVideo &&
          !isVideoReady && (
            <div className="border-t border-border bg-background">
              <div className="max-w-5xl mx-auto px-6 py-6">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isProcessing}
                  placeholder="Paste your company website URL and any additional context..."
                  prefill={prefillMessage}
                  onVoiceClick={() =>
                    toast.message("Voice input not implemented yet")
                  }
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default Index;
