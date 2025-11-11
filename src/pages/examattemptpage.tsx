//@ts-nocheck
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TextareaDebounce } from "@/components/ui/textarea";
import {
  MultiChoiceOptions,
  SingleChoiceOptions,
} from "@/components/ui/shadcn-io/radio-group/newquestionoptions";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "@/App";
import { toast } from "react-toastify";

const Timer = ({ duration_min, started_at, autoSubmit, exam_attempt_id }) => {
  const [redTimer, setRedTimer] = useState(false);
  const startedAt = new Date(started_at);
  const submitAt = startedAt.getTime() + duration_min * 60 * 1000;
  const now = new Date();
  const timeLeft = submitAt - now.getTime();
  const [timer, setTimer] = useState(timeLeft / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          autoSubmit(exam_attempt_id);
          return 0;
        }
        if (prev <= 600) setRedTimer(true);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = Math.floor(timer % 60);
  return (
    <div className="fixed right-5 top-5">
      <Card className={`p-5 ${redTimer ? "border-red-500" : ""}`}>
        <CardTitle>
          Remaining Time:
          {` ${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`}
        </CardTitle>
      </Card>
    </div>
  );
};

// 🧠 Updated Hook: Reliable toasts, fullscreen reapply, fixed restrictions
const useCheatingDetection = (
  restrictionLevel,
  onCheatingDetected,
  exam_attempt_id
) => {
  const [warningCount, setWarningCount] = useState(0);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!restrictionLevel || restrictionLevel === "zero") return;

    const handleCheating = (reason) => {
      if (!mounted) return;
      console.log(`Cheating detected: ${reason}`);

      if (restrictionLevel === "high") {
        setTimeout(
          () =>
            toast.error("Malpractice detected! Submitting exam immediately."),
          100
        );
        setTimeout(() => onCheatingDetected(exam_attempt_id, "high"), 1500);
        return;
      }

      if (restrictionLevel === "low") {
        const newWarningCount = warningCount + 1;
        setWarningCount(newWarningCount);

        if (newWarningCount <= 3) {
          setTimeout(() => {
            toast.warning(
              `Warning ${newWarningCount}/3: Malpractice detected! ${
                4 - newWarningCount
              } warnings remaining.`
            );
          }, 100);
        } else {
          setTimeout(
            () => toast.error("Maximum warnings exceeded! Submitting exam."),
            100
          );
          setTimeout(() => onCheatingDetected(exam_attempt_id, "low"), 1500);
        }
      }
    };

    // Detect visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) handleCheating("Tab switched or window minimized");
    };

    // Detect fullscreen change (now re-applies for low restriction)
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      if (!fullscreenElement) {
        if (restrictionLevel === "high") {
          handleCheating("Exited fullscreen mode");
        } else if (restrictionLevel === "low") {
          setTimeout(() => {
            document.documentElement
              .requestFullscreen()
              .catch(() => console.warn("Failed to reapply fullscreen"));
          }, 500);
        }
      }
    };

    // Detect resize (DevTools)
    const handleResize = () => {
      if (
        window.outerHeight - window.innerHeight > 200 ||
        window.outerWidth - window.innerWidth > 200
      ) {
        handleCheating("Potential dev tools opened");
      }
    };

    // Disable context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      handleCheating("Right-click disabled");
    };

    // Detect key shortcuts
    const handleKeyDown = (e) => {
      const devToolsShortcuts = [
        e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key),
        e.ctrlKey && e.key === "U",
        e.key === "F12",
      ];
      if (devToolsShortcuts.some(Boolean)) {
        e.preventDefault();
        handleCheating("Dev tools shortcut detected");
      }
    };

    // Detect copy/paste
    const handleCopy = (e) => {
      e.preventDefault();
      handleCheating("Copy disabled");
    };
    const handlePaste = (e) => {
      e.preventDefault();
      handleCheating("Paste disabled");
    };

    // Detect blur
    const handleBlur = () => handleCheating("Window lost focus");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("resize", handleResize);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    window.addEventListener("blur", handleBlur);

    // Force fullscreen for high restriction
    if (restrictionLevel === "high") {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      window.removeEventListener("blur", handleBlur);
    };
  }, [restrictionLevel, warningCount, mounted]);
};

