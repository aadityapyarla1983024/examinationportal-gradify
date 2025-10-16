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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function QuestionOptions({ options }) {
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

export function MultiChoiceOptions({ options, questionId, checkedOptions, onCheckChange }) {
  return (
    <div className="flex flex-col gap-5">
      {options.map((option) => (
        <Label
          key={option.id}
          className="cursor-pointer hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 py-5 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
        >
          <Checkbox
            id={`q${questionId}-o${option.id}`}
            checked={checkedOptions.includes(option.id)}
            value={option.id}
            onCheckedChange={(value) => onCheckChange(value, option.id, questionId)}
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-medium">{option.title}</p>
          </div>
        </Label>
      ))}
    </div>
  );
}
