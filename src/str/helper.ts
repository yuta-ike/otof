export const checkValidName = (name: string) => {
  if (!/[a-zA-Z-_]+/.test(name)) {
    throw new Error(`Invalid name: ${name}`);
  }
  return name;
};

export const getUniqueId = (name: string) =>
  name
    .replaceAll(/^\//g, "")
    .replaceAll(/\//g, "_")
    .replaceAll(/\{(.+)\}/g, "$1");
