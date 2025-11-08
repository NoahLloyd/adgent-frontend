import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ProcessingSteps } from "@/components/ProcessingSteps";
import { AdIdeasGrid } from "@/components/AdIdeasGrid";
import { StoryboardPanel } from "@/components/StoryboardPanel";
import { SaveStatesMenu } from "@/components/SaveStatesMenu";
import { toast } from "sonner";
import { generateAdIdeas, extractUrl, generateStoryboard } from "@/utils/api";
import { AdIdea, ProcessingStep } from "@/types/ad";
import type { AppState } from "@/hooks/useSaveStates";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

        setMessages((prev) => [...prev, { role: "user", content: message }]);
        updateStepStatus("prepare", "complete");
        updateStepStatus("generate", "processing");

        const res = await generateStoryboard(message);

        updateStepStatus("generate", "complete");
        updateStepStatus("finalize", "processing");

        setStoryboardResult({
          prompt: res.prompt,
          generated_text: res.generated_text,
          model: res.model,
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Storyboard generated. Review it below or click Regenerate to refine.",
          },
        ]);
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
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    // Extract additional context (everything except the URL)
    const additionalContext = message.replace(url, "").trim();

    // Initialize processing steps
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

    try {
      // Simulate step-by-step processing
      updateStepStatus("scrape", "processing");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStepStatus("scrape", "complete");

      updateStepStatus("analyze", "processing");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      updateStepStatus("analyze", "complete");

      updateStepStatus("generate", "processing");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStepStatus("generate", "complete");

      updateStepStatus("images", "processing");

      // Make actual API call
      const ideas = await generateAdIdeas({
        company_url: url,
        additional_context: additionalContext || undefined,
      });

      updateStepStatus("images", "complete");

      setAdIdeas(ideas);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've generated 3 ad concepts for ${url}. Select one to continue.`,
        },
      ]);

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
  };

  const handleRegenerateStoryboard = () => {
    if (storyboardResult?.prompt) {
      setPrefillMessage(storyboardResult.prompt);
      setRouteNextToStoryboard(true);
      toast.message(
        "Loaded previous prompt. Edit and press Enter to regenerate."
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Adgent</h1>
          <SaveStatesMenu
            getCurrentState={() => ({
              messages,
              adIdeas,
              selectedIdeaIndex,
              companyUrl,
              storyboardResult,
            })}
            onLoadState={(state: AppState) => {
              setMessages(state.messages);
              setAdIdeas(state.adIdeas);
              setSelectedIdeaIndex(state.selectedIdeaIndex);
              setCompanyUrl(state.companyUrl);
              setStoryboardResult(state.storyboardResult);
              setProcessingSteps([]);
              setIsProcessing(false);
              setPrefillMessage("");
              setRouteNextToStoryboard(false);
              toast.success("State loaded");
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
              <h2 className="text-4xl font-semibold text-foreground">
                Generate AI-powered ads
              </h2>
              <p className="text-muted-foreground text-lg text-center max-w-2xl">
                Share your company website and any context. We'll analyze your
                brand and generate creative ad concepts with visuals.
              </p>
              <div className="w-full max-w-3xl">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isProcessing}
                  placeholder="Tell us your website and what kind of ad you want to create..."
                />
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-6">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))}

              {isProcessing && <ProcessingSteps steps={processingSteps} />}

              {adIdeas.length > 0 && (
                <AdIdeasGrid
                  ideas={adIdeas}
                  selectedIndex={selectedIdeaIndex}
                  onSelectIdea={handleSelectIdea}
                />
              )}

              {storyboardResult && (
                <StoryboardPanel
                  prompt={storyboardResult.prompt}
                  generatedText={storyboardResult.generated_text}
                  model={storyboardResult.model}
                  onRegenerate={handleRegenerateStoryboard}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      {messages.length > 0 && (
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
  );
};

export default Index;
