export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "YouTools",
  description:
    "Tools to make managing your YouTube channel and content easier.",
  navItems: [
    {
      label: "Sermon Summarizer",
      href: "/summarize",
    },
    {
      label: "Stream Scheduler",
      href: "/schedular",
    },
  ],
  navMenuItems: [
    {
      label: "Sermon Summarizer",
      href: "/summarize",
    },
    {
      label: "Stream Scheduler",
      href: "/schedular",
    },
    {
      label: "Settings",
      href: "/settings",
    },
  ],
  links: {
    github: "https://github.com/OODemi52/YouTubeReccurentScheduler",
    twitter: "https://twitter.com/00Demi52",
    docs: "/",
  },
  api: {
    summarize: "/api/summarize",
  },
};

// Loon Crest CSS
/*background: linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%), radial-gradient(at top center, rgba(255,255,255,0.40) 0%, rgba(0,0,0,0.40) 120%) #989898;
 background-blend-mode: multiply,multiply; */
