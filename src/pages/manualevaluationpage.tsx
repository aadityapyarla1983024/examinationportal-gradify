import { UserContext } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function ManualEvaluationPage() {
  const { localIp, user, protocol } = useContext(UserContext);
  const { excode, exam_attempt_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [exam, setExam] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnswers = async () => {
      const apiendpoint = `${protocol}://${localIp}:3000/api/evaluate/get-answers`;
      try {
        const res = await axios.post(
          apiendpoint,
          { excode, exam_attempt_id },
          { headers: { ["x-auth-token"]: localStorage.getItem("token") } }
        );
        setAnswers(res.data.answers);
        setExam(res.data.exam);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
          console.error(error.response.data.error);
        } else {
          console.log(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnswers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const form = Object.fromEntries(formData.entries());
    const updatedAnswers = answers;

    Object.entries(form).forEach(([key, marks]) => {
      const questionId = Number(key);
      const enteredMarks = Number(marks);
      const index = updatedAnswers.findIndex(
        (ans) => ans.question_id === Number(key)
      );
      const question = exam.questions.find((q) => q.id === questionId);
      if (
        enteredMarks > question.marks ||
        enteredMarks < 0 ||
        enteredMarks === undefined ||
        enteredMarks === null
      ) {
        toast.error("Enter valid marks");
        return;
      }
      updatedAnswers[index].awarded_marks = enteredMarks;
    });
    console.log(updatedAnswers);
    try {
      const apiendpoint = `${protocol}://${localIp}:3000/api/evaluate/submit`;
      const res = await axios.post(
        apiendpoint,
        { answers: updatedAnswers, excode: exam.exam_code, exam_attempt_id },
        { headers: { ["x-auth-token"]: localStorage.getItem("token") } }
      );
      toast.success("Successfully submitted your evaluation");
      navigate(`/dashboard/examinfo/${exam.exam_code}`);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
        console.error(error.response.data.error);
      }
      console.error(error);
    }
  };

  if (!loading) {
    console.log(answers);
    const {
      domain_name,
      field_name,
      total_marks,
      question_count,
      title,
      exam_desc,
    } = exam;
    let { evaluation, no_of_attempts, scheduled_date } = exam;
    evaluation = (() => {
      if (evaluation === "no") {
        return "No grading";
      } else if (evaluation === "auto") {
        return "Auto";
      } else if (evaluation === "manual") {
        return "Manual";
      }
    })();
    no_of_attempts = (() => {
      if (no_of_attempts === -1) {
        return "Unlimited";
      } else {
        return no_of_attempts;
      }
    })();
    scheduled_date = (() => {
      if (scheduled_date === null || scheduled_date === undefined) {
        return "";
      } else {
        const date = new Date(scheduled_date);
        return `${date.toDateString()} ${date.toLocaleTimeString()}`;
      }
    })();
    const sortedQuestions = exam.questions.sort(
      (a, b) => a.question_id - b.question_id
    );
    return (
      <>
        <div className="flex flex-col gap-15 w-full p-20">
          <Card className="w-full">
            <CardContent className="w-full">
              <CardTitle className="mb-3 ">
                <div className="flex flex-row justify-between">
                  <div className="text-xl">{title}</div>
                  <div className="ml-auto my-auto text-lg">
                    {scheduled_date}
                  </div>
                </div>
              </CardTitle>
              <div className="flex w-full flex-row justify-between">
                <div className="flex flex-col gap-1">
                  <h3>
                    <b>Domain: </b> {domain_name}
                  </h3>
                  <h3>
                    <b>Max marks: </b>
                    {total_marks}
                  </h3>
                  <h3>
                    <b>Evaluation: </b>
                    {evaluation}
                  </h3>
                </div>
                <div className="flex flex-col gap-1">
                  <h3>
                    <b>Field: </b> {field_name}
                  </h3>
                  <h3>
                    <b>Questions: </b>
                    {question_count}
                  </h3>
                  <h3>
                    <b>Attempts: </b>
                    {no_of_attempts}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <form onSubmit={(e) => handleSubmit(e)}>
            {answers.map((answer) => {
              const question = exam.questions.find(
                (question) => question.id === answer.question_id
              );
              let qNum = 0;
              sortedQuestions.forEach((q, index) => {
                if (q.id === question.id) {
                  qNum = index + 1;
                }
                index++;
              });
              return (
                <Card className="">
                  <CardHeader>
                    <CardTitle>
                      {"Q"}
                      {qNum}
                      {". "}
                      {question.title}
                    </CardTitle>
                    <CardAction>
                      <span className="inline font-semibold mr-5">
                        {question.marks}
                        {"M  "}
                      </span>
                      <Input
                        name={`${question.id}`}
                        placeholder="Marks"
                        type="number"
                        className="w-[100px] inline-block"
                      />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-y-4 ml-5">
                    <div className="flex gap-3">
                      <Textarea
                        disabled
                        className="mb-3"
                        defaultValue={answer.text_answer}
                        placeholder="Answer in descriptive form"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            <div className="flex flex-row justify-end my-8">
              <Button type="submit">Submit Evaluation</Button>
            </div>
          </form>
        </div>
      </>
    );
  }
}

export default ManualEvaluationPage;