export default function ExamAttemptPage() {
  const [exam, setExam] = useState();
  const { excode } = useParams();
  const [examLoading, setExamLoading] = useState(true);
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const { protocol, localIp } = useContext(UserContext);
  const [answers, setAnswers] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("attempt") || "[]");
      return stored.map((a) => ({
        answeredOptions: [],
        textAnswer: "",
        ...a,
      }));
    } catch {
      return [];
    }
  });

  const submitExam = (exam_attempt_id = attempt?.exam_attempt_id) => {
    if (!exam_attempt_id) {
      toast.error("Exam attempt not initialized");
      return;
    }

    const reqBody = { excode, answers, exam_attempt_id };
    const apiendpoint = `/api/attempt/submit-exam`;
    axios
      .post(apiendpoint, reqBody, {
        headers: { ["x-auth-token"]: localStorage.getItem("token") },
      })
      .then((res) => {
        toast.success(res.data.message);
        localStorage.removeItem("attempt");
        navigate("/dashboard/myexams");
      })
      .catch((error) => {
        if (error.response) toast.error(error.response.data.message);
        else if (error.request) toast.error("No response received");
        else toast.error("Request error");
      });
  };

  const handleCheatingDetected = (exam_attempt_id, restrictionLevel) => {
    submitExam(exam_attempt_id);
  };

  useEffect(() => {
    const processAttempt = async () => {
      setExamLoading(true);
      const user_token = localStorage.getItem("token");
      const fetchedExam = await fetchExam(user_token);
      const fetchedAttempt = await initializeAttempt(user_token);
      setExam(fetchedExam);
      setAttempt(fetchedAttempt);
      if (fetchedExam && fetchedAttempt) setExamLoading(false);
    };
    processAttempt();
  }, []);

  useCheatingDetection(
    exam?.restriction_level,
    handleCheatingDetected,
    attempt?.exam_attempt_id
  );

  const initializeAttempt = async (user_token) => {
    try {
      const res = await axios.post(
        `/api/attempt/start-attempt`,
        { excode },
        { headers: { ["x-auth-token"]: user_token } }
      );
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error starting attempt");
      navigate("/dashboard/enter-exam");
      return null;
    }
  };

  const fetchExam = async (user_token) => {
    try {
      const res = await axios.post(
        `/api/exam/get-exam`,
        { excode },
        { headers: { ["x-auth-token"]: user_token } }
      );
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching exam");
      navigate("/dashboard/enter-exam");
    }
  };

  const onCheckChange = (isChecked, optionId, questionId) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const index = newAnswers.findIndex((a) => a.question_id === questionId);
      if (index !== -1) {
        let updated = [...newAnswers[index].answeredOptions];
        updated = isChecked
          ? [...updated, optionId]
          : updated.filter((o) => o !== optionId);
        newAnswers[index] = { ...newAnswers[index], answeredOptions: updated };
      } else if (isChecked)
        newAnswers.push({
          question_id: questionId,
          answeredOptions: [optionId],
        });
      return newAnswers;
    });
  };

  const singleChoiceChange = (optionId, question_id) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const index = newAnswers.findIndex((a) => a.question_id === question_id);
      if (index !== -1)
        newAnswers[index] = {
          ...newAnswers[index],
          answeredOptions: [optionId],
        };
      else newAnswers.push({ question_id, answeredOptions: [optionId] });
      return newAnswers;
    });
  };

  const textAnswerChange = (textAnswer, question_id) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      const index = newAnswers.findIndex((a) => a.question_id === question_id);
      if (index !== -1)
        newAnswers[index] = { ...newAnswers[index], textAnswer };
      else newAnswers.push({ question_id, textAnswer });
      return newAnswers;
    });
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      localStorage.setItem("attempt", JSON.stringify(answers));
    }, 1000);
    return () => clearTimeout(timerId);
  }, [answers]);

  if (!examLoading && exam && attempt) {
    return (
      <>
        {exam.duration_min && (
          <Timer
            duration_min={exam.duration_min}
            autoSubmit={submitExam}
            started_at={attempt.started_at}
            exam_attempt_id={attempt.exam_attempt_id}
          />
        )}
        <div className="w-full lg:w-[70%] mx-auto">
          <main className="flex-grow p-4">
            <div className="px-5 my-13">
              <Card>
                <CardHeader className="grid grid-cols-2 gap-5 w-full">
                  <CardTitle>
                    Exam Title:{" "}
                    <span className="font-medium">{exam.title}</span>
                  </CardTitle>
                  <CardTitle className="ml-auto">
                    Created By:{" "}
                    <span className="font-medium">{exam.created_by}</span>
                  </CardTitle>
                  <CardTitle>
                    Domain:{" "}
                    <span className="font-medium">{exam.domain_name}</span>
                  </CardTitle>
                  <CardTitle className="ml-auto">
                    Field:{" "}
                    <span className="font-medium">{exam.field_name}</span>
                  </CardTitle>
                  <CardTitle>
                    Total Questions:{" "}
                    <span className="font-medium">{exam.question_count}</span>
                  </CardTitle>
                  <CardTitle className="ml-auto font-semibold capitalize">
                    {exam.exam_type.replace("-", " ")}
                  </CardTitle>
                  {exam.evaluation !== "no" && (
                    <CardTitle>
                      Total Marks: <span>{exam.total_marks}</span>
                    </CardTitle>
                  )}
                  {exam.duration_min && (
                    <CardTitle className="ml-auto">
                      Duration: {exam.duration_min} min
                    </CardTitle>
                  )}
                  <CardTitle className="ml-auto">
                    Restriction Level:{" "}
                    <span className="font-medium capitalize">
                      {exam.restriction_level}
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            <div className="px-5">
              {exam.questions.map((question, i) => {
                const current = answers.find(
                  (a) => a.question_id === question.id
                );
                let answer =
                  question.question_type === "single-choice"
                    ? current?.answeredOptions?.[0]
                    : question.question_type === "multi-choice"
                    ? current?.answeredOptions || []
                    : current?.textAnswer || "";
                return (
                  <Card key={question.id} className="my-10">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        Q{i + 1}. {question.title}
                      </CardTitle>
                      <CardAction>
                        {exam.evaluation !== "no" && (
                          <h3 className="font-bold">{question.marks}M</h3>
                        )}
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      {question.question_type === "text" && (
                        <TextareaDebounce
                          debounceFunc={textAnswerChange}
                          questionId={question.id}
                          value={answer}
                          cols={4}
                          placeholder="Answer in descriptive form"
                        />
                      )}
                      {question.question_type === "multi-choice" && (
                        <MultiChoiceOptions
                          questionId={question.id}
                          checkedOptions={answer}
                          onCheckChange={onCheckChange}
                          options={question.options}
                        />
                      )}
                      {question.question_type === "single-choice" && (
                        <SingleChoiceOptions
                          questionId={question.id}
                          singleChoice={answer}
                          singleChoiceChange={singleChoiceChange}
                          options={question.options}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex flex-row w-full p-5">
              <Button
                size="lg"
                onClick={() => submitExam()}
                className="ml-auto"
              >
                Submit
              </Button>
            </div>
          </main>
        </div>
      </>
    );
  }
}
