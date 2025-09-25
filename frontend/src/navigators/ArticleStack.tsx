import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { stacks } from "./stacks/ArticleStack";

const Stack = createNativeStackNavigator();

const ArticleStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Articles"
      screenOptions={{
        headerShown: false,
      }}
    >
      {stacks.map((stack) => (
        <Stack.Screen
          key={stack.name}
          options={{ title: stack.title }}
          name={stack.name}
          component={stack.component}
        />
      ))}
    </Stack.Navigator>
  );
};

export default ArticleStack;
