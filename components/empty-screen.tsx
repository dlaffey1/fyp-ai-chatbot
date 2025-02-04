import { UseChatHelpers } from "ai/react";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/external-link";
import { IconArrowRight } from "@/components/ui/icons";

const exampleMessages = [
  {
    heading: "Ask about a patient case",
    message: "Outline the details of the patient case?"
  },
  {
    heading: "Summarize a medical history",
    message: "Summarize this patient's history in simple terms."
  },
  {
    heading: "Identify key concerns",
    message: "What are the key concerns based on this patient's symptoms?"
  }
];

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, "setInput">) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to the Patient History Assistant!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This AI assistant helps analyze and discuss patient history. 
          You can ask about past diagnoses, summarize records, or get insights on conditions.
        </p>
        <p className="leading-normal text-muted-foreground">
          Start by asking a question or try one of the examples below:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
