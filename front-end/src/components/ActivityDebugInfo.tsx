import { Text } from "@mantine/core";

interface ActivityDebugInfoProps {
  createdAt?: string | null;
}

/**
 * Component to display debug information (creation date) for activities
 * Only visible to admin users (handled by parent component)
 */
export function ActivityDebugInfo({ createdAt }: ActivityDebugInfoProps) {
  if (!createdAt) {
    return null;
  }

  const date = new Date(createdAt);
  
  // Validate date to prevent errors with invalid date strings
  if (isNaN(date.getTime())) {
    return null;
  }

  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Text size="xs" color="dimmed" style={{ fontStyle: "italic" }}>
      Créé le: {formattedDate}
    </Text>
  );
}

