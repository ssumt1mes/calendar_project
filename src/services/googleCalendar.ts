import { CalendarEvent } from "../types";

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

export const fetchGoogleEvents = async (
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
): Promise<CalendarEvent[]> => {
  try {
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
    });

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Google Calendar events");
    }

    const data = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.summary || "(No Title)",
      description: item.description || "",
      date: item.start.date || item.start.dateTime.split("T")[0],
      time: item.start.dateTime
        ? item.start.dateTime.split("T")[1].substring(0, 5)
        : undefined,
      isAllDay: !!item.start.date, // If 'date' is present instead of 'dateTime', it's all-day
    }));
  } catch (error) {
    console.error("Error fetching Google events:", error);
    return [];
  }
};
