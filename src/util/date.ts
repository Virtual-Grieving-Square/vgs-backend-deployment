export const dateGetDate = (date: string) => {
  try {
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error(error);
    return [{ status: false, error: error, msg: "Error Changing to Date" }];
  }
}

export const dateGetTime = (date: string) => {
  try {
    const parsedDate = new Date(date);
    const hours = String(parsedDate.getHours()).padStart(2, '0');
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
    const seconds = String(parsedDate.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error(error);
    return [{ status: false, error: error, msg: "Error Changing to Time" }];
  }
}