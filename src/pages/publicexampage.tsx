import { UserContext } from "@/App";
import PublicExamCard from "@/components/publicexamcard";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar14 } from "@/components/ui/shadcn-io/navbar-14";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function PublicExamPage() {
  const { user, localIp, protocol } = useContext(UserContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(undefined);
  const [filterBy, setFilterBy] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPublicExams = async () => {
      const apiendpoint = `${protocol}://${localIp}:3000/api/exam/public-exams`;
      try {
        const res = await axios.get(apiendpoint, {
          headers: { ["x-auth-token"]: user.token },
        });
        setExams(res.data);
        setLoading(false);
        console.log(res.data);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
          console.log(error.response.data.error);
        } else {
          console.log(error);
        }
      }
    };
    fetchPublicExams();
  }, []);

  const onSearchChange = (value) => {
    setSearch(value);
  };

  const filteredExams = exams.filter((e) => {
    if (search === undefined || search === "") {
      return e;
    }
    if (
      String(e.title).toLowerCase().includes(search) &&
      (filterBy === "title" || filterBy === "")
    ) {
      return e;
    }
    if (
      String(e.domain_name).toLowerCase().includes(search) &&
      (filterBy === "domain" || filterBy === "")
    ) {
      return e;
    }
    if (
      String(e.field_name).toLowerCase().includes(search) &&
      (filterBy === "field" || filterBy === "")
    ) {
      return e;
    }
    if (
      String(e.first_name + " " + e.last_name)
        .toLowerCase()
        .includes(search) &&
      (filterBy === "creator" || filterBy === "")
    ) {
      return e;
    }
  });
  if (!loading) {
    return (
      <>
        <div className="flex w-full flex-col my-10 mx-20 gap-10">
          <Navbar14
            onSearchChange={onSearchChange}
            onAddClick={() => {
              navigate("/dashboard/create-exam");
            }}
            setFilterBy={setFilterBy}
            filterBy={filterBy}
            searchValue={search}
            className="w-[100%]"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-5 gap-10 auto-fill items-stretch ">
            {filteredExams.length != 0 &&
              filteredExams.map((exam) => {
                return (
                  <Link
                    className="block"
                    to={`/dashboard/public-exam/${exam.exam_code}`}
                  >
                    <PublicExamCard exam={exam} />
                  </Link>
                );
              })}
          </div>
          {filteredExams.length === 0 && (
            <div className="mx-auto my-auto">
              <EmptyPublicExams />
            </div>
          )}
        </div>
      </>
    );
  }
}

import { ClipboardPen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function EmptyPublicExams() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardPen />
        </EmptyMedia>
        <EmptyTitle>No Exams Created Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any exams yet. Get started by creating your
          first exam.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Link to={"/dashboard/create-exam"}>
            <Button>Create Exam</Button>
          </Link>
        </div>
      </EmptyContent>
    </Empty>
  );
}

export default PublicExamPage;
