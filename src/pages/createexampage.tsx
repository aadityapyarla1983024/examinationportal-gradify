// @ts-nocheck
import {
  DialogStack,
  DialogStackBody,
  DialogStackClose,
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
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState(createBlankQuestion());

  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(undefined);
  const [date, setDate] = useState();

  const [examType, setExamType] = useState("");
  const [selected, setSelected] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState([]);

  const [attemptType, setAttemptType] = useState("");
  const [noOfAttempts, setNoOfAttempts] = useState(undefined);

  const [evaluation, setEval] = useState("");
  const [autoMarkingMarks, setAutoMarkingMarks] = useState(undefined);

  const [loading, setLoading] = useState(false);
  const [examDescription, setExamDescription] = useState("");

  const { user, localIp, protocol } = useContext(UserContext);
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [fields, setFields] = useState([]);

  const [selectedField, setSelectedField] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");

  const [level, setLevel] = useState("");
  const [marking, setMarking] = useState("");

  const [dialog, setDialog] = useState({
    open: false,
    exam_code: "",
  });

  useEffect(() => {
    setSelected([]);
  }, [examType]);

  // Calculate auto marks per question whenever autoMarkingMarks or questions change
  const marksPerQuestion =
    autoMarkingMarks && questions.length > 0
      ? (autoMarkingMarks / questions.length).toFixed(2)
      : 0;

  useEffect(() => {
    setLoading(true);
    const getTags = async () => {
      try {
        const [tagsRes, domainsRes, fieldsRes] = await Promise.all([
          axios.get(`${protocol}://${localIp}:3000/api/exam/get-tags`, {
            headers: { ["x-auth-token"]: localStorage.getItem("token") },
          }),
          axios.get(`${protocol}://${localIp}:3000/api/exam/get-domains`, {
            headers: { ["x-auth-token"]: localStorage.getItem("token") },
          }),
          axios.get(`${protocol}://${localIp}:3000/api/exam/get-fields`, {
            headers: { ["x-auth-token"]: localStorage.getItem("token") },
          }),
        ]);

        setTags(tagsRes.data);
        setFields(fieldsRes.data);
        setDomains(domainsRes.data);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error.response?.data?.error || error.message
        );
        setLoading(false);
      }
    };
    getTags();
  }, []);

  // Reset dependent states when evaluation changes
  useEffect(() => {
    if (evaluation === "no") {
      setMarking("");
      setAutoMarkingMarks(undefined);
    }
  }, [evaluation]);

  // Reset auto marking marks when marking changes from auto to manual
  useEffect(() => {
    if (marking !== "auto") {
      setAutoMarkingMarks(undefined);
    }
  }, [marking]);

  // Reset domain when field changes
  useEffect(() => {
    setSelectedDomain("");
  }, [selectedField]);

  // Auto-switch evaluation from auto to manual when text questions are present
  useEffect(() => {
    // Check if evaluation is currently set to "auto"
    if (evaluation === "auto") {
      // Check if any existing question is of type "text"
      const hasTextQuestion = questions.some(
        (question) => question.questionType === "text"
      );

      // Check if the new question being created is of type "text"
      const newQuestionIsText = newQuestion.questionType === "text";

      // If either condition is true, switch to manual evaluation
      if (hasTextQuestion || newQuestionIsText) {
        setEval("manual");
        toast.warning(
          "Evaluation switched to Manual because text questions cannot be auto-evaluated"
        );
      }
    }
  }, [questions, newQuestion.questionType, evaluation]);

  const handleSubmitExam = async (event) => {
    event.preventDefault();

    // Check if there are text questions with auto evaluation (shouldn't happen with the above logic, but as a safety net)
    if (
      evaluation === "auto" &&
      questions.some((q) => q.questionType === "text")
    ) {
      toast.error(
        "Auto evaluation cannot be used with text questions. Please switch to manual evaluation."
      );
      return;
    }

    // Validation
    const validations = [
      { condition: !examTitle, message: "Exam title is required" },
      { condition: !level, message: "Exam restriction level is required" },
      { condition: !evaluation, message: "Evaluation Method is required" },
      {
        condition: !marking && evaluation !== "no",
        message: "Marking type is required",
      },
      {
        condition:
          marking === "auto" && (!autoMarkingMarks || autoMarkingMarks <= 0),
        message: "Valid total marks are required for auto marking",
      },
      {
        condition: questions.length === 0,
        message: "Exam without questions can't be created",
      },
      {
        condition: !examType,
        message: "Exam without exam type can't be created",
      },
      {
        condition: !selectedDomain,
        message: "Exam without a domain can't be created",
      },
      {
        condition: !selectedField,
        message: "Exam without career field can't be created",
      },
      {
        condition: !attemptType,
        message: "Exam without attempt type can't be created",
      },
      {
        condition:
          attemptType === "limited-attempts" &&
          (!noOfAttempts || noOfAttempts <= 0),
        message: "Valid number of attempts is required",
      },
      {
        condition: !examDescription,
        message: "Exam without description can't be created",
      },
      {
        condition: examType === "public-exam" && selected.length === 0,
        message: "Public exam without search tags can't be created",
      },
    ];

    for (const validation of validations) {
      if (validation.condition) {
        toast.error(validation.message);
        return;
      }
    }

    const exam = {
      exam_title: examTitle,
      duration_min: duration,
      evaluation,
      level,
      marking: evaluation === "no" ? "no" : marking,
      scheduled_date: date?.toISOString(),
      domain: selectedDomain,
      exam_type: examType,
      ...(examType === "public-exam" && { tags: selected }),
      no_of_attempts: attemptType === "unlimited-attempts" ? -1 : noOfAttempts,
      exam_description: examDescription,
      questions: questions.map((question) => {
        const baseQuestion = {
          title: question.title,
          questionType: question.questionType,
          options: question.options,
          correctOptions: question.correctOptions,
        };

        if (marking === "auto") {
          return {
            ...baseQuestion,
            marks: parseFloat(marksPerQuestion),
          };
        } else if (marking === "manual") {
          return {
            ...baseQuestion,
            marks: question.marks || 0,
          };
        } else {
          return baseQuestion;
        }
      }),
    };

    try {
      const apiendpoint = `${protocol}://${localIp}:3000/api/exam/new-exam`;
      const res = await axios.post(apiendpoint, exam, {
        headers: { "x-auth-token": user.token },
      });

      toast.success(res.data.message);
      setDialog({
        open: true,
        exam_code: res.data.exam_code,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.request
          ? "No response received"
          : "Request error";
      toast.error(errorMessage);
      console.error("Exam creation error:", error);
    }
  };

  const handleAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { id: prev.options.length + 1, title: "" }],
    }));
  };

  const handleDeleteOption = (optionIdToDelete) => {
    if (newQuestion.options.length <= 2) {
      toast.error("A question must contain at least two options");
      return;
    }

    setNewQuestion((prev) => {
      const filteredOptions = prev.options.filter(
        (option) => option.id !== optionIdToDelete
      );
      const renumberedOptions = filteredOptions.map((option, index) => ({
        ...option,
        id: index + 1,
      }));

      // Remove correct options that no longer exist
      const updatedCorrectOptions = prev.correctOptions.filter((id) =>
        renumberedOptions.some((opt) => opt.id === id)
      );

      return {
        ...prev,
        options: renumberedOptions,
        correctOptions: updatedCorrectOptions,
      };
    });
  };

  const handleQuestionTypeChange = (value) => {
    setNewQuestion((prev) => {
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
        // If changing to text question and evaluation is auto, switch to manual evaluation
        if (value === "text" && evaluation === "auto") {
          setEval("manual");
          toast.warning(
            "Evaluation switched to Manual because text questions cannot be auto-evaluated"
          );
        }
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
    setNewQuestion((prev) => ({ ...prev, title: value }));
  };

  const handleOptionChange = (value, optionId) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === optionId ? { ...option, title: value } : option
      ),
    }));
  };

  const handleCorrectOptionCheckChange = (checked, optionId) => {
    setNewQuestion((prev) => {
      if (prev.questionType === "single-choice") {
        return { ...prev, correctOptions: checked ? [optionId] : [] };
      }

      let newCorrectOptions = checked
        ? [...prev.correctOptions, optionId].filter(
            (id, index, array) => array.indexOf(id) === index
          )
        : prev.correctOptions.filter((id) => id !== optionId);

      return { ...prev, correctOptions: newCorrectOptions };
    });
  };

  const handleNewQuestionSubmit = (event) => {
    event.preventDefault();

    const { title, questionType, options, correctOptions, marks } = newQuestion;
    const isChoiceQuestion =
      questionType === "single-choice" || questionType === "multi-choice";

    // Validation
    if (marking === "manual" && (!marks || isNaN(marks) || marks <= 0)) {
      toast.error("Please provide valid marks for the new question");
      return;
    }
    if (!title.trim()) {
      toast.error("Please provide a question title");
      return;
    }
    if (!questionType) {
      toast.error("Please select a question type");
      return;
    }
    if (isChoiceQuestion && options.some((opt) => !opt.title.trim())) {
      toast.error("Please fill out all option fields");
      return;
    }
    if (isChoiceQuestion && correctOptions.length === 0) {
      toast.error("Please select at least one correct option");
      return;
    }

    const newId =
      questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
    const questionToAdd = {
      ...newQuestion,
      id: newId,
      marks: marking === "manual" ? marks : undefined,
    };

    setQuestions((prev) => [...prev, questionToAdd]);
    setNewQuestion(createBlankQuestion());
  };

  const editQuestion = (questionId) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, edit: true } : question
      )
    );
  };

  const deleteQuestion = (questionId) => {
    setQuestions((prev) => {
      const filtered = prev.filter((q) => q.id !== questionId);
      return filtered.map((q, index) => ({ ...q, id: index + 1 }));
    });
  };

  const handleAddOptionUpdate = (questionId) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;

        return {
          ...question,
          options: [
            ...question.options,
            { id: question.options.length + 1, title: "" },
          ],
        };
      })
    );
  };

  const handleDeleteOptionUpdate = (optionIdToDelete, questionId) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;

        if (question.options.length <= 2) {
          toast.error("A question must contain at least two options");
          return question;
        }

        const filteredOptions = question.options.filter(
          (option) => option.id !== optionIdToDelete
        );
        const renumberedOptions = filteredOptions.map((option, index) => ({
          ...option,
          id: index + 1,
        }));

        // Remove correct options that no longer exist
        const updatedCorrectOptions = question.correctOptions.filter((id) =>
          renumberedOptions.some((opt) => opt.id === id)
        );

        return {
          ...question,
          options: renumberedOptions,
          correctOptions: updatedCorrectOptions,
        };
      })
    );
  };

  const handleQuestionTypeUpdate = (value, questionId) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;

        // If changing to text question and evaluation is auto, switch to manual evaluation
        if (value === "text" && evaluation === "auto") {
          setEval("manual");
          toast.warning(
            "Evaluation switched to Manual because text questions cannot be auto-evaluated"
          );
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
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;

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
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;

        return { ...question, title: value };
      })
    );
  };

  const handleCorrectOptionCheckUpdate = (checked, optionId, questionId) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== questionId) return question;

        if (question.questionType === "single-choice") {
          return { ...question, correctOptions: checked ? [optionId] : [] };
        }

        let newCorrectOptions = checked
          ? [...question.correctOptions, optionId].filter(
              (id, index, array) => array.indexOf(id) === index
            )
          : question.correctOptions.filter((id) => id !== optionId);

        return { ...question, correctOptions: newCorrectOptions };
      })
    );
  };

  const updateQuestion = (questionId) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, edit: false } : question
      )
    );
  };

  const handleQuestionMarkChangeUpdate = (value, questionId) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, marks: parseFloat(value) || 0 }
          : question
      )
    );
  };

  const handleQuestionMarkChange = (value) => {
    setNewQuestion((prev) => ({ ...prev, marks: parseFloat(value) || 0 }));
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
                        onValueChange={setSelectedField}
                        value={selectedField}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select a field</SelectLabel>
                            {fields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.field_name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={setSelectedDomain}
                        value={selectedDomain}
                        disabled={!selectedField}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Domain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              {selectedField
                                ? "Select a domain"
                                : "Select a field first"}
                            </SelectLabel>
                            {domains
                              .filter(
                                (domain) =>
                                  domain.field_id === parseInt(selectedField)
                              )
                              .map((domain) => (
                                <SelectItem key={domain.id} value={domain.id}>
                                  {domain.domain_name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-row flex-wrap justify-between gap-5">
                      <Select onValueChange={setExamType} value={examType}>
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
                      <Select onValueChange={setLevel} value={level}>
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
                    disabled={
                      !examTitle ||
                      !selectedField ||
                      !selectedDomain ||
                      !examType ||
                      !level
                    }
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
                    Kindly please provide additional details to handle exams
                    properly
                  </div>
                  <div className="my-10 mx-5 grid grid-cols-1 md:grid-cols-2 wrap-normal gap-5">
                    <Select onValueChange={setEval} value={evaluation}>
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
                    <Select onValueChange={setAttemptType} value={attemptType}>
                      <SelectTrigger className="w-full col-start-1">
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
                    <Input
                      className="md:col-start-2 w-[180px]"
                      type="number"
                      value={noOfAttempts || ""}
                      onChange={(e) => setNoOfAttempts(e.target.valueAsNumber)}
                      placeholder="No. of Attempts"
                      disabled={attemptType !== "limited-attempts"}
                      min="1"
                    />
                    <Select
                      onValueChange={setMarking}
                      value={marking}
                      disabled={evaluation === "no"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Marking Scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select Marking Scheme</SelectLabel>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Input
                      disabled={marking !== "auto"}
                      className="w-full"
                      placeholder="Max marks"
                      value={autoMarkingMarks || ""}
                      onChange={(e) =>
                        setAutoMarkingMarks(
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      type="number"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </DialogStackDescription>
              </DialogStackHeader>
              <DialogStackFooter className="justify-between">
                <DialogStackPrevious asChild>
                  <Button variant="secondary">Previous</Button>
                </DialogStackPrevious>
                <DialogStackNext asChild>
                  <Button
                    variant="default"
                    disabled={
                      !evaluation ||
                      !attemptType ||
                      !marking ||
                      (marking === "auto" &&
                        (!autoMarkingMarks || autoMarkingMarks <= 0)) ||
                      (attemptType === "limited-attempts" &&
                        (!noOfAttempts || noOfAttempts <= 0))
                    }
                  >
                    Next
                  </Button>
                </DialogStackNext>
              </DialogStackFooter>
            </DialogStackContent>
            <DialogStackContent>
              <DialogStackHeader>
                <DialogStackTitle>
                  Would you like to schedule or time the exam?
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
                      onChange={setDate}
                      value={date}
                    />
                    <Input
                      id="duration"
                      value={duration || ""}
                      placeholder="Duration in min"
                      onChange={(e) => setDuration(e.target.valueAsNumber)}
                      type="number"
                      name="duration"
                      className="md:col-start-2"
                      min="1"
                    />
                  </div>
                </DialogStackDescription>
              </DialogStackHeader>
              <DialogStackFooter className="justify-between">
                <DialogStackPrevious asChild>
                  <Button variant="secondary">Previous</Button>
                </DialogStackPrevious>
                <DialogStackClose asChild>
                  <Button variant="default">Start creating Exam</Button>
                </DialogStackClose>
              </DialogStackFooter>
            </DialogStackContent>
          </DialogStackBody>
        </DialogStack>

        {/* Rest of your JSX remains the same but with consistent state handling */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-5">
          <Label htmlFor="duration" className="md:col-start-1">
            Duration
          </Label>
          <Input
            id="duration"
            value={duration || ""}
            placeholder="Duration in min"
            onChange={(e) => setDuration(e.target.valueAsNumber)}
            type="number"
            name="duration"
            className="md:col-start-2"
            min="1"
          />
          <Label htmlFor="date" className="md:col-start-3 flex flex-col">
            Schedule Exam On
            <div>(Min 1 hour from now)</div>
          </Label>
          <DateTimePicker24h
            id="date"
            className="md:col-start-4"
            onChange={setDate}
            value={date}
          />

          {/* Settings Dialog */}
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
                  Make changes to your exam settings here.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-col-1 my-5 md:grid-cols-2 gap-5 place-items-center place-content-center">
                {/* Settings content - same as in DialogStack but with consistent state */}
                <Select onValueChange={setExamType} value={examType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select exam</SelectLabel>
                      <SelectItem value="private-exam">Private Exam</SelectItem>
                      <SelectItem value="public-exam">Public Exam</SelectItem>
                      <SelectItem value="personal-exam">
                        Personal Exam
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select onValueChange={setLevel} value={level}>
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

                <Select onValueChange={setSelectedField} value={selectedField}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select a field</SelectLabel>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.field_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={setSelectedDomain}
                  value={selectedDomain}
                  disabled={!selectedField}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>
                        {selectedField
                          ? "Select a domain"
                          : "Select a field first"}
                      </SelectLabel>
                      {domains
                        .filter(
                          (domain) =>
                            domain.field_id === parseInt(selectedField)
                        )
                        .map((domain) => (
                          <SelectItem key={domain.id} value={domain.id}>
                            {domain.domain_name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select onValueChange={setEval} value={evaluation}>
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

                <Select onValueChange={setAttemptType} value={attemptType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="No. of Attempts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select no of attempts</SelectLabel>
                      <SelectItem value="limited-attempts">Limited</SelectItem>
                      <SelectItem value="unlimited-attempts">
                        Unlimited
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Input
                  className="w-[180px]"
                  type="number"
                  value={noOfAttempts || ""}
                  onChange={(e) => setNoOfAttempts(e.target.valueAsNumber)}
                  placeholder="No. of Attempts"
                  disabled={attemptType !== "limited-attempts"}
                  min="1"
                />

                <Select
                  onValueChange={setMarking}
                  value={marking}
                  disabled={evaluation === "no"}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Marking Scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Marking Scheme</SelectLabel>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Max marks"
                  className="w-[180px]"
                  value={autoMarkingMarks || ""}
                  onChange={(e) =>
                    setAutoMarkingMarks(parseFloat(e.target.value) || undefined)
                  }
                  type="number"
                  disabled={marking !== "auto"}
                  min="0"
                  step="0.1"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit">Save changes</Button>
                </DialogClose>
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
          {examType === "public-exam" && (
            <>
              <Label className="md:col-start-1">Search Tags</Label>
              <SearchTag
                className={"md:col-start-2 md:col-span-3"}
                selected={selected}
                setSelected={setSelected}
                newTag={newTag}
                setNewTag={setNewTag}
                tags={tags}
                setTags={setTags}
              />
            </>
          )}
        </div>

        <ToastContainer />

        {/* Questions List */}
        {questions.map((question) => (
          <Card key={question.id} className="my-10">
            {!question.edit ? (
              // Display mode
              <>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {"Q" + question.id + ". " + question.title}
                  </CardTitle>
                  <CardAction>
                    {marking === "auto" && (
                      <h2 className="font-semibold">{marksPerQuestion} M</h2>
                    )}
                    {marking === "manual" && (
                      <h2 className="font-semibold">{question.marks} M</h2>
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
                    onClick={() => editQuestion(question.id)}
                    variant="ghost"
                  >
                    <Pencil /> Edit Question
                  </Button>
                  <Button
                    onClick={() => deleteQuestion(question.id)}
                    variant="ghost"
                  >
                    <X /> Delete
                  </Button>
                </CardFooter>
              </>
            ) : (
              // Edit mode
              <>
                <CardHeader>
                  <CardTitle className="text-xl flex gap-x-2">
                    <Textarea
                      rows={1}
                      placeholder="Question Title"
                      onChange={(e) =>
                        handleQuestionUpdate(e.target.value, question.id)
                      }
                      value={question.title}
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
                              e.target.value,
                              question.id
                            )
                          }
                          value={question.marks || ""}
                          min="0"
                          step="0.1"
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
                          placeholder={"Option " + option.id.toString()}
                        />
                        <Button
                          type="button"
                          variant="ghost"
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
                    variant="ghost"
                  >
                    Update
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        ))}

        {/* New Question Form */}
        <form onSubmit={handleNewQuestionSubmit}>
          <Card className="my-10">
            <CardHeader>
              <CardTitle className="text-xl flex gap-x-2">
                <Textarea
                  placeholder="Question Title"
                  onChange={(e) => handleQuestionChange(e.target.value)}
                  value={newQuestion.title}
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
                      value={newQuestion.marks || ""}
                      onChange={(e) => handleQuestionMarkChange(e.target.value)}
                      placeholder="Marks"
                      type="number"
                      className="w-[50%]"
                      min="0"
                      step="0.1"
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
                      variant="ghost"
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
                  variant="outline"
                  onClick={handleAddOption}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Option
                </Button>
              )}
            </CardFooter>
          </Card>

          <div className="newquestionbuttoncontainer gap-2 flex justify-end">
            <Button type="submit" variant="outline">
              <Plus /> Add Question
            </Button>
            <Button type="button" onClick={handleSubmitExam}>
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
              size="md"
            />
          </div>
        </DialogHeader>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateExamPage;
