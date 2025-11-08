// @ts-nocheck
import {
  DialogStack,
  DialogStackBody,
  DialogStackContent,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTitle,
  DialogStackTrigger,
} from "@/components/ui/shadcn-io/dialog-stack";

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
import { NotebookPen, CircleArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import SearchTag from "@/components/searchtags";
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

  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(undefined);
  const [date, setDate] = useState<Date>();

  const [examType, setExamType] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [tags, setTags] = useState([]);

  const [attemptType, setAttemptType] = useState("");
  const [noOfAttempts, setNoOfAttempts] = useState(undefined);

  const [evaluation, setEval] = useState("");
  const [autoMarkingMarks, setautoMarkingMarks] = useState(undefined);

  const [loading, setLoading] = useState(false);
  const [examDescription, setExamDescription] = useState("");

  const { user, localIp, protocol } = useContext(UserContext);
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [fields, setFields] = useState([]);

  const [selectedField, setSelectedField] = useState(undefined);
  const [selectedDomain, setSelectedDomain] = useState(undefined);

  const [level, setLevel] = useState("");
  const [marking, setMarking] = useState("");

  const [dialog, setDialog] = useState({
    open: false,
    exam_code: "",
  });

  useEffect(() => {
    setLoading(true);
    const getTags = async () => {
      try {
        const tags = await axios.get(
          `${protocol}://${localIp}:3000/api/exam/get-tags`,
          {
            headers: {
              ["x-auth-token"]: localStorage.getItem("token"),
            },
          }
        );
        const domains = await axios.get(
          `${protocol}://${localIp}:3000/api/exam/get-domains`,
          {
            headers: {
              ["x-auth-token"]: localStorage.getItem("token"),
            },
          }
        );
        const fields = await axios.get(
          `${protocol}://${localIp}:3000/api/exam/get-fields`,
          {
            headers: {
              ["x-auth-token"]: localStorage.getItem("token"),
            },
          }
        );
        setTags(tags.data);
        setFields(fields.data);
        setDomains(domains.data);
        setLoading(false);
      } catch (error) {
        if (error.response) {
          console.log(error.response.data.error);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log(error);
        }
        setLoading(false);
      }
    };
    getTags();
  }, []);

  const handleSubmitExam = (event) => {
    event.preventDefault();
    if (examTitle === "") {
      toast.error("Exam title is required");
      return;
    }
    if (level === "") {
      toast.error("Exam restriction level is required");
      return;
    }
    if (evaluation === "") {
      toast.error("Evaluation Method is required");
      return;
    }
    if (marking === "") {
      toast.error("Marking type is required");
      return;
    }
    if (marking === "" && !autoMarkingMarks) {
      toast.error("Marking without total exam marks cannot be permitted");
      return;
    }
    if (questions.length === 0) {
      toast.error("Exam without questions can't be created");
      return;
    }
    if (examType === "") {
      toast.error("Exam without exam type can't be created");
      return;
    }
    if (selectedDomain === "") {
      toast.error("Exam without a domain can't be created");
      return;
    }
    if (selectedField === "") {
      toast.error("Exam without career field  can't be created");
      return;
    }
    if (attemptType === "") {
      toast.error("Exam without attempt type can't be created");
      return;
    }
    if (attemptType === "limited-attempts" && !noOfAttempts) {
      toast.error("Exam without no of attempts can't be created");
      return;
    }
    if (examDescription === "") {
      toast.error("Exam without description can't be created");
      return;
    }
    if (selected.length === 0 && examType === "public-exam") {
      toast.error("Public exam without search tags can't be created");
      return;
    }
    const exam = {
      exam_title: examTitle,
      duration_min: duration,
      evaluation,
      level,
      marking,
      scheduled_date: date?.toISOString(),
      domain: selectedDomain,
      exam_type: examType,
      ...(examType === "public-exam" && { tags: selected }),
      no_of_attempts: (() => {
        if (attemptType === "unlimited-attempts") {
          return -1;
        } else if (attemptType === "limited-attempts") {
          return noOfAttempts;
        }
      })(),
      exam_description: examDescription,
      questions: (() => {
        if (marking === "no") {
          return questions.map(({ edit, marks, ...rest }) => rest);
        } else if (marking === "auto") {
          const resultant = questions.map((question) => ({
            ...question,
            marks: autoMarkingMarks / questions.length,
          }));
          return resultant.map(({ edit, ...rest }) => rest);
        } else if (marking === "manual") {
          return questions.map(({ edit, ...rest }) => rest);
        }
      })(),
    };
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

  const handleNewQuestionSubmit = (event) => {
    event.preventDefault();

    const { title, questionType, options, correctOptions, marks } = newQuestion;
    const isChoiceQuestion =
      questionType === "single-choice" || questionType === "multi-choice";
    if (marking === "manual" && (marks === undefined || isNaN(marks))) {
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
  useEffect(() => console.log(selected), [selected]);

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
        if (questionId === question.id) {
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
  if (!loading) {
    return (
      <div className="form-container w-full p-10 md:p-24">
        <DialogStack defaultOpen={true}>
          <DialogStackTrigger asChild>
            <Button className="hidden" variant="outline">
              Show me
            </Button>
          </DialogStackTrigger>
          <DialogStackOverlay />
          <DialogStackBody>
            <DialogStackContent>
              <DialogStackHeader>
                <DialogStackTitle>Let's create an exam</DialogStackTitle>
                <DialogStackDescription>
                  <div>
                    Give us some basic details of the exam so that we could
                    process the attempts accordingly
                  </div>
                  <div className="my-10 mx-10 flex flex-col gap-5">
                    <Input
                      id="exam_title"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      type="text"
                      placeholder="Enter Exam Title"
                      required
                      name="exam_title"
                      className="block"
                    />
                    <div className="flex flex-row justify-between flex-wrap gap-5">
                      <Select
                        onValueChange={(value) =>
                          setSelectedField(parseInt(value))
                        }
                        value={selectedField}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select a field</SelectLabel>
                            {fields.map((field) => {
                              return (
                                <SelectItem key={field.id} value={field.id}>
                                  {field.field_name}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(value) =>
                          setSelectedDomain(parseInt(value))
                        }
                        value={selectedDomain}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Domain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {selectedField && (
                              <SelectLabel>Select a domain</SelectLabel>
                            )}
                            {!selectedField && (
                              <SelectLabel className="text-red-500 font-semibold">
                                Select a field first
                              </SelectLabel>
                            )}
                            {domains.map((domain) => {
                              if (domain.field_id === selectedField)
                                return (
                                  <SelectItem key={domain.id} value={domain.id}>
                                    {domain.domain_name}
                                  </SelectItem>
                                );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-row flex-wrap justify-between gap-5">
                      <Select
                        onValueChange={(value) => setExamType(value)}
                        value={examType}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Exam Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select exam</SelectLabel>
                            <SelectItem value="private-exam">
                              Private Exam
                            </SelectItem>
                            <SelectItem value="public-exam">
                              Public Exam
                            </SelectItem>
                            <SelectItem value="personal-exam">
                              Personal Exam
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(value) => setLevel(value)}
                        value={level}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Restriction Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select Restriction Level</SelectLabel>
                            <SelectItem value="zero">Zero</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogStackDescription>
              </DialogStackHeader>
              <DialogStackFooter className="justify-end">
                <DialogStackNext asChild>
                  <Button
                    disabled={(() => {
                      if (
                        !(
                          selectedDomain ||
                          selectedField ||
                          examTitle ||
                          examType ||
                          level
                        )
                      ) {
                        return true;
                      } else {
                        return false;
                      }
                    })()}
                    variant="default"
                  >
                    Next
                  </Button>
                </DialogStackNext>
              </DialogStackFooter>
            </DialogStackContent>
            <DialogStackContent>
              <DialogStackHeader>
                <DialogStackTitle>
                  Some more details on the technical part
                </DialogStackTitle>
                <DialogStackDescription>
                  <div>
                    Kindly please provide addtional details to handle exams
                    properly{" "}
                  </div>

                  <div className="my-10 mx-5 grid grid-cols-1 md:grid-cols-2 wrap-normal gap-5">
                    <Select
                      onValueChange={(value) => setEval(value)}
                      value={evaluation}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Evaluation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select Evaluation</SelectLabel>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="no">No Evaluation</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) => setAttemptType(value)}
                      value={attemptType}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="No. of Attempts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select no of attempts</SelectLabel>
                          <SelectItem value="limited-attempts">
                            Limited
                          </SelectItem>
                          <SelectItem value="unlimited-attempts">
                            Unlimited
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) => setMarking(value)}
                      value={marking}
                      disabled={(() => {
                        if (evaluation === "no") return true;
                        return false;
                      })()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Marking Scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select Marking Scheme</SelectLabel>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="no">No Marking</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Input
                      disabled={(() => {
                        if (marking != "auto") {
                          return true;
                        }
                        return false;
                      })()}
                      className="w-full"
                      placeholder="Max marks"
                      value={autoMarkingMarks}
                      onChange={(e) => setautoMarkingMarks(e.target.value)}
                      type="number"
                    />
                  </div>
                </DialogStackDescription>
              </DialogStackHeader>
              <DialogStackFooter className="justify-between">
                <DialogStackPrevious asChild>
                  <Button variant="secondary">Previous</Button>
                </DialogStackPrevious>
                <DialogStackNext asChild>
                  <Button variant="default">Next</Button>
                </DialogStackNext>
              </DialogStackFooter>
            </DialogStackContent>
            <DialogStackContent>
              <DialogStackHeader>
                <DialogStackTitle>
                  Would you like to schedule or time the exam ?
                </DialogStackTitle>
                <DialogStackDescription>
                  <div>
                    Provide us the desired date, time and duration of the exam
                    and we will take care of it
                  </div>
                  <div className="max-w-50 mx-auto my-10 mt-10 flex flex-col gap-5">
                    <DateTimePicker24h
                      id="date"
                      className="md:col-start-4"
                      setParentState={setDate}
                    />{" "}
                    <Input
                      id="duration"
                      value={duration}
                      placeholder="Duration in min"
                      onChange={(e) => setDuration(e.target.valueAsNumber)}
                      type="number"
                      name="duration"
                      className="md:col-start-2"
                    />
                  </div>
                </DialogStackDescription>
              </DialogStackHeader>
              <DialogStackFooter className="justify-between">
                <DialogStackPrevious asChild>
                  <Button variant="secondary">Previous</Button>
                </DialogStackPrevious>
              </DialogStackFooter>
            </DialogStackContent>
          </DialogStackBody>
        </DialogStack>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-5">
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
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="md:col-start-5 w-fit mx-auto"
                variant="outline"
              >
                <NotebookPen /> Exam Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-fit">
              <DialogHeader>
                <DialogTitle>Exam Settings</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-col-1 my-5 md:grid-cols-2 gap-5 place-items-center place-content-center">
                <div className="flex gap-3 md:col-start-1">
                  <Select
                    onValueChange={(value) => setExamType(value)}
                    value={examType}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Exam Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select exam</SelectLabel>
                        <SelectItem value="private-exam">
                          Private Exam
                        </SelectItem>
                        <SelectItem value="public-exam">Public Exam</SelectItem>
                        <SelectItem value="personal-exam">
                          Personal Exam
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 md:col-start-2">
                  <Select
                    onValueChange={(value) => setLevel(value)}
                    value={level}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Restriction Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select Restriction Level</SelectLabel>
                        <SelectItem value="zero">Zero</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 md:col-start-1">
                  <Select
                    onValueChange={(value) => setSelectedField(parseInt(value))}
                    value={selectedField}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select a field</SelectLabel>
                        {fields.map((field) => {
                          return (
                            <SelectItem key={field.id} value={field.id}>
                              {field.field_name}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 md:col-start-2">
                  <Select
                    onValueChange={(value) =>
                      setSelectedDomain(parseInt(value))
                    }
                    value={selectedDomain}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {selectedField && (
                          <SelectLabel>Select a domain</SelectLabel>
                        )}
                        {!selectedField && (
                          <SelectLabel className="text-red-500 font-semibold">
                            Select a field first
                          </SelectLabel>
                        )}
                        {domains.map((domain) => {
                          if (domain.field_id === selectedField)
                            return (
                              <SelectItem key={domain.id} value={domain.id}>
                                {domain.domain_name}
                              </SelectItem>
                            );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 md:col-start-1">
                  <Select
                    onValueChange={(value) => setEval(value)}
                    value={evaluation}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Evaluation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select Evaluation</SelectLabel>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="no">No Evaluation</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 md:col-start-1">
                  <Select
                    onValueChange={(value) => setAttemptType(value)}
                    value={attemptType}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="No. of Attempts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select no of attempts</SelectLabel>
                        <SelectItem value="limited-attempts">
                          Limited
                        </SelectItem>
                        <SelectItem value="unlimited-attempts">
                          Unlimited
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  className="md:col-start-2 w-[180px]"
                  type="number"
                  value={noOfAttempts}
                  onChange={(e) => setNoOfAttempts(e.target.valueAsNumber)}
                  placeholder="No. of Attempts"
                  disabled={(() => {
                    if (attemptType === "limited-attempts") {
                      return false;
                    }
                    return true;
                  })()}
                />
                <div className="flex gap-3 md:col-start-1">
                  <Select
                    onValueChange={(value) => setMarking(value)}
                    value={marking}
                    disabled={(() => {
                      if (evaluation === "no") {
                        return true;
                      }
                      return false;
                    })()}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Marking Scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select Marking Scheme</SelectLabel>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="no">No Marking</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Max marks"
                  className="col-start-2 w-[180px]"
                  value={autoMarkingMarks}
                  onChange={(e) => setautoMarkingMarks(e.target.value)}
                  type="number"
                  disabled={(() => {
                    if (marking != "auto") {
                      return true;
                    }
                    return false;
                  })()}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            className="md:col-start-2 md:col-span-3"
          />
          <Label className="md:col-start-1">Exam Description</Label>
          <Textarea
            value={examDescription}
            onChange={(e) => setExamDescription(e.target.value)}
            className="md:col-start-2 md:col-span-3"
            placeholder="Enter exam description..."
          />
          <Label className="md:col-start-1">Exam Description</Label>

          <SearchTag
            className={"md:col-start-2 md:col-span-3"}
            selected={selected}
            setSelected={setSelected}
            newTag={newTag}
            setNewTag={setNewTag}
            tags={tags}
            setTags={setTags}
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
                    {marking === "auto" && (
                      <h2 className="font-semibold">
                        {isNaN(autoMarkingMarks / questions.length)
                          ? ""
                          : autoMarkingMarks / questions.length}
                        M
                      </h2>
                    )}
                    {marking === "manual" && (
                      <h2 className="font-semibold">{question.marks}M</h2>
                    )}
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {question.questionType === "text" && (
                    <Textarea
                      disabled
                      placeholder="Answer in descriptive form"
                    />
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
                      {marking === "manual" && (
                        <Input
                          type="number"
                          placeholder="Marks"
                          onChange={(e) =>
                            handleQuestionMarkChangeUpdate(
                              parseInt(e.target.value),
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
                        <SelectItem value="multi-choice">
                          Multi Choice
                        </SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {marking === "manual" && (
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
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={handleAddOption}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Option
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="newquestionbuttoncontainer gap-2 flex justify-end">
            <Button type="submit" variant={"outline"}>
              <Plus />
              Add Question
            </Button>
            <Button type="button" onClick={(e) => handleSubmitExam(e)}>
              Create Exam
              {/* <CircleArrowRight /> */}
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
