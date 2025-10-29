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
import { Pencil, Plus, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DateTimePicker24h } from "@/components/datetimepicker";
import axios from "axios";
import { UserContext } from "@/App";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
const createBlankQuestion = () => ({
  id: 0,
  title: "",
  questionType: "",
  options: [],
  correctOptions: [],
  edit: false,
  marks: undefined,
});

function CreateExamPage() {
  const [questions, SetQuestions] = useState([]);
  const [newQuestion, SetNewQuestion] = useState(createBlankQuestion());
  const [date, setDate] = useState<Date>();
  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(undefined);
  const { user, localIp, protocol } = useContext(UserContext);
  const [grading, setGrading] = useState("");
  const [dialog, setDialog] = useState({
    open: false,
    exam_code: "",
  });
  const [autoGradingTotalMarks, setAutoGradingTotalMarks] = useState(undefined);

  const navigate = useNavigate();
  const handleSubmitExam = (event) => {
    event.preventDefault();
    if (examTitle === "") {
      toast.error("Exam title is required");
      return;
    }
    if (grading === "") {
      toast.error("Grading Method is required");
      return;
    }
    if (questions.length === 0) {
      toast.error("Exam without questions can't be created");
      return;
    }
    const exam = {
      exam_title: examTitle,
      duration_min: duration,
      grading,
      scheduled_date: date?.toISOString(),
      questions: (() => {
        if (grading === "no-grading") {
          return questions.map(({ edit, marks, ...rest }) => rest);
        } else if (grading === "auto-grading") {
          const resultant = questions.map((question) => ({
            ...question,
            marks: autoGradingTotalMarks / questions.length,
          }));
          return resultant.map(({ edit, ...rest }) => rest);
        } else if (grading === "manual-grading") {
          return questions.map(({ edit, ...rest }) => rest);
        }
      })(),
    };
    console.log(exam);
    const apiendpoint = `${protocol}://${localIp}:3000/api/exam/new-exam`;
    axios
      .post(apiendpoint, exam, {
        headers: {
          "x-auth-token": user.token,
        },
      })
      .then((res) => {
        toast.success(res.data.message);
        setDialog({
          open: true,
          exam_code: res.data.exam_code,
        });
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response.data.error);
          toast.error(error.response.data.message);
        } else if (error.request) {
          toast.error("No response recieved");
          console.log(error.request);
        } else {
          toast.error("Request error");
          console.log(error.message);
        }
      });
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
      const filteredOptions = prev.options.filter(
        (option) => option.id !== optionIdToDelete
      );
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
        if (!newCorrectOptions.includes(optionId))
          newCorrectOptions.push(optionId);
      } else {
        newCorrectOptions = newCorrectOptions.filter((id) => id !== optionId);
      }
      return { ...prev, correctOptions: newCorrectOptions };
    });
  };

  useEffect(() => console.log(newQuestion), [newQuestion]);

  const handleNewQuestionSubmit = (event) => {
    event.preventDefault();

    const { title, questionType, options, correctOptions, marks } = newQuestion;
    const isChoiceQuestion =
      questionType === "single-choice" || questionType === "multi-choice";
    if (grading === "manual-grading" && (marks === undefined || isNaN(marks))) {
      toast.error("Please provide the marks for the new question");
      return false;
    }
    if (!title) {
      toast.error("Please provide a question title to add new question.");
      return false;
    }
    if (!questionType) {
      toast.error("Please provide a question type to add new question.");
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
      const newId =
        prevQuestions.length > 0
          ? Math.max(...prevQuestions.map((q) => q.id)) + 1
          : 1;
      const questionToAdd = { ...newQuestion, id: newId };
      return [...prevQuestions, questionToAdd];
    });

    SetNewQuestion(createBlankQuestion());
    return true;
  };

  const editQuestion = (questionId) => {
    SetQuestions((prev) => {
      const newQuestions = [...prev];
      const index = newQuestions.findIndex(
        (question) => question.id === questionId
      );
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

        const filteredOptions = question.options.filter(
          (option) => option.id !== optionIdToDelete
        );
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
          if (!newCorrectOptions.includes(optionId))
            newCorrectOptions.push(optionId);
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

  const handleQuestionMarkChangeUpdate = (value, questionId) => {
    SetQuestions((prev) => {
      return prev.map((question) => {
        if (questionId === questionId.id) {
          return {
            ...question,
            marks: value,
          };
        }
        return question;
      });
    });
  };

  const handleQuestionMarkChange = (value) => {
    SetNewQuestion((prev) => ({
      ...prev,
      marks: value,
    }));
  };

  return (
    <div className="form-container w-full p-10 md:p-24">
      <div className="grid grid-cols-1 md:grid-cols-4 items-center w-fit gap-5">
        <Label htmlFor="exam_title" className=" md:col-start-1">
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
        <Label htmlFor="date" className="md:col-start-3">
          Schedule Exam On
        </Label>
        <DateTimePicker24h
          id="date"
          className="md:col-start-4"
          setParentState={setDate}
        />

        <Label className="md:col-start-1">Grading Format</Label>
        <div className="flex gap-3 md:col-start-2">
          <Select onValueChange={(value) => setGrading(value)} value={grading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Grading" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Question Type</SelectLabel>
                <SelectItem value="manual-grading">Manual Graded</SelectItem>
                <SelectItem value="auto-grading">Auto Grading</SelectItem>
                <SelectItem value="no-grading">No Grading</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {grading === "auto-grading" && (
          <>
            <Label className="md:col-start-3">Total Marks</Label>
            <Input
              className="md:col-start-4"
              value={autoGradingTotalMarks}
              onChange={(e) => setAutoGradingTotalMarks(e.target.value)}
              type="number"
            />
          </>
        )}
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
                  {grading === "auto-grading" && (
                    <h3>
                      {isNaN(autoGradingTotalMarks / questions.length)
                        ? ""
                        : autoGradingTotalMarks / questions.length}
                    </h3>
                  )}
                  {grading === "manual-grading" && <h3>{question.marks}</h3>}
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
                  onClick={() => {
                    editQuestion(question.id);
                  }}
                  variant={"ghost"}
                >
                  <Pencil />
                  Edit Question
                </Button>
                <Button
                  type="button"
                  onClick={() => deleteQuestion(question.id)}
                  variant={"ghost"}
                >
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
                  <Textarea
                    rows={1}
                    placeholder="Question Title"
                    onChange={(e) =>
                      handleQuestionUpdate(e.target.value, question.id)
                    }
                    value={question.title}
                    type="text"
                    autoFocus
                  />
                  <div className="flex-col flex gap-2">
                    <Select
                      onValueChange={(value) =>
                        handleQuestionTypeUpdate(value, question.id)
                      }
                      value={question.questionType}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Question Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Question Type</SelectLabel>
                          <SelectItem value="single-choice">
                            Single Choice
                          </SelectItem>
                          <SelectItem value="multi-choice">
                            Multi Choice
                          </SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {grading === "manual-grading" && (
                      <Input
                        type="number"
                        placeholder="Marks"
                        onChange={(e) =>
                          handleQuestionMarkChangeUpdate(
                            e.target.value,
                            question.id
                          )
                        }
                        value={question.marks}
                      />
                    )}
                  </div>
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
                          handleCorrectOptionCheckUpdate(
                            checked,
                            option.id,
                            question.id
                          )
                        }
                        checked={question.correctOptions.includes(option.id)}
                      />
                      <Textarea
                        rows={1}
                        value={option.title}
                        onChange={(e) =>
                          handleOptionUpdate(
                            e.target.value,
                            option.id,
                            question.id
                          )
                        }
                        type="text"
                        placeholder={"Option " + option.id.toString()}
                      />
                      <Button
                        type="button"
                        variant={"ghost"}
                        onClick={() =>
                          handleDeleteOptionUpdate(option.id, question.id)
                        }
                      >
                        <X />
                      </Button>
                    </div>
                  ))}
                {question.questionType === "text" && (
                  <div className="flex gap-3">
                    <Textarea
                      disabled
                      placeholder="Answer in descriptive form"
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {(question.questionType === "single-choice" ||
                  question.questionType === "multi-choice") && (
                  <Button
                    type="button"
                    onClick={() => handleAddOptionUpdate(question.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                )}
                <Button
                  onClick={() => updateQuestion(question.id)}
                  variant={"ghost"}
                >
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
              <Textarea
                placeholder="Question Title"
                onChange={(e) => handleQuestionChange(e.target.value)}
                value={newQuestion.title}
                type="text"
                autoFocus
              />
              <div className="flex-col flex gap-4">
                <Select
                  onValueChange={handleQuestionTypeChange}
                  value={newQuestion.questionType}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Question Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Question Type</SelectLabel>
                      <SelectItem value="single-choice">
                        Single Choice
                      </SelectItem>
                      <SelectItem value="multi-choice">Multi Choice</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {grading === "manual-grading" && (
                  <Input
                    value={newQuestion.marks}
                    onChange={(e) =>
                      handleQuestionMarkChange(parseInt(e.target.value))
                    }
                    placeholder="Marks"
                    type="number"
                    className="w-[50%]"
                  />
                )}
              </div>
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
                    onChange={(e) =>
                      handleOptionChange(e.target.value, option.id)
                    }
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
      <CopyExamCodeDialog
        exam_code={dialog.exam_code}
        navigate={navigate}
        open={dialog.open}
      />
    </div>
  );
}

export function CopyExamCodeDialog({ exam_code, open, navigate }) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Exam Code</DialogTitle>
          <DialogDescription>
            Copy this code to share with other users to allow them to attempt
            this exam.
          </DialogDescription>
          <div className="flex flex-row gap-5 mx-auto my-3">
            <span className="bg-gray-300 font-extrabold text-2xl px-2 py-1 rounded-md">
              {exam_code}
            </span>
            <CopyButton
              onClick={() => {
                setTimeout(() => navigate("/dashboard"), 2000);
              }}
              content={exam_code}
              size={"md"}
            />
          </div>
        </DialogHeader>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateExamPage;
