// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendConfirmation = async (data: any) =>
  fetch("/api/send", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendConfirmationCancel = async (data: any) =>
  fetch("/api/cancel", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
