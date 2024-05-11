/* Contains only end-user exports */

const capitalize = (name: string) => {
  return name[0].toUpperCase() + name.slice(1);
};

export const Getter = (target: Object, propertyKey: string | Symbol): void => {
  if (typeof propertyKey === 'symbol') propertyKey.toString();
  const propertyName = propertyKey as string;
  const methodName = `get${capitalize(propertyName)}`;

  // Define getter method to the target class prototype,
  // that point to their own property instance
  Object.defineProperty(target, methodName, {
    value: function () {
      return this[propertyName];
    },
  });
};

export const Setter = (target: Object, propertyKey: string | Symbol): void => {
  if (typeof propertyKey === 'symbol') propertyKey.toString();
  const propertyName = propertyKey as string;
  const methodName = `set${capitalize(propertyName)}`;

  // Define setter method to the target class prototype,
  // that set a given value to their own property instance
  Object.defineProperty(target, methodName, {
    value: function (value: unknown) {
      this[propertyName] = value;
    },
  });
};
