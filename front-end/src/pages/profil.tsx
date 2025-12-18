import { PageTitle, FavoriteList } from "@/components";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { Avatar, Flex, Text, Stack, Divider } from "@mantine/core";
import Head from "next/head";

const Profile = () => {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <Stack spacing="xl">
        <PageTitle title="Mon profil" />
        <Flex align="center" gap="md">
          <Avatar color="cyan" radius="xl" size="lg">
            {user?.firstName[0]}
            {user?.lastName[0]}
          </Avatar>
          <Flex direction="column">
            <Text>{user?.email}</Text>
            <Text>{user?.firstName}</Text>
            <Text>{user?.lastName}</Text>
          </Flex>
        </Flex>
        <Divider />
        <Stack spacing="md">
          <Text size="lg" weight={500}>
            Mes favoris
          </Text>
          <FavoriteList />
        </Stack>
      </Stack>
    </>
  );
};

export default withAuth(Profile);
