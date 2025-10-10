// @ts-nocheck
import {
  Choicebox,
  ChoiceboxItem,
  ChoiceboxItemContent,
  ChoiceboxItemDescription,
  ChoiceboxItemHeader,
  ChoiceboxItemIndicator,
  ChoiceboxItemSubtitle,
  ChoiceboxItemTitle,
} from "@/components/ui/shadcn-io/choicebox";

export default function NewQuestionOptions({ options }) {
  return (
    <Choicebox defaultValue="1">
      {options.map((option) => (
        <ChoiceboxItem key={option.id} value={option.id}>
          <ChoiceboxItemHeader>
            <ChoiceboxItemTitle>{option.title}</ChoiceboxItemTitle>
          </ChoiceboxItemHeader>
          <ChoiceboxItemContent>
            <ChoiceboxItemIndicator />
          </ChoiceboxItemContent>
        </ChoiceboxItem>
      ))}
    </Choicebox>
  );
}
