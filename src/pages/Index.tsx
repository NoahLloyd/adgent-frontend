import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ProcessingSteps } from "@/components/ProcessingSteps";
import { AdIdeasGrid } from "@/components/AdIdeasGrid";
import { toast } from "sonner";
import { generateAdIdeas, extractUrl } from "@/utils/api";
import { AdIdea, ProcessingStep } from "@/types/ad";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [adIdeas, setAdIdeas] = useState<AdIdea[]>([]);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState<number | null>(null);
  const [companyUrl, setCompanyUrl] = useState<string>("");

  const updateStepStatus = (stepId: string, status: ProcessingStep['status']) => {
    setProcessingSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const handleSendMessage = async (message: string) => {
    // Extract URL from message
    const url = extractUrl(message);
    
    if (!url) {
      toast.error("Please include a company website URL in your message");
      return;
    }

    setCompanyUrl(url);
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Extract additional context (everything except the URL)
    const additionalContext = message.replace(url, '').trim();
    
    // Initialize processing steps
    const steps: ProcessingStep[] = [
      { id: 'scrape', label: 'Scraping company website', status: 'pending' },
      { id: 'analyze', label: 'Analyzing company information', status: 'pending' },
      { id: 'generate', label: 'Generating ad concepts', status: 'pending' },
      { id: 'images', label: 'Creating visual designs', status: 'pending' },
    ];
    
    setProcessingSteps(steps);
    setIsProcessing(true);
    setAdIdeas([]);
    setSelectedIdeaIndex(null);

    try {
      // Simulate step-by-step processing
      updateStepStatus('scrape', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus('scrape', 'complete');
      
      updateStepStatus('analyze', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus('analyze', 'complete');
      
      updateStepStatus('generate', 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus('generate', 'complete');
      
      updateStepStatus('images', 'processing');
      
      // Make actual API call
      const ideas = await generateAdIdeas({
        company_url: url,
        additional_context: additionalContext || undefined,
      });
      
      updateStepStatus('images', 'complete');
      
      setAdIdeas(ideas);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've generated 3 ad concepts for ${url}. Select one to continue.` 
      }]);
      
      toast.success("Ad ideas generated successfully!");
    } catch (error) {
      console.error("Error generating ad ideas:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate ad ideas");
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error generating ad ideas. Please try again." 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectIdea = (index: number) => {
    setSelectedIdeaIndex(index);
    toast.success(`Selected: ${adIdeas[index].title}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">Adgent</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <h2 className="text-4xl font-semibold text-foreground">
                Generate AI-powered ads
              </h2>
              <p className="text-muted-foreground text-lg text-center max-w-2xl">
                Share your company website and any context. We'll analyze your brand and generate creative ad concepts with visuals.
              </p>
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
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={isProcessing}
            placeholder="Paste your company website URL and any additional context..."
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
