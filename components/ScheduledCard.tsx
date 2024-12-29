import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";

import { ScheduledCardProps } from "@/types/scheduledcard";

export default function ScheduledCard({
  videoTitle,
  dateScheduled,
  videoDescription,
  scheduledBy,
  videoThumbnail,
}: ScheduledCardProps) {
  return (
    <Card
      isHoverable
      className="flex flex-row h-60 space-x-0 items-center align-middle my-4"
    >
      <div className="items-center justify-start h-52 w-52  ml-4">
        <Image
          alt="Example Image"
          className="h-52 w-52 block"
          src={videoThumbnail}
        />
      </div>
      <div className="text-center h-52 w-full m-0 p-4">
        <CardHeader>
          <h1 className="text-3xl">{videoTitle}</h1>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>Scheduled For: {dateScheduled}</p>
          <p>Video Description: {videoDescription}</p>
          <p>Scheduled By: {scheduledBy}</p>
        </CardBody>
      </div>
    </Card>
  );
}
