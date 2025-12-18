import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Text, Stack, Group, Badge, Button } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import Link from "next/link";
import { FavoriteButton } from "../FavoriteButton";
import { useGlobalStyles } from "@/utils";
import { FavoriteItem } from "./types";

interface SortableFavoriteItemProps {
  favorite: FavoriteItem;
}

export function SortableFavoriteItem({ favorite }: SortableFavoriteItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: favorite.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { classes } = useGlobalStyles();

  if (!favorite.activity) {
    return null;
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      mb="md"
    >
      <Group position="apart" align="flex-start">
        <Group spacing="xs" style={{ cursor: "grab" }} {...attributes} {...listeners}>
          <IconGripVertical size={20} color="gray" />
          <Stack spacing="xs">
            <Text weight={500} className={classes.ellipsis}>
              {favorite.activity.name}
            </Text>
            <Group spacing="xs">
              <Badge color="pink" variant="light">
                {favorite.activity.city}
              </Badge>
              <Badge color="yellow" variant="light">
                {`${favorite.activity.price}€/j`}
              </Badge>
            </Group>
            <Text size="sm" color="dimmed" className={classes.ellipsis}>
              {favorite.activity.description}
            </Text>
          </Stack>
        </Group>
        <Group spacing="xs">
          <FavoriteButton
            activityId={favorite.activity.id}
            isFavorite={favorite.activity.isFavorite}
          />
          <Link href={`/activities/${favorite.activity.id}`} className={classes.link}>
            <Button variant="outline" color="dark" size="sm">
              Voir plus
            </Button>
          </Link>
        </Group>
      </Group>
    </Card>
  );
}

