export const getRegisterOrLoginPrompt = (isRegistering: boolean, isChangingPassword: boolean) => {
  if (isRegistering) return "יש לך חשבון?";

  if (isChangingPassword) return "נזכרתם?";

  return "אין לך עדיין חשבון?";
};

export const getRegisterOrLoginPromptLabel = (
  isRegistering: boolean,
  isChangingPassword: boolean
) => {
  if (isRegistering) return "התחבר";

  if (isChangingPassword) return "התחברו";

  return "הרשמה";
};
