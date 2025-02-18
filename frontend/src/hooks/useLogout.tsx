import { SESSION_TOKEN_KEY } from "@/constants/reactQuery";
import { useUserStore } from "@/store/userStore";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

const useLogout = () => {
  const queryClient = useQueryClient();
  const { setCurrentUser } = useUserStore();
  const sessionStorage = useAsyncStorage(SESSION_TOKEN_KEY);

  const handleLogout = async () => {
    setCurrentUser(null);
    await sessionStorage.removeItem();
    queryClient.clear();
  };

  return { handleLogout };
};

export default useLogout;
