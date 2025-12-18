import { Card, Stack, Text } from "@mantine/core";
import { IconHeartFilled } from "@tabler/icons-react";

export function EmptyState() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack align="center" spacing="md">
        <IconHeartFilled size={48} color="gray" />
        <Text size="lg" color="dimmed">
          Aucun favori pour le moment
        </Text>
        <Text size="sm" color="dimmed">
          Ajoutez des activités à vos favoris pour les voir apparaître ici
        </Text>
      </Stack>
    </Card>
  );
}

