import React from "react";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { Card } from "../ui/Card";

interface UserDetailContainerProps {
  label: string;
  value: string;
}

const UserDetailContainer: React.FC<UserDetailContainerProps> = ({ label, value }) => {
  const { text, common } = useStyles();

  return (
    <Card variant="gray" style={common.roundedMd}>
      <Card.Header>
        <Text style={text.textCenter}>{label}</Text>
      </Card.Header>

      <Card.Content>
        <Text fontVariant="bold" style={text.textCenter}>
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
};

export default UserDetailContainer;
