import { WineEvent } from "@shared/schema";

interface EventInfoProps {
  event: WineEvent;
}

const formatEventDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    // Capitalize first letter of month
    return formatted.replace(/(\d+ )([a-z])/, (match, day, firstLetter) => day + firstLetter.toUpperCase());
  } catch {
    return dateString; // Fallback to original string if parsing fails
  }
};

export default function EventInfo({ event }: EventInfoProps) {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-300 mb-1">{formatEventDate(event.date)}</p>
      <h2 className="event-name-script text-xl font-bold text-yellow-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-sm mx-auto">
        {event.name.charAt(0).toUpperCase() + event.name.slice(1).toLowerCase()}
      </h2>
    </div>
  );
}
