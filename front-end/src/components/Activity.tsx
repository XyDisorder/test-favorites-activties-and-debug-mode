import { ActivityFragment } from "@/graphql/generated/types";
import { useIsAdmin } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import { Badge, Button, Card, Grid, Group, Image, Text } from "@mantine/core";
import Link from "next/link";
import { ActivityDebugInfo } from "./ActivityDebugInfo";
import { FavoriteButton } from "./FavoriteButton";

interface ActivityProps {
  activity: ActivityFragment;
}

export function Activity({ activity }: ActivityProps) {
  const { classes } = useGlobalStyles();
  const isAdmin = useIsAdmin();

  return (
    <Grid.Col span={4}>
      <Card shadow="sm" padding="lg" radius="md" withBorder data-testid="activity-card">
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
          <FavoriteButton
            activityId={activity.id}
            isFavorite={activity.isFavorite}
          />
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
        </Group>

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>

        {isAdmin && <ActivityDebugInfo createdAt={activity.createdAt} />}

        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Voir plus
          </Button>
        </Link>
      </Card>
    </Grid.Col>
  );
}
