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

export function CreateSingleChoiceOptions({ options }) {
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

export function SingleChoiceOptions({ options, questionId, singleChoice, singleChoiceChange }) {
  return (
    <Choicebox
      value={singleChoice}
      onValueChange={(value) => singleChoiceChange(value, questionId)}
    >
      {options.map((option) => (
        <ChoiceboxItem id={`q${questionId}-o${option.id}`} value={option.id} key={option.id}>
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
export function SingleChoiceOptionsView({ options, questionId, checkedOptions, correctOptions }) {
  return (
    <Choicebox value={checkedOptions[0]}>
      {options.map((option) => {
        const isCorrect = correctOptions[0] === option.id;
        const isChecked = checkedOptions[0] === option.id;

        let containerClass = "";

        if (isChecked && isCorrect) {
          containerClass = "bg-green-100 border-green-500 dark:bg-green-950 dark:border-green-700";
        } else if (isChecked && !isCorrect) {
          containerClass = "bg-red-100 border-red-500 dark:bg-red-950 dark:border-red-700";
        } else if (!isChecked && isCorrect) {
          containerClass = "bg-green-100 border-green-500 bg-gray-50 dark:bg-gray-900";
        }

        const baseClasses = "flex items-start gap-3 rounded-lg border p-3 py-5";
        return (
          <ChoiceboxItem
            className={`${baseClasses} ${containerClass}`}
            key={option.id}
            value={option.id}
            id={`q${questionId}-o${option.id}`}
            disabled
          >
            <ChoiceboxItemHeader>
              <ChoiceboxItemTitle>{option.title}</ChoiceboxItemTitle>
            </ChoiceboxItemHeader>
            <ChoiceboxItemContent>
              <ChoiceboxItemIndicator />
            </ChoiceboxItemContent>
          </ChoiceboxItem>
        );
      })}
    </Choicebox>
  );
}

export function CreateMultiChoiceOptions({ options }) {
  return (
    <div className="flex flex-col gap-5">
      {options.map((option) => (
        <Label
          key={option.id}
          className="cursor-pointer hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 py-5 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
        >
          <Checkbox className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700" />
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-medium">{option.title}</p>
          </div>
        </Label>
      ))}
    </div>
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

export function MultiChoiceOptionsView({ options, questionId, checkedOptions, correctOptions }) {
  return (
    <div className="flex flex-col gap-5">
      {options.map((option) => {
        const isCorrect = correctOptions.includes(option.id);
        const isChecked = checkedOptions.includes(option.id);

        let containerClass = "";

        if (isChecked && isCorrect) {
          containerClass = "bg-green-100 border-green-500 dark:bg-green-950 dark:border-green-700";
        } else if (isChecked && !isCorrect) {
          containerClass = "bg-red-100 border-red-500 dark:bg-red-950 dark:border-red-700";
        } else if (!isChecked && isCorrect) {
          containerClass = "bg-green-100 border-green-500 bg-gray-50 dark:bg-gray-900";
        }

        const baseClasses = "flex items-start gap-3 rounded-lg border p-3 py-5";
        return (
          <div key={option.id} className={`${baseClasses} ${containerClass}`}>
            <Checkbox
              id={`q${questionId}-o${option.id}`}
              checked={isChecked}
              disabled
              className={
                "data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
              }
            />
            <div className="grid gap-1.5 font-normal">
              <p className="text-sm leading-none font-medium">{option.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
