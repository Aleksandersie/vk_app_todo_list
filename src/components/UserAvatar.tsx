import { Avatar, Cell, Group, NavIdProps } from "@vkontakte/vkui";
import { UserInfo } from "@vkontakte/vk-bridge";

export interface AvatarProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const UserAvatar: React.FC<AvatarProps> = ({ fetchedUser }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  return (
    <div>
      {fetchedUser && (
        <Group>
          <Cell
            before={photo_200 && <Avatar src={photo_200} />}
            subtitle={city?.title}
          >
            {`Привет, ${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}
    </div>
  );
};
