export const genDefaultUser = () => {
  return {
    userName: "",
    email: "",
    lineId: "",
    threadsId: "",
    phone: "",
    remark: "",
  };
};

// * Sellers paste "@abc", "abc", or a full profile URL — store only the bare handle "abc".
export const normalizeThreadsId = (input: string) =>
  input
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?threads\.(net|com)\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
