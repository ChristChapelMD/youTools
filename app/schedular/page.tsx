import { Divider } from "@nextui-org/divider";
import { Spacer } from "@nextui-org/spacer";
import { Calendar } from "@nextui-org/calendar"

import ScheduledCard from "@/components/ScheduledCard";
import ViewSwitcher from "@/components/ViewSwitcher";

export default function Home() {
  const someDummyData = [
    {
      videoTitle: "Video Title 1",
      dateScheduled: new Date().toDateString(),
      videoDescription: "Video 1 Description",
      scheduledBy: "Demi Daniel",
      videoThumbnail: "https://picsum.photos/200/300",
    },
    {
      videoTitle: "Video Title 2",
      dateScheduled: new Date().toDateString(),
      videoDescription: "Video 2 Description",
      scheduledBy: "Demi Daniel",
      videoThumbnail: "https://picsum.photos/200/300",
    },
    {
      videoTitle: "Video Title 3",
      dateScheduled: new Date().toDateString(),
      videoDescription: "Video 3 Description",
      scheduledBy: "Demi Daniel",
      videoThumbnail: "https://picsum.photos/200/300",
    },
    {
      videoTitle: "Video Title 4",
      dateScheduled: new Date().toDateString(),
      videoDescription: "Video 4 Description",
      scheduledBy: "Demi Daniel",
      videoThumbnail: "https://picsum.photos/200/300",
    },
    {
      videoTitle: "Video Title 5",
      dateScheduled: new Date().toDateString(),
      videoDescription: "Video 5 Description",
      scheduledBy: "Demi Daniel",
      videoThumbnail: "https://picsum.photos/200/300",
    },
  ];

  return (
    <>
      <ViewSwitcher />
      <Spacer y={4} />
      <h2 className="text-2xl font-semibold">{new Date().toDateString()}</h2>
      <Divider className="w-[25%]" />
      {someDummyData.map((data, index) => (
        <ScheduledCard
          key={data.videoTitle + index}
          dateScheduled={data.dateScheduled}
          scheduledBy={data.scheduledBy}
          videoDescription={data.videoDescription}
          videoThumbnail={data.videoThumbnail}
          videoTitle={data.videoTitle}
        />
      ))}
    </>
  );
} 
