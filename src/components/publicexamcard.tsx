import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CardSpotlight from "./ui/shadcn-studio/animatedcard";
import { Infinity } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/App";

function PublicExamCard({ exam }) {
  const { protocol, localIp } = useContext(UserContext);
  const title = exam.title;
  const content = exam.desc;
  const footer = (
    <>
      <div className="flex flex-row justify-between items-center">
        <Avatar>
          <AvatarImage
            src={`${protocol}://${localIp}:5173/images/upload/user/profile/${exam.profile}`}
            alt="@shadcn"
          />
          <AvatarFallback>PR</AvatarFallback>
        </Avatar>
        <p className="font-medium text-l ml-2">
          {exam.first_name} {exam.last_name}
        </p>
      </div>
    </>
  );
  const description = (
    <>
      {exam.field_name} {" |  "} {exam.domain_name}
      <br />
      {(() => {
        if (exam.scheduled_date) {
          const datetime = new Date(exam.scheduled_date);
          return (
            <>
              {"Scheduled  "}
              {datetime.toDateString()} {datetime.toLocaleTimeString()}
              <br />
            </>
          );
        }
      })()}
      {exam.no_of_attempts === -1 ? (
        <Infinity size={15} className="inline" />
      ) : (
        exam.no_of_attempts
      )}{" "}
      attempts
      {(() => {
        if (exam.duration_min != null) {
          return ` | ${exam.duration_min} min`;
        }
      })()}
    </>
  );
  return (
    <CardSpotlight
      className={"w-full h-full"}
      description={description}
      title={title}
      content={content}
      footer={footer}
    />
  );
}

export default PublicExamCard;
