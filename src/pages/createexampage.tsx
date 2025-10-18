// @ts-nocheck
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateMultiChoiceOptions,
  CreateSingleChoiceOptions,
} from "@/components/ui/shadcn-io/radio-group/newquestionoptions";
import { Check, Pencil, Plus, X, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { title } from "process";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateTimePicker24h } from "@/components/datetimepicker";

const createBlankQuestion = () => ({
  id: 0,
  title: "",
  questionType: "",
  options: [],
  correctOptions: [],
  edit: false,
});

export default function CreateExamPage() {
  const [questions, SetQuestions] = useState([]);
  const [newQuestion, SetNewQuestion] = useState(createBlankQuestion());
  const [date, setDate] = useState<Date>();
  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(undefined);

  const handleSubmitExam = (event) => {
    if (examTitle === "") {
      toast.error("Exam title is required");
      return;
    }
    toast.success("Your exam was submitted successfully ");
  };

  const handleAddOption = () => {
    SetNewQuestion((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: prev.options.length + 1,
          title: "",
        },
      ],
    }));
  };

  const handleDeleteOption = (optionIdToDelete) => {
    if (newQuestion.options.length <= 2) {
      toast.error("A question must contain atleast two options", {
        toastId: "delete-option-error",
      });
      return;
    }

    SetNewQuestion((prev) => {
      const filteredOptions = prev.options.filter((option) => option.id !== optionIdToDelete);
      const renumberedOptions = filteredOptions.map((option, index) => ({
        ...option,
        id: index + 1,
      }));
      return { ...prev, options: renumberedOptions };
    });
  };

  const handleQuestionTypeChange = (value) => {
    SetNewQuestion((prev) => {
      if (value === "multi-choice" || value === "single-choice") {
        return {
          ...prev,
          options: [
            { id: 1, title: "" },
            { id: 2, title: "" },
          ],
          correctOptions: [],
          questionType: value,
        };
      } else {
        return {
          ...prev,
          options: [],
          correctOptions: [],
          questionType: value,
        };
      }
    });
  };

  const handleQuestionChange = (value) => {
    SetNewQuestion((prev) => ({ ...prev, title: value }));
  };

  const handleOptionChange = (value, optionId) => {
    SetNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === optionId ? { ...option, title: value } : option
      ),
    }));
  };

  const handleCorrectOptionCheckChange = (checked, optionId) => {
    SetNewQuestion((prev) => {
      if (prev.questionType === "single-choice") {
        return { ...prev, correctOptions: checked ? [optionId] : [] };
      }

      let newCorrectOptions = [...prev.correctOptions];
      if (checked) {
        if (!newCorrectOptions.includes(optionId)) newCorrectOptions.push(optionId);
      } else {
        newCorrectOptions = newCorrectOptions.filter((id) => id !== optionId);
      }
      return { ...prev, correctOptions: newCorrectOptions };
    });
  };

  const handleNewQuestionSubmit = (event) => {
    event.preventDefault();

    const { title, questionType, options, correctOptions } = newQuestion;
    const isChoiceQuestion = questionType === "single-choice" || questionType === "multi-choice";

    if (!title || !questionType) {
      toast.error("Please provide a question title and type.");
      return false;
    }
    if (isChoiceQuestion && options.some((opt) => opt.title === "")) {
      toast.error("Please fill out all option fields.");
      return false;
    }
    if (isChoiceQuestion && correctOptions.length === 0) {
      toast.error("Please select at least one correct option.");
      return false;
    }

    SetQuestions((prevQuestions) => {
      const newId = prevQuestions.length > 0 ? Math.max(...prevQuestions.map((q) => q.id)) + 1 : 1;
      const questionToAdd = { ...newQuestion, id: newId };
      return [...prevQuestions, questionToAdd];
    });

    SetNewQuestion(createBlankQuestion());
    return true;
  };

  const editQuestion = (questionId) => {
    SetQuestions((prev) => {
      let newQuestions = [...prev];
      const index = newQuestions.findIndex((question) => question.id === questionId);
      newQuestions[index].edit = true;
      return newQuestions;
    });
  };

  const deleteQuestion = (questionId) => {
    SetQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== questionId);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
  };

  const handleAddOptionUpdate = (questionId) => {
    SetQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          options: [
            ...question.options,
            {
              id: question.options.length + 1,
              title: "",
            },
          ],
        };
      })
    );
  };

  const handleDeleteOptionUpdate = (optionIdToDelete, questionId) => {
    SetQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        if (question.options.length <= 2) {
          toast.error("A question must contain atleast two options");
          return question;
        }

        const filteredOptions = question.options.filter((option) => option.id !== optionIdToDelete);
        const renumberedOptions = filteredOptions.map((option, index) => ({
          ...option,
          id: index + 1,
        }));
        return { ...question, options: renumberedOptions };
      })
    );
  };

  const handleQuestionTypeUpdate = (value, questionId) => {
    SetQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) {
          return question;
        }
        if (value === "multi-choice" || value === "single-choice") {
          return {
            ...question,
            options: [
              { id: 1, title: "" },
              { id: 2, title: "" },
            ],
            correctOptions: [],
            questionType: value,
          };
        }
        return {
          ...question,
          options: [],
          correctOptions: [],
          questionType: value,
        };
      })
    );
  };

  const handleOptionUpdate = (value, optionId, questionId) => {
    SetQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) {
          return question;
        }
        return {
          ...question,
          options: question.options.map((option) =>
            option.id === optionId ? { ...option, title: value } : option
          ),
        };
      })
    );
  };

  const handleQuestionUpdate = (value, questionId) => {
    SetQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) {
          return question;
        }
        return {
          ...question,
          title: value,
        };
      })
    );
  };

  const handleCorrectOptionCheckUpdate = (checked, optionId, questionId) => {
    SetQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) {
          return question;
        }
        if (question.questionType === "single-choice") {
          return { ...question, correctOptions: checked ? [optionId] : [] };
        }

        let newCorrectOptions = [...question.correctOptions];
        if (checked) {
          if (!newCorrectOptions.includes(optionId)) newCorrectOptions.push(optionId);
        } else {
          newCorrectOptions = newCorrectOptions.filter((id) => id !== optionId);
        }
        return { ...question, correctOptions: newCorrectOptions };
      })
    );
  };

  const updateQuestion = (questionId) => {
    SetQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        return {
          ...question,
          edit: false,
        };
      })
    );
  };

  return (
    <div className="form-container w-full p-10 md:p-24">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center w-fit gap-5">
        <Label htmlFor="exam_title" className="md:col-start-1">
          Exam Title
        </Label>
        <Input
          id="exam_title"
          value={examTitle}
          onChange={(e) => setExamTitle(e.target.value)}
          type="text"
          placeholder="Enter Exam Title"
          required
          name="exam_title"
          className="md:col-start-2 md:col-span-2"
        />

        <Label htmlFor="duration" className="md:col-start-1">
          Duration
        </Label>
        <Input
          id="duration"
          value={duration}
          placeholder="Duration in min"
          onChange={(e) => setDuration(e.target.valueAsNumber)}
          type="number"
          name="duration"
          className="md:col-start-2"
        />

        <Label htmlFor="date" className="md:col-start-1">
          Schedule Exam On
        </Label>
        <DateTimePicker24h
          id="date"
          className="md:col-start-2 md:col-span-2"
          setParentState={setDate}
        />
      </div>
      <ToastContainer />
      {questions.map((question) => {
        if (question.edit !== true) {
          return (
            <Card key={question.id} className="my-10">
              <CardHeader>
                <CardTitle className="text-xl">
                  {"Q" + question.id + ". " + question.title}
                </CardTitle>
                <CardAction>
                  <Check color="#00c20d" strokeWidth={3} />
                </CardAction>
              </CardHeader>
              <CardContent>
                {question.questionType === "text" && (
                  <Textarea disabled placeholder="Answer in descriptive form" />
                )}

                {question.questionType === "single-choice" && (
                  <CreateSingleChoiceOptions options={question.options} />
                )}
                {question.questionType === "multi-choice" && (
                  <CreateMultiChoiceOptions options={question.options} />
                )}
              </CardContent>
              <CardFooter className="flex gap-x-2">
                <Button
                  onClick={(e) => {
                    editQuestion(question.id);
                  }}
                  variant={"ghost"}
                >
                  <Pencil />
                  Edit Question
                </Button>
                <Button type="button" onClick={() => deleteQuestion(question.id)} variant={"ghost"}>
                  <X />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          );
        } else {
          return (
            <Card className="my-10">
              <CardHeader>
                <CardTitle className="text-xl flex gap-x-2">
                  <Input
                    placeholder="Question Title"
                    onChange={(e) => handleQuestionUpdate(e.target.value, question.id)}
                    value={question.title}
                    type="text"
                    autoFocus
                  />
                  <Select
                    onValueChange={(value) => handleQuestionTypeUpdate(value, question.id)}
                    value={question.questionType}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Question Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Question Type</SelectLabel>
                        <SelectItem value="single-choice">Single Choice</SelectItem>
                        <SelectItem value="multi-choice">Multi Choice</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-y-4 ml-5">
                {(question.questionType === "multi-choice" ||
                  question.questionType === "single-choice") &&
                  question.options.map((option) => (
                    <div className="flex gap-3" key={option.id}>
                      <Checkbox
                        className="mt-2"
                        onCheckedChange={(checked) =>
                          handleCorrectOptionCheckUpdate(checked, option.id, question.id)
                        }
                        checked={question.correctOptions.includes(option.id)}
                      />
                      <Input
                        value={option.title}
                        onChange={(e) => handleOptionUpdate(e.target.value, option.id, question.id)}
                        type="text"
                        placeholder={"Option " + option.id.toString()}
                      />
                      <Button
                        type="button"
                        variant={"ghost"}
                        onClick={() => handleDeleteOptionUpdate(option.id, question.id)}
                      >
                        <X />
                      </Button>
                    </div>
                  ))}
                {question.questionType === "text" && (
                  <div className="flex gap-3">
                    <Textarea disabled placeholder="Answer in descriptive form" />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {(question.questionType === "single-choice" ||
                  question.questionType === "multi-choice") && (
                  <Button type="button" onClick={(e) => handleAddOptionUpdate(question.id)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                )}
                <Button onClick={(e) => updateQuestion(question.id)} variant={"ghost"}>
                  Update
                </Button>
              </CardFooter>
            </Card>
          );
        }
      })}
      <form onSubmit={handleNewQuestionSubmit}>
        <Card className="my-10">
          <CardHeader>
            <CardTitle className="text-xl flex gap-x-2">
              <Input
                placeholder="Question Title"
                onChange={(e) => handleQuestionChange(e.target.value)}
                value={newQuestion.title}
                type="text"
                autoFocus
              />
              <Select onValueChange={handleQuestionTypeChange} value={newQuestion.questionType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Question Type</SelectLabel>
                    <SelectItem value="single-choice">Single Choice</SelectItem>
                    <SelectItem value="multi-choice">Multi Choice</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-4 ml-5">
            {(newQuestion.questionType === "multi-choice" ||
              newQuestion.questionType === "single-choice") &&
              newQuestion.options.map((option) => (
                <div className="flex gap-3" key={option.id}>
                  <Checkbox
                    className="mt-2"
                    onCheckedChange={(checked) =>
                      handleCorrectOptionCheckChange(checked, option.id)
                    }
                    checked={newQuestion.correctOptions.includes(option.id)}
                  />
                  <Input
                    value={option.title}
                    onChange={(e) => handleOptionChange(e.target.value, option.id)}
                    type="text"
                    placeholder={"Option " + option.id.toString()}
                  />
                  <Button
                    type="button"
                    variant={"ghost"}
                    onClick={() => handleDeleteOption(option.id)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            {newQuestion.questionType === "text" && (
              <div className="flex gap-3">
                <Textarea disabled placeholder="Answer in descriptive form" />
              </div>
            )}
          </CardContent>
          <CardFooter>
            {(newQuestion.questionType === "single-choice" ||
              newQuestion.questionType === "multi-choice") && (
              <Button type="button" onClick={handleAddOption}>
                <Plus className="mr-2 h-4 w-4" /> Add Option
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="newquestionbuttoncontainer gap-2 flex justify-end">
          <Button type="submit">
            <Plus />
            Add Question
          </Button>
          <Button type="button" onClick={(e) => handleSubmitExam(e)}>
            Create Exam
          </Button>
        </div>
      </form>
    </div>
  );
}
