import { ActivityFragment } from "@/graphql/generated/types";
import { useIsAdmin } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import { Box, Button, Flex, Image, Text } from "@mantine/core";
import Link from "next/link";
import { ActivityDebugInfo } from "./ActivityDebugInfo";
import { FavoriteButton } from "./FavoriteButton";

interface ActivityListItemProps {
  activity: ActivityFragment;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const { classes } = useGlobalStyles();
  const isAdmin = useIsAdmin();

  return (
    <Flex align="center" justify="space-between">
      <Flex gap="md" align="center">
        <Image
          src="https://dummyimage.com/125"
          radius="md"
          alt="random image of city"
          height="125"
          width="125"
        />
        <Box sx={{ maxWidth: "300px" }}>
          <Text className={classes.ellipsis}>{activity.city}</Text>
          <Text className={classes.ellipsis}>{activity.name}</Text>
          <Text className={classes.ellipsis}>{activity.description}</Text>
          <Text
            weight="bold"
            className={classes.ellipsis}
          >{`${activity.price}€/j`}</Text>
          {isAdmin && <ActivityDebugInfo createdAt={activity.createdAt} />}
        </Box>
      </Flex>
      <Flex gap="sm" align="center">
        <FavoriteButton
          activityId={activity.id}
          isFavorite={activity.isFavorite}
        />
        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="outline" color="dark">
            Voir plus
          </Button>
        </Link>
      </Flex>
    </Flex>
  );
}
