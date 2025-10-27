export const stringifyLog = (log: string, obj: any) => {
  console.log(log, JSON.stringify(obj, null, 2));
};
