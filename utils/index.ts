import { getUserCustomClaims } from "@/actions/auth.actions";
import { auth } from "@/FirebaseConfig";
import { User } from "firebase/auth";

export async function getAccessControlDetails(): Promise<{
  user?: User | null;
  appRole?: string;
  orgRole?: string;
  orgId?: string;
}> {
  try {
    const user = auth?.currentUser;
    const authToken = await user?.getIdToken();

    if (!authToken) {
      throw new Error("No auth token available");
    }

    const customClaims = await getUserCustomClaims(authToken);
    const { appRole, orgRole, orgId } = customClaims;

    return { user, appRole, orgRole, orgId };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get access control details for this user");
  }
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num);
}

export const formatDateTime = (dateString: Date | string) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    // weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    year: "numeric", // numeric year (e.g., '2023')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

interface ITimeStampToDate {
  _seconds: number;
  _nanoseconds: number;
}

export const timeStampToDate = (
  timestamp: ITimeStampToDate | string | Date
): Date | null => {
  if (typeof timestamp === "string") {
    return new Date(timestamp);
  } else if (timestamp instanceof Date) {
    return timestamp;
  } else if (timestamp && typeof timestamp === "object") {
    const { _seconds, _nanoseconds } = timestamp;
    const ts = (_seconds + Math.floor(_nanoseconds / 1000_000_000)) * 1000;

    return new Date(ts);
  }
  return null;
};
